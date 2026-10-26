import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const paginationSource = readFileSync(new URL("./admin-pagination.tsx", import.meta.url), "utf8");
const dashboardSource = readFileSync(new URL("./admin-dashboard-client.tsx", import.meta.url), "utf8");
const usersTabSource = readFileSync(new URL("./tabs/users-tab.tsx", import.meta.url), "utf8");
const workspacesTabSource = readFileSync(new URL("./tabs/workspaces-tab.tsx", import.meta.url), "utf8");
const auditTabSource = readFileSync(new URL("./tabs/audit-tab.tsx", import.meta.url), "utf8");

describe("Admin Pagination and Sidebar Architecture", () => {
  it("implements direct numeric page jump with clamp validation in AdminPagination", () => {
    expect(paginationSource).toContain('export function AdminPagination');
    expect(paginationSource).toContain('jumpInput');
    expect(paginationSource).toContain('handleJumpSubmit');
    expect(paginationSource).toContain('Math.max(1, Math.min(parsed, safeTotalPages))');
    expect(paginationSource).toContain('type="number"');
    expect(paginationSource).toContain('aria-label="Go to page number"');
  });

  it("integrates AdminPagination in UsersTab, WorkspacesTab, and AuditTab", () => {
    expect(usersTabSource).toContain('import { AdminPagination } from "../admin-pagination"');
    expect(usersTabSource).toContain('<AdminPagination');

    expect(workspacesTabSource).toContain('import { AdminPagination } from "../admin-pagination"');
    expect(workspacesTabSource).toContain('<AdminPagination');

    expect(auditTabSource).toContain('import { AdminPagination } from "../admin-pagination"');
    expect(auditTabSource).toContain('<AdminPagination');
  });

  it("structures AdminDashboardClient with a dedicated left sidebar", () => {
    expect(dashboardSource).toContain('aside className="hidden md:flex md:w-64 lg:w-72');
    expect(dashboardSource).toContain('md:pl-64 lg:pl-72');
    expect(dashboardSource).toContain('isMobileSidebarOpen');
    expect(dashboardSource).toContain('Core & Telemetry');
    expect(dashboardSource).toContain('Directory & Resources');
    expect(dashboardSource).toContain('Systems & Infrastructure');
  });

  it("binds page state and handlers in AdminDashboardClient for users and projects", () => {
    expect(dashboardSource).toContain('userPage');
    expect(dashboardSource).toContain('userPageSize');
    expect(dashboardSource).toContain('projectPage');
    expect(dashboardSource).toContain('projectPageSize');
    expect(dashboardSource).toContain('handleUserSearchChange');
    expect(dashboardSource).toContain('handleProjectSearchChange');
  });
});
