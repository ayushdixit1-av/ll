from flask import Flask, request, jsonify, send_from_directory
from datetime import datetime
from pathlib import Path
import json

app = Flask(__name__)
LOG_FILE = Path("visitors.json")

if not LOG_FILE.exists():
    LOG_FILE.write_text("[]", encoding="utf-8")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/api/log", methods=["POST"])
def log_visitor():
    data = request.get_json(force=True)
    data["timestamp"] = datetime.utcnow().isoformat()
    data["received_ip"] = request.remote_addr
    records = json.loads(LOG_FILE.read_text(encoding="utf-8"))
    records.append(data)
    LOG_FILE.write_text(json.dumps(records, indent=2), encoding="utf-8")
    print(f"[+] {data.get('ip')} - {data.get('city')}, {data.get('country_name')}")
    return jsonify({"ok": True})

@app.route("/dashboard")
def dashboard():
    records = json.loads(LOG_FILE.read_text(encoding="utf-8"))
    return jsonify(records)

@app.route("/api/visitors")
def api_visitors():
    records = json.loads(LOG_FILE.read_text(encoding="utf-8"))
    return jsonify(records)

if __name__ == "__main__":
    print("=" * 60)
    print("  IP LOGGER SERVER")
    print("=" * 60)
    print(f"  Visit:   http://YOUR_VPS_IP:5000/")
    print(f"  Data:    http://YOUR_VPS_IP:5000/dashboard")
    print(f"  JSON:    http://YOUR_VPS_IP:5000/api/visitors")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=False)
