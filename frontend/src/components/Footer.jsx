// ...existing code...
export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <div className=" border-t border-gray-800 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
      <footer className="mx-auto max-w-screen-2xl px-6 md:px-10 py-12">

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">

          {/* LOGO + DESC */}
          <div className="col-span-full lg:col-span-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-lg font-bold text-white"
            >
              <img
                src="/logo.png"
                alt="Virtual Studio Logo"
                className="h-6 w-auto"
              />
              VIRTUAL <span className="text-purple-400">STUDIO</span>
            </a>

            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              AI Avatar Virtual Studio is an intelligent platform that helps creators generate professional AI videos from text scripts.
            </p>
          </div>

          {/* COLUMN */}
          {[
            {
              title: "Products",
              links: ["Overview", "Solutions", "Pricing", "AI Video Generator"]
            },
            {
              title: "Industry",
              links: ["About", "Careers", "Blog", "Educators"]
            },
            {
              title: "Support",
              links: ["Contact Us", "Help Center", "FAQ", "Documentation"]
            },
            {
              title: "Legal",
              links: ["Terms of Service", "Privacy Policy"]
            }
          ].map((section, i) => (
            <div key={i}>
              <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
                {section.title}
              </h3>

              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-purple-400 transition"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* BOTTOM */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">

          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Virtual Studio. All rights reserved.
          </p>

          {/* SOCIAL LINKS */}
          <div className="mt-3 flex justify-center gap-6 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition"
            >
              GitHub
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-purple-400 transition"
            >
              LinkedIn
            </a>
          </div>

        </div>

      </footer>
    </div>
  );
}