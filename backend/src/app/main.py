# backend/src/app/main.py
# backend/src/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.v1.router import router as api_v1_router
from .db.database import init_db

app = FastAPI(title="neXaQuant Backend (HackNYU MVP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://nexaquant.tech",
        "https://*.nexaquant.tech",
        "https://www.nexaquant.tech",
        "https://*.vercel.app", "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_v1_router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/healthz")
async def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Welcome to neXaQuant API"}