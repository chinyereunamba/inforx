'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TrendingUp, MapPin, Users, Heart } from 'lucide-react';
import type { ImpactStat } from '@/lib/types';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const impactStats: ImpactStat[] = [
  {
    id: 'accessibility',
    label: 'Healthcare Accessibility',
    value: '85%',
    description: 'Improvement in rural healthcare access'
  },
  {
    id: 'response-time',
    label: 'Emergency Response',
    value: '40%',
    description: 'Faster emergency medical response'
  },
  {
    id: 'cost-reduction',
    label: 'Cost Savings',
    value: '60%',
    description: 'Reduction in healthcare expenses'
  },
  {
    id: 'satisfaction',
    label: 'Patient Satisfaction',
    value: '95%',
    description: 'Overall user satisfaction rate'
  }
];

export default function ImpactSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const beforeRef = useRef<HTMLDivElement>(null);
  const afterRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement[]>([]);

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

      // Before/After sections
      gsap.fromTo(
        [beforeRef.current, afterRef.current],
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
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

      // Stats animation
      gsap.fromTo(
        statsRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          stagger: 0.1,
          overwrite: true,
          scrollTrigger: {
            trigger: '.stats-grid',
            start: 'top 80%',
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
      className="py-24 bg-slate-50"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          <h2
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Transforming Nigerian Healthcare
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            See how InfoRx is revolutionizing healthcare delivery across Nigeria,
            making quality medical care accessible to every community.
          </p>
        </div>

        {/* Before/After Comparison */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {/* Before */}
          <div
            ref={beforeRef}
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Before InfoRx</h3>
            </div>
            
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Limited access to qualified healthcare professionals in rural areas</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Long waiting times and expensive medical consultations</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Lack of immediate emergency medical response</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Inconsistent healthcare quality across different regions</span>
              </li>
            </ul>
          </div>

          {/* After */}
          <div
            ref={afterRef}
            className="bg-white rounded-2xl p-8 shadow-lg border-2 border-teal-200"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4">
                <Heart className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">With InfoRx</h3>
            </div>
            
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>24/7 access to certified doctors through telemedicine platform</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Instant AI-powered preliminary diagnoses and treatment guidance</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Rapid emergency response coordination and ambulance services</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-teal-400 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span>Consistent, high-quality healthcare standards nationwide</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Impact Statistics */}
        <div className="stats-grid grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactStats.map((stat, index) => (
            <div
              key={stat.id}
              ref={(el) => {
                if (el) statsRef.current[index] = el;
              }}
              className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-teal-600" />
              </div>
              
              <div className="text-4xl font-bold text-teal-600 mb-4">
                {stat.value}
              </div>
              
              <h4 className="text-lg font-semibold text-slate-900 mb-2">
                {stat.label}
              </h4>
              
              <p className="text-slate-600 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}