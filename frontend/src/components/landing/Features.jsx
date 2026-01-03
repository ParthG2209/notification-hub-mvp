import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Zap, Shield, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Unified Dashboard",
      description: "View all your notifications from Gmail, Slack, Google Drive, and HubSpot in one beautiful, organized interface.",
      accent: "bg-blue-500"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Real-time Sync",
      description: "Get instant notifications as they arrive. Stay updated without constantly checking multiple apps.",
      accent: "bg-purple-500"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never store your passwords and you maintain full control.",
      accent: "bg-green-500"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Smart Filtering",
      description: "Organize notifications by source, read status, or date. Find what matters most, instantly.",
      accent: "bg-orange-500"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "One-Click Actions",
      description: "Mark as read, delete, or archive notifications without leaving the dashboard. Streamline your workflow.",
      accent: "bg-indigo-500"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Analytics & Insights",
      description: "Track notification trends, see what's important, and understand your communication patterns.",
      accent: "bg-pink-500"
    }
  ];

  return (
    <section className="py-20 px-6 bg-black" id="features">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Everything you need, all in one place
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Stop juggling multiple apps. Notification Hub brings all your important updates together.
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
              className="group relative"
            >
              {/* Glassmorphism Card */}
              <div className="relative border border-white/10 rounded-lg p-6 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all h-full">
                {/* Accent bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${feature.accent} rounded-t-lg`} />
                
                {/* Icon */}
                <div className={`mb-4 p-3 ${feature.accent} rounded-lg inline-flex text-white backdrop-blur-sm bg-opacity-20`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;