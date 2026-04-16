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
} from "lucide-react";


function AdminDashboardContent() {
  const router = useRouter();
  const { user: authUser, logout } = useAuth();

  const [data, setData] = useState(null);
  const [allActivities, setAllActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const [role, setRole] = useState("admin");
  const [activeTab, setActiveTab] = useState("create");

  const [userVideos, setUserVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
// add
  useEffect(() => {
    console.log('authUser:', authUser);
    console.log('authUser?.role:', authUser?.role);
    
    if (!authUser) {
      console.log('No authUser, checking localStorage');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          console.log('Stored user role:', userData.role);
          if (userData.role !== 'admin') {
            console.log('Stored user is not admin, redirecting');
            router.push("/user/dashboard");
            return;
          }
          setAdminVerified(true);
        } catch (err) {
          console.error('Error parsing stored user:', err);
          router.push("/login");
        }
      }
      return;
    }
    
    if (authUser.role !== "admin") {
      console.log('authUser role is not admin, redirecting to user dashboard');
      router.push("/user/dashboard");
      return;
    }
    
    console.log('authUser is admin, allowing access');
    setAdminVerified(true);
  }, [authUser, router]);

  // Fetch dashboard data
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/login");
      return;
    }

    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await fetch(
        "http://localhost:5000/api/dashboard/stats"
      );
      const statsData = await statsRes.json();

      const activitiesRes = await fetch(
        "http://localhost:5000/api/activity/all"
      );
      const activitiesData = await activitiesRes.json();

      if (statsData.success) setData(statsData.stats);
      if (activitiesData.success)
        setAllActivities(activitiesData.activities);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities =
    filter === "all"
      ? allActivities
      : allActivities.filter((a) => a.action === filter);

  const uniqueActions = [...new Set(allActivities.map((a) => a.action))];

  if (!adminVerified) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 p-4 flex flex-col justify-between">
        
        <div>
          <h2 className="text-xl font-bold mb-6">
            Admin <span className="text-purple-500">Panel</span>
          </h2>

          <nav className="space-y-3">

            {role === "admin" && (
              <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/20 transition">
                <Users size={18} /> Users
              </button>
            )}

            <button
              onClick={() => setActiveTab("create")}
              className={`flex items-center gap-2 p-2 rounded-lg transition ${
                activeTab === "create"
                  ? "bg-purple-600"
                  : "hover:bg-purple-500/20"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 p-2 rounded-lg transition ${
                activeTab === "history"
                  ? "bg-purple-600"
                  : "hover:bg-purple-500/20"
              }`}
            >
              <Video size={18} /> Videos
            </button>
          </nav>
        </div>

        {/* Bottom */}
        <div className="space-y-2">
          <Link
            href="/feedback"
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/20 transition"
          >
            <MessageSquare size={18} /> Feedback
          </Link>

          <button
            onClick={() => {
              localStorage.clear();
              router.push("/login");
            }}
            className="flex items-center gap-2 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-y-auto">

        <h1 className="text-3xl font-bold mb-6">
          Admin <span className="text-purple-500">Dashboard</span>
        </h1>

        {/* DASHBOARD */}
        {activeTab === "create" && (
          <>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : (
              <>
                {/* STATS */}
                {data && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    
                    <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
                      Total Users
                      <p className="text-purple-400 text-xl font-bold">
                        {data.totalUsers}
                      </p>
                    </div>

                    <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
                      Activities
                      <p className="text-purple-400 text-xl font-bold">
                        {data.totalActivities}
                      </p>
                    </div>

                    <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
                      Feedback
                      <p className="text-purple-400 text-xl font-bold">
                        {data.totalFeedback}
                      </p>
                    </div>

                    <div className="bg-[#111827] p-4 rounded-xl border border-gray-800">
                      Types
                      <p className="text-purple-400 text-xl font-bold">
                        {data.activitiesByType?.length}
                      </p>
                    </div>
                  </div>
                )}

                {/* FILTER */}
                <div className="mb-4">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="bg-[#111827] border border-gray-700 p-2 rounded-lg"
                  >
                    <option value="all">All</option>
                    {uniqueActions.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                {/* ACTIVITIES */}
                {filteredActivities.length > 0 ? (
                  filteredActivities.map((a) => (
                    <div
                      key={a._id}
                      className="bg-[#111827] border border-gray-800 p-4 my-2 rounded-lg hover:border-purple-500 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-purple-400 font-semibold">
                            {a.userName}
                          </p>
                          <p className="text-gray-400 text-sm">{a.userEmail}</p>
                        </div>
                        <span className="text-xs bg-purple-600 px-2 py-1 rounded capitalize">
                          {a.action.replace('_', ' ')}
                        </span>
                      </div>
                      {a.videoTitle && (
                        <p className="text-sm text-gray-300 mt-2">📹 {a.videoTitle}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(a.timestamp).toLocaleDateString()} {new Date(a.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No activities to display</p>
                )}
              </>
            )}
          </>
        )}

        {/* HISTORY */}
        {activeTab === "history" && (
          <>
            {isLoadingVideos ? (
              <Loader2 className="animate-spin text-purple-500" />
            ) : userVideos.length > 0 ? (
              userVideos.map((v, i) => (
                <div key={i} className="mb-4">
                  <video
                    src={v.url}
                    controls
                    className="rounded-lg border border-gray-700"
                    width="320"
                  />
                </div>
              ))
            ) : (
              <p className="text-gray-400">No videos yet</p>
            )}
          </>
        )}
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