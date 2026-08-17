import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  InputGroup,
} from "react-bootstrap";

import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiEdit2,
  FiSave,
  FiLogOut,
  FiShield,
  FiCalendar,
  FiCreditCard,
  FiCheckCircle,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import api from "../api";

function Profil() {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [tanggalBergabung, setTanggalBergabung] =
    useState("Agustus 2026");

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const getUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("rincianUser") || "null"
      );
    } catch {
      return null;
    }
  };

  const formatTanggalBergabung = (tanggal) => {
    if (!tanggal) {
      return "Agustus 2026";
    }

    try {
      const date = new Date(tanggal);

      if (Number.isNaN(date.getTime())) {
        return "Agustus 2026";
      }

      return date.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Agustus 2026";
    }
  };

  const loadProfile = async () => {
    const user = getUser();

    if (!user || !user.id) {
      setLoading(false);
      navigate("/login", {
        replace: true,
      });
      return;
    }

    try {
      setError("");

      const response = await api.get(
        "/api/profile",
        {
          headers: {
            "X-User-ID": String(user.id),
          },
        }
      );

      const profile = response.data;

      setNama(profile.name || "");
      setEmail(profile.email || "");

      setTanggalBergabung(
        formatTanggalBergabung(
          profile.created_at
        )
      );

      const updatedUser = {
        ...user,
        id: profile.id,
        name: profile.name,
        email: profile.email,
      };

      localStorage.setItem(
        "rincianUser",
        JSON.stringify(updatedUser)
      );
    } catch (err) {
      console.error(
        "Gagal mengambil profil:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Gagal mengambil data profil."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();

    const user = getUser();

    if (!user || !user.id) {
      navigate("/login", {
        replace: true,
      });
      return;
    }

    if (!nama.trim()) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    if (password && password.length < 8) {
      setError(
        "Password minimal 8 karakter."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.put(
        "/api/profile",
        {
          name: nama.trim(),
          email: email.trim(),
          password: password || null,
        },
        {
          headers: {
            "X-User-ID": String(user.id),
          },
        }
      );

      const updatedProfile =
        response.data.user;

      setNama(
        updatedProfile.name || ""
      );

      setEmail(
        updatedProfile.email || ""
      );

      setPassword("");
      setShowPassword(false);
      setEditMode(false);

      const updatedUser = {
        ...user,
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
      };

      localStorage.setItem(
        "rincianUser",
        JSON.stringify(updatedUser)
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (err) {
      console.error(
        "Gagal menyimpan profil:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Gagal menyimpan perubahan profil."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    const user = getUser();

    if (user) {
      setNama(user.name || "");
      setEmail(user.email || "");
    }

    setPassword("");
    setShowPassword(false);
    setError("");
    setEditMode(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("rincianLogin");
    localStorage.removeItem("rincianUser");

    navigate("/login", {
      replace: true,
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Container className="py-5">
          <div className="text-center">
            Memuat profil...
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="profile-page">

      {/* NAVBAR */}
      <div className="profile-navbar">
        <Container fluid="lg">
          <div className="d-flex align-items-center justify-content-between">

            <div className="d-flex align-items-center gap-3">

              <Button
                variant="light"
                className="profile-back-button"
                onClick={() =>
                  navigate("/dashboard")
                }
              >
                <FiArrowLeft />
              </Button>

              <div>
                <h5 className="mb-0 fw-bold">
                  Profil
                </h5>

                <small className="text-muted">
                  Kelola informasi akunmu
                </small>
              </div>

            </div>

            <Button
              variant="light"
              className="dashboard-profile-button"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              <FiCreditCard />

              <span className="d-none d-sm-inline">
                Dashboard
              </span>
            </Button>

          </div>
        </Container>
      </div>

      <Container
        fluid="lg"
        className="py-4"
      >

        {/* HEADER */}
        <div className="profile-header mb-4">

          <Badge className="profile-badge">
            Akun Saya
          </Badge>

          <h1 className="mt-2">
            Profil Pengguna
          </h1>

          <p>
            Kelola informasi pribadi dan keamanan
            akun Rincian kamu.
          </p>

        </div>

        <Row className="g-4">

          {/* PROFILE CARD */}
          <Col xs={12} lg={4}>

            <Card className="profile-main-card">

              <Card.Body>

                <div className="profile-avatar-large">
                  {(nama || "P")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h4>
                  {nama || "Pengguna Rincian"}
                </h4>

                <p>
                  {email || "-"}
                </p>

                <Badge className="active-badge">
                  <FiCheckCircle />
                  Akun Aktif
                </Badge>

                <div className="profile-divider" />

                <div className="profile-info-row">
                  <div className="profile-info-icon">
                    <FiCalendar />
                  </div>

                  <div>
                    <small>
                      Bergabung
                    </small>

                    <strong>
                      {tanggalBergabung}
                    </strong>
                  </div>
                </div>

                <div className="profile-info-row">
                  <div className="profile-info-icon">
                    <FiShield />
                  </div>

                  <div>
                    <small>
                      Status keamanan
                    </small>

                    <strong>
                      Terlindungi
                    </strong>
                  </div>
                </div>

              </Card.Body>

            </Card>

            {/* LOGOUT */}
            <Card className="logout-card mt-3">

              <Card.Body>

                <div>
                  <h6>
                    Keluar dari akun
                  </h6>

                  <p>
                    Kamu harus login kembali untuk
                    mengakses Rincian.
                  </p>
                </div>

                <Button
                  variant="outline-danger"
                  onClick={handleLogout}
                >
                  <FiLogOut />
                  Keluar
                </Button>

              </Card.Body>

            </Card>

          </Col>

          {/* FORM */}
          <Col xs={12} lg={8}>

            <Card className="profile-form-card">

              <Card.Body>

                <div className="profile-card-header">

                  <div>
                    <h5>
                      Informasi Pribadi
                    </h5>

                    <p>
                      Informasi dasar akun kamu.
                    </p>
                  </div>

                  {!editMode && (
                    <Button
                      variant="light"
                      className="edit-profile-button"
                      onClick={() => {
                        setError("");
                        setEditMode(true);
                      }}
                    >
                      <FiEdit2 />

                      <span className="d-none d-sm-inline">
                        Edit Profil
                      </span>
                    </Button>
                  )}

                </div>

                {saved && (
                  <div className="profile-success">
                    <FiCheckCircle />
                    Perubahan berhasil disimpan.
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger">
                    {error}
                  </div>
                )}

                <Form onSubmit={handleSave}>

                  {/* NAMA */}
                  <Form.Group className="mb-4">

                    <Form.Label>
                      Nama
                    </Form.Label>

                    <InputGroup>

                      <InputGroup.Text>
                        <FiUser />
                      </InputGroup.Text>

                      <Form.Control
                        type="text"
                        value={nama}
                        disabled={!editMode}
                        onChange={(e) =>
                          setNama(
                            e.target.value
                          )
                        }
                      />

                    </InputGroup>

                  </Form.Group>

                  {/* EMAIL */}
                  <Form.Group className="mb-4">

                    <Form.Label>
                      Email
                    </Form.Label>

                    <InputGroup>

                      <InputGroup.Text>
                        <FiMail />
                      </InputGroup.Text>

                      <Form.Control
                        type="email"
                        value={email}
                        disabled={!editMode}
                        onChange={(e) =>
                          setEmail(
                            e.target.value
                          )
                        }
                      />

                    </InputGroup>

                  </Form.Group>

                  {/* PASSWORD */}
                  <Form.Group className="mb-4">

                    <Form.Label>
                      Password
                    </Form.Label>

                    <InputGroup>

                      <InputGroup.Text>
                        <FiLock />
                      </InputGroup.Text>

                      <Form.Control
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        disabled={!editMode}
                        placeholder={
                          editMode
                            ? "Kosongkan jika tidak ingin mengubah"
                            : ""
                        }
                        onChange={(e) =>
                          setPassword(
                            e.target.value
                          )
                        }
                      />

                      <Button
                        variant="outline-secondary"
                        disabled={!editMode}
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                        type="button"
                        className="password-profile-button"
                      >
                        {showPassword ? (
                          <FiEyeOff />
                        ) : (
                          <FiEye />
                        )}
                      </Button>

                    </InputGroup>

                    <Form.Text>
                      Kosongkan password jika tidak
                      ingin mengubah password.
                    </Form.Text>

                  </Form.Group>

                  {/* BUTTON */}
                  {editMode && (
                    <div className="profile-form-actions">

                      <Button
                        variant="light"
                        type="button"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Batal
                      </Button>

                      <Button
                        className="save-profile-button"
                        type="submit"
                        disabled={saving}
                      >
                        <FiSave />

                        {saving
                          ? " Menyimpan..."
                          : " Simpan Perubahan"}
                      </Button>

                    </div>
                  )}

                </Form>

              </Card.Body>

            </Card>

            {/* SECURITY */}
            <Card className="security-card mt-4">

              <Card.Body>

                <div className="security-icon">
                  <FiShield />
                </div>

                <div>
                  <h6>
                    Keamanan akun
                  </h6>

                  <p>
                    Data akunmu disimpan dengan
                    password yang sudah diamankan.
                  </p>
                </div>

                <Badge>
                  Aman
                </Badge>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      </Container>
    </div>
  );
}

export default Profil;