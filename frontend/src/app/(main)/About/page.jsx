// app/about/page.jsx

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] text-white">

      {/* 🔥 Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          About Our
          <span className="text-purple-400"> Virtual Studio</span>
          
        </h1>
        <p className="text-gray-300 text-lg max-w-3xl mx-auto">
          We are building the future of human-like AI conversations using real-time avatars,
          voice intelligence, and powerful AI models. Our goal is to make communication
          smarter, faster, and more human.
        </p>
      </section>

      {/* 💡 What We Do */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Real-time AI Avatar",
            desc: "Interact with lifelike avatars that speak, listen, and respond instantly.",
          },
          {
            title: "Smart Conversations",
            desc: "Powered by advanced AI to deliver meaningful and human-like responses.",
          },
          {
            title: "Multi-language Support",
            desc: "Communicate globally with support for multiple languages.",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:scale-105 transition hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition"
          >
            <h3 className="text-xl font-semibold mb-3 text-[#a855f7] ">
              {item.title}
            </h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* 👨‍💻 Team */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-10">Our Team</h2>

        <div className="grid md:grid-cols-3 gap-8 ">
          {["Founder", "Developer", "AI Engineer"].map((role, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-xl p-6 text-center hover:shadow-[0_0_15px_rgba(124,58,237,0.3)] hover:-translate-y-1 transition"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gray-700 mb-4 flex items-center justify-center text-3xl ">
                👤
              </div>
              <h3 className="text-lg font-semibold ">Your Name</h3>
              <p className="text-sm text-gray-400 ">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🚀 CTA */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4">
          Start Building with 
           <span className="text-purple-400">AI Today</span>
        </h2>
        <p className="text-gray-400 mb-6">
          the power of AI-driven conversations.
        </p>

        {/* ✅ YAHI CHANGE KIYA HAI */}
        <div className="flex justify-center gap-4">
          <Link
            href="/pricing"
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-8 py-4 rounded-full hover:scale-105 transition"
          >
            View Pricing
          </Link>

          <Link
            href="/signup" // 👉 agar route alag hai to change kar lena
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:scale-105 transition"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}