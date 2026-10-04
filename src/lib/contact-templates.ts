export interface ContactTemplate {
  id: string;
  label: string;
  shortName: string;
  badge: string;
  badgeColor: string;
  defaultSubject: string;
  defaultPriority: "low" | "medium" | "high" | "urgent";
  description: string;
  templateBody: string;
}

export const CONTACT_TEMPLATES: ContactTemplate[] = [
  {
    id: "bug-report",
    label: "🐛 แจ้งปัญหาการใช้งาน (Bug Report)",
    shortName: "แจ้ง Bug",
    badge: "Bug",
    badgeColor: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400",
    defaultSubject: "[Bug] แจ้งพบปัญหาหรือข้อผิดพลาดในการใช้งานระบบ",
    defaultPriority: "high",
    description: "แจ้งข้อผิดพลาด การแสดงผลเพี้ยน หรือปัญหาการทำงานของฟังก์ชัน",
    templateBody: `[รายละเอียดปัญหาที่พบ]
- อธิบายสิ่งที่เกิดขึ้น: 
- ผลลัพธ์ที่คาดหวัง: 

[ขั้นตอนการทำให้เกิดปัญหา (Steps to Reproduce)]
1. เข้าไปที่หน้า: 
2. ดำเนินการ/กดปุ่ม: 
3. เกิดข้อผิดพลาดดังนี้: 

[ข้อมูลสภาพแวดล้อม]
- เบราว์เซอร์ (Chrome / Safari / Edge): 
- อุปกรณ์ (PC / Mac / Mobile): 
- หมายเหตุเพิ่มเติม: `,
  },
  {
    id: "feature-request",
    label: "💡 แนะนำฟีเจอร์ใหม่ (Feature Request)",
    shortName: "ขอฟีเจอร์",
    badge: "Idea",
    badgeColor: "border-amber-300 bg-amber-50 text-amber-700 dark:border-dusk-amber/30 dark:bg-dusk-amber/10 dark:text-dusk-amber",
    defaultSubject: "[Feature Request] ข้อเสนอแนะฟีเจอร์ใหม่สำหรับ Retzlo",
    defaultPriority: "medium",
    description: "เสนอแนะแนวคิดใหม่ๆ เพื่อปรับปรุงให้ Retzlo ตอบโจทย์การทำงานยิ่งขึ้น",
    templateBody: `[ฟีเจอร์หรือความสามารถที่อยากให้มี]
- ชื่อหรือแนวคิดฟีเจอร์: 
- รูปแบบการทำงานที่ต้องการ: 

[ปัญหาหรือเวิร์กโฟลว์ในปัจจุบัน]
- ปัญหาที่พบในการทำงานปัจจุบัน: 

[ประโยชน์ที่คาดว่าจะได้รับ]
- ฟีเจอร์นี้จะช่วยเพิ่มความสะดวกรวดเร็วอย่างไร: `,
  },
  {
    id: "general-inquiry",
    label: "💬 สอบถามการใช้งานทั่วไป (General Inquiry)",
    shortName: "สอบถามทั่วไป",
    badge: "Inquiry",
    badgeColor: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-dusk-lavender/30 dark:bg-dusk-lavender/10 dark:text-dusk-lavender",
    defaultSubject: "[Inquiry] สอบถามข้อมูลการใช้งานระบบ Retzlo",
    defaultPriority: "medium",
    description: "คำถามเกี่ยวกับวิธีการใช้งานบอร์ด ตาราง ปฏิทิน หรือ AI Assistant",
    templateBody: `[หัวข้อที่ต้องการสอบถาม]
- ส่วนของระบบที่เกี่ยวข้อง (เช่น บอร์ด, ตาราง, ปฏิทิน, AI, การตั้งค่า): 

[คำถามหรือข้อสงสัย]
- 

[สิ่งที่ได้ลองทำไปแล้ว (ถ้ามี)]
- `,
  },
  {
    id: "partnership-feedback",
    label: "🤝 ติดต่อทีมพัฒนา / ความร่วมมือ (Partnership & Feedback)",
    shortName: "ร่วมมือ/ข้อเสนอแนะ",
    badge: "Partner",
    badgeColor: "border-teal-300 bg-teal-50 text-teal-700 dark:border-dusk-cyan/30 dark:bg-dusk-cyan/10 dark:text-dusk-cyan",
    defaultSubject: "[Partnership] ติดต่อทีมพัฒนาหรือประสานงานร่วมมือ",
    defaultPriority: "low",
    description: "ติดต่อเพื่อการร่วมมือทางธุรกิจ หรือส่งความคิดเห็นภาพรวมถึงทีมงาน",
    templateBody: `[ชื่อองค์กร / ทีมงาน / บุคคลที่ติดต่อ]
- 

[เรื่องที่ต้องการติดต่อหรือข้อเสนอแนะ]
- 

[ช่องทางที่สะดวกในการติดต่อกลับ]
- อีเมล / เบอร์โทรศัพท์ / LINE ID: `,
  },
  {
    id: "gamification-rewards",
    label: "☕ ข้อเสนอแนะ Gamification & รางวัล (Rewards Store)",
    shortName: "รางวัล & เหรียญ",
    badge: "Rewards",
    badgeColor: "border-pink-300 bg-pink-50 text-pink-700 dark:border-pink-500/30 dark:bg-pink-500/10 dark:text-pink-400",
    defaultSubject: "[Rewards] ข้อเสนอแนะเกี่ยวกับระบบ Coffee Cheers & Rewards Store",
    defaultPriority: "low",
    description: "เสนอแนะของรางวัลใหม่ๆ กติกาการส่งแก้วกาแฟ หรือระบบเหรียญ",
    templateBody: `[ข้อเสนอแนะเกี่ยวกับระบบของรางวัลและเหรียญ]
- ไอเทมของรางวัลหรือกิจกรรมที่อยากให้มีในร้านค้า: 
- ข้อเสนอแนะเกี่ยวกับจำนวนเหรียญหรือการ Cheers: 

[เหตุผลหรือประโยชน์ต่อบรรยากาศในทีม]
- `,
  },
  {
    id: "security-privacy",
    label: "🔒 ความปลอดภัยและความเป็นส่วนตัว (Security & Privacy)",
    shortName: "ความปลอดภัย",
    badge: "Security",
    badgeColor: "border-stone-300 bg-stone-100 text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300",
    defaultSubject: "[Security] สอบถามเกี่ยวกับการรักษาความปลอดภัยและความเป็นส่วนตัว",
    defaultPriority: "urgent",
    description: "ข้อสงสัยด้านความปลอดภัย การจัดการข้อมูล หรือสิทธิ์การเข้าถึง",
    templateBody: `[เรื่องที่ต้องการติดต่อเกี่ยวกับความปลอดภัย]
- (เช่น การจัดการสิทธิ์สมาชิก, การสำรองข้อมูล, การลบบัญชี, หรือช่องโหว่ความปลอดภัย)

[รายละเอียดคำถามหรือข้อสังเกต]
- `,
  },
  {
    id: "custom",
    label: "✏️ ข้อความกำหนดเอง (Custom Freeform)",
    shortName: "กำหนดเอง",
    badge: "Freeform",
    badgeColor: "border-stone-200 bg-stone-50 text-stone-600 dark:border-white/10 dark:bg-white/5 dark:text-stone-400",
    defaultSubject: "",
    defaultPriority: "medium",
    description: "พิมพ์หัวข้อและรายละเอียดอย่างอิสระตามความต้องการของคุณ",
    templateBody: "",
  },
];
