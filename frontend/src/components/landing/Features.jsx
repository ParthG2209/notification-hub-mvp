import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, Shield, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Bell className="h-8 w-8 text-blue-400" />,
      title: "Unified Dashboard",
      description: "View all your notifications from Gmail, Slack, Google Drive, and HubSpot in one beautiful, organized interface.",
      color: "from-blue-500/20 to-cyan-500/20"
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-400" />,
      title: "Real-time Sync",
      description: "Get instant notifications as they arrive. Stay updated without constantly checking multiple apps.",
      color: "from-purple-500/20 to-pink-500/20"
    },
    {
      icon: <Shield className="h-8 w-8 text-green-400" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never store your passwords and you maintain full control.",
      color: "from-green-500/20 to-emerald-500/20"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-orange-400" />,
      title: "Smart Filtering",
      description: "Organize notifications by source, read status, or date. Find what matters most, instantly.",
      color: "from-orange-500/20 to-red-500/20"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-indigo-400" />,
      title: "One-Click Actions",
      description: "Mark as read, delete, or archive notifications without leaving the dashboard. Streamline your workflow.",
      color: "from-indigo-500/20 to-blue-500/20"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-pink-400" />,
      title: "Analytics & Insights",
      description: "Track notification trends, see what's important, and understand your communication patterns.",
      color: "from-pink-500/20 to-purple-500/20"
    }
  ];

  return (
    <section className="py-20 px-6 relative bg-agency-gradient" id="features">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Everything you need,
            <span className="block mt-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              all in one place
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stop juggling multiple apps. Notification Hub brings all your important updates together
            in a single, beautiful dashboard.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl group-hover:blur-2xl transition-all`} />
              <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-black/50 transition-all h-full">
                <div className="mb-4 p-3 bg-white/5 rounded-xl inline-block">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;