"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex justify-between items-center px-4 md:px-8 py-4 bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F]">
      
      <Link href="/" className="flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Virtual Studio"
          className="h-12 w-auto object-contain"
        />
        <h2 className="text-2xl font-bold text-white hidden sm:block">
          VIRTUAL <span className="text-purple-500">STUDIO</span>
        </h2>
      </Link>

      <div className="hidden md:flex items-center space-x-8">
        
        <Link
          href="/#Home"
          className="text-slate-300 hover:text-purple-500 hover:underline hover:underline-offset-10 transition"
        >
          Home
        </Link>

        {/* ✅ FIXED FEATURES LINK */}
       <Link
  href="/Features"
  className="text-slate-300 hover:text-purple-500 hover:underline hover:underline-offset-10 transition"
>
  Features
</Link>

        <Link
          href="/#Demo"
          className="text-slate-300 hover:text-purple-500 hover:underline hover:underline-offset-10 transition"
        >
          Demo
        </Link>

        <Link
          href="/#contact"
          className="text-slate-300 hover:text-purple-500 hover:underline hover:underline-offset-10 transition"
        >
          Contact
        </Link>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <Link
          href="/login"
          className="px-4 py-2 text-gray-300 hover:text-purple-400 transition"
        >
          Login
        </Link>

        <Link
          href="/signup"
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full hover:scale-105 transition"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}