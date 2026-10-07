import { HelpCenterClient } from "@/components/help/help-center-client";

export const metadata = {
  title: "ข้อมูลระบบ & คู่มือการใช้งาน (System Guide & Help) · Retzlo",
  description:
    "คู่มือการใช้งานระบบ ข้อมูลสถาปัตยกรรม แนะนำฟีเจอร์ บอร์ด AI และคีย์ลัดสำหรับ Retzlo Platform",
};

export default function HelpPage() {
  return <HelpCenterClient />;
}
