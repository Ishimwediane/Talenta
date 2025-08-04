"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Heart, Phone, Facebook } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";

// Google OAuth types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
  });
  
  const { login, googleLogin, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearError();
    
    try {
      const credentials = {
        emailOrPhone: authMethod === 'email' ? formData.email : formData.phone,
        password: formData.password
      };
      
      await login(credentials);
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    clearError();
    
    try {
      // Initialize Google OAuth
      if (typeof window !== 'undefined' && window.google) {
        const token = await new Promise<string>((resolve, reject) => {
                  window.google!.accounts.id.initialize({
          client_id: '515390844254-0tmvbpm53bbk6no0vq0q243urf49u82s.apps.googleusercontent.com',
          ux_mode: 'popup',
          callback: (response: { credential: string }) => {
            resolve(response.credential);
          },
          on_error: () => {
            reject(new Error('Google login failed'));
          }
        });
          
          window.google!.accounts.id.prompt();
        });
        
        await googleLogin(token);
        router.push('/dashboard');
      } else {
        throw new Error('Google OAuth not available');
      }
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    // Simulate Facebook OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log("Facebook login attempt");
  };

  const handlePhoneLogin = async () => {
    setIsLoading(true);
    // Simulate phone verification
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    console.log("Phone login attempt:", formData.phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold gradient-text">Talenta</h1>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-300">
            Continue your creative journey with us
          </p>
        </motion.div>

        {/* Social Login Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="glass-effect p-6 rounded-2xl mb-6"
        >
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full glass-effect py-3 rounded-lg text-white hover:glow-effect transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleFacebookLogin}
              disabled={isLoading}
              className="w-full glass-effect py-3 rounded-lg text-white hover:glow-effect transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Facebook className="w-5 h-5" />
              Continue with Facebook
            </motion.button>
          </div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-4 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-effect p-8 rounded-2xl"
        >
          {/* Auth Method Toggle */}
          <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'email'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                authMethod === 'phone'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Phone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Email/Phone Field */}
            <div>
              <label className="block text-white font-semibold mb-2">
                {authMethod === 'email' ? 'Email Address' : 'Phone Number'}
              </label>
              <div className="relative">
                {authMethod === 'email' ? (
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                ) : (
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                )}
                <input
                  type={authMethod === 'email' ? 'email' : 'tel'}
                  name={authMethod}
                  value={authMethod === 'email' ? formData.email : formData.phone}
                  onChange={handleInputChange}
                  placeholder={authMethod === 'email' ? 'Enter your email' : 'Enter your phone number'}
                  required
                  className="w-full glass-effect pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white font-semibold mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  required
                  className="w-full glass-effect pl-10 pr-12 py-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  className="mr-2 w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-purple-400 hover:text-purple-300 transition-colors text-sm"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full glass-effect py-3 rounded-lg text-white font-semibold hover:glow-effect transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-6"
        >
          <p className="text-gray-300">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-purple-400 hover:text-purple-300 transition-colors font-semibold"
            >
              Sign up here
            </Link>
          </p>
        </motion.div>

        {/* Footer Quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-2">
            <Heart className="w-4 h-4" />
            <span className="text-sm">Create in silence. Be heard worldwide.</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 