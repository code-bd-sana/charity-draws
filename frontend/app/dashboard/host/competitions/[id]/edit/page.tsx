import React from "react";
import EditRaffleForm from "../../../../../../components/dashboard/host/edit/EditRaffleForm";

export const metadata = {
  title: "Edit Competition | Host Dashboard",
};

export default async function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="flex-1 w-full flex justify-center">
      <div className="w-full max-w-[800px]">
        <EditRaffleForm raffleId={id} />
      </div>
    </div>
  );
}
