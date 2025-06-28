'use client';

import { Metadata } from 'next';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, AlertTriangle, Bookmark, Scale, FileText, Mail } from 'lucide-react';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}


export default function TermsOfServicePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          overwrite: true,
        }
      );

      // Sections animation on scroll
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          gsap.fromTo(
            section,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: 'power2.out',
              overwrite: true,
              scrollTrigger: {
                trigger: section,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none none',
                once: true,
              },
              delay: index * 0.1,
            }
          );
        }
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            These terms govern your use of InfoRx and outline our mutual responsibilities.
            Please read them carefully before using our services.
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Last updated: January 2025
          </div>
        </div>

        {/* Quick Overview */}
        <div 
          ref={(el) => {
            if (el) sectionsRef.current[0] = el;
          }}
          className="bg-gradient-to-r from-blue-50 to-emerald-50 rounded-2xl p-6 mb-8 border border-blue-200"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Key Points Summary
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>InfoRx is not a substitute for professional medical advice</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>You own your medical data and control access to it</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>You must be at least 18 years old to use our services</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
              <span>We may update these terms with reasonable notice</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="prose prose-slate max-w-none">
          
          {/* Section 1: Acceptance */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[1] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              By accessing or using the InfoRx platform, website, mobile application, or any other related services (collectively, the "Services"), 
              you agree to be bound by these Terms of Service. If you don't agree to these terms, please do not use our Services.
            </p>
            <p className="text-slate-700 leading-relaxed">
              These Terms constitute a legal agreement between you and InfoRx, a healthcare technology company registered in Nigeria.
              You must be at least 18 years old and capable of forming a binding contract to use our Services.
            </p>
          </section>

          {/* Section 2: Account Registration */}
          <section 
            ref={(el) => {
              if (el) {
                sectionsRef.current[2] = el
              };
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Account Registration and Responsibilities</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">Account Creation</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              To use certain features of our Services, you may need to create an account. You agree to provide accurate, current, 
              and complete information during the registration process and to update such information to keep it accurate and current.
            </p>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">Account Security</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access to your account</li>
              <li>Ensuring you exit from your account at the end of each session when accessing InfoRx on shared devices</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mb-3">User Commitments</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              By creating an account, you commit to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Provide accurate and truthful information about yourself</li>
              <li>Promptly update your information if it changes</li>
              <li>Not share your account with anyone else</li>
              <li>Not create multiple accounts for the same individual</li>
            </ul>
          </section>

          {/* Section 3: Permitted Use */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[3] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Permitted Use of Services</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">Authorized Uses</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Subject to these Terms, InfoRx grants you a limited, non-exclusive, non-transferable, 
              and revocable license to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Access and use our Services for your personal, non-commercial health information needs</li>
              <li>Upload and store your medical documents for interpretation and record-keeping</li>
              <li>View AI-generated summaries and explanations of your medical information</li>
              <li>Manage and organize your personal health records</li>
            </ul>

            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-medium text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Prohibited Uses
              </h3>
              <p className="text-slate-700 mb-4">
                You agree NOT to use the Services to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>Upload or share medical documents or information of other individuals without proper authorization</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Impersonate another person or entity</li>
                <li>Engage in any activity that could harm, disable, or impair our Services</li>
                <li>Attempt to gain unauthorized access to any part of the Services</li>
                <li>Use the Services for commercial purposes without our prior written consent</li>
                <li>Upload content that is illegal, harmful, threatening, or otherwise objectionable</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Medical Disclaimers */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[4] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Medical Disclaimers and Limitations</h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-medium text-amber-800 mb-3">Not a Substitute for Professional Medical Advice</h3>
              <p className="text-amber-700">
                <strong>InfoRx is not a healthcare provider.</strong> The information and services provided by InfoRx are not 
                intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of qualified 
                healthcare providers with any questions regarding your medical condition. Never disregard professional medical 
                advice or delay seeking it because of information provided by InfoRx.
              </p>
            </div>

            <h3 className="text-xl font-medium text-slate-800 mb-3">AI Limitations</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Our AI-powered interpretations and summaries:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>Are provided for informational and educational purposes only</li>
              <li>May not capture all nuances of your medical documents</li>
              <li>Are not 100% accurate and may contain errors or omissions</li>
              <li>Should be verified with healthcare professionals</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Emergency Situations</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              InfoRx is not designed for emergency medical situations. If you are experiencing a medical emergency, 
              please contact your local emergency services immediately, such as by dialing 112 or 999 in Nigeria, 
              or going to the nearest hospital emergency department.
            </p>
          </section>

          {/* Section 5: User Content */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[5] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. User Content and Medical Records</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">Ownership of Content</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You retain all ownership rights to the medical documents and information you upload to InfoRx. 
              By uploading content, you grant us a limited license to store, process, and analyze your content 
              solely for the purpose of providing our Services to you.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Accuracy of Information</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You are solely responsible for ensuring the accuracy and completeness of the information you provide. 
              We do not verify the accuracy of the medical documents you upload or the information you provide.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Sharing Controls</h3>
            <p className="text-slate-700 leading-relaxed">
              Our platform allows you to control who can access your medical information. You are responsible for 
              managing these sharing permissions and understanding the implications of sharing your medical records.
            </p>
          </section>

          {/* Section 6: Intellectual Property */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[6] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-blue-600" />
              6. Intellectual Property Rights
            </h2>
            
            <p className="text-slate-700 leading-relaxed mb-4">
              InfoRx and its original content, features, and functionality are owned by InfoRx and are protected 
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Our Intellectual Property</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              The following are proprietary to InfoRx:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>The InfoRx name, logo, and brand elements</li>
              <li>Our AI algorithms and technology</li>
              <li>The design, structure, and layout of our website and applications</li>
              <li>Text, graphics, images, and other content created by InfoRx</li>
            </ul>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Limited License to Use</h3>
            <p className="text-slate-700 leading-relaxed">
              We grant you a limited license to use our Services for personal, non-commercial purposes 
              in accordance with these Terms. You may not copy, modify, distribute, sell, or lease any part 
              of our Services or included software without our permission.
            </p>
          </section>

          {/* Section 7: Limitation of Liability */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[7] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Limitation of Liability</h2>
            
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mb-4">
              <h3 className="text-lg font-medium text-slate-800 mb-3">To the extent permitted by law:</h3>
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>
                  InfoRx provides its services "as is" and "as available" without any warranties of any kind, 
                  whether express or implied, including but not limited to the implied warranties of merchantability, 
                  fitness for a particular purpose, and non-infringement.
                </li>
                <li>
                  InfoRx makes no warranty that its services will meet your requirements or be available on an uninterrupted, 
                  secure, or error-free basis.
                </li>
                <li>
                  InfoRx disclaims all liability for any harm or damages arising out of or in connection with your use of our Services.
                </li>
              </ul>
            </div>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Indemnification</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You agree to defend, indemnify, and hold harmless InfoRx and its officers, directors, employees, and agents from and against any 
              claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) 
              arising out of or relating to your violation of these Terms or your use of the Services.
            </p>
          </section>

          {/* Section 8: Termination */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[8] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Termination of Service</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">User Termination</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              You can stop using our Services and delete your account at any time through your account settings. 
              Upon deletion, we will remove your personal information and medical records in accordance with our Privacy Policy.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">InfoRx Termination Rights</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may suspend or terminate your access to our Services:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-700">
              <li>If you violate these Terms of Service</li>
              <li>If we reasonably believe your use poses a risk to InfoRx or other users</li>
              <li>For extended periods of account inactivity (with prior notice)</li>
              <li>If required by law or government authorities</li>
            </ul>
          </section>

          {/* Section 9: Dispute Resolution */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[9] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Dispute Resolution</h2>
            
            <h3 className="text-xl font-medium text-slate-800 mb-3">Informal Resolution</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              Before filing a claim against InfoRx, you agree to try to resolve the dispute informally by contacting us at 
              legal@inforx.ng. We'll try to resolve the dispute informally by contacting you via email.
            </p>

            <h3 className="text-xl font-medium text-slate-800 mb-3">Formal Proceedings</h3>
            <p className="text-slate-700 leading-relaxed mb-4">
              If we cannot resolve a dispute informally within 60 days, either party may initiate formal proceedings. 
              Any legal proceeding shall be brought solely in the courts of Nigeria.
            </p>
          </section>

          {/* Section 10: Changes to Terms */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[10] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to These Terms</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              We may update these Terms from time to time to reflect changes in our services, legal requirements, or for other reasons. 
              We will notify you of significant changes by:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              <li>Sending a notification to your registered email address</li>
              <li>Posting a notice on our website and in the app</li>
              <li>Updating the "Last updated" date at the top of these Terms</li>
            </ul>
            <p className="text-slate-700 leading-relaxed mb-4">
              Your continued use of InfoRx after changes become effective constitutes your acceptance of the updated Terms. 
              If you do not agree with the updated Terms, you must stop using our Services.
            </p>
          </section>

          {/* Section 11: Governing Law */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[11] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Governing Law</h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, 
              without regard to its conflict of law principles.
            </p>
            <p className="text-slate-700 leading-relaxed">
              These Terms shall comply with the Nigeria Data Protection Regulation (NDPR) and other applicable Nigerian laws 
              relating to data protection, privacy, and electronic communications.
            </p>
          </section>

          {/* Contact Information */}
          <section 
            ref={(el) => {
              if (el) sectionsRef.current[12] = el;
            }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              12. Contact Us
            </h2>
            <div className="bg-slate-50 rounded-lg p-6">
              <p className="text-slate-700 mb-4">
                If you have questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-slate-700">
                <p><strong>Legal Inquiries:</strong> legal@inforx.ng</p>
                <p><strong>General Questions:</strong> hello@inforx.ng</p>
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