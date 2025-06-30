'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, GitBranch, Link } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Dependency {
  from: string;
  to: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
}

const dependencies: Dependency[] = [
  {
    from: 'Record Upload',
    to: 'Summary Generation',
    description: 'Medical documents must be uploaded before AI can generate summaries',
    status: 'completed'
  },
  {
    from: 'Summary Generation',
    to: 'Algorand Trust Layer',
    description: 'Summaries are hashed and stored on Algorand to prove authenticity and prevent tampering',
    status: 'pending'
  },
  {
    from: 'Authentication Fixes',
    to: 'Dashboard Features',
    description: 'Stable auth system enables advanced dashboard functionality',
    status: 'active'
  },
  {
    from: 'Basic Profile',
    to: 'Messaging System',
    description: 'User profiles are foundation for secure communication',
    status: 'pending'
  },
  {
    from: 'Hospital Dashboard',
    to: 'Psychiatry Tracking',
    description: 'Administrative tools enable specialized patient tracking',
    status: 'pending'
  }
];

export default function DependencyMap() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const dependencyRefs = useRef<HTMLDivElement[]>([]);

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

      // Dependency cards stagger animation
      dependencyRefs.current.forEach((dependency, index) => {
        if (dependency) {
          gsap.fromTo(
            dependency,
            { opacity: 0, y: 40, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.6,
              ease: 'back.out(1.7)',
              overwrite: true,
              scrollTrigger: {
                trigger: dependency,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true
              },
              delay: index * 0.15
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-emerald-500 to-emerald-600';
      case 'active':
        return 'from-sky-500 to-sky-600';
      case 'pending':
        return 'from-slate-400 to-slate-500';
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'active':
        return 'In Progress';
      case 'pending':
        return 'Planned';
      default:
        return 'Planned';
    }
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="dependency-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="dependency-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Feature Dependencies
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Understanding how features build upon each other ensures logical development progression
          </p>

          <div className="bg-gradient-to-r from-sky-50 to-emerald-50 rounded-2xl p-6 max-w-4xl mx-auto border border-sky-200">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GitBranch className="h-6 w-6 text-sky-600" />
              <h3 className="text-lg font-semibold text-slate-900">Strategic Development Flow</h3>
            </div>
            <p className="text-slate-600">
              Our dependency mapping ensures each feature has the necessary foundation before implementation, 
              reducing technical debt and ensuring stable releases.
            </p>
          </div>
        </div>

        {/* Dependencies Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {dependencies.map((dependency, index) => (
            <div
              key={`${dependency.from}-${dependency.to}`}
              ref={(el) => {
                if (el) dependencyRefs.current[index] = el;
              }}
              className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(dependency.status)}`}>
                  {getStatusText(dependency.status)}
                </span>
                <Link className="h-5 w-5 text-slate-400" />
              </div>

              {/* Dependency Flow */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 bg-slate-100 rounded-lg p-3 text-center">
                  <div className="font-semibold text-slate-900 text-sm">{dependency.from}</div>
                </div>
                <div className={`p-2 rounded-full bg-gradient-to-r ${getStatusColor(dependency.status)}`}>
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 bg-slate-100 rounded-lg p-3 text-center">
                  <div className="font-semibold text-slate-900 text-sm">{dependency.to}</div>
                </div>
              </div>

              {/* Description */}
              <p className="text-slate-600 text-sm leading-relaxed">
                {dependency.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Wins Section */}
        <div className="mt-16 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">⚡ Quick Wins Available</h3>
            <p className="text-xl opacity-90">
              Features ready for immediate implementation based on current progress
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
              <h4 className="font-bold text-lg mb-2">Enhanced Medical Records</h4>
              <p className="text-sm opacity-90 mb-4">Batch operations and visual organization</p>
              <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Ready Now</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
              <h4 className="font-bold text-lg mb-2">Improved Summaries</h4>
              <p className="text-sm opacity-90 mb-4">Progress indicators and comparison views</p>
              <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Ready Now</span>
            </div>
            <div className="bg-white bg-opacity-20 rounded-xl p-6 text-center">
              <h4 className="font-bold text-lg mb-2">UX Polish</h4>
              <p className="text-sm opacity-90 mb-4">Loading states and toast notifications</p>
              <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">Ready Now</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}