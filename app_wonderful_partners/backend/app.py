from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from PIL import Image, ImageOps
from mymodels import CareTask, db
import os
import json
import base64
import openai
import requests


app = Flask(__name__)
CORS(app)  # CORSを有効にする
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pets.db'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'  # JWTのシークレットキーを設定

db = SQLAlchemy(app)
jwt = JWTManager(app)

# OpenAI APIキーを設定
openai.api_key = 'your API key'

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

def convert_image_to_square_png(image_path):
    try:
        print(f"Opening image: {image_path}")
        image = Image.open(image_path)
        print(f"Original image size: {image.size}")
        image = ImageOps.fit(image, (min(image.size), min(image.size)), Image.Resampling.LANCZOS)
        print(f"Converted to square: {image.size}")
        image = image.convert("RGBA")
        png_path = image_path.rsplit('.', 1)[0] + '.png'
        image.save(png_path, format='PNG')
        print(f"Saved as PNG: {png_path}")
        while os.path.getsize(png_path) > 4 * 1024 * 1024:
            print(f"Resizing image, current size: {os.path.getsize(png_path)} bytes")
            image = image.resize((int(image.width * 0.9), int(image.height * 0.9)), Image.Resampling.LANCZOS)
            image.save(png_path, format='PNG')
        print(f"Final PNG size: {os.path.getsize(png_path)} bytes")
        return png_path
    except Exception as e:
        print(f"Error converting image to square PNG: {e}")
        return None

def generate_avatar_with_openai(image_path):
    try:
        square_png_image_path = convert_image_to_square_png(image_path)
        if square_png_image_path is None:
            raise Exception("Failed to convert image to square PNG.")
        with open(square_png_image_path, "rb") as image_file:
            encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
        print(f"Encoded image size: {len(encoded_image)} bytes")
        response = openai.Image.create_edit(
            image=open("uploads/pet_0_img_main.png", "rb"),
            prompt="アバターを作成してください。",
            n=1,
            size="256x256"
        )
        print(f"OpenAI API response: {response}")
        if 'data' in response and response['data']:
            image_data = response['data'][0]['url']
            avatar_path = os.path.join(app.config['UPLOAD_FOLDER'], 'avatar_' + os.path.basename(image_path))
            avatar_image = requests.get(image_data)
            if avatar_image.status_code == 200:
                with open(avatar_path, 'wb') as f:
                    f.write(avatar_image.content)
                return avatar_path
            else:
                raise Exception(f"Failed to download avatar image. Status code: {avatar_image.status_code}")
        else:
            raise Exception("No data found in OpenAI API response.")
    except Exception as e:
        print(f"Error generating avatar with OpenAI: {e}")
        return None

@app.route('/register', methods=['POST'])
def register():
    user_data = json.loads(request.form['user'])
    print("User Data:", user_data)
    existing_user = User.query.filter_by(email=user_data['email']).first()
    if existing_user:
        return jsonify({"message": "Email already exists!"}), 400
    user = User(name=user_data['name'], email=user_data['email'], password=user_data['password'])
    db.session.add(user)
    db.session.commit()
    avatars = []
    print("Form Keys:", list(request.form.keys()))
    pet_keys = [key for key in request.form.keys() if key.startswith('pet_') and key.endswith('_name')]
    for index, key in enumerate(pet_keys):
        pet_data = {
            'name': request.form[f'pet_{index}_name'],
            'type': request.form[f'pet_{index}_type'],
            'gender': request.form[f'pet_{index}_gender'],
            'birthdate': request.form[f'pet_{index}_birthdate'],
        }
        print("Pet Data:", pet_data)
        image = request.files[f'pet_image_{index}']
        if image.filename == '':
            return jsonify({"message": "No selected file"}), 400
        if not os.path.exists(app.config['UPLOAD_FOLDER']):
            os.makedirs(app.config['UPLOAD_FOLDER'])
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], f'pet_{index}_{image.filename}')
        image.save(image_path)
        pet = Pet(
            name=pet_data['name'],
            type=pet_data['type'],
            gender=pet_data['gender'],
            birthdate=pet_data['birthdate'],
            user_id=user.id,
            image_path=image_path
        )
        db.session.add(pet)
        db.session.commit()
        try:
            pet.avatar_path = generate_avatar_with_openai(image_path)
            if pet.avatar_path is not None:
                db.session.commit()
                avatars.append(pet.avatar_path)
            else:
                print("Avatar path is None")
                return jsonify({"message": "Failed to generate avatar."}), 500
        except Exception as e:
            print(f"Error: {e}")
            return jsonify({"message": str(e)}), 500
    return jsonify({"message": "Registration successful!", "avatars": avatars})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    user = User.query.filter_by(email=email).first()
    if user and user.password == password:
        access_token = create_access_token(identity=user.id)
        return jsonify(access_token=access_token), 200
    return jsonify({"message": "Invalid email or password"}), 401

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(logged_in_as=user.email), 200

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# /api/tasks エンドポイントの作成（ユーザーがカレンダーで"登録"ボタンを押すと、世話を予約できる)
@app.route('/api/caretasks', methods=['POST'])
def create_caretask():
    data = request.json  # フロントエンドから送られたJSONデータを取得
    
    user_id = data['user_id']
    date = data['date']
    tasks = data['tasks']  # ここで、複数のタスクがリスト形式で送られてくることを想定

    # 各タスクをデータベースに保存
    for task_name in tasks:
        new_task = CareTask(user_id=user_id, date=date, task_name=task_name)
        db.session.add(new_task)
    db.session.commit()  # データをデータベースにコミットして保存

    return jsonify({"message": "CareTask registered successfully!"}), 200

if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)
