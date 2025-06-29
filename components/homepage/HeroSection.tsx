'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, Play, Bot, Stethoscope, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { textToSpeech } from '@/lib/elevenlabs';


export default function HeroSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const illustrationRef = useRef<HTMLDivElement>(null);
  const floatingElementsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (hasAnimated) return;
    
    const ctx = gsap.context(() => {
      // Timeline for coordinated animations
      const tl = gsap.timeline({
        onComplete: () => setHasAnimated(true)
      });

      // Title animation with stagger effect
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8, 
          ease: 'power2.out',
          overwrite: true
        }
      )
      // Subtitle slide-up
      .fromTo(
        subtitleRef.current,
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.6, 
          ease: 'power2.out',
          overwrite: true
        },
        '-=0.4'
      )
      // CTA buttons with bounce effect
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          ease: 'back.out(1.7)',
          overwrite: true
        },
        '-=0.3'
      )
      // Hero illustration zoom effect
      .fromTo(
        illustrationRef.current,
        { opacity: 0, scale: 0.8, x: 50 },
        { 
          opacity: 1, 
          scale: 1, 
          x: 0,
          duration: 0.8, 
          ease: 'power2.out',
          overwrite: true
        },
        '-=0.6'
      );

      // Floating elements continuous animation
      floatingElementsRef.current.forEach((element, index) => {
        if (element) {
          gsap.to(element, {
            y: '15px',
            rotation: '3deg',
            duration: 3 + index * 0.5,
            ease: 'power2.inOut',
            repeat: -1,
            yoyo: true,
            delay: index * 0.3
          });
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center px-4 py-20 overflow-hidden"
      aria-label="banner"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-100 rounded-full opacity-40 blur-3xl" />
        <div className="absolute top-3/4 left-1/6 w-48 h-48 bg-blue-200 rounded-full opacity-20 blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Content Side */}
        <div className="space-y-8 text-center lg:text-left">
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-noto text-slate-900 leading-tight"
          >
            Simplifying Healthcare Through
            <span className="text-blue-500 block mt-2 font-noto">
              Intelligent Innovation
            </span>
          </h1>

          <p
            ref={subtitleRef}
            className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-2xl lg:max-w-none"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            AI-powered insights for lab results, prescriptions, and symptoms.
            Transform your healthcare experience with technology designed for
            Nigerian communities.
          </p>

          <div
            ref={ctaRef}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              asChild
            >
              <Link href="/demo">
                <Play className="mr-2 h-6 w-6" />
                Try Demo
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300"
              asChild
            >
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Illustration Side */}
        <div
          ref={illustrationRef}
          className="relative flex items-center justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-lg">
            {/* Main AI Interface Circle */}
            <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-blue-400 via-emerald-400 to-blue-500 rounded-full relative mx-auto shadow-2xl">
              {/* Floating UI elements around the main circle */}
              <div
                ref={(el) => {
                  if (el) floatingElementsRef.current[0] = el;
                }}
                className="absolute -top-8 -right-8 w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center transform rotate-12"
              >
                <div className="text-center">
                  <Bot className="w-8 h-8 text-blue-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-slate-700">
                    AI Powered
                  </div>
                </div>
              </div>

              <div
                ref={(el) => {
                  if (el) floatingElementsRef.current[1] = el;
                }}
                className="absolute -bottom-6 -left-6 w-16 h-16 bg-emerald-500 rounded-xl shadow-lg flex items-center justify-center transform -rotate-12"
              >
                <div className="text-center">
                  <div className="text-sm font-bold text-white">3s</div>
                  <div className="text-xs text-emerald-100">Response</div>
                </div>
              </div>

              <div
                ref={(el) => {
                  if (el) floatingElementsRef.current[2] = el;
                }}
                className="absolute top-20 -left-10 w-18 h-18 bg-white rounded-full shadow-lg flex items-center justify-center"
              >
                <div className="text-center p-2">
                  <div className="text-sm font-bold text-slate-800">50K+</div>
                  <div className="text-xs text-slate-600">Patients</div>
                </div>
              </div>

              {/* Center content representing health AI */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-12 h-12 text-white" />
                  </div>
                  <div className="text-xl font-bold mb-1">Nigerian</div>
                  <div className="text-lg">Healthcare AI</div>
                </div>
              </div>
            </div>

            {/* Additional floating health elements */}
            <div
              ref={(el) => {
                if (el) floatingElementsRef.current[3] = el;
              }}
              className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-full shadow-md flex items-center justify-center"
            >
              <Heart className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}