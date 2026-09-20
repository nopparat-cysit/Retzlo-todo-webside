import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL || "https://retzlo-todo-webside.vercel.app";
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register", "/terms", "/privacy"],
      disallow: ["/project/", "/projects", "/api/", "/profile"]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}
