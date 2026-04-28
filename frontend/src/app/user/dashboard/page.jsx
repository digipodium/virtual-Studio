'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
 
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function UserDashboardContent() {
  const { user: authUser } = useAuth();

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Stats
  const [promptCount, setPromptCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Feedback
  const [feedback, setFeedback] = useState({
    rating: 5,
    message: '',
  });

  // ─────────────────────────────────────────────
  // FETCH DASHBOARD STATS (ADMIN)
  // ─────────────────────────────────────────────
  const fetchDashboardStats = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/dashboard/stats`
      );

      if (!res.ok) throw new Error('Failed to fetch stats');

      const data = await res.json();

      console.log('DASHBOARD STATS:', data);

      if (data.success && data.stats) {
        setDashboardStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  // ─────────────────────────────────────────────
  // FETCH VIDEOS
  // ─────────────────────────────────────────────
  const fetchUserVideos = async () => {
    try {
      const token = localStorage.getItem('token');

      console.log('Fetching videos with token:', token?.substring(0, 20) + '...');

      const res = await fetch(
        `${API_URL}/api/users/videos`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log('VIDEOS RESPONSE:', data);

      if (!res.ok) {
        console.warn('Videos fetch failed:', data.error);
        return;
      }

      if (data.success) {
        const videos = data.videos || [];
        console.log('Setting videos, count:', videos.length);
        setUserVideos(videos);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
    }
  };

  // ─────────────────────────────────────────────
  // FETCH ACTIVITIES
  // ─────────────────────────────────────────────
  const fetchActivities = async (userId, userRole) => {
    try {
      const endpoint =
        userRole === 'admin'
          ? `${API_URL}/api/activity/all`
          : `${API_URL}/api/activity/user/${userId}`;

      console.log('Fetching activities from:', endpoint);

      const res = await fetch(endpoint);

      if (!res.ok) throw new Error(`Failed to fetch activities: ${res.status}`);

      const data = await res.json();

      console.log('ACTIVITIES RESPONSE:', data);

      if (data.success) {
        setActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    }
  };
 
  // ─────────────────────────────────────────────
  // STATS CALCULATION EFFECT
  // ─────────────────────────────────────────────
  useEffect(() => {
    // Update video count
    setVideoCount(userVideos.length);

    // Calculate total prompts from both videos and activities
    // We want to count how many unique prompts have been used
    const videoPrompts = userVideos
      .map(v => v.prompt)
      .filter(p => p && typeof p === 'string' && p.trim() !== '');
    
    const activityPrompts = activities
      .filter(a => a.prompt)
      .map(a => a.prompt)
      .filter(p => p && typeof p === 'string' && p.trim() !== '');

    // Combine and get unique prompts
    const allPrompts = [...new Set([...videoPrompts, ...activityPrompts])];
    
    console.log('Stats updated - Videos:', userVideos.length, 'Prompts:', allPrompts.length);
    setPromptCount(allPrompts.length);
  }, [userVideos, activities]);

  // ─────────────────────────────────────────────
  // FETCH FEEDBACKS (ADMIN)
  // ─────────────────────────────────────────────
  const fetchAllFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/users/feedback`);
      if (!res.ok) throw new Error('Failed to fetch feedbacks');
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.feedbacks || []);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  // ─────────────────────────────────────────────
  // MAIN EFFECT - LOAD ALL DATA
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (authUser && (authUser._id || authUser.id)) {
      const userId = authUser._id || authUser.id;
      console.log('Dashboard loading for user:', userId, 'role:', authUser.role);
      setUser(authUser);
      setError(null);
      setLoading(true);
      
      // Fetch all data in parallel
      const tasks = [
        fetchUserVideos(),
        fetchActivities(userId, authUser.role)
      ];

      if (authUser.role === 'admin') {
        tasks.push(fetchDashboardStats());
        tasks.push(fetchAllFeedbacks());
      }

      Promise.all(tasks)
        .catch(err => {
          console.error('Error fetching dashboard data:', err);
          setError('Failed to load dashboard data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [authUser?._id, authUser?.id]);

  // ─────────────────────────────────────────────
  // SUBMIT FEEDBACK
  // ─────────────────────────────────────────────
  const submitFeedback = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/users/feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?._id || user?.id,
            userName: user?.name,
            rating: feedback.rating,
            message: feedback.message,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert('Feedback submitted successfully!');
        setFeedback({
          rating: 5,
          message: '',
        });
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white py-12 px-8">
      <div className="max-w-7xl mx-auto">

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">
            {user?.role === 'admin'
              ? 'Admin Dashboard'
              : 'Your Dashboard'}
          </h1>

          <div className="flex items-center gap-3">
            <p className="text-gray-400">
              Welcome back,
              <span className="text-purple-400 ml-2">
                {user?.name}
              </span>
            </p>

            {user?.role === 'admin' && (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ADMIN
              </span>
            )}
          </div>
        </div>

        {/* STATS - USER VIEW */}
        {user?.role !== 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

            {/* PROMPTS */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition">
              <h3 className="text-gray-400 text-sm mb-2">
                Total Prompts
              </h3>

              <h2 className="text-4xl font-bold text-purple-400">
                {promptCount}
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Prompts written by you
              </p>
            </div>

            {/* VIDEOS */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-indigo-500 transition">
              <h3 className="text-gray-400 text-sm mb-2">
                Generated Videos
              </h3>

              <h2 className="text-4xl font-bold text-indigo-400">
                {videoCount}
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                AI videos generated
              </p>
            </div>

            {/* ACTIVITIES */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-pink-500 transition">
              <h3 className="text-gray-400 text-sm mb-2">
                Activities
              </h3>

              <h2 className="text-4xl font-bold text-pink-400">
                {activities.length}
              </h2>

              <p className="text-gray-500 mt-2 text-sm">
                Your dashboard activities
              </p>
            </div>
          </div>
        )}

        {/* ADMIN STATS */}
        {user?.role === 'admin' && dashboardStats && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Platform Statistics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* TOTAL USERS */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 border border-blue-500 rounded-xl p-6">
                <h3 className="text-blue-200 text-sm mb-2">Total Users</h3>
                <h2 className="text-4xl font-bold text-blue-300">
                  {dashboardStats.totalUsers || 0}
                </h2>
                <p className="text-blue-300/70 mt-2 text-sm">Platform users</p>
              </div>

              {/* TOTAL ACTIVITIES */}
              <div className="bg-gradient-to-br from-purple-900 to-purple-800 border border-purple-500 rounded-xl p-6">
                <h3 className="text-purple-200 text-sm mb-2">Total Activities</h3>
                <h2 className="text-4xl font-bold text-purple-300">
                  {dashboardStats.totalActivities || 0}
                </h2>
                <p className="text-purple-300/70 mt-2 text-sm">User activities</p>
              </div>

              {/* TOTAL VIDEOS */}
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 border border-indigo-500 rounded-xl p-6">
                <h3 className="text-indigo-200 text-sm mb-2">Total Videos</h3>
                <h2 className="text-4xl font-bold text-indigo-300">
                  {dashboardStats.totalVideos || 0}
                </h2>
                <p className="text-indigo-300/70 mt-2 text-sm">Generated by AI</p>
              </div>

              {/* TOTAL FEEDBACK */}
              <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-500 rounded-xl p-6">
                <h3 className="text-green-200 text-sm mb-2">Total Feedback</h3>
                <h2 className="text-4xl font-bold text-green-300">
                  {dashboardStats.totalFeedback || 0}
                </h2>
                <p className="text-green-300/70 mt-2 text-sm">User feedback submissions</p>
              </div>

              {/* ACTIVITY TYPES */}
              <div className="bg-gradient-to-br from-orange-900 to-orange-800 border border-orange-500 rounded-xl p-6">
                <h3 className="text-orange-200 text-sm mb-2">Action Types</h3>
                <h2 className="text-4xl font-bold text-orange-300">
                  {dashboardStats.activitiesByType?.length || 0}
                </h2>
                <p className="text-orange-300/70 mt-2 text-sm">Different actions</p>
              </div>
            </div>

            {/* ACTIVITIES BY TYPE */}
            {dashboardStats.activitiesByType && dashboardStats.activitiesByType.length > 0 && (
              <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Activities Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {dashboardStats.activitiesByType.map((type, idx) => (
                    <div key={idx} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <p className="text-gray-400 text-sm capitalize">{type._id || 'Unknown'}</p>
                      <p className="text-2xl font-bold text-purple-400 mt-2">{type.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOP USERS */}
            {dashboardStats.topUsers && dashboardStats.topUsers.length > 0 && (
              <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Top Active Users</h3>
                <div className="space-y-3">
                  {dashboardStats.topUsers.map((topUser, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div>
                        <p className="font-semibold text-purple-400">{topUser.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-400">{topUser.email || 'N/A'}</p>
                      </div>
                      <span className="bg-indigo-600 px-3 py-1 rounded-full text-sm font-bold">{topUser.count} activities</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* USER FEEDBACKS (ADMIN VIEW) */}
            {feedbacks.length > 0 && (
              <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">User Feedbacks</h3>
                <div className="space-y-4">
                  {feedbacks.map((fb) => (
                    <div key={fb._id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-purple-400">{fb.userName || 'Anonymous'}</p>
                          <div className="flex text-yellow-400 text-sm">
                            {Array.from({ length: fb.rating || 0 }).map((_, i) => (
                              <span key={i}>⭐</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-2 bg-gray-900/50 p-3 rounded border border-gray-700">
                        "{fb.message}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2">

            {/* ACTIVITIES */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {user?.role === 'admin'
                    ? 'All Activities'
                    : 'Your Activities'}
                </h2>
                <button
                  onClick={() => {
                    const userId = user?._id || user?.id;
                    if (userId) {
                      setLoading(true);
                      Promise.all([
                        fetchUserVideos(),
                        fetchActivities(userId, user?.role),
                        user?.role === 'admin' ? fetchDashboardStats() : Promise.resolve(),
                        user?.role === 'admin' ? fetchAllFeedbacks() : Promise.resolve()
                      ]).finally(() => setLoading(false));
                    }
                  }}
                  className="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded transition flex items-center gap-2"
                  title="Refresh all data"
                >
                  <span>🔄</span> Refresh
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <p className="text-gray-400 ml-4">Loading activities...</p>
                </div>
              ) : activities.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  {user?.role === 'admin' 
                    ? 'No activities recorded yet.'
                    : 'No activities yet. Start creating videos!'}
                </p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div
                      key={activity._id}
                      className="bg-gray-800 p-4 rounded-lg border border-gray-600 hover:border-purple-500 transition"
                    >
                      <div className="flex justify-between items-start mb-2">

                        <div>
                          <h3 className="font-semibold text-lg capitalize">
                            {activity.action?.replace(
                              /_/g,
                              ' '
                            )}
                          </h3>

                          {user?.role ===
                            'admin' && (
                            <p className="text-xs text-gray-400 mt-1">
                              By:
                              <span className="text-purple-400 ml-1">
                                {
                                  activity.userName
                                }
                              </span>
                              {activity.userEmail && (
                                <span className="text-gray-500 ml-2">
                                  ({activity.userEmail})
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          activity.status === 'success'
                            ? 'bg-green-600'
                            : activity.status === 'failed'
                            ? 'bg-red-600'
                            : 'bg-yellow-600'
                        }`}>
                          {activity.status || 'unknown'}
                        </span>
                      </div>

                      {activity.videoTitle && (
                        <p className="text-sm text-gray-300 mb-2">
                          📹{' '}
                          {
                            activity.videoTitle
                          }
                        </p>
                      )}

                      {/* PROMPT */}
                      {activity.prompt && (
                        <div className="bg-gray-900 border border-gray-700 rounded p-3 mt-3">
                          <p className="text-xs text-gray-400 mb-1">
                            Prompt Used:
                          </p>

                          <p className="text-sm text-purple-300 line-clamp-2">
                            {
                              activity.prompt
                            }
                          </p>
                        </div>
                      )}

                      {activity.description && (
                        <p className="text-sm text-gray-400 mt-3">
                          {
                            activity.description
                          }
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(
                          activity.createdAt ||
                            activity.timestamp ||
                            Date.now()
                        ).toLocaleDateString()}{' '}
                        {new Date(
                          activity.createdAt ||
                            activity.timestamp ||
                            Date.now()
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RECENT VIDEOS */}
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 mt-8">
              <h2 className="text-2xl font-bold mb-6">
                Recent Generated Videos
              </h2>

              {userVideos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No generated videos found.
                </p>
              ) : (
                <div className="space-y-4">
                  {userVideos
                    .slice(0, 5)
                    .map((video, index) => (
                      <div
                        key={
                          video._id || index
                        }
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-indigo-500 transition"
                      >
                        <h3 className="font-semibold text-lg text-purple-400">
                          {video.name ||
                            video.title ||
                            'AI Generated Video'}
                        </h3>

                        <p className="text-sm text-gray-400 mt-2">
                          <span className="text-white font-medium">
                            Prompt:
                          </span>{' '}
                          {video.prompt ||
                            'No prompt available'}
                        </p>

                        {/* VIDEO LINK */}
                        {video.url && (
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition"
                          >
                            ▶ Watch Video →
                          </a>
                        )}

                        <p className="text-xs text-gray-500 mt-3">
                          {new Date(
                            video.createdAt ||
                              Date.now()
                          ).toLocaleDateString()}{' '}
                          at{' '}
                          {new Date(
                            video.createdAt ||
                              Date.now()
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 h-fit">

            <h2 className="text-2xl font-bold mb-4">
              Send Feedback
            </h2>

            <div className="space-y-4">

              {/* RATING */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Rating
                </label>

                <select
                  value={feedback.rating}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      rating: Number(
                        e.target.value
                      ),
                    })
                  }
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value={5}>
                    ⭐ Excellent
                  </option>

                  <option value={4}>
                    ⭐⭐⭐⭐ Good
                  </option>

                  <option value={3}>
                    ⭐⭐⭐ Average
                  </option>

                  <option value={2}>
                    ⭐⭐ Poor
                  </option>

                  <option value={1}>
                    ⭐ Very Poor
                  </option>
                </select>
              </div>

              {/* MESSAGE */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Message
                </label>

                <textarea
                  value={feedback.message}
                  onChange={(e) =>
                    setFeedback({
                      ...feedback,
                      message:
                        e.target.value,
                    })
                  }
                  placeholder="Share your thoughts..."
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white min-h-32"
                />
              </div>

              {/* BUTTON */}
              <button
                onClick={submitFeedback}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-2 rounded-lg hover:scale-105 transition font-semibold"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <ProtectedRoute>
      <UserDashboardContent />
    </ProtectedRoute>
  );
}