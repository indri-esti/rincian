import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pengeluaran from "./pages/Pengeluaran";
import Profil from "./pages/Profil";

function App() {
  const location = useLocation();

  const showSidebar =
    location.pathname === "/dashboard" ||
    location.pathname === "/pengeluaran" ||
    location.pathname === "/profil";

  return (
    <>
      {showSidebar && <Sidebar />}

      <Routes>
        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* REGISTER */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* PENGELUARAN */}
        <Route
          path="/pengeluaran"
          element={<Pengeluaran />}
        />

        {/* PROFIL */}
        <Route
          path="/profil"
          element={<Profil />}
        />

        {/* ROOT */}
        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* ROUTE TIDAK DITEMUKAN */}
        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
      </Routes>
    </>
  );
}

export default App;