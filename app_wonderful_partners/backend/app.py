from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from PIL import Image
import os
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pets.db'
app.config['UPLOAD_FOLDER'] = 'uploads'

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)

class Pet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    birthdate = db.Column(db.String(10), nullable=False)
    image_path = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    avatar_path = db.Column(db.String(120), nullable=True)

with app.app_context():
    db.create_all()

def generate_avatar(image_path):
    image = Image.open(image_path)
    avatar = image.resize((128, 128))
    avatar_path = os.path.join(app.config['UPLOAD_FOLDER'], 'avatar_' + os.path.basename(image_path))
    avatar.save(avatar_path)
    return avatar_path

@app.route('/register', methods=['POST'])
def register():
    user_data = json.loads(request.form['user'])
    print("User Data:", user_data)  # ログ出力

    # メールアドレスの重複をチェック
    existing_user = User.query.filter_by(email=user_data['email']).first()
    if existing_user:
        return jsonify({"message": "Email already exists!"}), 400
    
    user = User(name=user_data['name'], email=user_data['email'], password=user_data['password'])
    db.session.add(user)
    db.session.commit()

    avatars = []
    print("Form Keys:", list(request.form.keys()))  # フォームキーのログ出力
    pet_keys = [key for key in request.form.keys() if key.startswith('pet_') and key.endswith('_name')]
    for index, key in enumerate(pet_keys):
        pet_data = {
            'name': request.form[f'pet_{index}_name'],
            'type': request.form[f'pet_{index}_type'],
            'gender': request.form[f'pet_{index}_gender'],
            'birthdate': request.form[f'pet_{index}_birthdate'],
        }
        print("Pet Data:", pet_data)  # ログ出力
        pet = Pet(
            name=pet_data['name'],
            type=pet_data['type'],
            gender=pet_data['gender'],
            birthdate=pet_data['birthdate'],
            user_id=user.id,
            image_path=None
        )
        db.session.add(pet)
        db.session.commit()
        image = request.files[f'pet_image_{index}']
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], f'pet_{pet.id}.jpg')
        image.save(image_path)
        pet.image_path = image_path
        pet.avatar_path = generate_avatar(image_path)
        db.session.commit()
        avatars.append(pet.avatar_path)

    return jsonify({"message": "Registration successful!", "avatars": avatars})

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run(debug=True)
