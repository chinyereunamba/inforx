'use client';

import { useEffect, useRef } from 'react';
import { AlertCircle, Clock, FileX, MapPin } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { ProblemPoint } from '@/lib/types/about';
import { gsap } from 'gsap';

const problems: ProblemPoint[] = [
  {
    id: 'complexity',
    title: 'Medical Complexity',
    description: 'Healthcare information is often too complex for patients to understand',
    impact: '73% of patients struggle with medical terminology'
  },
  {
    id: 'access',
    title: 'Limited Access',
    description: 'Geographic and economic barriers prevent timely healthcare access',
    impact: 'Rural areas have 40% fewer healthcare providers'
  },
  {
    id: 'time',
    title: 'Time Constraints',
    description: 'Long waiting times and rushed consultations compromise care quality',
    impact: 'Average consultation time: 7 minutes'
  },
  {
    id: 'fragmentation',
    title: 'Fragmented Care',
    description: 'Disconnected systems lead to incomplete patient information',
    impact: '60% of medical errors due to poor communication'
  }
];

const iconComponents = {
  complexity: AlertCircle,
  access: MapPin,
  time: Clock,
  fragmentation: FileX
};

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  
  const { fadeInAnimation, staggerChildren } = useScrollAnimation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        fadeInAnimation([titleRef.current], { overwrite: true });
      }

      if (sectionRef.current) {
        staggerChildren(sectionRef.current, '.problem-card', { overwrite: true });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [fadeInAnimation, staggerChildren]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-white"
      aria-labelledby="problems-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 
            id="problems-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            The Healthcare Challenge
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto">
            Traditional healthcare faces significant barriers that prevent optimal patient outcomes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((problem, index) => {
            const IconComponent = iconComponents[problem.id as keyof typeof iconComponents];
            
            return (
              <div
                key={problem.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className="problem-card bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-xl mb-6 group-hover:bg-red-200 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-red-600" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {problem.title}
                </h3>
                
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {problem.description}
                </p>
                
                <div className="text-sm font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {problem.impact}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}