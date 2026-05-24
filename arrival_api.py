from flask import Flask, request, jsonify
from datetime import datetime
import pyodbc
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def get_connection():
    return pyodbc.connect(
        'DRIVER={ODBC Driver 17 for SQL Server};'
        'SERVER=WINDOWS\\SQLWINDOWS;'
        'DATABASE=FYP___I;'
        'Trusted_Connection=yes;'
    )

@app.route("/arrival_info", methods=["POST", "OPTIONS"])
def arrival_info():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    data = request.get_json()
    tid  = data.get("teacher_id")

    if not tid:
        return jsonify({"error": "teacher_id required"}), 400

    try:
        conn   = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT user_id FROM TEACHER WHERE teacher_id = ?", (tid,))
        row = cursor.fetchone()

        if not row:
            return jsonify({"error": "Invalid teacher_id"}), 404

        user_id = row[0]

        cursor.execute("""
            SELECT a.id,
                   a.attendance_date,
                   a.status,
                   l.time_in,
                   l.time_out
            FROM TEACHER_ATTENDANCE a
            LEFT JOIN TEACHER_ATTENDANCE_LOG l
                   ON a.id = l.attendance_id
            WHERE a.user_id = ?
            ORDER BY a.attendance_date DESC, l.time_in ASC
        """, (user_id,))

        rows   = cursor.fetchall()
        result = {}
        weekly_total = 0

        for r in rows:
            if not r.attendance_date:
                continue

            date_raw = r.attendance_date

            if isinstance(date_raw, datetime):
                date_obj = date_raw
            else:
                try:
                    date_obj = datetime.strptime(str(date_raw).split(" ")[0], "%Y-%m-%d")
                except:
                    continue

            date     = date_obj.strftime("%Y-%m-%d")
            day_name = date_obj.strftime("%A")

            if date not in result:
                result[date] = {
                    "day":      day_name,
                    "status":   r.status,
                    "timeline": [],
                    "hours":    0
                }

            if r.time_in:
                try:
                    time_in = r.time_in.strftime("%H:%M")
                except:
                    time_in = str(r.time_in)

                time_out = None
                if r.time_out:
                    try:
                        time_out = r.time_out.strftime("%H:%M")
                    except:
                        time_out = str(r.time_out)

                result[date]["timeline"].append({"in": time_in, "out": time_out})

                if r.time_out:
                    try:
                        diff = (r.time_out - r.time_in).total_seconds() / 3600
                        result[date]["hours"] += round(diff, 2)
                    except:
                        pass

        for d in result:
            if result[d]["day"] in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]:
                weekly_total += result[d]["hours"]

        conn.close()

        return jsonify({
            "teacher_id":   tid,
            "arrival_info": result,
            "weekly_hours": round(weekly_total, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=21000, debug=True)