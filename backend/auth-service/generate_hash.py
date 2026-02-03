from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    bcrypt__rounds=12,
    deprecated="auto"
)

password = "Geemeth@32#"
hashed = pwd_context.hash(password)
print(hashed)
