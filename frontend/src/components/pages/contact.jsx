import React from "react";

const Contact = () => {
  return (
    <section
      id="contact"
      className="scroll-mt-24 py-20 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white">
            Get in Touch With{" "}
            <span className="text-purple-400">AI Avatar Studio</span>
          </h2>
          <p className="text-gray-400 mt-4">
            Have questions about AI avatar video creation? Our team is ready to help you.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* LEFT SIDE */}
          <div className="text-white">
            <h3 className="text-2xl font-semibold mb-4">
              Let’s Build Smart Videos Together
            </h3>

            <p className="text-gray-400 mb-6">
              AI Avatar Studio helps you create professional avatar videos from simple scripts.
              Whether you're a creator, business, or educator — we’re here to help.
            </p>

            <div className="space-y-4 text-gray-300">
              <p>📍 Location: Lucknow, India</p>
              <p>📧 Email: support@aiavatar.com</p>
              <p>📞 Phone: +91 XXXXX XXXXX</p>
            </div>
          </div>

          {/* RIGHT SIDE FORM */}
          <div className="bg-[#111827] p-8 rounded-xl border border-gray-700 shadow-lg">

            <form className="space-y-5">

              <div>
                <label className="text-gray-300 text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full mt-1 p-3 rounded-lg bg-[#111827] border border-gray-700 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full mt-1 p-3 rounded-lg bg-[#111827] border border-gray-700 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  className="w-full mt-1 p-3 rounded-lg bg-[#111827] border border-gray-700 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Message</label>
                <textarea
                  rows="4"
                  placeholder="Write your message..."
                  className="w-full mt-1 p-3 rounded-lg bg-[#111827] border border-gray-700 text-white outline-none focus:border-purple-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 rounded-lg hover:scale-105 transition"
              >
                Send Message 
              </button>

            </form>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;