import { useEffect, useState } from "react";

import { getMasterDashboard } from "../../api/masterApi";

type Stats = {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
};

type DashboardApiData = {
  categories?: number;
  totalCategories?: number;
  activeCategories?: number;
  inactiveCategories?: number;
};

export default function MasterDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalCategories: 0,
    activeCategories: 0,
    inactiveCategories: 0,
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    getMasterDashboard()
      .then((response) => {
        const dashboardData = response.data.data as
          | DashboardApiData
          | undefined;

        setStats({
          totalCategories:
            dashboardData?.totalCategories ??
            dashboardData?.categories ??
            0,
          activeCategories:
            dashboardData?.activeCategories ?? 0,
          inactiveCategories:
            dashboardData?.inactiveCategories ?? 0,
        });
      })
      .catch((err) => {
        setMsg(
          err?.response?.data?.message ||
            "Failed to load dashboard",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="pageHead">
        <div>
          <span className="eyebrow">MASTER PANEL</span>
          <h1>Dashboard</h1>
          <p>Manage HomeQR master data from one place.</p>
        </div>
      </div>

      {loading ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="stats">
          <div>
            <b>{stats.totalCategories}</b>
            <span>Total Categories</span>
          </div>

          <div>
            <b>{stats.activeCategories}</b>
            <span>Active Categories</span>
          </div>

          <div>
            <b>{stats.inactiveCategories}</b>
            <span>Inactive Categories</span>
          </div>
        </div>
      )}

      {msg && <p className="formMessage">{msg}</p>}
    </div>
  );
}