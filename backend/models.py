from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id            = Column(Integer, primary_key=True, index=True)
    email         = Column(String, unique=True, index=True, nullable=False)
    username      = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)
    chats         = relationship("ChatSession", back_populates="owner")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id         = Column(Integer, primary_key=True, index=True)
    title      = Column(String, default="New conversation")
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id    = Column(Integer, ForeignKey("users.id"))
    owner      = relationship("User", back_populates="chats")
    messages   = relationship("Message", back_populates="session")

class Message(Base):
    __tablename__ = "messages"
    id         = Column(Integer, primary_key=True, index=True)
    role       = Column(String, nullable=False)
    content    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    session    = relationship("ChatSession", back_populates="messages")