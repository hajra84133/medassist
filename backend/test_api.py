import requests, os
from dotenv import load_dotenv
load_dotenv()

key = os.getenv("OPENROUTER_API_KEY")
print(f"Key found: {key[:20]}..." if key else "NO KEY FOUND")

r = requests.post(
    'https://openrouter.ai/api/v1/chat/completions',
    headers={
        'Authorization': f'Bearer {key}',
        'Content-Type': 'application/json'
    },
    json={
        'model': 'google/gemma-4-31b-it:free',
        'messages': [{'role': 'user', 'content': 'hello'}]
    }
)
print(r.status_code)
print(r.json())