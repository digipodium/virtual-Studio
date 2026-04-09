"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, Check, ArrowRight, Download, Video, Loader2, LayoutDashboard, Settings, LogOut, Search, PlusCircle, History, Users, MessageSquare } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const presetAvatars = [
  { id: '1', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '2', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '3', url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: '4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200' },
];

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState('user');
  const [selectedAvatarId, setSelectedAvatarId] = useState('1');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [userVideos, setUserVideos] = useState([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?.role) setRole(user.role);
    }
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && activeTab === 'history') {
      fetchUserVideos(token);
    }
  }, [activeTab]);

  const fetchUserVideos = async (token) => {
    setIsLoadingVideos(true);
    try {
      const response = await axios.get('http://localhost:5000/api/users/videos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUserVideos(response.data.videos || []);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      setSelectedAvatarId('upload');
    }
  };

  const handleGenerate = async () => {
    if (!script) {
      alert("Please enter a script.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('script', script);
      
      if (selectedAvatarId === 'upload' && uploadedImage) {
        formData.append('photo', uploadedImage);
      } else {
        formData.append('presetAvatarId', selectedAvatarId);
      }

      const response = await axios.post('http://localhost:5000/api/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setGeneratedVideoUrl(response.data.data.videoUrl);
        // Automatically save to dashboard
        const token = localStorage.getItem('token');
        if (token) {
          const newVideo = {
            name: script.substring(0, 30) + (script.length > 30 ? '...' : ''),
            url: response.data.data.videoUrl,
            createdAt: new Date().toISOString()
          };
          
          await axios.post('http://localhost:5000/api/users/save-video', {
            name: newVideo.name,
            url: newVideo.url
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUserVideos(prev => [newVideo, ...prev]);
          fetchUserVideos(token);
          setActiveTab('history');
        }
        alert("Video generated and saved to dashboard!");
      } else {
        alert("Failed to generate video.");
      }
    } catch (error) {
      console.error('Generation Error:', error);
      alert(error.response?.data?.error || "An error occurred during video generation. Please check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedVideoUrl) {
      const link = document.createElement("a");
      link.href = generatedVideoUrl;
      link.download = "ai-avatar-video.mp4";
      link.click();
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fc] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00c8f5] flex items-center justify-center text-white font-bold">A</div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00c8f5] to-blue-600">
            Anam AI
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('create')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'create' ? 'bg-[#00c8f5]/10 text-[#00c8f5] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <PlusCircle size={20} />
            {role === 'admin' ? 'Manage Videos' : 'Create Video'}
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === 'history' ? 'bg-[#00c8f5]/10 text-[#00c8f5] font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <History size={20} />
            {role === 'admin' ? 'All Videos' : 'My Videos'}
          </button>

          {role === 'admin' && (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              <Users size={20} />
              Users
            </button>
          )}

          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <LayoutDashboard size={20} />
            Analytics
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <Settings size={20} />
            Settings
          </button>
          <Link href="/feedback" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors mt-1">
            <MessageSquare size={20} />
            Feedback
          </Link>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors mt-2"
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">
            {activeTab === 'create' ? (role === 'admin' ? 'Admin Dashboard' : 'Studio Dashboard') : 'My Videos'}
          </h1>
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00c8f5]/50 focus:border-[#00c8f5] transition-all w-64"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00c8f5] to-[#00b5dd] p-1 cursor-pointer hover:shadow-md transition-shadow">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100&h=100" alt="User" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00c8f5]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          {activeTab === 'create' && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-200/60 p-6 md:p-10 relative z-10 backdrop-blur-xl bg-white/90">
                {generatedVideoUrl ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                    <div className="w-full max-w-2xl bg-black rounded-2xl overflow-hidden mb-8 shadow-2xl ring-1 ring-white/10 aspect-video relative group">
                      <video 
                        src={generatedVideoUrl} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay 
                      />
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#00c8f5] to-blue-500 hover:shadow-lg hover:-translate-y-0.5 text-white font-semibold rounded-full transition-all duration-300"
                      >
                        <Download size={20} />
                        Download Video
                      </button>
                      <button 
                        onClick={() => {
                          setGeneratedVideoUrl(null);
                          setScript('');
                        }}
                        className="flex items-center gap-2 px-8 py-3.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-full transition-all duration-300 shadow-sm"
                      >
                        Create another
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in zoom-in duration-500">
                    {/* Script Studio Card */}
                    <div 
                      onClick={() => router.push('/scriptstudio')}
                      className="group cursor-pointer bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl hover:border-[#00c8f5]/30 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#00c8f5]/20 to-purple-500/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="w-20 h-20 bg-[#00c8f5]/10 rounded-2xl flex items-center justify-center mb-6 text-[#00c8f5] group-hover:scale-110 transition-transform duration-300">
                        <Video size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Script Studio</h3>
                      <p className="text-gray-500 mb-8">
                        Generate amazing videos with our AI avatars. Write your script, choose your avatar, and get a professional video in seconds.
                      </p>
                      <button className="flex items-center gap-2 text-[#00c8f5] font-semibold group-hover:gap-4 transition-all">
                        Open Studio <ArrowRight size={20} />
                      </button>
                    </div>

                    {/* AI Assistant Card */}
                    <div 
                      onClick={() => router.push('/aiassistant')}
                      className="group cursor-pointer bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl hover:border-[#00c8f5]/30 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-[#00c8f5]/20 rounded-br-full -z-10 group-hover:scale-110 transition-transform"></div>
                      <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform duration-300">
                        <LayoutDashboard size={40} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">AI Assistant</h3>
                      <p className="text-gray-500 mb-8">
                        Interact with our Real-time AI Assistant. Speak directly using your microphone and have an engaging, face-to-face conversation.
                      </p>
                      <button className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
                        Launch Assistant <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in">
              {isLoadingVideos ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="animate-spin text-[#00c8f5]" size={40} />
                </div>
              ) : userVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userVideos.map((video, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                      <div className="aspect-video bg-black relative">
                        <video src={video.url} className="w-full h-full object-cover" controls />
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-gray-800 truncate">{video.name}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(video.createdAt).toLocaleDateString()}</p>
                        <div className="mt-4 flex justify-between items-center">
                          <a href={video.url} download className="text-[#00c8f5] hover:text-blue-600 transition-colors">
                            <Download size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video size={40} className="text-gray-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No videos yet</h2>
                  <p className="text-gray-500 mb-8 max-w-sm mx-auto">Your generated videos will appear here. Create your first avatar video to see it here.</p>
                  <button 
                    onClick={() => setActiveTab('create')}
                    className="px-8 py-3 bg-[#00c8f5] text-white font-semibold rounded-full hover:bg-cyan-500 transition-colors shadow-md"
                  >
                    Create Video
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}