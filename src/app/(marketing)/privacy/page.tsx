import Link from "next/link";
import { ArrowLeft, Shield, Lock } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Retzlo",
  description: "Privacy Policy and Data Protection practices for Retzlo workspace."
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#080714] text-stone-200 antialiased selection:bg-dusk-lavender/30 selection:text-dusk-lavender">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-400 transition hover:text-dusk-lavender mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Retzlo</span>
        </Link>

        <header className="border-b border-white/10 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-dusk-cyan/30 bg-dusk-cyan/10 px-3 py-1 text-xs font-mono font-medium text-dusk-cyan mb-3">
            <Shield className="h-3.5 w-3.5" />
            <span>Data Protection & Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-stone-400">นโยบายความเป็นส่วนตัวและการคุ้มครองข้อมูลส่วนบุคคล (PDPA Compliance) (มีผลบังคับใช้ตั้งแต่วันที่ 20 กันยายน 2026)</p>
        </header>

        <article className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-stone-300">
          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">1.</span> บทนำ (Introduction)
            </h2>
            <p>
              Retzlo ให้ความสำคัญอย่างยิ่งต่อความเป็นส่วนตัวและการรักษาความมั่นคงปลอดภัยของข้อมูลส่วนบุคคลของท่าน นโยบายนี้อธิบายถึงประเภทของข้อมูลที่เราจัดเก็บ วิธีการประมวลผล และสิทธิของท่านตามกฎหมายว่าด้วยการคุ้มครองข้อมูลส่วนบุคคล (พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 / PDPA และมาตรฐานสากล)
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">2.</span> ข้อมูลส่วนบุคคลที่เราจัดเก็บ (Data We Collect)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>ข้อมูลบัญชีผู้ใช้:</strong> อีเมล (Email), ชื่อผู้ใช้ (Username), ชื่อที่ใช้แสดง (Display Name), และรหัสผ่านที่ผ่านการแฮชแบบปลอดภัยด้วยอัลกอริทึมทางคริปโตกราฟี (เราไม่จัดเก็บรหัสผ่านตัวจริง)</li>
              <li><strong>ข้อมูลโปรไฟล์และมีเดีย:</strong> รูปโปรไฟล์ (Avatar) และรูปหน้าปกโปรเจกต์ ที่ท่านอัปโหลด</li>
              <li><strong>ข้อมูลเนื้อหาการทำงาน:</strong> รายการบอร์ด การ์ดงาน เช็กลิสต์ บันทึกโน้ต ไดอารี่ และข้อความคอมเมนต์</li>
              <li><strong>ข้อมูลทางเทคนิค:</strong> ข้อมูลเซสชันการเข้าสู่ระบบ (Secure JWT Cookie) และที่อยู่ไอพี (IP Address) สำหรับการป้องกันการโจมตีและการจำกัดอัตราการเรียกใช้งาน (Rate Limiting)</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">3.</span> วัตถุประสงค์ในการเก็บรวบรวมและใช้ข้อมูล (Purposes of Processing)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>เพื่อให้บริการระบบจัดการงาน ปฏิทิน และการทำงานร่วมกันในทีมตามที่ท่านร้องขอ</li>
              <li>เพื่อยืนยันตัวตน ตรวจสอบสิทธิ์การเข้าถึง และรักษาความปลอดภัยของระบบ</li>
              <li>เพื่อส่งการแจ้งเตือนเกี่ยวกับงานหรือคำเชิญเข้าร่วมโปรเจกต์ผ่านทางอีเมล</li>
              <li>เพื่อป้องกันการทุจริต การสแปมบอท และการโจมตีระบบรักษาความปลอดภัย</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">4.</span> การเปิดเผยและการแบ่งปันข้อมูล (Data Sharing)
            </h2>
            <p>
              <strong>เราไม่มีนโยบายขาย ให้เช่า หรือเปิดเผยข้อมูลส่วนบุคคลของท่านให้แก่บุคคลที่สามเพื่อการโฆษณา</strong> การแบ่งปันข้อมูลจะมีขึ้นเฉพาะกับผู้ให้บริการโครงสร้างพื้นฐานที่จำเป็นต่อการทำงานของระบบเท่านั้น (เช่น ระบบฐานข้อมูล Supabase, คลาวด์สตอเรจ Cloudinary สำหรับรูปภาพ, และบริการส่งอีเมลที่ปลอดภัย)
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">5.</span> สิทธิของเจ้าของข้อมูลส่วนบุคคล (Your Rights)
            </h2>
            <p className="mb-2">ตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล ท่านมีสิทธิดังต่อไปนี้:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>สิทธิในการเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของท่าน</li>
              <li>สิทธิในการขอแก้ไขข้อมูลส่วนบุคคลให้ถูกต้อง เป็นปัจจุบัน และสมบูรณ์</li>
              <li>สิทธิในการขอลบหรือทำลายข้อมูลส่วนบุคคล (ท่านสามารถลบโปรเจกต์ บอร์ด หรือขอลบบัญชีผู้ใช้ได้)</li>
              <li>สิทธิในการเพิกถอนความยินยอมในการประมวลผลข้อมูล</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-cyan">6.</span> การรักษาความมั่นคงปลอดภัย (Data Security)
            </h2>
            <p>
              Retzlo ใช้มาตรการรักษาความปลอดภัยทางเทคนิคและการบริหารจัดการที่ได้มาตรฐาน เช่น การส่งผ่านข้อมูลด้วยการเข้ารหัส HTTPS/TLS, การแฮชรหัสผ่าน และการแยกฐานข้อมูลตามสิทธิ์การเข้าถึง เพื่อป้องกันไม่ให้ข้อมูลสูญหาย รั่วไหล หรือถูกเข้าถึงโดยมิชอบ
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Retzlo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-stone-300 underline">Terms of Service</Link>
            <Link href="/register" className="hover:text-stone-300 underline">Register</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
