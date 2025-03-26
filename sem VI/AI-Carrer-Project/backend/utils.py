import io
import json
import pdfplumber
import docx
import google.generativeai as genai
from os import getenv

# Configure Google API key
genai.configure(api_key=getenv("GOOGLE_API_KEY"))
client = genai.GenerativeModel("gemini-1.5-flash")

def extract_text_from_pdf(file):
    """Extract text from PDF using pdfplumber"""
    text = ""
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text

def extract_text_from_docx(file):
    """Extract text from DOCX using python-docx"""
    text = ""
    doc = docx.Document(file)
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def analyze_resume_with_ai(text):
    """Send the extracted text to Google Gemini for analysis"""
    sys_instruct = """
        You are an AI resume reviewer that evaluates resumes based on clarity, relevance, and effectiveness for job applications.  
        Analyze the following resume and provide structured feedback in **valid JSON format** with these fields:

        1. **score**: A rating from 0 to 100 based on the overall resume quality.
        2. **content_score**: A rating from 0 to 100 for resume content quality.
        3. **format_score**: A rating from 0 to 100 for formatting consistency.
        4. **sections_score**: A rating from 0 to 100 for completeness of necessary sections.
        5. **skills_score**: A rating from 0 to 100 for how well skills are presented.
        6. **ats_parse_rate**: A percentage (0-100) indicating how well the resume can be parsed by an ATS.
        7. **analysis**: A list of **exactly five** structured feedback items, each with:
            - **category**: One of "Content Suggestions", "Spelling & Grammar", "Resume Length", "Personal Details", "Formatting Tips".
            - **feedback**: A short statement on what the resume does well.
            - **suggestions**: Actionable advice on how to improve.

        Important Rules:
        - Always include all five categories, even if no issues are found.
        - Do not analyze any extra categories.
        - Ensure the response is valid JSON with correct syntax.
    """
    response = client.generate_content(sys_instruct + "\n\n" + text)
    raw_text = response.text
    json_text = raw_text.strip("```json\n").strip("```")
    try:
        resume_analysis = json.loads(json_text)
    except json.JSONDecodeError:
        print("Error: Failed to parse JSON")
        return None
    return resume_analysis

def generate_chat_response(message):
    """Generate chatbot response using Google Gemini"""
    sys_instruct = """
        Role & Purpose:
        You are an AI career advisor that helps users with job searching, resume reviews, and career guidance. Your goal is to provide friendly, supportive, and human-like responses that adapt to the user's needs and emotions.

        Tone & Style:
        Use a natural, conversational tone—like a friendly career coach.
        Show empathy when users feel lost, frustrated, or overwhelmed.
        Keep responses engaging and dynamic, rather than robotic or overly structured.

        Response Strategy:
        - Acknowledge emotions before giving advice if the user sounds frustrated or confused.
        - Adjust detail level: Start simple for broad questions, ask clarifying questions.
        - Provide actionable, encouraging advice in short, digestible steps.
        - Keep the conversation flowing with follow-up questions.

        Examples:
        User: "I don’t know what to do anymore. I keep applying, but no one responds."
        Bot: "That sounds really frustrating. Job searching can be tough, but don’t lose hope! Are you getting interview calls at all, or just silence?"
        
        User: "How can I improve my resume?"
        Bot: "Great question! First, tailor it to each job: 1. Use keywords from the job description. 2. Highlight measurable achievements (e.g., 'Increased sales by 30%'). 3. Keep it clear and scannable. Want me to check it for you?"

        General Guidelines:
        - Stay friendly and encouraging.
        - Avoid excessive structure unless requested.
        - Redirect unrelated topics back to career guidance.
    """
    response = client.generate_content(sys_instruct + "\n\n" + message)
    return response.text