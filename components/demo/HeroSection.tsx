'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement[]>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);

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

  return (
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
              onClick={handleScrollToDemo}
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
  );
}