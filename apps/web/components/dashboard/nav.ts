import { BarChart3, FileText, LayoutDashboard, LayoutGrid, MessageSquareText, Settings, Target, Users } from "lucide-react";

// Single source for the dashboard menu — the homepage DashboardPreview renders this same list,
// so marketing can never show pages the product doesn't have.
export const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/answers", label: "AI Answers", icon: MessageSquareText },
  { href: "/queries", label: "Queries", icon: LayoutGrid },
  { href: "/mentions", label: "Brand Mentions", icon: BarChart3 },
  { href: "/competitors", label: "Competitors", icon: Users },
  { href: "/opportunities", label: "Opportunities", icon: Target },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
