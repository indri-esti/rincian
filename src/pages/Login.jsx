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
  FiArrowRight,
} from "react-icons/fi";

import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const emailInput = email.trim().toLowerCase();
    const passwordInput = password;

    if (!emailInput || !passwordInput) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email: emailInput,
        password: passwordInput,
      });

      const user = response.data?.user;

      if (!user || !user.id) {
        setError("Data pengguna tidak ditemukan.");
        return;
      }

      // ======================================
      // BERSIHKAN DATA LOGIN LAMA
      // ======================================

      localStorage.removeItem("rincianLogin");
      localStorage.removeItem("rincianEmail");
      localStorage.removeItem("rincianUser");
      localStorage.removeItem("rincianUserId");

      // ======================================
      // SIMPAN AKUN YANG BARU LOGIN
      // KHUSUS DI PERANGKAT INI
      // ======================================

      localStorage.setItem(
        "rincianLogin",
        "true"
      );

      localStorage.setItem(
        "rincianEmail",
        user.email || emailInput
      );

      localStorage.setItem(
        "rincianUserId",
        String(user.id)
      );

      localStorage.setItem(
        "rincianUser",
        JSON.stringify(user)
      );

      // ======================================
      // PINDAH KE DASHBOARD
      // ======================================

      navigate("/dashboard", {
        replace: true,
      });

    } catch (error) {
      console.error("Login error:", error);

      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 401) {
        setError("Email atau password salah.");
      } else if (error.response?.status === 404) {
        setError("Endpoint login tidak ditemukan.");
      } else if (error.response) {
        setError(
          "Login gagal. Silakan periksa email dan password."
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
              Selamat datang 👋
            </span>

            <h1>
              Masuk ke Rincian
            </h1>

            <p>
              Pantau dan catat pengeluaranmu
              dengan mudah.
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

          <Form onSubmit={handleLogin}>

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

            <Form.Group className="mb-4">

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
                  placeholder="Masukkan password"
                  value={password}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <Button
                  variant="outline-secondary"
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <FiEye size={18} />
                  ) : (
                    <FiEyeOff size={18} />
                  )}
                </Button>

              </InputGroup>

            </Form.Group>

            <Button
              type="submit"
              className="auth-button w-100"
              disabled={loading}
            >

              <span>
                {loading ? "Memproses..." : "Masuk"}
              </span>

              {!loading && (
                <FiArrowRight size={18} />
              )}

            </Button>

          </Form>

          <div className="auth-divider">
            <span>
              atau
            </span>
          </div>

          <p className="auth-footer">

            Belum punya akun?{" "}

            <Link to="/register">
              Daftar sekarang
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

export default Login;