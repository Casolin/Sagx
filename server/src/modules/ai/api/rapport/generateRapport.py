import os
from pymongo import MongoClient
from bson import ObjectId
from fpdf import FPDF
from dotenv import load_dotenv # type: ignore

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    raise ValueError("MONGO_URI is not set in the environment variables.")

client = MongoClient(MONGO_URI)
db = client.get_database("testproject")
missions_collection = db.missions
users_collection = db.users

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(BASE_DIR, "logo.png")


def fetch_mission_data(mission_id):
    try:
        mission = missions_collection.find_one({"_id": ObjectId(mission_id)})

        if not mission:
            return None

        created_by = None
        assigned_to = None

        if mission.get("createdBy"):
            created_by = users_collection.find_one(
                {"_id": mission["createdBy"]},
                {"firstName": 1, "lastName": 1}
            )

        if mission.get("assignedTo"):
            assigned_to = users_collection.find_one(
                {"_id": mission["assignedTo"]},
                {"firstName": 1, "lastName": 1}
            )

        mission["createdByUser"] = created_by
        mission["assignedToUser"] = assigned_to

        return mission

    except Exception as e:
        print(f"Error fetching mission data: {e}")
        return None


def safe(text):
    return str(text).encode("latin-1", "ignore").decode("latin-1")


def section_title(pdf, title, bold=False):
    pdf.set_text_color(255, 140, 0)
    pdf.set_font("Arial", "B" if bold else "", 14)
    pdf.cell(0, 10, title, ln=True)
    pdf.set_draw_color(220, 220, 220)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(5)
    pdf.set_text_color(0, 0, 0)


def field(pdf, label, value):
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", "B", 11)
    pdf.cell(60, 7, f"{label}:")
    pdf.set_font("Arial", "", 11)
    pdf.multi_cell(0, 7, safe(value))


def generate_ai_analysis(mission):
    tasks = mission.get("tasks", [])
    priority = mission.get("priority", "MEDIUM")

    base = len(tasks) * 3
    multiplier = {"LOW": 1, "MEDIUM": 1.4, "HIGH": 1.8, "URGENT": 2.5}.get(priority, 1)

    hours = base * multiplier
    days = max(1, round(hours / 8, 1))
    risk = min(95, int(hours * 1.5))

    return {
        "hours": round(hours, 1),
        "days": days,
        "risk": risk,
        "suggestions": [
            "Assign best technician",
            "Split tasks into phases",
            "Monitor progress daily",
            "Balance workload"
        ]
    }


def generate_report(mission_id):
    mission = fetch_mission_data(mission_id)

    if not mission:
        return "Mission not found"

    ai = generate_ai_analysis(mission)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(True, 15)

    pdf.set_text_color(0, 0, 0)

    if os.path.exists(LOGO_PATH):
        pdf.image(LOGO_PATH, x=160, y=10, w=35)

    pdf.set_font("Arial", "B", 20)
    pdf.set_text_color(0, 60, 120)
    pdf.cell(0, 12, "MISSION EXECUTIVE REPORT", ln=True)

    pdf.set_font("Arial", "", 10)
    pdf.set_text_color(120, 120, 120)
    pdf.cell(0, 8, "AI Mission Intelligence System", ln=True)

    pdf.ln(5)

    section_title(pdf, "MISSION OVERVIEW")

    creator = mission.get("createdByUser") or {}
    assigned = mission.get("assignedToUser") or {}

    field(pdf, "Title", mission.get("title"))
    field(pdf, "Priority", mission.get("priority"))
    field(pdf, "Status", mission.get("status"))
    field(pdf, "Location", mission.get("location"))
    field(pdf, "Created By", f"{creator.get('firstName', '')} {creator.get('lastName', '')}")
    field(pdf, "Assigned To", f"{assigned.get('firstName', '')} {assigned.get('lastName', '')}")

    section_title(pdf, "TASKS")

    for i, t in enumerate(mission.get("tasks", []), 1):
        pdf.set_text_color(0, 0, 0)
        pdf.set_font("Arial", "B", 11)
        pdf.cell(0, 7, f"{i}. {t.get('title')}", ln=True)

        pdf.set_font("Arial", "", 10)
        pdf.cell(0, 6, f"Status: {t.get('status')}", ln=True)
        pdf.cell(0, 6, f"Priority: {t.get('priority')}", ln=True)
        pdf.ln(2)

    section_title(pdf, "AI PREDICTION & ANALYSIS")

    pdf.set_font("Arial", "", 11)
    pdf.multi_cell(
        0,
        6,
        f"""WORKLOAD
- Estimated Hours: {ai['hours']}
- Estimated Days: {ai['days']}
- Risk: {ai['risk']}%

OPTIMIZATION
{chr(10).join("- " + s for s in ai['suggestions'])}
"""
    )

    section_title(pdf, "MANAGEMENT NOTES")

    pdf.set_font("Arial", "", 11)
    pdf.multi_cell(
        0,
        6,
        "This report is generated automatically to optimize mission execution and reduce operational risk."
    )

    path = os.path.join("static", "reports", f"mission_{mission_id}.pdf")
    os.makedirs(os.path.dirname(path), exist_ok=True)

    pdf.output(path)

    return f"/static/reports/mission_{mission_id}.pdf"