

# CareerPilot

[![CareerPilot Demo](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/main/Docs%20and%20media/images/Job_Portal.png)](https://www.loom.com/share/541a720881314c46b7b0e4486944549e?sid=4edbc13e-3424-40cb-8bf6-973582716a6d)

## 🌐 Live Demo Links

### Frontend Application
**Frontend Hosted Link:** https://career-pilot-gohj.vercel.app

### Backend API
**Backend Hosted Link:** https://careerpilot-jm7u.onrender.com

## 📹 Video Demonstrations

### Main Project Demo
[Watch the full demonstration](https://www.loom.com/share/541a720881314c46b7b0e4486944549e?sid=4edbc13e-3424-40cb-8bf6-973582716a6d)

### Working Explanation Video
[Watch the working explanation](https://www.loom.com/share/8b15e49355cf476e9960ceb2bdb846c1)

## 🚀 Project Overview
CareerPilot is an AI-powered career guidance platform designed to help job seekers navigate their professional journey with personalized tools and insights. The platform combines modern frontend technologies with advanced backend AI services to provide a comprehensive career development experience.

## ✨ Key Features

### 📄 Resume Builder & Analysis
![Resume Analysis](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/Resume_Analyis.png)
- Create professional resumes with customizable templates
- AI-powered resume analysis providing feedback on structure and content
- Skills gap identification and improvement recommendations
- Job role prediction based on resume content

### 🔍 Smart Job Search
![Job Portal](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/Job_Portal.png)
- Aggregated job listings from multiple platforms (LinkedIn, Indeed)
- Personalized job recommendations based on user profile
- Real-time job market insights

### 🎯 Dashboard & Insights
![Career Dashboard](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/Carrer_Dashboard.png)
- Personalized career progression tracking
- Skills and performance analytics
- Goal setting and achievement monitoring

### 🎙️ AI Interview Preparation
![Interview Practice](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/Interview.png)
- Video interview practice with AI feedback
- Technical and behavioral interview question generation
- Performance analysis and improvement recommendations

### 📊 ML-Powered Job Prediction
![ML Prediction](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/ML_prediciton.png)
- AI algorithms to match your skills with relevant job roles
- Career path suggestions based on your profile
- Model accuracy comparison for optimal recommendations
![Model Accuracy](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/model_accuracy_comparison.png)

### ✅ Task Management
![Todo Management](https://github.com/ShreedharDynamicCraft/CareerPilot/raw/cp/Docs%20and%20media/images/Todo.png)
- Job application tracking
- Interview preparation checklists
- Career development task management


## Code Review Features

### Overview
CareerPilot integrates code review features to help users analyze, improve, and validate code submissions. These features provide feedback, highlight best practices, and ensure code quality across modules.

### Technologies Used
- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Python (FastAPI), Machine Learning (scikit-learn, pandas, pickle for model serialization)
- **Database:** Prisma ORM (for user and job data)
- **Utilities:** Custom hooks, RESTful APIs, PDF generation, and validation

### Feature Breakdown
#### 1. Code Submission & Analysis
- **Frontend:** Users submit code via React forms styled with Tailwind CSS.
- **Backend:** FastAPI endpoints analyze code using Python scripts and ML models.
- **Details:** API endpoints in `backend/app.py` handle analysis; ML models (`resume_model.pkl`) and utilities (`utils.py`) process code.

#### 2. Automated Code Review
- **ML Integration:** Backend uses trained models for quality, style, and correctness checks.
- **Sub-tech:** scikit-learn, pandas, custom label encoders/vectorizers.
- **How it works:** Code is vectorized, passed through the model, and feedback is returned.

#### 3. Feedback & Suggestions
- **Frontend:** Feedback rendered via dynamic React components.
- **Backend:** Suggestions generated from model output and custom rules.
- **Details:** Dashboard and code review sections display feedback; hooks like `use-fetch.js` handle API calls.

#### 4. PDF Generation & Validation
- **Frontend:** Users can download code review reports as PDFs.
- **Backend:** Python scripts and libraries generate/validate PDFs.
- **Details:** PDF utilities in `pdf-utils.js` (frontend) and `pdf_validator.py` (backend).

---

## Scraping & Interview Modules
---

## Interview Features: Implementation & Details

### Code Practice
- **Frontend:**
	- Interactive coding problems and assessments are available in the dashboard.
	- Built using React components in `nextjs-frontend/app/(main)/interview/` and `nextjs-frontend/app/api/coding-problems/`.
	- Users can solve problems, submit code, and receive instant feedback.
- **Backend:**
	- FastAPI endpoints validate and evaluate code submissions.
	- Python scripts run code safely in a sandboxed environment and return results.
- **Why:** Enables users to practice coding in a real-world environment and get automated feedback.

### AI Video Interview
- **Frontend:**
	- Users can participate in simulated video interviews using the UI in `nextjs-frontend/app/(main)/interview/`.
	- Video components and avatars (e.g., `public/ai-interviewer-avatar.svg`, `interview-ai-placeholder.mp4`) create an interactive experience.
	- User responses (text or voice) are captured and sent to backend APIs.
- **Backend:**
	- FastAPI endpoints analyze interview responses using ML models and NLP techniques.
	- Voice analysis (if enabled) uses Python libraries for speech-to-text and sentiment analysis.
- **Why:** Provides realistic interview practice, instant feedback, and helps users prepare for real interviews.

### Implementation Approach
- **Modular Design:** Interview features are split into frontend actions (`actions/interview.js`), API routes (`app/api/analyze-interview/`), and UI components for maintainability.
- **AI/ML Integration:** Uses trained models for evaluating answers, generating questions, and analyzing user performance.
- **Media Handling:** Video and audio are processed using browser APIs and backend Python libraries for analysis.
- **Feedback Loop:** Users receive actionable feedback after each practice or interview session, improving their skills iteratively.


### Technologies & Modules Used

- **Scraping (JavaScript):**
	- **Libraries:**
		- `axios` for HTTP requests
		- `cheerio` for HTML parsing and DOM traversal
	- **Modules:**
		- `nextjs-frontend/lib/scrapers/internshala.js` (Internshala jobs)
		- `nextjs-frontend/lib/scrapers/indeed.js` (Indeed jobs)
		- `nextjs-frontend/lib/scrapers/linkedin.js` (LinkedIn jobs)
	- **Why:** JavaScript scraping is used for seamless integration with the Next.js frontend, enabling direct job data fetching and rendering. Axios and Cheerio are lightweight, fast, and well-supported for web scraping in Node.js environments.

- **Interview Features:**
	- **Frontend:** Next.js/React for interactive UI and interview simulation.
	- **Backend:** FastAPI endpoints for generating interview questions, analyzing responses.
	- **ML/AI:** Models for evaluating answers, voice analysis (if enabled), and feedback.
	- **Modules:**
		- `nextjs-frontend/actions/interview.js` (frontend actions)
		- `nextjs-frontend/app/api/analyze-interview/` (backend API)
	- **Why:** FastAPI is fast and scalable for real-time analysis; ML models provide intelligent feedback.


## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4
- **UI Components**: Shadcn UI with Tailwind CSS
- **State Management**: React Hooks
- **Authentication**: Clerk
- **Animations**: Framer Motion
- **Markdown**: MDX for content rendering

### Backend
- **Language**: Python
- **ML Framework**: scikit-learn for resume analysis
- **AI Integration**: Google Gemini for intelligent responses
- **Database**: PostgreSQL with Prisma ORM
- **Web Scraping**: Cheerio.js for job listings
- **PDF Processing**: PDF parsing tools

## 🔧 Installation and Setup

### Frontend Setup
```bash
cd nextjs-frontend
npm install
npm run dev





### Rationale for Technology Choices
- **Next.js/React:** Modern, fast, and supports SSR for better SEO and performance.
- **Tailwind CSS:** Rapid UI development and easy customization.
- **FastAPI:** High performance, async support, easy integration with Python ML stack.
- **Python ML Libraries:** scikit-learn and pandas are industry standards for data science and ML.
- **Prisma ORM:** Type-safe database access, easy migrations, and integration with Next.js.
- **Custom Hooks/Utilities:** Improve code reuse and maintainability.

---

## Project Structure & Analysis
- **nextjs-frontend/**: React components, pages, hooks, and utilities for UI.
- **backend/**: FastAPI server, ML models, scraping scripts, and utilities.
- **prisma/**: Database schema and migrations.
- **public/**: Static assets.
- **Docs and media/**: Documentation and images.


---

## UI Technologies & Module Mapping

### Technologies Used for UI
- **Next.js:** Main framework for SSR, routing, and API integration.
- **React:** Component-based architecture for building interactive UIs.
- **Tailwind CSS:** Utility-first CSS framework for rapid and responsive design.

### UI Module Mapping
- **Header & Navigation:**
	- `components/Header.jsx` – Main header and navigation bar.
- **Landing Page:**
	- `components/landing.jsx` – Landing and introductory UI.
- **Dashboard:**
	- `app/(main)/dashboard/` – User dashboard and analytics.
- **Resume Analysis:**
	- `app/(main)/resume-analysis/` – Resume upload, analysis, and results display.
- **Interview Practice:**
	- `app/(main)/interview/` – Interview simulation, video, and feedback UI.
- **Job Search & Scraping:**
	- `app/(main)/job-search/` – Job search interface and results.
	- `lib/scrapers/` – Job scraping logic (integrated with UI).
- **Cover Letter Generation:**
	- `app/(main)/cover-letter/` – Cover letter creation and download UI.
- **Todo & Productivity:**
	- `app/(main)/todo/` – Task management and productivity tools.
- **UI Components:**
	- `components/ui/` – Reusable UI elements (buttons, cards, modals, etc.).
- **Global Styles:**
	- `app/globals.css`, `styles/globals.css` – Global CSS and Tailwind configuration.

---

### Summary
CareerPilot uses a modular, scalable architecture with modern web and ML technologies to deliver code review, scraping, interview, and productivity features. Each technology and module is chosen for its reliability, performance, and ease of integration, ensuring a robust solution for career development and code analysis.
