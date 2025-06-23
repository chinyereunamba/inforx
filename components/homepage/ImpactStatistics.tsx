'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Heart, Clock, Shield } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface ImpactStat {
  id: string;
  icon: any;
  value: string;
  label: string;
  description: string;
  color: string;
}

const impactStats: ImpactStat[] = [
  {
    id: 'patients',
    icon: Users,
    value: '50,000+',
    label: 'Patients Served',
    description: 'Across Nigeria',
    color: 'text-sky-600'
  },
  {
    id: 'satisfaction',
    icon: Heart,
    value: '95%',
    label: 'Satisfaction Rate',
    description: 'User happiness',
    color: 'text-emerald-600'
  },
  {
    id: 'availability',
    icon: Clock,
    value: '24/7',
    label: 'Support Available',
    description: 'Round-the-clock care',
    color: 'text-violet-600'
  },
  {
    id: 'security',
    icon: Shield,
    value: '99.9%',
    label: 'Security Uptime',
    description: 'Data protection',
    color: 'text-emerald-600'
  }
];

export default function ImpactStatistics() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<Record<string, string>>({});
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement[]>([]);

  // Counter animation function
  const animateCounter = (finalValue: string, callback: (current: string) => void) => {
    if (finalValue.includes('%')) {
      const numValue = parseInt(finalValue);
      let current = 0;
      const increment = numValue / 60; // 60 frames for smooth animation
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          current = numValue;
          clearInterval(timer);
        }
        callback(Math.floor(current) + '%');
      }, 16); // ~60fps
    } else if (finalValue.includes('K+')) {
      const numValue = parseInt(finalValue.replace('K+', '')) * 1000;
      let current = 0;
      const increment = numValue / 80;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          current = numValue;
          clearInterval(timer);
        }
        const displayValue = current >= 1000 ? 
          Math.floor(current / 1000) + 'K+' : 
          Math.floor(current).toString();
        callback(displayValue);
      }, 16);
    } else {
      callback(finalValue); // For non-numeric values like "24/7"
    }
  };

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

      // Staggered stat card animations
      statsRef.current.forEach((card, index) => {
        if (card) {
          gsap.fromTo(
            card,
            { 
              opacity: 0, 
              y: 50, 
              scale: 0.9 
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: 'back.out(1.7)',
              overwrite: true,
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true,
                onEnter: () => {
                  // Start counter animation for this specific stat
                  const stat = impactStats[index];
                  setTimeout(() => {
                    animateCounter(stat.value, (currentValue) => {
                      setAnimatedValues(prev => ({
                        ...prev,
                        [stat.id]: currentValue
                      }));
                    });
                  }, index * 200); // Stagger counter animations
                }
              },
              delay: index * 0.1
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-emerald-50"
      aria-labelledby="impact-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="impact-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-4"
          >
            Transforming Healthcare Across Nigeria
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Real impact, measurable results. See how InfoRx is making healthcare 
            accessible to every Nigerian community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {impactStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const displayValue = animatedValues[stat.id] || '0';
            
            return (
              <div
                key={stat.id}
                ref={(el) => {
                  if (el) statsRef.current[index] = el;
                }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center border border-emerald-100"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-emerald-50 mb-6 ${stat.color}`}>
                  <IconComponent className="h-8 w-8" />
                </div>
                
                <div className="text-4xl font-bold text-slate-900 mb-2" aria-live="polite">
                  {displayValue}
                </div>
                
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {stat.label}
                </h3>
                
                <p className="text-slate-600 text-sm">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional trust indicators */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-6">Trusted by healthcare institutions across Nigeria</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-slate-700 font-semibold">Nigerian Medical Association</div>
            <div className="text-slate-700 font-semibold">Lagos State Health Ministry</div>
            <div className="text-slate-700 font-semibold">Federal Ministry of Health</div>
            <div className="text-slate-700 font-semibold">WHO Nigeria</div>
          </div>
        </div>
      </div>
    </section>
  );
}