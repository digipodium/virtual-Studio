import React from 'react'
import Spline from '@splinetool/react-spline'
const Home = () => {
  return (
    <div id="#home" className="pt-12 md:pt-20 pb-16 md:pb-24 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
      <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
        <section className="flex flex-col justify-between gap-6 sm:gap-10 md:gap-16 lg:flex-row items-center">
          {/* text content - start */}
          <div className="flex flex-col items-center justify-center sm:text-center lg:items-start lg:text-left xl:w-5/12">
            <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl md:mb-12 md:text-5xl">
              Turn Your Script into Smart <span className="text-purple-400">AI Avatar Videos Instantly</span>
            </h1>
            <p className="mb-8 leading-relaxed text-white md:mb-12 lg:w-4/5 xl:text-lg">
              AI Avatar is a web-based content creation platform that transforms simple text scripts into professional studio-quality videos using reusable digital avatars — no camera, no re-recording, and no watermark required.
            </p>
            <div className=" flex justify-center mb-8 gap-4">
              {/* Secondary CTA */}
              <button className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:scale-105 transition"
              >
                Watch Demo
                
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:scale-105 transition"
              >
                Generate Video
              </button>
            </div>
          </div>
          {/* text content - end */}

          {/* image - start */}
          
          <div className="relative h-[400px] w-full xl:w-5/12 rounded-xl overflow-hidden 
              bg-[#0B0B0F] border border-gray-700 
               hover:border-purple-500 
              hover:shadow-[0_0_30px_rgba(124,58,237,0.6)] 
              transition duration-300">

       {/* Spline */}
        <Spline scene="https://prod.spline.design/B-zPYB8IbfXRxV1d/scene.splinecode" />

       {/* 🔥 Watermark Hide Layer */}
        <div className="absolute bottom-0 right-0 w-40 h-14 bg-[#0B0B0F]"></div>

     </div>
          {/* image - end */}
        </section>
      </div>
    </div>

  )
}

export default Home