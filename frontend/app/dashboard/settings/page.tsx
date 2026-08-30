import React from "react";
import SettingsManager from "../../../components/dashboard/shared/settings/SettingsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Dashboard",
  description: "Manage your profile, security, and notification settings.",
};

export default function SharedSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10 max-w-[1660px] mx-auto w-full animate-fadeIn select-none">
      <div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-text-primary mb-1.5">Account Settings</h1>
        <p className="font-sans text-xs md:text-sm text-text-muted font-medium">
          Manage your personal information, security preferences, and account settings.
        </p>
      </div>
      
      <SettingsManager />
    </div>
  );
}
