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
from typing import Dict






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

    try:
        analysis_result = analyze_resume_with_ai(extracted_text)
    except Exception as e:
        print(f"Error in analyze_resume_with_ai: {e}")
        analysis_result = {}

    try:
        project_analysis = analyze_projects(extracted_text)
    except Exception as e:
        print(f"Error in analyze_projects: {e}")
        project_analysis = {}

    return {
        "filename": file.filename,
        "analysis": analysis_result or {},
        "project_analysis": project_analysis or {}
    }


@app.post("/predict_job_role/")
async def predict_job_role(file: UploadFile = File(...)):
    # Model availability check with better error message
    if not all([model, vectorizer, label_encoder]):
        raise HTTPException(
            status_code=503,  # More appropriate status for unavailable service
            detail="Prediction service not available. Please try again later."
        )

    try:
        # File validation with size check
        if file.size > 5 * 1024 * 1024:  # 5MB limit
            raise HTTPException(status_code=400, detail="File too large (max 5MB)")

        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in ["pdf", "docx"]:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF or DOCX.")

        file_content = await file.read()
        file_stream = io.BytesIO(file_content)
        
        extracted_text = (
            extract_text_from_pdf(file_stream) 
            if file_extension == "pdf" 
            else extract_text_from_docx(file_stream)
        )

        # ML Prediction with error handling
        try:
            cleaned_text = clean_text(extracted_text)
            X = vectorizer.transform([cleaned_text])
            prediction_encoded = model.predict(X)[0]
            confidence = model.predict_proba(X)[0].max() * 100
            predicted_role = label_encoder.inverse_transform([prediction_encoded])[0]
        except Exception as e:
            print(f"ML prediction error: {e}")
            predicted_role = "Prediction Error"
            confidence = 0.0

        # Gemini Prediction with improved prompt and error handling
        gemini_prompt = f"""
        Analyze this resume for job suitability. Return JSON with:
        - job_role: Precise industry-standard title
        - confidence: Percentage (e.g., "85.50%")
        - missing_skills: Skills to add
        - recommended_skills: Role-specific skills
        
        Resume (first 10,000 chars):
        {extracted_text[:10000]}
        
        Example Response:
        {{
            "job_role": "Data Scientist",
            "confidence": "78.50%",
            "missing_skills": ["Apache Spark", "Tableau"],
            "recommended_skills": ["TensorFlow", "BigQuery"]
        }}
        """

        gemini_data = {
            "job_role": "Unable to predict",
            "confidence": "0.00%",
            "missing_skills": [],
            "recommended_skills": []
        }

        try:
            gemini_response = generate_chat_response(gemini_prompt)
            # Handle markdown code blocks in response
            clean_response = gemini_response.strip().strip("```json").strip("```")
            if clean_response:
                parsed_data = json.loads(clean_response)
                if all(key in parsed_data for key in ["job_role", "confidence"]):
                    gemini_data.update(parsed_data)
        except Exception as e:
            print(f"Gemini processing error: {e}")

        return {
            "trained_model": {
                "job_role": predicted_role,
                "confidence": f"{confidence:.2f}%",
                "model_type": "ML Model"
            },
            "gemini_prediction": {
                **gemini_data,
                "model_type": "Gemini AI"
            }
        }

    except HTTPException:
        raise  # Re-raise existing HTTP exceptions
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during processing"
        )


@app.post("/analyze_skills/")
async def fetch_skills_analysis(file: UploadFile = File(...)):
    file_extension = file.filename.split(".")[-1].lower()
    file_content = await file.read()
    file_stream = io.BytesIO(file_content)
    
    if file_extension == "pdf":
        extracted_text = extract_text_from_pdf(file_stream)
    elif file_extension == "docx":
        extracted_text = extract_text_from_docx(file_stream)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file format. Use PDF or DOCX.")

    prompt = f"""
    Analyze the following resume text and extract skills information. Return a JSON response with:
    - "top_skills": List of top 5 skills mentioned (with frequency, e.g., [{{"name": "Python", "frequency": 3}}, ...])
    - "skill_categories": Categorize skills into groups (Technical, Soft, Tools, etc.)
    - "recommended_skills": List of skills to add based on industry trends
    - "missing_industry_skills": List of commonly expected skills not found
    
    Resume Text:
    {extracted_text}
    
    Return only valid JSON. If no skills are found or an error occurs, provide defaults like:
    {{
        "top_skills": [{{"name": "None Identified", "frequency": 0}}],
        "skill_categories": {{"General": ["None"]}},
        "recommended_skills": ["Add relevant skills"],
        "missing_industry_skills": ["Unable to determine"]
    }}
    """
    
    try:
        response = client.generate_content(prompt)
        raw_text = response.text.strip("```json\n").strip("```")
        if not raw_text or raw_text.isspace():
            raise ValueError("Empty response from Gemini")
        data = json.loads(raw_text)
        data.setdefault("top_skills", [{"name": "None Identified", "frequency": 0}])
        data.setdefault("skill_categories", {"General": ["None"]})
        data.setdefault("recommended_skills", ["Add relevant skills"])
        data.setdefault("missing_industry_skills", ["Unable to determine"])
        return data
    except Exception as e:
        print(f"Gemini error in fetch_skills_analysis: {e}")
        return {
            "top_skills": [{"name": "None Identified", "frequency": 0}],
            "skill_categories": {"General": ["None"]},
            "recommended_skills": ["Add relevant skills"],
            "missing_industry_skills": ["Unable to determine"]
        }

def analyze_projects(resume_text: str) -> Dict:
    """Analyze projects from resume text"""
    prompt = f"""
    Analyze projects from this resume and provide structured feedback. Return JSON with:
    - "projects_found": Number of projects identified (integer)
    - "project_quality_score": Score (0-100) based on project descriptions (integer)
    - "project_impact": List of strings showing quantified impact of each project (e.g., ["Increased efficiency by 20%", "Reduced costs by $5000"])
    - "improvement_suggestions": List of strings with suggestions to better present projects
    - "missing_elements": List of strings with what's lacking in project descriptions
    
    Resume Text:
    {resume_text}
    
    Return only valid JSON. If no projects are found, provide defaults:
    {{
        "projects_found": 0,
        "project_quality_score": 0,
        "project_impact": [],
        "improvement_suggestions": ["Add project details to strengthen resume"],
        "missing_elements": ["No projects detected"]
    }}
    """
    
    try:
        response = client.generate_content(prompt)
        raw_text = response.text.strip("```json\n").strip("```")
        if not raw_text or raw_text.isspace():
            raise ValueError("Empty response from Gemini")
        data = json.loads(raw_text)
        data.setdefault("projects_found", 0)
        data.setdefault("project_quality_score", 0)
        data.setdefault("project_impact", [])
        data.setdefault("improvement_suggestions", ["Add project details to strengthen resume"])
        data.setdefault("missing_elements", ["No projects detected"])
        return data
    except Exception as e:
        print(f"Error analyzing projects: {e}")
        return {
            "projects_found": 0,
            "project_quality_score": 0,
            "project_impact": [],
            "improvement_suggestions": ["Add project details to strengthen resume"],
            "missing_elements": ["No projects detected"]
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