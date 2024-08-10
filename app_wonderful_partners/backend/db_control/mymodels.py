from sqlalchemy import ForeignKey, Integer, String, Date, Text, Column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = 'user'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    image: Mapped[str] = mapped_column(Text)

class Family(Base):
    __tablename__ = 'family'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

class UserFamily(Base):
    __tablename__ = 'user_family'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user.id'), nullable=False)
    family_id: Mapped[int] = mapped_column(Integer, ForeignKey('family.id'), nullable=False)
    user = relationship('User', back_populates='user_families')
    family = relationship('Family', back_populates='user_families')

class Pet(Base):
    __tablename__ = 'pet'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    breed: Mapped[str] = mapped_column(String(50))
    gender: Mapped[str] = mapped_column(String(10))
    birthdate: Mapped[Date] = mapped_column(Date)
    image: Mapped[str] = mapped_column(Text)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey('user.id'), nullable=False)
    family_id: Mapped[int] = mapped_column(Integer, ForeignKey('family.id'), nullable=True)
    user = relationship('User', back_populates='pets')
    family = relationship('Family', back_populates='pets')

class Invitation(Base):
    __tablename__ = 'invitation'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inviter_id: Mapped[int] = mapped_column(Integer, ForeignKey('user.id'), nullable=False)
    invitee_email: Mapped[str] = mapped_column(String(100), nullable=False)
    family_id: Mapped[int] = mapped_column(Integer, ForeignKey('family.id'), nullable=False)
    status: Mapped[str] = mapped_column(String(20), default='pending')
    inviter = relationship('User', back_populates='invitations')
    family = relationship('Family', back_populates='invitations')

class CareTask(Base):
    __tablename__ = 'caretask_table'

    caretask_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('user.id'), nullable=False)  # 外部キー
    date = Column(Date, nullable=False)
    task_name = Column(String(100), nullable=False)
    status = Column(String(20), default='pending')  # デフォルトは未完了
    created_at = Column(DateTime, default=datetime.utcnow)  # 自動生成される作成日時
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)  # 自動更新される更新日時

    def __init__(self, user_id, date, task_name):
        self.user_id = user_id
        self.date = date
        self.task_name = task_name







User.user_families = relationship('UserFamily', back_populates='user')
Family.user_families = relationship('UserFamily', back_populates='family')
Family.pets = relationship('Pet', back_populates='family')
User.invitations = relationship('Invitation', back_populates='inviter')
Family.invitations = relationship('Invitation', back_populates='family')
User.pets = relationship('Pet', back_populates='user')