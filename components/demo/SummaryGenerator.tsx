'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FileText, Pill, Heart, Activity, Lightbulb, AlertTriangle, CheckCircle, ArrowRight, Download, Share2, Copy, Mail, Printer, Check, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SummaryGeneratorProps {
  onComplete: () => void;
}

type GenerationStatus = 'initial' | 'generating' | 'complete';

interface HealthInsight {
  id: string;
  category: 'condition' | 'medication' | 'test' | 'pattern' | 'recommendation' | 'risk';
  text: string;
}

const sampleInsights: HealthInsight[] = [
  { id: '001', category: 'condition', text: 'Type 2 Diabetes Mellitus' },
  { id: '002', category: 'condition', text: 'Mild Anemia' },
  { id: '003', category: 'condition', text: 'Cholelithiasis (Gallstones)' },
  
  { id: '004', category: 'medication', text: 'Metformin 500mg' },
  { id: '005', category: 'medication', text: 'Gliclazide 80mg' },
  { id: '006', category: 'medication', text: 'Lisinopril 10mg' },
  
  { id: '007', category: 'test', text: 'Complete Blood Count (CBC)' },
  { id: '008', category: 'test', text: 'Abdominal Ultrasound' },
  { id: '009', category: 'test', text: 'Lipid Panel' },
  
  { id: '010', category: 'pattern', text: 'Elevated white blood cell count' },
  { id: '011', category: 'pattern', text: 'Reduced hemoglobin levels' },
  { id: '012', category: 'pattern', text: 'Asymptomatic gallstones' },
  
  { id: '013', category: 'recommendation', text: 'Follow up with endocrinologist for diabetes management' },
  { id: '014', category: 'recommendation', text: 'Consider iron supplementation for anemia' },
  { id: '015', category: 'recommendation', text: 'Monitor gallstones with follow-up ultrasound in 6 months' },
  { id: '016', category: 'recommendation', text: 'Maintain low-fat diet to prevent gallstone complications' },
  
  { id: '017', category: 'risk', text: 'Increased risk of cardiovascular disease' },
  { id: '018', category: 'risk', text: 'Potential for gallstone complications if symptoms develop' }
];

export default function SummaryGenerator({ onComplete }: SummaryGeneratorProps) {
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('initial');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startViewRef = useRef<HTMLDivElement>(null);
  const progressViewRef = useRef<HTMLDivElement>(null);
  const resultsViewRef = useRef<HTMLDivElement>(null);
  const insightSectionsRef = useRef<HTMLDivElement[]>([]);
  
  // Animation effects
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial view animation
      if (generationStatus === 'initial' && startViewRef.current) {
        gsap.fromTo(
          startViewRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
      
      // Progress view animation
      if (generationStatus === 'generating' && progressViewRef.current) {
        gsap.fromTo(
          progressViewRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        );
        
        // Brain pulse animation
        gsap.to(
          '.brain-icon',
          { scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: 'power2.inOut' }
        );
      }
      
      // Results view animation with staggered sections
      if (generationStatus === 'complete' && resultsViewRef.current) {
        const tl = gsap.timeline();
        
        // Main container
        tl.fromTo(
          resultsViewRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
        
        // Summary section
        tl.fromTo(
          '.summary-section',
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        );
        
        // Staggered insight sections
        tl.fromTo(
          insightSectionsRef.current,
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.4, 
            stagger: 0.1,
            ease: 'power2.out' 
          },
          '-=0.2'
        );
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, [generationStatus]);
  
  // Simulated generation process
  useEffect(() => {
    if (generationStatus === 'generating') {
      const interval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          
          if (newProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setGenerationStatus('complete');
            }, 500);
            return 100;
          }
          
          return newProgress;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [generationStatus]);
  
  const handleStartGeneration = () => {
    setGenerationStatus('generating');
    setGenerationProgress(0);
  };
  
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'condition':
        return <Activity className="h-5 w-5 text-red-600" />;
      case 'medication':
        return <Pill className="h-5 w-5 text-blue-600" />;
      case 'test':
        return <FileText className="h-5 w-5 text-purple-600" />;
      case 'pattern':
        return <Heart className="h-5 w-5 text-emerald-600" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-amber-600" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <FileText className="h-5 w-5 text-slate-600" />;
    }
  };
  
  const getCategoryLabel = (category: string) => {
    switch(category) {
      case 'condition':
        return 'Medical Conditions';
      case 'medication':
        return 'Medications';
      case 'test':
        return 'Medical Tests';
      case 'pattern':
        return 'Health Patterns';
      case 'recommendation':
        return 'Recommendations';
      case 'risk':
        return 'Risk Factors';
      default:
        return category;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'condition':
        return 'bg-red-50 border-red-200';
      case 'medication':
        return 'bg-blue-50 border-blue-200';
      case 'test':
        return 'bg-purple-50 border-purple-200';
      case 'pattern':
        return 'bg-emerald-50 border-emerald-200';
      case 'recommendation':
        return 'bg-amber-50 border-amber-200';
      case 'risk':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };
  
  const handleCopySection = (section: string) => {
    // Get content based on section
    let content = '';
    
    if (section === 'summary') {
      content = 'Health Summary - April 16, 2025\n\nThis report summarizes findings from 7 medical documents processed by InfoRx AI.\n\nThe patient has Type 2 Diabetes being managed with Metformin and Gliclazide. Recent lab tests show mild anemia with low hemoglobin (10.5 g/dL) and elevated white blood cell count, suggesting possible infection or inflammation. An abdominal ultrasound revealed gallstones without active inflammation. The patient is also on Lisinopril, indicating possible hypertension management.\n\nKey action items include following up with an endocrinologist for diabetes management, considering iron supplementation for anemia, and monitoring gallstones.';
    } else {
      // Get all insights for the section category
      const insights = sampleInsights.filter(insight => insight.category === section);
      content = `${getCategoryLabel(section)}:\n\n${insights.map(i => `• ${i.text}`).join('\n')}`;
    }
    
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto">
      {/* Initial View */}
      {generationStatus === 'initial' && (
        <div ref={startViewRef}>
          <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-emerald-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Generate Your Health Summary
                </h3>
                
                <p className="text-slate-600 max-w-2xl mx-auto mb-6">
                  Our AI will analyze your medical records to create a comprehensive summary of your health status, 
                  highlighting key conditions, medications, and recommended actions.
                </p>
                
                <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">7</div>
                    <div className="text-sm text-slate-600">Records Selected</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">3</div>
                    <div className="text-sm text-slate-600">Months of History</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="font-semibold text-slate-900">30s</div>
                    <div className="text-sm text-slate-600">Processing Time</div>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartGeneration}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Generate Health Summary
                </Button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">How it works</h4>
                    <p className="text-sm text-blue-700 mb-2">
                      Our AI-powered system will:
                    </p>
                    <ul className="text-sm space-y-1 text-blue-700">
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Analyze all selected medical records</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Identify key medical conditions, medications, and patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Generate a comprehensive but easy-to-understand health summary</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Highlight important follow-up actions and risks</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Generation Progress View */}
      {generationStatus === 'generating' && (
        <div ref={progressViewRef}>
          <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                  <Brain className="brain-icon h-8 w-8 text-blue-600" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Generating Your Health Summary
                </h3>
                
                <p className="text-slate-600 max-w-2xl mx-auto mb-8">
                  Our AI is analyzing your medical records and creating a comprehensive health profile.
                </p>
              </div>
              
              <div className="max-w-xl mx-auto">
                <div className="mb-2 flex justify-between">
                  <span className="text-sm font-medium text-slate-700">Analysis in progress...</span>
                  <span className="text-sm font-medium text-slate-700">{Math.round(generationProgress)}%</span>
                </div>
                
                <Progress value={generationProgress} className="h-3 mb-6" />
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-6">
                  <div className="flex items-start gap-3">
                    <Activity className="h-5 w-5 text-slate-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2 text-sm text-slate-600">
                      {generationProgress < 30 && (
                        <>
                          <p>Scanning medical records for key information...</p>
                          <p>Extracting medical terms, conditions, and medications...</p>
                        </>
                      )}
                      
                      {generationProgress >= 30 && generationProgress < 60 && (
                        <>
                          <p>Analyzing patterns across multiple records...</p>
                          <p>Identifying important health trends and connections...</p>
                        </>
                      )}
                      
                      {generationProgress >= 60 && generationProgress < 90 && (
                        <>
                          <p>Formulating health insights and recommendations...</p>
                          <p>Prioritizing key information based on medical relevance...</p>
                        </>
                      )}
                      
                      {generationProgress >= 90 && (
                        <>
                          <p>Finalizing your health summary...</p>
                          <p>Preparing presentation of medical insights...</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-slate-500 text-center">
                  <p>Please wait while we process your information. This usually takes about 30 seconds.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Results View */}
      {generationStatus === 'complete' && (
        <div ref={resultsViewRef}>
          <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Your Health Summary</h3>
                    <p className="text-slate-600">Generated on April 16, 2025</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowShareOptions(!showShareOptions)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              
              {/* Share Options Dropdown */}
              {showShareOptions && (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 absolute right-10 mt-1 p-2 z-10">
                  <div className="space-y-1">
                    <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md">
                      <Mail className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">Email Summary</span>
                    </button>
                    <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md">
                      <Printer className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">Print Summary</span>
                    </button>
                    <button className="flex items-center gap-2 w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md">
                      <FileText className="h-4 w-4 text-slate-600" />
                      <span className="text-sm">Share with Doctor</span>
                    </button>
                  </div>
                </div>
              )}
              
              {/* Main Summary */}
              <div className="summary-section bg-slate-50 rounded-xl p-6 border border-slate-200 mb-6 relative">
                <div className="absolute right-4 top-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySection('summary')}
                    className="h-8 w-8 p-0"
                    aria-label="Copy summary"
                  >
                    {copiedSection === 'summary' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
                
                <h4 className="text-lg font-bold text-slate-900 mb-4">Health Summary</h4>
                
                <div className="prose prose-slate prose-sm max-w-none">
                  <p>
                    This report summarizes findings from 7 medical documents processed by InfoRx AI.
                  </p>
                  
                  <p>
                    The patient has Type 2 Diabetes being managed with Metformin and Gliclazide. Recent lab tests show 
                    mild anemia with low hemoglobin (10.5 g/dL) and elevated white blood cell count, suggesting possible 
                    infection or inflammation. An abdominal ultrasound revealed gallstones without active inflammation.
                    The patient is also on Lisinopril, indicating possible hypertension management.
                  </p>
                  
                  <p>
                    Key action items include following up with an endocrinologist for diabetes management, 
                    considering iron supplementation for anemia, and monitoring gallstones.
                  </p>
                </div>
              </div>
              
              {/* Insights Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['condition', 'medication', 'test', 'pattern', 'recommendation', 'risk'].map((category, index) => {
                  const insights = sampleInsights.filter(insight => insight.category === category);
                  
                  if (insights.length === 0) return null;
                  
                  return (
                    <div
                      key={category}
                      ref={(el) => {
                        if (el) insightSectionsRef.current[index] = el;
                      }}
                      className={`rounded-xl p-4 border relative ${getCategoryColor(category)}`}
                    >
                      <div className="absolute right-3 top-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopySection(category)}
                          className="h-7 w-7 p-0"
                          aria-label={`Copy ${category}`}
                        >
                          {copiedSection === category ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-slate-500" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        {getCategoryIcon(category)}
                        <h4 className="font-semibold text-slate-900">{getCategoryLabel(category)}</h4>
                      </div>
                      
                      <ul className="space-y-1">
                        {insights.map(insight => (
                          <li key={insight.id} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2"></div>
                            <span className="text-sm text-slate-700">{insight.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              
              {/* Action Button */}
              <div className="mt-8 text-center">
                <Button
                  onClick={onComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3"
                >
                  Complete Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Medical Disclaimer */}
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-amber-800 text-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Medical Disclaimer:</strong> This health summary is for educational purposes only and is not a substitute for professional medical advice. 
                Always consult with qualified healthcare providers regarding medical conditions and treatment decisions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}