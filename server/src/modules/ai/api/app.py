from flask import Flask, request, jsonify
import os

from rapport.generateRapport import generate_report
from assignment.solver import assign_technician
from flask_cors import CORS  # type: ignore


app = Flask(__name__, static_folder="static")
CORS(app)


@app.route("/assign", methods=["POST"])
def assign():
    data = request.json
    print("DATA RECEIVED:", data)

    result = assign_technician(data)

    return jsonify({
        "success": True,
        "data": result
    })

@app.route('/generate_report', methods=['POST'])
def generate_ai_report():
    data = request.get_json()
    mission_id = data.get("missionId") if data else None

    if not mission_id:
        return jsonify({"error": "Mission ID is required"}), 400

    report_url = generate_report(mission_id)

    if report_url == "Mission not found":
        return jsonify({"error": "Mission not found"}), 404

    return jsonify({"download_url": report_url})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port, debug=True)