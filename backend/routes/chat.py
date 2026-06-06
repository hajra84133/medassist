from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import ChatSession, Message, User
from routes.auth import get_current_user
from prompt import MEDICAL_SYSTEM_PROMPT
import random

router = APIRouter()

class MessageRequest(BaseModel):
    session_id: int
    content: str

MOCK_RESPONSES = [
    "That's a great question about {topic}. Generally speaking, it is important to monitor your symptoms carefully. Please consult a qualified doctor for advice specific to your situation. This information is general and not a substitute for professional medical advice.",
    "I understand your concern about {topic}. Staying hydrated and resting are generally helpful. If symptoms persist or worsen, please seek medical attention promptly. This information is general and not a substitute for professional medical advice.",
    "Thank you for sharing that. {topic} can have various causes and it is important not to self-diagnose. A healthcare professional can properly evaluate your condition. This information is general and not a substitute for professional medical advice.",
    "Based on general health information, a healthy lifestyle including exercise and balanced diet can help with {topic}. Please consult your doctor for personalized guidance. This information is general and not a substitute for professional medical advice.",
]

def mock_ai_response(user_message: str) -> str:
    words = user_message.split()
    topic = " ".join(words[:4]) if len(words) >= 4 else user_message
    return random.choice(MOCK_RESPONSES).format(topic=topic)

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
    user_msg = Message(role="user", content=req.content, session_id=session.id)
    db.add(user_msg)
    ai_reply = mock_ai_response(req.content)
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
    messages = db.query(Message).filter(Message.session_id == session_id).order_by(Message.created_at).all()
    return [{"role": m.role, "content": m.content, "created_at": str(m.created_at)} for m in messages]
