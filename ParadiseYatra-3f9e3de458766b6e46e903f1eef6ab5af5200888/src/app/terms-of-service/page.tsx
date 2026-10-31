import { LazyFooter, LazyHeader } from "@/components/lazy-components";
import { buildStaticMetadata } from "@/lib/seo";


export const metadata = buildStaticMetadata("/terms-of-service");

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background w-full">
      <LazyHeader />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 pt-28 lg:pt-32 pb-8 lg:pb-10">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <h2 className="text-xl md:text-5xl font-bold text-gray-900">
            Terms of Service
          </h2>
          <p className="mt-4 text-gray-700 max-w-3xl">
            These Terms of Service ("Terms") govern your use of Paradise Yatra's
            website, services, and products. By using our services, you agree to
            these terms.
          </p>
          <p className="mt-2 text-gray-600">
            Effective Date: 01 September 2025 • Last Updated: 01 September 2025
          </p>
        </div>
      </section>

      {/* Table of contents */}
      <section className="bg-white">
        <div className="container mx-auto px-4 py-8 !pb-5">
          <h2 className="text-xl font-semibold text-gray-900 pt-5">Contents</h2>
          <ul className="mt-4 grid md:grid-cols-2 gap-2 text-blue-700">
            <li>
              <a href="#acceptance" className="hover:underline">
                Acceptance of Terms
              </a>
            </li>
            <li>
              <a href="#services" className="hover:underline">
                Our Services
              </a>
            </li>
            <li>
              <a href="#booking" className="hover:underline">
                Booking and Payment
              </a>
            </li>
            <li>
              <a href="#cancellation" className="hover:underline">
                Cancellation and Refunds
              </a>
            </li>
            <li>
              <a href="#responsibilities" className="hover:underline">
                User Responsibilities
              </a>
            </li>
            <li>
              <a href="#liability" className="hover:underline">
                Limitation of Liability
              </a>
            </li>
            <li>
              <a href="#intellectual" className="hover:underline">
                Intellectual Property
              </a>
            </li>
            <li>
              <a href="#prohibited" className="hover:underline">
                Prohibited Activities
              </a>
            </li>
            <li>
              <a href="#termination" className="hover:underline">
                Termination
              </a>
            </li>
            <li>
              <a href="#governing" className="hover:underline">
                Governing Law
              </a>
            </li>
            <li>
              <a href="#changes" className="hover:underline">
                Changes to Terms
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:underline">
                Contact Information
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-white">
        <div className="container mx-auto px-4 py-10 space-y-10 text-gray-800">
          <section
            id="acceptance"
            aria-labelledby="acceptance-heading"
            className="space-y-3"
          >
            <h2 id="acceptance-heading" className="text-[24px] md:text-[36px] font-bold">
              Acceptance of Terms
            </h2>
            <p>
              By accessing and using Paradise Yatra's website and services, you
              accept and agree to be bound by these Terms of Service. If you do
              not agree to these terms, please do not use our services.
            </p>
          </section>

          <section
            id="services"
            aria-labelledby="services-heading"
            className="space-y-3"
          >
            <h2 id="services-heading" className="text-[24px] md:text-[36px] font-bold">
              Our Services
            </h2>
            <p>
              Paradise Yatra provides travel and tourism services including but
              not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Travel package bookings and arrangements</li>
              <li>Hotel and accommodation reservations</li>
              <li>Transportation arrangements</li>
              <li>Tour guide services</li>
              <li>Travel consultation and planning</li>
              <li>Adventure and trekking activities</li>
            </ul>
          </section>

          <section
            id="booking"
            aria-labelledby="booking-heading"
            className="space-y-3"
          >
            <h2 id="booking-heading" className="text-[24px] md:text-[36px] font-bold">
              Booking and Payment
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                All bookings are subject to availability and confirmation from
                our side.
              </li>
              <li>
                Payment terms and schedules will be communicated at the time of
                booking.
              </li>
              <li>
                We accept various payment methods as specified during the
                booking process.
              </li>
              <li>
                Full payment may be required before the commencement of
                services.
              </li>
              <li>
                Additional charges may apply for special requests or changes to
                bookings.
              </li>
            </ul>
          </section>

          <section
            id="cancellation"
            aria-labelledby="cancellation-heading"
            className="space-y-3"
          >
            <h2 id="cancellation-heading" className="text-[24px] md:text-[36px] font-bold">
              Cancellation and Refunds
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Cancellation policies vary by service type and will be
                communicated at booking.
              </li>
              <li>
                Refunds are subject to our cancellation policy and third-party
                vendor policies.
              </li>
              <li>
                Force majeure events may affect cancellation and refund
                policies.
              </li>
              <li>
                Processing time for refunds may take 7-14 business days after
                approval.
              </li>
              <li>
                Cancellation fees may apply based on timing and service type.
              </li>
            </ul>
          </section>

          <section
            id="responsibilities"
            aria-labelledby="responsibilities-heading"
            className="space-y-3"
          >
            <h2 id="responsibilities-heading" className="text-[24px] md:text-[36px] font-bold">
              User Responsibilities
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information for bookings.</li>
              <li>Ensure all travel documents are valid and up-to-date.</li>
              <li>Follow all safety guidelines and instructions provided.</li>
              <li>
                Respect local laws, customs, and environmental regulations.
              </li>
              <li>Maintain appropriate travel insurance coverage.</li>
              <li>
                Inform us of any medical conditions or special requirements.
              </li>
            </ul>
          </section>

          <section
            id="liability"
            aria-labelledby="liability-heading"
            className="space-y-3"
          >
            <h2 id="liability-heading" className="text-[24px] md:text-[36px] font-bold">
              Limitation of Liability
            </h2>
            <p>
              Paradise Yatra acts as an intermediary between customers and
              service providers. While we strive to ensure quality services, we
              are not liable for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Acts of third-party service providers</li>
              <li>Natural disasters or force majeure events</li>
              <li>Personal injury or loss due to negligence of customers</li>
              <li>Loss or damage to personal belongings</li>
              <li>Changes in weather or travel conditions</li>
            </ul>
          </section>

          <section
            id="intellectual"
            aria-labelledby="intellectual-heading"
            className="space-y-3"
          >
            <h2 id="intellectual-heading" className="text-[24px] md:text-[36px] font-bold">
              Intellectual Property
            </h2>
            <p>
              All content on our website, including text, images, logos, and
              designs, is the property of Paradise Yatra and is protected by
              intellectual property laws. Unauthorized use is prohibited.
            </p>
          </section>

          <section
            id="prohibited"
            aria-labelledby="prohibited-heading"
            className="space-y-3"
          >
            <h2 id="prohibited-heading" className="text-[24px] md:text-[36px] font-bold">
              Prohibited Activities
            </h2>
            <p>Users are prohibited from:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Using our services for illegal activities</li>
              <li>Providing false or misleading information</li>
              <li>Disrupting or interfering with our services</li>
              <li>Violating the rights of other users or third parties</li>
              <li>Attempting to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section
            id="termination"
            aria-labelledby="termination-heading"
            className="space-y-3"
          >
            <h2 id="termination-heading" className="text-[24px] md:text-[36px] font-bold">
              Termination
            </h2>
            <p>
              We reserve the right to terminate or suspend access to our
              services at any time, with or without cause, and with or without
              notice, for conduct that we believe violates these Terms or is
              harmful to other users or third parties.
            </p>
          </section>

          <section
            id="governing"
            aria-labelledby="governing-heading"
            className="space-y-3"
          >
            <h2 id="governing-heading" className="text-[24px] md:text-[36px] font-bold">
              Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of India. Any disputes
              arising from these Terms or your use of our services will be
              subject to the jurisdiction of courts in Dehradun, Uttarakhand,
              India.
            </p>
          </section>

          <section
            id="changes"
            aria-labelledby="changes-heading"
            className="space-y-3"
          >
            <h2 id="changes-heading" className="text-[24px] md:text-[36px] font-bold">
              Changes to Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes will
              be notified by updating the effective date above and, where
              appropriate, through website notices or direct communication.
            </p>
          </section>

          <section
            id="contact"
            aria-labelledby="contact-heading"
            className="space-y-3 pb-10"
          >
            <h2 id="contact-heading" className="text-[24px] md:text-[36px] font-bold">
              Contact Information
            </h2>
            <p>
              For questions about these Terms of Service, please contact us at:
            </p>
            <address className="not-italic text-gray-700">
              <div className="font-semibold">Paradise Yatra</div>
              <div>Dehradun, Uttarakhand, India</div>
              <div>
                Phone:{" "}
                <a
                  className="text-blue-700 hover:underline"
                  href="tel:+918979396413"
                >
                  +91 8979396413
                </a>
              </div>
              <div>
                Email:{" "}
                <a
                  className="text-blue-700 hover:underline"
                  href="mailto:info@paradiseyatra.com"
                >
                  info@paradiseyatra.com
                </a>
              </div>
            </address>
          </section>
        </div>
      </section>

      <LazyFooter />
    </main>
  );
}

