from tessera import app, db

def init():
    db.create_all()

def run():
    app.run(host='0.0.0.0')
