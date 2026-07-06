import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = [
  new URL("../diary/diary-list-panel.tsx", import.meta.url),
  new URL("../hub/diary-hub-panel.tsx", import.meta.url),
  new URL("../hub/fab-hub.tsx", import.meta.url),
  new URL("../project/project-quick-hub.tsx", import.meta.url),
  new URL("../project/rewards-store.tsx", import.meta.url),
  new URL("../project/projects-dashboard.tsx", import.meta.url)
];

describe("Sprint 2 modal migration", () => {
  it("uses AppModal instead of feature-local ModalPortal overlays in remaining feature modals", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");

      expect(source, file.pathname).toContain('import { AppModal } from "@/components/ui/app-modal"');
      expect(source, file.pathname).not.toMatch(/import \{ ModalPortal \} from "@\/components\/ui\/modal-portal"/);
      expect(source, file.pathname).not.toMatch(/className="[^"]*fixed inset-0 z-\[1000\]/);
    }
  });
});
