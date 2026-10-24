"use client";

import { BellRing, Check, Copy, FileText, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./zen-fortune-reading.module.css";

export interface FortuneDimension {
  id: string;
  label: string;
  content: string;
  icon: LucideIcon;
}

interface ZenFortuneReadingProps {
  number: number;
  japaneseNumber: string;
  rankJp: string;
  rankRomaji: string;
  rankName: string;
  title: string;
  verse: string;
  date: string;
  isEn: boolean;
  dimensions: FortuneDimension[];
  copied: boolean;
  isAttachingNote: boolean;
  isRingingChime: boolean;
  hasProject: boolean;
  onLanguageChange: (language: "th" | "en") => void;
  onCopy: () => void;
  onAttach: () => void;
  onRing: () => void;
}

export function ZenFortuneReading({
  number, japaneseNumber, rankJp, rankRomaji, rankName, title, verse, date,
  isEn, dimensions, copied, isAttachingNote, isRingingChime, hasProject,
  onLanguageChange, onCopy, onAttach, onRing
}: ZenFortuneReadingProps) {
  const lotNumber = String(number).padStart(2, "0");

  return (
    <div className={styles.reader}>
      <div className={styles.toolbar}>
        <div className={styles.edition}>
          <span className={styles.editionDot} aria-hidden="true" />
          <span>{isEn ? "YOUR DAILY OMIKUJI" : "ใบคำทำนายประจำวัน"}</span>
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" onClick={onRing} disabled={isRingingChime}
            className={styles.bowlButton}
            aria-label={isEn ? "Ring the singing bowl" : "ฟังเสียงระฆังพักใจ"}>
            <BellRing size={16} />
          </button>
          <div className={styles.languageGroup} role="group"
            aria-label={isEn ? "Fortune language" : "ภาษาคำทำนาย"}>
            <button type="button" aria-label="แสดงภาษาไทย" aria-pressed={!isEn}
              onClick={() => onLanguageChange("th")}>ไทย</button>
            <button type="button" aria-label="Show English" aria-pressed={isEn}
              onClick={() => onLanguageChange("en")}>EN</button>
          </div>
        </div>
      </div>

      <div className={styles.viewport} tabIndex={0}
        role="region" aria-label={isEn ? "Fortune reading" : "เนื้อหาคำทำนาย"}>
        <article className={styles.paper} lang={isEn ? "en" : "th"}
          aria-label={isEn ? "Fortune slip" : "ใบคำทำนาย"}>
          <div className={styles.masthead}>
            <span>浅草寺 <span aria-hidden="true">/</span> ASAKUSA KANNON</span>
            <span className={styles.lotLabel}>NO. {lotNumber} <span>/ 100</span></span>
          </div>

          <header className={styles.paperHeader}>
            <div className={styles.headingCopy}>
              <p className={styles.rankName}>{rankName}</p>
              <h3>{title}</h3>
              <div className={styles.paperMeta}>
                <span>第{japaneseNumber}番</span>
                <span aria-hidden="true">·</span>
                <time dateTime={date}>{date}</time>
              </div>
            </div>
            <div className={styles.stamp} data-compact={rankJp.length > 2 || undefined}>
              <span lang="ja">{rankJp}</span>
              <small>{rankRomaji}</small>
            </div>
          </header>

          <section className={styles.reflection} aria-labelledby="fortune-reflection-title">
            <h4 id="fortune-reflection-title">{isEn ? "A THOUGHT FOR TODAY" : "ข้อคิดสำหรับวันนี้"}</h4>
            <blockquote className={cn(styles.verse, isEn && styles.englishVerse)}>
              <p>“{verse}”</p>
            </blockquote>
          </section>

          <div className={styles.dimensions}>
            {dimensions.map((dimension, index) => {
              const Icon = dimension.icon;
              return (
                <section key={dimension.id} className={styles.dimension}
                  aria-labelledby={`fortune-${dimension.id}-title`}>
                  <div className={styles.dimensionHeading}>
                    <span className={styles.dimensionIndex} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    <Icon size={15} aria-hidden="true" />
                    <h4 id={`fortune-${dimension.id}-title`}>{dimension.label}</h4>
                  </div>
                  <p>{dimension.content}</p>
                </section>
              );
            })}
          </div>

          <footer className={styles.paperFooter}>
            <span>RETZLO <span aria-hidden="true">/</span> QUIET GARDEN</span>
            <span lang="ja">観音百籤</span>
          </footer>
        </article>
      </div>

      <footer className={styles.actions}>
        <button type="button" onClick={onCopy} className={styles.copyButton}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span aria-live="polite">{copied ? (isEn ? "Copied" : "คัดลอกแล้ว") : (isEn ? "Copy reading" : "คัดลอกคำทำนาย")}</span>
        </button>
        <button type="button" onClick={onAttach} disabled={isAttachingNote}
          className={styles.saveButton}>
          {isAttachingNote ? <Loader2 size={16} className={styles.spin} /> : <FileText size={16} />}
          <span>{isAttachingNote ? (isEn ? "Saving…" : "กำลังบันทึก…")
            : hasProject ? (isEn ? "Add to project notes" : "แนบในโน้ตโปรเจกต์")
            : (isEn ? "Copy as a note" : "คัดลอกเป็นโน้ต")}</span>
        </button>
      </footer>
    </div>
  );
}
