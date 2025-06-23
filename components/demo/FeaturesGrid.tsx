'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Shield, Zap, Users, TrendingUp, Clock, Globe, Heart } from 'lucide-react';
import type { FeatureCard } from '@/lib/types/demo';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const features: FeatureCard[] = [
  {
    id: 'ai-intelligence',
    icon: 'Brain',
    title: 'Advanced AI Intelligence',
    description: 'State-of-the-art machine learning models trained on millions of medical cases provide accurate, instant analysis.',
    benefits: [
      '99.2% diagnostic accuracy',
      'Instant analysis in under 3 seconds',
      'Continuous learning from new cases'
    ],
    metrics: {
      label: 'Accuracy Rate',
      value: '99.2%'
    }
  },
  {
    id: 'security-privacy',
    icon: 'Shield',
    title: 'Bank-Level Security',
    description: 'Military-grade encryption and HIPAA compliance ensure your medical data stays private and secure.',
    benefits: [
      'End-to-end encryption',
      'HIPAA compliant infrastructure',
      'Zero data storage policy'
    ],
    metrics: {
      label: 'Security Score',
      value: 'A+'
    }
  },
  {
    id: 'instant-results',
    icon: 'Zap',
    title: 'Lightning Fast Results',
    description: 'Get comprehensive medical insights in seconds, not hours or days of waiting for appointments.',
    benefits: [
      'Sub-3 second response time',
      'Real-time processing',
      '24/7 availability'
    ],
    metrics: {
      label: 'Avg Response',
      value: '2.1s'
    }
  },
  {
    id: 'expert-network',
    icon: 'Users',
    title: 'Expert Medical Network',
    description: 'Connect with certified healthcare professionals across Nigeria for personalized care and consultations.',
    benefits: [
      '500+ certified doctors',
      'All major specialties covered',
      'Local Nigerian healthcare experts'
    ],
    metrics: {
      label: 'Doctors Available',
      value: '500+'
    }
  }
];

const iconComponents = {
  Brain,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Clock,
  Globe,
  Heart
};

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Parallax background effect
      if (backgroundRef.current) {
        gsap.to(backgroundRef.current, {
          yPercent: -20,
          ease: 'none',
          overwrite: true,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      }

      // Staggered card entrance animations
      cardsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { 
              opacity: 0, 
              y: 60, 
              scale: 0.9,
              rotateY: 10
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateY: 0,
              duration: 0.7,
              ease: 'back.out(1.7)',
              overwrite: true,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true
              },
              delay: index * 0.1
            }
          );

          // Hover micro-interactions
          const setupHoverAnimations = () => {
            const icon = card.querySelector('.feature-icon');
            const content = card.querySelector('.feature-content');
            const metrics = card.querySelector('.feature-metrics');

            card.addEventListener('mouseenter', () => {
              gsap.to(card, { 
                scale: 1.02, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(icon, { 
                scale: 1.1, 
                rotation: 5, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(content, { 
                y: -5, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(metrics, { 
                scale: 1.05, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });

            card.addEventListener('mouseleave', () => {
              gsap.to(card, { 
                scale: 1, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(icon, { 
                scale: 1, 
                rotation: 0, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(content, { 
                y: 0, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
              gsap.to(metrics, { 
                scale: 1, 
                duration: 0.3, 
                ease: 'power2.out' 
              });
            });
          };

          setupHoverAnimations();
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50 relative overflow-hidden"
      aria-labelledby="features-heading"
      style={{ 
        background: 'linear-gradient(135deg, #f9fafb 0%, #f0f9ff 50%, #ecfdf5 100%)' 
      }}
    >
      {/* Parallax Background Elements */}
      <div 
        ref={backgroundRef}
        className="absolute inset-0 pointer-events-none opacity-30"
      >
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200 rounded-full blur-3xl" />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-teal-200 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-3/4 w-32 h-32 bg-green-200 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2
            id="features-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Powerful Features for Better Health
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience cutting-edge healthcare technology designed to make medical information accessible and actionable
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = iconComponents[feature.icon as keyof typeof iconComponents];
            
            return (
              <div
                key={feature.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                role="article"
                aria-labelledby={`feature-${feature.id}-title`}
              >
                {/* Icon and Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="feature-icon w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-emerald-600" />
                  </div>
                  
                  {feature.metrics && (
                    <div className="feature-metrics text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {feature.metrics.value}
                      </div>
                      <div className="text-sm text-gray-500">
                        {feature.metrics.label}
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="feature-content">
                  <h3
                    id={`feature-${feature.id}-title`}
                    className="text-xl font-bold text-gray-800 mb-4 group-hover:text-emerald-700 transition-colors duration-300"
                    style={{ color: '#2D3748' }}
                  >
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Benefits List */}
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <li 
                        key={benefitIndex} 
                        className="flex items-center gap-3 text-sm text-gray-700"
                      >
                        <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}