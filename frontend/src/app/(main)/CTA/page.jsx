import React from 'react'

const CTA = () => {
  return (
  
      <div className="py-20  bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="max-w-6xl mx-auto px-4">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 
    bg-gradient-to-r from-purple-600 to-indigo-600 
    rounded-2xl px-6 py-10 md:px-16 md:py-16 text-center md:text-left">

            {/* LEFT CONTENT */}
            <div className="text-left">
              <h2 className="text-3xl md:text-3xl font-bold text-white mb-2">
                Start Creating AI Videos Today 
              </h2>
              <p className="text-white/80">
                No camera. No editing. Just AI-powered videos.
              </p>
            </div>

            {/* RIGHT BUTTON */}
            <div>
              <button className="bg-white text-purple-600 px-10 py-5 rounded-full font-semibold hover:scale-105 transition">
                Create your free Account
              </button>
            </div>

          </div>

        </div>
      </div>
  )
}

export default CTA