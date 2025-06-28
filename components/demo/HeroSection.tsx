'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, Play, FileText, Bot, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onStartDemo: () => void;
}

export default function HeroSection({ onStartDemo }: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [demoPreviewVisible, setDemoPreviewVisible] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Page load sequence
      const tl = gsap.timeline();

      // Title animation with 0.5s delay
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          ease: 'power2.out',
          delay: 0.5,
          overwrite: true
        }
      )
      // Subtitle animation with 0.7s delay from start
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          ease: 'power2.out',
          overwrite: true
        },
        0.7
      )
      // CTA buttons
      .fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.9 },
        { 
          opacity: 1, 
          scale: 1, 
          duration: 0.5, 
          ease: 'back.out(1.7)',
          overwrite: true
        },
        1.0
      )
      // Scroll indicator
      .fromTo(
        scrollIndicatorRef.current,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          ease: 'power2.out',
          overwrite: true
        },
        1.2
      );

      // Floating background elements animation
      floatingElementsRef.current.forEach((element, index) => {
        if (element) {
          gsap.to(element, {
            y: '20px',
            rotation: '5deg',
            duration: 3 + index * 0.5,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.3
          });
        }
      });

      // Scroll indicator pulse
      gsap.to(scrollIndicatorRef.current, {
        scale: 1.1,
        duration: 1.5,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleScrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const showDemoPreview = () => {
    setDemoPreviewVisible(true);
    
    gsap.to('.demo-preview-overlay', {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    });
    
    gsap.fromTo(
      '.demo-preview-content',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
    );
  };
  
  const hideDemoPreview = () => {
    gsap.to('.demo-preview-overlay', {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => setDemoPreviewVisible(false)
    });
  };

  return (
    <>
      <section
        ref={heroRef}
        className="relative min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center overflow-hidden"
        role="banner"
      >
        {/* Floating Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            ref={(el) => {
              if (el) floatingElementsRef.current[0] = el;
            }}
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-100 rounded-full opacity-60"
          />
          <div 
            ref={(el) => {
              if (el) floatingElementsRef.current[1] = el;
            }}
            className="absolute top-1/3 right-1/4 w-24 h-24 bg-teal-200 rounded-full opacity-40"
          />
          <div 
            ref={(el) => {
              if (el) floatingElementsRef.current[2] = el;
            }}
            className="absolute bottom-1/4 left-1/6 w-40 h-40 bg-green-100 rounded-full opacity-50"
          />
          <div 
            ref={(el) => {
              if (el) floatingElementsRef.current[3] = el;
            }}
            className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-emerald-200 rounded-full opacity-30"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1
              ref={titleRef}
              className="text-4xl md:text-5xl lg:text-7xl font-bold font-noto text-gray-800 mb-6 leading-tight"
            >
              See InfoRx in
              <span className="text-emerald-600 block">Action</span>
            </h1>

            <p
              ref={subtitleRef}
              className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto mb-12"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              Experience how our AI-powered platform transforms complex medical 
              information into clear, actionable insights for better health outcomes.
            </p>

            <div
              ref={ctaRef}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                style={{ borderRadius: '12px' }}
                onClick={showDemoPreview}
                aria-label="Start interactive demo"
              >
                <Play className="mr-2 h-6 w-6" />
                Start Interactive Demo
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent"
                style={{ borderRadius: '12px' }}
                asChild
              >
                <a href="/interpreter">Try AI Interpreter</a>
              </Button>
            </div>

            {/* Scroll Indicator */}
            <div
              ref={scrollIndicatorRef}
              className="flex flex-col items-center cursor-pointer"
              onClick={handleScrollToDemo}
              role="button"
              tabIndex={0}
              aria-label="Scroll to demo section"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleScrollToDemo();
                }
              }}
            >
              <span className="text-sm text-gray-500 mb-2 font-medium">
                Scroll to explore
              </span>
              <div className="w-12 h-12 border-2 border-emerald-300 rounded-full flex items-center justify-center hover:border-emerald-500 transition-colors duration-300">
                <ArrowDown className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Preview Modal */}
      {demoPreviewVisible && (
        <div 
          className="demo-preview-overlay fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={hideDemoPreview}
          style={{ opacity: 0 }}
        >
          <div 
            className="demo-preview-content bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              Interactive Demo Experience
            </h3>
            
            <div className="space-y-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Medical Document Analysis</h4>
                  <p className="text-gray-600">Upload prescriptions, lab results, or scans to get simplified explanations in seconds.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">AI-Powered Insights</h4>
                  <p className="text-gray-600">Get personalized health summaries and proactive recommendations from your records.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Secure Medical Vault</h4>
                  <p className="text-gray-600">Organize and access your medical history anytime, from any device.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 text-center">
              <p className="text-gray-600 mb-4">Start the interactive demo to experience these features in action.</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={hideDemoPreview}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    hideDemoPreview();
                    onStartDemo();
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Begin Interactive Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}