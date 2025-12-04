# GenAI Career Copilot (AWS Powered)

An all-in-one AI career assistant that helps students prepare for placements using Facial Authentication, AI Mock Interviews, Resume Generation, and Multimodal Document Verification.

## Architecture
* **Frontend:** React.js (Vite)
* **Backend:** AWS Lambda (Python 3.9)
* **API Layer:** Amazon API Gateway (REST)
* **Storage:** Amazon S3 (Resumes & Reference Photos)
* **AI & ML Services:**
    * **Amazon Rekognition:** Biometric Face Login.
    * **Amazon Bedrock (Claude 3 Haiku):**
        * **Text Mode:** Generates interview questions & writes resumes.
        * **Vision Mode:** Analyzes uploaded documents directly (Multimodal AI) to detect fraud without needing separate OCR.

---

## Features

### 1. Secure Face Login
* **How it works:** User uploads a live selfie. System compares it against a secure reference image in S3.
* **Tech:** `boto3.client('rekognition').compare_faces()`

### 2. AI Interview Coach
* **How it works:** Generates custom technical & HR questions based on the specific company (e.g., Google) and role (e.g., SDE).
* **Tech:** Bedrock `invoke_model` (Prompt Engineering).

### 3. Smart Resume Builder
* **How it works:** User inputs raw skills/experience. AI writes a professional summary and formats a downloadable PDF.
* **Tech:** Python `fpdf` library + Bedrock text generation.

### 4. Visual Document Verification (Fraud Detection)
* **How it works:** Users upload a photo of a degree/marksheet. Claude 3 Vision "looks" at the image to extract names, GPAs, and validate authenticity.
* **Tech:** Bedrock Multimodal Input (Image + Text prompts).

---

## Setup Instructions

### Prerequisites
1.  Node.js & npm
2.  AWS Account (Free Tier friendly)
3.  Access to **Claude 3 Haiku** in AWS Bedrock

### Backend Deployment (AWS)
1.  **S3:** Create bucket `career-copilot-storage`.
2.  **IAM Role:** Create `CareerCopilotLambdaRole` with permissions: `S3FullAccess`, `RekognitionFullAccess`, `BedrockFullAccess`.
3.  **Lambda Functions:**
    * `CareerCopilotLogin` (Rekognition)
    * `CareerCopilotInterview` (Bedrock Text)
    * `CareerCopilotResume` (Bedrock + FPDF)
    * `CareerCopilotVerifier` (Bedrock Vision)
4.  **API Gateway:** Create 4 REST endpoints (`/login`, `/interview`, `/resume`, `/verify`) with CORS enabled.

### Frontend Setup
```bash
git clone 
cd frontend
npm install
npm run dev