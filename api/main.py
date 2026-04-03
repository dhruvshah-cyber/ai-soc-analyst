from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from orchestrator.claude_brain import ClaudeBrain
from models.schemas import OrchestratorRequest, OrchestratorResponse
from models.database import init_db, save_query, get_recent_queries


# lifespan runs once when the server starts and once when it shuts down.
# We use it to initialise the database so the table is always ready
# before the first request arrives.
@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()          # creates secureflow.db + queries table if not present
    yield              # server runs here
    # (nothing to clean up on shutdown)

app = FastAPI(title="SecureFlow API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5500", "http://127.0.0.1:5500"],
    allow_methods=["*"],
    allow_headers=["*"],
)
brain = ClaudeBrain()


@app.get("/health")
def health_check():
    return {
        "status": "online",
        "agents": {
            "compliance_agent": "ready",
            "risk_agent": "ready",
            "incident_agent": "ready",
            "identity_agent": "ready",
            "shadow_it_agent": "ready",
            "policy_agent": "ready",
        },
        "version": "1.0.0",
    }


@app.post("/analyze", response_model=OrchestratorResponse)
async def analyze(request: OrchestratorRequest):
    try:
        result = await brain.route(request)

        # Persist the query to SQLite after a successful response.
        # agents_fired is a comma-separated string like "risk_agent, incident_agent"
        # — split it into a list for clean storage.
        save_query(
            user_message=request.get_task(),
            agents_fired=result.agent.split(", "),
            response=result.response,
        )

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/history")
def history():
    """Return the last 20 queries, newest first."""
    return get_recent_queries(limit=20)
