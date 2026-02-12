
# Required Libraries: flask, flask-cors, opencv-python, face-recognition, numpy
from flask import Flask, request, jsonify
from flask_cors import CORS
import face_recognition
import numpy as np
import base64
import cv2

app = Flask(__name__)
CORS(app)

# In-memory storage of encodings (In production, load from MongoDB)
known_face_encodings = []
known_face_ids = []

@app.route('/recognize', methods=['POST'])
def recognize():
    data = request.json
    img_data = base64.b64decode(data['image'])
    nparr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Find faces and encodings in uploaded image
    face_locations = face_recognition.face_locations(img)
    face_encodings = face_recognition.face_encodings(img, face_locations)

    if not face_encodings:
        return jsonify({"status": "failed", "message": "No face detected"}), 400

    # Compare with known encodings
    results = []
    for face_encoding in face_encodings:
        matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
        face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
        best_match_index = np.argmin(face_distances)
        
        if matches[best_match_index]:
            student_id = known_face_ids[best_match_index]
            confidence = 1 - face_distances[best_match_index]
            results.append({"id": student_id, "confidence": float(confidence)})

    return jsonify({"status": "success", "matches": results})

if __name__ == '__main__':
    app.run(port=5001)
