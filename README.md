# MedAssist

MedAssist is a full-stack medical information chatbot. Users can register, log in, and ask general health questions, with an AI assistant answering based on a system prompt that keeps responses educational rather than diagnostic.

> **Disclaimer:** MedAssist provides general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns. In an emergency, contact your local emergency services immediately.

## Features

- User registration and login with JWT-based authentication
- Persistent chat sessions with full conversation history
- AI-generated responses via [OpenRouter](https://openrouter.ai), using a medically-scoped system prompt
- Ability to create, view, and delete past conversations

## Tech Stack

**Backend**
- FastAPI (Python)
- PostgreSQL with SQLAlchemy ORM
- JWT authentication (`python-jose`), password hashing (`passlib` + `bcrypt`)
- OpenRouter API for AI chat completions

**Frontend**
- React 19 (Vite)
- React Router
- Axios

## Project Structure

```
medassist/
├── backend/
│   ├── main.py           # FastAPI app entrypoint
│   ├── database.py       # DB connection / session setup
│   ├── models.py         # SQLAlchemy models (User, ChatSession, Message)
│   ├── prompt.py         # System prompt for the AI assistant
│   ├── routes/
│   │   ├── auth.py       # Register / login
│   │   ├── chat.py       # Chat sessions and messages
│   │   └── history.py    # Conversation history
│   └── requirnments.txt  # Python dependencies
└── frontend/
    ├── src/
    │   ├── pages/         # Login, Register, Chat
    │   ├── components/    # Sidebar, etc.
    │   └── api.js         # Axios API client
    └── package.json
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- An [OpenRouter API key](https://openrouter.ai/keys) (free tier available)

### 1. Clone the repo

```bash
git clone https://github.com/hajra84133/medassist.git
cd medassist
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # Windows (Git Bash)
# source venv/bin/activate     # macOS/Linux

pip install -r requirnments.txt
```

Create a `backend/.env` file (never commit this):

```env
DATABASE_URL=postgresql://postgres:your-password@127.0.0.1:5432/medassist
SECRET_KEY=your-random-secret-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

Generate a strong `SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Create the database:

```sql
CREATE DATABASE medassist;
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

### 4. Run both together (recommended)

From the project root:

```bash
npm install
npm run dev
```

This starts the backend (`http://127.0.0.1:8000`) and frontend (`http://localhost:5173`) together.

<details>
<summary>Or run them separately</summary>

**Backend**
```bash
cd backend
source venv/Scripts/activate
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm run dev
```
</details>

## API Overview

| Method | Endpoint                      | Description                  |
|--------|--------------------------------|-------------------------------|
| POST   | `/auth/register`              | Create a new account          |
| POST   | `/auth/login`                 | Log in, receive a JWT         |
| POST   | `/chat/session`                | Start a new chat session      |
| POST   | `/chat/message`                 | Send a message, get an AI reply |
| GET    | `/chat/session/{id}/messages`   | Fetch messages in a session   |
| GET    | `/history/`                    | List all chat sessions        |
| DELETE | `/history/{id}`                | Delete a chat session          |

## Notes

- AI responses use OpenRouter's free-tier models, which are rate-limited and may occasionally be slow or unavailable during peak usage.
- This is a personal/learning project and has not been audited for production or clinical use.

## License

MIT
