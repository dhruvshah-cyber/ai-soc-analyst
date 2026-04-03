import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for
from dotenv import load_dotenv
import anthropic
from database import init_db, save_alert, get_all_alerts, get_alert_by_id, get_statistics

load_dotenv()

app = Flask(__name__)

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

SOC_SYSTEM_PROMPT = """You are an expert SOC (Security Operations Center) analyst with deep expertise in threat intelligence, incident response, and digital forensics. Analyze the provided security alert or log snippet and return a JSON response with these exact fields:

{
  "classification": "True Positive" or "False Positive",
  "confidence": <integer 0-100>,
  "severity": "Critical" or "High" or "Medium" or "Low",
  "mitre_techniques": [
    {"id": "TXXXX", "name": "Technique Name"}
  ],
  "summary": "<2-3 sentence plain English explanation of what occurred>",
  "containment_steps": [
    "Step 1: ...",
    "Step 2: ...",
    "..."
  ],
  "incident_report": "<full professional incident report in plain text>"
}

Be precise, technical, and actionable. The incident_report should follow professional SOC reporting standards including: Executive Summary, Timeline, Technical Analysis, Indicators of Compromise, Impact Assessment, and Recommendations sections. Return ONLY valid JSON, no markdown code blocks."""


def analyze_alert_with_claude(alert_text: str) -> dict:
    if not ANTHROPIC_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY is not set. Please configure your .env file.")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SOC_SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": f"Analyze this security alert:\n\n{alert_text}"
            }
        ]
    )

    response_text = message.content[0].text.strip()

    # Strip markdown code fences if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])

    analysis = json.loads(response_text)

    required_fields = ["classification", "confidence", "severity", "mitre_techniques",
                       "summary", "containment_steps", "incident_report"]
    for field in required_fields:
        if field not in analysis:
            analysis[field] = None

    return analysis


@app.route("/")
def index():
    alerts = get_all_alerts()
    stats = get_statistics()
    return render_template("index.html", alerts=alerts, stats=stats)


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    alert_text = data.get("alert_text", "").strip()

    if not alert_text:
        return jsonify({"error": "Alert text cannot be empty."}), 400

    if len(alert_text) > 10000:
        return jsonify({"error": "Alert text is too long. Maximum 10,000 characters."}), 400

    try:
        analysis = analyze_alert_with_claude(alert_text)
        alert_id = save_alert(alert_text, analysis)
        analysis["id"] = alert_id
        return jsonify({"success": True, "analysis": analysis, "alert_id": alert_id})

    except ValueError as e:
        return jsonify({"error": str(e)}), 500

    except anthropic.AuthenticationError:
        return jsonify({"error": "Invalid API key. Please check your ANTHROPIC_API_KEY in .env."}), 401

    except anthropic.RateLimitError:
        return jsonify({"error": "Rate limit exceeded. Please wait a moment and try again."}), 429

    except anthropic.APIError as e:
        return jsonify({"error": f"Claude API error: {str(e)}"}), 500

    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse AI response. Please try again."}), 500

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/report/<int:alert_id>")
def report(alert_id):
    alert = get_alert_by_id(alert_id)
    if not alert:
        return render_template("404.html"), 404
    return render_template("report.html", alert=alert)


@app.route("/api/alerts")
def api_alerts():
    alerts = get_all_alerts()
    return jsonify(alerts)


@app.route("/api/stats")
def api_stats():
    stats = get_statistics()
    return jsonify(stats)


@app.route("/api/alert/<int:alert_id>")
def api_alert(alert_id):
    alert = get_alert_by_id(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    return jsonify(alert)


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
