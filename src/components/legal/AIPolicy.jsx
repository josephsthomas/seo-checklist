import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, AlertTriangle, CheckCircle, XCircle, Info, Shield, FileText } from 'lucide-react';
import SEOHead from '../shared/SEOHead';

export default function AIPolicy() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-charcoal-50 to-white py-12 px-4">
      <SEOHead
        title="AI Usage Policy | Content Strategy Portal"
        description="AI usage policy for Content Strategy Portal. Understand how AI features work and your responsibilities."
        canonical="/ai-policy"
        noindex={true}
      />
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
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">AI Usage Policy</h1>
              <p className="text-charcoal-500">Last updated: {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Critical Warning */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-800 mb-2">Important: AI Limitations & Your Responsibility</h2>
              <p className="text-red-700 mb-3">
                <strong>AI-generated content is not guaranteed to be accurate.</strong> AI systems, including the ones
                used in this Service, can produce incorrect, misleading, or inappropriate outputs (commonly called
                &quot;hallucinations&quot;). This is an inherent limitation of current AI technology.
              </p>
              <p className="text-red-700 font-medium">
                YOU are solely responsible for reviewing, verifying, and approving all AI-generated content before
                using it in any capacity.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-charcoal max-w-none">
          {/* Introduction */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">About Our AI Features</h2>
            <p className="text-charcoal-600 mb-4">
              Content Strategy Portal uses artificial intelligence powered by Anthropic&apos;s Claude to provide
              content suggestions and automation features. This policy explains how these AI features work and
              your responsibilities when using them.
            </p>
            <div className="bg-charcoal-100 rounded-lg p-4">
              <p className="text-charcoal-700 text-sm">
                <strong>AI Provider:</strong> Anthropic (Claude AI)<br />
                <strong>Purpose:</strong> Content generation assistance for SEO and accessibility<br />
                <strong>Status:</strong> All AI features are clearly labeled with disclaimers
              </p>
            </div>
          </section>

          {/* AI-Powered Features */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary-500" />
              AI-Powered Features
            </h2>
            <p className="text-charcoal-600 mb-4">The following features use AI to generate suggestions:</p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Meta Data Generator</h3>
                  <p className="text-charcoal-600 text-sm mt-1">
                    Generates suggested meta titles, descriptions, Open Graph tags, and Twitter Card metadata
                    based on your content.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-lg">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Image Alt Text Generator</h3>
                  <p className="text-charcoal-600 text-sm mt-1">
                    Suggests descriptive alt text for images to improve accessibility and SEO.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-lg">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900">Structured Data Generator</h3>
                  <p className="text-charcoal-600 text-sm mt-1">
                    Creates JSON-LD schema markup suggestions for various content types (articles, products,
                    FAQs, etc.).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* What AI Can and Cannot Do */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Understanding AI Capabilities</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* What AI Can Do */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  What AI Can Do Well
                </h3>
                <ul className="space-y-2 text-emerald-700 text-sm">
                  <li>Generate initial drafts and suggestions</li>
                  <li>Follow formatting and length guidelines</li>
                  <li>Provide multiple options to choose from</li>
                  <li>Apply SEO best practices patterns</li>
                  <li>Save time on repetitive tasks</li>
                  <li>Offer creative starting points</li>
                </ul>
              </div>

              {/* What AI Cannot Do */}
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <h3 className="flex items-center gap-2 font-semibold text-red-800 mb-3">
                  <XCircle className="w-5 h-5" />
                  What AI Cannot Guarantee
                </h3>
                <ul className="space-y-2 text-red-700 text-sm">
                  <li>100% factual accuracy</li>
                  <li>Brand voice consistency</li>
                  <li>Legal or regulatory compliance</li>
                  <li>Industry-specific accuracy</li>
                  <li>Current/real-time information</li>
                  <li>Replacement for human judgment</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Known AI Limitations */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Known AI Limitations & Risks
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-charcoal-50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-semibold text-charcoal-900">Hallucinations</h3>
                <p className="text-charcoal-600 text-sm mt-1">
                  AI may generate content that sounds plausible but is factually incorrect. This includes
                  made-up statistics, incorrect dates, non-existent sources, or wrong attributions.
                </p>
              </div>

              <div className="p-4 bg-charcoal-50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-semibold text-charcoal-900">Outdated Information</h3>
                <p className="text-charcoal-600 text-sm mt-1">
                  AI models have knowledge cutoff dates and may not reflect recent events, updates,
                  or changes in best practices.
                </p>
              </div>

              <div className="p-4 bg-charcoal-50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-semibold text-charcoal-900">Context Misunderstanding</h3>
                <p className="text-charcoal-600 text-sm mt-1">
                  AI may misinterpret the context, tone, or purpose of your content, leading to
                  inappropriate or off-brand suggestions.
                </p>
              </div>

              <div className="p-4 bg-charcoal-50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-semibold text-charcoal-900">Bias & Assumptions</h3>
                <p className="text-charcoal-600 text-sm mt-1">
                  AI may reflect biases present in its training data or make assumptions that don&apos;t
                  apply to your specific situation.
                </p>
              </div>

              <div className="p-4 bg-charcoal-50 rounded-lg border-l-4 border-amber-500">
                <h3 className="font-semibold text-charcoal-900">Legal & Compliance Risks</h3>
                <p className="text-charcoal-600 text-sm mt-1">
                  AI is not a legal expert and cannot ensure compliance with advertising regulations,
                  accessibility laws, industry standards, or jurisdiction-specific requirements.
                </p>
              </div>
            </div>
          </section>

          {/* Your Responsibilities */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary-500" />
              Your Responsibilities
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800 text-sm font-medium">
                By using any AI-powered feature, you agree to the following responsibilities:
              </p>
            </div>

            <ol className="list-decimal list-inside space-y-3 text-charcoal-600">
              <li>
                <strong>Review All Output:</strong> Carefully review every piece of AI-generated content before
                using it. Never publish or implement AI suggestions without human verification.
              </li>
              <li>
                <strong>Verify Accuracy:</strong> Fact-check all claims, statistics, dates, and references in
                AI-generated content. Do not assume AI output is accurate.
              </li>
              <li>
                <strong>Check for Appropriateness:</strong> Ensure AI suggestions are appropriate for your
                brand, audience, and context.
              </li>
              <li>
                <strong>Ensure Compliance:</strong> Verify that AI-generated content complies with all applicable
                laws, regulations, and industry standards in your jurisdiction.
              </li>
              <li>
                <strong>Edit and Customize:</strong> Treat AI output as a starting point that requires your
                expertise, editing, and customization.
              </li>
              <li>
                <strong>Accept Responsibility:</strong> Accept full responsibility for any content you choose
                to use, regardless of whether it was AI-generated.
              </li>
            </ol>
          </section>

          {/* Export Requirements */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Exporting AI-Generated Content</h2>
            <p className="text-charcoal-600 mb-4">
              When you export or copy AI-generated content from our tools, you will be asked to confirm that:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>You have reviewed the AI-generated content</li>
              <li>You understand that AI may contain errors or inaccuracies</li>
              <li>You will verify and edit the content before use</li>
              <li>You accept responsibility for the content once exported</li>
            </ul>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm">
                <strong>This confirmation is required</strong> because once content leaves our platform,
                we have no control over how it is used or whether it is properly reviewed.
              </p>
            </div>
          </section>

          {/* Data & Privacy */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-500" />
              AI Data & Privacy
            </h2>

            <h3 className="text-lg font-medium text-charcoal-800 mb-2">What Happens to Your Data</h3>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>Content you input is sent to our secure proxy server, then to Anthropic&apos;s API</li>
              <li>We do not store the content you send to AI tools (session-only)</li>
              <li>Anthropic does not use your inputs to train their models (per their policy)</li>
              <li>AI-generated outputs are not stored unless you explicitly save them</li>
            </ul>

            <h3 className="text-lg font-medium text-charcoal-800 mb-2 mt-4">Sensitive Information Warning</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">
                <strong>Do not input sensitive, confidential, or personally identifiable information (PII)</strong> into
                AI tools. This includes: customer data, financial information, trade secrets, passwords, health
                information, or any data subject to regulatory protection (HIPAA, GDPR, etc.).
              </p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="card p-8 mb-6 bg-charcoal-100">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Disclaimer of Warranties</h2>
            <div className="text-charcoal-700 text-sm space-y-3">
              <p>
                AI FEATURES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
                OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT.
              </p>
              <p>
                JOSEPH S. THOMAS DBA CONTENT-STRATEGY.CO MAKES NO WARRANTY THAT AI-GENERATED CONTENT WILL BE
                ACCURATE, RELIABLE, COMPLETE, OR ERROR-FREE. WE DO NOT WARRANT THAT AI FEATURES WILL MEET YOUR
                REQUIREMENTS OR THAT THE RESULTS WILL BE SATISFACTORY.
              </p>
              <p>
                YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT USE OF AI FEATURES IS AT YOUR SOLE RISK AND THAT YOU
                ARE SOLELY RESPONSIBLE FOR ANY CONSEQUENCES ARISING FROM YOUR USE OF AI-GENERATED CONTENT.
              </p>
            </div>
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
                to="/privacy"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-primary-300 transition-colors"
              >
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-charcoal-700">Privacy & Data Policy</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
