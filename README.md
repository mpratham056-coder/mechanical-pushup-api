# ⚙️ Mechanical Engineering & Push-Up API

A full-stack **FastAPI** application combining mechanical engineering calculations with a fitness push-up tracker.

**Live Demo:** *(Railway URL after deployment)*

---

## 🚀 Features

### ⚙️ Mechanical Engineering
| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API health check |
| `/calculate` | GET | Pressure calculator `P = F / A` |
| `/data` | POST | Accept named mechanical parameter |

### 💪 Push-Up Tracker
| Endpoint | Method | Description |
|---|---|---|
| `/pushup/force` | GET | Calculate muscle force during push-up |
| `/pushup/log` | POST | Log a push-up session |
| `/pushup/sessions` | GET | Retrieve all logged sessions |

### 🌐 Frontend
| Route | Description |
|---|---|
| `/app` | Interactive web UI |
| `/docs` | Auto-generated Swagger UI |
| `/redoc` | ReDoc API documentation |

---

## 📐 Push-Up Biomechanics

The muscle force is calculated using published biomechanics research:

```
F = m × g × leverage_ratio
F = body_weight_kg × 9.81 × 0.69
```

> Research shows ~**69% of body weight** is borne by the arms during a standard push-up.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.12 + FastAPI + Uvicorn
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Deployment:** Railway.app

---

## 💻 Run Locally

```bash
# Clone the repo
git clone https://github.com/<your-username>/mechanical-pushup-api.git
cd mechanical-pushup-api

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

Open **http://127.0.0.1:8000/app** in your browser.

---

## 🚂 Deploy on Railway

1. Push this repo to GitHub
2. Go to [railway.app/new](https://railway.app/new)
3. Click **"Deploy from GitHub repo"**
4. Select this repository
5. Railway auto-detects Python + `Procfile` → deploys automatically 🎉

---

## 📝 Example Requests

```bash
# Check API
curl http://127.0.0.1:8000/

# Pressure calculation
curl "http://127.0.0.1:8000/calculate?force=100&area=0.5"

# Push-up force for 70kg person
curl "http://127.0.0.1:8000/pushup/force?body_weight_kg=70"

# Log a push-up session
curl -X POST "http://127.0.0.1:8000/pushup/log" \
  -H "Content-Type: application/json" \
  -d '{"body_weight_kg": 70, "reps": 15, "sets": 3}'

# Get all sessions
curl http://127.0.0.1:8000/pushup/sessions
```

---

## 📄 License

MIT License © 2026
