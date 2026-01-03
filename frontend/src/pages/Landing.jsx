import React from 'react';
import { HeroSection } from '../components/ui/dynamic-hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import IntegrationsSection from '../components/landing/IntegrationsSection';
import Footer from '../components/landing/Footer';

const Landing = () => {
  const handleGetStarted = () => {
    // This will be connected to your router navigation
    window.location.href = '/login';
  };

  const navItems = [
    { 
      id: 'features', 
      label: 'Features', 
      href: '#features' 
    },
    { 
      id: 'how-it-works', 
      label: 'How It Works', 
      href: '#how-it-works' 
    },
    { 
      id: 'integrations', 
      label: 'Integrations', 
      href: '#integrations' 
    },
    { 
      id: 'get-started', 
      label: 'Get Started', 
      onClick: handleGetStarted
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroSection
        heading="All Your Notifications, One Dashboard"
        tagline="Stop switching between apps. Notification Hub brings Gmail, Slack, Google Drive, and HubSpot notifications together in one beautiful, unified interface."
        buttonText="Get Started Free"
        onButtonClick={handleGetStarted}
        imageUrl="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60"
        navItems={navItems}
      />
      
      <Features />
      <HowItWorks />
      <IntegrationsSection />
      <Footer />
    </div>
  );
};

export default Landing;