import React from "react";
import { Metadata } from "next";
import NotificationsView from "../../../../components/dashboard/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications | Admin Dashboard",
  description: "Monitor platform activity alerts, competition submissions, and payouts.",
};

export default function AdminNotificationsPage() {
  return <NotificationsView />;
}
