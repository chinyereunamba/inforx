'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Upload, FileText, Image, FileCheck, Loader2, Send, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FileUploadZone from './FileUploadZone';
import type { InterpreterState, DocumentType, InterpretationResult } from '@/lib/types/dashboard';

interface InterpreterInterfaceProps {
  onResult: (result: InterpretationResult | null) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

const documentTypes: { value: DocumentType; label: string; icon: any }[] = [
  { value: 'prescription', label: 'Prescription', icon: FileText },
  { value: 'lab_report', label: 'Lab Report', icon: FileCheck },
  { value: 'medical_scan', label: 'Medical Scan', icon: Image },
  { value: 'clinical_notes', label: 'Clinical Notes', icon: FileText },
];

const exampleTexts = {
  prescription: 'Metformin 500mg - Take 1 tablet twice daily with meals for Type 2 diabetes management. Continue for 3 months then review.',
  lab_report: 'Complete Blood Count: WBC: 12,500/μL (High), RBC: 4.2 million/μL (Normal), Hemoglobin: 10.5 g/dL (Low), Platelets: 180,000/μL (Normal)',
  medical_scan: 'Abdominal Ultrasound: Liver appears normal in size and echogenicity. Gallbladder shows multiple small echogenic foci consistent with gallstones.',
  clinical_notes: 'Patient presents with persistent headache, fatigue, and mild fever. No nausea or vomiting. Vital signs stable. Recommend rest and follow-up.'
};

export default function InterpreterInterface({ onResult, onLoading, onError, isLoading, error }: InterpreterInterfaceProps) {
  const [state, setState] = useState<InterpreterState>({
    inputText: '',
    documentType: 'prescription',
    language: 'english',
    uploadedFile: null
  });

  const formRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLDivElement>(null);
  const submitRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      
      tl.fromTo(
        headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', overwrite: true }
      )
      .fromTo(
        [uploadSectionRef.current, textInputRef.current, submitRef.current],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', overwrite: true },
        '-=0.3'
      );
    }, formRef);

    return () => ctx.revert();
  }, []);

  const handleFileUpload = (file: File) => {
    setState(prev => ({ ...prev, uploadedFile: file }));
    onError(null);
    
    // Simulate file processing
    setTimeout(() => {
      setState(prev => ({ 
        ...prev, 
        inputText: `[Uploaded file: ${file.name}]\n\nProcessed content will appear here...` 
      }));
    }, 1000);
  };

  const handleSubmit = async () => {
    // Validation
    if (!state.inputText.trim() && !state.uploadedFile) {
      onError('Please provide medical text or upload a document');
      return;
    }

    if (state.inputText.trim().length < 10 && !state.uploadedFile) {
      onError('Please provide more detailed medical information');
      return;
    }

    onLoading(true);
    onError(null);
    onResult(null);

    try {
      // Call the interpretation API
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: state.inputText,
          language: state.language === 'english' ? 'English' : 'Nigerian Pidgin',
          documentType: state.documentType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.result) {
        throw new Error('Invalid response format from API');
      }

      // Parse and structure the result
      const result: InterpretationResult = {
        id: `result_${Date.now()}`,
        originalText: state.inputText,
        documentType: state.documentType,
        language: state.language,
        interpretation: parseApiResponse(data.result),
        timestamp: new Date(),
        uploadedFile: state.uploadedFile
      };

      onResult(result);
    } catch (error) {
      console.error('Interpretation failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to interpret medical text. Please try again.';
      onError(errorMessage);
    } finally {
      onLoading(false);
    }
  };

  const parseApiResponse = (response: string) => {
    let simpleExplanation = '';
    let recommendedActions: string[] = [];
    let medicalAttentionIndicators: string[] = [];

    try {
      const sections = response.split(/(?=📘|💡|⚠️)/);
      
      sections.forEach(section => {
        const cleanSection = section.trim();
        
        if (cleanSection.startsWith('📘')) {
          const explanationMatch = cleanSection.match(/📘.*?:\s*([\s\S]*?)(?=💡|⚠️|$)/);
          if (explanationMatch) {
            simpleExplanation = explanationMatch[1].trim();
          }
        } else if (cleanSection.startsWith('💡')) {
          const actionsMatch = cleanSection.match(/💡.*?:\s*([\s\S]*?)(?=⚠️|$)/);
          if (actionsMatch) {
            const actionsText = actionsMatch[1].trim();
            recommendedActions = actionsText
              .split(/\n/)
              .map(item => item.replace(/^[\d\-•\*\.]\s*/, '').trim())
              .filter(item => item.length > 0);
          }
        } else if (cleanSection.startsWith('⚠️')) {
          const indicatorsMatch = cleanSection.match(/⚠️.*?:\s*([\s\S]*)/);
          if (indicatorsMatch) {
            const indicatorsText = indicatorsMatch[1].trim();
            medicalAttentionIndicators = indicatorsText
              .split(/\n/)
              .map(item => item.replace(/^[\d\-•\*\.]\s*/, '').trim())
              .filter(item => item.length > 0);
          }
        }
      });

      if (!simpleExplanation && !recommendedActions.length && !medicalAttentionIndicators.length) {
        simpleExplanation = response.trim();
        recommendedActions = ['Consult with your healthcare provider for detailed guidance'];
        medicalAttentionIndicators = ['Seek immediate medical attention if you experience concerning symptoms'];
      }
    } catch (error) {
      console.error('Error parsing API response:', error);
      simpleExplanation = 'Your medical information has been processed. Please consult with a healthcare professional for detailed interpretation.';
      recommendedActions = ['Schedule an appointment with your healthcare provider'];
      medicalAttentionIndicators = ['Contact your doctor if you have concerns'];
    }

    return {
      simpleExplanation,
      recommendedActions,
      medicalAttentionIndicators
    };
  };

  const loadExample = (type: DocumentType) => {
    setState(prev => ({ 
      ...prev, 
      documentType: type,
      inputText: exampleTexts[type],
      uploadedFile: null
    }));
    onError(null);
  };

  return (
    <div ref={formRef} className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 
          ref={headerRef}
          className="text-2xl font-bold font-noto text-gray-900 mb-2"
        >
          Medical Document Interpreter
        </h1>
        <p className="text-gray-600">
          Upload a medical document or paste text for AI-powered interpretation
        </p>
      </div>

      {/* Upload Section */}
      <div ref={uploadSectionRef} className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h2>
        <FileUploadZone
          onFileUpload={handleFileUpload}
          uploadedFile={state.uploadedFile}
          isLoading={isLoading}
        />
      </div>

      {/* Text Input Section */}
      <div ref={textInputRef} className="mb-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Or Paste Text</h2>
          
          {/* Document Type Selector */}
          <div className="relative">
            <select
              value={state.documentType}
              onChange={(e) => setState(prev => ({ ...prev, documentType: e.target.value as DocumentType }))}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:border-blue-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              aria-label="Select document type"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <textarea
          value={state.inputText}
          onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
          placeholder="Paste your medical document text here..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-700 placeholder-gray-400 transition-colors duration-200"
          disabled={isLoading}
          maxLength={5000}
          aria-describedby="char-counter"
        />
        
        <div className="flex justify-between items-center mt-2">
          <div id="char-counter" className="text-sm text-gray-500">
            {state.inputText.length}/5000 characters
          </div>
          
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="language" className="text-sm font-medium text-gray-700">
              Language:
            </label>
            <select
              id="language"
              value={state.language}
              onChange={(e) => setState(prev => ({ ...prev, language: e.target.value as 'english' | 'pidgin' }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="english">English</option>
              <option value="pidgin">Pidgin</option>
            </select>
          </div>
        </div>

        {/* Example Buttons */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {documentTypes.map(type => (
              <button
                key={type.value}
                onClick={() => loadExample(type.value)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center gap-1"
                disabled={isLoading}
              >
                <type.icon className="w-3 h-3" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div ref={submitRef}>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || (!state.inputText.trim() && !state.uploadedFile)}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label={isLoading ? 'Processing medical document' : 'Analyze medical document'}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Analyzing Document...
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Analyze Document
            </>
          )}
        </Button>
      </div>
    </div>
  );
}