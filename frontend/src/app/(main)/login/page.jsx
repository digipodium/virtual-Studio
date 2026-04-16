"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { trackLogin } from "@/utils/activityTracker";
import { useAuth } from "@/context/AuthContext";

export default function Login() {

  const router = useRouter();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/users/login",
        {
          email: form.email,
          password: form.password
        }
      );

      // ✅ Success
      toast.success("Login Successful ✅");

      // 🔐 Use AuthContext to login
      login(res.data.user, res.data.token);

      // 📊 Track login activity
      await trackLogin(res.data.user.name);

      // 🚀 Redirect to appropriate dashboard based on role
      const userRole = res.data.user.role;
      console.log('User logged in with role:', userRole);
      console.log('Full user data:', res.data.user);
      
      if (userRole === 'admin') {
        console.log('Redirecting to admin dashboard');
        router.push("/admin/dashboard");
      } else {
        console.log('Redirecting to user dashboard');
        router.push("/user/dashboard");
      }

    } catch (error) {
      console.log(error);

      if (error.response) {
        toast.error(error.response.data.message || error.response.data.error || "Login failed ❌");
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

        {/* HEADING */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">
            <span className="text-purple-500">Welcome Back</span>
          </h2>
          <p className="text-gray-400 mt-2">
            Log in to Virtual Studio to access your content.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your Email"
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
              text-white rounded-md focus:border-purple-500 outline-none"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter Your password"
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 
              text-white rounded-md focus:border-purple-500 outline-none"
            />
          </div>

          {/* REMEMBER + FORGOT */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-gray-400">Remember me</span>
            </label>
            <Link href="/forgetpassword" className="text-purple-400 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 
            text-white font-semibold rounded-md hover:scale-105 transition"
          >
            Log In
          </button>

        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="text-purple-400 hover:underline">
            Sign up
          </Link>
        </div>

      </div>
    </div>
  );
}