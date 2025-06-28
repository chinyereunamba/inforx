'use client';

import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FolderOpen, FileText, FileImage, Calendar, Plus, Search, Filter, Clock, FileCheck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface VaultExperienceProps {
  onComplete: () => void;
}

interface MedicalRecord {
  id: string;
  title: string;
  date: string;
  type: 'prescription' | 'lab_result' | 'scan' | 'note';
  hospital: string;
  icon: React.ComponentType<any>;
  status?: 'normal' | 'attention' | 'critical';
  processed: boolean;
}

// Sample medical records for the demo
const sampleRecords: MedicalRecord[] = [
  {
    id: '001',
    title: 'Complete Blood Count',
    date: 'April 10, 2025',
    type: 'lab_result',
    hospital: 'National Hospital Abuja',
    icon: FileCheck,
    status: 'attention',
    processed: true
  },
  {
    id: '002',
    title: 'Metformin Prescription',
    date: 'April 15, 2025',
    type: 'prescription',
    hospital: 'Lagos University Teaching Hospital',
    icon: FileText,
    status: 'normal',
    processed: true
  },
  {
    id: '003',
    title: 'Abdominal Ultrasound',
    date: 'April 12, 2025',
    type: 'scan',
    hospital: 'Rivers State University Teaching Hospital',
    icon: FileImage,
    status: 'attention',
    processed: true
  },
  {
    id: '004',
    title: 'Annual Physical Examination',
    date: 'March 5, 2025',
    type: 'note',
    hospital: 'Memorial Specialist Hospital',
    icon: FileText,
    status: 'normal',
    processed: true
  },
  {
    id: '005',
    title: 'Lipid Panel',
    date: 'March 5, 2025',
    type: 'lab_result',
    hospital: 'Memorial Specialist Hospital',
    icon: FileCheck,
    status: 'critical',
    processed: true
  },
  {
    id: '006',
    title: 'Chest X-Ray',
    date: 'February 22, 2025',
    type: 'scan',
    hospital: 'Federal Medical Centre',
    icon: FileImage,
    status: 'normal',
    processed: true
  },
  {
    id: '007',
    title: 'Lisinopril Prescription',
    date: 'March 5, 2025',
    type: 'prescription',
    hospital: 'Memorial Specialist Hospital',
    icon: FileText,
    status: 'normal',
    processed: true
  }
];

export default function VaultExperience({ onComplete }: VaultExperienceProps) {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [importingDemo, setImportingDemo] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const recordsRef = useRef<HTMLDivElement>(null);

  // Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sequential animations
      const tl = gsap.timeline();
      
      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
      ).fromTo(
        statsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      ).fromTo(
        recordsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
        '-=0.3'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Handle demo import simulation
  useEffect(() => {
    if (importingDemo) {
      const importInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 100) {
            clearInterval(importInterval);
            setTimeout(() => {
              setImportingDemo(false);
              
              // Reset for reusability
              setImportProgress(0);
            }, 500);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(importInterval);
    }
  }, [importingDemo]);

  const toggleRecordSelection = (id: string) => {
    setSelectedRecords(prev => 
      prev.includes(id) 
        ? prev.filter(recordId => recordId !== id) 
        : [...prev, id]
    );
  };

  const filteredRecords = sampleRecords
    .filter(record => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.hospital.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = filterType === 'all' || record.type === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // Convert dates to timestamps
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // Sort by date
      return sortOrder === 'newest' 
        ? dateB - dateA // newest first
        : dateA - dateB; // oldest first
    });

  const handleGenerateSummary = () => {
    if (selectedRecords.length > 0) {
      onComplete();
    } else {
      // Simulate importing demo records
      setImportingDemo(true);
    }
  };

  const getStatusBadgeColor = (status?: 'normal' | 'attention' | 'critical') => {
    switch (status) {
      case 'normal':
        return 'bg-emerald-100 text-emerald-800';
      case 'attention':
        return 'bg-amber-100 text-amber-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div ref={containerRef} className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div ref={headingRef} className="mb-8">
        <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Your Medical Vault</h3>
                  <p className="text-slate-600">All your health records in one secure place</p>
                </div>
              </div>
              
              <div>
                <Button
                  onClick={handleGenerateSummary}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={importingDemo}
                >
                  {importingDemo ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Importing...
                    </>
                  ) : (
                    <>
                      {selectedRecords.length > 0 ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Generate Health Summary
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Import Demo Health Records
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {importingDemo && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">Importing sample health records...</span>
                  <span className="text-slate-600">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex items-center relative min-w-[150px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Types</option>
                    <option value="prescription">Prescriptions</option>
                    <option value="lab_result">Lab Results</option>
                    <option value="scan">Scans & Imaging</option>
                    <option value="note">Notes</option>
                  </select>
                </div>
                
                <div className="flex items-center relative min-w-[150px]">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    value={sortOrder}
                    onChange={e => setSortOrder(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Section */}
      <div ref={statsRef} className="mb-8">
        <div className="grid grid-cols-4 gap-4">
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{sampleRecords.length}</div>
              <div className="text-sm text-slate-600">Total Records</div>
            </div>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">3</div>
              <div className="text-sm text-slate-600">Hospitals</div>
            </div>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">2</div>
              <div className="text-sm text-slate-600">Need Attention</div>
            </div>
          </Card>
          
          <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">100%</div>
              <div className="text-sm text-slate-600">AI Processed</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Records List */}
      <div ref={recordsRef} className="mb-8">
        <Card className="border border-slate-200 shadow-lg rounded-xl overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Health Records</h3>
            
            <div className="space-y-4">
              {filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 mb-4">No records found matching your filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                filteredRecords.map(record => {
                  const IconComponent = record.icon;
                  const isSelected = selectedRecords.includes(record.id);
                  
                  return (
                    <div
                      key={record.id}
                      className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                      onClick={() => toggleRecordSelection(record.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded border ${
                            isSelected 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-slate-300'
                          } flex items-center justify-center mr-3`}>
                            {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            record.type === 'lab_result' ? 'bg-amber-100' :
                            record.type === 'prescription' ? 'bg-emerald-100' :
                            record.type === 'scan' ? 'bg-blue-100' : 'bg-slate-100'
                          }`}>
                            <IconComponent className={`h-5 w-5 ${
                              record.type === 'lab_result' ? 'text-amber-600' :
                              record.type === 'prescription' ? 'text-emerald-600' :
                              record.type === 'scan' ? 'text-blue-600' : 'text-slate-600'
                            }`} />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900">{record.title}</h4>
                              {record.status && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadgeColor(record.status)}`}>
                                  {record.status === 'normal' ? 'Normal' : 
                                   record.status === 'attention' ? 'Needs Attention' : 'Critical'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-slate-500">
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {record.date}
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">{record.hospital}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 border-t border-slate-200 pt-4 flex justify-between items-center">
              <div className="text-sm text-slate-600">
                {selectedRecords.length > 0 ? (
                  <span>{selectedRecords.length} records selected</span>
                ) : (
                  <span>Select records to generate a health summary</span>
                )}
              </div>
              
              <Button
                onClick={onComplete}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={selectedRecords.length === 0 && !importingDemo}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Generate Health Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}