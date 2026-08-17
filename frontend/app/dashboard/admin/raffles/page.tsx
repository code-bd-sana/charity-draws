import React from "react";
import AdminCompetitionsTable from "../../../../components/dashboard/admin/AdminCompetitionsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Competitions | Admin Dashboard",
  description: "Manage all competitions across the platform.",
};

export default function AdminCompetitionsPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1660px] mx-auto w-full animate-fadeIn select-none">
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Platform Competitions</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          Manage and review all competitions submitted by hosts across the platform.
        </p>
      </div>
      
      <AdminCompetitionsTable />
    </div>
  );
}
