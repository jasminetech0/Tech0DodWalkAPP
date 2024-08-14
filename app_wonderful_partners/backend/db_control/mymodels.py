from sqlalchemy import ForeignKey, Integer, String, Date, create_engine, Text, Column
from datetime import datetime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy


app = Flask(__name__)
# データベースの設定
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///WP.db'  # SQLite データベースファイルのパス
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 変更追跡を無効化（推奨設定）
app.config['UPLOAD_FOLDER'] = 'uploads'

# SQLAlchemy の初期化
db = SQLAlchemy(app)


# ユーザーモデル
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    image = db.Column(db.Text)
    families = db.relationship('UserFamily', backref='user', lazy=True)
    pets = db.relationship('Pet', backref='owner', lazy=True)


# 家族モデル
class Family(db.Model):
    __tablename__ = 'family'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    users = db.relationship('UserFamily', backref='family', lazy=True)
    pets = db.relationship('Pet', backref='family', lazy=True)


# ユーザーと家族の中間テーブル
class UserFamily(db.Model):
    __tablename__ = 'user_family'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=False)



# ペットモデル
class Pet(db.Model):
    __tablename__ = 'pet'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(50))
    gender = db.Column(db.String(10))
    birthdate = db.Column(db.Date)
    image = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=True)  # family_id カラムを追加



# 招待モデル
class Invitation(db.Model):
    __tablename__ = 'invitation'
    id = db.Column(db.Integer, primary_key=True)
    inviter_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    invitee_email = db.Column(db.String(100), nullable=False)
    family_id = db.Column(db.Integer, db.ForeignKey('family.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')
    inviter = db.relationship('User', backref='invitations', lazy=True)
    family = db.relationship('Family', backref='invitations', lazy=True)


# ペットレコード
class PetRecord(db.Model):
    __tablename__ = 'pet_record'
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


class CareTask(db.Model):
    __tablename__ = 'caretask_table'

    caretask_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # 外部キー
    date = db.Column(db.Date, nullable=False)
    task_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(20), default='pending')  # デフォルトは未完了
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # 自動生成される作成日時
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 自動更新される更新日時

    def __init__(self, user_id, date, task_name):
        self.user_id = user_id
        self.date = date
        self.task_name = task_name




# テーブルを作成するための関数
def create_tables():
    with app.app_context():
        db.create_all()  # テーブルを作成

# メインブロック
if __name__ == "__main__":
    create_tables()  # アプリケーション起動前にテーブルを作成
    app.run(debug=True)
