import React from "react";
import EditRaffleForm from "../../../../../../components/dashboard/host/edit/EditRaffleForm";

export const metadata = {
  title: "Edit Competition | Host Dashboard | Charity Draws",
  description: "Update competition details, ticket limits, schedule, and automated draw settings.",
};

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex-1 w-full flex justify-center py-6 sm:py-8 px-4 sm:px-6">
      <div className="w-full max-w-4xl">
        <EditRaffleForm raffleId={id} />
      </div>
    </div>
  );
}
