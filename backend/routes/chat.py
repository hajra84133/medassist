from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import ChatSession, Message, User
from routes.auth import get_current_user
from prompt import MEDICAL_SYSTEM_PROMPT
import requests
import os

router = APIRouter()

class MessageRequest(BaseModel):
    session_id: int
    content: str

def get_ai_response(user_message: str, conversation_history: list) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")
    
    messages = [{"role": "system", "content": MEDICAL_SYSTEM_PROMPT}]
    messages += conversation_history
    messages.append({"role": "user", "content": user_message})
    
    response = requests.post(
        url="https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        json={
            "model": "google/gemma-4-31b-it:free",
            "messages": messages
        }
    )
    
    data = response.json()
    return data["choices"][0]["message"]["content"]

@router.post("/session")
def create_session(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = ChatSession(user_id=current_user.id, title="New conversation")
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"session_id": session.id, "title": session.title}

@router.post("/message")
def send_message(req: MessageRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(
        ChatSession.id == req.session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    past_messages = db.query(Message).filter(
        Message.session_id == session.id
    ).order_by(Message.created_at).all()

    conversation_history = [
        {"role": m.role, "content": m.content}
        for m in past_messages
    ]

    try:
        ai_reply = get_ai_response(req.content, conversation_history)
    except Exception as e:
        ai_reply = "Sorry, I could not process your request right now. Please try again."

    user_msg = Message(role="user", content=req.content, session_id=session.id)
    db.add(user_msg)
    ai_msg = Message(role="assistant", content=ai_reply, session_id=session.id)
    db.add(ai_msg)

    if session.title == "New conversation":
        words = req.content.split()
        session.title = " ".join(words[:5]) + ("..." if len(words) > 5 else "")

    db.commit()
    return {"reply": ai_reply}

@router.get("/session/{session_id}/messages")
def get_messages(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(Message).filter(
        Message.session_id == session_id
    ).order_by(Message.created_at).all()
    return [{"role": m.role, "content": m.content, "created_at": str(m.created_at)} for m in messages]