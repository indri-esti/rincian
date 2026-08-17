import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Modal,
  Dropdown,
} from "react-bootstrap";

import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
  FiHeart,
  FiHome,
  FiTrendingDown,
  FiActivity,
  FiDollarSign,
  FiX,
} from "react-icons/fi";

import { GiForkKnifeSpoon } from "react-icons/gi";

function Pengeluaran() {
  const API_URL = (
    import.meta.env.VITE_API_URL ||
    "https://indr.pythonanywhere.com"
  )
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

  // ==========================================
  // USER
  // ==========================================

  const getUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("rincianUser") || "null"
      );
    } catch {
      return null;
    }
  };

  const getUserId = () => {
    const user = getUser();

    if (!user) {
      return null;
    }

    const possibleIds = [
      user.id,
      user.user_id,
      user.userId,
      user.id_user,
      user?.user?.id,
      user?.user?.user_id,
      user?.user?.id_user,
      user?.data?.id,
      user?.data?.user_id,
      user?.data?.id_user,
    ];

    const foundId = possibleIds.find(
      (id) =>
        id !== undefined &&
        id !== null &&
        String(id).trim() !== ""
    );

    if (
      foundId === undefined ||
      foundId === null
    ) {
      return null;
    }

    const numericId = Number(foundId);

    return Number.isFinite(numericId)
      ? numericId
      : null;
  };

  const getAuthHeaders = () => {
    const userId = getUserId();

    if (!userId) {
      return {};
    }

    return {
      "X-User-ID": String(userId),
    };
  };

  // ==========================================
  // DATA
  // ==========================================

  const [pengeluaran, setPengeluaran] = useState([]);

  // ==========================================
  // STATE
  // ==========================================

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] =
    useState("Semua");
  const [filterPeriode, setFilterPeriode] =
    useState("Semua");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const getToday = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [form, setForm] = useState({
    nama: "",
    nominal: "",
    kategori: "Makanan",
    tanggal: getToday(),
    catatan: "",
  });

  // ==========================================
  // BACKEND / API
  // ==========================================

  const normalizeTanggal = (tanggal) => {
    if (!tanggal) return "";

    const value = String(tanggal).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const indonesiaMatch = value.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (indonesiaMatch) {
      const [, day, month, year] =
        indonesiaMatch;

      return `${year}-${month}-${day}`;
    }

    const isoMatch = value.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

    if (isoMatch) {
      return isoMatch[1];
    }

    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      const year = parsed.getFullYear();

      const month = String(
        parsed.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        parsed.getDate()
      ).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }

    return "";
  };

  // ==========================================
  // NORMALIZE DATA
  // ==========================================

  const normalizePengeluaran = (item) => {
    if (!item || typeof item !== "object") {
      return null;
    }

    const id =
      item?.id ??
      item?.id_pengeluaran ??
      item?.pengeluaran_id ??
      item?.expense_id ??
      item?.data?.id ??
      null;

    return {
      id:
        id !== undefined &&
        id !== null &&
        String(id).trim() !== ""
          ? Number.isNaN(Number(id))
            ? id
            : Number(id)
          : null,

      nama:
        item?.nama ??
        item?.title ??
        item?.name ??
        "",

      kategori:
        item?.kategori ??
        item?.category ??
        "Makanan",

      nominal: Number(
        item?.nominal ??
          item?.amount ??
          0
      ),

      tanggal: normalizeTanggal(
        item?.tanggal ??
          item?.date ??
          item?.tanggal_pengeluaran ??
          item?.expense_date ??
          ""
      ),

      catatan:
        item?.catatan ??
        item?.description ??
        "",
    };
  };

  // ==========================================
  // AMBIL ARRAY DATA DARI RESPONSE
  // ==========================================

  const extractPengeluaran = (responseData) => {
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (!responseData) {
      return [];
    }

    if (Array.isArray(responseData.data)) {
      return responseData.data;
    }

    if (Array.isArray(responseData.pengeluaran)) {
      return responseData.pengeluaran;
    }

    if (Array.isArray(responseData.expenses)) {
      return responseData.expenses;
    }

    if (Array.isArray(responseData.items)) {
      return responseData.items;
    }

    if (Array.isArray(responseData.results)) {
      return responseData.results;
    }

    // Jika backend mengembalikan satu object
    if (
      typeof responseData === "object" &&
      (
        responseData.id !== undefined ||
        responseData.id_pengeluaran !== undefined ||
        responseData.pengeluaran_id !== undefined
      )
    ) {
      return [responseData];
    }

    return [];
  };

  // ==========================================
  // LOAD DATA
  // ==========================================

  const loadPengeluaran = async () => {
    const userId = getUserId();

    if (!userId) {
      console.warn(
        "User ID tidak ditemukan di rincianUser."
      );

      setPengeluaran([]);
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/api/pengeluaran`,
        {
          headers: {
            ...getAuthHeaders(),
            "X-User-ID": String(userId),
          },

          params: {
            user_id: userId,
          },

          timeout: 15000,
        }
      );

      console.log(
        "Response GET pengeluaran:",
        response.data
      );

      const rawData =
        extractPengeluaran(
          response.data
        );

      const normalizedData = rawData
        .map(normalizePengeluaran)
        .filter(
          (item) =>
            item &&
            item.id !== null
        );

      setPengeluaran(
        normalizedData
      );
    } catch (error) {
      console.error(
        "Gagal mengambil pengeluaran:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      /*
       * Jangan tampilkan alert gagal ambil data.
       *
       * Jika server sedang kosong / endpoint belum
       * mengembalikan data, UI cukup menampilkan
       * "Tidak ada pengeluaran".
       */
      // Jangan menghapus data yang sudah tampil hanya karena GET gagal.
      // Data terakhir di layar tetap dipertahankan.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPengeluaran();
  }, []);

  // ==========================================
  // KATEGORI
  // ==========================================

  const kategoriData = {
    Makanan: {
      icon: GiForkKnifeSpoon,
    },

    Belanja: {
      icon: FiShoppingBag,
    },

    Transportasi: {
      icon: FiTruck,
    },

    Tagihan: {
      icon: FiCreditCard,
    },

    Kesehatan: {
      icon: FiHeart,
    },

    Rumah: {
      icon: FiHome,
    },
  };

  const kategoriList =
    Object.keys(kategoriData);

  // ==========================================
  // FORMAT RUPIAH
  // ==========================================

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(Number(angka) || 0);
  };

  // ==========================================
  // FORMAT TANGGAL
  // ==========================================

  const formatTanggal = (tanggal) => {
    const normalized =
      normalizeTanggal(tanggal);

    if (!normalized) {
      return "-";
    }

    const [year, month, day] =
      normalized
        .split("-")
        .map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // HANDLE CHANGE
  // ==========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // TAMBAH
  // ==========================================

  const handleTambah = () => {
    setEditingId(null);

    setForm({
      nama: "",
      nominal: "",
      kategori: "Makanan",
      tanggal: getToday(),
      catatan: "",
    });

    setShowModal(true);
  };

  // ==========================================
  // EDIT
  // ==========================================

  const handleEdit = (item) => {
    setEditingId(item.id);

    setForm({
      nama: item.nama || "",

      nominal:
        item.nominal !== undefined &&
        item.nominal !== null
          ? String(item.nominal)
          : "",

      kategori:
        item.kategori ||
        "Makanan",

      tanggal:
        normalizeTanggal(
          item.tanggal
        ) || getToday(),

      catatan:
        item.catatan || "",
    });

    setShowModal(true);
  };

  // ==========================================
  // RESET FORM
  // ==========================================

  const resetForm = () => {
    setShowModal(false);
    setEditingId(null);

    setForm({
      nama: "",
      nominal: "",
      kategori: "Makanan",
      tanggal: getToday(),
      catatan: "",
    });
  };

  // ==========================================
  // SIMPAN
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nama =
      form.nama.trim();

    const nominal =
      Number(form.nominal);

    const userId =
      getUserId();

    if (!nama) {
      window.alert(
        "Nama pengeluaran wajib diisi."
      );
      return;
    }

    if (
      !Number.isFinite(
        nominal
      ) ||
      nominal <= 0
    ) {
      window.alert(
        "Nominal harus lebih dari 0."
      );
      return;
    }

    if (!form.tanggal) {
      window.alert(
        "Tanggal wajib diisi."
      );
      return;
    }

    if (!userId) {
      window.alert(
        "Data pengguna tidak ditemukan. Silakan login kembali."
      );
      return;
    }

    const payload = {
      user_id: userId,
      title: nama,
      amount: nominal,
      category: form.kategori,
      date: form.tanggal,
      description:
        form.catatan.trim(),
    };

    console.log(
      "Mengirim pengeluaran:",
      payload
    );

    setSaving(true);

    try {
      // ======================================
      // EDIT
      // ======================================

      if (editingId !== null) {
        const response =
          await axios.put(
            `${API_URL}/api/pengeluaran/${editingId}`,
            payload,
            {
              headers: {
                ...getAuthHeaders(),
                "X-User-ID":
                  String(userId),
              },

              timeout: 15000,
            }
          );

        console.log(
          "Response EDIT:",
          response.data
        );

        /*
         * Update langsung di layar.
         * Setelah itu reload dari database supaya
         * data frontend benar-benar sinkron.
         */

        const responseData =
          response.data?.data ??
          response.data;

        const updated =
          normalizePengeluaran(
            responseData
          );

        setPengeluaran(
          (prev) =>
            prev.map((item) =>
              Number(item.id) ===
              Number(editingId)
                ? {
                    ...item,

                    ...(updated || {}),

                    id: editingId,

                    nama: nama,

                    nominal:
                      nominal,

                    kategori:
                      form.kategori,

                    tanggal:
                      form.tanggal,

                    catatan:
                      form.catatan.trim(),
                  }
                : item
            )
        );

        resetForm();

        // Tidak perlu GET ulang di sini.
        // Data di layar sudah diperbarui dari response PUT, sehingga
        // kegagalan GET tidak akan membuat hasil edit menghilang.
        return;
      }

      // ======================================
      // TAMBAH
      // ======================================

      const response =
        await axios.post(
          `${API_URL}/api/pengeluaran`,
          payload,
          {
            headers: {
              ...getAuthHeaders(),
              "X-User-ID":
                String(userId),
            },

            timeout: 15000,
          }
        );

      console.log(
        "Response TAMBAH:",
        response.data
      );

      const responseData =
        response.data?.data ??
        response.data;

      const created =
        normalizePengeluaran(
          responseData
        );

      /*
       * Kalau backend mengembalikan object
       * lengkap dengan ID, tampilkan langsung.
       */

      if (
        created &&
        created.id !== null
      ) {
        const createdData = {
          ...created,

          id: created.id,

          nama:
            created.nama ||
            nama,

          nominal:
            created.nominal ??
            nominal,

          kategori:
            created.kategori ||
            form.kategori,

          tanggal:
            created.tanggal ||
            form.tanggal,

          catatan:
            created.catatan ??
            form.catatan.trim(),
        };

        setPengeluaran(
          (prev) => {
            const exists = prev.some(
              (item) =>
                Number(item.id) ===
                Number(createdData.id)
            );

            if (exists) {
              return prev.map((item) =>
                Number(item.id) ===
                Number(createdData.id)
                  ? createdData
                  : item
              );
            }

            return [createdData, ...prev];
          }
        );

        resetForm();
        return;
      }

      // Jika POST berhasil tetapi backend tidak mengembalikan ID,
      // ambil ulang data agar transaksi tetap memiliki ID database
      // sehingga nantinya tombol Edit/Hapus tetap bisa digunakan.
      resetForm();
      await loadPengeluaran();
    } catch (error) {
      console.error(
        "Gagal menyimpan pengeluaran:",
        error
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      window.alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Gagal menyimpan pengeluaran ke server."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // HAPUS
  // ==========================================

  const handleDelete = async (id) => {
    const yakin =
      window.confirm(
        "Apakah kamu yakin ingin menghapus pengeluaran ini?"
      );

    if (!yakin) {
      return;
    }

    const userId =
      getUserId();

    if (!userId) {
      window.alert(
        "Data pengguna tidak ditemukan. Silakan login kembali."
      );
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/api/pengeluaran/${id}`,
        {
          headers: {
            ...getAuthHeaders(),
            "X-User-ID":
              String(userId),
          },

          params: {
            user_id: userId,
          },

          timeout: 15000,
        }
      );

      setPengeluaran(
        (prev) =>
          prev.filter(
            (item) =>
              Number(item.id) !==
              Number(id)
          )
      );

      // Data di layar sudah dihapus secara lokal setelah DELETE berhasil.
      // Tidak perlu GET ulang yang berpotensi gagal dan mengosongkan layar.
    } catch (error) {
      console.error(
        "Gagal menghapus pengeluaran:",
        error
      );

      window.alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Gagal menghapus pengeluaran dari server."
      );
    }
  };

  // ==========================================
  // FILTER
  // ==========================================

  const filteredPengeluaran =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      return pengeluaran.filter(
        (item) => {
          const nama =
            String(
              item.nama || ""
            ).toLowerCase();

          const kategori =
            String(
              item.kategori || ""
            ).toLowerCase();

          const catatan =
            String(
              item.catatan || ""
            ).toLowerCase();

          const cocokSearch =
            !keyword ||
            nama.includes(
              keyword
            ) ||
            kategori.includes(
              keyword
            ) ||
            catatan.includes(
              keyword
            );

          const cocokKategori =
            filterKategori ===
              "Semua" ||
            item.kategori ===
              filterKategori;

          let cocokPeriode =
            true;

          if (
            filterPeriode !==
            "Semua"
          ) {
            const normalizedTanggal =
              normalizeTanggal(
                item.tanggal
              );

            if (
              !normalizedTanggal
            ) {
              return false;
            }

            const [
              tahun,
              bulan,
              hari,
            ] =
              normalizedTanggal
                .split("-")
                .map(Number);

            const tanggalItem =
              new Date(
                tahun,
                bulan - 1,
                hari
              );

            if (
              Number.isNaN(
                tanggalItem.getTime()
              )
            ) {
              return false;
            }

            const sekarang =
              new Date();

            const hariIni =
              new Date(
                sekarang.getFullYear(),
                sekarang.getMonth(),
                sekarang.getDate()
              );

            if (
              filterPeriode ===
              "Hari ini"
            ) {
              cocokPeriode =
                tanggalItem.getTime() ===
                hariIni.getTime();
            }

            if (
              filterPeriode ===
              "Minggu ini"
            ) {
              const hari =
                hariIni.getDay() ===
                0
                  ? 6
                  : hariIni.getDay() -
                    1;

              const awalMinggu =
                new Date(
                  hariIni
                );

              awalMinggu.setDate(
                hariIni.getDate() -
                  hari
              );

              const akhirMinggu =
                new Date(
                  awalMinggu
                );

              akhirMinggu.setDate(
                awalMinggu.getDate() +
                  6
              );

              cocokPeriode =
                tanggalItem >=
                  awalMinggu &&
                tanggalItem <=
                  akhirMinggu;
            }

            if (
              filterPeriode ===
              "Bulan ini"
            ) {
              cocokPeriode =
                tanggalItem.getMonth() ===
                  hariIni.getMonth() &&
                tanggalItem.getFullYear() ===
                  hariIni.getFullYear();
            }
          }

          return (
            cocokSearch &&
            cocokKategori &&
            cocokPeriode
          );
        }
      );
    }, [
      pengeluaran,
      search,
      filterKategori,
      filterPeriode,
    ]);

  // ==========================================
  // TOTAL
  // ==========================================

  const totalPengeluaran =
    useMemo(() => {
      return filteredPengeluaran.reduce(
        (total, item) =>
          total +
          Number(
            item.nominal || 0
          ),
        0
      );
    }, [filteredPengeluaran]);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f8faff 0%, #f4f6fb 100%)",
        paddingBottom: "50px",
      }}
    >
      <Container
        fluid="xl"
        className="py-4 px-3 px-md-4"
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <div
          className="d-flex flex-column gap-3 mb-4 align-items-center"
          style={{
            position: "relative",
            zIndex: 2,
            width: "100%",
            maxWidth: "1050px",
            margin: "0 auto",
            padding: "0 28px",
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center text-center"
            style={{
              gap: "14px",
              width: "100%",
            }}
          >
            <div
              style={{
                minWidth: 0,
                width: "100%",
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center gap-2 mb-1"
              />

              <h2
                className="fw-bold mb-1"
                style={{
                  color: "#172033",
                  letterSpacing:
                    "-0.6px",
                  fontSize:
                    "clamp(2rem, 5vw, 3rem)",
                  lineHeight: 1.1,
                }}
              >
                Pengeluaran
              </h2>

              <p
                className="mb-0"
                style={{
                  color: "#7b8497",
                  fontSize:
                    "clamp(0.95rem, 2.2vw, 1.15rem)",
                  lineHeight: 1.5,
                }}
              >
                Catat dan kelola pengeluaran kamu
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleTambah}
            className="d-flex align-items-center justify-content-center gap-2 shadow-sm w-100"
            style={{
              minHeight: "58px",
              borderRadius: "14px",
              fontSize: "1.05rem",
              fontWeight: 500,
              border: "none",
            }}
          >
            <FiPlus size={21} />
            Tambah Pengeluaran
          </Button>
        </div>

        {/* ==========================================
            STATISTIK
        ========================================== */}

        <Row className="g-3 mb-4">
          <Col xs={12} md={4}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
                overflow: "hidden",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="small mb-2"
                      style={{
                        color: "#7b8497",
                        fontWeight: 500,
                      }}
                    >
                      Total Pengeluaran
                    </div>

                    <h3
                      className="fw-bold mb-1"
                      style={{
                        color: "#172033",
                      }}
                    >
                      {formatRupiah(
                        totalPengeluaran
                      )}
                    </h3>

                    <small
                      style={{
                        color: "#8b94a7",
                      }}
                    >
                      {
                        filteredPengeluaran.length
                      }{" "}
                      transaksi
                    </small>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor:
                        "#fff0f0",
                      color: "#dc3545",
                    }}
                  >
                    <FiTrendingDown
                      size={22}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
                overflow: "hidden",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="small mb-2"
                      style={{
                        color: "#7b8497",
                        fontWeight: 500,
                      }}
                    >
                      Jumlah Transaksi
                    </div>

                    <h3
                      className="fw-bold mb-1"
                      style={{
                        color: "#172033",
                      }}
                    >
                      {
                        filteredPengeluaran.length
                      }
                    </h3>

                    <small
                      style={{
                        color: "#8b94a7",
                      }}
                    >
                      Pengeluaran tercatat
                    </small>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor:
                        "#eef4ff",
                      color: "#0d6efd",
                    }}
                  >
                    <FiActivity
                      size={22}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={4}>
            <Card
              className="border-0 shadow-sm h-100"
              style={{
                borderRadius: "18px",
                overflow: "hidden",
              }}
            >
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div
                      className="small mb-2"
                      style={{
                        color: "#7b8497",
                        fontWeight: 500,
                      }}
                    >
                      Rata-rata
                    </div>

                    <h3
                      className="fw-bold mb-1"
                      style={{
                        color: "#172033",
                      }}
                    >
                      {formatRupiah(
                        filteredPengeluaran.length
                          ? totalPengeluaran /
                              filteredPengeluaran.length
                          : 0
                      )}
                    </h3>

                    <small
                      style={{
                        color: "#8b94a7",
                      }}
                    >
                      Per transaksi
                    </small>
                  </div>

                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "14px",
                      backgroundColor:
                        "#f2f0ff",
                      color: "#6f42c1",
                    }}
                  >
                    <FiDollarSign
                      size={22}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ==========================================
            FILTER
        ========================================== */}

        <Card
          className="border-0 shadow-sm mb-4"
          style={{
            borderRadius: "18px",
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <Row className="g-3">
              <Col xs={12} lg={5}>
                <InputGroup>
                  <InputGroup.Text
                    style={{
                      backgroundColor:
                        "#fff",
                      borderColor:
                        "#dfe4ec",
                      borderRadius:
                        "11px 0 0 11px",
                      color: "#7b8497",
                    }}
                  >
                    <FiSearch />
                  </InputGroup.Text>

                  <Form.Control
                    type="text"
                    placeholder="Cari pengeluaran..."
                    value={search}
                    onChange={(e) =>
                      setSearch(
                        e.target.value
                      )
                    }
                    style={{
                      borderColor:
                        "#dfe4ec",
                      borderRadius:
                        "0 11px 11px 0",
                      padding:
                        "11px 13px",
                      boxShadow:
                        "none",
                    }}
                  />
                </InputGroup>
              </Col>

              <Col
                xs={12}
                sm={6}
                lg={2}
              >
                <Dropdown className="w-100">
                  <Dropdown.Toggle
                    variant="light"
                    className="border w-100 text-start"
                    style={{
                      borderRadius:
                        "11px",
                      padding:
                        "11px 13px",
                      backgroundColor:
                        "#fff",
                      color:
                        "#3e4758",
                    }}
                  >
                    <FiFilter className="me-2" />
                    {filterKategori}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="w-100 shadow-sm border-0"
                    style={{
                      borderRadius:
                        "12px",
                      padding: "6px",
                    }}
                  >
                    <Dropdown.Item
                      onClick={() =>
                        setFilterKategori(
                          "Semua"
                        )
                      }
                      active={
                        filterKategori ===
                        "Semua"
                      }
                    >
                      Semua Kategori
                    </Dropdown.Item>

                    {kategoriList.map(
                      (kategori) => (
                        <Dropdown.Item
                          key={
                            kategori
                          }
                          onClick={() =>
                            setFilterKategori(
                              kategori
                            )
                          }
                          active={
                            filterKategori ===
                            kategori
                          }
                        >
                          {kategori}
                        </Dropdown.Item>
                      )
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              <Col
                xs={12}
                sm={6}
                lg={3}
              >
                <Dropdown className="w-100">
                  <Dropdown.Toggle
                    variant="light"
                    className="border w-100 text-start"
                    style={{
                      borderRadius:
                        "11px",
                      padding:
                        "11px 13px",
                      backgroundColor:
                        "#fff",
                      color:
                        "#3e4758",
                    }}
                  >
                    <FiCalendar className="me-2" />
                    {filterPeriode}
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    className="w-100 shadow-sm border-0"
                    style={{
                      borderRadius:
                        "12px",
                      padding: "6px",
                    }}
                  >
                    <Dropdown.Item
                      onClick={() =>
                        setFilterPeriode(
                          "Semua"
                        )
                      }
                      active={
                        filterPeriode ===
                        "Semua"
                      }
                    >
                      Semua Periode
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() =>
                        setFilterPeriode(
                          "Hari ini"
                        )
                      }
                      active={
                        filterPeriode ===
                        "Hari ini"
                      }
                    >
                      Hari ini
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() =>
                        setFilterPeriode(
                          "Minggu ini"
                        )
                      }
                      active={
                        filterPeriode ===
                        "Minggu ini"
                      }
                    >
                      Minggu ini
                    </Dropdown.Item>

                    <Dropdown.Item
                      onClick={() =>
                        setFilterPeriode(
                          "Bulan ini"
                        )
                      }
                      active={
                        filterPeriode ===
                        "Bulan ini"
                      }
                    >
                      Bulan ini
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Col>

              <Col xs={12} lg={2}>
                <Button
                  variant="light"
                  className="border w-100"
                  onClick={() => {
                    setSearch("");
                    setFilterKategori(
                      "Semua"
                    );
                    setFilterPeriode(
                      "Semua"
                    );
                  }}
                  style={{
                    borderRadius:
                      "11px",
                    padding:
                      "11px 13px",
                    color:
                      "#596273",
                  }}
                >
                  <FiX className="me-1" />
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* ==========================================
            LIST PENGELUARAN
        ========================================== */}

        <Card
          className="border-0 shadow-sm"
          style={{
            borderRadius: "18px",
          }}
        >
          <Card.Body className="p-3 p-md-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5
                  className="fw-bold mb-1"
                  style={{
                    color:
                      "#172033",
                  }}
                >
                  Daftar Pengeluaran
                </h5>

                <small
                  style={{
                    color:
                      "#8b94a7",
                  }}
                >
                  {
                    filteredPengeluaran.length
                  }{" "}
                  transaksi
                </small>
              </div>

              <Badge
                bg="light"
                text="dark"
                className="px-3 py-2"
                style={{
                  borderRadius:
                    "9px",
                  fontWeight: 500,
                }}
              >
                {filterPeriode}
              </Badge>
            </div>

            {loading ? (
              <div
                className="text-center py-5"
                style={{
                  border:
                    "1px dashed #d9dee8",
                  borderRadius:
                    "15px",
                  backgroundColor:
                    "#fafbfc",
                }}
              >
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />

                <h6
                  className="fw-bold"
                  style={{
                    color:
                      "#172033",
                  }}
                >
                  Memuat pengeluaran...
                </h6>

                <p
                  className="mb-0"
                  style={{
                    color:
                      "#8b94a7",
                  }}
                >
                  Mengambil data pengeluaran kamu
                </p>
              </div>
            ) : filteredPengeluaran.length ===
              0 ? (
              <div
                className="text-center py-5"
                style={{
                  border:
                    "1px dashed #d9dee8",
                  borderRadius:
                    "15px",
                  backgroundColor:
                    "#fafbfc",
                }}
              >
                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius:
                      "18px",
                    backgroundColor:
                      "#eef4ff",
                    color:
                      "#0d6efd",
                  }}
                >
                  <FiSearch size={27} />
                </div>

                <h6
                  className="fw-bold"
                  style={{
                    color:
                      "#172033",
                  }}
                >
                  Tidak ada pengeluaran
                </h6>

                <p
                  className="mb-3"
                  style={{
                    color:
                      "#8b94a7",
                  }}
                >
                  Belum ada data
                  pengeluaran yang
                  tercatat.
                </p>

                <Button
                  variant="primary"
                  onClick={
                    handleTambah
                  }
                  className="d-inline-flex align-items-center"
                >
                  <FiPlus className="me-2" />
                  Tambah Pengeluaran
                </Button>
              </div>
            ) : (
              <div>
                {filteredPengeluaran.map(
                  (item) => {
                    const Icon =
                      kategoriData[
                        item.kategori
                      ]?.icon ||
                      FiShoppingBag;

                    return (
                      <Card
                        key={
                          item.id
                        }
                        className="border-0 mb-3"
                        style={{
                          borderRadius:
                            "15px",
                          backgroundColor:
                            "#fafbfc",
                          boxShadow:
                            "inset 0 0 0 1px #edf0f5",
                        }}
                      >
                        <Card.Body className="p-3">
                          <Row className="align-items-center g-3">
                            <Col xs="auto">
                              <div
                                className="d-flex align-items-center justify-content-center"
                                style={{
                                  width:
                                    "52px",
                                  height:
                                    "52px",
                                  borderRadius:
                                    "15px",
                                  backgroundColor:
                                    "#eef4ff",
                                  color:
                                    "#0d6efd",
                                }}
                              >
                                <Icon
                                  size={
                                    23
                                  }
                                />
                              </div>
                            </Col>

                            <Col>
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <h6
                                  className="fw-bold mb-0"
                                  style={{
                                    color:
                                      "#202838",
                                  }}
                                >
                                  {
                                    item.nama
                                  }
                                </h6>

                                <Badge
                                  bg="light"
                                  text="dark"
                                  style={{
                                    borderRadius:
                                      "7px",
                                    border:
                                      "1px solid #e1e5ec",
                                    fontWeight:
                                      500,
                                  }}
                                >
                                  {
                                    item.kategori
                                  }
                                </Badge>
                              </div>

                              <div
                                className="small"
                                style={{
                                  color:
                                    "#8b94a7",
                                }}
                              >
                                <FiCalendar
                                  size={
                                    13
                                  }
                                  className="me-1"
                                />

                                {formatTanggal(
                                  item.tanggal
                                )}
                              </div>

                              {item.catatan && (
                                <div
                                  className="small mt-1"
                                  style={{
                                    color:
                                      "#8b94a7",
                                  }}
                                >
                                  {
                                    item.catatan
                                  }
                                </div>
                              )}
                            </Col>

                            <Col
                              xs={12}
                              md="auto"
                              className="text-md-end"
                            >
                              <div
                                className="fw-bold mb-2"
                                style={{
                                  color:
                                    "#172033",
                                  fontSize:
                                    "1rem",
                                }}
                              >
                                {formatRupiah(
                                  item.nominal
                                )}
                              </div>

                              <div className="d-flex justify-content-md-end gap-2">
                                <Button
                                  variant="light"
                                  size="sm"
                                  onClick={() =>
                                    handleEdit(
                                      item
                                    )
                                  }
                                  className="border"
                                  style={{
                                    borderRadius:
                                      "9px",
                                    color:
                                      "#0d6efd",
                                    fontWeight:
                                      500,
                                  }}
                                >
                                  <FiEdit2
                                    className="me-1"
                                    size={
                                      14
                                    }
                                  />
                                  Edit
                                </Button>

                                <Button
                                  variant="light"
                                  size="sm"
                                  onClick={() =>
                                    handleDelete(
                                      item.id
                                    )
                                  }
                                  className="border"
                                  style={{
                                    borderRadius:
                                      "9px",
                                    color:
                                      "#dc3545",
                                    fontWeight:
                                      500,
                                  }}
                                >
                                  <FiTrash2
                                    className="me-1"
                                    size={
                                      14
                                    }
                                  />
                                  Hapus
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    );
                  }
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        .pengeluaran-modal-dialog {
          width: calc(100% - 24px);
          max-width: 560px;
          margin: 72px auto 20px !important;
        }

        .pengeluaran-modal-content {
          border: 0 !important;
          border-radius: 18px !important;
          overflow: hidden;
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.18);
        }

        .pengeluaran-modal-dialog .modal-header {
          padding: 20px 22px;
        }

        .pengeluaran-modal-dialog .modal-body {
          padding: 20px 22px;
        }

        .pengeluaran-modal-dialog .modal-footer {
          padding: 14px 22px 18px;
        }

        @media (max-width: 576px) {
          .pengeluaran-modal-dialog {
            width: calc(100% - 20px);
            margin: 62px auto 12px !important;
          }

          .pengeluaran-modal-dialog .modal-header {
            padding: 18px 18px;
          }

          .pengeluaran-modal-dialog .modal-body {
            padding: 18px;
          }

          .pengeluaran-modal-dialog .modal-footer {
            padding: 12px 18px 16px;
          }
        }
      `}</style>

      {/* ==========================================
          MODAL TAMBAH / EDIT
      ========================================== */}

      <Modal
        show={showModal}
        onHide={() => {
          if (!saving) {
            resetForm();
          }
        }}
        style={{
          zIndex: 3000,
        }}
        dialogClassName="pengeluaran-modal-dialog"
        contentClassName="pengeluaran-modal-content"
      >
        <Modal.Header
          closeButton={!saving}
          style={{
            borderBottom:
              "1px solid #edf0f5",
          }}
        >
          <Modal.Title
            className="fw-bold"
            style={{
              color:
                "#172033",
            }}
          >
            {editingId !== null
              ? "Edit Pengeluaran"
              : "Tambah Pengeluaran"}
          </Modal.Title>
        </Modal.Header>

        <Form
          onSubmit={
            handleSubmit
          }
        >
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
              >
                Nama Pengeluaran
              </Form.Label>

              <Form.Control
                type="text"
                name="nama"
                value={
                  form.nama
                }
                onChange={
                  handleChange
                }
                placeholder="Contoh: Makan siang"
                disabled={saving}
                style={{
                  borderRadius:
                    "10px",
                  padding:
                    "11px 13px",
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
              >
                Nominal
              </Form.Label>

              <InputGroup>
                <InputGroup.Text>
                  Rp
                </InputGroup.Text>

                <Form.Control
                  type="number"
                  name="nominal"
                  value={
                    form.nominal
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="0"
                  min="1"
                  disabled={
                    saving
                  }
                  style={{
                    padding:
                      "11px 13px",
                  }}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
              >
                Kategori
              </Form.Label>

              <Form.Select
                name="kategori"
                value={
                  form.kategori
                }
                onChange={
                  handleChange
                }
                disabled={
                  saving
                }
                style={{
                  borderRadius:
                    "10px",
                  padding:
                    "11px 13px",
                }}
              >
                {kategoriList.map(
                  (kategori) => (
                    <option
                      key={
                        kategori
                      }
                      value={
                        kategori
                      }
                    >
                      {
                        kategori
                      }
                    </option>
                  )
                )}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label
                className="fw-semibold"
              >
                Tanggal
              </Form.Label>

              <Form.Control
                type="date"
                name="tanggal"
                value={
                  form.tanggal
                }
                onChange={
                  handleChange
                }
                disabled={saving}
                style={{
                  borderRadius:
                    "10px",
                  padding:
                    "11px 13px",
                }}
              />
            </Form.Group>

            <Form.Group>
              <Form.Label
                className="fw-semibold"
              >
                Catatan
              </Form.Label>

              <Form.Control
                as="textarea"
                rows={3}
                name="catatan"
                value={
                  form.catatan
                }
                onChange={
                  handleChange
                }
                placeholder="Catatan tambahan (opsional)"
                disabled={saving}
                style={{
                  borderRadius:
                    "10px",
                  padding:
                    "11px 13px",
                  resize: "none",
                }}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer
            style={{
              borderTop:
                "1px solid #edf0f5",
            }}
          >
            <Button
              variant="light"
              className="border"
              onClick={
                resetForm
              }
              disabled={saving}
              style={{
                borderRadius:
                  "10px",
              }}
            >
              Batal
            </Button>

            <Button
              variant="primary"
              type="submit"
              disabled={saving}
              style={{
                borderRadius:
                  "10px",
                minWidth:
                  "130px",
              }}
            >
              {saving ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                  Menyimpan...
                </>
              ) : editingId !==
                null ? (
                <>
                  <FiEdit2 className="me-2" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <FiPlus className="me-2" />
                  Simpan
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

export default Pengeluaran;