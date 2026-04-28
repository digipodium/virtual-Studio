import React from 'react'

const Testimonial = () => {
  return (

    <div className="py-20 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
      <div className="max-w-6xl mx-auto px-4">

        {/* HEADING */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What Our <span className="text-purple-500">Users Say</span>
          </h2>
          <p className="text-gray-400 mt-3">
            Real feedback from creators using our AI Avatar platform
          </p>
        </div>

        {/* TESTIMONIAL GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

          {/* CARD 1 */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 
      hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] 
      hover:-translate-y-1 transition">

            <p className="text-gray-400 text-sm mb-4">
              This platform completely changed how I create videos. No camera needed and results are amazing
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h4 className="text-white font-semibold">Amit Sharma</h4>
                <span className="text-gray-500 text-sm">Content Creator</span>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 
      hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] 
      hover:-translate-y-1 transition">

            <p className="text-gray-400 text-sm mb-4">
              Super fast and easy to use. I create training videos for my team in minutes!
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                R
              </div>
              <div>
                <h4 className="text-white font-semibold">Prabhat Maurya</h4>
                <span className="text-gray-500 text-sm">Business Owner</span>
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 
      hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] 
      hover:-translate-y-1 transition">

            <p className="text-gray-400 text-sm mb-4">
            Best AI video tool I’ve used so far. The avatars look realistic and professional
            </p>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">

              </div>
              <div>
                <h4 className="text-white font-semibold">Neeraj Wallia</h4>
                <span className="text-gray-500 text-sm">YouTuber</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Testimonial