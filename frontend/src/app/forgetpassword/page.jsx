"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import { useRouter } from 'next/navigation';


export default function ForgotPassword() {
  const [email, setEmail] = useState('');
const [loading, setLoading] = useState(false);
const router = useRouter();
//---- 1: otp send karne ke liye
 const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const res = await API.post("/users/forgot-password", { email: trimmedEmail });
      toast.success("OTP sent to your email!");
      // Email ko URL parameter mein bhej rahe hain taki next page pe use kar sakein
    router.push(`/auth/verifyOTP?email=${encodeURIComponent(trimmedEmail)}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found!");
    } finally {
      setLoading(false);
    }
}


  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] flex items-center justify-center p-4">
      <form onSubmit={handleSendOTP} className=" bg-[#111827] p-8 rounded-xl border border-slate-800 w-96 shadow-2xl text-center">
        <h2 className="text-2xl text-purple-500 font-bold mb-4 ">Forgot Password</h2>
        <p className='text-white text-sm mb-6 '>Enter email to receive a 6-digit OTP.</p>
         
           <input type="email" placeholder='Enter your Email' className='w-full p-3 bg-gray-800 text-white rounded-lg outline-none border border-slate-700 focus:border-cyan-600 transition-all mb-6'
           onChange={(e)=>{
            setEmail(e.target.value)
           }} required />
        
           <button
            disabled={loading}
             className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 
            text-white font-semibold rounded-md hover:scale-105 transition">
            {loading ? "Sending OTP..." : "Get OTP"}
          </button>
     
           <div className='mt-4 text-center'>
            <a href='/auth/login' className='text-sm font-semibold text-gray-500 hover:underline'>Back to login</a>
           </div>
      </form>
    </div>
  );
}