import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Wifi, Shield, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-palop-green/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-palop-blue/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-6">
              <span className="flex h-2 w-2 rounded-full bg-palop-green animate-ping"></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Instant Connectivity for PALOP</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black leading-[1.1] mb-6 text-palop-dark">
              Connect to <span className="text-gradient">Africa</span> <br/>
              Without Borders.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
              Get premium eSIM data plans for Portuguese-speaking African countries. No physical SIMs, no roaming fees, instant activation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/plans">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto gap-2 group">
                  Find Your Plan
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="glass" size="lg" className="w-full sm:w-auto">
                  See How it Works
                </Button>
              </Link>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 md:gap-8">
              {[
                { icon: Wifi, text: "5G/4G Speeds" },
                { icon: Globe, text: "Multi-Country" },
                { icon: Shield, text: "Secure Activation" },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600"
                >
                  <div className="w-8 h-8 rounded-full bg-palop-green/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-palop-green" />
                  </div>
                  {feature.text}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual/Image Side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-lg"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-palop-blue/20 border-8 border-white/50 glass-panel aspect-[4/5]">
              {/* hero scenic travel lifestyle shot */}
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=1500&fit=crop" 
                alt="Traveler connected with eSIM"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              
              {/* Floating UI Elements over the image */}
              <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white">
                  <div className="text-xs font-bold text-gray-500 uppercase mb-1">Status</div>
                  <div className="flex items-center gap-2 text-palop-green font-bold">
                    <Wifi className="w-4 h-4" /> Connected
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6 bg-gradient-to-r from-palop-blue to-palop-green rounded-2xl p-4 shadow-xl text-white transform rotate-2 pointer-events-none">
                <div className="text-sm font-bold opacity-90 mb-1">Angola Data Plan</div>
                <div className="text-2xl font-black">10 GB</div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
