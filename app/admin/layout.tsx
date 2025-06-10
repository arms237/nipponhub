import React from "react";
import { Metadata } from "next";
import SidebarDashboard from "@/components/layout/SidebarDashboard";

export const metadata: Metadata = {
  title: "NIPPON HUB - dashboard",
  description:
    "",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
    <SidebarDashboard/>        
    {children}
    </div>
  );
}
