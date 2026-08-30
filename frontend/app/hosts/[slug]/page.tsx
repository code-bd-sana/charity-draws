import React from "react";
import { Metadata } from "next";
import WebsiteNavbar from "../../../components/website/layout/WebsiteNavbar";
import WebsiteFooter from "../../../components/website/layout/WebsiteFooter";
import HostProfileHeader from "../../../components/website/host-profile/HostProfileHeader";
import HostProfileTabs from "../../../components/website/host-profile/HostProfileTabs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let name = slug;
  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api/v1';
    const res = await fetch(`${apiUrl}/hosts/public/${slug}`);
    if (res.ok) {
      const json = await res.json();
      const host = json.data || json;
      name = host.name;
    }
  } catch (e) {}

  return {
    title: `${name} | Charity Draws Verified Host`,
    description: `View live and past competitions hosted by ${name}.`,
  };
}

export default async function HostProfilePage({ params }: PageProps) {
  const { slug } = await params;
  
  let host = null;
  try {
    const apiUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000/api/v1';
    const res = await fetch(`${apiUrl}/hosts/public/${slug}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      const json = await res.json();
      host = json.data || json;
    }
  } catch (e) {
    console.error("Failed to fetch host", e);
  }

  if (!host) {
    return (
      <>
        <WebsiteNavbar />
        <main className="min-h-screen bg-surface flex items-center justify-center pt-[80px]">
          <div className="text-center">
            <h1 className="text-2xl text-text-primary mb-4 font-heading font-bold">Host Not Found</h1>
            <p className="text-text-muted">This host does not exist or has been removed.</p>
          </div>
        </main>
        <WebsiteFooter />
      </>
    );
  }

  const name = host.name;
  const initials = name.split(' ').map((w: string) => w[0]).join('').substring(0, 2).toUpperCase();

  return (
    <>
      <WebsiteNavbar />
      
      <main className="min-h-screen flex flex-col bg-surface pt-20 lg:pt-[66px] pb-12 relative overflow-hidden select-none">
        {/* Background Glows & Grid Pattern matching Homepage */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)] opacity-100 pointer-events-none" />

        <div className="relative z-10 container-custom pt-12 md:pt-16 pb-12">
          <div className="max-w-[1200px] mx-auto w-full flex flex-col">
            <HostProfileHeader 
              name={name}
              logo={host.logo || initials}
              bio={host.bio || "Charity draws host"}
              isVerified={host.isVerified}
              drawsHosted={host.drawsHosted}
              rating={host.rating}
              memberSince={host.memberSince}
            />
            
            <HostProfileTabs raffles={host.raffles} />
          </div>
        </div>
      </main>

      <WebsiteFooter />
    </>
  );
}
