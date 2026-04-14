"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function Signup() {
const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔒 Password match check
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/signup",
        {
          name: form.name,
          email: form.email,
          password: form.password
        }
      );

      toast.success("Signup Successful ✅");
      router.push('/login');
      console.log(res.data);

    } catch (error) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message || "Signup failed ❌");
      } else {
        toast.error("Server error ❌");
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen 
    bg-gradient-to-r from-[#0B0B0F] via-[#1a0b2e] to-[#0B0B0F] px-4 py-8">

      <div className="w-full max-w-md p-8 bg-[#111827] 
      rounded-xl shadow-lg border border-gray-700">

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-purple-500">Create an Account</span>
          </h2>
          <p className="text-gray-400 mt-2">
            Start creating AI videos instantly.
          </p>
        </div>
        
        <form className="space-y-5" onSubmit={handleSubmit}>

          <input 
            type="text"
            name="name"
            placeholder="Enter your name"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
            text-white rounded-md focus:border-purple-500 outline-none"
          />

          <input 
            type="email"
            name="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
            text-white rounded-md focus:border-purple-500 outline-none"
          />

          <input 
            type="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
            text-white rounded-md focus:border-purple-500 outline-none"
          />

          <input 
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
            text-white rounded-md focus:border-purple-500 outline-none"
          />

          <div className="flex items-start text-sm">
            <input type="checkbox" className="mt-1 mr-2" required />
            <span className="text-gray-400">
              I agree to the{" "}
              <Link href="/" className="text-purple-400 hover:underline">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/" className="text-purple-400 hover:underline">
                Privacy Policy
              </Link>
            </span>
          </div>

          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 
            text-white font-semibold rounded-md hover:scale-105 transition"
          >
            Create Account
          </button>

        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-purple-400 hover:underline">
            Log in
          </Link>
        </div>

      </div>
    </div>
  );
}