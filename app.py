from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# ===== البيانات المؤقتة =====
subscribers = []  # لتخزين الإيميلات
courses = [
    {"name": "Cybersecurity", "price": 100},
    {"name": "Backend Development", "price": 80},
    {"name": "Frontend Development", "price": 70},
    {"name": "Mobile Development", "price": 90},
    {"name": "Desktop Development", "price": 85},
    {"name": "AI Development", "price": 120}
]

# ===== الراوت الأساسي =====
@app.route("/")
def home():
    return jsonify({"status": "Server is running"})

# ===== إضافة مشترك جديد =====
@app.route("/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email is required"}), 400

    if email in subscribers:
        return jsonify({"message": "Email already subscribed"}), 200

    subscribers.append(email)
    return jsonify({"message": f"{email} added successfully"}), 201

# ===== عرض كل المشتركين =====
@app.route("/subscribers", methods=["GET"])
def get_subscribers():
    return jsonify({"subscribers": subscribers})

# ===== عرض الكورسات =====
@app.route("/courses", methods=["GET"])
def get_courses():
    return jsonify({"courses": courses})

# ===== إضافة كورس جديد =====
@app.route("/courses", methods=["POST"])
def add_course():
    data = request.get_json()
    name = data.get("name")
    price = data.get("price")

    if not name or not price:
        return jsonify({"error": "Course name and price are required"}), 400

    courses.append({"name": name, "price": price})
    return jsonify({"message": f"Course {name} added successfully"}), 201

if __name__ == "__main__":
    app.run(debug=True)
