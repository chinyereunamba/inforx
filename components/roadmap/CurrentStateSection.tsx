'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface FeatureStatus {
  name: string;
  status: 'completed' | 'in-progress' | 'planned';
  description: string;
}

const currentFeatures: FeatureStatus[] = [
  {
    name: "Dashboard Record Management",
    status: "completed",
    description: "Upload UI, record viewer, and preview components",
  },
  {
    name: "Authentication System",
    status: "completed",
    description: "Supabase-powered auth with role-based access",
  },
  {
    name: "AI Medical Summaries",
    status: "completed",
    description: "OpenRouter-powered medical document analysis",
  },
  {
    name: "Mobile Responsive Design",
    status: "completed",
    description: "Fully responsive across all devices",
  },
  {
    name: "Medical Document Upload",
    status: "completed",
    description: "PDF, DOCX, and image upload with validation",
  },
  {
    name: "Real-time AI Interpretation",
    status: "completed",
    description: "Instant medical text analysis and explanation",
  },
  {
    name: "Authentication Persistence",
    status: "in-progress",
    description: "Session management improvements",
  },
  {
    name: "Advanced Search & Filtering",
    status: "in-progress",
    description: "Enhanced record organization",
  },
  {
    name: "Bulk Record Operations",
    status: "planned",
    description: "Multi-select and batch actions",
  },
  {
    name: "Export Functionality",
    status: "planned",
    description: "PDF and CSV export options",
  },

  // Additional roadmap features
  {
    name: "User Feedback System",
    status: "planned",
    description: "Allow users to rate or flag interpretations",
  },
  {
    name: "Multi-user Roles",
    status: "planned",
    description: "Doctor and caregiver roles with role-based access control",
  },
  {
    name: "Offline Mode",
    status: "planned",
    description: "Fallback UI and action queuing when offline",
  },
  {
    name: "End-to-End Encryption",
    status: "planned",
    description: "Client-side encryption for medical files and AI output",
  },
  {
    name: "Localization Support",
    status: "planned",
    description: "Language support for Pidgin, Hausa, Igbo, Yoruba, and more",
  },
];


export default function CurrentStateSection() {
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement[]>([]);

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

      // Progress bar animation
      gsap.fromTo(
        progressRef.current,
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: 'back.out(1.7)',
          overwrite: true,
          scrollTrigger: {
            trigger: progressRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
            once: true
          }
        }
      );

      // Features stagger animation
      featuresRef.current.forEach((feature, index) => {
        if (feature) {
          gsap.fromTo(
            feature,
            { opacity: 0, x: -30, scale: 0.95 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: true,
              scrollTrigger: {
                trigger: feature,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true
              },
              delay: index * 0.1
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [hasAnimated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-sky-500" />;
      case 'planned':
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'in-progress':
        return 'bg-sky-50 border-sky-200 text-sky-700';
      case 'planned':
        return 'bg-slate-50 border-slate-200 text-slate-600';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-600';
    }
  };

  const completedCount = currentFeatures.filter(f => f.status === 'completed').length;
  const progressPercentage = (completedCount / currentFeatures.length) * 100;

  return (
    <section
      ref={sectionRef}
      className="py-20 bg-white"
      aria-labelledby="current-state-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="current-state-heading"
            ref={titleRef}
            className="text-3xl md:text-4xl font-bold text-slate-900 mb-6"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            Current Development State
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            We're ahead of schedule! Here's what we've already accomplished and what's currently in progress.
          </p>

          {/* Progress Overview */}
          <div 
            ref={progressRef}
            className="bg-gradient-to-r from-emerald-50 to-sky-50 rounded-2xl p-8 max-w-4xl mx-auto border border-emerald-200"
          >
            <div className="grid md:grid-cols-3 gap-8 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{completedCount}</div>
                <div className="text-slate-600">Features Complete</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 mb-2">
                  {currentFeatures.filter(f => f.status === 'in-progress').length}
                </div>
                <div className="text-slate-600">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-600 mb-2">
                  {currentFeatures.filter(f => f.status === 'planned').length}
                </div>
                <div className="text-slate-600">Planned</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-sky-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-slate-700 font-medium">
              {Math.round(progressPercentage)}% of MVP Phase 1 features implemented
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFeatures.map((feature, index) => (
            <div
              key={feature.name}
              ref={(el) => {
                if (el) featuresRef.current[index] = el;
              }}
              className={`p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor(feature.status)}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {getStatusIcon(feature.status)}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{feature.name}</h3>
                  <p className="text-sm opacity-80 leading-relaxed">{feature.description}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  feature.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  feature.status === 'in-progress' ? 'bg-sky-100 text-sky-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {feature.status === 'completed' ? 'Complete' :
                   feature.status === 'in-progress' ? 'In Progress' : 'Planned'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Achievement Banner */}
        <div className="mt-16 bg-gradient-to-r from-emerald-500 to-sky-500 text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">🎉 Ahead of Schedule!</h3>
          <p className="text-xl mb-4">
            We've already implemented core features that were planned for later phases
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✅ AI Document Analysis</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✅ Medical Summaries</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✅ Record Management</span>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">✅ Mobile-First Design</span>
          </div>
        </div>
      </div>
    </section>
  );
}