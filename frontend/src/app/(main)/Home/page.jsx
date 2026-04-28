"use client";

import React, { useState } from "react";
import Spline from "@splinetool/react-spline";
import Link from "next/link";

const Home = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div
      id="home"
      className="min-h-screen pt-20 pb-16 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]"
    >
      <div className="mx-auto max-w-screen-2xl px-8">
        <section className="flex flex-col justify-between gap-10 md:gap-16 lg:flex-row items-center">

          {/* TEXT */}
          <div className="flex flex-col items-center sm:text-center lg:items-start lg:text-left xl:w-5/12">
            <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl">
              Turn Your Script into Smart{" "}
              <span className="text-purple-400">
                AI Avatar Videos Instantly
              </span>
            </h1>

            <p className="mb-8 text-white leading-relaxed lg:w-4/5">
              AI Avatar is a web-based content creation platform that transforms simple text scripts into professional studio-quality videos.
            </p>

            <div className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">

              {/* WATCH DEMO */}
              <button
                onClick={() => setShowVideo(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:scale-105 transition"
              >
                Watch Demo
              </button>

              {/* GENERATE */}
              <Link href="/scriptstudio">
                <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-full hover:scale-105 transition">
                  Generate Video
                </button>
              </Link>

            </div>
          </div>

          {/* SPLINE */}
          <div className="relative h-[400px] w-full xl:w-5/12 rounded-xl overflow-hidden bg-[#0B0B0F] border border-gray-700 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition duration-300">

            <Spline scene="https://prod.spline.design/B-zPYB8IbfXRxV1d/scene.splinecode" />

            <div className="absolute bottom-0 right-0 w-40 h-14 bg-[#0B0B0F]"></div>
          </div>

        </section>
      </div>

      {/* 🔥 VIDEO POPUP */}
      {showVideo && (
  <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">

    {/* CLOSE */}
    <button
      onClick={() => setShowVideo(false)}
      className="absolute top-5 right-5 text-white text-3xl z-50"
    >
      ✖
    </button>

    {/* FULLSCREEN VIDEO */}
    <video
      src="/demo.mp4"
      controls
      autoPlay
      className="w-full h-full object-contain"
    />

  </div>
)}
    </div>
  );
};

export default Home;