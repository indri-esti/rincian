import { useState } from "react";
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

function Profil() {
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] =
    useState(false);

  const [nama, setNama] = useState("Pengguna Rincian");
  const [email, setEmail] =
    useState("pengguna@rincian.app");

  const [password, setPassword] =
    useState("12345678");

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setEditMode(false);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("rincianLogin");
    navigate("/login", {
      replace: true,
    });
  };

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
                  {nama
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <h4>
                  {nama}
                </h4>

                <p>
                  {email}
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
                      Agustus 2026
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
                      onClick={() =>
                        setEditMode(true)
                      }
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

                <Form>

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
                      Gunakan password yang mudah
                      kamu ingat tetapi sulit ditebak.
                    </Form.Text>

                  </Form.Group>

                  {/* BUTTON */}
                  {editMode && (
                    <div className="profile-form-actions">

                      <Button
                        variant="light"
                        onClick={() =>
                          setEditMode(false)
                        }
                      >
                        Batal
                      </Button>

                      <Button
                        className="save-profile-button"
                        onClick={handleSave}
                      >
                        <FiSave />
                        Simpan Perubahan
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
                    Data akunmu akan disimpan dengan
                    aman ketika backend sudah terhubung.
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