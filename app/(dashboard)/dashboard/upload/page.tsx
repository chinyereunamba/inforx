import FileUploadInterface from '@/components/dashboard/FileUploadInterface';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Documents - InfoRx Medical Interpreter',
  description: 'Upload medical documents for AI-powered interpretation and analysis.',
  keywords: 'medical document upload, AI analysis, healthcare interpretation, InfoRx upload',
  openGraph: {
    title: 'Upload Documents - InfoRx Medical Interpreter',
    description: 'Upload medical documents for AI-powered interpretation and analysis.',
    type: 'website',
    locale: 'en_NG'
  },
};

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-noto font-bold text-gray-900 mb-2">
            Upload Medical Documents
          </h1>
          <p className="text-lg text-gray-600">
            Upload your prescriptions, lab results, or medical reports for AI-powered analysis and interpretation.
          </p>
        </div>
        
        <FileUploadInterface />
      </div>
    </div>
  );
}