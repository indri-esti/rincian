import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Button,
  InputGroup,
  Alert,
} from "react-bootstrap";
import {
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from "react-icons/fi";

import api from "../api";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const nameInput = name.trim();
    const emailInput = email.trim().toLowerCase();

    if (!nameInput) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!emailInput) {
      setError("Email wajib diisi.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/register", {
        name: nameInput,
        email: emailInput,
        password: password,
      });

      if (!response.data) {
        setError("Registrasi gagal.");
        return;
      }

      // ======================================
      // JANGAN LOGIN OTOMATIS
      // AKUN SUDAH TERSIMPAN DI DATABASE ONLINE
      // ======================================

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      navigate("/login", {
        replace: true,
        state: {
          message: "Registrasi berhasil. Silakan login.",
        },
      });

    } catch (error) {
      console.error("Register error:", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 400) {
        setError(
          "Registrasi gagal. Email mungkin sudah terdaftar."
        );
      } else if (error.response?.status === 404) {
        setError(
          "Endpoint register tidak ditemukan."
        );
      } else if (error.response) {
        setError(
          "Registrasi gagal. Silakan coba lagi."
        );
      } else {
        setError(
          "Tidak dapat terhubung ke server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-container">

        <div className="auth-brand">

          <div className="brand-icon">
            R
          </div>

          <div>
            <h4>
              Rincian
            </h4>

            <small>
              Kelola keuangan dengan lebih rapi.
            </small>
          </div>

        </div>

        <div className="auth-card">

          <div className="auth-header">

            <span className="auth-badge">
              Mulai sekarang ✨
            </span>

            <h1>
              Buat akun
            </h1>

            <p>
              Buat akun untuk mulai mencatat keuanganmu.
            </p>

          </div>

          {error && (
            <Alert
              variant="danger"
              className="auth-alert"
            >
              {error}
            </Alert>
          )}

          <Form onSubmit={handleRegister}>

            <Form.Group className="mb-3">

              <Form.Label>
                Nama
              </Form.Label>

              <Form.Control
                type="text"
                placeholder="Nama kamu"
                value={name}
                onChange={handleNameChange}
                autoComplete="name"
                disabled={loading}
                required
              />

            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label>
                Email
              </Form.Label>

              <Form.Control
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={handleEmailChange}
                autoComplete="email"
                disabled={loading}
                required
              />

            </Form.Group>

            <Form.Group className="mb-3">

              <Form.Label>
                Password
              </Form.Label>

              <InputGroup>

                <Form.Control
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />

                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? (
                    <FiEye />
                  ) : (
                    <FiEyeOff />
                  )}
                </Button>

              </InputGroup>

            </Form.Group>

            <Form.Group className="mb-4">

              <Form.Label>
                Konfirmasi Password
              </Form.Label>

              <InputGroup>

                <Form.Control
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Ulangi password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  autoComplete="new-password"
                  disabled={loading}
                  required
                />

                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  className="password-toggle"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <FiEye />
                  ) : (
                    <FiEyeOff />
                  )}
                </Button>

              </InputGroup>

            </Form.Group>

            <Button
              type="submit"
              className="auth-button w-100"
              disabled={loading}
            >

              <FiUserPlus size={18} />

              <span>
                {loading
                  ? "Membuat akun..."
                  : "Buat Akun"}
              </span>

            </Button>

          </Form>

          <div className="auth-divider">
            <span>
              atau
            </span>
          </div>

          <p className="auth-footer">

            Sudah punya akun?{" "}

            <Link to="/login">
              Masuk di sini
            </Link>

          </p>

        </div>

        <p className="auth-copyright">
          © 2026 Rincian · Kelola lebih bijak
        </p>

      </div>

    </div>
  );
}

export default Register;