import { describe, expect, it } from "vitest";
import { z } from "zod";
import { composeDueDate, composeStartDate } from "@/lib/kanban/due-date";

// Replicate schema rule from src/app/api/cards/route.ts
const createCardDatesSchema = z
  .object({
    title: z.string().min(1),
    startDate: z.string().datetime().nullable().optional(),
    dueDate: z.string().datetime().nullable().optional()
  })
  .refine(
    (data) => {
      if (data.startDate) {
        return Boolean(data.dueDate);
      }
      return true;
    },
    {
      message: "หากต้องการกำหนดเวลาเริ่มต้น (Start Date) จะต้องกำหนดเวลาสิ้นสุด (Due Date) ด้วยเสมอ",
      path: ["dueDate"]
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.dueDate) {
        return new Date(data.startDate).getTime() <= new Date(data.dueDate).getTime();
      }
      return true;
    },
    {
      message: "เวลาเริ่มต้นต้องไม่เกินเวลาสิ้นสุด",
      path: ["startDate"]
    }
  );

// Client-side validation function in card-modal.tsx
function validateCardFormDates(startDate: string, date: string): { isValid: boolean; error?: string } {
  if (startDate && !date) {
    return {
      isValid: false,
      error: "หากต้องการกำหนดเวลาเริ่มต้น (Start Date) จะต้องกำหนดเวลาสิ้นสุด (Due Date) ด้วยเสมอ"
    };
  }
  if (startDate && date && startDate > date) {
    return {
      isValid: false,
      error: "เวลาเริ่มต้นต้องไม่เกินเวลาสิ้นสุด"
    };
  }
  return { isValid: true };
}

describe("Card Dates Validation Rules", () => {
  describe("API createCardSchema refine tests", () => {
    it("allows a card with no startDate and no dueDate", () => {
      const result = createCardDatesSchema.safeParse({
        title: "Test task",
        startDate: null,
        dueDate: null
      });
      expect(result.success).toBe(true);
    });

    it("allows a card with dueDate only", () => {
      const result = createCardDatesSchema.safeParse({
        title: "Test task",
        startDate: null,
        dueDate: "2026-05-20T10:00:00.000Z"
      });
      expect(result.success).toBe(true);
    });

    it("allows startDate <= dueDate", () => {
      const result = createCardDatesSchema.safeParse({
        title: "Test task",
        startDate: "2026-05-18T08:00:00.000Z",
        dueDate: "2026-05-20T10:00:00.000Z"
      });
      expect(result.success).toBe(true);
    });

    it("rejects startDate when dueDate is absent or null", () => {
      const result = createCardDatesSchema.safeParse({
        title: "Test task",
        startDate: "2026-05-18T08:00:00.000Z",
        dueDate: null
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("หากต้องการกำหนดเวลาเริ่มต้น");
        expect(result.error.issues[0].path).toContain("dueDate");
      }
    });

    it("rejects startDate when startDate > dueDate", () => {
      const result = createCardDatesSchema.safeParse({
        title: "Test task",
        startDate: "2026-05-22T08:00:00.000Z",
        dueDate: "2026-05-20T10:00:00.000Z"
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("เวลาเริ่มต้นต้องไม่เกินเวลาสิ้นสุด");
        expect(result.error.issues[0].path).toContain("startDate");
      }
    });
  });

  describe("Card Modal client-side date checks", () => {
    it("validates that startDate cannot be set without date (dueDate)", () => {
      const res = validateCardFormDates("2026-05-20", "");
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("หากต้องการกำหนดเวลาเริ่มต้น (Start Date) จะต้องกำหนดเวลาสิ้นสุด (Due Date) ด้วยเสมอ");
    });

    it("validates that startDate cannot be greater than date (dueDate)", () => {
      const res = validateCardFormDates("2026-05-25", "2026-05-20");
      expect(res.isValid).toBe(false);
      expect(res.error).toBe("เวลาเริ่มต้นต้องไม่เกินเวลาสิ้นสุด");
    });

    it("passes validation when both dates are present and startDate <= dueDate", () => {
      const res = validateCardFormDates("2026-05-15", "2026-05-20");
      expect(res.isValid).toBe(true);
      expect(res.error).toBeUndefined();
    });

    it("clears start payload if due.dueDate is null", () => {
      const due = composeDueDate("", "");
      const start = due.dueDate
        ? composeStartDate("2026-05-10", "")
        : { startDate: null, startDateAllDay: false };

      expect(start).toEqual({ startDate: null, startDateAllDay: false });
    });

    it("composes valid start payload when due.dueDate is present", () => {
      const due = composeDueDate("2026-05-20", "15:00");
      const start = due.dueDate
        ? composeStartDate("2026-05-18", "09:00")
        : { startDate: null, startDateAllDay: false };

      expect(start.startDate).not.toBeNull();
      expect(start.startDateAllDay).toBe(false);
    });
  });
});
