'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import HeroSection from './HeroSection';
import InteractiveDemoSection from './InteractiveDemoSection';
import FeaturesGrid from './FeaturesGrid';
import CallToActionSection from './CallToActionSection';
import MedicalDocumentSimulator from './MedicalDocumentSimulator';
import VaultExperience from './VaultExperience';
import SummaryGenerator from './SummaryGenerator';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

type DemoStep = 'intro' | 'upload' | 'interpretation' | 'vault' | 'summary' | 'sharing' | 'complete';

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState<DemoStep>('intro');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Prefers-reduced-motion handling
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (prefersReducedMotion.matches) {
      // Disable or reduce animations for users who prefer reduced motion
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--animation-delay', '0s');
    }

    // Intersection Observer for lazy loading images (if we add them later)
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // Observe all lazy images
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach((img) => imageObserver.observe(img));

    return () => {
      imageObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isDemoMode && demoRef.current) {
      // Scroll to demo section when demo mode is activated
      demoRef.current.scrollIntoView({ behavior: 'smooth' });
      
      // Setup animations for demo components
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.demo-component',
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        );
      }, demoRef);
      
      return () => ctx.revert();
    }
  }, []);

  const startInteractiveDemo = () => {
    setIsDemoMode(true);
    setCurrentStep('upload');
  };
  
  const navigateToStep = (step: DemoStep) => {
    setCurrentStep(step);
  };

  return (
    <main 
      className="min-h-screen bg-white"
      role="main"
      aria-label="InfoRx product demonstration"
    >
      {!isDemoMode ? (
        <>
          {/* Hero Section with animated title and CTAs */}
          <HeroSection onStartDemo={startInteractiveDemo} />
          
          {/* Interactive Demo Section with before/after cards */}
          <InteractiveDemoSection />
          
          {/* Features Grid with hover animations and parallax */}
          <FeaturesGrid />
          
          {/* Call-to-Action with success metrics and floating CTA */}
          <CallToActionSection />
        </>
      ) : (
        // Interactive Demo Experience
        <div ref={demoRef} className="min-h-screen pt-20 pb-16 bg-gradient-to-br from-slate-50 via-white to-emerald-50">
          <div className="max-w-7xl mx-auto px-4">
            {/* Demo Progress Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => setIsDemoMode(false)}
                  className="text-sm font-medium text-slate-700 hover:text-blue-600 flex items-center gap-1"
                >
                  ← Back to Overview
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-emerald-600">Demo Experience</span>
                </div>
              </div>
              
              {/* Progress Steps */}
              <div className="w-full bg-slate-100 h-2 rounded-full mb-4">
                <div 
                  className="h-2 bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ 
                    width: 
                      currentStep === 'upload' ? '20%' : 
                      currentStep === 'interpretation' ? '40%' : 
                      currentStep === 'vault' ? '60%' : 
                      currentStep === 'summary' ? '80%' : 
                      currentStep === 'sharing' || currentStep === 'complete' ? '100%' : '10%' 
                  }}
                />
              </div>
              
              {/* Step Indicator */}
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {currentStep === 'upload' && "Upload Your Medical Document"}
                  {currentStep === 'interpretation' && "AI-Powered Interpretation"}
                  {currentStep === 'vault' && "Your Medical Vault"}
                  {currentStep === 'summary' && "Health Summary Generation"}
                  {currentStep === 'sharing' && "Share With Your Doctor"}
                  {currentStep === 'complete' && "Demo Complete!"}
                </h2>
                <p className="text-lg text-slate-600">
                  {currentStep === 'upload' && "Experience how InfoRx securely processes your medical documents"}
                  {currentStep === 'interpretation' && "See how our AI transforms complex medical jargon into understandable language"}
                  {currentStep === 'vault' && "All your health records, organized and accessible"}
                  {currentStep === 'summary' && "Get a comprehensive overview of your health status"}
                  {currentStep === 'sharing' && "Securely share your health information with healthcare providers"}
                  {currentStep === 'complete' && "You've seen the power of InfoRx. Ready to start your journey?"}
                </p>
              </div>
            </div>

            {/* Demo Components */}
            <div className="demo-component">
              {currentStep === 'upload' && (
                <MedicalDocumentSimulator 
                  onComplete={() => navigateToStep('interpretation')}
                />
              )}
              
              {currentStep === 'interpretation' && (
                <div className="flex flex-col items-center">
                  <div className="w-full max-w-5xl">
                    <MedicalDocumentSimulator 
                      showResults={true}
                      onComplete={() => navigateToStep('vault')}
                    />
                  </div>
                </div>
              )}
              
              {currentStep === 'vault' && (
                <VaultExperience 
                  onComplete={() => navigateToStep('summary')}
                />
              )}
              
              {currentStep === 'summary' && (
                <SummaryGenerator 
                  onComplete={() => navigateToStep('complete')}
                />
              )}
              
              {currentStep === 'complete' && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Demo Experience Complete!</h3>
                  <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                    You've experienced the core features of InfoRx. Imagine how these tools could help you 
                    better understand and manage your healthcare journey.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center">
                    <button 
                      onClick={() => setIsDemoMode(false)}
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium transition-colors"
                    >
                      Return to Overview
                    </button>
                    
                    <a 
                      href="/auth/signup"
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Create Free Account
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </main>
  );
}