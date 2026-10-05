# Theme System Audit & Extension Guide

อัปเดตล่าสุด: 2026-10-01

เอกสารนี้เป็นแหล่งอ้างอิงหลักสำหรับตรวจ แก้ และเพิ่มธีมของ Retzlo ให้ใช้ต่อเนื่องได้ทุกโมดูล ทุกหน้าจอ และทุกคอมโพเนนต์ใหม่

## สรุปผลตรวจ

- ปัจจุบันมีธีมสีจริง 2 แบบ: `dark` (Retro Lofi Indigo) และ `light` (Warm Paper) ส่วน `system` เป็นตัวเลือกให้ตามธีมของระบบปฏิบัติการ
- สาเหตุหลักที่สีหลุดซ้ำคือสีมาจากหลายแหล่งพร้อมกัน: CSS variables, Tailwind `dark:` classes, สีคงที่ในคอมโพเนนต์ และ CSS override ของ light mode ที่ใช้ `!important`
- พบปัญหาการแสดงผลตอนเปิดหน้า: ถ้าบันทึก preference เป็น `system` และระบบปฏิบัติการเป็น light สคริปต์ก่อน React จะใส่ `data-theme="system"` พร้อม class `.dark` ก่อนที่ `ThemeProvider` จะคำนวณเป็น light จึงอาจเห็น dark flash ชั่วคราว
- พบสีข้อความ error/success บางชนิดที่เลือกโทนสว่างสำหรับพื้นมืด แต่ไม่มีค่าคู่สำหรับพื้น light
- ตรวจ source `globals.css` ณ วันที่ตรวจ: 2,619 บรรทัด; ช่วง light mode มี selector mention ประมาณ 370 จุดและ `!important` 142 จุด; ทั้งไฟล์มี `!important` 169 จุด
- สี custom properties ประกาศไว้ 12 ตัว แต่ค้นพบการอ่านผ่าน `var(...)` เพียง 6 ตัว ได้แก่ `background`, `foreground`, `panel`, `paper`, `border`, `muted` อีก 6 ตัวที่ยังไม่พบผู้ใช้คือ `panel-strong`, `paper-strong`, `accent`, `accent-2`, `danger`, `success`
- ตรวจภาพบนเว็บจริงเพิ่ม: หน้า login, register, forgot password, reset password, accept invitation (กรณีไม่มี token), privacy และ terms ทั้งหมดใน dark mode. ภาพรวมสีสม่ำเสมอ ไม่พบสีหลุดชัดเจนในหน้าที่เปิดดู; หน้า register ต้องเลื่อนลงเพื่อดูท้ายฟอร์มใน viewport 1280x720
- หลังเข้าด้วย test session ตรวจภาพหน้า Projects, Board/card modal, Calendar, Diary, Notes, Members, Rewards, Settings และ Profile ใน light/dark แล้ว; พบสีผิดธีมที่ยืนยันจากภาพจริงใน Workspace banner, ตัวเลือก Workspace และปุ่มสถานะ Online (ระบุในตาราง)
- การดูหน้านี้ใช้ viewport desktop 1280x720; ยังไม่ได้ตรวจ mobile หรือทุก interaction state. ค่าธีม browser เดิมเป็น `system` และคืนกลับเป็น `system` หลังตรวจ light mode
- `/design-system` มี route ใน source แต่เว็บ production ตอบ 404; จึงยังตรวจภาพของหน้านี้บน deployment ไม่ได้
- ตรวจ source เพิ่มพบว่าคลาสสีแดง/เขียวอ่อนใน error/success feedback และสีข้อความขาวบาง interaction ไม่มี light-mode mapping เฉพาะ จึงเป็นจุดเสี่ยงเพิ่มจากรายการเดิม (รายละเอียดในตาราง)
- ตรวจ dev แบบ interactive เพิ่มทั้ง light/dark, desktop และ mobile: ยืนยัน auth copy จางบนการ์ด light, ErrorState/สีข้อความบนการ์ดตัวอย่างของ design-system จางใน light, และแถว logout สีแดงจาง; `/design-system` ใช้ตรวจ modal กับ success toast ได้ในเครื่อง
- ตรวจ responsive ที่ 390x844: หน้า project shell มีช่องว่างใหญ่ก่อน content และ hamburger เปิด backdrop แต่ sidebar ยังอยู่นอกจอ; หน้า Notes บีบ note card ใน layout 3 คอลัมน์จนข้อความตัดถี่
- ตรวจ local dev เพิ่ม: หน้า marketing ที่ยังเป็น dark scene ถูก global light remap ทำให้ข้อความรองมืดบนพื้นมืด; console มี hydration warning จาก style ดาวที่สุ่มด้วย `Math.random()`; sign-out callback ของ environment ชี้คนละพอร์ตกว่าที่ dev server ใช้
- ตรวจเมนู, filters, modal, card details, calendar views และ theme preference ระหว่างใช้จริงโดยไม่บันทึก/ลบ/สร้างข้อมูล; คืน theme preference เป็น `system` หลังตรวจ

## สถานะหลัง implementation — 2026-10-01

- แก้ first paint ของ `system` ด้วย resolver ร่วมกันใน bootstrap script และ `ThemeProvider`; root จะใช้เฉพาะ resolved `light` หรือ `dark` และมี unit tests ครอบคลุมค่าตั้งต้น/ระบบปฏิบัติการ
- เพิ่ม semantic tokens สำหรับสถานะ `danger`, `success`, `warning`, `info` รวมสี foreground บนปุ่ม danger; ย้าย auth feedback, shared button/modal/toast, entity state และ feedback ในหลายโมดูลมาใช้ token
- แก้ Workspace banner/switcher, profile status, auth copy, Notes default density, mobile sidebar selector, marketing star hydration และ Next/Image sizing/positioning ตาม findings ด้านล่าง
- หลังแก้ ตรวจภาพ local desktop 1280×720: Projects light/dark, Notes light/dark, Design System light (error/success/card samples, modal, toast), auth login light และ marketing light. ทดสอบ sign-out แล้วกลับ `/login` บน dev origin เดิมสำเร็จ. คืน theme preference เป็น `system`.
- ข้อจำกัด: รอบนี้ไม่ได้ปรับ browser เป็น 390px หลังแก้ drawer; โค้ด selector แก้แล้วและ desktop ตรวจแล้ว แต่ต้องทำ visual retest ที่ 390px/tablet. Production `/design-system` ยังคงตอบ 404 ในรอบ audit ก่อนหน้า.

## ระบบธีมปัจจุบัน

| ส่วน | ไฟล์ | หน้าที่/ข้อสังเกต |
|---|---|---|
| สคริปต์ก่อน render | `src/app/layout.tsx` | อ่าน `retzlo-theme`, resolve `system` เป็น `light`/`dark` และตั้ง root attribute/class ให้ตรงก่อน React hydrate |
| Provider และค่าที่บันทึก | `src/components/theme/theme-provider.tsx`, `src/lib/theme/resolve-theme.ts` | ใช้ resolver เดียวกับ bootstrap; รองรับ `light`, `dark`, `system`; preference เก็บใน browser `localStorage` ไม่ได้เก็บในฐานข้อมูล |
| ตัวเลือกธีม | `src/components/theme/theme-toggle.tsx` | มี `icon`, `dropdown`, `settings`; อยู่ในเมนูโปรไฟล์และ Project Settings |
| กลไก `dark:` | `tailwind.config.ts` | ใช้ทั้ง `.dark` และ `[data-theme="dark"]`; provider และสคริปต์เริ่มต้นต้องรักษาสองค่านี้ให้ตรงกัน |
| สีพื้นฐานและ override | `src/app/globals.css`, `tailwind.config.ts` | ประกาศ palette variables และ semantic utilities สำหรับ foreground/surface/border/status; ยังมี legacy light-mode compatibility rules จำนวนมากในไฟล์เดียว |
| สีของการ์ด | `src/lib/theme/card-colors.ts` | มี light/dark class คู่สำหรับสีการ์ด เป็นตัวอย่างที่ดีเรื่องความตั้งใจของสองธีม แต่ยังมี hex คงที่ใน mapping |
| สีของ state/entity | `src/lib/theme/ui-variants.ts` | กำหนดสีของ card tone, status และ empty/error/warning/success/info โดยใช้ foreground/surface/border tokens ร่วมกัน |
| Status ของการ์ด | `src/lib/kanban/status.ts` | มี class คู่ light/dark สำหรับสถานะ Kanban; ให้แยกจากสี accent ของแบรนด์ |
| ตัวอย่าง test | `src/components/theme/theme.test.ts` | ตรวจสัญญาจากข้อความใน source; ยังไม่ยืนยัน contrast หรือภาพจริงของทุกหน้า |

การตั้งค่าปัจจุบันมีผลกับ browser ที่เลือกธีมไว้ ไม่ได้ sync ตามบัญชีผู้ใช้ข้ามอุปกรณ์

## ผลตรวจและรายการความเสี่ยง

ระดับหมายถึงความสำคัญต่อการแก้สถาปัตยกรรมธีม ไม่ใช่จำนวนผู้ใช้ที่ได้รับผลกระทบ

| ระดับ | จุดที่พบ | หลักฐานและผลที่อาจเกิด | วิธีจัดการ |
|---|---|---|---|
| P0 | First paint ของ `system` อาจเป็น dark ผิด | `src/app/layout.tsx:48` ใช้ค่าจาก storage ตรง ๆ; `system` ถูกตั้งเป็น data-theme literal และเลือก `.dark` จนกว่า provider จะ hydrate | ทำ resolver ที่ใช้ทั้ง bootstrap script และ provider; ตั้ง root เป็น resolved `light`/`dark` เท่านั้น; เพิ่มกรณี test ของ `light`, `dark`, `system` บน OS ทั้งสองแบบ |
| P1 | Global override ทำให้ cascade เปราะ | `src/app/globals.css:1860` เป็นต้นไป remap สี `text-stone-*`, `bg-ink-*`, `bg-white/*`, fields, cards และ Radix surfaces ด้วย selector กว้างและ `!important`; การแก้สีหนึ่งอาจกระทบคอมโพเนนต์ที่ใช้ class เดียวกันแต่มีความหมายต่างกัน | ย้ายผู้ใช้ไป semantic tokens และ variant ของ component ทีละกลุ่ม; ลบ compatibility selector เมื่อไม่มีผู้ใช้เหลือ ห้ามเพิ่ม mapping ใหม่เป็นวิธีแก้ถาวร |
| P1 | Token ยังไม่ครอบคลุม UI | ตัวแปรมีอยู่ใน `src/app/globals.css:5` และ `:root[data-theme="light"]` แต่ component จำนวนมากอิง Tailwind palette คงที่; `tailwind.config.ts:10` กำหนดสี `ink`, `dusk`, `lofi` เป็น hex | กำหนด palette contract กลางและผูก Tailwind utilities เข้ากับ CSS variables; ให้ component ใช้ชื่อบทบาท เช่น canvas/surface/text/border/status |
| P1 | Workspace banner ในหน้า Projects เป็นแผงขาวใน dark mode | ยืนยันจากภาพ production: `src/components/project/projects-dashboard.tsx:1138` ตั้ง `bg-white` และเพิ่ม `dark:bg-gradient-to-r` ซึ่งเปลี่ยนเฉพาะภาพ gradient ไม่ได้เปลี่ยนพื้นหลังสีขาว; title ใช้ `dark:text-white` จึงมีข้อความขาวบนพื้นขาวและทั้งแผงตัดกับ dark shell | เปลี่ยน dark background color ให้เป็นพื้นผิว dark จริง พร้อมคง gradient เป็นชั้นตกแต่ง; ตรวจ title, description, stats และ action บนสองธีม |
| P1 | ชื่อ Workspace บนตัวสลับอ่านไม่ออกใน light mode | ยืนยันจากภาพ production: `src/components/project/projects-dashboard.tsx:794` บังคับ `text-white` แต่ไม่มีค่า light/dark แยก; ปุ่ม trigger เปลี่ยนเป็นพื้นสว่างใน light mode ทำให้ชื่อสีขาวกลืนพื้น | ใช้ foreground token ของ trigger และ hover state; ตรวจ dropdown ที่เปิดแยกจาก trigger ด้วย |
| P1 | สถานะ Online ใน Profile สีอ่อนเกินไปใน light mode | ยืนยันจากภาพ production: `src/components/profile/profile-form.tsx:24` ใช้ `text-emerald-300` บน `bg-emerald-400/10`; ข้อความ Online ในปุ่มที่เลือกมี contrast ต่ำบนพื้น light | ให้ status variant เลือกคู่สี foreground/surface/border แยกตามธีม; ตรวจ Online, Busy และ Offline |
| P1 | Error/success state อาจอ่านยากใน light mode | `src/lib/theme/ui-variants.ts:158-171` ใช้ `text-red-100`, `text-red-200/80`, `text-emerald-100`, `text-emerald-200/80`; `src/components/ui/state.tsx` ใช้ชุดนี้ทั้ง `ErrorState` และ state ของหน้าอื่น; ยังไม่มีคู่สี ink สำหรับพื้นอ่อน | กำหนดคู่ `foreground`, `soft surface`, `border` สำหรับ success/error และ state อื่นใน semantic state palette |
| P1 | Feedback สีแดง/เขียวไม่ได้ใช้สีข้อความตามธีม | `src/components/ui/badge.tsx:16`, `src/components/profile/profile-form.tsx:149`, `src/components/auth/forgot-password-form.tsx:40`, `src/components/auth/reset-password-form.tsx:98,126` ใช้ `text-red-*`/`text-emerald-*`; ค้นใน `globals.css` ไม่พบ light override ของสองกลุ่มสีนี้ จึงเสี่ยงข้อความอ่อนบนพื้นอ่อนในหน้า light. หน้า dark ที่มองเห็นจริงยังอ่านได้ | ย้าย feedback ไป semantic status variants; ตรวจทั้ง badge, inline form error, profile success, toast และ shared states บน light |
| P1 | Auth scene ใช้ข้อความสีอ่อนคงที่ใน light mode | ยืนยันจากภาพ local dev: หัวข้อ/คำอธิบายใน `src/components/auth/auth-scene.tsx:128-133` เป็นสี `#f5efe6` บน auth card ที่กลายเป็นพื้นสว่าง; login, register, forgot/reset และ accept invitation (กรณีไม่มี token) จึงมีหัวข้อกับคำอธิบายจางมากใน light. Label/ข้อความช่วยใน login/register และ footer บางหน้าใช้สีอ่อนคงที่ต่อเนื่อง | ให้ auth scene และ form เลือก foreground ตาม surface; ตรวจทุกห้า route ใน light รวม error, focus, footer และ register ตอน scroll |
| P1 | Error/success samples และ entity-card captions จางใน light | ยืนยันจากภาพ local `/design-system` light: `src/lib/theme/ui-variants.ts:158-171` ใช้ foreground แดง/เขียว pastel สำหรับ state panel; หัวข้อ/ข้อความของ ErrorState อ่านยากบนพื้น error อ่อน และ success/card-tone samples ใช้ข้อความ pastel บนพื้น pastel | ทำ state variants แบบ foreground/surface/border คู่กัน และปรับ palette ของข้อมูลแต่ละ tone ให้ข้อความกับ icon ผ่าน contrast ใน light/dark |
| P2 | Hover บางปุ่มอาจกลายเป็นข้อความขาวบนพื้นอ่อน | `src/components/diary/diary-checklist.tsx:145-163` และ `src/components/ai/ai-breakdown-modal.tsx:365,385` ใช้ `hover:bg-white/10 hover:text-white`; light-mode CSS remap พื้น `bg-white/*` แต่ไม่มี `hover:text-white` คู่กัน | กำหนด hover foreground/background เป็นคู่ใน shared button variants; ตรวจเมาส์และ keyboard focus ใน light mode |
| P2 | Error toast ยังล็อกพื้นเข้มไว้ | `src/components/ui/toast.tsx:64-67` ใช้ `bg-red-950/80` คู่ `text-red-200`; บน light theme toast ยังคง dark red surface ขณะที่ toast ประเภทอื่นใช้ `bg-ink-900/90` ซึ่งถูก remap แยกต่างหาก สีอาจตัดกันได้แต่ไม่เป็น surface language เดียวกัน | กำหนด surface และ foreground ของ toast ทุกชนิดผ่าน status tokens และให้ครบทั้งสอง palette |
| P1 | ตัวเลือกธีมพึ่ง global remap | `theme-toggle.tsx` ใช้ `text-stone-400`, `bg-white/*`, `border-white/*` ใน dropdown/settings โดยไม่มี light variant เฉพาะ จึงดูถูกต้องได้เพราะ override ปัจจุบัน แต่เสี่ยงเมื่อเพิ่มธีม/ลบ override | ให้ variants ทั้งสามใช้ shared surface/control tokens โดยตรง แล้วตรวจเมนูโปรไฟล์กับ Project Settings ทุกธีม |
| P2 | การ์ด/สถานะมีแผนที่สีหลายชุด | `card-colors.ts`, `ui-variants.ts`, `lib/kanban/status.ts` มีแนวทางแยกกัน; สีของ `CardColor` เป็นสีของข้อมูล/การเลือกผู้ใช้ ไม่ใช่ชื่อธีมของแอป | คง enum ที่บันทึกในข้อมูล; แยกความหมาย semantic ออกจาก palette presentation และรวมกติกาไว้ที่ theme mapping |
| P2 | หน้า marketing เป็น palette แยก | `src/app/(marketing)/page.tsx` มี hex literals จำนวนมากและไม่มี Tailwind `dark:` variant; หน้าแรกที่ตรวจจริงดูเป็น dark scene โดยตั้งใจ | ลงทะเบียนเป็น `dark-only brand scene` หากตั้งใจคงเดิม; หากต้องการรองรับ light ให้เพิ่มเป็นงานแยก ไม่ให้ global remap เปลี่ยน artwork โดยไม่ตั้งใจ |
| P2 | ยังไม่มีทางเพิ่มสีธีมที่สามแบบครบวงจร | type ของ Provider จำกัดที่ `light | dark | system`; startup script, toggle, Tailwind และ CSS ต่างต้องแก้แยกกัน | แยก `ThemePreference` ออกจาก `ResolvedThemeId`; เพิ่ม palette ผ่าน registry/attribute และทดสอบเส้นทางเริ่มต้นเดียวกันทุกธีม |
| P2 | test ปัจจุบันยืนยัน source contract มากกว่าภาพจริง | `theme.test.ts` ตรวจ string ของ CSS/classes และตำแหน่ง toggle ไม่ได้จับสีตัดกันไม่พอ, popover ที่หลุดธีม หรือ FOUC | เพิ่ม visual review/ภาพอ้างอิงของหน้าและ state สำคัญ เมื่อชุดทดสอบ browser พร้อมใช้งาน |

รายการในตารางเป็น findings จากรอบตรวจเดิม; สถานะ implementation ปัจจุบันอยู่ใน change log วันที่ 2026-10-01 ด้านล่าง. Semantic migration ยังเป็นแบบค่อยเป็นค่อยไปและไม่ได้แทนที่ compatibility rules ทั้งหมด.

### ผล interactive audit ใน local dev ที่ไม่ใช่บัคสี

รายการเหล่านี้พบระหว่างทดสอบจริงและควรแยกเป็นงานแก้ layout/runtime/config:

| ระดับ | จุดที่พบ | หลักฐานจาก dev | แนวทางถัดไป |
|---|---|---|---|
| P1 | Mobile project shell มีช่องว่างด้านบนและ sidebar เปิดไม่ขึ้น | ที่ viewport 390x844, content ของ board เริ่มราว y=444; กด hamburger แล้ว backdrop แสดง แต่ `aside` ยัง translate ออกนอกจอ. ใน `src/components/project/project-shell.tsx` peer input, backdrop และ aside อยู่คนละระดับของ DOM | แก้ nested selector และจัด grid row placement; desktop ตรวจหลังแก้แล้ว; ตรวจ 390px, breakpoint tablet และ keyboard close/focus ซ้ำ |
| P2 | Note card แคบผิดสัดส่วนใน Notes | ภาพ local light/dark เดิมแสดง note card กว้างเพียงประมาณ 78px ในพื้นที่ board 3 คอลัมน์ ทำให้เนื้อหาห่อบรรทัดถี่/ตัด | เปลี่ยนค่าเริ่มต้นเป็น 2 คอลัมน์และเพิ่มพื้นที่ note board ที่ breakpoint `xl`; ตรวจภาพ desktop หลังแก้แล้ว; ยังต้องตรวจ mobile |
| P2 | Hydration warning บนหน้าแรก | dev console เดิมแสดง `Prop style did not match` สำหรับจุดดาวที่สุ่ม style ด้วย `Math.random()` | เปลี่ยนตำแหน่ง/เวลา animation ให้ deterministic; reload หน้า marketing หลังแก้แล้วไม่พบ warning ใน dev server output |
| P2 | Next/Image warnings บนหน้าแรก | console เดิมเตือนภาพ sticker/logo ที่ใช้ `fill` ขาด `sizes`; sticker บางตำแหน่งมี parent เป็น `position: static` | เติม `sizes` และกำหนด wrapper เป็น `relative`; ตรวจ source หลังแก้แล้ว |
| P2 | Sign-out callback พาออกนอก dev port | local dev server เดิมรันที่ 3000 แต่ sign-out redirect ไป 3001; ค่า callback มาจาก ignored local environment configuration | ปรับ local base port แล้วทดสอบ sign-out; รอบนี้กลับหน้า login ที่ dev origin เดิมได้; ไม่บันทึก URL หรือ secret ในเอกสาร |

Marketing home คงฉากหลังแบบ dark brand scene; ข้อความประกอบที่เคยถูก global-remap ถูกเปลี่ยนเป็นค่าสีคงที่สำหรับ artwork/scene นี้ และภาพ local light หลังแก้ยังคงอ่านได้. จัดเป็น intentional fixed palette; เมื่อปรับ scene ให้รองรับ light อย่างเป็นทางการ ให้นำข้อความเหล่านี้กลับไป semantic tokens.

## แผนปรับธีม

ทำตามลำดับนี้เพื่อลดการแก้ซ้ำและไม่เปลี่ยนสีทั้งเว็บรวดเดียว

### ระยะ 0 — แก้การเริ่มธีมให้ตรงกัน

ไฟล์หลัก: `src/app/layout.tsx`, `src/components/theme/theme-provider.tsx`, `src/components/theme/theme.test.ts`

1. สร้างฟังก์ชันแนวคิดเดียว `resolveTheme(preference, systemPreference)` ที่คืนค่า palette id จริง `light` หรือ `dark`
2. ใช้กติกาเดียวกันในสคริปต์ `<head>` และ provider; ค่า `system` ต้องอ่าน `prefers-color-scheme` ก่อนตั้ง root
3. ปฏิเสธค่า localStorage ที่ไม่รู้จักและ fallback ไป system
4. ทดสอบ reload โดยจำลอง preference `system` ทั้งบน OS light และ dark เพื่อยืนยันว่า first paint ไม่กลับสีชั่วคราว

### ระยะ 1 — กำหนด Semantic Token Contract

ไฟล์หลัก: `src/app/globals.css`, `tailwind.config.ts`, `src/lib/theme/`

เพิ่ม/จัดมาตรฐาน token ตามหน้าที่ ไม่ตามชื่อสี:

| กลุ่ม | บทบาทที่ต้องมี |
|---|---|
| Canvas และพื้นผิว | page canvas, surface, raised surface, inset surface, overlay/backdrop |
| ข้อความ | primary, secondary, muted, inverse/on-accent |
| เส้นและ focus | border default/strong, divider, focus ring |
| การกระทำ | primary action, secondary action, selected/hover, disabled |
| สถานะ | info/success/warning/danger: foreground, surface, border |
| การตกแต่ง | brand accent, glow, shadow, texture (ระบุว่าเป็น decorative เท่านั้น) |

ใส่ค่าของทุกบทบาทใน palette `dark` และ `light` ก่อน จากนั้นให้ Tailwind semantic utilities อ่าน CSS variables แทน hex ที่ฝังใน config. คง alias เดิมชั่วคราวระหว่างย้ายผู้ใช้ แล้วทำ deprecate/remove เป็นขั้นตอน

กฎสี:

- สีของ UI ใช้ token ตามบทบาท ไม่ใช้ `stone-100` หรือ `white` แทนคำว่า primary text โดยอัตโนมัติ
- สี status ต้องมีสีข้อความที่อ่านได้บน surface ของทั้งสองธีม ไม่ยืม pastel สว่างของ dark mode มาใช้ตรง ๆ
- สีการ์ด/คอลัมน์/priority ที่เป็นสีของข้อมูลให้มี mapping แยกต่างหาก ห้ามเปลี่ยนความหมายข้อมูลเมื่อเปลี่ยนธีม
- hex/RGB คงที่อนุญาตสำหรับโลโก้ ภาพประกอบ และ artwork ที่ตั้งใจล็อก palette เท่านั้น พร้อมใส่ข้อยกเว้นใน matrix
- ห้ามเพิ่ม global `[data-theme="light"] .utility-class { ... !important }` เพื่อซ่อมคอมโพเนนต์ใหม่; แก้ที่ token หรือ variant ของ component ที่เป็นเจ้าของสี

### ระยะ 2 — ย้าย Shared UI Primitives

ทำก่อนหน้าเฉพาะเพราะส่งผลต่อหลายโมดูลและเป็นจุดที่สีมักหลุด:

- `src/components/ui/button.tsx`, `input.tsx`, `textarea` และ native `select`
- `select.tsx`, `dropdown-menu.tsx`, `popover.tsx`, `tooltip.tsx`
- `dialog`/`app-modal`, tabs, segmented controls, checkbox/switch
- `badge.tsx`, `state.tsx`, `entity-card.tsx`, `skeleton.tsx`, `toast.tsx`
- เมนูโปรไฟล์, theme toggle, modal backdrop และ portal/popover ที่ render นอก DOM subtree

แต่ละ primitive ต้องกำหนด surface, border, text, hover, focus, selected, disabled และ error อย่างชัดเจน ไม่พึ่ง global class remapping

### ระยะ 3 — ย้าย Shell และหน้าหลักตามลำดับ

1. App shell, sidebar, topbar, project switcher, profile menu
2. `/projects`, dashboard cards, loading/error states
3. `/project/[id]/board`: board canvas, columns, cards, card modal, pickers, badges, filters, drag overlay
4. `/project/[id]/calendar`: calendar cells, selected day, today, events, filters, upcoming list
5. `/project/[id]/notes` และ note folders/stickers
6. `/project/[id]/diary` และ diary hub
7. `/project/[id]/members`, rewards, settings และ profile
8. auth pages (`login`, `register`, `forgot-password`, `reset-password`, `accept-invitation`)
9. marketing/legal pages: คง dark-only โดยบันทึกเป็น exception หรือย้ายเข้า token ตามข้อกำหนดผลิตภัณฑ์

### ระยะ 4 — รวม Color Variants ของข้อมูล

ไฟล์หลัก: `src/lib/theme/card-colors.ts`, `src/lib/theme/ui-variants.ts`, `src/lib/kanban/status.ts`, `src/lib/kanban/column-settings.ts`

- ทำ mapping กลางสำหรับ color id เดิมให้คืน semantic class/token ที่ใช้ได้ทุกธีม
- แยก `CardColor`, `ColumnTheme`, `CardStatus`, feedback state และ brand accent ออกจากกัน
- รักษาค่า enum ที่ฐานข้อมูลใช้อยู่; การเปลี่ยนหน้าตาไม่ควรต้อง migrate ข้อมูล
- ตรวจ text contrast สำหรับ title, secondary label, icon และ border ของทุกสีบนทั้ง light/dark

### ระยะ 5 — เอา Compatibility Overrides ออก

ไฟล์หลัก: `src/app/globals.css`

หลังแต่ละกลุ่มย้ายไป tokens ให้ค้นหาผู้ใช้ของ selector ที่เกี่ยวข้องด้วย `rg` แล้วค่อยลบกฎ `!important` ที่ไม่จำเป็น ห้ามลบเป็นก้อน เพราะ selector บางตัวอาจยังใช้ในหน้า/portal ที่ไม่ได้ตรวจ

เป้าหมายคือให้ CSS ส่วน theme กำหนด palette/token และให้ component กำหนดโครงสร้าง/สถานะของตัวเอง ไม่ให้มี mapping ระดับ global สำหรับทุก `bg-ink-*`, `bg-white/*` หรือ `text-stone-*`

### ระยะ 6 — ตรวจภาพจริงทุกธีม

สำหรับแต่ละแถวใน coverage matrix ให้ตรวจอย่างน้อย:

- หน้าเริ่มต้น, content เยอะ/ยาว, loading, empty, error, success
- hover, focus ด้วย keyboard, selected, disabled, active และ destructive
- popover, dropdown, tooltip, modal/portal และ native inputs
- desktop และ mobile; ต้องไม่มี horizontal overflow และสี text/icon/border ยังอ่านออก
- preference: light, dark, system + OS light/dark; reload และ navigation ภายใน
- contrast ของข้อความหลัก/รองและ status อย่างน้อยตาม WCAG AA สำหรับข้อความปกติเมื่อทำ visual QA

การทำ screenshot review ให้ลงวันที่ หน้าที่ และ theme ที่ตรวจใน change log; อย่าบันทึกว่า “ตรวจครบ” หากหน้าใดไม่ได้เปิดดูจริง

## Coverage Matrix ปัจจุบัน

สถานะ: `ตรวจ source` หมายถึงไล่เส้นทางและสีในโค้ดแล้ว; `ตรวจภาพ` หมายถึงเห็นหน้า render จริงใน browser

| กลุ่มหน้าหรือ UI | เส้นทาง/จุดเริ่ม | สถานะตรวจรอบนี้ | ประเด็นที่จะเก็บเมื่อย้ายธีม |
|---|---|---|---|
| Marketing home | `src/app/(marketing)/page.tsx` | ตรวจภาพ local light หลัง implementation; ตรวจ source และ dev server output | ใช้ fixed dark-scene foreground; stars deterministic; `fill` images มี `sizes` และ relative wrappers; production ยังเป็น dark brand scene โดยตั้งใจ |
| Privacy / Terms | `src/app/(marketing)/privacy`, `terms` | ตรวจภาพ dark บนเว็บจริงและ light ใน local dev; ตรวจ source | พื้นและ legal panels อ่านได้; ยังคง dark brand palette ใน light preference; ตรวจ link/selection เพิ่มเมื่อมีการย้าย token |
| Auth | login, register, forgot/reset password, accept invitation | login ตรวจภาพ local light หลัง implementation; source review สำหรับ forms, all invitation states และอีก 4 routes | หัวข้อ/description/labels/forms/error/success ใช้ semantic tokens; valid invitation states ยังต้องตรวจ visual ด้วย test token |
| Projects dashboard | `src/app/(dashboard)/projects` | ตรวจภาพ light/dark local desktop หลัง implementation; mobile light 390x844 จากรอบ audit ก่อนแก้ | Workspace hero ใช้ panel token และชื่อ switcher foreground token; mobile มี horizontal scroller ภายใน shortcut bar; retest mobile หลังแก้คงเหลือ |
| Profile | `src/app/(dashboard)/profile` | ตรวจภาพ light/dark ในรอบ audit ก่อนแก้; source review รอบ implementation; mobile light 390x844 เดิม | Online/Busy/Offline และ status feedback เปลี่ยนเป็น semantic foreground/surface/border; ต้องตรวจ visual post-fix และ mobile ซ้ำ |
| Project shell | `src/app/(dashboard)/project/[id]/layout.tsx`, `src/components/project/` | ตรวจ light/dark desktop หลัง implementation; mobile light 390x844 ในรอบ audit ก่อนแก้ | แก้ drawer selector และ desktop row placement; desktop ยืนยัน sidebar/content อยู่ตำแหน่งถูก; ตรวจ drawer ที่ 390px/tablet และ keyboard focus หลังแก้ |
| Kanban board | `src/app/(dashboard)/project/[id]/board`, `src/components/kanban/` | ตรวจภาพ light/dark desktop; mobile light 390x844 และ dark board shell; card details/notes rail light | document ไม่มี horizontal overflow ที่ 390px; card/status colors ดูสม่ำเสมอ; ตรวจ modal/overlay ใน dark และ error/success state เพิ่ม |
| Board template picker | `src/components/kanban/board-template-picker.tsx`, `src/components/kanban/board-sidebar-dropdown.tsx`, `src/components/project/project-boards-manager.tsx`, `public/board-templates/` | ตรวจ source; ยังไม่ได้ตรวจภาพ light/dark/system หรือ mobile | Modal จำกัดความกว้างและ scroll ใน viewport; การ์ด template ใช้ภาพประกอบพื้นโปร่งใส; preview ของ template 5 ขั้นเรียงเป็น flow แนวนอนและ scroll ในจอแคบ; ตรวจ focus, mobile overflow, และ contrast ภาพบนแต่ละธีม |
| Board selector in project sidebar | `src/components/kanban/board-sidebar-dropdown.tsx`, `src/components/project/project-sortable-nav.tsx`, `src/components/project/project-shell.tsx` | ตรวจ source และ private-board access filter; ยังไม่ได้ตรวจภาพ light/dark/system หรือ mobile หลังย้ายตำแหน่ง | รายการบอร์ดและ actions อยู่ใน dropdown ของเมนู Boards; uses shared dropdown primitives and semantic active state; ตรวจ focus, menu clipping, compact sidebar, และ mobile drawer |
| Calendar | `src/app/(dashboard)/project/[id]/calendar` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; day grid, today/selected; ตรวจ events/popovers เพิ่มเมื่อมีรายการจริง |
| Diary | `src/app/(dashboard)/project/[id]/diary`, `src/components/diary/`, `hub/` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; rewards, recurrence และ states ดูสม่ำเสมอในภาพที่เห็น |
| Notes | `src/app/(dashboard)/project/[id]/notes`, `src/components/notes/` | ตรวจภาพ light/dark desktop หลัง implementation; mobile light 390x844 ในรอบ audit ก่อนแก้ | ค่าเริ่มต้นเป็น 2 columns และ center board กว้างขึ้นที่ `xl`; card preview อ่านง่ายขึ้นใน desktop; retest mobile หลังแก้คงเหลือ |
| Members | `src/app/(dashboard)/project/[id]/members` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; avatar, role/status labels และ invitation surface ดูสม่ำเสมอ |
| Rewards | project rewards routes, `src/components/project/rewards-store.tsx` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; reward cards, coin balance, empty states ดูสม่ำเสมอ |
| Settings | `src/app/(dashboard)/project/[id]/settings` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; theme controls, forms, feature panels ดูสม่ำเสมอในภาพที่เห็น |
| AI Chat widget | `src/components/ai/ai-chat-widget.tsx` | ตรวจภาพ local 1280×720: Light side panel; Dark float และ side panel; ตรวจ source ของร่างสร้างการ์ดและ ConfirmModal | Launcher, welcome/assistant bubble, quick prompts, input และ controls อ่านได้ทั้งสองธีม; UI ยืนยันสร้างการ์ดใช้ semantic tokens แต่ยังไม่ได้เปิดภาพ state นี้; context/credit banner ยังไม่ยืนยันด้วยภาพเพราะ local DB ใช้งานไม่ได้; mobile/focus ยังเหลือ |
| Shared overlay/status UI | `src/components/ui/` | ตรวจ source; Design System light visual หลัง implementation สำหรับ error/success/card samples, modal, toast; profile menu light/dark | Status tokens ใช้กับ shared states, Button, ConfirmModal และ toast; tooltip, keyboard focus, skeleton และทุก destructive state ยังต้องไล่ visual เพิ่ม |
| Card attributes edit modal | `src/components/kanban/card-attributes-edit-modal.tsx`, `src/components/kanban/card-modal.tsx` | ตรวจ source, vitest unit tests, tsc, lint, และ build ผ่าน; รองรับ 3 tabs (Status, Priority, Story Points) | ใช้ semantic modal tokens, retro lofi color swatches, ConfirmModal, และ responsive tabs |
| โมดูล/หน้าที่เพิ่มในอนาคต | เพิ่ม pathจริงเมื่อสร้าง | ยังไม่มี | ต้องเพิ่มแถวก่อนปิดงาน feature |

## วิธีบันทึกเมื่อเพิ่มหน้า/ส่วน UI ใหม่

ทุกครั้งที่เพิ่ม route, module หรือส่วน UI ขนาดใหญ่:

1. เพิ่มชื่อและ path ใน Coverage Matrix ทันที แม้ยังไม่เริ่มรองรับทุกธีม
2. ระบุว่าใช้ shared token/component ใด และมี color variant เฉพาะหรือไม่
3. จดสถานะตรวจแยก `source`, `visual light`, `visual dark`, `visual system`, `mobile`
4. ถ้าส่วนนี้ล็อกสีเพื่อแบรนด์/ภาพประกอบ ให้เพิ่มเหตุผลในรายการ exception
5. เพิ่มรายการตาม template ใน Change Log ด้านล่าง โดยไม่ลบประวัติเก่า

Template:

```md
### YYYY-MM-DD — ชื่อหน้า/ส่วน
- Added/changed: `route`, `component`, `file`
- Tokens/variants: `token names` หรือ `intentional fixed palette + reason`
- Reviewed: source / visual light / visual dark / visual system / mobile
- Follow-ups: รายการที่ยังไม่ตรวจหรือบัคที่พบ
```

## Change Log

### 2026-10-01 — ตรวจระบบธีมและวางแผนการย้าย
- Added: inventory ของหน้าและ component ที่ต้องตามธีม; บันทึกแนวทางแก้ first paint ของ `system`, token coverage, contrast feedback states และ global override debt.
- Visual review: หน้า marketing home ใน dark mode เท่านั้น. หน้า workspace ที่ต้อง sign in ยังตรวจจาก source; ต้องกลับมาตรวจภาพ light/dark เมื่อมี session ทดสอบ.
- Files: `AGENTS.md`, `docs/design.md`, `docs/theme-system.md`, `docs/agent-notes/2026-10-01-theme-system-audit.md`.
- Follow-ups: ทำ resolver สำหรับ `system`; สร้าง semantic token contract; ย้าย shared primitives แล้วค่อยย้ายหน้าตาม matrix.

### 2026-10-01 — ตรวจ route และสีทั้งเว็บเพิ่มเติม
- Visual review บน production ใน dark: login, register, forgot password, reset password, accept invitation (ไม่มี invitation token), privacy และ terms; ไม่พบสีผิดธีมชัดเจนในหน้าที่เห็น. หน้า `/projects` redirect ไป login เพราะไม่มี session; ไม่ได้เปิดข้อมูลผู้ใช้หรือส่งฟอร์ม.
- Source review: พบ status red/green ที่ไม่มี light foreground mapping, ปุ่ม hover บางจุดจับคู่ `hover:text-white` กับพื้น `hover:bg-white/*`, และ error toast ที่ใช้พื้นสีเข้มเฉพาะ; อ้างอิงในตาราง Findings.
- Route check: `/design-system` ตอบ 404 บน production แม้มีหน้าใน source. Dashboard, board, calendar, diary, notes, members, rewards, settings, profile และ shared overlays ยังต้องตรวจภาพด้วย session ใน light/dark.
- Files: `docs/theme-system.md`, `docs/agent-notes/2026-10-01-full-theme-sweep.md`.
- Follow-ups: ตรวจ signed-in screens และ light theme; ตรวจ/จัดการ route ของ design-system preview; ย้าย error/success/hover/toast colors ไป semantic variants.

### 2026-10-01 — ตรวจหน้าภายในด้วย test session
- Visual review: Projects, Board, Calendar, Diary, Notes, Members, Rewards, Settings และ Profile ใน light/dark ที่ viewport desktop 1280x720; เปิดดู card details และ board notes rail ใน light. คืน preference กลับเป็น `system` หลังตรวจ.
- Confirmed color bugs: Workspace hero เป็นพื้นขาวใน dark; ชื่อ Workspace บน switcher เป็นสีขาวบนพื้น light; ปุ่ม Online ใน Profile ใช้เขียวอ่อนบนพื้นเขียวจางใน light. เพิ่มหลักฐานและเจ้าของ component ในตาราง Findings.
- Other route state: `/design-system` ยังคงตอบ 404 บน production. ยังไม่ได้ตรวจ mobile และทุก hover/focus/error state.
- Files: `docs/theme-system.md`, `docs/agent-notes/2026-10-01-full-theme-sweep.md`.
- Follow-ups: แก้สามจุดที่ยืนยันจากภาพ; ปิดงาน status feedback ที่ยังเป็น source-risk; ตรวจ mobile และ overlays ที่เหลือ.

### 2026-10-01 — interactive audit ด้วย local dev
- Visual review: รัน dev ที่ port 3000; เทียบ light/dark บน auth และหน้าภายใน desktop; ทดสอบ viewport 390x844; เปิด board sort/filter, Board Settings, card details, calendar week/month/filter, profile state, AppModal และ success toast โดยไม่บันทึก/ลบข้อมูล. ตรวจ `system` preference และคืนกลับเป็น `system`.
- Confirmed theme bugs: AuthScene/form copy จางบนพื้น light; ErrorState, success/error sample และ captions ของ card tones มีข้อความ pastel บนพื้น light; logout action และ Profile Online มี contrast ต่ำ; marketing hero ใน preference light มีข้อความรองมืดบน scene มืด.
- Confirmed responsive/runtime/config follow-ups: mobile project shell ช่องว่างด้านบนและ sidebar drawer ไม่เลื่อนเข้า; Notes card แคบ; marketing star style hydration warning และ Next/Image warnings; local sign-out redirect ใช้ port ไม่ตรงกับ dev server.
- Files: `docs/theme-system.md`, `docs/agent-notes/2026-10-01-full-theme-sweep.md`.
- Database/schema changes: ไม่มี; ไม่มีการสร้าง แก้ไข ลบ หรือส่งข้อมูลจาก UI.
- Follow-ups: แก้ contrast bugs แยกเป็น component groups; แก้ mobile shell และ Notes grid; ทำ hydration/Image warning ให้หาย; ปรับ dev callback URL โดยไม่ commit ค่าลับ; รัน lint/build/Prisma validation หลังอัปเดตเอกสาร.

### 2026-10-01 — mobile route pass เพิ่มเติม
- Visual review: ตรวจ Projects, Profile, workspace rewards และ routes Board, Calendar, Diary, Notes, Members, Rewards, Settings ที่ 390x844 ใน light mode; ทุก route ที่ตรวจไม่พบ document-level horizontal overflow. Projects มี horizontal scroller ภายในแถบ shortcut; mobile board drawer/top gap ยังเป็นบัคตามรายการข้างต้น.
- Preference: คืนเป็น `system` (ระบบปัจจุบัน resolve เป็น dark) และคืน viewport เป็น 1280x720.
- Files: `docs/theme-system.md`, `docs/agent-notes/2026-10-01-full-theme-sweep.md`.
- Follow-ups: ทำ mobile dark visual pass ให้ครบทุก route หลังแก้ shell/layout; ตรวจ breakpoint 768px และ tablet.

### 2026-10-01 — แก้ contrast, theme startup และ responsive layout
- Changed: เพิ่ม `resolveTheme` และใช้ใน bootstrap/provider; เพิ่ม status tokens (`danger`, `success`, `warning`, `info`) พร้อม danger foreground; ย้าย auth forms, shared button/modal/toast, entity/state feedback และ inline notices ไป semantic utilities.
- Changed: ปรับ Projects Workspace panel/switcher, Profile status, project drawer selector/grid placement, Notes board default เป็น 2 columns และขยาย center panel ที่ `xl`; ทำ marketing star styles deterministic และแก้ parent/sizes ของ Next/Image; ปรับ ignored local dev callback configuration ให้ตรงกับ port ที่รัน.
- Routes/components reviewed after changes: Projects light/dark desktop, Notes light/dark desktop, Design System light (error/success/card samples, modal, toast), auth login light, marketing light; sign-out ส่งกลับหน้า login บน dev origin เดิม. Theme preference กลับเป็น `system` หลังตรวจ.
- Database/schema changes: ไม่มี. ไม่มีการ submit create/update/delete ใน UI.
- Verification: focused tests, lint, build, Prisma validation และ `git diff --check` ให้บันทึกผลใน `docs/agent-notes/2026-10-01-theme-fixes.md` เมื่อเสร็จ.
- Follow-ups: ตรวจ drawer และ content ที่ 390×844 และ tablet หลังแก้; ตรวจ profile status visual post-fix, valid invitation token states, keyboard/focus/error/skeleton states; ย้าย legacy global compatibility rules เป็นระยะ; production `/design-system` ยังตอบ 404 ตามรอบก่อน.

### 2026-10-01 — ย้าย AI Chat widget ไปใช้ semantic theme tokens
- Changed: `src/components/ai/ai-chat-widget.tsx` เปลี่ยน launcher, header, assistant/user bubbles, context/credit banner, prompt chips, controls และ input จากสี stone/dusk ที่ล็อกตายตัวไปใช้ `theme-background`, `theme-foreground`, `theme-panel`, `theme-panel-strong`, `theme-paper`, `theme-muted`, `theme-border`, `theme-accent` และ status tokens.
- Tokens/variants: ใช้ semantic surface, text, border, accent, success และ warning tokens; ไม่มี fixed palette exception เพิ่ม.
- Reviewed: ตรวจ source และ local desktop 1280×720; Light side panel, Dark float และ side panel. คืน preference เป็น `system`; ไม่ส่งข้อความเข้าระบบ AI.
- Follow-ups: local Neon connection ใช้งานไม่ได้ จึงยังยืนยันภาพ context/credit banner ไม่ได้; ตรวจ mobile และ keyboard focus เมื่อมีรอบ QA ต่อไป.

### 2026-10-01 — เพิ่มขั้นตอนยืนยันสร้างการ์ดจาก AI Chat
- Added/changed: `src/components/ai/ai-chat-widget.tsx`, `src/app/api/ai/chat/route.ts`, `src/app/api/ai/create-cards/route.ts`, `src/lib/ai/chat-actions.ts`, `src/lib/ai/prompts.ts`.
- Tokens/variants: ตัวอย่างการ์ดร่างใช้ palette เดิมของ AI Chat และ shared `ConfirmModal`; ไม่มี token สีใหม่. มีผลกับ AI Chat widget ที่แสดงทุก route ยกเว้นหน้า auth.
- Reviewed: ตรวจ source, membership/private-board checks, schema parsing และ confirmation flow; ยังไม่ได้ตรวจภาพ state ข้อเสนอ/ยืนยัน เนื่องจากฐานข้อมูล local ใช้งานไม่ได้.
- Follow-ups: ตรวจ end-to-end เมื่อ Neon พร้อม โดยยืนยันว่ามีรายการร่างก่อน และสร้างข้อมูลเฉพาะหลังคลิก Confirm; ตรวจ mobile และ keyboard focus.

### 2026-10-02 — เพิ่มและปรับ Template สำหรับสร้างบอร์ด
- Added/changed: `src/lib/kanban/board-templates.ts`, `src/components/kanban/board-template-picker.tsx`, `src/components/kanban/board-tabs-bar.tsx`, `src/components/project/project-boards-manager.tsx`, `src/app/api/projects/[id]/boards/route.ts`, `public/board-templates/*.png`.
- Tokens/variants: ใช้ semantic surface/text/border/accent tokens ในตัวเลือกและ modal; preview ใช้ palette สีคอลัมน์และ status ที่มีอยู่แล้ว; ภาพไอคอนโปร่งใสเป็น artwork สำหรับ Template; ไม่มีสี palette ใหม่.
- Reviewed: source, payload validation, project membership/owner check และ atomic board+column create; ยังไม่ได้ตรวจภาพ light/dark/system หรือ mobile; preview 5 ขั้นใช้ flow แนวนอนแทนแถว 3+2 ที่ดูไม่สมดุล.
- Follow-ups: ตรวจ modal และ preview ใน light/dark/system, mobile scroll/focus, และสร้างบอร์ดจริงเมื่อฐานข้อมูลพร้อม.

### 2026-10-02 — ย้ายตัวเลือกบอร์ดเข้า sidebar
- Added/changed: ย้ายตัวเลือกบอร์ด, Board Settings และ Create Board เข้า dropdown ใน `src/components/kanban/board-sidebar-dropdown.tsx`; ใช้ private-board access filter ใน `src/components/project/project-shell.tsx`; ถอดแถบ tabs จาก `src/app/(dashboard)/project/[id]/board/page.tsx`.
- Tokens/variants: ใช้ shared DropdownMenu, semantic active state และ icon domain colors เดิม; ไม่มีการเพิ่มสีหรือ token ใหม่.
- Reviewed: ตรวจ source, route links, board-switching event และ private-board filtering; ยังไม่ได้ตรวจภาพ light/dark/system, mobile drawer หรือ keyboard focus หลังย้าย.
- Follow-ups: ตรวจ dropdown clipping/focus ใน sidebar แบบขยาย/ย่อ และ mobile; ตรวจ create/settings actions ด้วยฐานข้อมูลที่พร้อม.

### 2026-10-03 — ย้าย AI Chat ไปไว้ข้างซ้ายโปรไฟล์ และเพิ่มปุ่ม ? ไปยังหน้า /help
- Added/changed: `src/components/ai/ai-chat-context.tsx`, `src/components/ai/ai-chat-trigger.tsx`, `src/components/ui/help-button.tsx`, `src/app/(dashboard)/help/page.tsx`, `src/components/help/help-center-client.tsx`, `src/components/project/project-shell.tsx`, `src/components/project/projects-dashboard.tsx`, `src/components/project/user-profile-popover.tsx`, `docs/system-guide.md`.
- Tokens/variants: ใช้ semantic surface/text/border/accent tokens และ retro lofi palette สอดคล้องกับ shared primitives; ปุ่ม AI trigger และ Help button บน topbar ใช้ token ชุดเดียวกับ topbar tools.
- Reviewed: Desktop & mobile responsive styling, category filter, real-time search, quick AI launch trigger.

### 2026-10-04 — ตารางสเปรดชีต (Spreadsheet Table View) และ Custom Priorities
- Added/changed: `src/components/kanban/board-list-view.tsx`, `src/components/kanban/board-priorities-tab.tsx`, `src/lib/kanban/priority.ts`, `src/components/kanban/card.tsx`, `src/components/kanban/card-modal.tsx`, `src/components/kanban/project-calendar.tsx`.
- Tokens/variants:
  - Table View ใช้โทนสี semantic table header, alternating row highlights, stone/dusk borders, และ contrast pills สำหรับ P0–P2 priorities
  - คอลัมน์ลำดับ `#` แสดงเลขลำดับเรียบง่าย และสลับเป็น completion checkbox เมื่อ hover โดยไม่เกิด layout shift
  - Custom Priorities รองรับ 12 โทนสี retro lofi (Rose, Orange, Amber, Yellow, Emerald, Teal, Sky, Blue, Indigo, Purple, Pink, Stone) พร้อม dynamic light/dark pillClass
  - คอลัมน์ Assignee แสดง `AssigneeAvatar` จริงสอดคล้องกับธีมทั่วทั้งระบบ
- Reviewed: ตรวจสอบทั้งโหมด Flat Table, Grouped Accordion, Calendar item detail panel, Card modal, และ Kanban cards บนทั้งธีม Dark และ Light.

### 2026-10-04 — การส่งออกข้อมูลบอร์ด (Export Board) และ Card Density Switcher
- Added/changed: `src/components/kanban/board-export-modal.tsx`, `src/lib/kanban/export-board.ts`, `src/components/kanban/board.tsx`, `src/components/ui/date-picker.tsx`, `src/components/ui/time-picker.tsx`.
- Tokens/variants:
  - Export modal ใช้ semantic card surface, segmented control สำหรับขอบเขตข้อมูล (All vs Filtered), และ format selection grid
  - Card density switcher (Normal vs Compact 2x) ใช้ paired button group เคียงข้าง Board/Table view switcher
  - Custom DatePicker และ TimePicker ใช้ popover surface, linear single-column scroller, และ standard DD/MM/YYYY placeholders พร้อม outside-click dismiss
- Reviewed: Desktop & mobile responsive styling, outside-click dismissal, export trigger coordination across views.

### 2026-10-04 — หน้าแก้ไขตัวเลือกการ์ด (Card Attributes Edit Modal) และปุ่ม + ท้ายหัวข้อ
- Added/changed: `src/components/kanban/card-attributes-edit-modal.tsx`, `src/components/kanban/card-modal.tsx`, `src/lib/kanban/status.ts`, `src/lib/kanban/difficulty.ts`, `src/types/kanban.ts`.
- Tokens/variants:
  - เพิ่มปุ่ม `+` แบบ reactive ที่ท้ายหัวข้อ 3 ส่วนใน Card Modal: สถานะ (Status), ลำดับความสำคัญ (Priority), และคะแนนความยาก (Story Points)
  - หน้าต่าง Modal จัดการตัวเลือก (Card Attributes Edit Modal) แบ่ง 3 แท็บด้วย responsive tabs และ retro lofi color swatches
  - ปรับแต่งและสลับชุด Story Points Preset (Retzlo Standard, Fibonacci, Linear/ชั่วโมง, T-Shirt Sizes) หรือเพิ่มตัวเลขคะแนนแบบกำหนดเอง
  - รองรับการย้ายลำดับ (Move Up / Down) และเพิ่มตัวเลือกสถานะและความสำคัญใหม่พร้อม color swatch picker
  - ปฏิบัติตามมาตรฐานการใช้งาน `ConfirmModal` สำหรับการลบและรีเซ็ต พร้อม Toast notifications ทุกการเปลี่ยนแปลง
- Reviewed: ตรวจสอบทั้ง desktop และ mobile responsive, การเปิดแท็บตรงจากปุ่ม `+`, การเชื่อมต่อบอร์ด `boardId` และการจัดเก็บ board-scoped ใน localStorage และ backend database.

### 2026-10-04 — ปรับปรุงหน้า Project Settings และ Board Settings ให้ใช้งานง่ายและชัดเจน
- Added/changed: `src/components/project/project-settings-client.tsx`, `src/app/(dashboard)/project/[id]/settings/page.tsx`, `src/components/project/settings-form.tsx`, `src/components/project/project-boards-manager.tsx`, `src/components/kanban/board-settings-modal.tsx`, `src/components/kanban/board-settings/general-tab.tsx`, `src/components/kanban/board-settings/columns-tab.tsx`.
- Tokens/variants:
  - จัดการหน้า Project Settings (`/project/[id]/settings`) ใหม่ด้วย Clean Tabbed Architecture: `บอร์ด & ย่อย (boards)`, `ข้อมูลโปรเจกต์ (identity)`, `สิทธิ์ & ฟีเจอร์ (features)`, `การตั้งค่าส่วนตัว (preferences)`, และ `แสดงทั้งหมด (all)`
  - แต่ละแท็บใช้ semantic pill styling, badge แสดงจำนวนบอร์ด, และ sync กับ query param `?tab=...` อย่างราบรื่น
  - การ์ดบอร์ดใน Multi-board Manager เพิ่มปุ่ม "เปิดบอร์ด" (Open Board) ชัดเจน พร้อม quick action icons ที่เป็นระเบียบ
  - รวมแท็บ General และ Access ใน `BoardSettingsModal` เข้าด้วยกัน เมื่อเลือก Private จะแสดงรายชื่อสมาชิกพร้อมช่องค้นหา Avatar และปุ่ม Select/Clear All ในตัว
  - ตัดขั้นตอน Confirm Modal ที่ซ้ำซ้อนตอนกด Save บอร์ด โดยบันทึกทันทีพร้อมแจ้งเตือน Success Toast ตามมาตรฐาน AGENTS.md
- Reviewed: ตรวจสอบความถูกต้องของสัญญาทดสอบ `theme.test.ts`, `board-rename.test.ts`, `board-views-and-sidebar.test.ts`, และการทำงานบนหน้าจอ Desktop และ Mobile.

### 2026-10-04 — เพิ่ม Skeleton Loading และปรับปรุงประสิทธิภาพความเร็วของหน้าปฏิทิน (Calendar Performance & Skeleton)
- Added/changed: `src/components/ui/skeleton.tsx`, `src/app/(dashboard)/project/[id]/calendar/loading.tsx`, `src/app/(dashboard)/project/[id]/calendar/page.tsx`, `src/components/kanban/project-calendar.tsx`.
- Tokens/variants:
  - เพิ่ม `CalendarSkeleton` ใน `src/components/ui/skeleton.tsx` รองรับการแสดงผลแผงควบคุม Header, แถววันในสัปดาห์ (SUN-SAT), และตาราง 35 วัน (5 สัปดาห์) พร้อม Shimmering animation สไตล์ Retro Lofi
  - สร้าง `src/app/(dashboard)/project/[id]/calendar/loading.tsx` เพื่อให้ Next.js ทำ Instant Transition แสดง Skeleton ทันทีเมื่อคลิกเข้าสู่หน้าปฏิทิน
  - ขนานคำสั่งฐานข้อมูลขั้นที่ 1 ใน `page.tsx` ด้วย `Promise.all` ลด Network Waterfall จาก 4 ขั้นเหลือ 2 ขั้น
  - แก้ไขการแปลงข้อมูล `toProjectDiaryItems` ให้ฟิลด์ `startDate` (ISO String), `repeatUnit`, และสิทธิ์การเข้าถึงสมบูรณ์ตั้งแต่ Server Render ครั้งแรก เพื่อให้รายการ Diary Checklist ทั้งหมดแสดงทันทีไม่ต้องรอ Live Sync ดึงซ้ำ
  - ปรับปรุงการคำนวณ `preparedDiaries` ใน `project-calendar.tsx` ให้ประมวลผล checklist เพียงครั้งเดียวแทนการรันซ้ำ 35 รอบต่อเดือน และผ่อนคลาย Polling Interval ของ LiveSync เป็น 8000ms
- Reviewed: ตรวจสอบทั้ง Light Mode, Dark Mode, การนำทางด้วย Router และ Build Production.

### 2026-10-04 — ปรับปรุงหน้าจัดการสมาชิกโปรเจกต์ (Project Members Page Redesign & Skeleton)
- Added/changed: `src/components/project/project-members-view.tsx`, `src/app/api/projects/[id]/members/route.ts`, `src/components/ui/skeleton.tsx`, `src/app/(dashboard)/project/[id]/members/loading.tsx`.
- Tokens/variants:
  - ปรับโครงสร้างหน้าจัดการสมาชิกเป็นแบบ 3 แท็บชัดเจน: `สมาชิกในทีม (Members)`, `คำเชิญรอดำเนินการ (Invitations)`, และ `สิทธิ์และการเข้าถึง (Roles & Permissions)`
  - สถิติแดชบอร์ด 5 การ์ด (Total Members, Active Now, Owners, Pending, Total Coffees) สามารถคลิกเพื่อสลับแท็บหรือกรองสถานะได้ทันที
  - แสดง Avatar พร้อม Presence Status Dot (Online = สีเขียว, Busy = สีส้ม, Offline = สีเทา) ตามข้อมูล `user.status`
  - รองรับการปรับเปลี่ยนบทบาทสมาชิก (Owner ↔ Member) สำหรับเจ้าของโปรเจกต์ พร้อมความปลอดภัยป้องกันการลดสิทธิ์เจ้าของคนสุดท้าย และมี `ConfirmModal` ตรวจสอบเจตนาก่อนบันทึกเสมอ
  - หน้าต่าง Modal เชิญเพื่อนร่วมทีม (Invite Modal) ออกแบบใหม่ด้วย `AppModal` รองรับการเลือกบทบาท (Member หรือ Owner) และคัดลอกลิงก์คำเชิญได้ทันที
  - เพิ่ม `MembersSkeleton` และ Next.js streaming `loading.tsx` ทำให้การเปิดหน้าสมาชิกรวดเร็วและมี Shimmer Animation สอดคล้องกับธีม Retro Lofi
- Reviewed: ตรวจสอบสัญญา `Total Coffees`, `totalCoffeesCount`, `member.totalCoffees` สำหรับการทดสอบ `coffee-cheers-button.test.ts`, ตรวจสอบ TypeScript, ESLint, Prisma validate และ Next.js build ผ่านสมบูรณ์ทุกประการ.

### 2026-10-04 — ปรับปรุงศูนย์รวมเอกสารและคู่มือระบบ (Documentation & Help Hub Redesign)
- Added/changed: `src/components/help/help-center-client.tsx`, `src/app/(dashboard)/help/page.tsx`, `docs/system-guide.md`.
- Tokens/variants:
  - ยกเครื่องหน้า `/help` จากการแสดงการ์ดตาราง 2 คอลัมน์เดิม สู่สถาปัตยกรรมเว็บไซต์ Documentation เต็มรูปแบบ (เช่น Stripe, Next.js, GitBook Docs)
  - แถบเมนูด้านซ้าย (Sticky Sidebar Docs Navigation Tree): จัดหมวดหมู่ 10 หมวดหมู่ พร้อมไอคอนและป้ายสถานะ (New, AI, Core, Updated) ตัวระบุสถานะ Active Indicator สีเรืองแสง และช่องค้นหาเรียลไทม์
  - พื้นที่อ่านเนื้อหาหลัก (Document Reader): แสดง Breadcrumbs, ข้อมูลผู้เขียน/เวลาอ่าน/วันที่อัปเดต, กล่องบทนำ Lead Summary, เนื้อหาแยกเป็นสัดส่วน (ภาพรวม, ฟังก์ชันและความสามารถ, เคล็ดลับ Pro Tips, คีย์ลัดด่วน)
  - วิดเจ็ตฟีดแบ็กและปุ่มนำทาง: เพิ่มส่วนประเมินประโยชน์ของบทความ (Was this helpful? 👍/👎) พร้อม Toast แจ้งเตือน และปุ่มเปลี่ยนบทความก่อนหน้า/ถัดไป (Pagination)
  - แถบสารบัญด้านขวา (On this page TOC): สำหรับหน้าจอ Desktop มีระบบ Anchor ลิงก์กระโดดข้ามหัวข้อย่อยและกล่องถาม Retzlo AI ด่วน
  - รองรับทั้งโหมดอ่านเอกสาร (Docs Reader View) และโหมดดูภาพรวมการ์ดทั้งหมด (Overview Grid View) พร้อม Drawer สารบัญแบบเต็มสำหรับจอมือถือและแท็บเล็ต
- Reviewed: ตรวจสอบความถูกต้องของ UI บนทั้งธีม Dark Mode (Retro Lofi Indigo) และ Light Mode (Warm Paper), ตรวจสอบปุ่มคีย์ลัด Ctrl+K, การคัดลอกคีย์ลัด, การทำงานของ Drawer บนจอมือถือ และ Next.js Build ผ่าน 100%.

### 2026-10-04 — เพิ่มเมนู Dropdown ข้อมูลเว็บไซต์/ติดต่อเรา และสร้างหน้าแบบฟอร์มติดต่อพร้อมเทมเพลต (Help Dropdown & Contact Form with Templates)
- Added/changed: `src/components/ui/help-button.tsx`, `src/lib/contact-templates.ts`, `src/lib/contact-templates.test.ts`, `src/components/contact/contact-page-client.tsx`, `src/app/(dashboard)/contact/page.tsx`, `src/app/api/contact/route.ts`, `docs/system-guide.md`.
- Tokens/variants:
  - อัปเกรดปุ่ม `(?)` HelpButton บน Topbar ให้เปิดเมนู DropdownMenu สไตล์ Retro Lofi แสดง:
    1. `คู่มือ & ข้อมูลระบบ`: ลิงก์ตรงไปที่ `/help`
    2. `รายละเอียดเว็บไซต์`: เปิด Modal แสดงเวอร์ชัน v2.4, ข้อมูลสถาปัตยกรรม (Next.js, Neon PostgreSQL, Tailwind, Pusher) และสรุปโมดูล
    3. `ติดต่อเรา & แจ้งปัญหา`: ลิงก์ตรงไปที่ `/contact`
    4. `ถาม AI Assistant`: เรียกผู้ช่วย AI ตอบคำถามทันที
    5. ลิงก์นโยบายความเป็นส่วนตัว (`/privacy`) และข้อกำหนดการใช้งาน (`/terms`)
  - สร้างหน้าแบบฟอร์มติดต่อ (`/contact`) พร้อมระบบ Template Select 7 รูปแบบ (แจ้ง Bug, ขอฟีเจอร์, สอบถามทั่วไป, ติดต่อร่วมมือ, ข้อเสนอแนะ Gamification, ความปลอดภัย, กำหนดเอง) ที่ช่วยเติมหัวข้อและร่างข้อความอัตโนมัติ
  - ระบบส่งเรื่องติดต่อผ่าน API `POST /api/contact` พร้อมสร้าง Ticket Reference ID และแจ้งเตือน Toast ยืนยันผล
- Reviewed: ตรวจสอบ unit tests `contact-templates.test.ts` และ `help-center.test.ts` ผ่าน 100%, ตรวจสอบ TypeScript, ESLint และ Next.js production build ผ่านสมบูรณ์.

### 2026-10-04 — รวมการตั้งค่าคุณสมบัติการ์ดเข้า Board Settings และเชื่อมโยงทุกจุดแบบเรียลไทม์ (Unified Board Settings & Attributes Synchronization)
- Added/changed: `src/components/kanban/board-attributes-tab.tsx`, `src/components/kanban/board-settings-modal.tsx`, `src/components/kanban/column-status-picker.tsx`, `src/components/kanban/column.tsx`, `src/components/kanban/board.tsx`, `src/components/kanban/card-modal.tsx`, `src/components/kanban/card-attributes-edit-modal.tsx`, `src/components/kanban/board-list-view.tsx`, `src/lib/kanban/column-settings.ts`, `src/lib/kanban/status.ts`, `src/lib/kanban/difficulty.ts`, `src/components/kanban/board-settings-attributes.test.ts`.
- Tokens/variants:
  - รวมการจัดการคุณสมบัติการ์ด (Card Attributes: Statuses, Priorities, Story Points) เข้าสู่ศูนย์กลาง `BoardSettingsModal` ภายใต้แท็บ `คุณสมบัติการ์ด (attributes)` พร้อม sub-navigation pills สไตล์ Retro Lofi
  - อัปเกรด `ColumnStatusPicker` ในหน้าแก้ไขคอลัมน์และสร้างคอลัมน์ใหม่ ให้โหลดและแสดงผลสถานะที่กำหนดเอง (Custom Statuses) ของบอร์ด พร้อม sync เรียลไทม์ผ่าน `retzlo:statuses-updated`
  - อนุญาตให้ `columnSettingsSchema` รับสถานะกำหนดเองสำหรับ `defaultCardStatus` ของคอลัมน์ได้อย่างสมบูรณ์
  - เชื่อมโยง Table / Spreadsheet View ให้ดึงสีและป้ายแสดงสถานะกำหนดเองผ่าน `getStatusMeta` อัตโนมัติ
  - ปุ่มบนแถบเครื่องมือของบอร์ดเปลี่ยนเป็น `Attributes` เพื่อเข้าถึงการตั้งค่าคุณสมบัติงานทั้งหมดได้อย่างรวดเร็ว
  - ทุกการลบและรีเซ็ตมี `ConfirmModal` และแสดงผลการทำงานผ่าน Toast แจ้งเตือนตามมาตรฐาน AGENTS.md
- Reviewed: รัน Vitest ผ่าน 86/86 ไฟล์ (433/433 การทดสอบ), TypeScript `tsc --noEmit` ผ่าน 0 errors, ESLint ผ่าน 0 warnings, Prisma validate และ Next.js production build ผ่าน 100%.

### 2026-10-04 — ปรับปรุง UI คุณสมบัติการ์ดใน Board Settings ให้โปร่งโล่ง ลดความอึดอัดและลบกล่องขอบซ้อนทับ (Board Settings Attributes UI Declutter)
- Added/changed: `src/components/kanban/board-settings-modal.tsx`, `src/components/kanban/board-attributes-tab.tsx`, `src/components/kanban/board-priorities-tab.tsx`.
- Tokens/variants:
  - ขยายความกว้าง Modal จาก `max-w-2xl` (672px) เป็น `max-w-3xl` (768px) เพื่อเพิ่มพื้นที่หายใจรอบขอบหน้าต่าง
  - ปรับ Sub-navigation ของคุณสมบัติการ์ด (สถานะ, ระดับความสำคัญ, Story Points) ให้เป็นแถบแท็บแบบ Borderless พร้อมเส้นขีดแบ่งล่างบางเบา แทนกล่องมนพื้นหลังหนาซ้อนทับกัน
  - ตัดกรอบกล่องแบนเนอร์ข้อความขนาดใหญ่ออก ใช้การจัดวาง Typography แบบมินิมอล (Title + Subtitle + Action Button)
  - ปรับการเลือกสเกล Story Point Presets จากตารางการ์ด 4 บล็อกขนาดใหญ่ ให้เป็นแถบชิปแนวนอน (Horizontal Chips) ช่วยประหยัดพื้นที่แนวตั้งได้กว่า 120px
  - รวมรายการแสดงผลสถานะ, ระดับความสำคัญ, และ Story Points จากกล่องลอยแยกเดี่ยวหลายชั้น (Russian nesting doll effect) ให้เป็นคอนเทนเนอร์รายการเดี่ยวสะอาดตาพร้อมเส้นแบ่งแถว `divide-y` บางเบา
- Reviewed: ตรวจสอบความถูกต้องของ UI ทั้งในโหมด Dark และ Light, รันการทดสอบ Vitest ใน `src/components/kanban/` ผ่าน 56/56 การทดสอบ, ESLint ผ่าน 0 warnings, Prisma validate และ Next.js production build สำเร็จสมบูรณ์.

### 2026-10-04 — สร้างมาตรฐานความสอดคล้องสถานะ Select / Active (Clean Neutral Pill Consistency)
- Added/changed: `src/components/kanban/board.tsx`, `src/components/ui/segmented-control.tsx`, `src/components/ui/tabs.tsx`, `src/components/help/help-center-client.tsx`, `src/components/project/project-members-view.tsx`, `src/components/theme/theme-toggle.tsx`.
- Tokens/variants:
  - กำหนดมาตรฐานสถานะ Selected / Active สำหรับ Segmented Controls, View Switchers, และ Radix Tabs ทั่วทั้งโปรเจกต์ด้วย **Clean Neutral Pill Standard** (Apple / Linear / Notion style):
    - Track: `border border-stone-200/90 bg-stone-100/80 p-0.5 rounded-xl dark:border-white/10 dark:bg-white/[0.04]`
    - Selected: `border border-stone-200/80 bg-white text-stone-900 shadow-xs font-semibold dark:border-white/10 dark:bg-stone-800 dark:text-stone-100`
    - Unselected: `text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200`
    - Accent: ตัวไอคอนและป้าย Badge คงสีไฮไลท์ตามฟังก์ชัน (เช่น `KanbanSquare` และ `Rows3` ใช้ `text-indigo-600 dark:text-dusk-lavender`, `Table2` ใช้ `text-dusk-amber`)
  - แก้ไขปุ่ม `Compact 2x` ในบอร์ดที่เคยแสดงผลสีม่วงทึบตัดกับ `Board` และ `Normal` ให้กลับมาเป็น Clean Neutral Pill ที่กลมกลืนกันสมบูรณ์แบบ
  - ปรับปรุงการแสดงผลของ `SegmentedControl`, `TabsTrigger`, `Help Docs Switcher`, `Project Members Filter Tabs`, และ `Theme Toggle` ให้เป็นไปตามมาตรฐานเดียวกัน
- Reviewed: รันการทดสอบ Vitest 86/86 ไฟล์ (433/433 การทดสอบผ่าน), ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — เพิ่มปุ่ม + สร้างสถานะใหม่ในตัวเลือกสถานะคอลัมน์ (Inline Quick Add Status in Column Status Picker)
- Added/changed: `src/components/kanban/column-status-picker.tsx`, `src/components/kanban/board-settings-attributes.test.ts`.
- Tokens/variants:
  - เพิ่มปุ่ม `+` สไตล์ Retro Lofi ที่หัวข้อ "CARD STATUS" และปุ่มกรอบประ `+ เพิ่มสถานะ` ที่ท้ายตารางตัวเลือกสถานะ
  - กล่องกรอกข้อมูลสถานะแบบขยายได้ (Inline Quick Add Form) พร้อมตัวเลือกสี 8 เฉด (Indigo, Teal, Cyan, Amber, Emerald, Rose, Purple, Stone) สอดคล้องกับ Retro Lofi Indigo Theme
  - รองรับการบันทึกด้วย Enter, ยกเลิกด้วย Escape, และเลือกสถานะที่สร้างใหม่ให้อัตโนมัติ (Auto-selection)
  - ซิงค์การอัปเดตแบบเรียลไทม์ผ่าน `retzlo:statuses-updated` พร้อม Toast แจ้งเตือนความสำเร็จตามมาตรฐาน AGENTS.md
- Reviewed: รันการทดสอบ Vitest ใน `src/components/kanban/` ผ่าน 56/56 การทดสอบ, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — นำแถบสลับ Boards Hub / All Workspaces ออกจากหน้าหลัก Projects Dashboard
- Added/changed: `src/components/project/projects-dashboard.tsx`.
- Tokens/variants:
  - นำชุดปุ่ม Segmented Toggle `[Boards Hub] [All Workspaces]` ออกจากแถบ Header ด้านขวาบน
  - ปรับปรุงให้หน้าแดชบอร์ดดูโปร่ง โล่ง สะอาดตา และคงไว้เฉพาะปุ่ม Primary Action สำคัญ (`New Board` / `New Project`)
- Reviewed: รันการทดสอบ Vitest ใน `src/components/project/` ผ่าน 13/13 การทดสอบ, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — เปลี่ยนปุ่มจุดสีสถิตบน Topbar เป็นปุ่ม Icon หน้ารวมบริษัท/Workspaces
- Added/changed: `src/components/project/project-shell.tsx`.
- Tokens/variants:
  - แทนที่กล่องสี่เหลี่ยมจุดสีสถิต (Static dot box) บนแถบ Topbar ข้างชื่อ Workspace ด้วยปุ่มลิงก์ Icon `Building2`
  - เชื่อมโยงตรงไปยังหน้ารวมบริษัท/แดชบอร์ด (`/projects`) พร้อม Tooltip "หน้ารวมบริษัท (Workspaces)"
  - ใช้อัตลักษณ์สไตล์ปุ่มมน Retro Lofi (`rounded-xl border border-white/10 bg-white/[0.05]`) กลมกลืนกับปุ่ม BackButton
- Reviewed: รันการทดสอบ Vitest ใน `src/components/project/` ผ่าน 13/13 การทดสอบ, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — ปรับปรุงระบบ Export บอร์ดให้เป็น Dedicated Document Layout (ครบทุกคอลัมน์ 100% ไม่ถูกตัดขอบ พร้อมหัวเอกสารผู้บริหารและโหมดตารางรายงาน)
- Added/changed: `src/components/kanban/board-export-document.tsx`, `src/components/kanban/board-export-modal.tsx`, `src/lib/kanban/export-board.ts`, `src/components/kanban/board-export.test.ts`.
- Tokens/variants:
  - แก้ไขปัญหาเดิมที่ใช้การจับภาพหน้าจอ (screenshot) จาก live viewport ซึ่งทำให้คอลัมน์ด้านขวาและการ์ดด้านล่างหลุดขอบ/ถูกตัด และติดปุ่มอินเตอร์แอคทีฟ เช่น "+ เพิ่มการ์ด", เมนูสามจุด, และ scrollbars
  - สร้างคอมโพเนนต์ `BoardExportDocument` เป็นเลย์เอาต์เฉพาะสำหรับการส่งออก (Dedicated Export Layout) โดยไม่ขึ้นกับขนาดหน้าจอของผู้ใช้:
    - **Executive Header**: แบนเนอร์หัวเอกสารผู้บริหาร พร้อมชื่อบอร์ด, ชื่อโปรเจกต์, วันที่และเวลาส่งออก, และแถบ KPI สรุปสถานะ (งานทั้งหมด, แต้มความยาก, กำลังทำ, เสร็จสิ้น, เกินกำหนด, อัตราความสำเร็จ %)
    - **Full Panoramic Kanban Mode**: จัดวางทุกคอลัมน์แบบเต็มแผ่นแนวนอน 100% ความกว้างขยายตามจำนวนคอลัมน์จริง ไม่มีการตัดทอนหรือมีแถบเลื่อน
    - **Executive Summary Table Mode**: รายงานแบบตารางสรุปรายคอลัมน์ พร้อมสัญลักษณ์ความสำคัญ, ผู้รับผิดชอบ, วันส่งงาน และเช็คลิสต์ เหมาะสำหรับพิมพ์ลงกระดาษ A4 หรือนำเสนอสไลด์
    - **Theme Styles**: รองรับทั้งโหมดกระดาษขาว Clean Light Paper (พื้นหลังขาว เหมาะสำหรับพิมพ์/สไลด์) และดาร์กโหมดพรีเมียม Dark Slate
### 2026-10-04 — ปรับปรุงหน้าต่าง Add Note ในหน้าบอร์ดให้เหมือนหน้า Notes หลัก พร้อมตั้งค่าเริ่มต้นเป็นบอร์ดปัจจุบัน (Board Note Modal Parity)
- Added/changed: `src/components/notes/board-notes-rail.tsx`, `src/components/notes/note-modals.test.ts`.
- Tokens/variants:
  - ยกระดับ `NoteModal` และ `EditNoteModal` บนแถบโน้ตข้างบอร์ด (`BoardNotesRail`) ให้มีฟังก์ชันและเลย์เอาต์ครบถ้วนเหมือน `NoteEditorModal` ในหน้า Notes หลัก (`/project/[id]/notes`):
    - **Header & Title:** ช่องกรอกชื่อโน้ตพร้อมกล่องแสดงสติกเกอร์ Retro ขนาดใหญ่ (`renderNoteSticker`)
    - **Folder Selector:** ตัวเลือกโฟลเดอร์โครงการด้วย Radix UI `<Select>` พร้อมไอคอนโฟลเดอร์
    - **Visibility Scope:** ปรับค่าเริ่มต้น (Default Scope) ให้เป็น `Sub-project Board` โดยอัตโนมัติ พร้อมแสดงป้าย `Default` และเลือกบอร์ดปัจจุบัน (`activeBoardId` / `activeBoardName`) ในดรอปดาวน์ให้ทันทีตามความต้องการของผู้ใช้ (ผู้ใช้ยังสามารถสลับเป็น Private หรือ Team ได้)
    - **Due Date & Time:** เพิ่มช่องระบุวันครบกำหนดและเวลา (`DateTimeField`) พร้อมคำอธิบาย
    - **Color & Sticker Pickers:** ตัวเลือกสีการ์ด 10 เฉดสีสไตล์ Retro Lofi และกริดเลือกสติกเกอร์ย้อนยุค (`sharedIconOptions`)
- Reviewed: รันการทดสอบ Vitest ใน `src/components/notes/note-modals.test.ts` และ `src/components/notes/notes-panel.test.ts` ผ่าน 14/14 การทดสอบ, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — ปรับโฉมหน้าตั้งค่าโปรเจกต์เป็น Master-Detail Left Sidebar สไตล์ Jira & Linear (Jira-style Space Settings Layout)
- Added/changed: `src/components/project/project-settings-client.tsx`, `src/components/project/project-settings-client.test.ts`.
- Tokens/variants:
  - ปรับปรุงหน้าการตั้งค่า `/project/[id]/settings` จากแท็บแนวนอนเดิม ให้กลายเป็นสถาปัตยกรรม **Master-Detail Left Sidebar Navigation** ตามมาตรฐาน Jira Space Settings และ Linear:
    - **Sticky Left Sidebar (`lg:w-72`):** แถบด้านข้างตรึงตำแหน่ง แสดงปุ่มย้อนกลับ `← Back to board`, การ์ดอัตลักษณ์ Space Identity Card (ภาพปก/สติกเกอร์/อักษรย่อ, ชื่อโปรเจกต์, ป้าย Project Space, ตัวนับจำนวนบอร์ดและสมาชิก), และเมนูนำทางจัดกลุ่ม 4 หมวดหมู่ (General, Workflow, System & Privacy, Overview)
    - **Active Pill Indicator:** ใช้สไตล์เมนูคลาสสิกของ Jira พร้อมขอบแท่งแอคเซนต์ด้านซ้าย (`before:w-1 before:bg-indigo-600 dark:before:bg-dusk-lavender`) และพื้นผิวไฮไลท์สีอ่อน (`bg-indigo-50 dark:bg-dusk-lavender/15`)
    - **Mobile Adaptive Navigation:** บนหน้าจอต่ำกว่า `lg:` ย่อแถบนำทางเป็น Horizontal Scrollable Pills อย่างนุ่มนวล ไม่เปลืองพื้นที่
    - **New Section: Access & Team (`access`):** เพิ่มมุมมองภาพรวมสมาชิกในทีม, สถานะบทบาท Owner/Member, นโยบายการเข้าถึง, และปุ่มเปิดตัวจัดการสมาชิกแบบเต็ม (`/project/[id]/members`)
    - **New Section: Card Attributes & Types (`attributes`):** เพิ่มมุมมองสถานะงานมาตรฐาน (TODO, DOING, WAITING, DONE), ตารางลำดับความสำคัญ (P0–P4), ชุดประเมิน Story Points (Fibonacci, T-Shirt, Linear), และฟังก์ชันเสริมของการ์ด พร้อมปุ่มลัดไปยังบอร์ด
- Reviewed: ตรวจสอบความถูกต้องทั้งธีม Dark และ Light, Vitest ผ่าน 6/6 การทดสอบใน `project-settings-client.test.ts`, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — ปรับปรุงปุ่ม + ใน Card Modal ให้นำทางไปยังหน้า Project Settings (Attributes Navigation & Management)
- Added/changed: `src/components/kanban/card-modal.tsx`, `src/components/kanban/board.tsx`, `src/components/project/project-settings-client.tsx`, `src/components/project/project-settings-client.test.ts`.
- Tokens/variants:
  - แก้ไขปุ่ม `+` ข้างหัวข้อ Status, Priority และ Story Points ในหน้าต่างรายละเอียดการ์ด (`CardModal`) จากเดิมที่เปิดกล่องป๊อปอัปย่อยซ้อนทับจอ ให้เปลี่ยนเป็นการนำทางตรงไปยังหน้าการตั้งค่าโปรเจกต์ (`/project/[id]/settings?tab=attributes&subTab=...`) ตามคำขอของผู้ใช้
  - บูรณาการ `BoardAttributesTab` เข้าสู่แท็บ `attributes` ของหน้า Project Settings (`ProjectSettingsClient`) พร้อมตัวสลับบอร์ด (Board Selector) และรองรับการกระโดดไปยังซับแท็บที่เลือก (`status`, `priority`, `story-points`) ทันที
  - ผู้ใช้สามารถเพิ่ม/แก้ไขสถานะการ์ด, ปรับระดับความสำคัญ 10 ระดับ, และเลือก/ปรับแต่ง Story Points ได้อย่างสมบูรณ์แบบในหน้าเดียว
- Reviewed: ตรวจสอบความถูกต้องทั้งธีม Dark และ Light, Vitest ผ่าน 22/22 การทดสอบ, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100%.

### 2026-10-04 — ยกระดับการตั้งค่าบอร์ดเป็นสไตล์ Jira เต็มรูปแบบ ปราศจากโมดอลซ้อน (Jira Master-Detail Board Settings Integration)
- Added/changed: `src/components/project/project-settings-client.tsx`, `src/components/project/project-boards-manager.tsx`, `src/components/kanban/board-settings-modal.tsx`, `src/components/kanban/board-sidebar-dropdown.tsx`, `src/components/project/project-settings-client.test.ts`.
- Tokens/variants:
  - ยกเลิกการเปิดป๊อปอัปโมดอล `BoardSettingsModal` ซ้อนทับหน้าตั้งค่าโปรเจกต์ (`/project/[id]/settings?tab=boards`) เมื่อผู้ใช้คลิกปุ่ม Settings หรือ Access บนการ์ดบอร์ด ให้เปลี่ยนเป็นการสลับเข้าสู่หน้าการตั้งค่าบอร์ดเต็มจอในเลย์เอาต์ Master-Detail แถบซ้ายสไตล์ Jira ทันที
  - เพิ่มแท็บหลักในแถบเมนู Workflow & Boards:
    - **Board Details & Access (`board-general`):** ปรับชื่อบอร์ด, สลับความเป็นส่วนตัว (Public / Private), จัดการสิทธิ์สมาชิกในบอร์ดพร้อมช่องค้นหาและปุ่มเลือกทั้งหมด, บันทึกการตั้งค่าพร้อมแจ้งเตือน Toast, และ Danger Zone ลบบอร์ดพร้อม ConfirmModal
    - **Columns & Workflow (`board-columns`):** ดูขั้นตอนงานคอลัมน์, WIP Limits, ค่าสถานะเริ่มต้น, จำนวนการ์ด และปุ่มเปิดหน้ากระดาน Kanban
    - **Card Attributes & Types (`attributes`):** ปรับแต่งสถานะคอลัมน์, 10 ระดับความสำคัญ (Custom Priorities), และระดับ Story Points
  - เพิ่มแถบ **Active Board Selector Banner** ด้านบน พร้อมดรอปดาวน์สลับบอร์ดที่ต้องการตั้งค่าได้สะดวกรวดเร็ว
  - ปรับปรุงเลย์เอาต์ของ `BoardSettingsModal` (กรณีเปิดจากที่อื่น) จากเดิมที่มีแท็บแนวนอน ให้กลายเป็น **Jira Master-Detail Left Sidebar Dialog** ขนาดใหญ่ กว้าง 4xl พร้อมปุ่มลัด "เปิดหน้า Settings เต็มจอ (Jira Style)"
- Reviewed: Vitest 21/21 tests ผ่านฉลุย, ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100% (38/38 static pages).

### 2026-10-04 — แก้ไขสถาปัตยกรรมการจับภาพบอร์ด (Board Export Canvas Capture & Font Fallback Engine)
- Added/changed: `src/lib/kanban/export-board.ts`, `src/components/kanban/board-export-modal.tsx`, `src/components/kanban/board-export.test.ts`, `docs/system-guide.md`, `src/components/help/help-center-client.tsx`.
- Tokens/variants:
  - แก้ไขปัญหาการส่งออกภาพ PNG และเอกสาร PDF ที่เกิดภาพว่างเปล่า (Blank Canvas / White Screen) จากการใช้ inline style `position: fixed; left: -99999px;` โดยตรงบน root element ที่ถูกจับภาพด้วย `html-to-image`:
    - **Off-screen Staging Wrapper:** แยกคอนเทนเนอร์ staging ออกเป็นชั้นนอก (`position: fixed; left: -99999px; width: max-content; overflow: visible;`) และให้ตัวเรนเดอร์เอกสารภายใน (`#retzlo-export-render-canvas` / `#retzlo-export-render-canvas-quick`) มีพิกัดสัมพัทธ์ `position: relative; left: 0; top: 0;` เพื่อให้ SVG `<foreignObject>` วาดภาพที่พิกัด `(0, 0)` ได้อย่างสมบูรณ์แบบ
    - **Capture Style Normalization:** บังคับใช้ `options.style: { position: 'relative', left: '0', top: '0', margin: '0', transform: 'none', opacity: '1', visibility: 'visible' }` ใน `toPng` เพื่อป้องกันไม่ให้สไตล์ตำแหน่งเดิมรบกวนการเรนเดอร์ภาพ
    - **Font Embedding Fallback:** เพิ่มกลไกตรวจจับและ Fallback อัตโนมัติ (`skipFonts: true`) หากการดึง Web Fonts ผ่านเครือข่ายถูกบล็อกด้วย CORS หรือออฟไลน์ ป้องกัน Promise rejection ไม่ให้การส่งออกล้มเหลว
    - **Direct Ref Targeting:** นำ `useRef` มาใช้กับ Staging Canvas เพื่อป้องกันปัญหา ID collision ระหว่างปุ่ม Export บนหัวบอร์ดและตารางงาน
- Reviewed: Vitest 88/88 test files ผ่าน (449/449 tests ผ่าน), ESLint 0 warnings/errors, Prisma schema valid, และ Next.js production build ผ่าน 100% (38/38 routes).

### 2026-10-04 — เพิ่มหัวข้อ (Section Labels) สำหรับ Title และ Description ใน Note Modals
- Added/changed: `src/components/notes/board-notes-rail.tsx`, `src/components/notes/notes-panel.tsx`, `src/components/notes/note-modals.test.ts`, `docs/agent-notes/2026-10-04-add-note-modal-section-titles.md`.
- Tokens/variants:
  - เพิ่มหัวข้อกำกับส่วนข้อมูลในฝั่งซ้ายของ Note Modal (ทั้ง `NoteModal` และ `EditNoteModal` บน `BoardNotesRail` รวมถึง `NoteEditorModalContent` ใน `NotesPanel`):
    - **Title Section:** เพิ่ม `<label className="block font-medium text-xs text-stone-400 uppercase tracking-wider">Title (หัวข้อโน้ต) <span className="text-rose-500">*</span></label>` เหนือช่องกรอกชื่อโน้ตและสติกเกอร์
    - **Description Section:** เพิ่ม `<label className="block font-medium text-xs text-stone-400 uppercase tracking-wider">Description (รายละเอียดโน้ต)</label>` เหนือช่อง Textarea เขียนเนื้อหาโน้ต
    - จัดวางสไตล์ตัวอักษรและระยะห่าง (`space-y-1.5`) สอดคล้องกลมกลืนกับหัวข้อฝั่งขวา (Folder, Visibility scope, วันที่สิ้นสุด, Note color) และตรงตามมาตรฐาน Retro Lofi Indigo Theme
- Reviewed: Vitest 88/88 test files ผ่าน (450/450 tests ผ่าน), ESLint 0 warnings/errors, Prisma validate ผ่าน, และ Next.js production build ผ่าน 100% (38/38 routes).

### 2026-10-04 — ยกระดับดีไซน์ Day View Modal ในปฏิทิน (Retro Lofi Indigo Calendar Day Modal & Item Cards Redesign)
- Added/changed: `src/components/kanban/project-calendar.tsx`, `src/components/kanban/calendar-modals.test.ts`.
- Tokens/variants:
  - **Day View Modal Presentation:**
    - เปลี่ยนหัวข้อโมดอลให้แสดงไอคอน `CalendarDays` ในกรอบนีออนลอฟี่ลาเวนเดอร์ (`border-dusk-lavender/30 bg-dusk-lavender/10`), ระบุวันเต็มในสัปดาห์ (เช่น `Sunday, Oct 4, 2026`) พร้อมแท็ก `Today` เมื่อตรงกับวันปัจจุบัน
    - เพิ่มแถบ **Progress & KPI Summary**: แสดงสรุปยอดรวมรายการ, จำนวนที่สำเร็จ, รายการที่คงเหลือ, พร้อมแถบหลอดความคืบหน้าแบบเกรเดียนต์ (`from-dusk-lavender to-emerald-400`)
    - ยกระดับแถบ Filter & Sort: เปลี่ยนช่องกรองสถานะ/ประเภทและเรียงลำดับให้มีพื้นหลังโปร่งแสงคลาสสิก พร้อมปุ่ม `Reset` เมื่อมีการเลือกฟิลเตอร์
  - **Item Cards Redesign (แก้ไขปัญหากรอบสีน้ำตาลกระด้างและกล่องเช็กบ็อกซ์มืด):**
    - กำจัดขอบสีน้ำตาลกระด้าง (`dark:border-dusk-amber/30`) จากการใช้ `colorMeta.softClass` โดยตรงรอบการ์ดทั้งใบ ให้กลายเป็นการ์ดพาเนลโทน Retro Lofi ที่ประณีต (`border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.05]`)
    - เพิ่ม **Vertical Color Accent Bar** ทางซ้ายมือของแต่ละการ์ดตามเฉดสีของไดอารี่/การ์ด (เช่น Amber, Lavender, Cyan, Emerald) สร้างมิติความสวยงามอย่างลงตัว
    - เปลี่ยน Checkbox เดิมที่เป็น native input ทึบตัน ให้เป็น **Interactive Tactile Checkbox Button** เคลือบสีเขียวมรกต (`bg-emerald-500`) พร้อมไอคอนเครื่องหมายถูกสีขาวคมชัดเมื่อทำสำเร็จ และขีดฆ่าชื่อรายการอัตโนมัติ
    - เพิ่มปุ่มคลิกไปที่ไดอารี่ (`Open in Diary`) และขยายความสามารถให้การ์ด Kanban สามารถติ๊กเปลี่ยนสถานะเป็น DONE/TODO ได้โดยตรงจากในโมดอลปฏิทิน
- Reviewed: Vitest 88/88 test files ผ่าน (450 tests ผ่าน), ESLint 0 warnings/errors, Prisma validate ผ่าน, Next.js production build ผ่าน 100% (38/38 routes).

### 2026-10-05 — เพิ่มฟังก์ชันสร้างและจัดการคอลัมน์ในหน้าการตั้งค่าบอร์ด (New Column in Board Settings & Workflow Stages)
- Added/changed: `src/components/kanban/board-settings/columns-tab.tsx`, `src/components/project/project-settings-client.tsx`, `src/components/kanban/board-settings-modal.tsx`, `src/components/kanban/board.tsx`, `src/components/kanban/board-settings/columns-tab.test.ts`, `docs/system-guide.md`, `src/components/help/help-center-client.tsx`.
- Tokens/variants:
  - **New Column Creation Panel:** เพิ่มปุ่ม `+ เพิ่มคอลัมน์ใหม่` สไตล์ Retro Lofi Indigo ที่ส่วนหัวของแท็บ Workflow Stages พร้อมแผงกรอกข้อมูลในสไตล์ Lofi Panel:
    - ช่องกรอกชื่อคอลัมน์ (Required, max 80 chars)
    - ตัวเลือกสถานะเริ่มต้นของการ์ด 4 รูปแบบ (TODO, DOING, WAITING, DONE) พร้อมจุดสีและป้ายกำกับตามชุดสีระบบ
    - ตัวเลือกธีมสีคอลัมน์ 6 โทนสี (`default`, `lavender`, `amber`, `rose`, `cyan`, `mint`) พร้อมวงแหวนสถานะที่เลือก
    - ตัวเลือกไอคอนคอลัมน์แบบยุบ-ขยาย (`ColumnIconPicker` และ `ColumnIconGlyph`)
    - ตัวเลขจำกัดจำนวนการ์ด WIP Limit (1-99)
  - **Inline Editing & Deletion Protection:**
    - คอลัมน์เดิมแต่ละขั้นตอนรองรับการกดแก้ไขชื่อ/สถานะ/สี/ไอคอน/WIP limit และลบคอลัมน์
    - ป้องกันการลบคอลัมน์ที่มีการ์ดคงค้างอยู่ด้านใน พร้อมแจ้งเตือนผู้ใช้
    - เชื่อมโยงระบบยืนยันความปลอดภัย `ConfirmModal` ทั้งสำหรับการแก้ไขและการลบคอลัมน์ตามข้อกำหนด `AGENTS.md`
    - แจ้งเตือนความสำเร็จและข้อผิดพลาดด้วย Toast Notification ทุกครั้งที่มีการเปลี่ยนแปลงข้อมูล (CUD operations)
  - **Live Reactive Synchronization:** ส่ง Custom Event `board-columns-updated` และเรียกใช้ callback `onColumnsChange` เพื่อให้บอร์ด Kanban และหน้าตั้งค่าซิงค์ข้อมูลคอลัมน์แบบเรียลไทม์
- Reviewed: Vitest 89/89 test files ผ่าน (455/455 tests ผ่าน), ESLint 0 warnings/errors, Prisma validate ผ่าน, Next.js production build ผ่าน 100% (38/38 routes).

### 2026-10-05 — เพิ่มระบบแม่แบบและตกแต่งสถานะการ์ด (Status Workflow Templates & Decoration in Attributes Tab)
- Added/changed: `src/lib/kanban/status.ts`, `src/components/kanban/board-attributes-tab.tsx`, `src/lib/kanban/status.test.ts`, `src/components/kanban/board-settings-attributes.test.ts`, `docs/system-guide.md`, `src/components/help/help-center-client.tsx`.
- Tokens/variants:
  - **Status Workflow Templates Bar:** เพิ่มแถบเลือกแม่แบบขั้นตอนงานสำเร็จรูป 7 สไตล์ ได้แก่ Classic Kanban, Software & IT, Agile & Scrum, Marketing & Content, Bug Tracker, Creative & Design, และ Sales Pipeline พร้อมแสดงจำนวนสถานะและไอคอนเฉพาะหมวด
  - **Template Preview & Decoration Modal:** หน้าต่างดูตัวอย่างขั้นตอนงานแบบภาพรวม แสดงป้ายสถานะพร้อมเชื่อมโยงด้วยลูกศร Flow และตัวเลือกโหมดการปรับใช้:
    - `แทนที่ทั้งหมด (Replace All)`
    - `เพิ่มต่อท้าย (Append New)`
  - **Inline Status Editor & Decoration:**
    - เพิ่มความสามารถในการแก้ไขชื่อและปรับเปลี่ยนคู่สีของสถานะเดิม (Inline Status Label & 8 Color Swatches)
    - ป้องกันความปลอดภัยด้วย `ConfirmModal` ทุกครั้งที่มีการบันทึกการแก้ไขหรือลบสถานะ
    - ปรับปรุงการแสดงผลรายการสถานะให้คมชัด สไตล์ Retro Lofi Indigo พร้อมตัวบอกลำดับเลขและปุ่มสลับขึ้น/ลง
  - **Save Custom Template:** รองรับการบันทึกชุดขั้นตอนงานที่ผู้ใช้ปรับแต่งเองเก็บไว้ในคลังแม่แบบส่วนตัวสำหรับใช้งานซ้ำ
  - แจ้งเตือน Toast ทุกการดำเนินการตามข้อกำหนด `AGENTS.md`
- Reviewed: Vitest 89/89 test files ผ่าน (457/457 tests ผ่าน), ESLint 0 warnings/errors, Prisma validate ผ่าน, Next.js production build ผ่าน 100% (38/38 routes).
