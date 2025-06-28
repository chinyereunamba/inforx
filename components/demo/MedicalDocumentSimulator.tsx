'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FileText, UploadCloud, FileX, Check, Image, File, CheckCircle, AlertCircle, AlertTriangle, Activity, Copy, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MedicalDocumentSimulatorProps {
  onComplete: () => void;
  showResults?: boolean;
}

type DocumentType = 'prescription' | 'labResult' | 'scan';
type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

interface DemoDocument {
  id: string;
  type: DocumentType;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  content: string;
}

const demoDocuments: DemoDocument[] = [
  {
    id: 'prescription',
    type: 'prescription',
    name: 'Metformin Prescription',
    description: 'Diabetes medication prescription from Lagos University Teaching Hospital',
    icon: FileText,
    content: `
PRESCRIPTION

Patient: Demo Patient (38, M)
Date: April 15, 2025
Prescriber: Dr. Adebayo Okafor
Hospital: Lagos University Teaching Hospital

Rx:
1. Metformin 500mg tablets
   Sig: Take 1 tablet twice daily with meals
   Disp: 60 tablets
   Refills: 2

2. Gliclazide 80mg tablets
   Sig: Take 1 tablet daily with breakfast
   Disp: 30 tablets
   Refills: 2

Diagnosis: Type 2 Diabetes Mellitus (E11.9)

Notes: Monitor blood glucose regularly. Return for follow-up in 4 weeks.
`
  },
  {
    id: 'labResult',
    type: 'labResult',
    name: 'Complete Blood Count',
    description: 'Laboratory results from National Hospital Abuja',
    icon: Activity,
    content: `
LABORATORY REPORT

Patient: Demo Patient (38, M)
Date: April 10, 2025
Referring Physician: Dr. Ngozi Eze
Laboratory: National Hospital Abuja Clinical Laboratory

TEST: COMPLETE BLOOD COUNT (CBC)

RESULTS:
- WBC: 12,500/μL    (Reference: 4,000-11,000)    HIGH
- RBC: 4.2 million/μL    (Reference: 4.5-5.9)    LOW
- Hemoglobin: 10.5 g/dL    (Reference: 13.5-17.5)    LOW
- Hematocrit: 32%    (Reference: 41-50%)    LOW
- Platelets: 180,000/μL    (Reference: 150,000-450,000)    NORMAL
- MCV: 88 fL    (Reference: 80-100)    NORMAL
- MCH: 29 pg    (Reference: 27-31)    NORMAL
- MCHC: 33 g/dL    (Reference: 32-36)    NORMAL

Comment: Results indicate mild anemia with leukocytosis, suggesting possible infection or inflammation.
`
  },
  {
    id: 'scan',
    type: 'scan',
    name: 'Abdominal Ultrasound',
    description: 'Scan results from Rivers State University Teaching Hospital',
    icon: Image,
    content: `
RADIOLOGY REPORT

Patient: Demo Patient (38, M)
Date: April 12, 2025
Referring Physician: Dr. Emmanuel Obi
Facility: Rivers State University Teaching Hospital

EXAMINATION: ABDOMINAL ULTRASOUND

FINDINGS:
- Liver: Normal size and echogenicity. No focal lesions.
- Gallbladder: Multiple small echogenic foci consistent with gallstones. No wall thickening or pericholecystic fluid.
- Pancreas: Normal in size and echotexture.
- Spleen: Normal size (10cm) and appearance.
- Kidneys: Normal size, position, and echogenicity bilaterally. No hydronephrosis.
- Urinary Bladder: Normal wall thickness and contour.
- Abdominal Aorta: Normal caliber.
- Other: No free fluid in the abdomen or pelvis.

IMPRESSION:
1. Multiple gallstones without evidence of acute cholecystitis
2. Otherwise normal abdominal ultrasound

RECOMMENDATION:
Clinical correlation and follow-up as needed. Consider surgical consultation for symptomatic cholelithiasis.
`
  }
];

export default function MedicalDocumentSimulator({ onComplete, showResults = false }: MedicalDocumentSimulatorProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDocument, setShowDocument] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Skip to results if showResults is true
  useEffect(() => {
    if (showResults) {
      setSelectedDocumentId('labResult');
      setUploadStatus('complete');
      setUploadProgress(100);
      setShowDocument(true);
    }
  }, [showResults]);

  // Simulated upload and processing
  useEffect(() => {
    if (uploadStatus === 'uploading') {
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(uploadInterval);
            setUploadStatus('processing');
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(uploadInterval);
    }

    if (uploadStatus === 'processing') {
      const processingTimeout = setTimeout(() => {
        setUploadStatus('complete');
      }, 2000);

      return () => clearTimeout(processingTimeout);
    }
  }, [uploadStatus]);

  // Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (uploadStatus === 'complete' && resultsRef.current) {
        gsap.fromTo(
          resultsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [uploadStatus]);

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleStartUpload = () => {
    if (!selectedDocumentId) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
  };

  const handleReset = () => {
    setSelectedDocumentId(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setShowDocument(false);
  };

  const handleCopyContent = () => {
    const selectedDocument = demoDocuments.find(doc => doc.id === selectedDocumentId);
    if (selectedDocument) {
      navigator.clipboard.writeText(selectedDocument.content);
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  const selectedDocument = demoDocuments.find(doc => doc.id === selectedDocumentId);

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto">
      {/* Upload Section */}
      {uploadStatus !== 'complete' || !showResults ? (
        <div ref={uploadRef} className="mb-8">
          <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-0">
              {/* Step 1: Select Document */}
              {uploadStatus === 'idle' && (
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Select a Medical Document to Upload</h3>
                  
                  <div className="grid gap-4 md:grid-cols-3 mb-8">
                    {demoDocuments.map((doc) => {
                      const IconComponent = doc.icon;
                      const isSelected = selectedDocumentId === doc.id;
                      
                      return (
                        <button
                          key={doc.id}
                          onClick={() => handleSelectDocument(doc.id)}
                          className={`p-6 rounded-xl text-left border-2 transition-all ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                              : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-emerald-100' : 'bg-slate-100'
                            }`}>
                              <IconComponent className={`h-6 w-6 ${
                                isSelected ? 'text-emerald-600' : 'text-slate-600'
                              }`} />
                            </div>
                            <div className={isSelected ? 'text-emerald-800' : 'text-slate-800'}>
                              <div className="font-semibold">{doc.name}</div>
                              <div className="text-xs">.pdf</div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{doc.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-4">
                      In a real app, you would upload your own documents.<br />
                      For this demo, we've provided sample documents.
                    </p>
                    
                    <Button
                      onClick={handleStartUpload}
                      disabled={!selectedDocumentId}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                    >
                      <UploadCloud className="mr-2 h-5 w-5" />
                      Upload Selected Document
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Upload Progress */}
              {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    {selectedDocument && (
                      <>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                          <selectedDocument.icon className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{selectedDocument.name}</div>
                          <div className="text-sm text-slate-500">{selectedDocument.description}</div>
                        </div>
                      </>
                    )}
                  </div>

                  {uploadStatus === 'uploading' ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700">Uploading document...</span>
                        <span className="text-slate-600">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-3" />
                      <p className="text-sm text-slate-500">Please wait while we securely upload your document.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin">
                          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <span className="font-medium text-slate-700">AI Processing Document</span>
                      </div>
                      
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            <Brain className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm text-emerald-800">
                              Our AI is analyzing your document to:
                            </p>
                            <ul className="text-xs text-emerald-700 mt-2 space-y-1">
                              <li className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                Extract key medical terms and values
                              </li>
                              <li className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                Identify important health indicators
                              </li>
                              <li className="flex items-center">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                Generate plain-language explanations
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Upload Complete (just the confirmation) */}
              {uploadStatus === 'complete' && !showResults && (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-emerald-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Complete!</h3>
                  <p className="text-slate-600 mb-6">
                    Your document was successfully uploaded and processed.
                  </p>
                  
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowDocument(true)}
                      className="px-4 py-2"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Document
                    </Button>
                    
                    <Button
                      onClick={onComplete}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
                    >
                      View AI Results
                    </Button>
                  </div>
                </div>
              )}

              {/* Document View */}
              {showDocument && !showResults && selectedDocument && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDocument(false)}
                      >
                        Back
                      </Button>
                      <h3 className="text-lg font-bold text-slate-900">{selectedDocument.name}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyContent}
                      >
                        {copiedContent ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <pre className="bg-slate-50 p-4 rounded-lg text-sm text-slate-800 font-mono whitespace-pre-wrap border border-slate-200 mb-6">
                    {selectedDocument.content}
                  </pre>
                  
                  <div className="flex justify-end">
                    <Button
                      onClick={onComplete}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2"
                    >
                      Continue to AI Results
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Results Section */}
      {(uploadStatus === 'complete' && showResults) && (
        <div ref={resultsRef} className="mb-8">
          <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {selectedDocument?.name || 'Medical Document'} Analysis
                    </h3>
                    <p className="text-sm text-slate-500">Processed on April 16, 2025</p>
                  </div>
                </div>
                
                {selectedDocument?.id === 'labResult' && (
                  <div className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
                    Requires Attention
                  </div>
                )}
              </div>

              {/* Simple Explanation */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 mb-2">📘 Simple Explanation</h4>
                    
                    {selectedDocument?.id === 'prescription' && (
                      <div className="text-blue-800">
                        <p className="mb-3">
                          This is a prescription for two diabetes medications: Metformin and Gliclazide. These are used to help control your blood sugar levels.
                        </p>
                        <p>
                          The doctor wants you to take Metformin twice a day with meals and Gliclazide once daily with breakfast. 
                          You've been given enough tablets for 1-2 months, with the option to refill twice.
                        </p>
                      </div>
                    )}
                    
                    {selectedDocument?.id === 'labResult' && (
                      <div className="text-blue-800">
                        <p className="mb-3">
                          This is a Complete Blood Count (CBC) test that looks at different components of your blood.
                        </p>
                        <p className="mb-3">
                          Your white blood cell (WBC) count is high, which could indicate your body is fighting an infection or inflammation.
                        </p>
                        <p>
                          Your red blood cell (RBC) count and hemoglobin are low, which suggests mild anemia (low blood count). This might explain if you've been feeling tired or weak.
                        </p>
                      </div>
                    )}
                    
                    {selectedDocument?.id === 'scan' && (
                      <div className="text-blue-800">
                        <p className="mb-3">
                          This is an ultrasound examination of your abdomen, which uses sound waves to create images of the organs inside your belly.
                        </p>
                        <p className="mb-3">
                          The scan found small stones in your gallbladder. Gallstones are hardened deposits that can form in your gallbladder.
                        </p>
                        <p>
                          The good news is there's no sign of inflammation (cholecystitis) and all your other organs appear normal.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-yellow-900 mb-2">💡 What to Do</h4>
                    
                    {selectedDocument?.id === 'prescription' && (
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">1</span>
                          </div>
                          <span>Take one Metformin tablet with breakfast and one with dinner</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">2</span>
                          </div>
                          <span>Take one Gliclazide tablet every morning with breakfast</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">3</span>
                          </div>
                          <span>Check your blood sugar regularly as instructed by your doctor</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">4</span>
                          </div>
                          <span>Schedule a follow-up appointment in 4 weeks</span>
                        </li>
                      </ul>
                    )}
                    
                    {selectedDocument?.id === 'labResult' && (
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">1</span>
                          </div>
                          <span>Contact your doctor to discuss these results within 1-2 days</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">2</span>
                          </div>
                          <span>Eat iron-rich foods like spinach, beans, and lean meats to help with anemia</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">3</span>
                          </div>
                          <span>Get plenty of rest if you're feeling fatigued</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">4</span>
                          </div>
                          <span>Keep track of any fever, chills, or other symptoms</span>
                        </li>
                      </ul>
                    )}
                    
                    {selectedDocument?.id === 'scan' && (
                      <ul className="space-y-2 text-yellow-800">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">1</span>
                          </div>
                          <span>Schedule a follow-up appointment with your doctor to discuss these findings</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">2</span>
                          </div>
                          <span>Consider a surgical consultation if you experience abdominal pain, especially after fatty meals</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">3</span>
                          </div>
                          <span>Maintain a low-fat diet to reduce gallstone symptoms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-yellow-700 text-xs font-bold">4</span>
                          </div>
                          <span>Keep this report for your medical records</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning Signs */}
              <div className="bg-red-50 rounded-xl p-6 border border-red-200 mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-900 mb-2">⚠️ When to See a Doctor</h4>
                    
                    {selectedDocument?.id === 'prescription' && (
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you experience low blood sugar symptoms (sweating, shaking, dizziness, confusion)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you have stomach pain, nausea or vomiting that doesn't go away</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If your blood sugar readings are consistently outside your target range</span>
                        </li>
                      </ul>
                    )}
                    
                    {selectedDocument?.id === 'labResult' && (
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you develop fever above 38°C (100.4°F) or chills</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you experience severe fatigue, dizziness, or shortness of breath</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you notice unusual bleeding or bruising</span>
                        </li>
                      </ul>
                    )}
                    
                    {selectedDocument?.id === 'scan' && (
                      <ul className="space-y-2 text-red-800">
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you develop severe abdominal pain, especially in the upper right section</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you notice yellowing of the skin or eyes (jaundice)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-1 text-red-600" />
                          <span>If you develop fever, chills, or persistent vomiting</span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700">
                    <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice. 
                    Always consult with a healthcare provider for diagnosis and treatment decisions.
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={onComplete}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Continue to Medical Vault
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}