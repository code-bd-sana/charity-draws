"use client";

import React from "react";
import HostProfileForm from "../../../../components/dashboard/host/profile/HostProfileForm";

export default function HostProfilePage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 select-none">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-text-primary">
          Host Profile & Brand Settings
        </h1>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Manage your host brand profile, logo, bio, and contact information.
        </p>
      </div>

      <HostProfileForm />
    </div>
  );
}
