import React from 'react';
import { motion } from 'framer-motion';

const IntegrationsSection = () => {
  const integrations = [
    {
      name: 'Gmail',
      icon: '📧',
      description: 'Never miss an important email',
      color: 'bg-red-500'
    },
    {
      name: 'Slack',
      icon: '💬',
      description: 'Stay on top of team messages',
      color: 'bg-purple-500'
    },
    {
      name: 'Google Drive',
      icon: '📁',
      description: 'Track file updates and shares',
      color: 'bg-blue-500'
    },
    {
      name: 'HubSpot',
      icon: '🎯',
      description: 'Monitor CRM activities',
      color: 'bg-orange-500'
    }
  ];

  return (
    <section className="py-20 px-6 relative bg-agency-gradient" id="integrations">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 12,
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
            Works with your
            <span className="block mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              favorite tools
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Seamlessly integrate with the apps you use every day. More integrations coming soon!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {integrations.map((integration, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
              <div className="relative bg-black/40 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-black/50 transition-all text-center">
                <div className={`w-16 h-16 ${integration.color} rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg`}>
                  {integration.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{integration.name}</h3>
                <p className="text-gray-400 text-sm">{integration.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-8 text-center backdrop-blur-sm"
        >
          <h3 className="text-2xl font-semibold mb-3 text-white">More integrations coming soon</h3>
          <p className="text-gray-400 mb-6">
            Microsoft Teams, Trello, Asana, and many more. Have a request? Let us know!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['Teams', 'Trello', 'Asana', 'Notion', 'Discord'].map((app, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-gray-300"
              >
                {app}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationsSection;