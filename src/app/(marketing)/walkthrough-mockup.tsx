"use client";

import Image from "next/image";
import { Check, Circle, ArrowRight } from "lucide-react";
import type { WalkthroughSlide } from "./landing-data";

export function WalkthroughMockupScreen({
  slide,
  isPlaying,
  onToggleAudio
}: {
  slide: WalkthroughSlide;
  isPlaying: boolean;
  onToggleAudio: () => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "20px",
        background: "var(--panel-strong)",
        boxShadow: "var(--shadow-panel)",
        overflow: "hidden"
      }}
    >
      {/* Top Window Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid var(--border)",
          background: "var(--paper)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative", width: "20px", height: "20px" }}>
            <Image
              src={slide.iconSrc}
              alt=""
              fill
              sizes="20px"
              className="object-contain"
            />
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "var(--foreground)"
            }}
          >
            {slide.subtitle}
          </span>
        </div>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "1.6px",
            color: "var(--muted)",
            fontWeight: 600
          }}
        >
          {slide.chapter}
        </span>
      </div>

      {/* Main Sheet Body */}
      <div style={{ padding: "24px" }}>
        {slide.id === "workspaces" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                tag: "WORK PROJECT",
                name: "Retzlo Product Studio",
                meta: "4 บอร์ดงาน · 18 การ์ด",
                progress: "75%",
                note: "อัปเดตล่าสุดเมื่อ 10 นาทีที่แล้ว"
              },
              {
                tag: "PERSONAL SPACE",
                name: "สมุดบันทึกและเป้าหมายปีนี้",
                meta: "3 โฟลเดอร์โน้ต · บันทึกรายวัน",
                progress: "90%",
                note: "พื้นที่ส่วนตัวเฉพาะคุณ"
              }
            ].map((ws) => (
              <div
                key={ws.name}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "var(--paper)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "9px",
                      letterSpacing: "1.4px",
                      color: "var(--accent)",
                      fontWeight: 600
                    }}
                  >
                    {ws.tag}
                  </span>
                  <h4
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: "19px",
                      fontWeight: 500,
                      marginTop: "6px",
                      color: "var(--foreground)"
                    }}
                  >
                    {ws.name}
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--muted)",
                      marginTop: "4px"
                    }}
                  >
                    {ws.meta}
                  </p>
                </div>

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "11px",
                    color: "var(--muted)"
                  }}
                >
                  <span>{ws.note}</span>
                  <strong style={{ color: "var(--foreground)" }}>
                    {ws.progress}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.id === "kanban" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                stage: "To do",
                dot: "#c4b5fd",
                items: [
                  { title: "เรียบเรียงเนื้อหาคู่มือเริ่มต้น", sub: "กำหนดส่ง พรุ่งนี้" },
                  { title: "เตรียมภาพประกอบหน้าหลัก", sub: "2 รายการย่อย" }
                ]
              },
              {
                stage: "In progress",
                dot: "#f6c976",
                items: [
                  { title: "ปรับปรุงหน้าแนะนำการใช้งาน", sub: "กำลังดำเนินการ" }
                ]
              },
              {
                stage: "Done",
                dot: "#92d9bb",
                items: [
                  { title: "ตั้งค่าโครงสร้างโปรเจกต์หลัก", sub: "เสร็จสมบูรณ์" },
                  { title: "เชื่อมปฏิทินวันครบกำหนด", sub: "เสร็จสมบูรณ์" }
                ]
              }
            ].map((col) => (
              <div
                key={col.stage}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "14px",
                  background: "var(--paper)"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    marginBottom: "12px"
                  }}
                >
                  <span
                    style={{
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: col.dot
                    }}
                  />
                  <span>{col.stage}</span>
                </div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {col.items.map((card) => (
                    <div
                      key={card.title}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: "9px",
                        padding: "11px 12px",
                        background: "var(--panel-strong)"
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: "var(--foreground)",
                          lineHeight: 1.4
                        }}
                      >
                        {card.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "var(--muted)",
                          marginTop: "6px"
                        }}
                      >
                        {card.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {slide.id === "calendar" && (
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "16px",
              background: "var(--paper)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "14px"
              }}
            >
              <span
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "17px",
                  color: "var(--foreground)"
                }}
              >
                October · ตารางกำหนดส่งรายสัปดาห์
              </span>
              <span style={{ fontSize: "11px", color: "var(--muted)" }}>
                ซิงก์จากการ์ดงานอัตโนมัติ
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {[
                { day: "Mon 12", task: "ทบทวนแผนประจำสัปดาห์", done: true },
                { day: "Tue 13", task: null, done: false },
                { day: "Wed 14", task: "ส่งมอบงานออกแบบรอบแรก", done: false },
                { day: "Thu 15", task: "นัดคุยสรุปรายละเอียด", done: false },
                { day: "Fri 16", task: "บันทึกสรุปงานปลายสัปดาห์", done: false }
              ].map((cell) => (
                <div
                  key={cell.day}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "10px",
                    padding: "10px",
                    minHeight: "92px",
                    background: "var(--panel-strong)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "var(--muted)"
                    }}
                  >
                    {cell.day}
                  </span>
                  {cell.task ? (
                    <div
                      style={{
                        fontSize: "11px",
                        lineHeight: 1.35,
                        padding: "6px 8px",
                        borderRadius: "6px",
                        background: "var(--paper)",
                        border: "1px solid var(--border)",
                        color: "var(--foreground)"
                      }}
                    >
                      {cell.task}
                    </div>
                  ) : (
                    <span style={{ fontSize: "10px", color: "var(--muted)", opacity: 0.5 }}>
                      ว่าง
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.id === "notes" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                folder: "PROJECT BRIEF",
                title: "แนวทางการเขียนและน้ำเสียงของแบรนด์",
                body: "เน้นภาษาที่อ่านเข้าใจง่าย เป็นธรรมชาติ ไม่ใช้คำโฆษณาเกินจริง และเว้นจังหวะบรรทัดให้สบายตา"
              },
              {
                folder: "MEETING NOTES",
                title: "สรุปประเด็นสำคัญจากการคุยทีมประจำสัปดาห์",
                body: "แยกบอร์ดงานหลักออกจากรายการไอเดียสำรอง เพื่อให้หน้าบอร์ดไม่แน่นจนเกินไป"
              }
            ].map((note) => (
              <div
                key={note.title}
                style={{
                  border: "1px solid var(--border)",
                  borderRadius: "14px",
                  padding: "18px",
                  background: "var(--paper)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "1.4px",
                    color: "var(--accent)",
                    fontWeight: 600
                  }}
                >
                  {note.folder}
                </span>
                <h4
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "17px",
                    fontWeight: 500,
                    color: "var(--foreground)"
                  }}
                >
                  {note.title}
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.65,
                    color: "var(--muted)"
                  }}
                >
                  {note.body}
                </p>
              </div>
            ))}
          </div>
        )}

        {slide.id === "diary" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "18px",
                background: "var(--paper)"
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "1.4px",
                  color: "var(--accent)",
                  fontWeight: 600
                }}
              >
                FRIDAY JOURNAL
              </span>
              <h4
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: "18px",
                  fontWeight: 500,
                  margin: "8px 0",
                  color: "var(--foreground)"
                }}
              >
                บันทึกท้ายวันศุกร์
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  lineHeight: 1.7,
                  color: "var(--muted)"
                }}
              >
                &ldquo;วันนี้เลือกทำเฉพาะ 3 งานหลักที่ตั้งใจไว้ตอนเช้า พอไม่ต้องคอยสลับหน้าจอไปมาแล้วเสร็จเร็วกว่าที่คิด มีเวลาเหลือช่วงเย็นได้พักอ่านหนังสือเงียบๆ&rdquo;
              </p>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "18px",
                background: "var(--paper)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "10px"
              }}
            >
              <span
                style={{
                  fontSize: "9px",
                  letterSpacing: "1.4px",
                  color: "var(--muted)",
                  fontWeight: 600
                }}
              >
                DAILY ROUTINE
              </span>
              {[
                { text: "จัดลำดับ 3 งานสำคัญตอนเช้า", done: true },
                { text: "โฟกัสงานหลักโดยไม่เปิดแชต 1 ชั่วโมง", done: true },
                { text: "สรุปโน้ตสั้นๆ ก่อนปิดคอมพิวเตอร์", done: false }
              ].map((item) => (
                <div
                  key={item.text}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    fontSize: "12px",
                    padding: "8px 10px",
                    borderRadius: "8px",
                    background: "var(--panel-strong)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)"
                  }}
                >
                  {item.done ? (
                    <Check size={14} style={{ color: "var(--accent)" }} />
                  ) : (
                    <Circle size={14} style={{ color: "var(--muted)" }} />
                  )}
                  <span
                    style={{
                      textDecoration: item.done ? "line-through" : "none",
                      opacity: item.done ? 0.7 : 1
                    }}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {slide.id === "zen-lofi" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "18px",
                background: "var(--paper)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "14px"
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "1.4px",
                    color: "var(--accent)",
                    fontWeight: 600
                  }}
                >
                  SIDE A · THE EVERYDAY MIX
                </span>
                <h4
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "19px",
                    fontWeight: 500,
                    marginTop: "6px",
                    color: "var(--foreground)"
                  }}
                >
                  เสียงดนตรีบรรเลงขณะทำงาน
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.65,
                    color: "var(--muted)",
                    marginTop: "6px"
                  }}
                >
                  สังเคราะห์เสียงคอร์ดนุ่มๆ และเสียงแผ่นเสียงเบาๆ จากเบราว์เซอร์โดยตรง ช่วยสร้างบรรยากาศที่สงบเวลาต้องใช้สมาธิ
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleAudio}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: "10px",
                  border: "1px solid var(--border)",
                  background: "var(--panel-strong)",
                  color: "var(--foreground)",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                <span>
                  {isPlaying ? "กำลังเล่นเพลงบรรเลง (คลิกเพื่อหยุด)" : "ลองเปิดฟังเสียงเพลงบรรเลง"}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div
              style={{
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "18px",
                background: "var(--paper)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "9px",
                    letterSpacing: "1.4px",
                    color: "var(--muted)",
                    fontWeight: 600
                  }}
                >
                  LITTLE REWARDS
                </span>
                <h4
                  style={{
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    fontSize: "19px",
                    fontWeight: 500,
                    marginTop: "6px",
                    color: "var(--foreground)"
                  }}
                >
                  รางวัลเล็กๆ หลังจบงาน
                </h4>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.65,
                    color: "var(--muted)",
                    marginTop: "6px"
                  }}
                >
                  นำคะแนนที่สะสมจากการเคลียร์การ์ดงานไปแลกเวลาพักดื่มกาแฟ ดูภาพยนตร์ หรือดูแลต้นไม้ในมุมสวนหินญี่ปุ่น
                </p>
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "var(--muted)",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "10px"
                }}
              >
                ช่วยให้การเคลียร์งานแต่ละวันมีจุดหมายที่จับต้องได้
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
