'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Smartphone, UserCheck, Heart } from 'lucide-react';
import type { ProcessStep } from '@/lib/types';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const processSteps: ProcessStep[] = [
  {
    id: 'download',
    step: 1,
    title: 'Download & Sign Up',
    description: 'Get the MediGuide app and create your secure health profile in under 2 minutes.',
    icon: 'Smartphone'
  },
  {
    id: 'consult',
    step: 2,
    title: 'Consult with Experts',
    description: 'Connect with certified Nigerian doctors or use our AI diagnostics for immediate assistance.',
    icon: 'UserCheck'
  },
  {
    id: 'follow-up',
    step: 3,
    title: 'Follow-up & Care',
    description: 'Receive personalized treatment plans and ongoing support for your health journey.',
    icon: 'Heart'
  }
];

const iconComponents = {
  Smartphone,
  UserCheck,
  Heart
};

export default function ProcessSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLDivElement[]>([]);
  const connectorsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (hasAnimated) return;
    
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true,
            onEnter: () => setHasAnimated(true)
          }
        }
      );

      // Staggered step animations with scale effect
      gsap.fromTo(
        stepsRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          ease: 'back.out(1.7)',
          stagger: 0.2,
          overwrite: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Connector line animations
      gsap.fromTo(
        connectorsRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 0.5,
          ease: 'power2.out',
          stagger: 0.2,
          overwrite: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-b from-sage-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            How InfoRx Works
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Getting started with comprehensive healthcare is simple.
            Follow these three easy steps to transform your health journey.
          </p>
        </div>

        <div className="relative">
          {/* Mobile and Tablet Layout */}
          <div className="block lg:hidden space-y-12">
            {processSteps.map((step, index) => {
              const IconComponent = iconComponents[step.icon as keyof typeof iconComponents];
              
              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    if (el) stepsRef.current[index] = el;
                  }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <IconComponent className="h-10 w-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-sage-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed max-w-md">
                    {step.description}
                  </p>

                  {/* Connector for mobile */}
                  {index < processSteps.length - 1 && (
                    <div
                      ref={(el) => {
                        if (el) connectorsRef.current[index] = el;
                      }}
                      className="w-1 h-12 bg-teal-200 mt-8 origin-top"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-16 relative">
            {processSteps.map((step, index) => {
              const IconComponent = iconComponents[step.icon as keyof typeof iconComponents];
              
              return (
                <div
                  key={step.id}
                  ref={(el) => {
                    if (el) stepsRef.current[index] = el;
                  }}
                  className="flex flex-col items-center text-center relative"
                >
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center shadow-xl">
                      <IconComponent className="h-12 w-12 text-white" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-sage-400 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Individual connector for each step */}
                  {index < processSteps.length - 1 && (
                    <div
                      ref={(el) => {
                        if (el) connectorsRef.current[index] = el;
                      }}
                      className="absolute top-12 left-full w-16 h-0.5 bg-teal-300 origin-left z-10 opacity-60"
                      style={{ 
                        transform: 'translateY(-50%) translateX(-50%)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}