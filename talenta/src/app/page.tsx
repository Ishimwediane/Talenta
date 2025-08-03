"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play, Mic, PenTool, Upload, Heart, Users, DollarSign } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold gradient-text"
            >
              Talenta
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:flex space-x-8"
            >
              <a href="/discover" className="text-white hover:text-gray-300 transition-colors">Discover</a>
              <a href="/upload" className="text-white hover:text-gray-300 transition-colors">Upload</a>
              <a href="#features" className="text-white hover:text-gray-300 transition-colors">Features</a>
              <a href="#contact" className="text-white hover:text-gray-300 transition-colors">Contact</a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex gap-3"
            >
              <a href="/auth/login" className="glass-effect px-6 py-2 rounded-full text-white hover:glow-effect transition-all">
                Sign In
              </a>
              <a href="/auth/signup" className="border border-white/20 px-6 py-2 rounded-full text-white hover:bg-white/10 transition-all">
                Get Started
              </a>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mt-10 relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-6xl md:text-8xl font-bold gradient-text text-shadow mb-8"
          >
            Create in silence.
            <br />
            <span className="text-white">Be heard worldwide.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            We are more than ideas — we are stories unfolding. 
            <br />
            Join Rwandan youth in sharing your voice through film, poetry, and podcasts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a href="/upload" className="glass-effect px-8 py-4 rounded-full text-white hover:glow-effect transition-all flex items-center gap-2 group">
              Start Creating
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="/discover" className="border border-white/20 px-8 py-4 rounded-full text-white hover:bg-white/10 transition-all">
              Watch Stories
            </a>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Your Creative Journey
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              From inspiration to income, we provide everything you need to share your story with the world.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Upload,
                title: "Upload & Share",
                description: "Share your short films, poetry, and podcasts with our global community.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Heart,
                title: "Get Discovered",
                description: "Connect with audiences who appreciate authentic, creative content.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: DollarSign,
                title: "Earn Rewards",
                description: "Monetize your creativity and build sustainable income from your passion.",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-effect p-8 rounded-2xl hover:glow-effect transition-all group"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Share Your Voice
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Choose your medium and let your creativity flow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Play,
                title: "Short Films",
                description: "Tell your story through the lens. Share moments that matter.",
                stats: "500+ Films"
              },
              {
                icon: Mic,
                title: "Podcasts",
                description: "Speak your truth. Share conversations that inspire change.",
                stats: "200+ Episodes"
              },
              {
                icon: PenTool,
                title: "Poetry",
                description: "Paint with words. Express emotions that connect hearts.",
                stats: "1000+ Poems"
              }
            ].map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-effect p-8 rounded-2xl text-center hover:glow-effect transition-all cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <type.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{type.title}</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">{type.description}</p>
                <div className="text-sm text-gray-400">{type.stats}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">
              Ready to Share Your Story?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of Rwandan youth who are already creating, sharing, and earning from their passion.
            </p>
            <a href="/upload" className="glass-effect px-12 py-4 rounded-full text-white hover:glow-effect transition-all text-lg font-semibold inline-block">
              Start Your Journey Today
            </a>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-2xl font-bold gradient-text mb-4">Talenta</div>
          <p className="text-gray-400 mb-6">
            Empowering Rwandan youth to share their voices with the world.
          </p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
