import { Metadata } from 'next';
import { Shield, Lock, Eye, Users, AlertTriangle, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - InfoRx',
  description: 'Learn how InfoRx protects your personal health information and medical data.',
  robots: 'index, follow',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Your privacy and the security of your medical information is our top priority. 
            This policy explains how we collect, use, and protect your personal health data.
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: January 2025
          </div>
        </div>

        {/* Quick Overview */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-blue-200">
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Privacy at a Glance
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>Your medical data stays private and encrypted</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>We never sell your personal information</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>You control who can access your records</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>You can delete your data at any time</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="prose prose-slate max-w-none">
          
          {/* Section 1: Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Who We Are</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              InfoRx is a healthcare technology platform designed to help patients in Nigeria and other underserved regions 
              better understand their medical information. We use artificial intelligence to interpret prescriptions, 
              lab results, and medical documents, making healthcare more accessible and understandable.
            </p>
            <p className="text-slate-700 leading-relaxed">
              This Privacy Policy applies to all services provided through our website, mobile applications, 
              and related platforms (collectively, the "Services").
            </p>
          </section>

          {/* Section 2: Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Name and email address (when you create an account)</li>
              <li>Phone number (optional, if provided)</li>
              <li>Authentication information (encrypted passwords, Google account details if you use Google login)</li>
              <li>Profile preferences and settings</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Medical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Medical documents you upload (prescriptions, lab results, scan reports)</li>
              <li>AI-generated summaries and interpretations of your medical data</li>
              <li>Health history and patterns identified from your records</li>
              <li>Notes and additional information you choose to provide</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Device type, operating system, and browser information</li>
              <li>IP address and general location (country/region level only)</li>
              <li>Usage patterns and feature interactions (anonymized)</li>
              <li>Error logs and performance data to improve our services</li>
            </ul>
          </section>

          {/* Section 3: How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
            
            <div className="bg-slate-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-3">Primary Uses</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Provide AI-powered interpretation of your medical documents</li>
                <li>Generate personalized health summaries and insights</li>
                <li>Maintain secure storage of your medical records</li>
                <li>Send you important account and security notifications</li>
                <li>Improve our AI algorithms and service quality (using anonymized data)</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Important: What We DON'T Do
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-amber-700">
                <li>We never sell your personal or medical information</li>
                <li>We don't share your data with insurance companies</li>
                <li>We don't use your information for marketing to third parties</li>
                <li>We don't provide medical advice or replace professional healthcare</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. When Information May Be Shared</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">With Your Explicit Consent</h3>
            <p className="text-slate-700 mb-4">
              You may choose to share specific medical records or summaries with healthcare providers. 
              This sharing only happens when you explicitly authorize it for each instance.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Service Providers</h3>
            <p className="text-slate-700 mb-4">
              We work with trusted third-party service providers who help us operate InfoRx:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li><strong>Supabase:</strong> Secure database hosting and authentication</li>
              <li><strong>AI Services (OpenRouter):</strong> Document interpretation (data is anonymized)</li>
              <li><strong>Cloud Infrastructure:</strong> Secure file storage and backup</li>
            </ul>
            <p className="text-slate-700 mb-4">
              All service providers are required to maintain strict confidentiality and security standards.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Legal Requirements</h3>
            <p className="text-slate-700 mb-4">
              We may disclose information if required by law, such as responding to valid legal requests 
              or protecting against fraud and security threats. We will notify you when possible and legally permitted.
            </p>
          </section>

          {/* Section 5: Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-blue-600" />
              5. How We Protect Your Data
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Encryption</h3>
                <ul className="list-disc pl-6 space-y-1 text-blue-700 text-sm">
                  <li>All data encrypted in transit and at rest</li>
                  <li>Industry-standard AES-256 encryption</li>
                  <li>Secure HTTPS connections for all communications</li>
                </ul>
              </div>
              <div className="bg-emerald-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-emerald-800 mb-3">Access Controls</h3>
                <ul className="list-disc pl-6 space-y-1 text-emerald-700 text-sm">
                  <li>Multi-factor authentication available</li>
                  <li>Role-based access for our team</li>
                  <li>Regular security audits and monitoring</li>
                </ul>
              </div>
            </div>

            <p className="text-slate-700 mt-4">
              We follow industry best practices and comply with applicable data protection regulations. 
              However, no system is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Section 6: Your Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Rights and Choices</h2>
            
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-3">You Have the Right To:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Access all your personal and medical data</li>
                  <li>Correct any inaccurate information</li>
                  <li>Delete your account and all associated data</li>
                  <li>Export your data in a portable format</li>
                </ul>
                <ul className="list-disc pl-6 space-y-2 text-slate-700">
                  <li>Control who can access your information</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Request information about data processing</li>
                  <li>File complaints with data protection authorities</li>
                </ul>
              </div>
            </div>

            <p className="text-slate-700">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@info-rx.org" className="text-blue-600 hover:underline">
                privacy@inforx.ng
              </a>{' '}
              or through your account settings.
            </p>
          </section>

          {/* Section 7: Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. How Long We Keep Your Data</h2>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li><strong>Active accounts:</strong> We keep your data while your account is active and for legitimate business purposes</li>
              <li><strong>Deleted accounts:</strong> Most data is deleted within 30 days, with some anonymized usage data retained for service improvement</li>
              <li><strong>Medical records:</strong> Deleted immediately when you delete them or close your account</li>
              <li><strong>Legal requirements:</strong> Some data may be retained longer if required by law</li>
            </ul>
          </section>

          {/* Section 8: International Data Transfers */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. International Data Transfers</h2>
            <p className="text-slate-700 mb-4">
              Your data may be processed in countries outside Nigeria, including the United States and European Union, 
              where our service providers operate. We ensure appropriate safeguards are in place through:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Contractual data protection clauses with service providers</li>
              <li>Compliance with international data transfer regulations</li>
              <li>Regular security assessments of data processing locations</li>
            </ul>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Children's Privacy</h2>
            <p className="text-slate-700">
              InfoRx is not intended for children under 18. We do not knowingly collect personal information from children. 
              If you believe a child has provided us with personal information, please contact us immediately at{' '}
              <a href="mailto:privacy@info-rx.org" className="text-blue-600 hover:underline">
                privacy@info-rx.org
              </a>.
            </p>
          </section>

          {/* Section 10: Changes to This Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to This Privacy Policy</h2>
            <p className="text-slate-700 mb-4">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal and regulatory reasons. 
              We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Sending an email notification to your registered email address</li>
              <li>Posting a notice on our website and in the app</li>
              <li>Updating the "Last updated" date at the top of this policy</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              11. Contact Us
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                If you have questions about this Privacy Policy or how we handle your information, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Email:</strong> privacy@info-rx.org</p>
                <p><strong>General Inquiries:</strong> hello@info-rx.org</p>
                <p><strong>Address:</strong> InfoRx Healthcare Technology<br />
                Port Harcourt, Rivers State, Nigeria</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}