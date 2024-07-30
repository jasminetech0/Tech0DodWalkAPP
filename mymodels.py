from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, LargeBinary
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship
from datetime import datetime

Base = declarative_base()

class Users(Base):
    __tablename__ = 'users'
    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    user_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=False)
    
    pets = relationship("PetsInfo", back_populates="owner")
    invitations_sent = relationship("Invitations", back_populates="sender")
    family_members = relationship("FamilyMembers", back_populates="user")

class PetsInfo(Base):
    __tablename__ = 'pets_info'
    pet_id: Mapped[str] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    pet_name: Mapped[str] = mapped_column()
    breed: Mapped[str] = mapped_column()
    sex: Mapped[str] = mapped_column()
    birthdate: Mapped[Date] = mapped_column(Date)
    image: Mapped[bytes] = mapped_column(LargeBinary)
    
    owner = relationship("Users", back_populates="pets")
    family_members = relationship("FamilyMembers", back_populates="pet")

class Invitations(Base):
    __tablename__ = 'invitations'
    invitation_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sender_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    recipient_email: Mapped[str] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(default="pending")
    sent_at: Mapped[DateTime] = mapped_column(DateTime, default=datetime.utcnow)
    
    sender = relationship("Users", back_populates="invitations_sent")

class FamilyMembers(Base):
    __tablename__ = 'family_members'
    family_member_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.user_id"))
    pet_id: Mapped[str] = mapped_column(ForeignKey("pets_info.pet_id"))
    
    user = relationship("Users", back_populates="family_members")
    pet = relationship("PetsInfo", back_populates="family_members")