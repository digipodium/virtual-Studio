// Activity tracking utility
export const trackActivity = async (activity) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const payload = {
      userId: user._id || 'anonymous',
      userName: user.name || 'Unknown User',
      userEmail: user.email || 'unknown@email.com',
      action: activity.action,
      description: activity.description || '',
      videoTitle: activity.videoTitle || '',
      videoUrl: activity.videoUrl || '',
      status: activity.status || 'success',
    };

    const res = await fetch('http://localhost:5000/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('Error tracking activity:', err);
    return false;
  }
};

export const trackVideoCreated = (videoTitle, videoUrl) => {
  return trackActivity({
    action: 'video_created',
    description: `Created video: ${videoTitle}`,
    videoTitle,
    videoUrl,
    status: 'success',
  });
};

export const trackLogin = (userName) => {
  return trackActivity({
    action: 'login',
    description: `User ${userName} logged in`,
    status: 'success',
  });
};

export const trackFeedback = (rating) => {
  return trackActivity({
    action: 'feedback_submitted',
    description: `Feedback submitted with rating ${rating}`,
    status: 'success',
  });
};

export const trackVideoEdit = (videoTitle) => {
  return trackActivity({
    action: 'video_edited',
    description: `Edited video: ${videoTitle}`,
    videoTitle,
    status: 'success',
  });
};

export const trackLogout = (userName) => {
  return trackActivity({
    action: 'logout',
    description: `User ${userName} logged out`,
    status: 'success',
  });
};
