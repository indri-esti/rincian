import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import Swal from "sweetalert2";

import {
  FiHome,
  FiCreditCard,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";

function RincianLogo() {
  return (
    <svg
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo Rincian"
      role="img"
    >
      <defs>
        <linearGradient
          id="rincianLogoGradient"
          x1="8"
          y1="5"
          x2="45"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#1677F0" />
          <stop offset="1" stopColor="#0759D8" />
        </linearGradient>

        <linearGradient
          id="rincianRGradient"
          x1="18"
          y1="13"
          x2="36"
          y2="39"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EAF2FF" />
        </linearGradient>

        <filter
          id="rincianLogoShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="150%"
        >
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="2"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* Background Logo */}
      <rect
        x="1"
        y="1"
        width="50"
        height="50"
        rx="15"
        fill="url(#rincianLogoGradient)"
        filter="url(#rincianLogoShadow)"
      />

      {/* Highlight */}
      <path
        d="M16 4H29C20.5 7.2 14 15.3 14 25.2V38C14 42.5 10.5 46 6 46H5V20C5 11.16 10.16 4 16 4Z"
        fill="white"
        fillOpacity="0.07"
      />

      {/* Modern R */}
      <path
        d="
          M17 39
          V13
          H28.2
          C34.2 13
          38 16.1
          38 21.2
          C38 25.2
          35.7 28
          31.9 29.1
          L38.8 39
          H32.4
          L26.3 30.1
          H22.7
          V39
          H17
          Z

          M22.7 18.1
          V25.1
          H27.7
          C30.7 25.1
          32.2 23.8
          32.2 21.6
          C32.2 19.3
          30.7 18.1
          27.7 18.1
          H22.7
          Z
        "
        fill="url(#rincianRGradient)"
      />

      {/* Subtle folded accent */}
      <path
        d="M26.3 30.1L32.4 39H38.8L31.9 29.1C30.4 29.5 28.4 30 26.3 30.1Z"
        fill="#D7E7FF"
        fillOpacity="0.65"
      />
    </svg>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const menu = [
    {
      nama: "Dashboard",
      icon: FiHome,
      path: "/dashboard",
    },
    {
      nama: "Pengeluaran",
      icon: FiCreditCard,
      path: "/pengeluaran",
    },
    {
      nama: "Profil",
      icon: FiUser,
      path: "/profil",
    },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Keluar dari akun?",
      text: "Kamu akan diarahkan kembali ke halaman login.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "rincian-swal-popup",
        title: "rincian-swal-title",
        htmlContainer: "rincian-swal-text",
        confirmButton: "rincian-swal-confirm",
        cancelButton: "rincian-swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("rincianLogin");

        setOpen(false);

        navigate("/login");

        Swal.fire({
          title: "Berhasil keluar",
          text: "Sampai jumpa lagi 👋",
          icon: "success",
          timer: 1600,
          showConfirmButton: false,
          customClass: {
            popup: "rincian-swal-popup",
            title: "rincian-swal-title",
          },
        });
      }
    });
  };

  return (
    <>
      {/* ==========================================
          TOMBOL MENU MOBILE
      ========================================== */}

      <button
        type="button"
        className="sidebar-mobile-button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        style={{
          zIndex: 1100,
          display: open ? "none" : undefined,
        }}
      >
        <FiMenu />
      </button>

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside
        className={`app-sidebar ${
          open ? "sidebar-open" : ""
        }`}
        style={{
          width: "230px",
          maxWidth: "230px",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* ==========================================
            HEADER
        ========================================== */}

        <div
          className="sidebar-header"
          style={{
            flexShrink: 0,
            padding: "20px 18px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className="sidebar-brand"
            style={{
              paddingRight: "58px",
              minWidth: 0,
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {/* LOGO MODERN R */}

            <div
              className="sidebar-logo"
              style={{
                width: "52px",
                height: "52px",
                minWidth: "52px",
                minHeight: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                borderRadius: "15px",
                overflow: "visible",
              }}
            >
              <RincianLogo />
            </div>

            <div
              className="sidebar-brand-text"
              style={{
                minWidth: 0,
                maxWidth: "100%",
                overflow: "hidden",
              }}
            >
              <h5
                style={{
                  margin: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                Rincian
              </h5>

              <small
                style={{
                  display: "block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "100%",
                }}
              >
                Keuanganmu lebih teratur
              </small>
            </div>
          </div>

          {/* TOMBOL TUTUP MOBILE */}

          <button
            type="button"
            className="sidebar-close-button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            style={{
              position: "absolute",
              right: "14px",
              top: "20px",
              width: "44px",
              height: "44px",
              minWidth: "44px",
              minHeight: "44px",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <FiX />
          </button>
        </div>

        {/* ==========================================
            MENU
        ========================================== */}

        <nav
          className="sidebar-menu"
          style={{
            flex: "1 1 auto",
            minHeight: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "8px 12px",
          }}
        >
          <div className="sidebar-menu-title">
            MENU UTAMA
          </div>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `sidebar-link ${
                    isActive
                      ? "sidebar-link-active"
                      : ""
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <Icon />

                <span>
                  {item.nama}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* ==========================================
            LOGOUT
        ========================================== */}

        <div
          className="sidebar-bottom"
          style={{
            flexShrink: 0,
            marginTop: "auto",
            padding: "12px 12px 32px",
            backgroundColor: "inherit",
            position: "sticky",
            bottom: 0,
            zIndex: 5,
          }}
        >
          <button
            type="button"
            className="sidebar-logout"
            onClick={handleLogout}
            style={{
              width: "100%",
            }}
          >
            <FiLogOut />

            <span>
              Keluar
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;