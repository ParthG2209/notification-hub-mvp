import React from 'react';
import { motion } from 'framer-motion';

const IntegrationsSection = () => {
  const integrations = [
    {
      name: 'Gmail',
      icon: '📧',
      description: 'Never miss an important email',
      stats: '2.5B+ users',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    },
    {
      name: 'Slack',
      icon: '💬',
      description: 'Stay on top of team messages',
      stats: '18M+ users',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20'
    },
    {
      name: 'Google Drive',
      icon: '📁',
      description: 'Track file updates and shares',
      stats: '1B+ users',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      name: 'HubSpot',
      icon: '🎯',
      description: 'Monitor CRM activities',
      stats: '184K+ customers',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20'
    }
  ];

  return (
    <section className="py-20 px-6 bg-black" id="integrations">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Works with your favorite tools
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Seamlessly integrate with the apps you use every day.
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
              <div className={`border ${integration.borderColor} ${integration.bgColor} rounded-lg p-6 transition-all h-full flex flex-col`}>
                {/* Icon */}
                <div className="text-5xl mb-4">{integration.icon}</div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 text-white">{integration.name}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow">{integration.description}</p>
                
                {/* Stats */}
                <div className="text-xs text-gray-500 font-mono">{integration.stats}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border border-white/10 rounded-lg p-8 text-center bg-zinc-900"
        >
          <h3 className="text-xl font-semibold mb-3 text-white">More integrations coming soon</h3>
          <p className="text-gray-400 mb-6 text-sm">
            Microsoft Teams, Trello, Asana, and many more.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Teams', 'Trello', 'Asana', 'Notion', 'Discord'].map((app, idx) => (
              <span
                key={idx}
                className="px-4 py-2 border border-white/10 rounded-md text-sm text-gray-400 bg-black"
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