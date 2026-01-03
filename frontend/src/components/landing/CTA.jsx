import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

const CTA = ({ onGetStarted }) => {
  return (
    <section className="py-20 px-6 bg-black" id="cta">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="border border-white/10 rounded-lg p-12 text-center bg-zinc-900">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Ready to get started?
            </h2>
            
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join hundreds of users who have already streamlined their workflow.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  onClick={onGetStarted}
                  className="text-lg px-8 py-3 bg-white text-black hover:bg-gray-200 border-0"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              
              <p className="text-sm text-gray-500">
                No credit card required
              </p>
            </div>

            {/* Stats */}
            <div className="pt-8 border-t border-white/10">
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-white mb-1">500+</div>
                  <div className="text-sm text-gray-400">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">10k+</div>
                  <div className="text-sm text-gray-400">Notifications Synced</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
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