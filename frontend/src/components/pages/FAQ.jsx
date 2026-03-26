import React from 'react'

const FAQ = () => {
  return (
    
      <div className="py-20 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">

          {/* HEADING */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              <span className="text-purple-500">Frequently Asked</span> Questions
            </h2>
            <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
              Learn more about how our AI Avatar platform works.
            </p>
          </div>

          {/* GRID */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {/* CARD 1 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 
           hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] 
           hover:-translate-y-1 transition">
              <h3 className="text-white font-semibold mb-2">
                How does the AI Avatar platform work?
              </h3>
              <p className="text-gray-400 text-sm">
                Users simply enter their text script, select an AI avatar and voice, and the system automatically generates a professional video. No camera recording or manual editing is required.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white font-semibold mb-2">
                Do I need to install any software?
              </h3>
              <p className="text-gray-400 text-sm">
                No installation is required. The platform is completely web-based and works directly in your browser.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white font-semibold mb-2">
                Can I reuse the same avatar for multiple videos?
              </h3>
              <p className="text-gray-400 text-sm">
                Yes. Our system provides reusable AI avatars that maintain consistent appearance and presentation style across all videos.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white font-semibold mb-2">
                Can I update my video after editing the script?
              </h3>
              <p className="text-gray-400 text-sm">
                Absolutely. You can modify your script anytime and instantly generate a new updated version of your video.
              </p>
            </div>

            {/* CARD 5 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white font-semibold mb-2">
                Is there any watermark on generated videos?
              </h3>
              <p className="text-gray-400 text-sm">
                No. Our platform generates watermark-free professional videos.
              </p>
            </div>

            {/* CARD 6 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white font-semibold mb-2">
                Where can this platform be used?
              </h3>
              <p className="text-gray-400 text-sm">
                Training & Educational Videos, Marketing & Promotional Content, Corporate Presentations, Social Media Content.
              </p>
            </div>

          </div>

        </div>
      </div>
  )
}

export default FAQ