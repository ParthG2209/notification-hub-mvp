import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

const CTA = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-6 relative bg-agency-gradient" id="cta">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent"
          animate={{
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

      <div className="max-w-4xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl" />
          
          <div className="relative bg-black/40 border border-white/10 rounded-3xl p-12 backdrop-blur-sm text-center">
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to simplify your notifications?
            </h2>
            
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of users who have already streamlined their workflow. 
              Start managing all your notifications from one beautiful dashboard.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="text-lg px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <p className="text-sm text-gray-500">
                No credit card required • Free forever
              </p>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    500+
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    10k+
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Notifications Synced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    99.9%
                  </div>
                  <div className="text-sm text-gray-400 mt-1">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;