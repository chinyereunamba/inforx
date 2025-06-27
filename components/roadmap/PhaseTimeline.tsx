'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Users, Stethoscope, Brain, Shield, Globe } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Phase {
  id: string;
  title: string;
  period: string;
  status: 'current' | 'upcoming' | 'future';
  description: string;
  features: string[];
  icon: any;
  color: string;
}

const phases: Phase[] = [
  {
    id: 'mvp-1',
    title: 'MVP Phase 1',
    period: 'June 2025',
    status: 'current',
    description: 'Core platform foundation with AI-powered medical document interpretation',
    features: [
      'Dashboard Record Management',
      'Medical Summary Features', 
      'Authentication persistence fix',
      'UI refinements for interpreter results'
    ],
    icon: Brain,
    color: 'emerald'
  },
  {
    id: 'mvp-2',
    title: 'MVP Phase 2',
    period: 'July 2025',
    status: 'upcoming',
    description: 'Platform optimization and launch preparation',
    features: [
      'End-to-end testing of upload flow',
      'Summary generation optimization',
      'Performance optimization',
      'Security audit & documentation'
    ],
    icon: Shield,
    color: 'sky'
  },
  {
    id: 'provider-features',
    title: 'Healthcare Provider Features',
    period: 'Q3 2025',
    status: 'upcoming',
    description: 'Expanding platform for healthcare professionals',
    features: [
      'Doctor portal development',
      'Secure messaging system',
      'Nurse-side simplified view',
      'Hospital dashboard basics'
    ],
    icon: Stethoscope,
    color: 'emerald'
  },
  {
    id: 'enhanced-care',
    title: 'Enhanced Patient Care',
    period: 'Q4 2025',
    status: 'future',
    description: 'Advanced patient care tools and real-time features',
    features: [
      'Real-time test result delivery',
      'Drug usage tracking',
      'Medical image interpretation',
      'Export/share functionality'
    ],
    icon: Users,
    color: 'sky'
  },
  {
    id: 'advanced-features',
    title: 'Advanced Features',
    period: '2026+',
    status: 'future',
    description: 'Next-generation healthcare technology integration',
    features: [
      'Multi-device session syncing',
      'Offline PWA support',
      'Voice assistant integration',
      'Psychiatry patient tracking'
    ],
    icon: Globe,
    color: 'emerald'
  }
];

export default function PhaseTimeline() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const phaseRefs = useRef<HTMLDivElement[]>([]);

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
          duration: 0.6,
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

      // Timeline line animation
      gsap.fromTo(
        '.timeline-line',
        { scaleY: 0, transformOrigin: 'top' },
        {
          scaleY: 1,
          duration: 1.5,
          ease: 'power2.out',
          overwrite: true,
          scrollTrigger: {
            trigger: timelineRef.current,
            start: 'top 70%',
            end: 'bottom 30%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Phase cards stagger animation
      phaseRefs.current.forEach((phase, index) => {
        if (phase) {
          gsap.fromTo(
            phase,
            { 
              opacity: 0, 
              x: index % 2 === 0 ? -50 : 50,
              scale: 0.9
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.7,
              ease: 'back.out(1.7)',
              overwrite: true,
              scrollTrigger: {
                trigger: phase,
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true
              },
              delay: index * 0.2
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const getStatusColor = (status: string, color: string) => {
    const baseColors = {
      emerald: {
        current: 'from-emerald-500 to-emerald-600 text-white',
        upcoming: 'from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
        future: 'from-emerald-50 to-white text-emerald-600 border-emerald-200'
      },
      sky: {
        current: 'from-sky-500 to-sky-600 text-white',
        upcoming: 'from-sky-100 to-sky-200 text-sky-800 border-sky-300',
        future: 'from-sky-50 to-white text-sky-600 border-sky-200'
      }
    };

    return baseColors[color as keyof typeof baseColors][status as keyof typeof baseColors.emerald];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'current':
        return 'bg-emerald-500 text-white';
      case 'upcoming':
        return 'bg-sky-500 text-white';
      case 'future':
        return 'bg-slate-400 text-white';
      default:
        return 'bg-slate-400 text-white';
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 to-sky-50"
      aria-labelledby="timeline-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="timeline-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Development Timeline
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Our strategic roadmap from MVP launch to advanced healthcare technology platform
          </p>
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="relative">
          {/* Timeline Line */}
          <div className="timeline-line absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-emerald-500 to-sky-500 h-full hidden lg:block" />

          <div className="space-y-12 lg:space-y-20">
            {phases.map((phase, index) => {
              const IconComponent = phase.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={phase.id}
                  ref={(el) => {
                    if (el) phaseRefs.current[index] = el;
                  }}
                  className={`flex flex-col lg:flex-row items-center gap-8 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  {/* Content Card */}
                  <div className={`flex-1 ${isEven ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className={`bg-gradient-to-br ${getStatusColor(phase.status, phase.color)} rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:scale-105`}>
                      <div className={`flex items-center gap-4 mb-4 ${isEven ? 'lg:justify-end' : 'lg:justify-start'} justify-center`}>
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${getStatusBadge(phase.status)}`}>
                            {phase.status === 'current' ? 'CURRENT' : 
                             phase.status === 'upcoming' ? 'UPCOMING' : 'FUTURE'}
                          </span>
                          <div className="text-lg font-bold opacity-90">{phase.period}</div>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4">
                        {phase.title}
                      </h3>
                      
                      <p className="opacity-90 mb-6 leading-relaxed">
                        {phase.description}
                      </p>

                      <ul className="space-y-2">
                        {phase.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className={`flex items-center gap-2 ${isEven ? 'lg:flex-row-reverse' : 'flex-row'} justify-center lg:justify-start`}>
                            <div className="w-2 h-2 bg-current rounded-full opacity-60" />
                            <span className="text-sm opacity-90">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="hidden lg:flex relative">
                    <div className={`w-8 h-8 rounded-full shadow-lg border-4 border-white ${
                      phase.status === 'current' ? 'bg-emerald-500' :
                      phase.status === 'upcoming' ? 'bg-sky-500' : 'bg-slate-400'
                    }`} />
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Summary */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              🚀 Accelerated Timeline
            </h3>
            <p className="text-lg text-slate-600 mb-6">
              Thanks to our efficient development approach, we're ahead of the original schedule
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">60%</div>
                <div className="text-slate-600">Ahead of MVP Phase 1</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-sky-600 mb-2">12+</div>
                <div className="text-slate-600">Features Already Live</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600 mb-2">July 2025</div>
                <div className="text-slate-600">Target MVP Launch</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}