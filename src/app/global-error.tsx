"use client";

import { useEffect, useState } from "react";
import { isChunkLoadError, triggerChunkReload } from "@/lib/chunk-recovery";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [clearing, setClearing] = useState(false);
  const isChunk = isChunkLoadError(error);

  useEffect(() => {
    console.error("Global root client-side exception caught:", error);
  }, [error]);

  const handleReload = () => {
    triggerChunkReload(true);
  };

  const handleClearCacheAndReload = async () => {
    try {
      setClearing(true);
      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const keys = await window.caches.keys();
          await Promise.all(keys.map((k) => window.caches.delete(k)));
        } catch {}
      }
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("retzlo") || key.startsWith("retrod"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      sessionStorage.clear();
    } catch {
      // ignore storage access errors
    } finally {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set("_r", String(Date.now()));
        window.location.replace(url.toString());
      } catch {
        window.location.reload();
      }
    }
  };

  return (
    <html lang="en">
      <head>
        <title>{isChunk ? "Update Available | Retzlo" : "Application Error | Retzlo"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              body {
                margin: 0;
                padding: 0;
                background-color: #0b0b14;
                color: #e2e8f0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex;
                min-height: 100vh;
                align-items: center;
                justify-content: center;
              }
              .card {
                background: rgba(22, 22, 38, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 28px;
                max-width: 480px;
                width: 90%;
                text-align: center;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
              }
              .badge {
                display: inline-block;
                background: rgba(239, 68, 68, 0.15);
                color: #f87171;
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 9999px;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.05em;
                text-transform: uppercase;
                margin-bottom: 12px;
              }
              .badge-update {
                background: rgba(99, 102, 241, 0.15);
                color: #a5b4fc;
                border-color: rgba(99, 102, 241, 0.35);
              }
              h1 {
                font-size: 18px;
                font-weight: 700;
                margin: 0 0 8px 0;
                color: #f8fafc;
              }
              p {
                font-size: 13px;
                line-height: 1.5;
                color: #94a3b8;
                margin: 0 0 20px 0;
              }
              .error-box {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 10px 12px;
                font-family: monospace;
                font-size: 11px;
                color: #cbd5e1;
                text-align: left;
                margin-bottom: 20px;
                max-height: 120px;
                overflow-y: auto;
                word-break: break-word;
              }
              .btn-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                justify-content: center;
              }
              button, a {
                padding: 8px 16px;
                border-radius: 10px;
                font-size: 12px;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                transition: all 0.15s ease;
                display: inline-flex;
                align-items: center;
                justify-content: center;
              }
              .btn-primary {
                background: #6366f1;
                color: #ffffff;
                border: 1px solid #4f46e5;
              }
              .btn-primary:hover {
                background: #4f46e5;
              }
              .btn-secondary {
                background: rgba(255, 255, 255, 0.06);
                color: #cbd5e1;
                border: 1px solid rgba(255, 255, 255, 0.12);
              }
              .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.12);
                color: #ffffff;
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="card">
          {isChunk ? (
            <>
              <span className="badge badge-update">Update Available</span>
              <h1>A new version of Retzlo is available / มีการอัปเดตเวอร์ชันใหม่</h1>
              <p>
                Please reload the page to load the latest version / กรุณารีโหลดหน้าเว็บเพื่อใช้งานเวอร์ชันล่าสุด
              </p>

              {error?.message ? (
                <div className="error-box">
                  <strong>{error.name || "Error"}:</strong> {error.message}
                  {error.digest ? <div><small>Digest: {error.digest}</small></div> : null}
                </div>
              ) : error?.digest ? (
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 16px 0" }}>
                  Digest: {error.digest}
                </p>
              ) : null}

              <div className="btn-row">
                <button type="button" className="btn-primary" onClick={handleReload}>
                  Reload page / รีโหลดหน้าเว็บ
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClearCacheAndReload}
                  disabled={clearing}
                >
                  {clearing ? "Clearing..." : "Clear Cache & Reload / ล้างแคชแล้วรีโหลด"}
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="badge">Client Exception</span>
              <h1>Something went wrong</h1>
              <p>
                An unexpected error occurred while loading this page. You can try refreshing or resetting the application cache.
              </p>

              {error?.message ? (
                <div className="error-box">
                  <strong>{error.name || "Error"}:</strong> {error.message}
                  {error.digest ? <div><small>Digest: {error.digest}</small></div> : null}
                </div>
              ) : error?.digest ? (
                <p style={{ fontSize: "11px", color: "#64748b", margin: "0 0 16px 0" }}>
                  Digest: {error.digest}
                </p>
              ) : null}

              <div className="btn-row">
                <button type="button" className="btn-primary" onClick={() => reset()}>
                  Try again
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleClearCacheAndReload}
                  disabled={clearing}
                >
                  {clearing ? "Clearing..." : "Clear Cache & Reload"}
                </button>
                <a href="/login" className="btn-secondary">
                  Back to Login
                </a>
              </div>
            </>
          )}
        </div>
      </body>
    </html>
  );
}
