import { Shield, Database, Clock, Trash2, Lock, Globe, FileText } from 'lucide-react';

export default function PrivacyPolicyContent() {
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
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Introduction</h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          <strong>Joseph S. Thomas dba Content-Strategy.co</strong> ("Company," "we," "us," or "our") is
          committed to protecting your privacy. This Privacy & Data Policy explains how we collect, use, store,
          and protect your information when you use Content Strategy Portal (the "Service").
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
          <p className="text-emerald-800 text-sm">
            We believe in transparency. This policy is designed to be clear and understandable, not hidden behind
            legal jargon. If you have questions, please contact us.
          </p>
        </div>
      </section>

      {/* Information We Collect */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Database className="w-5 h-5 text-primary-500" />
          Information We Collect
        </h2>

        <h3 className="text-base font-medium text-charcoal-800 mt-3 mb-2">Account Information</h3>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>Name and email address (required for account creation)</li>
          <li>Profile information you choose to provide</li>
          <li>Authentication data (passwords are encrypted and never stored in plain text)</li>
        </ul>

        <h3 className="text-base font-medium text-charcoal-800 mt-3 mb-2">Content You Upload</h3>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>Files uploaded for analysis (audit exports, documents, images)</li>
          <li>Project data and configurations you create</li>
          <li>SEO checklists and progress data</li>
          <li>Any text or content you input into AI tools</li>
        </ul>

        <h3 className="text-base font-medium text-charcoal-800 mt-3 mb-2">Usage Data</h3>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>Features and tools you use</li>
          <li>Actions you take within the Service</li>
          <li>Error logs and performance data</li>
          <li>Browser type and device information</li>
        </ul>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-blue-800 text-sm font-medium mb-1">What We Don't Collect:</p>
          <p className="text-blue-700 text-sm">
            We do not collect payment information directly (processed by third-party providers), precise location data,
            or any data from your device outside of the Service.
          </p>
        </div>
      </section>

      {/* Data Storage */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-500" />
          Data Storage & Security
        </h2>

        <h3 className="text-base font-medium text-charcoal-800 mt-3 mb-2">Where Your Data Is Stored</h3>
        <p className="text-charcoal-600 mb-3 text-sm">
          Your data is stored using Google Firebase services, which provides enterprise-grade security and compliance:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li><strong>Firebase Authentication:</strong> Handles user accounts and login security</li>
          <li><strong>Cloud Firestore:</strong> Stores your project data, checklists, and configurations</li>
          <li><strong>Cloud Storage:</strong> Stores uploaded files and generated exports</li>
        </ul>

        <h3 className="text-base font-medium text-charcoal-800 mt-3 mb-2">Security Measures</h3>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>All data is encrypted in transit (TLS/SSL) and at rest</li>
          <li>Access controls ensure only you can access your data</li>
          <li>Regular security audits and updates</li>
          <li>AI API communications use secure proxy servers (no direct browser access in production)</li>
        </ul>
      </section>

      {/* Data Retention */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Data Retention Policy
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-charcoal-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-charcoal-100">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-charcoal-700">Data Type</th>
                <th className="px-3 py-2 text-left font-semibold text-charcoal-700">Retention Period</th>
                <th className="px-3 py-2 text-left font-semibold text-charcoal-700">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              <tr>
                <td className="px-3 py-2 text-charcoal-600">Account Data</td>
                <td className="px-3 py-2 text-charcoal-600">Until account deletion</td>
                <td className="px-3 py-2 text-charcoal-500">Deleted upon request</td>
              </tr>
              <tr className="bg-charcoal-50/50">
                <td className="px-3 py-2 text-charcoal-600">Project Data</td>
                <td className="px-3 py-2 text-charcoal-600">Until deleted by user</td>
                <td className="px-3 py-2 text-charcoal-500">User-controlled</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-charcoal-600">Uploaded Files</td>
                <td className="px-3 py-2 text-charcoal-600">90 days after last access</td>
                <td className="px-3 py-2 text-charcoal-500">Auto-cleaned</td>
              </tr>
              <tr className="bg-charcoal-50/50">
                <td className="px-3 py-2 text-charcoal-600">Audit Results</td>
                <td className="px-3 py-2 text-charcoal-600">Until deleted by user</td>
                <td className="px-3 py-2 text-charcoal-500">User-controlled</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-charcoal-600">AI-Generated Content</td>
                <td className="px-3 py-2 text-charcoal-600">Session-only (not stored)</td>
                <td className="px-3 py-2 text-charcoal-500">User must save/export</td>
              </tr>
              <tr className="bg-charcoal-50/50">
                <td className="px-3 py-2 text-charcoal-600">Shared Audit Links</td>
                <td className="px-3 py-2 text-charcoal-600">30 days from creation</td>
                <td className="px-3 py-2 text-charcoal-500">Configurable expiration</td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-charcoal-600">Usage Logs</td>
                <td className="px-3 py-2 text-charcoal-600">30 days</td>
                <td className="px-3 py-2 text-charcoal-500">For debugging only</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
          <p className="text-amber-800 text-sm">
            <strong>Note:</strong> After account deletion, we retain anonymized, aggregated data for analytics purposes.
            This data cannot be linked back to you.
          </p>
        </div>
      </section>

      {/* Your Rights */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-500" />
          Your Data Rights
        </h2>
        <p className="text-charcoal-600 mb-3 text-sm">You have the right to:</p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li><strong>Access:</strong> Request a copy of your personal data</li>
          <li><strong>Correction:</strong> Request correction of inaccurate data</li>
          <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
          <li><strong>Export:</strong> Export your data in a portable format</li>
          <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
          <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
        </ul>
        <p className="text-charcoal-600 mt-3 text-sm">
          To exercise any of these rights, use the contact form on our website.
          We will respond within 30 days.
        </p>
      </section>

      {/* Data Deletion */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-500" />
          Account & Data Deletion
        </h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          You can delete your account at any time from your account settings. Upon deletion:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>Your account and profile data will be immediately removed</li>
          <li>Your projects, checklists, and audit data will be deleted within 24 hours</li>
          <li>Uploaded files will be purged within 7 days</li>
          <li>Shared links will stop working immediately</li>
          <li>Backups containing your data will be purged within 30 days</li>
        </ul>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">
            <strong>Warning:</strong> Account deletion is permanent and cannot be undone. Please export any data
            you wish to keep before deleting your account.
          </p>
        </div>
      </section>

      {/* Third-Party Services */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary-500" />
          Third-Party Services
        </h2>
        <p className="text-charcoal-600 mb-3 text-sm">We use the following third-party services:</p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-2 text-sm">
          <li>
            <strong>Google Firebase:</strong> Authentication, database, and storage
          </li>
          <li>
            <strong>Anthropic (Claude AI):</strong> AI-powered content generation
          </li>
        </ul>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
          <p className="text-blue-800 text-sm">
            <strong>AI Processing Notice:</strong> When using AI features, the content you input is sent to our
            secure proxy server and then to Anthropic's API. Anthropic does not use your inputs to train their models.
          </p>
        </div>
      </section>

      {/* Cookies */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Cookies & Local Storage</h2>
        <p className="text-charcoal-600 mb-3 text-sm">We use essential cookies and local storage for:</p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm">
          <li>Keeping you logged in (authentication tokens)</li>
          <li>Remembering your preferences (theme, view settings)</li>
          <li>Storing temporary work in progress</li>
        </ul>
        <p className="text-charcoal-600 mt-3 text-sm">
          We do not use tracking cookies, advertising cookies, or share cookie data with third parties.
        </p>
      </section>

      {/* Updates */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Changes to This Policy</h2>
        <p className="text-charcoal-600 text-sm">
          We may update this Privacy Policy from time to time. We will notify you of significant changes by
          email or through a notice on the Service. Your continued use of the Service after changes constitutes
          acceptance of the updated policy.
        </p>
      </section>

      {/* End marker for scroll detection */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-700 font-medium">End of Privacy & Data Policy</p>
        <p className="text-green-600 text-sm mt-1">
          By clicking "I Accept", you agree to our data practices.
        </p>
      </div>
    </div>
  );
}
