import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, Shield, AlertTriangle, FileText, Building } from 'lucide-react';

export default function TermsOfService() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-charcoal-600 hover:text-primary-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">Terms of Service</h1>
              <p className="text-charcoal-500">Last updated: {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-charcoal max-w-none">
          {/* Introduction */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Agreement to Terms
            </h2>
            <p className="text-charcoal-600 mb-4">
              Welcome to Content Strategy Portal. By accessing or using our services, you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). Please read them carefully before using the platform.
            </p>
            <p className="text-charcoal-600 mb-4">
              These Terms constitute a legally binding agreement between you and <strong>Joseph S. Thomas dba Content-Strategy.co</strong>
              (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) regarding your use of the Content Strategy Portal
              web application and related services (collectively, the &quot;Service&quot;).
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800 text-sm font-medium">
                By creating an account or using any part of the Service, you acknowledge that you have read, understood,
                and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
              </p>
            </div>
          </section>

          {/* Eligibility & Age Requirements */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Eligibility & Age Requirements</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm font-medium">Age Requirement:</p>
              <p className="text-blue-700 text-sm mt-1">
                You must be at least <strong>18 years of age</strong> to use this Service. If you are between 13 and 17 years
                of age, you may only use this Service with the consent and supervision of a parent or legal guardian who agrees
                to be bound by these Terms.
              </p>
            </div>
            <p className="text-charcoal-600 mb-4">
              By using the Service, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>You are at least 18 years old, or if you are between 13-17, you have parental/guardian consent</li>
              <li>You have the legal capacity to enter into a binding agreement</li>
              <li>You are not barred from using the Service under applicable law</li>
              <li>If using the Service on behalf of an organization, you have authority to bind that organization</li>
            </ul>
            <p className="text-charcoal-600 mt-4">
              We do not knowingly collect information from children under 13. If you believe a child under 13 has provided
              us with personal information, please contact us immediately.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary-500" />
              Intellectual Property & Ownership
            </h2>
            <p className="text-charcoal-600 mb-4">
              The Content Strategy Portal, including all source code, design, graphics, user interfaces, algorithms,
              features, and documentation, is the exclusive intellectual property of <strong>Joseph S. Thomas dba Content-Strategy.co</strong>.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
              <p className="text-blue-800 text-sm font-medium mb-2">Important Notice:</p>
              <p className="text-blue-700 text-sm">
                This software and all associated intellectual property were independently created and developed by Joseph S. Thomas
                in his personal capacity. <strong>No tools, resources, code, frameworks, or intellectual property from any employer,
                including but not limited to Interpublic Group, Omnicom, or any of their subsidiaries or affiliates, were used in the
                creation, development, or operation of this Service.</strong>
              </p>
            </div>
            <p className="text-charcoal-600 mb-4">
              All rights, title, and interest in and to the Service, including all intellectual property rights therein,
              are and shall remain the exclusive property of Joseph S. Thomas dba Content-Strategy.co.
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>You may not copy, modify, distribute, sell, or lease any part of the Service</li>
              <li>You may not reverse engineer or attempt to extract the source code</li>
              <li>You may not use our trademarks, logos, or branding without written permission</li>
              <li>You retain ownership of any content you upload or create using the Service</li>
            </ul>
          </section>

          {/* AI Features */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              AI-Powered Features Disclaimer
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm font-medium mb-2">Critical Notice Regarding AI-Generated Content:</p>
              <p className="text-red-700 text-sm">
                The Service includes AI-powered features for generating metadata, alt text, structured data, and other content
                suggestions. <strong>AI systems can and do make mistakes.</strong> AI-generated content may contain errors,
                inaccuracies, inappropriate suggestions, or &quot;hallucinations&quot; (confident but incorrect outputs).
              </p>
            </div>
            <p className="text-charcoal-600 mb-4">
              By using any AI-powered features of the Service, you acknowledge and agree that:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>All AI-generated content is provided as <strong>suggestions only</strong> and requires human review</li>
              <li>You are solely responsible for reviewing, editing, and validating any AI-generated content before use</li>
              <li>You must verify the accuracy, appropriateness, and legal compliance of all AI-generated content</li>
              <li>AI outputs may not be suitable for your specific use case, industry, or jurisdiction</li>
              <li>We make no warranties regarding the accuracy, completeness, or reliability of AI-generated content</li>
            </ul>
            <p className="text-charcoal-600 font-medium">
              We strongly recommend having qualified professionals review all AI-generated content before publication or implementation.
            </p>
          </section>

          {/* Not Professional Advice */}
          <section className="card p-8 mb-6 bg-amber-50 border-amber-200">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Not Professional Advice</h2>
            <div className="bg-white border border-amber-300 rounded-lg p-4 mb-4">
              <p className="text-charcoal-700 text-sm font-medium mb-2">Important Disclaimer:</p>
              <p className="text-charcoal-600 text-sm">
                The Content Strategy Portal and all content generated through it (including SEO recommendations,
                accessibility suggestions, metadata, alt text, and structured data) are provided for <strong>informational
                and educational purposes only</strong>.
              </p>
            </div>
            <p className="text-charcoal-600 mb-4">
              <strong>This Service does not constitute and should not be relied upon as:</strong>
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>Professional SEO consulting or marketing advice</li>
              <li>Legal advice or compliance guidance (including ADA, WCAG, GDPR, or other regulations)</li>
              <li>Professional accessibility consulting or WCAG certification</li>
              <li>Web development or technical consulting services</li>
              <li>Guarantee of search engine rankings or performance</li>
            </ul>
            <p className="text-charcoal-600">
              For specific legal, compliance, accessibility, or professional SEO requirements, you should consult
              with qualified professionals in those respective fields. We disclaim any liability arising from
              reliance on this Service as a substitute for professional advice.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              Limitation of Liability
            </h2>
            <p className="text-charcoal-600 mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
            </p>
            <div className="bg-charcoal-100 rounded-lg p-4 mb-4">
              <ul className="text-charcoal-700 space-y-3 text-sm">
                <li>
                  <strong>1.</strong> Joseph S. Thomas dba Content-Strategy.co, its officers, directors, employees, agents,
                  and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
                  including but not limited to loss of profits, data, use, goodwill, or other intangible losses.
                </li>
                <li>
                  <strong>2.</strong> We are not liable for any damages arising from AI-generated content, including but not
                  limited to errors, hallucinations, inaccuracies, or inappropriate suggestions.
                </li>
                <li>
                  <strong>3.</strong> We are not liable for any damages resulting from your reliance on AI-generated content
                  without proper human review and verification.
                </li>
                <li>
                  <strong>4.</strong> Our total liability for any claims arising from or related to the Service shall not
                  exceed the amount you paid us in the twelve (12) months preceding the claim.
                </li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">User Responsibilities</h2>
            <p className="text-charcoal-600 mb-4">By using the Service, you agree to:</p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not share your account with others</li>
              <li>Use the Service only for lawful purposes</li>
              <li>Not attempt to disrupt, damage, or gain unauthorized access to the Service</li>
              <li>Thoroughly review and verify all AI-generated content before use</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use the Service to generate content that is illegal, harmful, or infringes on others&apos; rights</li>
            </ul>
          </section>

          {/* Indemnification */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Indemnification</h2>
            <p className="text-charcoal-600">
              You agree to indemnify, defend, and hold harmless Joseph S. Thomas dba Content-Strategy.co, its officers,
              directors, employees, agents, and affiliates from and against any and all claims, damages, losses, costs,
              and expenses (including reasonable attorneys&apos; fees) arising from or related to:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mt-4">
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Your use of AI-generated content without proper review</li>
              <li>Any content you upload, create, or publish using the Service</li>
              <li>Your violation of any applicable laws or regulations</li>
            </ul>
          </section>

          {/* Termination */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Termination</h2>
            <p className="text-charcoal-600 mb-4">
              We reserve the right to suspend or terminate your access to the Service at any time, with or without cause,
              and with or without notice. Upon termination:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>Your right to use the Service will immediately cease</li>
              <li>You may export your data in accordance with our data retention policies</li>
              <li>We may delete your account and associated data after a reasonable period</li>
              <li>Provisions that by their nature should survive termination will survive</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Governing Law & Disputes</h2>
            <p className="text-charcoal-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of [Your State],
              without regard to its conflict of law provisions.
            </p>
            <p className="text-charcoal-600">
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in
              accordance with the rules of the American Arbitration Association, unless you opt out within 30 days
              of creating your account.
            </p>
          </section>

          {/* Changes to Terms */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Changes to These Terms</h2>
            <p className="text-charcoal-600">
              We reserve the right to modify these Terms at any time. We will notify you of any material changes by
              posting the new Terms on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service
              after such changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Contact Information</h2>
            <p className="text-charcoal-600 mb-4">
              If you have any questions about these Terms, please contact us:
            </p>
            <div className="bg-charcoal-50 rounded-lg p-4">
              <p className="text-charcoal-700 font-medium">Joseph S. Thomas dba Content-Strategy.co</p>
              <p className="text-charcoal-600">Email: legal@content-strategy.co</p>
            </div>
          </section>

          {/* Related Policies */}
          <section className="card p-8 bg-charcoal-50">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Related Policies</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/privacy"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-primary-300 transition-colors"
              >
                <Shield className="w-4 h-4 text-primary-500" />
                <span className="text-charcoal-700">Privacy & Data Policy</span>
              </Link>
              <Link
                to="/ai-policy"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-primary-300 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-charcoal-700">AI Usage Policy</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
