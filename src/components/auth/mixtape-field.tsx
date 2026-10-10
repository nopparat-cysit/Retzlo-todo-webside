"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import styles from "./login-scene.module.css";

interface MixtapeFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: LucideIcon;
}

export function MixtapeField({ label, icon: Icon, type = "text", id, ...props }: MixtapeFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrap}>
        <Icon size={16} aria-hidden="true" />
        <input {...props} id={id} type={type === "password" && visible ? "text" : type} className={styles.input} />
        {type === "password" ? (
          <button type="button" className={styles.reveal} aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible((current) => !current)}>
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : null}
      </div>
    </div>
  );
}
