"use client";

import React, { useState } from "react";
import Spline from "@splinetool/react-spline";

const Home = () => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div
      id="home"
      className="min-h-screen pt-20 pb-16 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]"
    >
      <div className="mx-auto max-w-screen-2xl px-8">
        <section className="flex flex-col justify-between gap-10 md:gap-16 lg:flex-row items-center">

          {/* TEXT CONTENT */}
          <div className="flex flex-col items-center sm:text-center lg:items-start lg:text-left xl:w-5/12">
            <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl">
              Turn Your Script into Smart{" "}
              <span className="text-purple-400">
                AI Avatar Videos Instantly
              </span>
            </h1>

            <p className="mb-8 text-white leading-relaxed lg:w-4/5">
              AI Avatar is a web-based content creation platform that transforms simple text scripts into professional studio-quality videos using reusable digital avatars — no camera, no re-recording, and no watermark required.
            </p>

            <div className="flex gap-4">

              {/* WATCH DEMO */}
              <button
                onClick={() => setShowVideo(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:scale-105 transition"
              >
                Watch Demo
              </button>

              {/* GENERATE */}
              <button
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-full hover:scale-105 transition"
              >
                Generate Video
              </button>

            </div>
          </div>

          {/* SPLINE */}
          <div className="relative h-[400px] w-full xl:w-5/12 rounded-xl overflow-hidden bg-[#0B0B0F] border border-gray-700 hover:border-purple-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] transition duration-300">

            <Spline scene="https://prod.spline.design/B-zPYB8IbfXRxV1d/scene.splinecode" />

            {/* Watermark hide */}
            <div className="absolute bottom-0 right-0 w-40 h-14 bg-[#0B0B0F]"></div>
          </div>

        </section>
      </div>

      {/* 🔥 VIDEO POPUP */}
      {showVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">

          {/* CLOSE BUTTON */}
          <button
            onClick={() => setShowVideo(false)}
            className="absolute top-5 right-5 text-white text-3xl"
          >
            ✖
          </button>

          {/* VIDEO */}
          <div className="w-[90%] md:w-[700px] aspect-video">
            <iframe
              className="w-full h-full rounded-xl"
              src="https://www.youtube.com/embed/5y6R7LMUIQ0?autoplay=1&modestbranding=1&rel=0&controls=1&showinfo=0"
              title="Demo Video"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>

        </div>
      )}
    </div>
  );
};

export default Home;