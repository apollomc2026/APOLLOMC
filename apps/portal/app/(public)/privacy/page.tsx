import Link from 'next/link'
import { Rocket } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <Rocket className="w-6 h-6 text-red-500" />
          <span className="font-bold text-lg">Apollo MC</span>
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: March 21, 2026</p>

        <div className="prose prose-invert prose-gray max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              On Spot Solutions LLC (&quot;Company,&quot; &quot;we,&quot; &quot;us&quot;), operator of Apollo MC
              (&quot;the Service&quot;), is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, store, and share your information when you use our
              AI-powered document generation platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-medium text-gray-200 mb-2">Account Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email address (used for authentication and communications)</li>
              <li>Full name and company name (provided during signup)</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mb-2 mt-4">Mission Data</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Industry, deliverable type, and style selections</li>
              <li>Intake form responses (information you provide about your project)</li>
              <li>Uploaded files (reference documents, brand guides, financial data)</li>
              <li>Generated documents and associated metadata</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mb-2 mt-4">Payment Information</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Payment transactions are processed by Stripe. We do not store credit card numbers,
                CVVs, or full card details on our servers. We retain only a Stripe customer ID and
                transaction references.</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mb-2 mt-4">Automatically Collected</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Browser type, IP address, and device information</li>
              <li>Usage data including pages visited, features used, and session duration</li>
              <li>Cookies necessary for authentication and session management</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To authenticate your identity and manage your account</li>
              <li>To process your document generation requests (missions)</li>
              <li>To extract content from uploaded files for document assembly</li>
              <li>To send transactional emails (mission status updates, delivery notifications)</li>
              <li>To process payments via Stripe</li>
              <li>To embed buyer identification watermarks in delivered files</li>
              <li>To improve the quality and accuracy of our AI-generated documents</li>
              <li>To detect and prevent fraud or misuse of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Storage and Infrastructure</h2>
            <p>Your data is stored using the following services:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Supabase</strong> — Account data, mission records, intake data, and task metadata
                are stored in a PostgreSQL database hosted by Supabase with row-level security enabled.</li>
              <li><strong>Amazon Web Services (AWS) S3</strong> — Uploaded files, generated documents,
                preview images, and build checkpoints are stored in private S3 buckets in the US East
                (N. Virginia) region. All public access is blocked.</li>
              <li><strong>Amazon Web Services (AWS) SES</strong> — Transactional emails are sent via
                Amazon Simple Email Service from missions@apollomc.ai.</li>
              <li><strong>Vercel</strong> — The web application is hosted on Vercel. No persistent
                customer data is stored on Vercel infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party AI Processing</h2>
            <p>
              Document content is generated using the Anthropic Claude API. Your intake data and
              uploaded file content are sent to the Claude API for processing. Anthropic&apos;s data
              handling practices are governed by their own privacy policy and terms of service.
              We do not use your data to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Stripe Payment Processing</h2>
            <p>
              Payment processing is handled entirely by Stripe, Inc. When you make a payment, your
              card information is transmitted directly to Stripe and is never stored on our servers.
              Stripe&apos;s privacy policy governs their handling of your payment data. For more
              information, visit{' '}
              <span className="text-red-400">stripe.com/privacy</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Data Sharing</h2>
            <p>We do not sell, rent, or trade your personal information. We share data only with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Service providers</strong> — Supabase, AWS, Vercel, Stripe, and Anthropic,
                solely for operating the Service</li>
              <li><strong>Legal compliance</strong> — When required by law, subpoena, or court order</li>
              <li><strong>Business transfer</strong> — In the event of a merger, acquisition, or sale
                of assets, your data may be transferred to the successor entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Data Retention</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account data is retained for as long as your account is active</li>
              <li>Completed mission files are available for re-download while your account is active</li>
              <li>Build staging files are automatically deleted after 3 days</li>
              <li>Preview images are automatically deleted after 7 days</li>
              <li>Archived missions are retained for 1 year before permanent deletion</li>
              <li>Payment records are retained as required by applicable financial regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Cookies</h2>
            <p>
              We use only essential cookies required for authentication and session management.
              We do not use advertising cookies, tracking pixels, or third-party analytics cookies.
              Our authentication cookies are httpOnly, secure, and scoped to the apollomc.ai domain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Your Rights</h2>
            <h3 className="text-lg font-medium text-gray-200 mb-2">All Users</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access your personal data by logging into your account</li>
              <li>Request correction of inaccurate personal data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent for data processing at any time</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mb-2 mt-4">California Residents (CCPA)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Right to know what personal information is collected and how it is used</li>
              <li>Right to request deletion of personal information</li>
              <li>Right to opt out of the sale of personal information (we do not sell your data)</li>
              <li>Right to non-discrimination for exercising your CCPA rights</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-200 mb-2 mt-4">EU/EEA Residents (GDPR)</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Right of access to your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure (&quot;right to be forgotten&quot;)</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@apollomc.ai" className="text-red-400 hover:text-red-300">
                support@apollomc.ai
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission
              (TLS), row-level security on all database tables, private S3 buckets with all public
              access blocked, and single-use time-limited delivery tokens for file downloads. However,
              no method of transmission over the Internet is 100% secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Children&apos;s Privacy</h2>
            <p>
              The Service is not intended for individuals under the age of 18. We do not knowingly
              collect personal information from children. If we learn that we have collected data from
              a child under 18, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Material changes will be communicated
              via email to your registered account address. The &quot;Last updated&quot; date at the top of this
              page indicates when the policy was most recently revised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Contact</h2>
            <p>
              For privacy-related questions or to exercise your data rights, contact us at:
            </p>
            <div className="mt-2">
              <p>On Spot Solutions LLC</p>
              <p>Boston, Massachusetts</p>
              <p>
                <a href="mailto:support@apollomc.ai" className="text-red-400 hover:text-red-300">
                  support@apollomc.ai
                </a>
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-600 text-sm">
          <p>On Spot Solutions LLC — Boston, Massachusetts</p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <Link href="/terms" className="text-gray-500 hover:text-gray-300">Terms of Service</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
