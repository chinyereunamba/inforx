'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Video, MapPin, Clock, Users, Shield } from 'lucide-react';
import type { FeatureCard } from '@/lib/types';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const features: FeatureCard[] = [
  {
    id: 'ai-diagnostics',
    title: 'AI-Powered Diagnostics',
    description: 'Advanced machine learning algorithms provide accurate preliminary diagnoses and treatment recommendations.',
    icon: 'Brain'
  },
  {
    id: 'telemedicine',
    title: 'Telemedicine Platform',
    description: 'Connect with certified Nigerian doctors from anywhere, ensuring healthcare access for remote communities.',
    icon: 'Video'
  },
  {
    id: 'localized-care',
    title: 'Localized Healthcare',
    description: 'Tailored medical guidance specific to Nigerian health challenges and local disease patterns.',
    icon: 'MapPin'
  },
  {
    id: 'emergency-response',
    title: '24/7 Emergency Support',
    description: 'Round-the-clock emergency assistance with immediate triage and ambulance coordination.',
    icon: 'Clock'
  },
  {
    id: 'community-health',
    title: 'Community Health Networks',
    description: 'Building stronger healthcare communities through peer support and shared health resources.',
    icon: 'Users'
  },
  {
    id: 'data-security',
    title: 'Secure & Private',
    description: 'Bank-level encryption and HIPAA-compliant data protection for all your medical information.',
    icon: 'Shield'
  }
];

const iconComponents = {
  Brain,
  Video,
  MapPin,
  Clock,
  Users,
  Shield
};

export default function FeaturesGrid() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

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

      // Staggered card animations
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.15,
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
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          >
            Comprehensive Healthcare Solutions
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            InfoRx provides end-to-end healthcare services designed specifically
            for the Nigerian healthcare landscape.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = iconComponents[feature.icon as keyof typeof iconComponents];
            
            return (
              <div
                key={feature.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-teal-200"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-teal-100 rounded-xl mb-6 group-hover:bg-teal-200 transition-colors duration-300">
                  <IconComponent className="h-8 w-8 text-teal-600" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-teal-700 transition-colors duration-300">
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