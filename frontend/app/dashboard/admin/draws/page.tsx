import React from "react";
import AdminDrawsManager from "../../../../components/dashboard/admin/draws/AdminDrawsManager";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Draws | Admin Dashboard",
  description: "Manage upcoming, live, and completed competition draws.",
};

export default function AdminDrawsPage() {
  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn select-none">
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Draws Management</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          Manage upcoming, live, and completed competition draws across the platform.
        </p>
      </div>
      <AdminDrawsManager />
    </div>
  );
}
