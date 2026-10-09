import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mediflow-ai.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/demo", "/privacy", "/terms"],
        disallow: ["/api/", "/demo/patient/dashboard", "/demo/doctor/dashboard", "/demo/admin/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
