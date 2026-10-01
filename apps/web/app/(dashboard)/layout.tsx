import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";

export const metadata: Metadata = { robots: { index: false, follow: false } };
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const company = await requireCompany();

  return (
    <div className="scenic min-h-screen lg:flex">
      <Sidebar companyName={company.name} domain={company.domain} />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12 lg:py-10">{children}</main>
    </div>
  );
}
