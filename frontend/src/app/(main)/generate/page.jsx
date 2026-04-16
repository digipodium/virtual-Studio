"use client";
import { useState, useRef } from "react";
import axios from "axios";
import ProtectedRoute from "@/components/ProtectedRoute";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function GeneratePageContent() {
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const handleGenerate = async () => {
    if (!script) return alert("Enter script");

    setLoading(true);

    try {
      // ✅ Using full API URL
      const res = await axios.post(`${API_URL}/api/generate`, {
        script: script,
      });

      console.log("Response:", res.data);
      videoRef.current.src = res.data.videoUrl;

    } catch (err) {
      console.log("Error:", err);
      alert("Error generating video");
    }

    setLoading(false);
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white p-6">
      
      <h1 className="text-3xl mb-6">Generate AI Video</h1>

      <textarea
        className="h-[200px] w-full xl:w-5/12 rounded-xl bg-[#0B0B0F] border border-gray-700 p-3 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition duration-300"
        placeholder="Enter your script..."
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="mt-4 px-6 py-3 bg-purple-600 rounded-full hover:scale-105 transition"
      >
        {loading ? "Generating..." : "Generate Video"}
      </button>

      <video
        ref={videoRef}
        controls
        autoPlay
        className="mt-6 w-full max-w-xl rounded-lg"
      />
    </div>
  );
}

export default function GeneratePage() {
  return (
    <ProtectedRoute>
      <GeneratePageContent />
    </ProtectedRoute>
  );
}