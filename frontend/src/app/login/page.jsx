import Link from 'next/link';

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-[75vh] bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900"><span className="text-violet-500">Welcome Back</span></h2>
          <p className="text-gray-500 mt-2">Log in to Virtual Studio to access your Content.</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              placeholder="you@company.com" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="mr-2 rounded text-indigo-600 focus:ring-indigo-500" 
              />
              <span className="text-gray-600">Remember me</span>
            </label>
            <Link href="#" className="text-indigo-600 hover:text-indigo-500 hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <button 
            type="submit"
             className="w-full py-3 bg-violet-500 text-white font-semibold rounded-md hover:bg-violet-500 transition shadow-sm"
          >
            Log In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/signup" className="text-indigo-600 font-semibold hover:text-indigo-500 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}