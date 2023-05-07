from celery import Celery
from celery.schedules import crontab

def make_celery(app):
    celery = Celery(
        "main",
        backend="redis://127.0.0.1:6379/2",
        broker="redis://127.0.0.1:6379/1",
        enable_utc = False,
        timezone = 'Asia/Kolkata',
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery














# from celery import Celery
# cel_app = Celery('tasks', broker='redis://localhost:6379/1') #modeule name:workers, broker:where task will be posted

# @cel_app.task
# def add(x,y):
#     return x+y #this task will run asynchronously.s



#celery -A tasks


#redis-cli 
#redis-server
#use redis as a broker
#/venv/bin/activate (virtual enviroment)
#pip freeze 

#redis stores data as key value..data is stored in RAM so extremely fast