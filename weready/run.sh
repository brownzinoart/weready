#!/bin/bash
echo "Starting WeReady..."
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload &
cd ../frontend
npm run dev
