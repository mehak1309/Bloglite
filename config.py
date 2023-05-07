class Config(object):
    SQLALCHEMY_DATABASE_URI = "sqlite:///final_bloglite.db"
    SECRET_KEY = "thisisasecretkey"
    SECURITY_PASSWORD_SALT = "thisissaltt"
    SQLALCHEMY_TRACK_MODIFICATIONS= False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = 'Authentication-Token'
    # SESSION_COOKIE_SECURE = 
    # REMEMBER_COOKIE_SECURE = True
        
class DevelopmentConfig(Config):
    DEBUG=True