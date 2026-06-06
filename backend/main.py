from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import auth, chat, history

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MedAssist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/auth",    tags=["Auth"])
app.include_router(chat.router,    prefix="/chat",    tags=["Chat"])
app.include_router(history.router, prefix="/history", tags=["History"])

@app.get("/")
def root():
    return {"message": "MedAssist API is running"}