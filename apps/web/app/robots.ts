import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/auth/", "/overview", "/answers", "/queries", "/mentions", "/competitors", "/opportunities", "/reports", "/settings", "/onboarding"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
