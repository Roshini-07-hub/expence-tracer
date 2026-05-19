# Expense Tracker — Google Gemini Vision OCR

A full-stack expense tracker that uses **Google Gemini Vision** to extract text from receipt/bill images.

## Tech Stack
- **Frontend**: React 18, Axios, React Toastify
- **Backend**: Node.js, Express, Multer, MongoDB Atlas
- **OCR**: Groq Vision / LLM pipeline (`groq-sdk`, `langsmith`)

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
Create a `.env` file in `backend/` with these values:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key_here
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

### 4. Vercel Deployment
To deploy the frontend to Vercel, use the `frontend` folder as the project root.

1. Create a Vercel account and connect your Git repository.
2. Set the Project Root to `frontend`.
3. Use:
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add an environment variable in Vercel:
   - `REACT_APP_API_URL` = `https://<your-backend-url>`

If your backend is hosted separately, the frontend will send API requests to `${process.env.REACT_APP_API_URL}/api/expenses` in production.

> Note: This app currently expects a separate backend service. Vercel is best for the React frontend, while the Node/Express backend should be hosted on a Node-capable provider (Render, Railway, Fly, Heroku, or similar).

## Features
- Drag & drop or browse to upload receipt images
- Gemini Vision extracts all text + structured data (vendor, date, total, items)
- View raw text, structured data, and full OCR response
- Expense history with search and category filters
- Delete expenses
- MongoDB Atlas for persistence
- Receipt image thumbnails
# expense_tracer
