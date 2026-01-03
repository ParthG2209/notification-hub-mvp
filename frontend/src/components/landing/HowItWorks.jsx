import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Link2, Bell, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: "Create Your Account",
      description: "Sign up in seconds with Google, GitHub, or email. No credit card required.",
      color: "text-blue-400"
    },
    {
      icon: <Link2 className="h-8 w-8" />,
      title: "Connect Your Apps",
      description: "Securely link Gmail, Slack, Google Drive, and HubSpot with one-click OAuth authentication.",
      color: "text-purple-400"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Sync Notifications",
      description: "Click sync to fetch all your latest notifications. They'll appear in your unified dashboard instantly.",
      color: "text-green-400"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Stay Organized",
      description: "Filter, search, and manage all your notifications from one place. Never miss what matters.",
      color: "text-orange-400"
    }
  ];

  return (
    <section className="py-20 px-6 bg-black" id="how-it-works">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Get started in minutes
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Setting up your notification hub is quick and easy. Follow these simple steps.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connecting line - only between cards, not after last */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-8 h-0.5 bg-white/10 z-0" />
              )}

              {/* Card */}
              <div className="relative bg-zinc-900 border border-white/10 rounded-lg p-6 h-full">
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`mb-4 ${step.color}`}>
                  {step.icon}
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3 text-white">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;