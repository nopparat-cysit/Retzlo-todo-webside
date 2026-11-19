import type { Metadata } from "next";

import { CursorAura } from "@/components/ui/cursor-aura";
import { GlobalBroadcastBanner } from "@/components/ui/global-broadcast-banner";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { LanguageProvider } from "@/lib/i18n/language-context";
import { AiChatProvider } from "@/components/ai/ai-chat-context";
import { AiChatWidget } from "@/components/ai/ai-chat-widget";
import { CommandPalette } from "@/components/ui/command-palette";
import { ChunkRecoveryListener } from "@/components/common/chunk-recovery-listener";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700;800&family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=localStorage.getItem('retzlo-theme');if(p!=='light'&&p!=='dark'&&p!=='system')p='system';var t=p==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;var r=document.documentElement;r.setAttribute('data-theme',t);r.classList.remove('light','dark');r.classList.add(t);}catch(e){}})();`
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(typeof window==='undefined')return;var k='retzlo_chunk_retry_timestamp';var cd=20000;function isC(m){if(!m)return false;var s=String(m).toLowerCase();return s.indexOf('chunkloaderror')!==-1||s.indexOf('loading chunk')!==-1||s.indexOf('failed to fetch dynamically imported module')!==-1||s.indexOf('load chunk failed')!==-1||s.indexOf('loading css chunk')!==-1;}function tr(msg){if(!isC(msg))return;var l=parseInt(sessionStorage.getItem(k)||'0',10);var now=Date.now();if(now-l<cd)return;sessionStorage.setItem(k,String(now));window.location.reload();}window.addEventListener('error',function(e){try{var t=e&&e.target;if(t&&(t.src||t.href)&&String(t.src||t.href).indexOf('/_next/static/')!==-1){tr('loading chunk');return;}tr(e&&(e.message||(e.error&&e.error.message)));}catch(err){}},true);window.addEventListener('unhandledrejection',function(e){try{var r=e&&(e.reason&&(e.reason.message||e.reason));tr(r);}catch(err){}},true);}catch(e){}})();`
          }}
        />
      </head>
      <body>
        <ChunkRecoveryListener />
        <ThemeProvider>
          <LanguageProvider>
            <GlobalBroadcastBanner />
            <CursorAura />
            <ToastProvider>
              <AiChatProvider>
                {children}
                <AiChatWidget />
                <CommandPalette />
              </AiChatProvider>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
