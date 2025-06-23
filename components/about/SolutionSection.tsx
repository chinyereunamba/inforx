'use client';

import { useEffect, useRef } from 'react';
import { Brain, Shield, Zap, Users } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { SolutionFeature } from '@/lib/types/about';
import { gsap } from 'gsap';

const solutions: SolutionFeature[] = [
  {
    id: 'ai-powered',
    title: 'AI-Powered Insights',
    description: 'Advanced machine learning algorithms translate complex medical data into clear, actionable insights',
    benefit: 'Reduces interpretation time by 80%'
  },
  {
    id: 'accessible',
    title: 'Universal Access',
    description: 'Cloud-based platform ensures healthcare guidance is available anywhere, anytime',
    benefit: 'Available 24/7 across all devices'
  },
  {
    id: 'instant',
    title: 'Instant Analysis',
    description: 'Real-time processing provides immediate medical guidance when you need it most',
    benefit: 'Response time under 3 seconds'
  },
  {
    id: 'personalized',
    title: 'Personalized Care',
    description: 'Tailored recommendations based on individual health profiles and medical history',
    benefit: 'Improves accuracy by 65%'
  }
];

const iconComponents = {
  'ai-powered': Brain,
  accessible: Shield,
  instant: Zap,
  personalized: Users
};

export default function SolutionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const { fadeInAnimation, slideInFromLeft, slideInFromRight } = useScrollAnimation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        fadeInAnimation([titleRef.current], { overwrite: true });
      }

      if (contentRef.current) {
        slideInFromLeft([contentRef.current], { overwrite: true });
      }

      if (imageRef.current) {
        slideInFromRight([imageRef.current], { overwrite: true });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [fadeInAnimation, slideInFromLeft, slideInFromRight]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-emerald-50 to-sky-50"
      aria-labelledby="solution-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2 
            id="solution-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Our Solution
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto">
            InfoRx transforms healthcare delivery through intelligent technology and human-centered design
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div ref={contentRef} className="space-y-8">
            {solutions.map((solution) => {
              const IconComponent = iconComponents[solution.id as keyof typeof iconComponents];
              
              return (
                <div key={solution.id} className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-emerald-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">
                      {solution.title}
                    </h3>
                    <p className="text-slate-600 mb-3 leading-relaxed">
                      {solution.description}
                    </p>
                    <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg inline-block">
                      {solution.benefit}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Side */}
          <div ref={imageRef} className="relative">
            <div className="bg-gradient-to-br from-emerald-400 to-sky-400 rounded-3xl p-12 shadow-2xl">
              <div className="bg-white rounded-2xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-slate-900">AI Health Assistant</h4>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      <strong>Patient:</strong> "I have a persistent headache and fatigue"
                    </p>
                  </div>
                  
                  <div className="bg-sky-50 rounded-lg p-4">
                    <p className="text-sm text-slate-700">
                      <strong>InfoRx:</strong> "Based on your symptoms, I recommend..."
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-slate-500">✓ Symptom analysis complete</div>
                      <div className="text-xs text-slate-500">✓ Treatment options identified</div>
                      <div className="text-xs text-slate-500">✓ Doctor consultation scheduled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}