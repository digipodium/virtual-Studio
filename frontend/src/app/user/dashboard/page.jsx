'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

function UserDashboardContent() {
  const router = useRouter();
  const { user: authUser } = useAuth();
    const [userVideos, setUserVideos] = useState([]);

  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: 5, message: '' });

  useEffect(() => {
    // Use auth context user
    if (authUser) {
      setUser(authUser);
      fetchActivities(authUser._id, authUser.role);
    }
  }, [authUser]);
  // add
 const fetchUserVideos = async (userId) => {
  try {
    const res = await fetch(
      `http://127.0.0.1:5000/api/video/user/${userId}`
    );
    const data = await res.json();

    if (data.success) {
      setUserVideos(data.videos);
    }
  } catch (err) {
    console.error(err);
  }
};

  const fetchActivities = async (userId, userRole) => {
    try {
      // If user is admin, fetch all activities. Otherwise, fetch only user's activities
      const endpoint = userRole === 'admin' 
        ? 'http://localhost:5000/api/activity/all'
        : `http://localhost:5000/api/activity/user/${userId}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.success) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/users/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          userName: user.name,
          rating: feedback.rating,
          message: feedback.message,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Feedback submitted successfully!');
        setFeedback({ rating: 5, message: '' });
      }
    } catch (err) {
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white py-12 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-2">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Your Dashboard'}
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-gray-400">Welcome back, <span className="text-purple-400">{user?.name}</span></p>
            {user?.role === 'admin' && (
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                ADMIN
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities List */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
              <h2 className="text-2xl font-bold mb-6">
                {user?.role === 'admin' ? 'All Activities' : 'Your Activities'}
              </h2>
              
              {loading ? (
                <p className="text-gray-400">Loading activities...</p>
              ) : activities.length === 0 ? (
                <p className="text-gray-400">No activities yet. Start creating videos!</p>
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
                            {activity.action.replace('_', ' ')}
                          </h3>
                          {user?.role === 'admin' && (
                            <p className="text-xs text-gray-400 mt-1">
                              By: <span className="text-purple-400">{activity.userName}</span> ({activity.userEmail})
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-purple-600 px-2 py-1 rounded">
                          {activity.status}
                        </span>
                      </div>
                      {activity.videoTitle && (
                        <p className="text-sm text-gray-300 mb-2">📹 {activity.videoTitle}</p>
                      )}
                      <p className="text-sm text-gray-400">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(activity.timestamp).toLocaleDateString()} {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 h-fit">
            <h2 className="text-2xl font-bold mb-4">Send Feedback</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <select
                  value={feedback.rating}
                  onChange={(e) => setFeedback({ ...feedback, rating: Number(e.target.value) })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value={5}>⭐ Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ Good</option>
                  <option value={3}>⭐⭐⭐ Average</option>
                  <option value={2}>⭐⭐ Poor</option>
                  <option value={1}>⭐ Very Poor</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  placeholder="Share your thoughts..."
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white min-h-32"
                />
              </div>

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
