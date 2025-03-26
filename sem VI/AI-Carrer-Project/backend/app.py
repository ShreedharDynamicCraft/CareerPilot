import os
import io
import re
import pickle
import json
from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel
from utils import extract_text_from_pdf, extract_text_from_docx, analyze_resume_with_ai, generate_chat_response
import google.generativeai as genai
from nltk.corpus import stopwords
import uvicorn

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
client = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SAVE_DIR = "."

try:
    with open(os.path.join(SAVE_DIR, "resume_model.pkl"), "rb") as f:
        model = pickle.load(f)
    with open(os.path.join(SAVE_DIR, "vectorizer.pkl"), "rb") as f:
        vectorizer = pickle.load(f)
    with open(os.path.join(SAVE_DIR, "label_encoder.pkl"), "rb") as f:
        label_encoder = pickle.load(f)
    print("Model, vectorizer, and label encoder loaded successfully!")
except Exception as e:
    print(f"Error loading model files: {e}")
    model, vectorizer, label_encoder = None, None, None

def clean_text(text):
    text = re.sub(r'\W+', ' ', text.lower())
    text = re.sub(r'\d+', '', text)
    stop_words = set(stopwords.words('english'))
    text = ' '.join([word for word in text.split() if word not in stop_words])
    return text

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI application. Proceed to /docs to view available functions"}

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()
    file_content = await file.read()
    file_stream = io.BytesIO(file_content)
    
    if file_extension == "pdf":
        extracted_text = extract_text_from_pdf(file_stream)
    elif file_extension == "docx":
        extracted_text = extract_text_from_docx(file_stream)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF or DOCX.")

    analysis_result = analyze_resume_with_ai(extracted_text)
    return {"filename": file.filename, "analysis": analysis_result}

@app.post("/predict_job_role/")
async def predict_job_role(file: UploadFile = File(...)):
    if not all([model, vectorizer, label_encoder]):
        raise HTTPException(status_code=500, detail="Model files not loaded properly.")

    file_extension = file.filename.split(".")[-1].lower()
    file_content = await file.read()
    file_stream = io.BytesIO(file_content)
    
    if file_extension == "pdf":
        extracted_text = extract_text_from_pdf(file_stream)
    elif file_extension == "docx":
        extracted_text = extract_text_from_docx(file_stream)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF or DOCX.")

    # Model prediction
    cleaned_text = clean_text(extracted_text)
    X = vectorizer.transform([cleaned_text])
    prediction_encoded = model.predict(X)[0]
    confidence = model.predict_proba(X)[0].max() * 100
    predicted_role = label_encoder.inverse_transform([prediction_encoded])[0]

    # Gemini prediction
    gemini_prompt = f"""
    You are an AI career advisor specializing in job role prediction. Based on the resume text below, predict the most suitable job role and provide a confidence score. Analyze skills, experience, and education to ensure accuracy. Return the result in this exact JSON format:
    {{
      "job_role": "<predicted job role>",
      "confidence": "<confidence score as a percentage (e.g., 85.50%)>"
    }}

    Resume Text:
    {extracted_text}
    """

    try:
        gemini_response = generate_chat_response(gemini_prompt)
        gemini_data = json.loads(gemini_response)
        if not all(key in gemini_data for key in ["job_role", "confidence"]):
            raise ValueError("Incomplete Gemini response")
    except (json.JSONDecodeError, ValueError) as e:
        print(f"Gemini error: {e}")
        gemini_data = {"job_role": "Unable to predict", "confidence": "0.00%"}

    return {
        "trained_model": {
            "job_role": predicted_role,
            "confidence": f"{confidence:.2f}%"
        },
        "gemini_prediction": gemini_data
    }

class ChatRequest(BaseModel):
    message: str

@app.post("/httpchat")
async def chat(request: ChatRequest):
    try:
        bot_reply = generate_chat_response(request.message)
        return {"response": bot_reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            message = await websocket.receive_text()
            if message.startswith("resume:"):
                await websocket.send_text("Please upload your resume.")
            else:
                bot_reply = generate_chat_response(message)
                await websocket.send_text(bot_reply)
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)