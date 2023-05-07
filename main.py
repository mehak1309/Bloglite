from flask import Flask, render_template, request, redirect, send_file, make_response
from models import * 
from flask_restful import Api, marshal_with, Resource, reqparse, fields
from flask_sqlalchemy import SQLAlchemy
import datetime
from datetime import datetime, timedelta
from flask import current_app as app
import json
from flask_login import current_user, LoginManager
from flask import make_response, jsonify
from flask_security import auth_required, logout_user, login_user
import hashlib
import os
from flask_cors import CORS
from config import DevelopmentConfig
from celery_worker import make_celery
import time
import csv
from celery.result import AsyncResult
from celery.schedules import crontab
from json import dumps
import pdfkit
from flask_mail import Mail, Message
from httplib2 import Http
from werkzeug.datastructures import FileStorage
from flask_caching import Cache
from io import StringIO
from sqlalchemy import desc
import base64
from io import BytesIO

cache = Cache()
user_datastore = SQLAlchemyUserDatastore(db,Account,None)

app = Flask(__name__)
app.config.from_object(DevelopmentConfig)
db.init_app(app)
app.config['CACHE_TYPE'] = "simple"
cache.init_app(app)
# app.app_context().push()
api = Api(app)
security = Security(app, user_datastore)




#Mail
app.config['MAIL_SERVER']='smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USERNAME'] = 'email@gmail.com'
app.config['MAIL_PASSWORD'] = 'password'
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
mail = Mail(app)


#Celery
celery = make_celery(app)


celery.conf.beat_schedule = {
    'send_reminder': {
        'task': 'main.send_reminder',
        'schedule': crontab(hour=1, minute=4)
    },
    'generate_report': {
        'task': 'main.generate_report',
        # 'schedule': crontab(hour=0,minute=54)
        'schedule': crontab(0, 0, day_of_month='1') # Execute on the first day of every month.
    }
}


@celery.task()
def send_reminder():   
    all_users = Account.query.all()
    for user in all_users:
        u = UserPosts.query.filter_by(account_id=user.id).order_by(desc(UserPosts.timestamp)).first()
        if u:
            now = datetime.now()
            parsed_time = datetime.strptime(u.timestamp, "%Y-%m-%d %H:%M:%S.%f")
            # Check if the difference is more than 24 hours
            time_diff = now - parsed_time
            if time_diff > timedelta(hours=24):
                """Hangouts Chat incoming webhook quickstart."""
                url = 'https://chat.googleapis.com/v1/spaces/AAAAZmxDgK0/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=M-cyYxOkFwqhz-WdAPpUzGeFVYVLmH2unlUqu1eeXeE%3D'
                bot_message = {
                    'text': "Hello {name}, it appears that you haven't made a post in the past 24 hours. Please take a moment to create and share a new post with your followers. Thank you!".format(name=user.name)}
                message_headers = {'Content-Type': 'application/json; charset=UTF-8'}
                http_obj = Http()
                response = http_obj.request(
                    uri=url,
                    method='POST',
                    headers=message_headers,
                    body=dumps(bot_message),
                )
                print(response)
    return "Reminder will be sent shortly."



@celery.task()
def generate_csv(fields, rows):
    import csv
    with open("static/data.csv", 'w') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerow(fields)
        csvwriter.writerows(rows)
        return "Job Started..."




@celery.task()
def upload_csv(csv_data, current_user_id):
    csv_reader = csv.reader(StringIO(csv_data))
    next(csv_reader)
    for row in csv_reader:
        with app.app_context():
            user = Account.query.filter_by(fs_uniquifier=current_user_id).first()
            count = UserPosts.query.count()
            account_id_ = user.id
            print("account_id:",account_id_)
            post_name = f"{account_id_}_{count+1}.jpg"
            print(post_name)
            add_new_post = UserPosts(account_id=account_id_,
                                    title=row[0],
                                caption=row[1],
                                post_picture=post_name,
                                archive=False,
                                timestamp=datetime.now())
            
            #to save the default picture with the post_name
            default_pic_file = os.path.join(app.root_path, 'static', 'default.jpg')
            post_pic_file = FileStorage(stream=open(default_pic_file, 'rb'), filename=post_name)
            post_pic_file.save(os.path.join("static", "post_pics", post_name))
            
            db.session.add(add_new_post)
            db.session.commit()     
    return "Job Started..."
    


    
@celery.task()
def generate_report():
    # my_user = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
    all_users = Account.query.all()
    for u in all_users:
        my_user = Account.query.filter(Account.id==u.id).first()
        data1 = []
        data1.append({
                "id":my_user.id,
                "email":my_user.email.decode(),
                "name":my_user.name,
                "password":my_user.password,
                "profile_picture":my_user.profile_picture,
        })
            
        all_posts = UserPosts.query.filter(UserPosts.account_id==my_user.id)
        data2 = []
        for p in all_posts:
            print(my_user.email.decode())
            data2.append({
                    "email":my_user.email.decode(),   #decode as email was coded!
                    "id": p.id,
                    "account": p.account_id,
                    "title": p.title, 
                    "caption": p.caption, 
                    "post_picture": p.post_picture,
                    "archive": p.archive,
                    "timestamp": p.timestamp,    
            })
        
        following=[]
        follows = Follows.query.filter(Follows.account_id==my_user.id).all()
        for i in follows:
            account = Account.query.filter(Account.id==i.following_others).first()
            following.append(account.email)
        
        followers=[]
        follower=Follows.query.filter(Follows.following_others==my_user.id).all()
        for i in follower:
            account = Account.query.filter(Account.id==i.account_id).first()
            followers.append(account.email)
            
        #datetime    
        d = datetime.now()
        date = d.strftime("%B %d, %Y")
        
        with open('./static/user_profile_pics/' + data1[0]['profile_picture'], "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
        
        rendered = render_template("report.html", data2=data2, data1=data1, following=following, followers=followers, date=date, image_data=encoded_string)
        pdf=pdfkit.from_string(rendered, False) #convert html to pdf
        
        msg = Message("Bloglite: Your Monthly Report", sender="bloglite@gmail.com", recipients=["email1@gmail.com"])
        msg.attach("monthly_report.pdf", "application/pdf", pdf)
        msg.html = render_template("report(html).html", data2=data2, data1=data1, following=following, followers=followers, date=date, image_data=encoded_string)
        mail.send(msg)
        
            
    

    
#APIS

class celery_import_post(Resource):
    def post(self):
        id =current_user.get_id()
        csv_file = request.files['csv_file']
        csv_data = csv_file.read().decode('utf-8')
        a = upload_csv.delay(csv_data, id)
        return {
            "Task_ID": a.id,
            "Task_State": a.state,
            "Task_Result" : a.result
        }



class celery_export_post(Resource):
    def post(self):
        data={'title':request.form.get('title'),
              'caption':request.form.get('caption'),
              'timestamp':request.form.get('timestamp'),
              'image':request.form.get('post_picture'),
              'post_id':request.form.get('post_id'),
              'email':request.form.get('email'),
            }
        print(data)
        fields=["Email", "Title", "Caption", "Timestamp"]
        rows=[[data["email"], data["title"], data["caption"], data["timestamp"]]]
        a = generate_csv.delay(fields, rows)
        return {
            "Task_ID": a.id,
            "Task_State": a.state,
            "Task_Result" : a.result
        }

      

class check_status(Resource):
    def get(self, id):
        res = AsyncResult(id, app=celery)
        if res.state == 'SUCCESS':
            return {
                "Task_ID": res.id,
                "Task_State": res.state,
                "Task_Result": res.result
            }
        elif res.state == 'FAILURE':
            return {
                "Task_ID": res.id,
                "Task_State": res.state,
                "Task_Result": str(res.result)  # return string representation of the error message
            }
        else:
            return {
                "Task_ID": res.id,
                "Task_State": res.state,
                "Task_Result": None
            }



class download_file(Resource):
    def get(self):
        return send_file("static/data.csv")


class getallposts(Resource):
    @cache.cached(timeout=20)  #10 seconds
    def get(self):
        all_posts = UserPosts.query.all()
        data1 = []
        for p in all_posts:
            user1 = Account.query.filter(Account.id==p.account_id).first()
            data1.append({
                "email":user1.email.decode(),   #decode as email was coded!
                "id": p.id,
                "account": p.account_id,
                "title": p.title, 
                "caption": p.caption, 
                "post_picture": p.post_picture,
                "archive": p.archive,
                "timestamp": p.timestamp,
            })
        print(data1)
        return data1
        

class getallusers(Resource):
    @cache.cached(timeout=20) ######cached######
    def get(self):
        users = Account.query.all()
        data1 = []
        for u in users:
            data1.append({
                "id":u.id,
                "email":u.email.decode(),
                "name":u.name,
                "password":u.password,
                "profile_picture":u.profile_picture,
            })
        return data1


class getspecificuserdetails(Resource):
    def get(self, id):
        users = Account.query.filter(Account.id==id)
        data1 = []
        for u in users:
            data1.append({
                "id":u.id,
                "email":u.email.decode(),
                "name":u.name,
                "password":u.password,
                "profile_picture":u.profile_picture,
            })
        return data1
        


class getuserdetails(Resource):
    def get(self):
        my_user = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
        data1 = []
        data1.append({
            "id":my_user.id,
            "email":my_user.email.decode(),
            "name":my_user.name,
            "password":my_user.password,
            "profile_picture":my_user.profile_picture,
        })
        return data1


class delete_post(Resource):
    def delete(self, id):
        print("one")
        post1 = UserPosts.query.filter(UserPosts.id==id).first()
        try:
            print(post1)
            print(post1.caption)
            print(id)
            db.session.delete(post1)
            db.session.commit()
            return jsonify("post deleted")
        except:
            return jsonify("error occured")
    

            
class getmyposts(Resource):
    def get(self):
        my_user = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
        account_id_ = my_user.id
        all_posts = UserPosts.query.filter(UserPosts.account_id==account_id_)
        data1 = []
        for p in all_posts:
            data1.append({
                "email":my_user.email.decode(),   #decode as email was coded!
                "id": p.id,
                "account": p.account_id,
                "title": p.title, 
                "caption": p.caption, 
                "post_picture": p.post_picture,
                "archive": p.archive,
                "timestamp": p.timestamp,    
            })
        print(data1)
        return data1     




class getothersPosts(Resource):
    def get(self, id):
        my_user = Account.query.filter(Account.id==id).first()
        print("MYUSER", my_user)
        all_posts = UserPosts.query.filter(UserPosts.account_id==id)
        data1 = []
        for p in all_posts:
            data1.append({
                "email":my_user.email.decode(),   #decode as email was coded!
                "id": p.id,
                "account": p.account_id,
                "title": p.title, 
                "caption": p.caption, 
                "post_picture": p.post_picture,
                "archive": p.archive,
                "timestamp": p.timestamp,    
            })
        print(data1)
        return data1     

    
class signUp(Resource):
    def get(self):
        return redirect("/signup")
    def post(self):
        data={'profile_picture':request.files['profile_pic'],
              'email':request.form.get('email'),
              'password':request.form.get('password'),
              'name':request.form.get('name')}
        print(data)
        user_information = Account.query.filter(Account.email==data["email"].encode("utf-8")).first() #username not email! check login data defined in js
        print("USER", user_information)
        if user_information:
            return make_response(jsonify({"msg": "Try another email. Already exists."}),201)
        else:
            username_ = data['email'].encode('utf-8')
            image_name = data["email"]+"_image"+".jpg"
            add_new_user = Account(email=username_, ######username not email
                                   name=data["name"],
                                   password=data["password"],
                                   profile_picture=image_name,
                                   active=True,
                                   fs_uniquifier=hashlib.md5(username_).hexdigest()) ##username not email
            data['profile_picture'].save(os.path.join("static", "user_profile_pics", image_name))
            db.session.add(add_new_user)
            db.session.commit()
            
            #--------follow youself------------
            my_user = Account.query.filter_by(email=username_).first()
            my_account_id = my_user.id
            add_new_follower = Follows(account_id=my_account_id,
                                   following_others=my_account_id)
            db.session.add(add_new_follower)
            db.session.commit()
            return make_response(jsonify({"msg": "succesfully signed up!"}), 200)       



class logOut(Resource):
    @auth_required('token')
    def get(self):
        return make_response(jsonify({"msg":"successfully logged out!"}), 200)
        


class addPost(Resource):
    def get(self):
        return redirect('/#/add_post')
    def post(self):     
        data={
            "post_picture": request.files["post_picture"],
            "title": request.form.get("title"),
            "caption": request.form.get("caption"),
            "id": request.form.get("id"),
        }
        print(data)
        print("id:",current_user.get_id())
        row = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
        count = UserPosts.query.count()
        print(row)
        account_id_ = row.id
        print("account_id:",account_id_)
        post_name = f"{account_id_}_{count+1}.jpg"
        print(post_name)
        add_new_post = UserPosts(account_id=account_id_,
                                title=data["title"],
                               caption=data["caption"],
                               post_picture=post_name,
                               archive=False,
                               timestamp=datetime.now())
        data["post_picture"].save(os.path.join("static", "post_pics", post_name))
        db.session.add(add_new_post)
        db.session.commit()
        return make_response(jsonify({'msg':"added!"}),200)
    
    
    
    
class getfollowdetails(Resource):
    def get(self, id):
        if id=="currentuser":
            my_user = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
            iamfollowing = Follows.query.filter(Follows.account_id==my_user.id).all()
        else:
            my_user = Account.query.filter(Account.id==id).first()
            iamfollowing = Follows.query.filter(Follows.account_id==id).all()
            
        iamfollowinglist=[]
        print("HI",iamfollowing)
        followingme = Follows.query.filter(Follows.following_others==my_user.id)
        followingmelist=[]
        data1 = []
        
        for f in iamfollowing:
            user = Account.query.filter(Account.id==f.following_others).first()
            iamfollowinglist.append({"following_id":f.following_others,
                                     "email": user.email.decode(),
                                     "name": user.name,
                                     "profile_picture": user.profile_picture})
        for f in followingme:
            user = Account.query.filter(Account.id==f.account_id).first()
            followingmelist.append({"following_id":f.account_id,
                                     "email": user.email.decode(),
                                     "name": user.name,
                                     "profile_picture": user.profile_picture})
            
        data1.append({
            # "iamfollowing":iamfollowing[0].following_others,
            # "followingme":followingme[0].account_id,
            "theuser":my_user.id,
            "iamfollowing":iamfollowinglist,
            "followingme":followingmelist,
        })
        return data1
 
    
class addFollower(Resource):
    def post(self):
        data={
            "id": request.form.get("id"),
            "following": request.form.get("following"),
        }
        my_user = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
        my_account_id = my_user.id
        follow = Follows.query.filter(Follows.account_id==my_account_id, Follows.following_others==data["id"])
        print(follow.count())
        if follow.count()!=0:
            return make_response(jsonify({'msg':"already following user"}), 200)
        else:
            add_new_follower = Follows(account_id=my_account_id,
                                   following_others=data["id"])
            db.session.add(add_new_follower)
            db.session.commit()
            return make_response(jsonify({'msg':"following user"}), 200)
        
        
    
class addUnfollower(Resource):
    def delete(self):
        data={
            "id": request.form.get("id"),
            "following": request.form.get("following"),
        }
        try:
            my_user = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
            my_account_id = my_user.id
            unfollow_user = Follows.query.filter(Follows.account_id==my_account_id, Follows.following_others==data["id"]).first()
            db.session.delete(unfollow_user)
            db.session.commit()
            return make_response(jsonify({'msg':"unfollowed user"}), 200)
        except:
            return make_response(jsonify({"msg":"error occured"}))
    
    
class editPost(Resource):
    def post(self, id):  
        data={
            "post_picture": request.files["post_picture"],
            "title": request.form.get("title"),
            "caption": request.form.get("caption"),
        }
        user_post = UserPosts.query.filter(UserPosts.id==id).first()
        post_name = user_post.post_picture
        user_post.title = data["title"]
        user_post.caption = data["caption"]
        user_post.timestamp = datetime.now()
        data["post_picture"].save(os.path.join("static", "post_pics", post_name))
        db.session.commit()
        return make_response(jsonify({'msg':"post sucessfully updated!"}),200)



    
class editAccount(Resource):
    def put(self):  
        data={   
            "name1": request.form.get("name"),
            "password1": request.form.get("password"),
            "image1": request.files["image"],    
        }
        user_account = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
        profile_pic_name = user_account.profile_picture
        user_account.name = data["name1"]
        user_account.password = data["password1"]
        db.session.commit()
        data["image1"].save(os.path.join("static", "user_profile_pics", profile_pic_name))
        return make_response(jsonify({'msg':"account details sucessfully updated!"}),200)
    def delete(self):
        user_account = Account.query.filter_by(fs_uniquifier=current_user.get_id()).first()
        try:
            db.session.delete(user_account)
            db.session.commit()
            return jsonify("account deleted successfully!")
        except:
            return jsonify("error occured")
    
   
class update_archive(Resource):
    def post(self, id):  
        data={   
            "archive1": request.form.get("archive"), 
        }
        if data["archive1"]=="true":
            value=True
        else:
            value=False
        user_post = UserPosts.query.filter(UserPosts.id==id).first()
        user_post.archive = value
        db.session.commit()
        return make_response(jsonify({'msg':"post archive sucessfully updated!"}),200)
    
    
####api ends########



api.add_resource(signUp, '/api/signup')
api.add_resource(addPost, '/api/add_post')
api.add_resource(editAccount, '/api/edit_account')
api.add_resource(editPost, '/api/edit_post/<id>')
api.add_resource(logOut, '/api/logout')
api.add_resource(addFollower, '/api/follow_user')
api.add_resource(addUnfollower,"/api/unfollow_user")
api.add_resource(getfollowdetails, "/api/getfollowdetails/<id>")
api.add_resource(getmyposts, "/api/getmyposts")
api.add_resource(getallposts, "/api/getallposts")
api.add_resource(getspecificuserdetails, "/api/getspecificuserdetails/<id>")
api.add_resource(getothersPosts, "/api/getothersposts/<id>")
api.add_resource(getallusers,"/api/getallusersdetails")
api.add_resource(getuserdetails,"/api/getuserdetails")
api.add_resource(delete_post,"/api/deletepost/<id>")
api.add_resource(celery_export_post,"/api/celery_export_post")
api.add_resource(check_status,"/api/status/<id>")
api.add_resource(download_file,"/api/download-file")
api.add_resource(celery_import_post,"/api/celery_import_post")
api.add_resource(update_archive,"/api/update_archive/<id>")


@app.before_first_request
def create_db():
    db.create_all()

@app.get('/')
def home():
    return render_template("index.html")

if __name__=="__main__":
    app.run(debug=True)

