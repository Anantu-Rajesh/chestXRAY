import bcrypt

def hash_passwd(org_passwd):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(org_passwd.encode('utf-8'), salt).decode('utf-8')

def verify_passwd(org_passwd, hashed_passwd):
    return bcrypt.checkpw(org_passwd.encode('utf-8'), hashed_passwd.encode('utf-8'))