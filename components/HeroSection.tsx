'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Heart, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasAnimated) return;
    
    const ctx = gsap.context(() => {
      // Timeline for coordinated animations
      const tl = gsap.timeline();

      // Fade in and slide up animations
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out', 
          overwrite: true,
          onComplete: () => setHasAnimated(true)
        }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', overwrite: true },
          '-=0.4'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: true },
          '-=0.3'
        )
        .fromTo(
          illustrationRef.current,
          { opacity: 0, x: 50, scale: 0.9 },
          { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power2.out', overwrite: true },
          '-=0.6'
        );
    }, heroRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-b from-white to-sage-50 flex items-center justify-center px-4 py-20"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Content Side */}
        <div className="space-y-8">
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight"
          >
            Revolutionary Healthcare
            <span className="text-teal-600 block">For Nigeria</span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl"
          >
            InfoRx transforms healthcare accessibility across Nigeria with
            AI-powered diagnostics, telemedicine, and comprehensive medical
            support for every community.
          </p>

          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-4 text-lg font-semibold rounded-xl"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center gap-8 pt-8">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-teal-600" />
              <span className="text-slate-600 font-medium">50K+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-teal-600" />
              <span className="text-slate-600 font-medium">99% Satisfaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-teal-600" />
              <span className="text-slate-600 font-medium">HIPAA Compliant</span>
            </div>
          </div>
        </div>

        {/* Illustration Side */}
        <div
          ref={illustrationRef}
          className="relative flex items-center justify-center"
        >
          <div className="relative w-full max-w-lg">
            {/* Main Circle */}
            <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full relative mx-auto shadow-2xl">
              {/* Floating Elements */}
              <div className="absolute -top-8 -right-8 w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Heart className="h-8 w-8 text-teal-600" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-sage-200 rounded-full shadow-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <div className="absolute top-20 -left-8 w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Users className="h-7 w-7 text-teal-600" />
              </div>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl font-bold mb-2">24/7</div>
                  <div className="text-lg">Healthcare</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}