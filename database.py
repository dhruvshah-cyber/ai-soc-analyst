import sqlite3
import json
from datetime import datetime

DB_PATH = "soc_analyst.db"


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_text TEXT NOT NULL,
            classification TEXT,
            confidence INTEGER,
            severity TEXT,
            mitre_techniques TEXT,
            summary TEXT,
            containment_steps TEXT,
            incident_report TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()


def save_alert(alert_text: str, analysis: dict) -> int:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO alerts (
            alert_text, classification, confidence, severity,
            mitre_techniques, summary, containment_steps, incident_report
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        alert_text,
        analysis.get("classification"),
        analysis.get("confidence"),
        analysis.get("severity"),
        json.dumps(analysis.get("mitre_techniques", [])),
        analysis.get("summary"),
        json.dumps(analysis.get("containment_steps", [])),
        analysis.get("incident_report"),
    ))
    conn.commit()
    alert_id = cursor.lastrowid
    conn.close()
    return alert_id


def get_all_alerts() -> list:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    alerts = []
    for row in rows:
        alert = dict(row)
        alert["mitre_techniques"] = json.loads(alert["mitre_techniques"] or "[]")
        alert["containment_steps"] = json.loads(alert["containment_steps"] or "[]")
        alerts.append(alert)
    return alerts


def get_alert_by_id(alert_id: int) -> dict | None:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    alert = dict(row)
    alert["mitre_techniques"] = json.loads(alert["mitre_techniques"] or "[]")
    alert["containment_steps"] = json.loads(alert["containment_steps"] or "[]")
    return alert


def get_statistics() -> dict:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM alerts")
    total = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as tp FROM alerts WHERE classification = 'True Positive'")
    true_positives = cursor.fetchone()["tp"]

    cursor.execute("SELECT COUNT(*) as fp FROM alerts WHERE classification = 'False Positive'")
    false_positives = cursor.fetchone()["fp"]

    cursor.execute("""
        SELECT severity, COUNT(*) as count
        FROM alerts
        WHERE severity IS NOT NULL
        GROUP BY severity
    """)
    severity_rows = cursor.fetchall()
    severity_breakdown = {row["severity"]: row["count"] for row in severity_rows}

    cursor.execute("SELECT mitre_techniques FROM alerts WHERE mitre_techniques IS NOT NULL")
    mitre_rows = cursor.fetchall()
    technique_counts = {}
    for row in mitre_rows:
        techniques = json.loads(row["mitre_techniques"] or "[]")
        for t in techniques:
            key = f"{t.get('id', '')} - {t.get('name', '')}"
            technique_counts[key] = technique_counts.get(key, 0) + 1

    top_techniques = sorted(technique_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    conn.close()

    return {
        "total": total,
        "true_positives": true_positives,
        "false_positives": false_positives,
        "severity_breakdown": {
            "Critical": severity_breakdown.get("Critical", 0),
            "High": severity_breakdown.get("High", 0),
            "Medium": severity_breakdown.get("Medium", 0),
            "Low": severity_breakdown.get("Low", 0),
        },
        "top_mitre_techniques": [{"technique": t[0], "count": t[1]} for t in top_techniques],
    }
