import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Clock, Trash2, Lock, Globe, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">Privacy & Data Policy</h1>
              <p className="text-charcoal-500">Last updated: {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-charcoal max-w-none">
          {/* Introduction */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Introduction</h2>
            <p className="text-charcoal-600 mb-4">
              <strong>Joseph S. Thomas dba Content-Strategy.co</strong> (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is
              committed to protecting your privacy. This Privacy & Data Policy explains how we collect, use, store,
              and protect your information when you use Content Strategy Portal (the &quot;Service&quot;).
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-800 text-sm">
                We believe in transparency. This policy is designed to be clear and understandable, not hidden behind
                legal jargon. If you have questions, please contact us.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary-500" />
              Information We Collect
            </h2>

            <h3 className="text-lg font-medium text-charcoal-800 mt-4 mb-2">Account Information</h3>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>Name and email address (required for account creation)</li>
              <li>Profile information you choose to provide</li>
              <li>Authentication data (passwords are encrypted and never stored in plain text)</li>
            </ul>

            <h3 className="text-lg font-medium text-charcoal-800 mt-4 mb-2">Content You Upload</h3>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>Files uploaded for analysis (audit exports, documents, images)</li>
              <li>Project data and configurations you create</li>
              <li>SEO checklists and progress data</li>
              <li>Any text or content you input into AI tools</li>
            </ul>

            <h3 className="text-lg font-medium text-charcoal-800 mt-4 mb-2">Usage Data</h3>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>Features and tools you use</li>
              <li>Actions you take within the Service</li>
              <li>Error logs and performance data</li>
              <li>Browser type and device information</li>
            </ul>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm font-medium mb-1">What We Don&apos;t Collect:</p>
              <p className="text-blue-700 text-sm">
                We do not collect payment information directly (processed by third-party providers), precise location data,
                or any data from your device outside of the Service.
              </p>
            </div>
          </section>

          {/* Data Storage */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary-500" />
              Data Storage & Security
            </h2>

            <h3 className="text-lg font-medium text-charcoal-800 mt-4 mb-2">Where Your Data Is Stored</h3>
            <p className="text-charcoal-600 mb-4">
              Your data is stored using Google Firebase services, which provides enterprise-grade security and compliance:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li><strong>Firebase Authentication:</strong> Handles user accounts and login security</li>
              <li><strong>Cloud Firestore:</strong> Stores your project data, checklists, and configurations</li>
              <li><strong>Cloud Storage:</strong> Stores uploaded files and generated exports</li>
            </ul>

            <h3 className="text-lg font-medium text-charcoal-800 mt-4 mb-2">Security Measures</h3>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>All data is encrypted in transit (TLS/SSL) and at rest</li>
              <li>Access controls ensure only you can access your data</li>
              <li>Regular security audits and updates</li>
              <li>AI API communications use secure proxy servers (no direct browser access in production)</li>
            </ul>
          </section>

          {/* Data Retention */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Data Retention Policy
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-charcoal-200 rounded-lg overflow-hidden">
                <thead className="bg-charcoal-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Data Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Retention Period</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-charcoal-700">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Account Data</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Until account deletion</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">Deleted upon request</td>
                  </tr>
                  <tr className="bg-charcoal-50">
                    <td className="px-4 py-3 text-sm text-charcoal-600">Project Data</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Until deleted by user</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">User-controlled</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Uploaded Files</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">90 days after last access</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">Auto-cleaned</td>
                  </tr>
                  <tr className="bg-charcoal-50">
                    <td className="px-4 py-3 text-sm text-charcoal-600">Audit Results</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Until deleted by user</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">User-controlled</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-charcoal-600">AI-Generated Content</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Session-only (not stored)</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">User must save/export</td>
                  </tr>
                  <tr className="bg-charcoal-50">
                    <td className="px-4 py-3 text-sm text-charcoal-600">Shared Audit Links</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">30 days from creation</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">Configurable expiration</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-charcoal-600">Usage Logs</td>
                    <td className="px-4 py-3 text-sm text-charcoal-600">30 days</td>
                    <td className="px-4 py-3 text-sm text-charcoal-500">For debugging only</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-amber-800 text-sm">
                <strong>Note:</strong> After account deletion, we retain anonymized, aggregated data for analytics purposes.
                This data cannot be linked back to you.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Your Data Rights
            </h2>
            <p className="text-charcoal-600 mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
              <li><strong>Export:</strong> Export your data in a portable format</li>
              <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
              <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            </ul>
            <p className="text-charcoal-600 mt-4">
              To exercise any of these rights, use the contact form on our website.
              We will respond within 30 days.
            </p>
          </section>

          {/* Data Deletion */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Account & Data Deletion
            </h2>
            <p className="text-charcoal-600 mb-4">
              You can delete your account at any time from your account settings. Upon deletion:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>Your account and profile data will be immediately removed</li>
              <li>Your projects, checklists, and audit data will be deleted within 24 hours</li>
              <li>Uploaded files will be purged within 7 days</li>
              <li>Shared links will stop working immediately</li>
              <li>Backups containing your data will be purged within 30 days</li>
            </ul>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">
                <strong>Warning:</strong> Account deletion is permanent and cannot be undone. Please export any data
                you wish to keep before deleting your account.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary-500" />
              Third-Party Services
            </h2>
            <p className="text-charcoal-600 mb-4">We use the following third-party services:</p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-3">
              <li>
                <strong>Google Firebase:</strong> Authentication, database, and storage
                <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer"
                   className="text-primary-600 hover:underline ml-1">(Privacy Policy)</a>
              </li>
              <li>
                <strong>Anthropic (Claude AI):</strong> AI-powered content generation
                <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer"
                   className="text-primary-600 hover:underline ml-1">(Privacy Policy)</a>
              </li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <p className="text-blue-800 text-sm">
                <strong>AI Processing Notice:</strong> When using AI features, the content you input is sent to our
                secure proxy server and then to Anthropic&apos;s API. Anthropic does not use your inputs to train their models.
                See our <Link to="/ai-policy" className="underline">AI Usage Policy</Link> for more details.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Cookies & Local Storage</h2>
            <p className="text-charcoal-600 mb-4">We use essential cookies and local storage for:</p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>Keeping you logged in (authentication tokens)</li>
              <li>Remembering your preferences (theme, view settings)</li>
              <li>Storing temporary work in progress</li>
            </ul>
            <p className="text-charcoal-600 mt-4">
              We do not use tracking cookies, advertising cookies, or share cookie data with third parties.
            </p>
          </section>

          {/* Updates */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Changes to This Policy</h2>
            <p className="text-charcoal-600">
              We may update this Privacy Policy from time to time. We will notify you of significant changes by
              email or through a notice on the Service. Your continued use of the Service after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          {/* Related Policies */}
          <section className="card p-8 bg-charcoal-50">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Related Policies</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/terms"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-primary-300 transition-colors"
              >
                <FileText className="w-4 h-4 text-primary-500" />
                <span className="text-charcoal-700">Terms of Service</span>
              </Link>
              <Link
                to="/ai-policy"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-primary-300 transition-colors"
              >
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-charcoal-700">AI Usage Policy</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
