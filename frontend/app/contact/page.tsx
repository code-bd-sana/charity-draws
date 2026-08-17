import React from "react";
import type { Metadata } from "next";
import WebsiteNavbar from "../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../components/website/layout/WebsiteFooter";
import ContactHero from "../../components/website/contact/ContactHero";
import ContactForm from "../../components/website/contact/ContactForm";
import ContactInfoCards from "../../components/website/contact/ContactInfoCards";

export const metadata: Metadata = {
  title: "Contact Us | Charity Draws",
  description:
    "Have questions about draw competitions, hosting fees, or verification? Send us a message and our support crew will reach out within 24 hours.",
};

/**
 * Public 'Contact' page route at `/contact`.
 * Composes layout for header navbar, Hero subheadings, two-column form & support contact grids, and footer.
 */
export default function ContactPage() {
  return (
    <>
      {/* Sticky top navbar */}
      <WebsiteNavbar />

      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden">
        {/* Background Glows & Grid Pattern matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-100 pointer-events-none" />

        <div className="relative z-10 flex flex-col flex-grow">
          {/* Page Hero subheaders */}
          <ContactHero />

          {/* Form and Support Info section */}
          <section className="w-full bg-transparent py-12 md:py-16">
            <div className="container-custom max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12">
                
                {/* Left Column: Contact Form */}
                <div className="lg:col-span-7">
                  <ContactForm />
                </div>

                {/* Right Column: Support Info cards */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <ContactInfoCards />
                </div>

              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Global website footer */}
      <WebsiteFooter />
    </>
  );
}
