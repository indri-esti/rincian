from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date
import hashlib
import secrets

from database import engine, Base, get_db
import models


app = FastAPI(title="Rincian API")


# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://rincian-one.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# DATABASE
# =========================

Base.metadata.create_all(bind=engine)


# =========================
# SCHEMA REGISTER
# =========================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


# =========================
# SCHEMA LOGIN
# =========================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =========================
# SCHEMA PROFILE
# =========================

class ProfileUpdateRequest(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None


# =========================
# SCHEMA PENGELUARAN
# =========================

class PengeluaranRequest(BaseModel):
    user_id: int
    title: str
    amount: float
    category: str
    description: Optional[str] = ""
    date: date


# =========================
# PASSWORD HASH
# =========================

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    )

    return f"{salt}${password_hash.hex()}"


def verify_password(
    password: str,
    stored_password: str
) -> bool:
    try:
        salt, stored_hash = stored_password.split("$", 1)

        password_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        )

        return secrets.compare_digest(
            password_hash.hex(),
            stored_hash
        )

    except (ValueError, AttributeError):
        return False


# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "message": "Rincian API berhasil berjalan"
    }


# =========================
# REGISTER
# =========================

@app.post("/register")
@app.post("/api/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):
    name = data.name.strip()
    email = str(data.email).strip().lower()
    password = data.password

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Nama wajib diisi."
        )

    if len(name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Nama terlalu panjang."
        )

    if len(password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password minimal 8 karakter."
        )

    existing_user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email sudah terdaftar."
        )

    new_user = models.User(
        name=name,
        email=email,
        password=hash_password(password)
    )

    db.add(new_user)

    try:
        db.commit()
        db.refresh(new_user)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Registrasi gagal. Silakan coba lagi."
        )

    return {
        "message": "Registrasi berhasil.",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


# =========================
# LOGIN
# =========================

@app.post("/login")
@app.post("/api/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    email = str(data.email).strip().lower()

    user = (
        db.query(models.User)
        .filter(models.User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email atau password tidak sesuai."
        )

    if not verify_password(
        data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Email atau password tidak sesuai."
        )

    return {
        "message": "Login berhasil.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


# =========================================================
# PROFILE
# =========================================================

@app.get("/api/profile")
def get_profile(
    x_user_id: Optional[str] = Header(
        default=None,
        alias="X-User-ID"
    ),
    db: Session = Depends(get_db)
):
    if not x_user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID tidak ditemukan."
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="User ID tidak valid."
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "created_at": user.created_at,
    }


@app.put("/api/profile")
def update_profile(
    data: ProfileUpdateRequest,
    x_user_id: Optional[str] = Header(
        default=None,
        alias="X-User-ID"
    ),
    db: Session = Depends(get_db)
):
    if not x_user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID tidak ditemukan."
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="User ID tidak valid."
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    name = data.name.strip()
    email = str(data.email).strip().lower()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Nama wajib diisi."
        )

    if len(name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Nama terlalu panjang."
        )

    if data.password is not None:
        password = data.password.strip()

        if password and len(password) < 8:
            raise HTTPException(
                status_code=400,
                detail="Password minimal 8 karakter."
            )

    existing_email = (
        db.query(models.User)
        .filter(
            models.User.email == email,
            models.User.id != user_id
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email sudah digunakan akun lain."
        )

    user.name = name
    user.email = email

    if data.password is not None:
        password = data.password.strip()

        if password:
            user.password = hash_password(password)

    try:
        db.commit()
        db.refresh(user)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Profil gagal diperbarui."
        )

    return {
        "message": "Profil berhasil diperbarui.",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


@app.delete("/api/profile")
def delete_profile(
    x_user_id: Optional[str] = Header(
        default=None,
        alias="X-User-ID"
    ),
    db: Session = Depends(get_db)
):
    if not x_user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID tidak ditemukan."
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="User ID tidak valid."
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    db.delete(user)
    db.commit()

    return {
        "message": "Akun berhasil dihapus."
    }


# =========================================================
# PENGELUARAN
# =========================================================

def expense_response(expense):
    return {
        "id": expense.id,
        "user_id": expense.user_id,
        "title": expense.title,
        "amount": expense.amount,
        "category": expense.category,
        "description": expense.description,
        "date": expense.date,
        "created_at": expense.created_at,
    }


@app.get("/api/pengeluaran")
def get_pengeluaran(
    x_user_id: Optional[str] = Header(
        default=None,
        alias="X-User-ID"
    ),
    db: Session = Depends(get_db)
):
    if not x_user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID tidak ditemukan."
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="User ID tidak valid."
        )

    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    expenses = (
        db.query(models.Expense)
        .filter(
            models.Expense.user_id == user_id
        )
        .order_by(
            models.Expense.date.desc()
        )
        .all()
    )

    return [
        expense_response(expense)
        for expense in expenses
    ]


@app.post("/api/pengeluaran")
def create_pengeluaran(
    data: PengeluaranRequest,
    db: Session = Depends(get_db)
):
    user = (
        db.query(models.User)
        .filter(
            models.User.id == data.user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    if not data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Nama pengeluaran wajib diisi."
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Nominal harus lebih dari 0."
        )

    if not data.category.strip():
        raise HTTPException(
            status_code=400,
            detail="Kategori wajib diisi."
        )

    expense = models.Expense(
        user_id=data.user_id,
        title=data.title.strip(),
        amount=data.amount,
        category=data.category.strip(),
        description=(
            data.description.strip()
            if data.description
            else ""
        ),
        date=data.date,
    )

    db.add(expense)

    try:
        db.commit()
        db.refresh(expense)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Pengeluaran gagal disimpan."
        )

    return expense_response(expense)


@app.put("/api/pengeluaran/{expense_id}")
def update_pengeluaran(
    expense_id: int,
    data: PengeluaranRequest,
    db: Session = Depends(get_db)
):
    expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id
        )
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Pengeluaran tidak ditemukan."
        )

    if expense.user_id != data.user_id:
        raise HTTPException(
            status_code=403,
            detail="Kamu tidak memiliki akses ke pengeluaran ini."
        )

    if not data.title.strip():
        raise HTTPException(
            status_code=400,
            detail="Nama pengeluaran wajib diisi."
        )

    if data.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Nominal harus lebih dari 0."
        )

    if not data.category.strip():
        raise HTTPException(
            status_code=400,
            detail="Kategori wajib diisi."
        )

    expense.title = data.title.strip()
    expense.amount = data.amount
    expense.category = data.category.strip()
    expense.description = (
        data.description.strip()
        if data.description
        else ""
    )
    expense.date = data.date

    try:
        db.commit()
        db.refresh(expense)

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Pengeluaran gagal diperbarui."
        )

    return expense_response(expense)


@app.delete("/api/pengeluaran/{expense_id}")
def delete_pengeluaran(
    expense_id: int,
    x_user_id: Optional[str] = Header(
        default=None,
        alias="X-User-ID"
    ),
    db: Session = Depends(get_db)
):
    if not x_user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID tidak ditemukan."
        )

    try:
        user_id = int(x_user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail="User ID tidak valid."
        )

    expense = (
        db.query(models.Expense)
        .filter(
            models.Expense.id == expense_id
        )
        .first()
    )

    if not expense:
        raise HTTPException(
            status_code=404,
            detail="Pengeluaran tidak ditemukan."
        )

    if expense.user_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Kamu tidak memiliki akses ke pengeluaran ini."
        )

    db.delete(expense)
    db.commit()

    return {
        "message": "Pengeluaran berhasil dihapus.",
        "id": expense_id
    }


# =========================================================
# ENDPOINT LAMA
# =========================================================

@app.get("/expenses/{user_id}")
def get_expenses(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User tidak ditemukan."
        )

    expenses = (
        db.query(models.Expense)
        .filter(
            models.Expense.user_id == user_id
        )
        .order_by(
            models.Expense.date.desc()
        )
        .all()
    )

    return [
        expense_response(expense)
        for expense in expenses
    ]