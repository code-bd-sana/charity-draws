import React from "react";
import OrdersStatsCards from "../../../../components/dashboard/admin/OrdersStatsCards";
import AdminOrdersTable from "../../../../components/dashboard/admin/AdminOrdersTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ticket / Order Overview | Admin Dashboard",
  description: "View all tickets, orders, and manage refunds.",
};

export default function AdminOrdersPage() {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-[1660px] mx-auto w-full animate-fadeIn select-none">
      <div>
        <h1 className="font-heading font-bold text-2xl text-text-primary mb-2">Ticket / Order Overview</h1>
        <p className="font-sans text-sm text-text-muted font-medium">
          Monitor platform-wide ticket sales, review orders, and process refunds if necessary.
        </p>
      </div>
      
      <OrdersStatsCards />
      <AdminOrdersTable />
    </div>
  );
}
