import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, FolderOpen, Target } from 'lucide-react';

const IntegrationsSection = () => {
  const integrations = [
    {
      name: 'Gmail',
      icon: <Mail className="h-10 w-10" />,
      description: 'Never miss an important email',
      stats: '2.5B+ users',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      iconColor: 'text-red-400'
    },
    {
      name: 'Slack',
      icon: <MessageSquare className="h-10 w-10" />,
      description: 'Stay on top of team messages',
      stats: '18M+ users',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    },
    {
      name: 'Google Drive',
      icon: <FolderOpen className="h-10 w-10" />,
      description: 'Track file updates and shares',
      stats: '1B+ users',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      name: 'HubSpot',
      icon: <Target className="h-10 w-10" />,
      description: 'Monitor CRM activities',
      stats: '184K+ customers',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      iconColor: 'text-orange-400'
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <div className={`${integration.iconColor} mb-4`}>
                  {integration.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-2 text-white">{integration.name}</h3>
                <p className="text-gray-400 text-sm mb-4 flex-grow">{integration.description}</p>
                
                {/* Stats */}
                <div className="text-xs text-gray-500 font-mono">{integration.stats}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;