import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Dropdown,
  ProgressBar,
  Button,
} from "react-bootstrap";

import {
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiMoreVertical,
  FiArrowDownRight,
  FiShoppingBag,
  FiTruck,
  FiHeart,
  FiCreditCard,
} from "react-icons/fi";

import { GiForkKnifeSpoon } from "react-icons/gi";

import api from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [periode, setPeriode] = useState("Bulan ini");
  const [pengeluaran, setPengeluaran] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // AMBIL USER LOGIN
  // ==========================================

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("rincianUser") || "null"
      );
    } catch (error) {
      return null;
    }
  }, []);

  // ==========================================
  // ICON KATEGORI
  // ==========================================

  const getCategoryIcon = (category) => {
    const kategori = String(category || "").toLowerCase();

    if (kategori === "makanan") {
      return GiForkKnifeSpoon;
    }

    if (kategori === "transportasi") {
      return FiTruck;
    }

    if (kategori === "belanja") {
      return FiShoppingBag;
    }

    if (kategori === "tagihan") {
      return FiCreditCard;
    }

    if (kategori === "kesehatan") {
      return FiHeart;
    }

    return FiCreditCard;
  };

  // ==========================================
  // FORMAT TANGGAL
  // ==========================================

  const formatTanggal = (tanggal) => {
    if (!tanggal) {
      return "-";
    }

    const date = new Date(tanggal);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // ==========================================
  // FORMAT RUPIAH
  // ==========================================

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(angka) || 0);
  };

  // ==========================================
  // AMBIL DATA PENGELUARAN
  // ==========================================

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?.id) {
        setPengeluaran([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const response = await api.get(
          `/expenses/${user.id}`
        );

        const data = Array.isArray(response.data)
          ? response.data
          : [];

        const formattedData = data.map((item) => ({
          id: item.id,
          nama: item.title,
          kategori: item.category,
          nominal: Number(item.amount) || 0,
          tanggal: formatTanggal(item.date),
          rawDate: item.date,
          icon: getCategoryIcon(item.category),
        }));

        setPengeluaran(formattedData);
      } catch (error) {
        console.error(
          "Gagal mengambil data pengeluaran:",
          error
        );

        setPengeluaran([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user]);

  // ==========================================
  // TOTAL PENGELUARAN
  // ==========================================

  const totalPengeluaran = pengeluaran.reduce(
    (total, item) =>
      total + Number(item.nominal || 0),
    0
  );

  // ==========================================
  // DATA MINGGUAN
  // ==========================================

  const dataMingguan = useMemo(() => {
    const sekarang = new Date();

    const hasil = [
      {
        hari: "Sen",
        nominal: 0,
      },
      {
        hari: "Sel",
        nominal: 0,
      },
      {
        hari: "Rab",
        nominal: 0,
      },
      {
        hari: "Kam",
        nominal: 0,
      },
      {
        hari: "Jum",
        nominal: 0,
      },
      {
        hari: "Sab",
        nominal: 0,
      },
      {
        hari: "Min",
        nominal: 0,
      },
    ];

    pengeluaran.forEach((item) => {
      if (!item.rawDate) {
        return;
      }

      const tanggal = new Date(item.rawDate);

      if (Number.isNaN(tanggal.getTime())) {
        return;
      }

      const selisih =
        sekarang.getTime() - tanggal.getTime();

      const tujuhHari =
        7 * 24 * 60 * 60 * 1000;

      if (
        selisih >= 0 &&
        selisih <= tujuhHari
      ) {
        const index = tanggal.getDay();

        const indexHari =
          index === 0 ? 6 : index - 1;

        hasil[indexHari].nominal +=
          Number(item.nominal) || 0;
      }
    });

    return hasil;
  }, [pengeluaran]);

  // ==========================================
  // TOTAL MINGGUAN
  // ==========================================

  const totalMingguan = dataMingguan.reduce(
    (total, item) =>
      total + Number(item.nominal || 0),
    0
  );

  // ==========================================
  // TOTAL GRAFIK
  // ==========================================

  const totalGrafik = Math.max(
    ...dataMingguan.map(
      (item) => Number(item.nominal) || 0
    ),
    0
  );

  // ==========================================
  // KATEGORI
  // ==========================================

  const kategori = useMemo(() => {
    const grouped = {};

    pengeluaran.forEach((item) => {
      const namaKategori =
        item.kategori || "Lainnya";

      if (!grouped[namaKategori]) {
        grouped[namaKategori] = {
          nama: namaKategori,
          nominal: 0,
          icon: getCategoryIcon(
            namaKategori
          ),
          persen: 0,
        };
      }

      grouped[namaKategori].nominal +=
        Number(item.nominal) || 0;
    });

    const hasil = Object.values(grouped)
      .sort(
        (a, b) =>
          b.nominal - a.nominal
      )
      .slice(0, 4);

    return hasil.map((item) => ({
      ...item,
      persen:
        totalPengeluaran > 0
          ? Math.round(
              (item.nominal /
                totalPengeluaran) *
                100
            )
          : 0,
    }));
  }, [pengeluaran, totalPengeluaran]);

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    try {
      localStorage.removeItem("rincianLogin");
      localStorage.removeItem("rincianEmail");
      localStorage.removeItem("rincianUser");
    } catch (error) {
      console.error(
        "Gagal menghapus login:",
        error
      );
    }

    navigate("/login");
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="dashboard-page">
      {/* NAVBAR */}
      <div className="dashboard-navbar">
        <Container fluid="lg">
          <div className="d-flex justify-content-between align-items-center">
            {/* BRAND */}
            <div className="dashboard-brand">
              <div className="dashboard-logo">R</div>

              <div>
                <h5>Rincian</h5>
                <small>Keuanganmu lebih teratur</small>
              </div>
            </div>

            {/* PROFILE */}
            <Dropdown>
              <Dropdown.Toggle
                variant="light"
                className="profile-button"
              >
                <div className="profile-avatar">
                  {user?.name
                    ? user.name
                        .charAt(0)
                        .toUpperCase()
                    : "U"}
                </div>

                <span className="d-none d-sm-block">
                  {user?.name || "Pengguna"}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item
                  onClick={() =>
                    navigate("/profil")
                  }
                >
                  Profil
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  onClick={handleLogout}
                >
                  Keluar
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </div>

      {/* CONTENT */}
      <Container fluid="lg" className="py-4">
        {/* HEADER */}
        <div className="dashboard-header mb-4">
          <div>
            <Badge className="dashboard-badge">
              Dashboard
            </Badge>

            <h1 className="mt-2">
              Halo,{" "}
              {user?.name || "selamat datang"} 👋
            </h1>

            <p>
              Pantau kondisi keuanganmu hari ini.
            </p>
          </div>
        </div>

        {/* STATISTIK */}
        <Row className="g-3 mb-4">
          {/* TOTAL */}
          <Col xs={12} md={6} lg={4}>
            <Card className="stat-card stat-primary">
              <Card.Body>
                <div className="stat-top">
                  <div>
                    <span className="stat-label">
                      Total Pengeluaran
                    </span>

                    <h2>
                      {formatRupiah(
                        totalPengeluaran
                      )}
                    </h2>
                  </div>

                  <div className="stat-icon">
                    <FiTrendingDown />
                  </div>
                </div>

                <div className="stat-footer">
                  <span className="stat-positive">
                    <FiArrowDownRight />
                    8,5%
                  </span>

                  <span>
                    dibanding bulan lalu
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* MINGGU */}
          <Col xs={12} sm={6} md={6} lg={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-top">
                  <div>
                    <span className="stat-label">
                      Minggu Ini
                    </span>

                    <h2>
                      {formatRupiah(
                        totalMingguan
                      )}
                    </h2>
                  </div>

                  <div className="stat-icon stat-icon-blue">
                    <FiCalendar />
                  </div>
                </div>

                <div className="stat-footer">
                  <span>
                    7 hari terakhir
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* ANGGARAN */}
          <Col xs={12} sm={6} lg={4}>
            <Card className="stat-card">
              <Card.Body>
                <div className="stat-top">
                  <div>
                    <span className="stat-label">
                      Sisa Anggaran
                    </span>

                    <h2>
                      {formatRupiah(750000)}
                    </h2>
                  </div>

                  <div className="stat-icon stat-icon-green">
                    <FiTrendingUp />
                  </div>
                </div>

                <div className="stat-footer">
                  <span className="stat-positive">
                    42%
                  </span>

                  <span>
                    anggaran tersisa
                  </span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* GRAFIK + KATEGORI */}
        <Row className="g-3 mb-4">
          {/* GRAFIK */}
          <Col xs={12} lg={8}>
            <Card className="dashboard-card h-100">
              <Card.Body>
                <div className="card-heading">
                  <div>
                    <h5>Pengeluaran</h5>

                    <p>
                      Perbandingan pengeluaran
                      minggu ini
                    </p>
                  </div>

                  <Dropdown>
                    <Dropdown.Toggle
                      variant="light"
                      size="sm"
                      className="period-button"
                    >
                      {periode}
                    </Dropdown.Toggle>

                    <Dropdown.Menu align="end">
                      {[
                        "Hari ini",
                        "Minggu ini",
                        "Bulan ini",
                      ].map((item) => (
                        <Dropdown.Item
                          key={item}
                          onClick={() =>
                            setPeriode(item)
                          }
                        >
                          {item}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {/* CHART */}
                <div className="expense-chart">
                  <div className="chart-y-axis">
                    <span>
                      {formatRupiah(
                        totalGrafik
                      )}
                    </span>

                    <span>Rp 150rb</span>
                    <span>Rp 75rb</span>
                    <span>Rp 0</span>
                  </div>

                  <div className="chart-content">
                    <div className="chart-grid">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="chart-bars">
                      {dataMingguan.map(
                        (item) => {
                          const tinggi =
                            totalGrafik > 0
                              ? (Number(
                                  item.nominal
                                ) /
                                  totalGrafik) *
                                100
                              : 0;

                          return (
                            <div
                              className="chart-column"
                              key={item.hari}
                            >
                              <div className="chart-value">
                                {formatRupiah(
                                  item.nominal
                                )}
                              </div>

                              <div className="bar-wrapper">
                                <div
                                  className="chart-bar"
                                  style={{
                                    height: `${tinggi}%`,
                                  }}
                                  title={`${item.hari}: ${formatRupiah(
                                    item.nominal
                                  )}`}
                                />
                              </div>

                              <span className="chart-label">
                                {item.hari}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* KATEGORI */}
          <Col xs={12} lg={4}>
            <Card className="dashboard-card h-100">
              <Card.Body>
                <div className="card-heading">
                  <div>
                    <h5>Kategori Terbesar</h5>

                    <p>
                      Pengeluaran berdasarkan
                      kategori
                    </p>
                  </div>

                  <FiMoreVertical />
                </div>

                <div className="category-list">
                  {kategori.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        className="category-item"
                        key={item.nama}
                      >
                        <div className="category-icon">
                          <Icon />
                        </div>

                        <div className="category-info">
                          <div className="category-title">
                            <span>
                              {item.nama}
                            </span>

                            <strong>
                              {formatRupiah(
                                item.nominal
                              )}
                            </strong>
                          </div>

                          <ProgressBar
                            now={
                              Number(
                                item.persen
                              ) || 0
                            }
                            className="category-progress"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  variant="light"
                  className="view-all-button w-100"
                  onClick={() =>
                    navigate(
                      "/pengeluaran"
                    )
                  }
                >
                  Lihat semua kategori
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* PENGELUARAN TERBARU */}
        <Card className="dashboard-card mb-4">
          <Card.Body>
            <div className="card-heading">
              <div>
                <h5>Pengeluaran Terbaru</h5>

                <p>
                  Aktivitas pengeluaran terakhir
                </p>
              </div>

              <Button
                variant="link"
                className="see-all"
                onClick={() =>
                  navigate(
                    "/pengeluaran"
                  )
                }
              >
                Lihat semua
              </Button>
            </div>

            <div className="expense-list">
              {loading ? (
                <div className="text-center py-4">
                  Memuat pengeluaran...
                </div>
              ) : pengeluaran.length === 0 ? (
                <div className="text-center py-4">
                  Belum ada pengeluaran.
                </div>
              ) : (
                pengeluaran
                  .slice(0, 5)
                  .map((item) => {
                    const Icon =
                      item.icon ||
                      FiCreditCard;

                    return (
                      <div
                        className="expense-item"
                        key={item.id}
                      >
                        <div className="expense-left">
                          <div className="expense-icon">
                            <Icon />
                          </div>

                          <div>
                            <h6>
                              {item.nama}
                            </h6>

                            <small>
                              {item.tanggal}
                            </small>
                          </div>
                        </div>

                        <div className="expense-right">
                          <strong>
                            -{" "}
                            {formatRupiah(
                              item.nominal
                            )}
                          </strong>

                          <Badge className="category-badge">
                            {item.kategori}
                          </Badge>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default Dashboard;