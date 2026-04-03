import sqlite3
import json
from datetime import datetime
from pathlib import Path

# Absolute path to the db file — always C:\secure+\secureflow.db
# regardless of what directory uvicorn is started from.
# Path(__file__) = this file (database.py)
# .parent = models/
# .parent = project root (secure+/)
DB_PATH = str(Path(__file__).parent.parent / "secureflow.db")


def get_connection():
    """Open a connection to the database file."""
    conn = sqlite3.connect(DB_PATH)
    # Return rows as dict-like objects so we can access columns by name
    # e.g. row["user_message"] instead of row[2]
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """
    Create the 'queries' table if it doesn't already exist.
    Call this once when the API server starts up.
    """
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS queries (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,  -- unique ID, auto-incremented
            timestamp    TEXT    NOT NULL,                   -- when the query was made
            user_message TEXT    NOT NULL,                   -- what the user typed
            agents_fired TEXT    NOT NULL,                   -- which agents ran (stored as JSON list)
            response     TEXT    NOT NULL                    -- the full response text
        )
    """)
    conn.commit()
    conn.close()


def save_query(user_message: str, agents_fired: list, response: str):
    """
    Insert one row into the queries table.

    agents_fired is a Python list like ["risk_agent", "incident_agent"].
    We convert it to a JSON string for storage, e.g. '["risk_agent", "incident_agent"]'.
    """
    print(f"[DB] save_query called — agents: {agents_fired} | db: {DB_PATH}")
    conn = get_connection()
    conn.execute(
        """
        INSERT INTO queries (timestamp, user_message, agents_fired, response)
        VALUES (?, ?, ?, ?)
        """,
        (
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),  # e.g. "2026-03-28 14:05:32"
            user_message,
            json.dumps(agents_fired),   # list → JSON string
            response,
        ),
    )
    conn.commit()
    conn.close()


def get_recent_queries(limit: int = 20) -> list[dict]:
    """
    Fetch the most recent queries, newest first.
    Returns a plain list of dicts so FastAPI can serialize them to JSON easily.
    """
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM queries ORDER BY id DESC LIMIT ?",
        (limit,),
    ).fetchall()
    conn.close()

    # Convert each Row object to a plain dict, and parse agents_fired back to a list
    result = []
    for row in rows:
        entry = dict(row)
        entry["agents_fired"] = json.loads(entry["agents_fired"])  # JSON string → list
        result.append(entry)
    return result
