from flask import Flask, request, jsonify
import pyodbc
from flask_cors import CORS

app = Flask(__name__)

# ✅ CORS only once (correct place)
CORS(app, origins=["http://localhost:5173"])

def get_connection():
    return pyodbc.connect(
        'DRIVER={SQL Server};'
        'SERVER=WINDOWS\\SQLWINDOWS;'
        'DATABASE=FYP___I;'
        'Trusted_Connection=yes;'
    )


# ---------------- LOGIN API ----------------
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password_hash')

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password required"
        }), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT user_id, full_name, role
            FROM USERS
            WHERE email = ?
              AND password_hash = ?
              AND is_active = 1
        """, (email, password))

        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 200

        return jsonify({
            "success": True,
            "user_id": user[0],
            "name": user[1],
            "role": user[2]
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# ---------------- GET TEACHER ID ----------------
@app.route("/get_teacher_id", methods=["POST"])
def get_teacher_id():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "Missing user_id"}), 400

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT teacher_id
            FROM TEACHER
            WHERE user_id = ?
        """, (user_id,))

        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if row:
            return jsonify({"success": True, "teacher_id": row[0]})
        else:
            return jsonify({"success": False, "message": "Teacher not found"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------- RUN APP ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=1000, debug=True)