import type { Metadata } from "next";
import { getUser, requireCompany } from "@/lib/company";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [company, user] = await Promise.all([requireCompany(), getUser()]);

  return (
    <div className="scenic min-h-screen lg:flex">
      <Sidebar companyName={company.name} domain={company.domain} />
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8 lg:px-12 lg:py-8">
        <TopBar company={company} name={(user.user_metadata?.full_name as string | undefined) || null} email={user.email ?? ""} />
        {children}
      </main>
    </div>
  );
}
