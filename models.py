from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, Security, SQLAlchemyUserDatastore


db = SQLAlchemy()

class Account(db.Model, UserMixin):
    __tablename__="account"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email=db.Column(db.String, nullable=False, unique=True)
    name=db.Column(db.String(128), nullable=False)
    password=db.Column(db.String(64), nullable=False)
    profile_picture=db.Column(db.String, nullable=True)
    active=db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(255), nullable=False, unique=True) 
    user_posts = db.relationship('UserPosts', cascade="all, delete-orphan")
    user_follows = db.relationship("Follows", cascade="all, delete-orphan")
    
class Follows(db.Model):
    __tablename__="follows"
    id =db.Column(db.Integer, primary_key=True, nullable=False, autoincrement=True)
    account_id=db.Column(db.String, db.ForeignKey("account.id"), nullable=False)
    following_others=db.Column(db.Integer)    
    account = db.relationship("Account", backref="follows")

class UserPosts(db.Model):
    __tablename__="userposts"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account_id=db.Column(db.String, db.ForeignKey("account.id"), nullable=False)
    title=db.Column(db.String(255), nullable=False)
    caption=db.Column(db.String, nullable=False)
    post_picture=db.Column(db.String, nullable=True)
    archive=db.Column(db.Boolean, nullable=False) 
    timestamp=db.Column(db.String, nullable=False)
    
