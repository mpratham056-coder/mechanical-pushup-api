from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
from typing import List
import os

# ============================================================
# App
# ============================================================

app = FastAPI(
    title="Mechanical Engineering & Push-Up API",
    description="Engineering calculations and push-up tracking powered by FastAPI",
    version="2.0.0"
)


# ============================================================
# In-memory session store (resets on server restart)
# ============================================================

sessions: List[dict] = []


# ============================================================
# Pydantic Models
# ============================================================

class MechanicalData(BaseModel):
    name: str
    value: float


class PushUpSession(BaseModel):
    body_weight_kg: float
    reps: int
    sets: int


# ============================================================
# Root — Mechanical API status
# ============================================================

@app.get("/", tags=["General"])
def home():
    return {
        "message": "Mechanical Engineering & Push-Up API is running",
        "version": "2.0.0",
        "docs": "/docs"
    }


# ============================================================
# Pressure Calculator  P = F / A
# ============================================================

@app.get("/calculate", tags=["Mechanical"])
def calculate(force: float, area: float):
    """
    Calculate pressure using P = F / A.

    - force: Force in Newtons (N)
    - area: Area in square metres (m²)
    """
    if area <= 0:
        return {"error": "Area must be greater than zero"}

    pressure = force / area

    return {
        "force": force,
        "area": area,
        "pressure": round(pressure, 6),
        "unit": "Pa"
    }


# ============================================================
# Generic Mechanical Data — POST
# ============================================================

@app.post("/data", tags=["Mechanical"])
def receive_data(data: MechanicalData):
    """
    Accept a named mechanical parameter and its value.
    """
    return {
        "message": "Data received successfully",
        "name": data.name,
        "value": data.value
    }


# ============================================================
# Push-Up — Force Calculation
# ============================================================

@app.get("/pushup/force", tags=["Push-Up"])
def pushup_force(body_weight_kg: float):
    """
    Calculate the muscle force exerted during a standard push-up.

    Research shows ~69% of body weight is borne by the arms during a push-up.
    Formula:  F = m × g × leverage_ratio
              F = body_weight_kg × 9.81 × 0.69
    """
    if body_weight_kg <= 0:
        return {"error": "Body weight must be greater than zero"}

    GRAVITY = 9.81          # m/s²
    LEVERAGE_RATIO = 0.69   # 69% of body weight on arms (published biomechanics research)

    effective_load_kg = round(body_weight_kg * LEVERAGE_RATIO, 2)
    muscle_force_N    = round(body_weight_kg * GRAVITY * LEVERAGE_RATIO, 2)

    return {
        "body_weight_kg":    body_weight_kg,
        "leverage_ratio":    LEVERAGE_RATIO,
        "effective_load_kg": effective_load_kg,
        "muscle_force_N":    muscle_force_N,
        "note": "Force is shared between both arms"
    }


# ============================================================
# Push-Up — Log a Session
# ============================================================

@app.post("/pushup/log", tags=["Push-Up"])
def log_pushup_session(session: PushUpSession):
    """
    Log a completed push-up session and persist it in memory.
    """
    if session.body_weight_kg <= 0:
        return {"error": "Body weight must be greater than zero"}
    if session.reps <= 0 or session.sets <= 0:
        return {"error": "Reps and sets must be greater than zero"}

    GRAVITY = 9.81
    LEVERAGE_RATIO = 0.69

    muscle_force_N = round(session.body_weight_kg * GRAVITY * LEVERAGE_RATIO, 2)
    total_reps     = session.reps * session.sets
    session_id     = len(sessions) + 1

    record = {
        "session_id":      session_id,
        "body_weight_kg":  session.body_weight_kg,
        "reps":            session.reps,
        "sets":            session.sets,
        "total_reps":      total_reps,
        "muscle_force_N":  muscle_force_N,
        "timestamp":       datetime.now().strftime("%Y-%m-%d %H:%M")
    }

    sessions.append(record)

    return {
        "message":        f"Session #{session_id} logged successfully!",
        "session_id":     session_id,
        "body_weight_kg": session.body_weight_kg,
        "reps":           session.reps,
        "sets":           session.sets,
        "total_reps":     total_reps,
        "muscle_force_N": muscle_force_N
    }


# ============================================================
# Push-Up — Get All Sessions
# ============================================================

@app.get("/pushup/sessions", tags=["Push-Up"])
def get_sessions():
    """
    Retrieve all logged push-up sessions.
    """
    return {
        "total_sessions": len(sessions),
        "sessions": sessions
    }


# ============================================================
# Serve Frontend Static Files
# ============================================================

frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")

if os.path.isdir(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/app", include_in_schema=False)
    def serve_frontend():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
