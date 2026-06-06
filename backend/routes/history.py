from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import ChatSession
from routes.auth import get_current_user
from models import User

router = APIRouter()

@router.get("/")
def get_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.created_at.desc()).all()
    return [{"session_id": s.id, "title": s.title, "created_at": str(s.created_at)} for s in sessions]

@router.delete("/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if session:
        db.delete(session)
        db.commit()
    return {"message": "Deleted"}
