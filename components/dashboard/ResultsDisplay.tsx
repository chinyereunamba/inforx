'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  Copy, 
  Download, 
  Volume2, 
  Share2, 
  Check,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { InterpretationResult } from '@/lib/types/dashboard';

interface ResultsDisplayProps {
  result: InterpretationResult | null;
  isLoading: boolean;
  error: string | null;
}

export default function ResultsDisplay({ result, isLoading, error }: ResultsDisplayProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('summary');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  // Loading animation
  useEffect(() => {
    if (isLoading && loadingRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.pulse-dot',
          { scale: 0.8, opacity: 0.4 },
          {
            scale: 1.2,
            opacity: 1,
            duration: 0.8,
            ease: 'power2.inOut',
            stagger: 0.2,
            repeat: -1,
            yoyo: true,
            overwrite: true
          }
        );
      }, loadingRef);

      return () => ctx.revert();
    }
  }, [isLoading]);

  // Results entrance animation
  useEffect(() => {
    if (result && resultsRef.current) {
      const ctx = gsap.context(() => {
        // Header animation
        gsap.fromTo(
          '.results-header',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );

        // Staggered card animations
        gsap.fromTo(
          cardsRef.current,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'back.out(1.7)',
            stagger: 0.15,
            delay: 0.2,
            overwrite: true
          }
        );
      }, resultsRef);

      return () => ctx.revert();
    }
  }, [result]);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      
      gsap.fromTo(
        `[data-section="${section}"] .copy-button`,
        { scale: 1 },
        { scale: 1.2, duration: 0.2, yoyo: true, repeat: 1, ease: 'power2.out' }
      );
      
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const toggleTextToSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else if (result) {
      const text = `${result.interpretation.simpleExplanation}. 
        Recommended actions: ${result.interpretation.recommendedActions.join('. ')}. 
        Warning signs: ${result.interpretation.medicalAttentionIndicators.join('. ')}`;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const downloadPDF = () => {
    if (!result) return;
    
    // Create downloadable content
    const content = `
InfoRx Medical Interpretation Report
Generated: ${result.timestamp.toLocaleString()}
Document Type: ${result.documentType.replace('_', ' ').toUpperCase()}
Language: ${result.language.toUpperCase()}

ORIGINAL TEXT:
${result.originalText}

SIMPLE EXPLANATION:
${result.interpretation.simpleExplanation}

RECOMMENDED ACTIONS:
${result.interpretation.recommendedActions.map((action, i) => `${i + 1}. ${action}`).join('\n')}

MEDICAL ATTENTION INDICATORS:
${result.interpretation.medicalAttentionIndicators.map((indicator, i) => `${i + 1}. ${indicator}`).join('\n')}

DISCLAIMER:
This interpretation is for educational purposes only and should not replace professional medical advice.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inforx-interpretation-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResult = async () => {
    if (!result) return;
    
    const shareData = {
      title: 'InfoRx Medical Interpretation',
      text: result.interpretation.simpleExplanation.substring(0, 100) + '...',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Shared content copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatActionItems = (items: string[]) => {
    return items.map((item, index) => `${index + 1}. ${item}`).join('\n');
  };

  if (isLoading) {
    return (
      <div ref={loadingRef} className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-6">
            <div className="pulse-dot w-4 h-4 bg-blue-600 rounded-full"></div>
            <div className="pulse-dot w-4 h-4 bg-green-600 rounded-full"></div>
            <div className="pulse-dot w-4 h-4 bg-blue-600 rounded-full"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Analyzing Your Document</h2>
          <p className="text-gray-600 mb-4">Our AI is processing your medical information...</p>
          <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ready for Analysis</h2>
          <p className="text-gray-600">
            Upload a medical document or paste text to get started with AI-powered interpretation
          </p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      id: 'summary',
      title: '📘 Simple Explanation',
      content: result.interpretation.simpleExplanation,
      icon: BookOpen,
      color: 'blue'
    },
    {
      id: 'actions',
      title: '💡 Recommended Actions',
      content: result.interpretation.recommendedActions,
      icon: Lightbulb,
      color: 'yellow'
    },
    {
      id: 'warnings',
      title: '⚠️ Warning Signs',
      content: result.interpretation.medicalAttentionIndicators,
      icon: AlertTriangle,
      color: 'red'
    }
  ];

  return (
    <div ref={containerRef} className="h-full bg-gray-50 overflow-y-auto">
      <div ref={resultsRef} className="p-6">
        {/* Header */}
        <div className="results-header mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold font-noto text-gray-900">Analysis Results</h1>
              <p className="text-gray-600">
                Generated on {result.timestamp.toLocaleDateString()} • {result.language.charAt(0).toUpperCase() + result.language.slice(1)}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={toggleTextToSpeech}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-blue-600' : ''}`} />
                {isSpeaking ? 'Stop' : 'Listen'}
              </Button>
              <Button
                onClick={downloadPDF}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                onClick={shareResult}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>
        </div>

        {/* Results Cards */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            const isExpanded = expandedSection === section.id;
            const borderColor = section.color === 'blue' ? 'border-blue-200' : 
                               section.color === 'yellow' ? 'border-yellow-200' : 'border-red-200';
            const bgColor = section.color === 'blue' ? 'bg-blue-50' : 
                           section.color === 'yellow' ? 'bg-yellow-50' : 'bg-red-50';
            const iconColor = section.color === 'blue' ? 'text-blue-600' : 
                             section.color === 'yellow' ? 'text-yellow-600' : 'text-red-600';
            
            return (
              <div
                key={section.id}
                ref={(el) => {
                  if (el) cardsRef.current[index] = el;
                }}
                data-section={section.id}
                className={`bg-white rounded-xl border-2 ${borderColor} overflow-hidden transition-all duration-300 hover:shadow-lg`}
              >
                {/* Card Header */}
                <div className={`${bgColor} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-white rounded-lg flex items-center justify-center`}>
                        <IconComponent className={`w-6 h-6 ${iconColor}`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(
                          Array.isArray(section.content) 
                            ? formatActionItems(section.content)
                            : section.content,
                          section.id
                        )}
                        className="copy-button p-2 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors duration-200"
                        title="Copy to clipboard"
                        aria-label={`Copy ${section.title} to clipboard`}
                      >
                        {copiedSection === section.id ? (
                          <Check className="w-5 h-5 text-green-600" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-2 hover:bg-white hover:bg-opacity-60 rounded-lg transition-colors duration-200"
                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${section.title}`}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className={`transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-24 overflow-hidden'}`}>
                  <div className="p-6">
                    {Array.isArray(section.content) ? (
                      <ul className="space-y-3">
                        {section.content.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-start gap-3">
                            <div className={`w-6 h-6 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <span className={`${iconColor} font-semibold text-sm`}>{itemIndex + 1}</span>
                            </div>
                            <span className="text-gray-700 leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-700 leading-relaxed">{section.content}</p>
                    )}
                  </div>
                </div>

                {!isExpanded && (
                  <div className="px-6 pb-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                    >
                      Show more...
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-800 mb-2">Important Medical Disclaimer</h4>
              <p className="text-sm text-amber-700 leading-relaxed">
                This interpretation is for educational purposes only and should not replace professional medical advice. 
                Always consult with qualified healthcare providers for medical decisions, diagnosis, and treatment plans. 
                In case of medical emergencies, contact emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}