import React from 'react'
const Features = () => {
  return (

      <section id="#features"className="bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-4">
          

          {/* Heading */}
          <div className="-mt- mb-10 md:mb-18">
            <h2 className="mb-4 text-center text-3xl font-bold text-white md:mb-6 lg:text-4xl">
              Intelligent <span className="text-purple-500">AI Avatar Video Creation</span>
            </h2>
            <p className="mx-auto max-w-screen-md text-center text-gray-400 md:text-lg">
              Transform simple text scripts into professional studio-quality avatar videos using advanced AI technology — fast, scalable, and watermark-free.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {/* Feature 1 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <div className="mb-4 text-purple-400 text-2xl">💬</div>
              <h3 className="mb-2 text-lg font-bold text-purple-400">
                Script-Based Video Generation
              </h3>
              <p className="text-gray-400 text-sm">
                Convert simple text scripts into professional AI avatar videos instantly without manual recording
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <div className="mb-4 text-purple-400 text-2xl">🤖</div>
              <h3 className="mb-2 text-lg font-bold text-purple-400">
                Reusable Digital Avatar
              </h3>
              <p className="text-gray-400 text-sm">
                Create once and reuse your AI avatar multiple times with consistent presentation style.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <div className="mb-4 text-purple-400 text-2xl">⚡</div>
              <h3 className="mb-2 text-lg font-bold text-purple-400">
                Instant Video Rendering
              </h3>
              <p className="text-gray-400 text-sm">
                Generate high-quality videos within minutes using automated AI processing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <div className="mb-4 text-purple-400 text-2xl">📈</div>
              <h3 className="mb-2 text-lg font-bold text-purple-400">
                Scalable Content Production
              </h3>
              <p className="text-gray-400 text-sm">
                Update your script anytime and generate new videos instantly — perfect for training and marketing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <div className="mb-4 text-purple-400 text-2xl">🌍</div>
              <h3 className="mb-2 text-lg font-bold text-purple-400">
                Multi-Language Support
              </h3>
              <p className="text-gray-400 text-sm">
                Create videos in multiple languages with realistic AI voice and lip-sync technology.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <div className="mb-4 text-purple-400 text-2xl">🎨</div>
              <h3 className="mb-2 text-lg font-bold text-purple-400">
                Custom Avatar Styling
              </h3>
              <p className="text-gray-400 text-sm">
                Personalize your AI avatar with different styles, outfits, and backgrounds.
              </p>
            </div>

          </div>
        </div>
    </section>
    

  )
}

export default Features