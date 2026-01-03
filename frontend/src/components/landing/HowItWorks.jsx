import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Link2, Bell, Sparkles } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10" />,
      title: "Create Your Account",
      description: "Sign up in seconds with Google, GitHub, or email. No credit card required.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Link2 className="h-10 w-10" />,
      title: "Connect Your Apps",
      description: "Securely link Gmail, Slack, Google Drive, and HubSpot with one-click OAuth authentication.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Bell className="h-10 w-10" />,
      title: "Sync Notifications",
      description: "Click sync to fetch all your latest notifications. They'll appear in your unified dashboard instantly.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: "Stay Organized",
      description: "Filter, search, and manage all your notifications from one place. Never miss what matters.",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-20 px-6 relative bg-agency-gradient" id="how-it-works">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
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
            Get started in minutes
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Setting up your notification hub is quick and easy. Follow these simple steps
            and you'll be managing all your notifications in no time.
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-orange-500/20 -translate-y-1/2" />

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
                <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:bg-black/50 transition-all h-full">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`mb-4 p-4 bg-gradient-to-br ${step.color} rounded-xl inline-block text-white`}>
                    {step.icon}
                  </div>

                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-8 -translate-y-1/2 z-10">
                    <svg viewBox="0 0 24 24" fill="none" className="text-purple-500/50">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;