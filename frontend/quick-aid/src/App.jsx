import { useState, useEffect, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HospitalLogin from "./pages/hospital_login/HospitalLogin";
import HospitalOnboard from "./pages/hospital_registry/HospitalOnboard";
import StatusUpdate from "./pages/status_updation/StatusUpdate";

import AdminDashboard from "./pages/admin/AdminDashboard";
import StaffManagement from "./pages/admin/StaffManagement";

function useBackendHealth() {
  const [ready, setReady] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${backendUrl}/ready`);
        setReady(res.ok);
      } catch {
        setReady(false);
      }
    };

    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return ready;
}

export default function App() {
  const [session, setSession] = useState(null);
  const backendReady = useBackendHealth();

  const handleLogin = useCallback(
    (data) => {
      setSession(data);
    },
    [setSession]
  );

  if (!session) {
    return <HospitalLogin onLogin={handleLogin} />;
  }

  if (!backendReady) {
    return (
      <div style={{ color: "orange", padding: "2rem", textAlign: "center" }}>
        ⚠️ System temporarily unavailable. Retrying…
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={session.role === "admin" ? "/admin" : "/status"} />} />
        {/* ADMIN ROUTES */}
        {session.role === "admin" && (
          <>
            <Route
              path="/admin"
              element={<AdminDashboard session={session} />}
            />
            <Route
              path="/admin/profile"
              element={<HospitalOnboard session={session} />}
            />
            <Route
              path="/admin/staff"
              element={<StaffManagement session={session} />}
            />
            <Route path="*" element={<Navigate to="/admin" />} />
          </>
        )}
        {/* STAFF ROUTES */}
        {session.role === "staff" && (
          <>
            <Route
              path="/status"
              element={<StatusUpdate session={session} />}
            />
            <Route path="*" element={<Navigate to="/status" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}
