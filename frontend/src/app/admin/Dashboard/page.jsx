"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

import {
  Users,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Video,
  Loader2,
  Menu,
  X,
  Mail,
  Calendar,
  Film,
  Zap,
  Activity,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function AdminDashboardContent() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  const [data, setData] = useState(null);
  const [allActivities, setAllActivities] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verify admin
  useEffect(() => {
    if (!authUser) {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.role !== "admin") {
            router.push("/user/dashboard");
            return;
          }
          setAdminVerified(true);
        } catch {
          router.push("/login");
        }
      }
      return;
    }
    if (authUser.role !== "admin") {
      router.push("/user/dashboard");
      return;
    }
    setAdminVerified(true);
  }, [authUser, router]);

  // Fetch dashboard + activities on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) { router.push("/login"); return; }
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activitiesRes] = await Promise.all([
        fetch(`${API_URL}/api/dashboard/stats`),
        fetch(`${API_URL}/api/activity/all`),
      ]);
      const statsData = await statsRes.json();
      const activitiesData = await activitiesRes.json();
      if (statsData.success) setData(statsData.stats);
      if (activitiesData.success) setAllActivities(activitiesData.activities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllVideos = async () => {
    setIsLoadingVideos(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/admin/all-videos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) setUserVideos(d.videos || []);
    } catch (err) {
      console.error("Error fetching all videos:", err);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const fetchAllUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/users/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (d.success) setAllUsers(d.users || []);
    } catch (err) {
      console.error("Error fetching all users:", err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (tab === "videos" && userVideos.length === 0) fetchAllVideos();
    if (tab === "users" && allUsers.length === 0) fetchAllUsers();
  };

  const filteredActivities =
    filter === "all"
      ? allActivities
      : allActivities.filter((a) => a.action === filter);

  const uniqueActions = [...new Set(allActivities.map((a) => a.action))];

  if (!adminVerified) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto" />
          <p className="text-gray-400 mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "dashboard", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { id: "users",     icon: <Users size={18} />,           label: "Users" },
    { id: "videos",    icon: <Video size={18} />,            label: "Videos" },
    { id: "activities",icon: <Activity size={18} />,         label: "Activities" },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white overflow-hidden">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#0d1117] border-r border-gray-800 flex flex-col justify-between transition-transform duration-300 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">
              Admin <span className="text-purple-500">Panel</span>
            </h2>
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === item.id
                    ? "bg-purple-600 text-white font-semibold"
                    : "text-gray-400 hover:bg-purple-500/20 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 space-y-1 border-t border-gray-800">
          <Link
            href="/feedback"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-purple-500/20 hover:text-white transition"
          >
            <MessageSquare size={18} /> Feedback Page
          </Link>
          <button
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-[#0d1117]/80 backdrop-blur border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">
            {navItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
          </h1>
        </div>

        <div className="p-4 sm:p-6 space-y-6">

          {/* ───── DASHBOARD TAB ───── */}
          {activeTab === "dashboard" && (
            <>
              {loading ? (
                <div className="flex items-center gap-3 py-12">
                  <Loader2 className="animate-spin text-purple-500" />
                  <p className="text-gray-400">Loading stats...</p>
                </div>
              ) : (
                <>
                  {/* Stats */}
                  {data && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {[
                        { label: "Total Users",      value: data.totalUsers,      color: "purple" },
                        { label: "Activities",       value: data.totalActivities, color: "blue" },
                        { label: "Feedback",         value: data.totalFeedback,   color: "green" },
                        { label: "Videos",           value: data.totalVideos || 0,color: "indigo" },
                        { label: "Action Types",     value: data.activitiesByType?.length || 0, color: "orange" },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className={`bg-[#111827] border border-gray-800 p-4 rounded-xl hover:border-${s.color}-500 transition`}
                        >
                          <p className="text-gray-400 text-xs mb-1">{s.label}</p>
                          <p className={`text-${s.color}-400 text-2xl font-bold`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Activity type breakdown */}
                  {data?.activitiesByType?.length > 0 && (
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                      <h3 className="font-semibold mb-4 text-gray-200">Activity Breakdown</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {data.activitiesByType.map((t, i) => (
                          <div key={i} className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                            <p className="text-gray-400 text-xs capitalize">{t._id || "Unknown"}</p>
                            <p className="text-purple-400 text-xl font-bold mt-1">{t.count}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Top users */}
                  {data?.topUsers?.length > 0 && (
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                      <h3 className="font-semibold mb-4 text-gray-200">Top Active Users</h3>
                      <div className="space-y-3">
                        {data.topUsers.map((u, i) => (
                          <div key={i} className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-lg border border-gray-700">
                            <div>
                              <p className="font-medium text-purple-300">{u.name || "Unknown"}</p>
                              <p className="text-xs text-gray-500">{u.email || "N/A"}</p>
                            </div>
                            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                              {u.count} activities
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent activities preview */}
                  {allActivities.length > 0 && (
                    <div className="bg-[#111827] border border-gray-800 rounded-xl p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-200">Recent Activities</h3>
                        <button
                          onClick={() => handleTabChange("activities")}
                          className="text-xs text-purple-400 hover:underline"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {allActivities.slice(0, 5).map((a) => (
                          <div key={a._id} className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-lg border border-gray-700">
                            <div>
                              <p className="text-sm text-purple-300 font-medium">{a.userName}</p>
                              <p className="text-xs text-gray-500">{a.action?.replace(/_/g, " ")}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded font-medium ${a.status === "success" ? "bg-green-700" : "bg-red-700"}`}>
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ───── USERS TAB ───── */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {isLoadingUsers ? (
                <div className="flex items-center gap-3 py-12">
                  <Loader2 className="animate-spin text-purple-500" />
                  <p className="text-gray-400">Fetching users...</p>
                </div>
              ) : allUsers.length > 0 ? (
                <>
                  <p className="text-sm text-gray-400">{allUsers.length} users registered</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {allUsers.map((u) => (
                      <div
                        key={u._id}
                        className="bg-[#111827] border border-gray-800 rounded-xl p-5 hover:border-purple-500 transition"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {u.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{u.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail size={10} /> {u.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              u.role === "admin"
                                ? "bg-red-600/30 text-red-300 border border-red-600"
                                : "bg-purple-600/30 text-purple-300 border border-purple-600"
                            }`}>
                              {u.role}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              u.plan === "pro"
                                ? "bg-yellow-600/30 text-yellow-300 border border-yellow-600"
                                : "bg-gray-700 text-gray-400 border border-gray-600"
                            }`}>
                              {u.plan || "free"}
                            </span>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {[
                            { icon: <Film size={14} />,     label: "Videos",     value: u.videoCount },
                            { icon: <Zap size={14} />,      label: "Prompts",    value: u.promptCount },
                            { icon: <Activity size={14} />, label: "Activities", value: u.activityCount },
                          ].map((s) => (
                            <div key={s.label} className="bg-gray-900/60 rounded-lg p-2.5 text-center border border-gray-700">
                              <div className="flex justify-center text-purple-400 mb-1">{s.icon}</div>
                              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                              <p className="text-gray-500 text-[10px] mt-1">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Joined date */}
                        <p className="text-[11px] text-gray-600 flex items-center gap-1">
                          <Calendar size={10} />
                          Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-[#111827] rounded-xl border border-gray-800">
                  <Users size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No users found.</p>
                </div>
              )}
            </div>
          )}

          {/* ───── VIDEOS TAB ───── */}
          {activeTab === "videos" && (
            <div className="space-y-4">
              {isLoadingVideos ? (
                <div className="flex items-center gap-3 py-12">
                  <Loader2 className="animate-spin text-purple-500" />
                  <p className="text-gray-400">Fetching all videos...</p>
                </div>
              ) : userVideos.length > 0 ? (
                <>
                  <p className="text-sm text-gray-400">{userVideos.length} total videos on platform</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {userVideos.map((v, i) => (
                      <div
                        key={v._id || i}
                        className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden hover:border-purple-500 transition"
                      >
                        <div className="p-4 border-b border-gray-800 flex justify-between items-start">
                          <div>
                            <p className="text-purple-300 font-semibold">{v.userName || "Unknown"}</p>
                            <p className="text-xs text-gray-500">{v.userEmail || "N/A"}</p>
                          </div>
                          <span className="text-[10px] text-gray-500">
                            {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="aspect-video bg-black">
                          <video src={v.url} controls className="w-full h-full object-contain" />
                        </div>
                        <div className="p-4">
                          <h4 className="text-sm font-semibold text-gray-200 truncate">
                            {v.name || v.title || "AI Generated Video"}
                          </h4>
                          {v.prompt && (
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2 bg-gray-900/50 p-2 rounded border border-gray-800">
                              {v.prompt}
                            </p>
                          )}
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-block mt-3 text-xs text-purple-400 hover:underline"
                          >
                            Open Original →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 bg-[#111827] rounded-xl border border-gray-800">
                  <Video size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No videos generated yet.</p>
                </div>
              )}
            </div>
          )}

          {/* ───── ACTIVITIES TAB ───── */}
          {activeTab === "activities" && (
            <div className="space-y-4">
              {/* Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-sm text-gray-400">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="bg-[#111827] border border-gray-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Actions</option>
                  {uniqueActions.map((a) => (
                    <option key={a} value={a}>{a.replace(/_/g, " ")}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-500 ml-auto">
                  {filteredActivities.length} records
                </span>
              </div>

              {filteredActivities.length > 0 ? (
                <div className="space-y-3">
                  {filteredActivities.map((a) => (
                    <div
                      key={a._id}
                      className="bg-[#111827] border border-gray-800 p-4 rounded-xl hover:border-purple-500 transition"
                    >
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <p className="text-purple-300 font-semibold">{a.userName}</p>
                          <p className="text-gray-500 text-xs">{a.userEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-700/40 border border-purple-600 text-purple-300 px-2 py-0.5 rounded capitalize">
                            {a.action?.replace(/_/g, " ")}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                            a.status === "success" ? "bg-green-700" : "bg-red-700"
                          }`}>
                            {a.status}
                          </span>
                        </div>
                      </div>
                      {a.videoTitle && (
                        <p className="text-sm text-gray-300 mt-2">📹 {a.videoTitle}</p>
                      )}
                      {a.description && (
                        <p className="text-xs text-gray-500 mt-1">{a.description}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-2">
                        {new Date(a.createdAt || a.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-[#111827] rounded-xl border border-gray-800">
                  <Activity size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">No activities to display.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}