# Expense Tracker — Google Gemini Vision OCR

A full-stack expense tracker that uses **Google Gemini Vision** to extract text from receipt/bill images.

## Tech Stack
- **Frontend**: React 18, Axios, React Toastify
- **Backend**: Node.js, Express, Multer, SQLite3
- **OCR**: Google Gemini Vision (`@google/genai`)

## Project Structure
```
p4-1/
├── backend/
│   ├── db/           # SQLite database setup
│   ├── middleware/   # Multer file upload
│   ├── routes/       # Express routes
│   ├── services/     # OCR + expense business logic
│   ├── uploads/      # Stored receipt images
│   ├── .env          # API key config
│   └── server.js
└── frontend/
    └── src/
        ├── api/        # Axios API calls
        ├── components/ # React components
        ├── App.js
        └── index.js
```

## Setup

### 1. Get a Gemini API Key
Go to https://aistudio.google.com/app/apikey and create a free API key.

### 2. Backend Setup
```bash
cd backend
npm install
```
Edit `.env` and replace `your_gemini_api_key_here` with your actual key:
```
GEMINI_API_KEY=AIza...your_key_here
PORT=5000
```
Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

## Features
- Drag & drop or browse to upload receipt images
- Gemini Vision extracts all text + structured data (vendor, date, total, items)
- View raw text, structured data, and full OCR response
- Expense history with search and category filters
- Delete expenses
- SQLite database for persistence
- Receipt image thumbnails
