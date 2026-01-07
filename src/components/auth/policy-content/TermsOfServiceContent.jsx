import { Scale, Shield, AlertTriangle, FileText, Building } from 'lucide-react';

export default function TermsOfServiceContent() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-charcoal-500">Last updated: {currentDate}</p>

      {/* Introduction */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          Agreement to Terms
        </h2>
        <p className="text-charcoal-600 mb-3">
          Welcome to Content Strategy Portal. By accessing or using our services, you agree to be bound by these
          Terms of Service ("Terms"). Please read them carefully before using the platform.
        </p>
        <p className="text-charcoal-600 mb-3">
          These Terms constitute a legally binding agreement between you and <strong>Joseph S. Thomas dba Content-Strategy.co</strong>
          ("Company," "we," "us," or "our") regarding your use of the Content Strategy Portal
          web application and related services (collectively, the "Service").
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          <p className="text-amber-800 text-sm font-medium">
            By creating an account or using any part of the Service, you acknowledge that you have read, understood,
            and agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
          </p>
        </div>
      </section>

      {/* Eligibility & Age Requirements */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Eligibility & Age Requirements</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-blue-800 text-sm font-medium">Age Requirement:</p>
          <p className="text-blue-700 text-sm mt-1">
            You must be at least <strong>18 years of age</strong> to use this Service. If you are between 13 and 17 years
            of age, you may only use this Service with the consent and supervision of a parent or legal guardian who agrees
            to be bound by these Terms.
          </p>
        </div>
        <p className="text-charcoal-600 mb-3">
          By using the Service, you represent and warrant that:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>You are at least 18 years old, or if you are between 13-17, you have parental/guardian consent</li>
          <li>You have the legal capacity to enter into a binding agreement</li>
          <li>You are not barred from using the Service under applicable law</li>
          <li>If using the Service on behalf of an organization, you have authority to bind that organization</li>
        </ul>
        <p className="text-charcoal-600 mt-3 text-sm">
          We do not knowingly collect information from children under 13. If you believe a child under 13 has provided
          us with personal information, please contact us immediately.
        </p>
      </section>

      {/* Intellectual Property */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Building className="w-5 h-5 text-primary-500" />
          Intellectual Property & Ownership
        </h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          The Content Strategy Portal, including all source code, design, graphics, user interfaces, algorithms,
          features, and documentation, is the exclusive intellectual property of <strong>Joseph S. Thomas dba Content-Strategy.co</strong>.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-3">
          <p className="text-blue-800 text-sm font-medium mb-1">Important Notice:</p>
          <p className="text-blue-700 text-sm">
            This software and all associated intellectual property were independently created and developed by Joseph S. Thomas
            in his personal capacity. <strong>No tools, resources, code, frameworks, or intellectual property from any employer,
            including but not limited to Interpublic Group, Omnicom, or any of their subsidiaries or affiliates, were used in the
            creation, development, or operation of this Service.</strong>
          </p>
        </div>
        <p className="text-charcoal-600 mb-3 text-sm">
          All rights, title, and interest in and to the Service, including all intellectual property rights therein,
          are and shall remain the exclusive property of Joseph S. Thomas dba Content-Strategy.co.
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>You may not copy, modify, distribute, sell, or lease any part of the Service</li>
          <li>You may not reverse engineer or attempt to extract the source code</li>
          <li>You may not use our trademarks, logos, or branding without written permission</li>
          <li>You retain ownership of any content you upload or create using the Service</li>
        </ul>
      </section>

      {/* AI Features */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          AI-Powered Features Disclaimer
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-red-800 text-sm font-medium mb-1">Critical Notice Regarding AI-Generated Content:</p>
          <p className="text-red-700 text-sm">
            The Service includes AI-powered features for generating metadata, alt text, structured data, and other content
            suggestions. <strong>AI systems can and do make mistakes.</strong> AI-generated content may contain errors,
            inaccuracies, inappropriate suggestions, or "hallucinations" (confident but incorrect outputs).
          </p>
        </div>
        <p className="text-charcoal-600 mb-3 text-sm">
          By using any AI-powered features of the Service, you acknowledge and agree that:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>All AI-generated content is provided as <strong>suggestions only</strong> and requires human review</li>
          <li>You are solely responsible for reviewing, editing, and validating any AI-generated content before use</li>
          <li>You must verify the accuracy, appropriateness, and legal compliance of all AI-generated content</li>
          <li>AI outputs may not be suitable for your specific use case, industry, or jurisdiction</li>
          <li>We make no warranties regarding the accuracy, completeness, or reliability of AI-generated content</li>
        </ul>
        <p className="text-charcoal-600 font-medium text-sm">
          We strongly recommend having qualified professionals review all AI-generated content before publication or implementation.
        </p>
      </section>

      {/* Not Professional Advice */}
      <section className="bg-amber-50 rounded-xl p-6 border border-amber-200">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Not Professional Advice</h2>
        <div className="bg-white border border-amber-300 rounded-lg p-3 mb-3">
          <p className="text-charcoal-700 text-sm font-medium mb-1">Important Disclaimer:</p>
          <p className="text-charcoal-600 text-sm">
            The Content Strategy Portal and all content generated through it (including SEO recommendations,
            accessibility suggestions, metadata, alt text, and structured data) are provided for <strong>informational
            and educational purposes only</strong>.
          </p>
        </div>
        <p className="text-charcoal-600 mb-3 text-sm">
          <strong>This Service does not constitute and should not be relied upon as:</strong>
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>Professional SEO consulting or marketing advice</li>
          <li>Legal advice or compliance guidance (including ADA, WCAG, GDPR, or other regulations)</li>
          <li>Professional accessibility consulting or WCAG certification</li>
          <li>Web development or technical consulting services</li>
          <li>Guarantee of search engine rankings or performance</li>
        </ul>
        <p className="text-charcoal-600 text-sm">
          For specific legal, compliance, accessibility, or professional SEO requirements, you should consult
          with qualified professionals in those respective fields. We disclaim any liability arising from
          reliance on this Service as a substitute for professional advice.
        </p>
      </section>

      {/* Limitation of Liability */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" />
          Limitation of Liability
        </h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:
        </p>
        <div className="bg-charcoal-100 rounded-lg p-3 mb-3">
          <ul className="text-charcoal-700 space-y-2 text-sm">
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
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">User Responsibilities</h2>
        <p className="text-charcoal-600 mb-3 text-sm">By using the Service, you agree to:</p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>Provide accurate and complete registration information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Not share your account with others</li>
          <li>Use the Service only for lawful purposes</li>
          <li>Not attempt to disrupt, damage, or gain unauthorized access to the Service</li>
          <li>Thoroughly review and verify all AI-generated content before use</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Not use the Service to generate content that is illegal, harmful, or infringes on others' rights</li>
        </ul>
      </section>

      {/* Indemnification */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Indemnification</h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          You agree to indemnify, defend, and hold harmless Joseph S. Thomas dba Content-Strategy.co, its officers,
          directors, employees, agents, and affiliates from and against any and all claims, damages, losses, costs,
          and expenses (including reasonable attorneys' fees) arising from or related to:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>Your use of the Service</li>
          <li>Your violation of these Terms</li>
          <li>Your use of AI-generated content without proper review</li>
          <li>Any content you upload, create, or publish using the Service</li>
          <li>Your violation of any applicable laws or regulations</li>
        </ul>
      </section>

      {/* Termination */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Termination</h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          We reserve the right to suspend or terminate your access to the Service at any time, with or without cause,
          and with or without notice. Upon termination:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>Your right to use the Service will immediately cease</li>
          <li>You may export your data in accordance with our data retention policies</li>
          <li>We may delete your account and associated data after a reasonable period</li>
          <li>Provisions that by their nature should survive termination will survive</li>
        </ul>
      </section>

      {/* Governing Law */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Governing Law & Disputes</h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          These Terms shall be governed by and construed in accordance with the laws of the State of Tennessee,
          without regard to its conflict of law provisions.
        </p>
        <p className="text-charcoal-600 text-sm">
          Any disputes arising from these Terms or the Service shall be resolved through binding arbitration in
          accordance with the rules of the American Arbitration Association, unless you opt out within 30 days
          of creating your account.
        </p>
      </section>

      {/* Changes to Terms */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Changes to These Terms</h2>
        <p className="text-charcoal-600 text-sm">
          We reserve the right to modify these Terms at any time. We will notify you of any material changes by
          posting the new Terms on this page and updating the "Last updated" date. Your continued use of the Service
          after such changes constitutes your acceptance of the new Terms.
        </p>
      </section>

      {/* End marker for scroll detection */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <Scale className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-700 font-medium">End of Terms of Service</p>
        <p className="text-green-600 text-sm mt-1">
          By clicking "I Accept", you agree to be bound by these terms.
        </p>
      </div>
    </div>
  );
}
