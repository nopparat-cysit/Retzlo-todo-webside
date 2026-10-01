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
| Calendar | `src/app/(dashboard)/project/[id]/calendar` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; day grid, today/selected; ตรวจ events/popovers เพิ่มเมื่อมีรายการจริง |
| Diary | `src/app/(dashboard)/project/[id]/diary`, `src/components/diary/`, `hub/` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; rewards, recurrence และ states ดูสม่ำเสมอในภาพที่เห็น |
| Notes | `src/app/(dashboard)/project/[id]/notes`, `src/components/notes/` | ตรวจภาพ light/dark desktop หลัง implementation; mobile light 390x844 ในรอบ audit ก่อนแก้ | ค่าเริ่มต้นเป็น 2 columns และ center board กว้างขึ้นที่ `xl`; card preview อ่านง่ายขึ้นใน desktop; retest mobile หลังแก้คงเหลือ |
| Members | `src/app/(dashboard)/project/[id]/members` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; avatar, role/status labels และ invitation surface ดูสม่ำเสมอ |
| Rewards | project rewards routes, `src/components/project/rewards-store.tsx` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; reward cards, coin balance, empty states ดูสม่ำเสมอ |
| Settings | `src/app/(dashboard)/project/[id]/settings` | ตรวจภาพ light/dark desktop; mobile light 390x844; source | ไม่มี document-level overflow ที่ 390px; theme controls, forms, feature panels ดูสม่ำเสมอในภาพที่เห็น |
| AI Chat widget | `src/components/ai/ai-chat-widget.tsx` | ตรวจภาพ local 1280×720: Light side panel; Dark float และ side panel; ตรวจ source ของร่างสร้างการ์ดและ ConfirmModal | Launcher, welcome/assistant bubble, quick prompts, input และ controls อ่านได้ทั้งสองธีม; UI ยืนยันสร้างการ์ดใช้ semantic tokens แต่ยังไม่ได้เปิดภาพ state นี้; context/credit banner ยังไม่ยืนยันด้วยภาพเพราะ local DB ใช้งานไม่ได้; mobile/focus ยังเหลือ |
| Shared overlay/status UI | `src/components/ui/` | ตรวจ source; Design System light visual หลัง implementation สำหรับ error/success/card samples, modal, toast; profile menu light/dark | Status tokens ใช้กับ shared states, Button, ConfirmModal และ toast; tooltip, keyboard focus, skeleton และทุก destructive state ยังต้องไล่ visual เพิ่ม |
| Design-system preview | `src/app/design-system/` | production `/design-system` ตอบ 404 ในรอบก่อน; local light visual หลัง implementation | ใช้ local เป็น visual QA; production route availability ยังเป็น deployment follow-up |
| โมดูล/หน้าที่เพิ่มในอนาคต | เพิ่ม path จริงเมื่อสร้าง | ยังไม่มี | ต้องเพิ่มแถวก่อนปิดงาน feature |

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
- Tokens/variants: ตัวอย่างการ์ดร่างใช้ `theme-panel-strong`, `theme-paper`, `theme-foreground`, `theme-muted`, `theme-border`, `theme-success-*` และ shared `ConfirmModal`; มีผลกับ AI Chat widget ที่แสดงทุก route ยกเว้นหน้า auth.
- Reviewed: ตรวจ source ของ Light/Dark tokens, membership/private-board checks, schema parsing และ confirmation flow; ยังไม่ได้ตรวจภาพ state ข้อเสนอ/ยืนยัน เนื่องจากฐานข้อมูล local ใช้งานไม่ได้.
- Follow-ups: ตรวจ end-to-end เมื่อ Neon พร้อม โดยยืนยันว่ามีรายการร่างก่อน และสร้างข้อมูลเฉพาะหลังคลิก Confirm; ตรวจ mobile และ keyboard focus.
