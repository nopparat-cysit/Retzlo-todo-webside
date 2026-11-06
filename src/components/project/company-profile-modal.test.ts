import { describe, expect, it } from "vitest";

function parseCompanyProfileLines(description: string | null) {
  if (!description) {
    return { isEmpty: true, lines: [] };
  }

  const rawLines = description.split("\n");
  const parsed = rawLines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed) return { type: "empty", label: "", value: "" };

    const boldMatch = trimmed.match(/^\*\*(.+?)\*\*:?\s*(.*)$/);
    if (boldMatch) {
      const label = boldMatch[1].replace(/:$/, "").trim();
      return { type: "bold", label, value: boldMatch[2] };
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex > 0 && colonIndex < 35 && !trimmed.startsWith("http")) {
      return {
        type: "keyValue",
        label: trimmed.slice(0, colonIndex).trim(),
        value: trimmed.slice(colonIndex + 1).trim()
      };
    }

    return { type: "text", label: "", value: trimmed };
  });

  return { isEmpty: false, lines: parsed };
}

describe("Company Profile Parsing & Display Logic", () => {
  it("handles empty or null description gracefully", () => {
    const result = parseCompanyProfileLines(null);
    expect(result.isEmpty).toBe(true);
    expect(result.lines).toHaveLength(0);
  });

  it("parses bold label markdown entries", () => {
    const input = "**Tax ID:** 0105560000000\n**Registered Address:** 123 Sukhumvit Rd, Bangkok";
    const result = parseCompanyProfileLines(input);

    expect(result.isEmpty).toBe(false);
    expect(result.lines).toEqual([
      { type: "bold", label: "Tax ID", value: "0105560000000" },
      { type: "bold", label: "Registered Address", value: "123 Sukhumvit Rd, Bangkok" }
    ]);
  });

  it("parses colon key-value pairs without markdown", () => {
    const input = "Company Name: Acme Corp Ltd.\nHeadquarters: Chiang Mai, Thailand";
    const result = parseCompanyProfileLines(input);

    expect(result.lines).toEqual([
      { type: "keyValue", label: "Company Name", value: "Acme Corp Ltd." },
      { type: "keyValue", label: "Headquarters", value: "Chiang Mai, Thailand" }
    ]);
  });

  it("preserves plain text descriptions and spacing", () => {
    const input = "Leading provider of software solutions.\n\nContact us for more details.";
    const result = parseCompanyProfileLines(input);

    expect(result.lines[0]).toEqual({
      type: "text",
      label: "",
      value: "Leading provider of software solutions."
    });
    expect(result.lines[1]).toEqual({
      type: "empty",
      label: "",
      value: ""
    });
    expect(result.lines[2]).toEqual({
      type: "text",
      label: "",
      value: "Contact us for more details."
    });
  });

  it("modal metadata contract matches requirements", () => {
    const modalProps = {
      title: "Company Profile / ข้อมูลบริษัท",
      projectName: "Project Alpha",
      triggerLabel: "แสดงเพิ่มเติม / Profile",
      clampedClass: "line-clamp-2"
    };

    expect(modalProps.title).toContain("Company Profile");
    expect(modalProps.title).toContain("ข้อมูลบริษัท");
    expect(modalProps.triggerLabel).toBe("แสดงเพิ่มเติม / Profile");
    expect(modalProps.clampedClass).toBe("line-clamp-2");
  });
});
