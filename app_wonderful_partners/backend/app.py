from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from PIL import Image, ImageOps
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
from dotenv import load_dotenv
from db_control.mymodels import db, User, Pet, Family, Invitation, UserFamily, PetRecord, CareTask
import os
import json
import base64
import openai
import requests


app = Flask(__name__)


CORS(app) # CORSを有効にする

# 現在のスクリプトのディレクトリから .env ファイルへの相対パスを指定
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')

# .env ファイルをロード
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv("OPENAI_API_KEY").strip()
print(f"API Key: {api_key}")

# JWTシークレットキー
import os

basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'db_control/WP.db')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + db_path

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.urandom(24)
app.config['JWT_SECRET_KEY'] = app.config['SECRET_KEY']
app.config['JWT_TOKEN_LOCATION'] = ['headers']  # トークンの場所をヘッダーに設定
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=30)  # トークンの有効期限を設定
app.config['UPLOAD_FOLDER'] = 'uploads'

# データベースをアプリケーションに紐付ける
db.init_app(app)
migrate = Migrate(app, db)

jwt = JWTManager(app)

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

@app.route('/pets/<int:pet_id>/record', methods=['POST'])
@jwt_required()
def add_pet_record(pet_id):
    user_id = get_jwt_identity()

    data = request.json
    print('Received data:', data)  # デバッグ用のログ

    pet = Pet.query.get_or_404(pet_id)

    if pet.user_id != user_id and not any(uf.family_id == pet.family_id for uf in UserFamily.query.filter_by(user_id=user_id).all()):
        return jsonify({"message": "You do not have permission to add a record for this pet"}), 403

    weight = data.get('weight')
    if weight == '':
        weight = None
    else:
        weight = float(weight)

    record = PetRecord(
        pet_id=pet_id,
        user_id=user_id,
        food_amount=data.get('foodAmount'),
        food_memo=data.get('foodMemo'),
        poop_amount=data.get('poopAmount'),
        poop_consistency=data.get('poopConsistency'),
        poop_memo=data.get('poopMemo'),
        pee_amount=data.get('peeAmount'),
        pee_memo=data.get('peeMemo'),
        weight=weight,
        weight_memo=data.get('weightMemo'),
        other_memo=data.get('otherMemo'),
        created_at=data.get('createdAt') if data.get('createdAt') else None
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

@app.route('/pets/<int:pet_id>', methods=['GET'])
@jwt_required()
def get_pet_details(pet_id):
    print(f"Fetching details for pet_id: {pet_id}")  # デバッグ用のログ
    pet = Pet.query.get_or_404(pet_id)
    owner = User.query.get(pet.user_id)
    
    print(f"Owner: {owner.username}, Pet: {pet.name}")  # デバッグ用のログ

    return jsonify({
        "username": owner.username,
        "petName": pet.name
    }), 200


@app.route('/pets/<int:pet_id>/least_records', methods=['GET'])
@jwt_required()
def get_least_records_user(pet_id):
    user_id = get_jwt_identity()

    pet = Pet.query.get_or_404(pet_id)

    family_id = pet.family_id
    family_members = UserFamily.query.filter_by(family_id=family_id).all()

    record_counts = {}
    for member in family_members:
        # 記録がない場合は 0 にする
        member_record_count = PetRecord.query.filter_by(pet_id=pet_id, user_id=member.user_id).count() or 0
        record_counts[member.user_id] = member_record_count

    # 記録が最も少ないユーザーを特定
    least_active_user_id = min(record_counts, key=record_counts.get)
    least_active_user = User.query.get(least_active_user_id)

    return {
        "least_active_user_id": least_active_user.id,
        "least_active_username": least_active_user.username,
        "record_count": record_counts[least_active_user_id]
    }, 200


@app.route('/pets/<int:pet_id>/invite_walk', methods=['POST'])
@jwt_required()
def invite_least_active_member_for_walk(pet_id):
    user_id = get_jwt_identity()

    # get_least_records_user の結果を取得
    response, status_code = get_least_records_user(pet_id)
    data = response  # response は JSON データの辞書

    least_active_username = data['least_active_username']
    pet = Pet.query.get_or_404(pet_id)

    print(f'Least active user: {least_active_username}')  # デバッグ用のログ
    print(f'Pet name: {pet.name}')  # デバッグ用のログ

    # OpenAI API を使用して散歩のお誘い文を生成
    prompt = f"{least_active_username}さんに散歩のお誘いをしてください。"
    
    openai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo-0125",
        messages=[
            {"role": "system", "content": f"あなたは犬の{pet.name}です。"},
            {"role": "user", "content": prompt},
        ]
    )

    invitation_message = openai_response.choices[0].message['content']

    print(f'Generated message: {invitation_message}')  # デバッグ用のログ

    return jsonify({
        "message": invitation_message,
        "least_active_username": least_active_username  # この部分を追加
    }), 200





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
