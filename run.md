cd backend
python -m uvicorn app.main:app --reload --port 5001

cd frontend
npm run dev
