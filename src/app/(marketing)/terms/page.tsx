import Link from "next/link";
import { ArrowLeft, ShieldCheck, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Retzlo",
  description: "Terms of Service and Acceptable Use Policy for Retzlo workspace."
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 rounded-full border border-dusk-amber/30 bg-dusk-amber/10 px-3 py-1 text-xs font-mono font-medium text-dusk-amber mb-3">
            <FileText className="h-3.5 w-3.5" />
            <span>Legal & Agreements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-stone-400">ข้อกำหนดและเงื่อนไขการใช้บริการ Retzlo (มีผลบังคับใช้ตั้งแต่วันที่ 20 กันยายน 2026)</p>
        </header>

        <article className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-stone-300">
          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">1.</span> การยอมรับข้อกำหนด (Acceptance of Terms)
            </h2>
            <p>
              ยินดีต้อนรับสู่ Retzlo (&quot;เรา&quot; หรือ &quot;ระบบ&quot;) การเข้าถึงหรือใช้งานเว็บไซต์และแอปพลิเคชัน Retzlo ถือว่าท่านได้อ่าน ทำความเข้าใจ และตกลงที่จะผูกพันตามข้อกำหนดการให้บริการนี้ หากท่านไม่เห็นด้วยกับข้อกำหนดใดๆ โปรดยุติการเข้าใช้งานระบบทันที
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">2.</span> บัญชีผู้ใช้และความปลอดภัย (User Account & Security)
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ท่านมีหน้าที่รักษาความลับของรหัสผ่านและข้อมูลเข้าสู่ระบบของตนเอง</li>
              <li>การกระทำใดๆ ที่เกิดขึ้นภายใต้บัญชีของท่านถือเป็นความรับผิดชอบของท่านโดยตรง</li>
              <li>หากพบการเข้าถึงโดยไม่ได้รับอนุญาต โปรดแจ้งผู้ดูแลระบบทันที</li>
              <li>หนึ่งบุคคลสามารถมีบัญชีผู้ใช้เพื่อการทำงานส่วนบุคคลหรือการทำงานร่วมกันในทีมได้ตามความเหมาะสม</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">3.</span> นโยบายการใช้งานที่ยอมรับได้ (Acceptable Use Policy)
            </h2>
            <p className="mb-2">ท่านตกลงที่จะไม่กระทำการใดๆ ดังต่อไปนี้:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>ส่งอีเมลสแปมหรือใช้ระบบส่งคำเชิญเพื่อรบกวนผู้อื่น (Email Bombing / Spamming)</li>
              <li>ใช้ระบบเพื่ออัปโหลดเนื้อหาที่ผิดกฎหมาย ละเมิดสิทธิ หรือมีมัลแวร์</li>
              <li>พยายามเจาะระบบ ขัดขวางการทำงาน หรือสร้างภาระเกินควรแก่ฐานข้อมูลและเซิร์ฟเวอร์ (DoS / Brute Force)</li>
              <li>คัดลอกหรือดัดแปลงซอฟต์แวร์ของ Retzlo โดยไม่ได้รับอนุญาต</li>
            </ul>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">4.</span> สิทธิและความเป็นเจ้าของในข้อมูล (User Content & Ownership)
            </h2>
            <p>
              ข้อมูลทั้งหมดที่ท่านสร้างขึ้นใน Retzlo เช่น บอร์ด งาน โน้ต และไดอารี่ ยังคงเป็นทรัพย์สินและสิทธิของท่าน เราไม่มีสิทธิ์ในการนำข้อมูลงานของท่านไปเผยแพร่หรือขายต่อ ยกเว้นการประมวลผลเพื่อการให้บริการตามหน้าที่ของระบบเท่านั้น
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">5.</span> ข้อจำกัดความรับผิดชอบ (Limitation of Liability)
            </h2>
            <p>
              Retzlo ให้บริการตามสภาพที่เป็นอยู่ (&quot;as is&quot; and &quot;as available&quot;) เรามุ่งมั่นพัฒนาให้ระบบมีความเสถียรและปลอดภัยสูงสุด อย่างไรก็ดี เราไม่สามารถรับประกันได้ว่าระบบจะปราศจากข้อผิดพลาดหรือการหยุดชะงักอย่างสมบูรณ์แบบในทุกกรณี ผู้ใช้ควรสำรองข้อมูลสำคัญเป็นระยะ
            </p>
          </section>

          <section className="lofi-panel rounded-2xl border border-white/10 p-6">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="text-dusk-lavender">6.</span> การติดต่อเรา (Contact Information)
            </h2>
            <p>
              หากท่านมีข้อสงสัยเกี่ยวกับข้อกำหนดการให้บริการนี้ สามารถติดต่อทีมงานผู้พัฒนาได้ทางช่องทางที่ระบุไว้ในหน้าหลักของ Retzlo
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Retzlo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-300 underline">Privacy Policy</Link>
            <Link href="/register" className="hover:text-stone-300 underline">Register</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
