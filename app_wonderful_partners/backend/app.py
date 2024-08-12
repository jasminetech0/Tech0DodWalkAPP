from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from PIL import Image, ImageOps
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import json
import base64
import openai
import requests


app = Flask(__name__)
CORS(app)
 # CORSを有効にする

# 相対パスを絶対パスに変換
load_dotenv(dotenv_path='C:/Users/jiebing/Desktop/DogWalk/app_wonderful_partners/backend/.env')

api_key = os.getenv("OPENAI_API_KEY").strip()
print(f"API Key: {api_key}")


# ★みぞっち：新しく追加するホームエンドポイント
#@app.route('/')
#def home():
#    return "Welcome to the Home Page!"

# JWTシークレットキー
app.config['SECRET_KEY'] = os.urandom(24)
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
app.config['JWT_TOKEN_LOCATION'] = ['headers']  # トークンの場所をヘッダーに設定
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)  # トークンの有効期限を設定

jwt = JWTManager(app)

# DB設定
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'db_control/WP.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

app.config['UPLOAD_FOLDER'] = 'uploads'

# ユーザーモデル
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    image = db.Column(db.Text)
    families = db.relationship('UserFamily', backref='user', lazy=True)
    pets = db.relationship('Pet', backref='owner', lazy=True)

# ペットモデル
class Pet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(50))
    gender = db.Column(db.String(10))
    birthdate = db.Column(db.Date)
    image = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=True)  # family_id カラムを追加
    
# 家族モデル
class Family(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    users = db.relationship('UserFamily', backref='family', lazy=True)
    pets = db.relationship('Pet', backref='family', lazy=True)

# ユーザーと家族の中間テーブル
class UserFamily(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=False)

# 招待モデル
class Invitation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    inviter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    invitee_email = db.Column(db.String(100), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')

    inviter = db.relationship('User', backref='invitations', lazy=True)
    family = db.relationship('Family', backref='invitations', lazy=True)

# ペットレコード
class PetRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pet_id = db.Column(db.Integer, db.ForeignKey('pet.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    food_amount = db.Column(db.String(50), nullable=True)
    food_memo = db.Column(db.Text, nullable=True)
    poop_amount = db.Column(db.String(50), nullable=True)
    poop_consistency = db.Column(db.String(50), nullable=True)
    poop_memo = db.Column(db.Text, nullable=True)
    pee_amount = db.Column(db.String(50), nullable=True)
    pee_memo = db.Column(db.Text, nullable=True)
    weight = db.Column(db.Float, nullable=True)
    weight_memo = db.Column(db.Text, nullable=True)
    other_memo = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    pet = db.relationship('Pet', backref='records', lazy=True)
    user = db.relationship('User', backref='records', lazy=True)


with app.app_context():
    db.create_all()

# JWTトークンの生成
def create_jwt_token(user_id):
    return create_access_token(identity=user_id)

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
    data = request.form
    files = request.files
    
    user_image = files.get('image')
    if user_image:
        user_image_filename = secure_filename(user_image.filename)
        user_image_path = os.path.join(app.config['UPLOAD_FOLDER'], user_image_filename)
        user_image.save(user_image_path)
    else:
        user_image_path = None

    hashed_password = generate_password_hash(data.get('password'), method='pbkdf2:sha256')

    user = User(
        username=data.get('username'),
        email=data.get('email'),
        password=hashed_password,
        image=user_image_path
    )
    db.session.add(user)
    db.session.commit()

    for i in range(int(data.get('pet_count', 0))):
        pet_image = files.get(f'pets[{i}][image]')
        if pet_image:
            pet_image_filename = secure_filename(pet_image.filename)
            pet_image_path = os.path.join(app.config['UPLOAD_FOLDER'], pet_image_filename)
            pet_image.save(pet_image_path)
        else:
            pet_image_path = None

        birthdate_str = data.get(f'pets[{i}][birthdate]')
        birthdate = datetime.strptime(birthdate_str, '%Y-%m-%d').date() if birthdate_str else None

        pet = Pet(
            name=data.get(f'pets[{i}][name]'),
            breed=data.get(f'pets[{i}][breed]'),
            gender=data.get(f'pets[{i}][gender]'),
            birthdate=birthdate,
            image=pet_image_path,
            user_id=user.id
        )
        db.session.add(pet)
    db.session.commit()

    token = create_jwt_token(user.id)
    return jsonify({"message": "User and pets registered successfully!", "token": token}), 201

@app.route('/invite_family', methods=['POST'])
@jwt_required()
def invite_family():
    user_id = get_jwt_identity()

    try:
        data = request.json
        family = Family(name=data.get('family_name'))
        db.session.add(family)
        db.session.commit()

        for email in data.get('emails', []):
            invitation = Invitation(
                inviter_id=user_id,
                invitee_email=email,
                family_id=family.id,
                status='pending'
            )
            db.session.add(invitation)
        
        db.session.commit()
        return jsonify({"message": "Invitations created successfully!"}), 201
    except Exception as e:
        return jsonify({"message": "Failed to create invitations due to an internal error.", "error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and check_password_hash(user.password, password):
        token = create_jwt_token(user.id)

        user_families = UserFamily.query.filter_by(user_id=user.id).all()
        family_ids = [uf.family_id for uf in user_families]
        pets = Pet.query.filter(Pet.family_id.in_(family_ids)).all()
        pet_data = [{"id": pet.id, "name": pet.name, "family_id": pet.family_id} for pet in pets]

        return jsonify({"message": "Login successful", "token": token, "pets": pet_data}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route('/pets', methods=['GET'])
@jwt_required()
def get_pets():
    user_id = get_jwt_identity()

    user_families = UserFamily.query.filter_by(user_id=user_id).all()
    family_ids = [uf.family_id for uf in user_families]

    pets = Pet.query.filter(Pet.family_id.in_(family_ids)).all()
    pet_data = [{"id": pet.id, "name": pet.name, "family_id": pet.family_id} for pet in pets]

    return jsonify({"pets": pet_data}), 200

@app.route('/pets/<int:pet_id>', methods=['GET'])
@jwt_required()
def get_pet_details(pet_id):
    pet = Pet.query.get_or_404(pet_id)
    pet_data = {"id": pet.id, "name": pet.name, "breed": pet.breed, "gender": pet.gender, "birthdate": pet.birthdate}

    return jsonify(pet_data), 200

@app.route('/pets/<int:pet_id>/record', methods=['POST'])
@jwt_required()
def add_pet_record(pet_id):
    user_id = get_jwt_identity()
    
    data = request.json

    pet = Pet.query.get_or_404(pet_id)

    if pet.user_id != user_id and not any(uf.family_id == pet.family_id for uf in UserFamily.query.filter_by(user_id=user_id).all()):
        return jsonify({"message": "You do not have permission to add a record for this pet"}), 403

    # 空の文字列を None に変換する処理
    weight = data.get('weight')
    if weight == '':
        weight = None
    else:
        weight = float(weight)  # 数値の場合は float に変換

    record = PetRecord(
        pet_id=pet_id,
        user_id=user_id,
        food_amount=data.get('food_amount'),
        food_memo=data.get('food_memo'),
        poop_amount=data.get('poop_amount'),
        poop_consistency=data.get('poop_consistency'),
        poop_memo=data.get('poop_memo'),
        pee_amount=data.get('pee_amount'),
        pee_memo=data.get('pee_memo'),
        weight=weight,
        weight_memo=data.get('weight_memo'),
        other_memo=data.get('other_memo')
    )

    db.session.add(record)
    db.session.commit()

    return jsonify({"message": "Pet record added successfully!"}), 201

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


@app.route('/api/chats', methods=['POST'])
def chat():
    message = request.get_json()  # クライアントからのJSONデータを取得
    
    

    # ChatGPT APIにメッセージを送信して応答を取得
    response = openai.ChatCompletion.create( 
        model="gpt-3.5-turbo-0125",  # 安価なモデルを指定
        messages=[
            {"role": "system", "content": "あなたは犬のマシューです。"},
            {"role": "user", "content": message}
        ],
        max_tokens=50
    )

    reply = response['choices'][0]['message']['content'].strip()

    # 返答の文字数を制限（例: 100文字）
    max_length = 100
    if len(reply) > max_length:
        reply = reply[:max_length] + "..."  # 切り詰めて末尾に "..." を追加

    return jsonify({'reply': reply})

  


@app.route('/')
def sample():
    return "dog"


    
if __name__ == '__main__':
    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])
    app.run(debug=True)
