// ...existing code...
export default function Footer() {
  const year = new Date().getFullYear();
  return (
<div className="bg-gray-50">
  <footer className="mx-auto max-w-screen-2xl px-4 md:px-8">
    <div className="mb-8 grid grid-cols-2 gap-8 pt-8 md:grid-cols-4 lg:grid-cols-6">
      <div className="col-span-full lg:col-span-2">
        {/* logo - start */}
        <div className="mb-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-lg font-bold text-black md:text-xl"
            aria-label="logo"
          >
            <img 
              src="/logo.jpeg" 
              alt="Virtual Studio Logo" 
              className="h-6 w-auto object-contain" 
            />
            VIRTUAL <span className="text-violet-500">STUDIO</span>
          </a>
        </div>
        {/* logo - end */}
        
        {/* description - start */}
        <p className="mb-6 text-sm text-gray-500 sm:pr-8">
          AI Avatar Virtual Studio is an intelligent content creation platform that enables businesses, educators, and creators to generate professional AI-powered videos instantly from text scripts.
        </p>
        {/* description - end */}
      </div>

      {/* nav - start */}
      <div>
        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-800">
          Products
        </div>
        <nav className="flex flex-col gap-3">
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Overview
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Solutions
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Pricing
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Customers
            </a>
          </div>
        </nav>
      </div>
      {/* nav - end */}

      {/* nav - start */}
      <div>
        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-800">
          Company
        </div>
        <nav className="flex flex-col gap-3">
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              About
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Our Mission
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Careers
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Blog
            </a>
          </div>
        </nav>
      </div>
      {/* nav - end */}

      {/* nav - start */}
      <div>
        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-800">
          Support
        </div>
        <nav className="flex flex-col gap-3">
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Contact Us
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Help Center
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              FAQ
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Documentation
            </a>
          </div>
        </nav>
      </div>
      {/* nav - end */}

      {/* nav - start */}
      <div>
        <div className="mb-4 text-sm font-bold uppercase tracking-widest text-gray-800">
          Legal
        </div>
        <nav className="flex flex-col gap-3">
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Terms of Service
            </a>
          </div>
          <div>
            <a href="#" className="text-sm text-gray-500 transition duration-100 hover:text-indigo-500 active:text-indigo-600">
              Privacy Policy
            </a>
          </div>
        </nav>
      </div>
      {/* nav - end */}
    </div>

    <div className="border-t py-6 text-center text-sm text-gray-400">
      © {new Date().getFullYear()} Virtual Studio. All rights reserved.
    </div>
  </footer>
</div>

  );
}