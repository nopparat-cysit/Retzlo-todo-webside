import type { Metadata } from "next";

import { CursorAura } from "@/components/ui/cursor-aura";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme/theme-provider";

import "./globals.css";

function getMetadataBase(): URL {
  const raw = process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://retzlo-todo-webside.vercel.app");
  try {
    const formatted = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
    return new URL(formatted);
  } catch {
    return new URL("https://retzlo-todo-webside.vercel.app");
  }
}

export const metadata: Metadata = {
  title: {
    default: "Retzlo - Retro-Lofi Work & Life Management",
    template: "%s | Retzlo"
  },
  description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to.",
  metadataBase: getMetadataBase(),
  openGraph: {
    title: "Retzlo - Retro-Lofi Work & Life Management",
    description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to.",
    url: "https://retzlo-todo-webside.vercel.app",
    siteName: "Retzlo",
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Retzlo - Retro-Lofi Work & Life Management",
    description: "A quiet retro-lofi workspace for boards, due dates, notes, and the work you keep returning to."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('retzlo-theme')||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);if(t==='light'){document.documentElement.classList.add('light');}else{document.documentElement.classList.add('dark');}}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <CursorAura />
          <ToastProvider>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
