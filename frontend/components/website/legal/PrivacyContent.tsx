"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "../../../lib/utils";

const SECTIONS = [
  { id: "introduction", title: "1. Introduction & Controller" },
  { id: "data-we-collect", title: "2. The Data We Collect" },
  { id: "prize-draws-data", title: "3. Prize Draws & Processing" },
  { id: "marketing-choices", title: "4. Marketing & Preferences" },
  { id: "cookies-analytics", title: "5. Cookies & Tracking" },
  { id: "disclosure", title: "6. Disclosure & Transfers" },
  { id: "security-retention", title: "7. Security & Retention" },
  { id: "your-legal-rights", title: "8. Your Legal Rights" },
  { id: "lawful-bases", title: "9. Lawful Bases for Processing" },
];

export default function PrivacyContent() {
  const [activeSection, setActiveSection] = useState("introduction");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-surface text-text-primary pt-24 pb-20">
      
      {/* Top Banner */}
      <div className="border-b border-divider bg-elevated/60 backdrop-blur-md py-12 mb-12">
        <div className="container-custom max-w-6xl mx-auto px-4">
          <div className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-badge bg-accent-bg border border-border text-text-brand text-xs font-semibold w-fit">
              <span>🔒 Data Protection & Compliance</span>
            </div>
            <h1 className="font-heading font-extrabold text-3xl sm:text-5xl text-text-primary tracking-tight">
              Privacy Policy
            </h1>
            <p className="font-sans text-sm sm:text-base text-text-muted max-w-2xl">
              Learn how Charity Draws collects, protects, processes, and respects your personal data under UK GDPR and data protection laws.
            </p>
            <div className="flex items-center gap-4 text-xs font-sans text-text-muted pt-2">
              <span>Last Updated: October 2026</span>
              <span>•</span>
              <span>Compliant with UK GDPR & DPA 2018</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sticky Toc + Content */}
      <div className="container-custom max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Table of Contents */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 bg-surface border border-border rounded-card p-5 space-y-2 shadow-card">
              <h3 className="font-heading font-bold text-xs text-text-brand uppercase tracking-wider mb-3 px-2">
                Table of Contents
              </h3>
              <nav className="flex flex-col space-y-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={cn(
                      "text-left px-3 py-2 rounded-xl text-xs font-sans transition-all duration-200 truncate cursor-pointer",
                      activeSection === sec.id
                        ? "bg-accent-bg text-text-brand font-semibold border-l-2 border-primary pl-3"
                        : "text-text-muted hover:bg-elevated hover:text-text-primary"
                    )}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
              
              <div className="pt-4 border-t border-divider mt-4">
                <Link
                  href="/contact"
                  className="w-full py-2.5 px-4 rounded-xl bg-accent-bg hover:bg-elevated border border-border text-text-brand text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  ✉️ Contact Data Privacy Manager
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Main Text Content */}
          <main className="lg:col-span-8 space-y-12 text-sm leading-relaxed text-text-secondary">
            
            {/* 1. Introduction & Controller */}
            <section id="introduction" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                1. Introduction & Data Controller
              </h2>
              <p>
                Welcome to the <strong className="text-text-primary">Charity Draws Ltd</strong> Privacy Policy.
              </p>
              <p>
                Charity Draws respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, process, and safeguard your personal data when you visit our website (regardless of where you access it from) and outlines your privacy rights under UK GDPR.
              </p>
              <div className="bg-elevated/70 border border-border rounded-xl p-5 space-y-2 mt-4">
                <h3 className="font-heading font-bold text-sm text-text-brand">Data Controller & Privacy Contact</h3>
                <p className="text-xs text-text-primary">
                  Legal Entity Name: <strong>Charity Draws Ltd</strong> (Company No. Pending Registration)
                </p>
                <p className="text-xs text-text-secondary">
                  Data Privacy Manager: <strong>Compliance Team</strong>
                </p>
                <p className="text-xs text-text-secondary">
                  Correspondence Address: Synergy House, Lawson Street, North Shields NE29 6TG
                </p>
                <p className="text-xs text-text-secondary">
                  Email: <a href="mailto:info@charitydraws.co.uk" className="text-text-brand hover:underline font-semibold">info@charitydraws.co.uk</a>
                </p>
              </div>
              <p className="text-xs text-text-muted">
                Note: This website is not intended for children, and we do not knowingly collect personal data relating to individuals under 18 years of age.
              </p>
            </section>

            {/* 2. The Data We Collect */}
            <section id="data-we-collect" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                2. The Data We Collect About You
              </h2>
              <p>
                Personal data means any information that can identify an individual. We may collect, use, store, and transfer the following categories of personal data:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand uppercase">Identity Data</h4>
                  <p className="text-xs text-text-muted mt-1">First name, last name, username (or similar identifier), date of birth.</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand uppercase">Contact Data</h4>
                  <p className="text-xs text-text-muted mt-1">Billing address, delivery address, email address, telephone number.</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand uppercase">Financial Data</h4>
                  <p className="text-xs text-text-muted mt-1">We do not store full credit card data. Payments are processed by independent PCI-DSS compliant providers (Stripe, Cashflows).</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand uppercase">Technical Data</h4>
                  <p className="text-xs text-text-muted mt-1">IP address, login data, browser type/version, time zone, location, platform technology.</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand uppercase">Transaction & Profile Data</h4>
                  <p className="text-xs text-text-muted mt-1">Order history, purchased tickets, competition entries, wins claimed, account preferences.</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand uppercase">Marketing & Usage Data</h4>
                  <p className="text-xs text-text-muted mt-1">Communication preferences, website interaction metrics, marketing opt-ins.</p>
                </div>
              </div>
            </section>

            {/* 3. Prize Draws & Competitions */}
            <section id="prize-draws-data" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                3. Prize Draws & Competition Processing
              </h2>
              <p>
                We collect the minimum personal data necessary to allow you to participate in competitions and administer draw entries. If you win a major prize or instant win:
              </p>
              <ul className="list-disc list-inside space-y-2 text-xs text-text-secondary pl-2">
                <li>We will verify your identity, age (18+), and UK residency before delivering your prize.</li>
                <li>If the prize involves a cash transfer, we verify your nominated UK bank account details.</li>
                <li>Failure to provide required verification data may prevent prize fulfillment in accordance with competition rules.</li>
              </ul>
            </section>

            {/* 4. Marketing Choices */}
            <section id="marketing-choices" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                4. Marketing & Communication Preferences
              </h2>
              <p>
                You will receive marketing communications from Charity Draws if you have requested information, purchased tickets, entered a competition, or explicitly subscribed to our newsletter.
              </p>
              <p>
                <strong className="text-text-primary">Opting Out:</strong> You can unsubscribe from marketing communications at any time by clicking the "Unsubscribe" link in any promotional email or contacting us directly at <a href="mailto:info@charitydraws.co.uk" className="text-text-brand underline">info@charitydraws.co.uk</a>. Opting out of marketing does not affect essential transaction emails (e.g. ticket purchase receipts or winner notifications).
              </p>
            </section>

            {/* 5. Cookies & Analytics */}
            <section id="cookies-analytics" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                5. Cookies & Tracking Technologies
              </h2>
              <p>
                We use cookies and analytical tracking technologies to optimize site security, manage login sessions, and improve platform performance.
              </p>
              <p>
                For complete details on cookie categories, purposes, and how to manage your browser settings, please visit our dedicated{" "}
                <Link href="/cookie-policy" className="text-text-brand font-semibold underline">
                  Cookie Policy
                </Link>.
              </p>
            </section>

            {/* 6. Disclosure & Transfers */}
            <section id="disclosure" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                6. Disclosure & International Data Transfers
              </h2>
              <p>
                We may share your personal data with trusted third parties who assist our business operations:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-text-secondary pl-2">
                <li>Payment Processors (Stripe, Cashflows)</li>
                <li>Transactional Messaging Services</li>
                <li>Professional Advisers, Auditors, Insurers, and Legal Counsel</li>
                <li>Regulators & Authorities (HMRC, Advertising Standards Authority - ASA)</li>
              </ul>
              <p id="international-transfers" className="pt-3 text-xs text-text-muted">
                When third-party providers operate outside the UK, we enforce approved international transfer safeguards (such as UK Standard Contractual Clauses) to ensure your data receives the exact same protection.
              </p>
            </section>

            {/* 7. Data Security & Retention */}
            <section id="security-retention" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                7. Data Security & Retention
              </h2>
              <p>
                We implement robust technical and organizational security measures (256-bit SSL encryption, restricted administrative access, rate limiting) to prevent unauthorized access or data loss.
              </p>
              <p>
                Personal data is retained only as long as necessary to fulfill the purposes for which it was collected, including legal, accounting, anti-money laundering, or tax requirements.
              </p>
            </section>

            {/* 8. Your Legal Rights */}
            <section id="your-legal-rights" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                8. Your Legal Rights Under UK GDPR
              </h2>
              <p>Under UK Data Protection law, you have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-xs text-text-secondary pl-2">
                <li><strong className="text-text-primary">Request Access:</strong> Receive a copy of the personal data we hold about you.</li>
                <li><strong className="text-text-primary">Request Correction:</strong> Have any incomplete or inaccurate data corrected.</li>
                <li><strong className="text-text-primary">Request Erasure:</strong> Ask us to delete personal data where there is no good reason for us continuing to process it.</li>
                <li><strong className="text-text-primary">Object to Processing:</strong> Object where we rely on a legitimate interest or direct marketing.</li>
                <li><strong className="text-text-primary">Request Restriction:</strong> Suspend processing of your personal data under specific scenarios.</li>
                <li><strong className="text-text-primary">Data Portability:</strong> Request transfer of your data in a structured, machine-readable format.</li>
              </ul>
              <p className="text-xs text-text-muted pt-2">
                To exercise any of your rights, contact our Data Privacy Manager at <a href="mailto:info@charitydraws.co.uk" className="text-text-brand underline">info@charitydraws.co.uk</a>. We aim to respond within 30 days.
              </p>
            </section>

            {/* 9. Lawful Bases */}
            <section id="lawful-bases" className="bg-surface border border-border rounded-card p-6 sm:p-8 space-y-4 shadow-card">
              <h2 className="font-heading font-bold text-xl text-text-primary border-b border-divider pb-3">
                9. Lawful Bases for Processing
              </h2>
              <p>We process your data relying on one or more of the following legal grounds:</p>
              <div className="space-y-3 pt-1">
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand">1. Performance of Contract</h4>
                  <p className="text-xs text-text-muted mt-0.5">Processing necessary to fulfill ticket orders, competition entry contracts, and prize distributions.</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand">2. Legitimate Interests</h4>
                  <p className="text-xs text-text-muted mt-0.5">Necessary for our business interests in fraud prevention, network security, and platform improvement.</p>
                </div>
                <div className="bg-elevated/50 p-4 rounded-xl border border-border">
                  <h4 className="font-heading font-bold text-xs text-text-brand">3. Legal Obligation</h4>
                  <p className="text-xs text-text-muted mt-0.5">Compliance with UK tax, anti-money laundering (AML), and Advertising Standards Authority (ASA) obligations.</p>
                </div>
              </div>
            </section>

          </main>

        </div>
      </div>
    </div>
  );
}