import { Bot, AlertTriangle, CheckCircle, XCircle, Info, Shield } from 'lucide-react';

export default function AIPolicyContent() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <p className="text-sm text-charcoal-500">Last updated: {currentDate}</p>

      {/* Critical Warning */}
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-800 mb-2">Important: AI Limitations & Your Responsibility</h2>
            <p className="text-red-700 text-sm mb-2">
              <strong>AI-generated content is not guaranteed to be accurate.</strong> AI systems, including the ones
              used in this Service, can produce incorrect, misleading, or inappropriate outputs (commonly called
              "hallucinations"). This is an inherent limitation of current AI technology.
            </p>
            <p className="text-red-700 text-sm font-medium">
              YOU are solely responsible for reviewing, verifying, and approving all AI-generated content before
              using it in any capacity.
            </p>
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">About Our AI Features</h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          Content Strategy Portal uses artificial intelligence powered by Anthropic's Claude to provide
          content suggestions and automation features. This policy explains how these AI features work and
          your responsibilities when using them.
        </p>
        <div className="bg-charcoal-100 rounded-lg p-3">
          <p className="text-charcoal-700 text-sm">
            <strong>AI Provider:</strong> Anthropic (Claude AI)<br />
            <strong>Purpose:</strong> Content generation assistance for SEO and accessibility<br />
            <strong>Status:</strong> All AI features are clearly labeled with disclaimers
          </p>
        </div>
      </section>

      {/* AI-Powered Features */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Bot className="w-5 h-5 text-primary-500" />
          AI-Powered Features
        </h2>
        <p className="text-charcoal-600 mb-3 text-sm">The following features use AI to generate suggestions:</p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">1</span>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 text-sm">Meta Data Generator</h3>
              <p className="text-charcoal-600 text-xs mt-1">
                Generates suggested meta titles, descriptions, Open Graph tags, and Twitter Card metadata
                based on your content.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">2</span>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 text-sm">Image Alt Text Generator</h3>
              <p className="text-charcoal-600 text-xs mt-1">
                Suggests descriptive alt text for images to improve accessibility and SEO.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg">
            <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold">3</span>
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 text-sm">Structured Data Generator</h3>
              <p className="text-charcoal-600 text-xs mt-1">
                Creates JSON-LD schema markup suggestions for various content types (articles, products,
                FAQs, etc.).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What AI Can and Cannot Do */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Understanding AI Capabilities</h2>

        <div className="grid md:grid-cols-2 gap-4">
          {/* What AI Can Do */}
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <h3 className="flex items-center gap-2 font-semibold text-emerald-800 mb-2 text-sm">
              <CheckCircle className="w-4 h-4" />
              What AI Can Do Well
            </h3>
            <ul className="space-y-1 text-emerald-700 text-xs">
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
            <h3 className="flex items-center gap-2 font-semibold text-red-800 mb-2 text-sm">
              <XCircle className="w-4 h-4" />
              What AI Cannot Guarantee
            </h3>
            <ul className="space-y-1 text-red-700 text-xs">
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
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Known AI Limitations & Risks
        </h2>

        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-500">
            <h3 className="font-semibold text-charcoal-900 text-sm">Hallucinations</h3>
            <p className="text-charcoal-600 text-xs mt-1">
              AI may generate content that sounds plausible but is factually incorrect. This includes
              made-up statistics, incorrect dates, non-existent sources, or wrong attributions.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-500">
            <h3 className="font-semibold text-charcoal-900 text-sm">Outdated Information</h3>
            <p className="text-charcoal-600 text-xs mt-1">
              AI models have knowledge cutoff dates and may not reflect recent events, updates,
              or changes in best practices.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-500">
            <h3 className="font-semibold text-charcoal-900 text-sm">Context Misunderstanding</h3>
            <p className="text-charcoal-600 text-xs mt-1">
              AI may misinterpret the context, tone, or purpose of your content, leading to
              inappropriate or off-brand suggestions.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-500">
            <h3 className="font-semibold text-charcoal-900 text-sm">Bias & Assumptions</h3>
            <p className="text-charcoal-600 text-xs mt-1">
              AI may reflect biases present in its training data or make assumptions that don't
              apply to your specific situation.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border-l-4 border-amber-500">
            <h3 className="font-semibold text-charcoal-900 text-sm">Legal & Compliance Risks</h3>
            <p className="text-charcoal-600 text-xs mt-1">
              AI is not a legal expert and cannot ensure compliance with advertising regulations,
              accessibility laws, industry standards, or jurisdiction-specific requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Your Responsibilities */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary-500" />
          Your Responsibilities
        </h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-blue-800 text-sm font-medium">
            By using any AI-powered feature, you agree to the following responsibilities:
          </p>
        </div>

        <ol className="list-decimal list-inside space-y-2 text-charcoal-600 text-sm">
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
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Exporting AI-Generated Content</h2>
        <p className="text-charcoal-600 mb-3 text-sm">
          When you export or copy AI-generated content from our tools, you will be asked to confirm that:
        </p>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>You have reviewed the AI-generated content</li>
          <li>You understand that AI may contain errors or inaccuracies</li>
          <li>You will verify and edit the content before use</li>
          <li>You accept responsibility for the content once exported</li>
        </ul>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-amber-800 text-sm">
            <strong>This confirmation is required</strong> because once content leaves our platform,
            we have no control over how it is used or whether it is properly reviewed.
          </p>
        </div>
      </section>

      {/* Data & Privacy */}
      <section className="bg-charcoal-50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary-500" />
          AI Data & Privacy
        </h2>

        <h3 className="text-base font-medium text-charcoal-800 mb-2">What Happens to Your Data</h3>
        <ul className="list-disc list-inside text-charcoal-600 space-y-1 text-sm mb-3">
          <li>Content you input is sent to our secure proxy server, then to Anthropic's API</li>
          <li>We do not store the content you send to AI tools (session-only)</li>
          <li>Anthropic does not use your inputs to train their models (per their policy)</li>
          <li>AI-generated outputs are not stored unless you explicitly save them</li>
        </ul>

        <h3 className="text-base font-medium text-charcoal-800 mb-2 mt-4">Sensitive Information Warning</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">
            <strong>Do not input sensitive, confidential, or personally identifiable information (PII)</strong> into
            AI tools. This includes: customer data, financial information, trade secrets, passwords, health
            information, or any data subject to regulatory protection (HIPAA, GDPR, etc.).
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-charcoal-100 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-charcoal-900 mb-3">Disclaimer of Warranties</h2>
        <div className="text-charcoal-700 text-xs space-y-2">
          <p>
            AI FEATURES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS
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

      {/* End marker for scroll detection */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <Bot className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-green-700 font-medium">End of AI Usage Policy</p>
        <p className="text-green-600 text-sm mt-1">
          By clicking "I Accept", you acknowledge your responsibilities when using AI features.
        </p>
      </div>
    </div>
  );
}
