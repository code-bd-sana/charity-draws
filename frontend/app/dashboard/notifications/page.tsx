import React from "react";
import { Metadata } from "next";
import NotificationsView from "../../../components/dashboard/notifications/NotificationsView";

export const metadata: Metadata = {
  title: "Notifications | Charity Draws",
  description: "View real-time alerts and activity updates.",
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
