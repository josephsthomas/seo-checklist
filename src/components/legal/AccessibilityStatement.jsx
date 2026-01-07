import { Link } from 'react-router-dom';
import { ArrowLeft, Accessibility, Eye, Keyboard, Monitor, MessageSquare, CheckCircle } from 'lucide-react';

export default function AccessibilityStatement() {
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
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Accessibility className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-charcoal-900">Accessibility Statement</h1>
              <p className="text-charcoal-500">Last updated: {currentDate}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-charcoal max-w-none">
          {/* Commitment Section */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-500" />
              Our Commitment to Accessibility
            </h2>
            <p className="text-charcoal-600 mb-4">
              <strong>Joseph S. Thomas dba Content-Strategy.co</strong> is committed to ensuring digital accessibility
              for people with disabilities. We are continually improving the user experience for everyone
              and applying the relevant accessibility standards.
            </p>
            <p className="text-charcoal-600">
              We believe that the web should be accessible to all users, regardless of their abilities or the
              technologies they use to access it. Our goal is to make the Content Strategy Portal as accessible
              and usable as possible for everyone.
            </p>
          </section>

          {/* Conformance Status */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Conformance Status</h2>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-purple-800 text-sm font-medium mb-2">Current Status:</p>
              <p className="text-purple-700 text-sm">
                We strive to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1</strong> at
                Level AA. These guidelines explain how to make web content more accessible for people with disabilities.
              </p>
            </div>
            <p className="text-charcoal-600 mb-4">
              Conformance with these guidelines helps make the web more user-friendly for all people, including:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>People who are blind or have low vision</li>
              <li>People who are deaf or hard of hearing</li>
              <li>People with mobility impairments</li>
              <li>People with cognitive or learning disabilities</li>
              <li>People with speech disabilities</li>
              <li>People with photosensitive conditions</li>
            </ul>
          </section>

          {/* Accessibility Features */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Accessibility Features</h2>
            <p className="text-charcoal-600 mb-4">
              We have implemented the following accessibility features:
            </p>

            <div className="space-y-4">
              {/* Keyboard Navigation */}
              <div className="flex items-start gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Keyboard className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-charcoal-900 mb-1">Keyboard Navigation</h3>
                  <p className="text-charcoal-600 text-sm">
                    All interactive elements can be accessed using keyboard navigation. Press Tab to move
                    between elements, Enter to activate buttons/links, and Escape to close modals.
                  </p>
                </div>
              </div>

              {/* Screen Reader Support */}
              <div className="flex items-start gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Eye className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-charcoal-900 mb-1">Screen Reader Support</h3>
                  <p className="text-charcoal-600 text-sm">
                    We use semantic HTML, ARIA labels, and proper heading structure to ensure compatibility
                    with screen readers like NVDA, JAWS, and VoiceOver.
                  </p>
                </div>
              </div>

              {/* Visual Design */}
              <div className="flex items-start gap-4 p-4 bg-charcoal-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-charcoal-900 mb-1">Visual Design</h3>
                  <p className="text-charcoal-600 text-sm">
                    We maintain sufficient color contrast ratios, use readable font sizes, and avoid relying
                    solely on color to convey information. The interface is responsive and works on various
                    screen sizes.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Specifications */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Technical Specifications</h2>
            <p className="text-charcoal-600 mb-4">
              The Content Strategy Portal relies on the following technologies to work with the particular
              combination of web browser and any assistive technologies or plugins installed on your computer:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2 mb-4">
              <li>HTML5</li>
              <li>CSS3</li>
              <li>JavaScript (ES6+)</li>
              <li>WAI-ARIA (Web Accessibility Initiative - Accessible Rich Internet Applications)</li>
            </ul>
            <p className="text-charcoal-600">
              These technologies are relied upon for conformance with the accessibility standards used.
            </p>
          </section>

          {/* Known Limitations */}
          <section className="card p-8 mb-6 bg-amber-50 border-amber-200">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Known Limitations</h2>
            <p className="text-charcoal-600 mb-4">
              Despite our best efforts, some content may not be fully accessible. The following is a
              description of known limitations:
            </p>
            <div className="bg-white border border-amber-300 rounded-lg p-4 mb-4">
              <ul className="text-charcoal-600 space-y-2 text-sm">
                <li>
                  <strong>AI-Generated Content:</strong> Content generated by AI features may not always meet
                  accessibility standards. Users are responsible for reviewing and ensuring accessibility of
                  any exported content.
                </li>
                <li>
                  <strong>Third-Party Content:</strong> Some third-party components or embedded content may
                  have their own accessibility limitations.
                </li>
                <li>
                  <strong>PDF Exports:</strong> Exported PDF documents may have limited accessibility features.
                  We recommend using HTML or text exports when accessibility is a priority.
                </li>
              </ul>
            </div>
            <p className="text-charcoal-600 text-sm">
              We are actively working to identify and address these limitations. If you encounter any
              accessibility barriers, please contact us.
            </p>
          </section>

          {/* Feedback */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              Feedback
            </h2>
            <p className="text-charcoal-600 mb-4">
              We welcome your feedback on the accessibility of the Content Strategy Portal. Please let us
              know if you encounter accessibility barriers by using the feedback widget available on every page.
            </p>
            <p className="text-charcoal-600 mb-4">
              When providing feedback, please include:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>The web address (URL) of the content</li>
              <li>A description of the problem you encountered</li>
              <li>The browser and operating system you are using</li>
              <li>Any assistive technology you are using (e.g., screen reader)</li>
            </ul>
            <p className="text-charcoal-600 mt-4">
              We try to respond to accessibility feedback within 5 business days.
            </p>
          </section>

          {/* Enforcement */}
          <section className="card p-8 mb-6">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Enforcement Procedure</h2>
            <p className="text-charcoal-600 mb-4">
              If you are not satisfied with our response to your accessibility concern, you may be entitled
              to file a complaint with relevant authorities depending on your jurisdiction:
            </p>
            <ul className="list-disc list-inside text-charcoal-600 space-y-2">
              <li>
                <strong>United States:</strong> File a complaint with the U.S. Department of Justice Civil
                Rights Division or the Office for Civil Rights (OCR)
              </li>
              <li>
                <strong>European Union:</strong> Contact your national enforcement body for web accessibility
              </li>
              <li>
                <strong>United Kingdom:</strong> Contact the Equality and Human Rights Commission (EHRC)
              </li>
            </ul>
          </section>

          {/* Related Policies */}
          <section className="card p-8 bg-charcoal-50">
            <h2 className="text-xl font-semibold text-charcoal-900 mb-4">Related Policies</h2>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/terms"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-purple-300 transition-colors"
              >
                <span className="text-charcoal-700">Terms of Service</span>
              </Link>
              <Link
                to="/privacy"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-purple-300 transition-colors"
              >
                <span className="text-charcoal-700">Privacy & Data Policy</span>
              </Link>
              <Link
                to="/ai-policy"
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-charcoal-200 hover:border-purple-300 transition-colors"
              >
                <span className="text-charcoal-700">AI Usage Policy</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
