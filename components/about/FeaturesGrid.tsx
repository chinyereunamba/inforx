'use client';

import { useEffect, useRef } from 'react';
import { Smartphone, Globe, Lock, Stethoscope, MessageSquare, BarChart } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import type { FeatureItem } from '@/lib/types/about';
import { gsap } from 'gsap';

const features: FeatureItem[] = [
  {
    id: 'mobile-first',
    icon: 'Smartphone',
    title: 'Mobile-First Design',
    description: 'Intuitive mobile experience designed for healthcare on-the-go'
  },
  {
    id: 'multilingual',
    icon: 'Globe',
    title: 'Multilingual Support',
    description: 'Available in multiple languages to serve diverse communities'
  },
  {
    id: 'secure',
    icon: 'Lock',
    title: 'HIPAA Compliant',
    description: 'Bank-level security ensures your medical data stays private'
  },
  {
    id: 'professional',
    icon: 'Stethoscope',
    title: 'Professional Network',
    description: 'Connect with certified healthcare professionals instantly'
  },
  {
    id: 'support',
    icon: 'MessageSquare',
    title: '24/7 Support',
    description: 'Round-the-clock assistance when you need it most'
  },
  {
    id: 'analytics',
    icon: 'BarChart',
    title: 'Health Analytics',
    description: 'Track and visualize your health journey over time'
  }
];

const iconComponents = {
  Smartphone,
  Globe,
  Lock,
  Stethoscope,
  MessageSquare,
  BarChart
};

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  
  const { fadeInAnimation, staggerChildren } = useScrollAnimation();

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        fadeInAnimation([titleRef.current], { overwrite: true });
      }

      if (sectionRef.current) {
        staggerChildren(sectionRef.current, '.feature-card', {
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          overwrite: true
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [fadeInAnimation, staggerChildren]);

  return (
    <section 
      ref={sectionRef}
      className="py-24 bg-white"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 
            id="features-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Why Choose InfoRx?
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto">
            Built with the latest technology and designed around your healthcare needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const IconComponent = iconComponents[feature.icon as keyof typeof iconComponents];
            
            return (
              <div
                key={feature.id}
                className="feature-card bg-slate-50 rounded-2xl p-8 hover:shadow-xl hover:bg-white transition-all duration-300 group border border-transparent hover:border-emerald-200"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl mb-6 group-hover:bg-emerald-200 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-emerald-600" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-700 transition-colors duration-300">
                  {feature.title}
                </h3>
                
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}