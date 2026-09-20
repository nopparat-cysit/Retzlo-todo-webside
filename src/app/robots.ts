import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawUrl = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://retzlo-todo-webside.vercel.app");
  const baseUrl = rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`;
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/terms", "/privacy"],
      disallow: ["/project/", "/projects", "/api/", "/profile"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
