"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import Link from "next/link";
import LoginModal from "@/components/login-modal";
import SignupModal from "@/components/signup-modal";

export default function LoginPage() {

  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");

  const handleOpenLogin = () => {
    setAuthModalMode("login");
    setAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthModalMode("signup");
    setAuthModalOpen(true);
  };

  const handleCloseModal = () => {
    setAuthModalOpen(false);
  };

  const handleSwitchToSignup = () => {
    setAuthModalMode("signup");
  };

  const handleSwitchToLogin = () => {
    setAuthModalMode("login");
  };

  const handleLoginSuccess=(userData :{role:string})=>{
  
    setAuthModalOpen(false);
    if(userData.role=="ADMIN"){
      router.push("/admin");

    }else{
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-red-50 to-pink-100 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-96 h-96 bg-red-400/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <Link href="/" className="inline-block mb-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Talenta
              </h1>
            </div>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Continue your creative journey with us</p>
        </motion.div>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="space-y-4"
        >
          <button
            onClick={handleOpenLogin}
            className="w-full bg-orange-500 py-4 rounded-lg text-white font-semibold hover:bg-orange-600 transition-all shadow-lg"
          >
            Sign In
          </button>
          
          <div className="text-center">
            <span className="text-gray-500">or</span>
          </div>
          
          <button
            onClick={handleOpenSignup}
            className="w-full bg-white border border-orange-500 py-4 rounded-lg text-orange-500 font-semibold hover:bg-orange-50 transition-all shadow-lg"
          >
            Create Account
          </button>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Create in silence. Be heard worldwide.</span>
          </div>
        </motion.div>
      </div>

      {/* Modals - Using the same pattern as Navbar */}
      {authModalMode === "login" && (
        <LoginModal
          isOpen={authModalOpen}
          onClose={handleCloseModal}
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}
      
      {authModalMode === "signup" && (
        <SignupModal
          isOpen={authModalOpen}
          onClose={handleCloseModal}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
    </div>
  );
}
