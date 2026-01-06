import React from 'react';
import { Grid, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white p-2 rounded-lg">
                <Grid className="h-5 w-5 text-black" />
              </div>
              <span className="text-lg font-bold text-white">Notification Hub</span>
            </div>
            <p className="text-gray-400 text-sm max-w-md mb-4">
              The simplest way to manage all your notifications in one place.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github/ParthG2209.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5 text-gray-400" />
              </a>
              
              <a
                href="www.linkedin.com/in/parth-gupta-4598b8324"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 border border-white/10 hover:bg-white/5 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Product Links - Single Row */}
          <div>
            <h3 className="font-semibold mb-4 text-white text-sm">Product</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                How It Works
              </a>
              <a href="#integrations" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Integrations
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Pricing
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                About
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                Terms
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2026 Notification Hub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;