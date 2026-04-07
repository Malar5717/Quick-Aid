import { useState, useEffect, useCallback } from "react";
import { updateHospitalStatus, getHospitalById } from "../../services/api";
import { getHospitalLogs } from "../../services/api";
export default function StatusUpdate({ session }) {
  const [status, setStatus] = useState("green");
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  const [departmentStatus, setDepartmentStatus] = useState({});
  const [logs, setLogs] = useState([]);

  const departments = [
    { key: "icu", label: "ICU" },
    { key: "cath_lab", label: "Cath Lab" },
    { key: "burn_unit", label: "Burn Unit" },
    { key: "trauma_center", label: "Trauma Center" },
    { key: "maternity", label: "Maternity" },
    { key: "dialysis", label: "Dialysis" },
  ];

  const getEffectiveDeptStatus = (deptKey) =>
    departmentStatus[deptKey]?.status || status;

  const submitStatus = async (newStatus, newDeptStatus = departmentStatus) => {
    try {
      await updateHospitalStatus({
        hospital_id: session.hospital_id,
        status: newStatus,
        department_status: newDeptStatus,
        updated_by: session.staff_code,
      });
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const setDeptStatus = (dept, value) => {
    const updated = {
      ...departmentStatus,
      [dept]: { status: value },
    };

    setDepartmentStatus(updated);

    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    const timer = setTimeout(() => {
      submitStatus(status, updated);
    }, 800);

    setAutoSaveTimer(timer);
  };

  const fetchCurrentStatus = useCallback(async () => {
    try {
      const res = await getHospitalById(session.hospital_id);
      const me = res.data;

      if (me) {
        if (me.status) {
          setStatus(me.status);
        }
        if (me.department_status) {
          setDepartmentStatus(me.department_status);
        }
      }
    } catch (err) {
      console.error("Failed to fetch current status:", err);
    }
  }, [session.hospital_id]);

  useEffect(() => {
    fetchCurrentStatus();
  }, [fetchCurrentStatus]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchCurrentStatus();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchCurrentStatus]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await getHospitalLogs(session.hospital_id);
        setLogs(res.data.slice(0, 5));
      } catch {
        console.error("Failed to fetch logs");
      }
    };

    fetchLogs();

    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, [session.hospital_id]);

  return (
    <div>
      <h2>
        <b>{session.hospital_name}: Status Update</b>
      </h2>

      {/* Overall Status */}
      <h3>Overall Hospital Status</h3>

      <div style={{ display: "flex", gap: 12 }}>
        {["green", "yellow", "red"].map((color) => (
          <button
            key={color}
            onClick={() => {
              setStatus(color);
              submitStatus(color);
            }}
            style={{
              background:
                status === color
                  ? color === "green"
                    ? "#10b981"
                    : color === "yellow"
                    ? "#f59e0b"
                    : "#ef4444"
                  : "#e5e7eb",
              padding: 20,
              flex: 1,
              fontSize: 16,
              color: "white",
            }}
          >
            {color.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Department Status */}
      <h3 style={{ marginTop: 30 }}>Department Status</h3>

      {departments.map((dept) => (
        <div key={dept.key} style={{ marginBottom: 12 }}>
          <strong>{dept.label}</strong>

          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            {["green", "yellow", "red"].map((color) => (
              <button
                key={color}
                onClick={() => setDeptStatus(dept.key, color)}
                style={{
                  padding: "6px 12px",
                  background:
                    getEffectiveDeptStatus(dept.key) === color
                      ? color === "green"
                        ? "#10b981"
                        : color === "yellow"
                        ? "#f59e0b"
                        : "#ef4444"
                      : "#e5e7eb",
                  color: "white",
                }}
              >
                {color.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ))}

      <p style={{ fontSize: 12, color: "#10b981" }}>✓ Status auto-synced</p>

      <hr />

      <h4>Recent Updates</h4>

      {logs.length === 0 && (
        <p style={{ fontSize: 12 }}>No updates yet</p>
      )}

      <ul style={{ fontSize: 13 }}>
        {logs.map((log, i) => (
          <li key={i}>
            <strong>{log.facility}</strong>: {log.from} →{" "}
            {log.to} by <em>{log.updated_by}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}
