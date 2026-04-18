from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

app = FastAPI()

# CORS allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production mein specific domain dena better hai
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
client = MongoClient(os.getenv("MONGODB_URI"))
db = client["diamonix"]
client_inquiries = db["client_inquiries"]
user_support = db["user_support"]

# Request models
class ClientInquiry(BaseModel):
    fullName: str
    personalEmail: str
    companyEmail: str
    contactNumber: str
    position: str
    category: str
    service: str
    specialDetails: str = ""

class UserSupport(BaseModel):
    name: str
    email: str
    password: str
    position: str = ""

class ChatMessage(BaseModel):
    message: str

# API endpoints

@app.post("/api/client-inquiry")
async def submit_client_inquiry(data: ClientInquiry):
    result = client_inquiries.insert_one(data.dict())
    return {"message": "Inquiry submitted successfully", "id": str(result.inserted_id)}

@app.post("/api/user-support")
async def submit_user_support(data: UserSupport):
    # Note: Never store passwords in plain text! Hash them.
    # For demo, we'll just store but in production use hashing.
    result = user_support.insert_one(data.dict())
    return {"message": "Support request sent", "id": str(result.inserted_id)}

@app.post("/api/chat")
async def chat_with_ai(msg: ChatMessage):
    # Call Google Gemini API
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": msg.message}]
        }]
    }
    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()
        # Extract reply
        reply = data["candidates"][0]["content"]["parts"][0]["text"]
        return {"reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Diamonix Backend API"}