import Spline from "@splinetool/react-spline";
 export default function Home() {
   return (
    <main className="bg-gray-50">

      {/* HERO SECTION */}
      
      <div className="pt-12 md:pt-20 pb-16 md:pb-24">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <section className="flex flex-col justify-between gap-6 sm:gap-10 md:gap-16 lg:flex-row items-center">
            {/* text content - start */}
            <div className="flex flex-col items-center justify-center sm:text-center lg:items-start lg:text-left xl:w-5/12">
              <h1 className="mb-8 text-4xl font-bold text-black sm:text-5xl md:mb-12 md:text-5xl">
                Turn Your Script into Smart <span className="text-violet-500">AI Avatar Videos Instantly</span>
              </h1>
              <p className="mb-8 leading-relaxed text-gray-500 md:mb-12 lg:w-4/5 xl:text-lg">
                AI Avatar is a web-based content creation platform that transforms simple text scripts into professional studio-quality videos using reusable digital avatars — no camera, no re-recording, and no watermark required.
              </p>
              <div className=" flex justify-center mb-8">
                {/* Secondary CTA */}
                <button className="border border-gray-500 px-6 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition"
                >
                  Watch Demo
                </button>
              </div>
              <form className="flex w-full gap-2 md:max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="w-full flex-1 rounded-md border bg-white px-3 py-2 text-gray-800 placeholder-gray-500 outline-none ring-indigo-300 transition duration-100 focus:ring"
                />
                <button
                  type="submit"
                  className="bg-violet-800 hover:bg-violet-900 text-white px-6 py-3 rounded-lg transition"
                >
                  Generate Video
                </button>
              </form>
            </div>
            {/* text content - end */}

            {/* image - start */}
            <div className="h-[400px] w-full xl:w-5/12 rounded-xl overflow-hidden shadow-xl bg-black">
  <Spline scene="https://prod.spline.design/B-zPYB8IbfXRxV1d/scene.splinecode" />
</div>
            {/* image - end */}
          </section>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          <div className="mb-10 md:mb-16">
            <h2 className="mb-4 text-center text-3xl font-bold text-gray-800 md:mb-6 lg:text-4xl">
              Intelligent <span className="text-violet-500">AI Avatar Video Creation</span>
            </h2>
            <p className="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">
              Transform simple text scripts into professional studio-quality avatar videos using advanced AI technology — fast, scalable, and watermark-free.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:gap-12 xl:grid-cols-4">
            {/* feature 1 */}
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 md:h-14 md:w-14 md:rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold md:text-xl text-gray-800">Script-Based Video Generation</h3>
              <p className="text-gray-500 leading-relaxed">
                Convert simple text scripts into professional AI avatar videos instantly without manual recording
              </p>
            </div>

            {/* feature 2 */}
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 md:h-14 md:w-14 md:rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold md:text-xl text-gray-800">Reusable Digital Avatar</h3>
              <p className="text-gray-500 leading-relaxed">
                Create once and reuse your AI avatar multiple times while maintaining consistent presentation style.
              </p>
            </div>

            {/* feature 3 */}
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 md:h-14 md:w-14 md:rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold md:text-xl text-gray-800">Instant Video Rendering</h3>
              <p className="text-gray-500 leading-relaxed">
                Generate high-quality videos within minutes using automated AI processing.
              </p>
            </div>

            {/* feature 4 */}
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 md:h-14 md:w-14 md:rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold md:text-xl text-gray-800">Scalable Content Production</h3>
              <p className="text-gray-500 leading-relaxed">
                Update your script anytime and generate new videos instantly — perfect for training, marketing, and educational content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ SECTION */}
      <div className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
          {/* text - start */}
          <div className="mb-10 md:mb-16">
            <h2 className="mb-4 text-center text-3xl font-bold text-gray-800 md:mb-6 lg:text-4xl">
              <span className="text-violet-500">Frequently Asked</span> Questions
            </h2>
            <p className="mx-auto max-w-screen-md text-center text-gray-500 md:text-lg">
              Learn more about how our AI Avatar platform transforms scripts into professional studio-quality videos instantly.
            </p>
          </div>
          {/* text - end */}

          <div className="grid gap-8 sm:grid-cols-2 md:gap-12 xl:grid-cols-3 xl:gap-16">
            {/* question 1 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-indigo-600 md:text-xl">
                How does the AI Avatar platform work?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Users simply enter their text script, select an AI avatar and voice, and the system automatically generates a professional video. No camera recording or manual editing is required.
              </p>
            </div>

            {/* question 2 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-indigo-600 md:text-xl">
                Do I need to install any software?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No installation is required. The platform is completely web-based and works directly in your browser.
              </p>
            </div>

            {/* question 3 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-indigo-600 md:text-xl">
                Can I reuse the same avatar for multiple videos?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yes. Our system provides reusable AI avatars that maintain consistent appearance and presentation style across all videos.
              </p>
            </div>

            {/* question 4 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-indigo-600 md:text-xl">
                Can I update my video after editing the script?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Absolutely. You can modify your script anytime and instantly generate a new updated version of your video.
              </p>
            </div>

            {/* question 5 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-indigo-600 md:text-xl">
                Is there any watermark on generated videos?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                No. Our platform generates watermark-free professional videos.
              </p>
            </div>

            {/* question 6 */}
            <div>
              <h3 className="mb-2 text-lg font-semibold text-indigo-600 md:text-xl">
                Where can this platform be used?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Training & Educational Videos

                Marketing & Promotional Content

                Corporate Presentations

                Social Media Content
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}