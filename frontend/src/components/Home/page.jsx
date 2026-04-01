export default function Home() {
  return (
    <main className="bg-[#0B0B0F] text-white">

      {/* HERO SECTION */}

      <div className="pt-12 md:pt-20 pb-16 md:pb-24 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <section className="flex flex-col justify-between gap-6 sm:gap-10 md:gap-16 lg:flex-row items-center">
            {/* text content - start */}
            <div className="flex flex-col items-center justify-center sm:text-center lg:items-start lg:text-left xl:w-5/12">
              <h1 className="mb-8 text-4xl font-bold text-white sm:text-5xl md:mb-12 md:text-5xl">
                Turn Your Script into Smart <span className="text-purple-400">AI Avatar Videos Instantly</span>
              </h1>
              <p className="mb-8 leading-relaxed text-white-400 md:mb-12 lg:w-4/5 xl:text-lg">
                AI Avatar is a web-based content creation platform that transforms simple text scripts into professional studio-quality videos using reusable digital avatars — no camera, no re-recording, and no watermark required.
              </p>
              <div className=" flex justify-center mb-8 mt-5 gap-4">
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
            <div className="h-[400px] w-full xl:w-5/12 rounded-xl overflow-hidden shadow-xl bg-[#0B0B0F] border border-purple-500/200 shadow-[0_0_40px_rgba(124,58,237,0.3)]">
              <Spline scene="https://prod.spline.design/B-zPYB8IbfXRxV1d/scene.splinecode" />
            </div>
            {/* image - end */}
          </section>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="pt-12 md:pt-20 pb-16 md:pb-24 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">

          {/* Heading */}
          <div className="mb-10 md:mb-16">
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
      </div>


      {/* CTA */}
      <div className="py-20 bg-[#0B0B0F]">
        <div className="max-w-6xl mx-auto px-4">

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 
    bg-gradient-to-r from-purple-600 to-indigo-600 
    rounded-2xl px-20 py-25">

            {/* LEFT CONTENT */}
            <div className="text-left">
              <h2 className="text-3xl md:text-3xl font-bold text-white mb-2">
                Start Creating AI Videos Today 🚀
              </h2>
              <p className="text-white/80">
                No camera. No editing. Just AI-powered videos.
              </p>
            </div>

            {/* RIGHT BUTTON */}
            <div>
              <button className="bg-white text-purple-600 px-10 py-5 rounded-full font-semibold hover:scale-105 transition">
                Get Started
              </button>
            </div>

          </div>

        </div>
      </div>
      {/* TESTIMONIALS SECTION */}
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
          <div className="grid md:grid-cols-3 gap-8">

            {/* CARD 1 */}
            <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 
      hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] 
      hover:-translate-y-1 transition">

              <p className="text-gray-400 text-sm mb-4">
                This platform completely changed how I create videos. No camera needed and results are amazing!
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
                  <h4 className="text-white font-semibold">Riya Verma</h4>
                  <span className="text-gray-500 text-sm">Business Owner</span>
                </div>
              </div>
            </div>

            {/* CARD 3 */}
            <div className="bg-[#111827] p-6 rounded-xl border border-gray-700 
      hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] 
      hover:-translate-y-1 transition">

              <p className="text-gray-400 text-sm mb-4">
                "Best AI video tool I’ve used so far. The avatars look realistic and professional."
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <h4 className="text-white font-semibold">Sahil Khan</h4>
                  <span className="text-gray-500 text-sm">YouTuber</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* FAQ SECTION */}
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
              <h3 className="text-white-500 font-semibold mb-2">
                How does the AI Avatar platform work?
              </h3>
              <p className="text-gray-400 text-sm">
                Users simply enter their text script, select an AI avatar and voice, and the system automatically generates a professional video. No camera recording or manual editing is required.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white-500 font-semibold mb-2">
                Do I need to install any software?
              </h3>
              <p className="text-gray-400 text-sm">
                No installation is required. The platform is completely web-based and works directly in your browser.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white-500 font-semibold mb-2">
                Can I reuse the same avatar for multiple videos?
              </h3>
              <p className="text-gray-400 text-sm">
                Yes. Our system provides reusable AI avatars that maintain consistent appearance and presentation style across all videos.
              </p>
            </div>

            {/* CARD 4 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white-500 font-semibold mb-2">
                Can I update my video after editing the script?
              </h3>
              <p className="text-gray-400 text-sm">
                Absolutely. You can modify your script anytime and instantly generate a new updated version of your video.
              </p>
            </div>

            {/* CARD 5 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white-500 font-semibold mb-2">
                Is there any watermark on generated videos?
              </h3>
              <p className="text-gray-400 text-sm">
                No. Our platform generates watermark-free professional videos.
              </p>
            </div>

            {/* CARD 6 */}
            <div className="bg-[#111827] border border-gray-700 rounded-xl p-6 hover:border-purple-500 hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition">
              <h3 className="text-white-500 font-semibold mb-2">
                Where can this platform be used?
              </h3>
              <p className="text-gray-400 text-sm">
                Training & Educational Videos, Marketing & Promotional Content, Corporate Presentations, Social Media Content.
              </p>
            </div>

          </div>

        </div>
      </div>
      
    </main>
  );
}