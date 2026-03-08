import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-4 md:px-8 py-4 bg-white border-b shadow-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3">
        {/* Make sure the file in your public folder is exactly named logo.png */}
        <img 
          src="/logo.jpeg" 
          alt="Virtual Studio" 
          className="h-12 w-auto object-contain" 
        />
        {/* Hidden on mobile to save space, visible on larger screens */}
        <h2 className="text-2xl font-bold text-gray-800 hidden sm:block">
          VIRTUAL <span className="text-violet-500">STUDIO</span>
        </h2>
      </Link>
      <div className=" flex items-center gap-x-12">
      
      <div className="hover:text-blue-600">Home</div>
      <div className=" hover:text-blue-600 px-1">Contact</div>
      <div className="hover:text-blue-600 px-1">Service</div>
      <div className="hover:text-blue-600 px-1">About us</div>
      </div>
        
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <Link 
          href="/login" 
          className="px-4 py-2 text-gray-600 font-medium hover:text-indigo-600 transition"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition shadow-sm"
        >
          Sign up
        </Link>
      </div>
    </nav>
  );
}