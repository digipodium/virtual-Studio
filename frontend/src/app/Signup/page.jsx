import Link from 'next/link';

export default function Signup() {
  return (
    <div className="flex justify-center items-center min-h-[75vh] bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900"><span className="text-violet-500">Create an Account</span></h2>
          <p className="text-gray-500 mt-2">Start analyzing your spreadsheets with AI.</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" 
              placeholder="XYZ" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
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
              placeholder="Create a strong password" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" 
            />
          </div>
          
          <div className="flex items-start">
            <input 
              type="checkbox" 
              id="terms" 
              className="mt-1 mr-2 rounded text-indigo-600 focus:ring-indigo-500" 
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the <Link href="/" className="text-indigo-600 hover:text-indigo-500 hover:underline">Terms of Service</Link> and <Link href="/" className="text-indigo-600 hover:text-indigo-500 hover:underline">Privacy Policy</Link>.
            </label>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-violet-500 text-white font-semibold rounded-md hover:bg-violet-800 transition shadow-sm"
          >
           Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-indigo-600 font-semibold hover:underline hover:text-indigo-500">Log in</Link>
        </div>
      </div>
    </div>
  );
}