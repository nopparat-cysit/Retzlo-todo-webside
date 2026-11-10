import type { ReactElement } from "react";

export type FolderIconId =
  | "folder"
  | "folder-open"
  | "briefcase"
  | "rocket"
  | "lightbulb"
  | "book"
  | "target"
  | "tag"
  | "palette"
  | "note"
  | "coffee"
  | "star"
  | "sparkles"
  | "heart"
  | "calendar"
  | "trophy";

export interface FolderIconOption {
  id: FolderIconId;
  label: string;
  emojiFallback: string;
}

export const FOLDER_ICON_OPTIONS: FolderIconOption[] = [
  { id: "folder", label: "Folder", emojiFallback: "\u{1F4C1}" },
  { id: "folder-open", label: "Open Folder", emojiFallback: "\u{1F4C2}" },
  { id: "briefcase", label: "Briefcase", emojiFallback: "\u{1F4BC}" },
  { id: "rocket", label: "Rocket", emojiFallback: "\u{1F680}" },
  { id: "lightbulb", label: "Lightbulb", emojiFallback: "\u{1F4A1}" },
  { id: "book", label: "Books", emojiFallback: "\u{1F4DA}" },
  { id: "target", label: "Target", emojiFallback: "\u{1F3AF}" },
  { id: "tag", label: "Tag", emojiFallback: "\u{1F3F7}\uFE0F" },
  { id: "palette", label: "Palette", emojiFallback: "\u{1F3A8}" },
  { id: "note", label: "Legal Pad", emojiFallback: "\u{1F4DD}" },
  { id: "coffee", label: "Coffee", emojiFallback: "\u{2615}" },
  { id: "star", label: "Star", emojiFallback: "\u{2B50}" },
  { id: "sparkles", label: "Sparkles", emojiFallback: "\u{2728}" },
  { id: "heart", label: "Heart", emojiFallback: "\u{2764}\uFE0F" },
  { id: "calendar", label: "Calendar", emojiFallback: "\u{1F4C5}" },
  { id: "trophy", label: "Trophy", emojiFallback: "\u{1F3C6}" }
];

interface SvgProps {
  className?: string;
  size?: number;
}

function FolderSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M2.5 7.5C2.5 6.39543 3.39543 5.5 4.5 5.5H8.79289C9.32332 5.5 9.83207 5.71071 10.2071 6.08579L11.4142 7.29289C11.7893 7.66797 12.298 7.87868 12.8284 7.87868H19.5C20.6046 7.87868 21.5 8.77411 21.5 9.87868V17.5C21.5 18.6046 20.6046 19.5 19.5 19.5H4.5C3.39543 19.5 2.5 18.6046 2.5 17.5V7.5Z"
        fill="#f59e0b"
      />
      <path d="M5.5 7H18.5V11H5.5V7Z" fill="#fef3c7" />
      <line
        x1="7"
        y1="8.5"
        x2="17"
        y2="8.5"
        stroke="#c4b5fd"
        strokeWidth="1"
        strokeDasharray="1.5 1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 11C2.5 9.89543 3.39543 9 4.5 9H19.5C20.6046 9 21.5 9.89543 21.5 11V17.5C21.5 18.6046 20.6046 19.5 19.5 19.5H4.5C3.39543 19.5 2.5 18.6046 2.5 17.5V11Z"
        fill="#fbbf24"
      />
      <path
        d="M3.5 18H20.5"
        stroke="#b45309"
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeLinecap="round"
      />
      <rect x="9.5" y="10" width="5" height="3" rx="1" fill="#818cf8" />
      <circle cx="12" cy="11.5" r="0.75" fill="#fef3c7" />
    </svg>
  );
}

function FolderOpenSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M2.5 6.5C2.5 5.39543 3.39543 4.5 4.5 4.5H8.79289C9.32332 4.5 9.83207 4.71071 10.2071 5.08579L11.4142 6.29289C11.7893 6.66797 12.298 6.87868 12.8284 6.87868H19.5C20.6046 6.87868 21.5 7.77411 21.5 8.87868V16C21.5 17.1046 20.6046 18 19.5 18H4.5C3.39543 18 2.5 17.1046 2.5 16V6.5Z"
        fill="#b45309"
      />
      <rect x="5" y="4" width="14" height="11" rx="1.5" fill="#e2e8f0" />
      <rect x="6" y="5.5" width="12" height="10" rx="1.5" fill="#f8fafc" />
      <line x1="8" y1="8" x2="16" y2="8" stroke="#818cf8" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="10.5" x2="14" y2="10.5" stroke="#c4b5fd" strokeWidth="1" strokeLinecap="round" />
      <line x1="8" y1="13" x2="15" y2="13" stroke="#c4b5fd" strokeWidth="1" strokeLinecap="round" />
      <path
        d="M2.2 11.5C2.36569 10.6657 3.09706 10.05 3.94706 10.05H20.0529C20.9029 10.05 21.6343 10.6657 21.8 11.5L22.9 17.5C23.1 18.6 22.25 19.6 21.1 19.6H2.9C1.75 19.6 0.9 18.6 1.1 17.5L2.2 11.5Z"
        fill="#fbbf24"
      />
      <path
        d="M3.5 12H20.5"
        stroke="#fef3c7"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeOpacity="0.8"
      />
    </svg>
  );
}

function BriefcaseSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V7H9V6Z"
        stroke="#78350f"
        strokeWidth="1.8"
      />
      <rect x="2.5" y="7" width="19" height="13.5" rx="2.5" fill="#b45309" />
      <path
        d="M2.5 9.5C2.5 8.11929 3.61929 7 5 7H19C20.3807 7 21.5 8.11929 21.5 9.5V13.5C21.5 14.3284 20.8284 15 20 15H4C3.17157 15 2.5 14.3284 2.5 13.5V9.5Z"
        fill="#f59e0b"
      />
      <line x1="3" y1="15" x2="21" y2="15" stroke="#78350f" strokeWidth="1" strokeOpacity="0.5" />
      <rect x="6.5" y="7" width="2" height="13.5" rx="0.5" fill="#78350f" />
      <rect x="6" y="13.5" width="3" height="2.5" rx="0.5" fill="#fbbf24" stroke="#78350f" strokeWidth="0.6" />
      <rect x="15.5" y="7" width="2" height="13.5" rx="0.5" fill="#78350f" />
      <rect x="15" y="13.5" width="3" height="2.5" rx="0.5" fill="#fbbf24" stroke="#78350f" strokeWidth="0.6" />
      <rect x="11" y="14" width="2" height="2" rx="0.5" fill="#fbbf24" />
    </svg>
  );
}

function RocketSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path d="M7.5 18.5L6.5 22L9 20L10 18.5" fill="#f59e0b" />
      <path d="M7 19L6.5 21.5L8.5 20" fill="#fbbf24" />
      <path d="M16.5 18.5L17.5 22L15 20L14 18.5" fill="#f59e0b" />
      <path d="M17 19L17.5 21.5L15.5 20" fill="#fbbf24" />
      <path d="M10.5 19L12 23L13.5 19" fill="#f43f5e" />
      <path d="M7 13.5C5.5 14 3 16.5 3 18C4.5 18 7 17.5 8 16.5L7 13.5Z" fill="#e11d48" />
      <path d="M17 13.5C18.5 14 21 16.5 21 18C19.5 18 17 17.5 16 16.5L17 13.5Z" fill="#e11d48" />
      <path d="M12 2C9 5.5 8 11 8 17H16C16 11 15 5.5 12 2Z" fill="#f8fafc" />
      <path d="M12 2C10.5 3.8 9.5 6 9 8.5H15C14.5 6 13.5 3.8 12 2Z" fill="#fb7185" />
      <rect x="8" y="16.5" width="8" height="1.5" fill="#6366f1" />
      <circle cx="12" cy="11.5" r="2.75" fill="#0d9488" />
      <circle cx="12" cy="11.5" r="2" fill="#2dd4bf" />
      <circle cx="11.3" cy="10.8" r="0.6" fill="#ccfbf1" />
    </svg>
  );
}

function LightbulbSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <line x1="12" y1="1" x2="12" y2="3" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4.5" y1="4.5" x2="6" y2="6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="19.5" y1="4.5" x2="18" y2="6" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2" y1="11" x2="4" y2="11" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="11" x2="20" y2="11" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12 4C8.68629 4 6 6.68629 6 10C6 12.35 7.35 14.39 9.3 15.35C9.7 15.55 10 16 10 16.5H14C14 16 14.3 15.55 14.7 15.35C16.65 14.39 18 12.35 18 10C18 6.68629 15.3137 4 12 4Z"
        fill="#fef3c7"
      />
      <path
        d="M10 13L10.5 9.5C10.5 8.7 11.2 8 12 8C12.8 8 13.5 8.7 13.5 9.5L14 13"
        stroke="#f59e0b"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="8" r="0.75" fill="#f43f5e" />
      <rect x="9.5" y="17" width="5" height="1.5" rx="0.5" fill="#b45309" />
      <rect x="10" y="19" width="4" height="1.5" rx="0.5" fill="#78350f" />
      <path d="M10.8 21H13.2L12.5 22.2C12.3 22.5 11.7 22.5 11.5 22.2L10.8 21Z" fill="#475569" />
    </svg>
  );
}

function BookSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <rect x="3" y="16" width="18" height="5" rx="1.5" fill="#0d9488" />
      <rect x="5.5" y="17" width="15" height="3" fill="#f8fafc" />
      <line x1="3" y1="16" x2="3" y2="21" stroke="#2dd4bf" strokeWidth="1.5" />
      <rect x="4" y="10.5" width="16" height="5" rx="1.5" fill="#b45309" />
      <rect x="6" y="11.5" width="13.5" height="3" fill="#fef3c7" />
      <line x1="4" y1="10.5" x2="4" y2="15.5" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="4.5" y="5" width="15" height="5" rx="1.5" fill="#6366f1" />
      <rect x="6.5" y="6" width="12.5" height="3" fill="#f8fafc" />
      <line x1="4.5" y1="5" x2="4.5" y2="10" stroke="#a78bfa" strokeWidth="1.5" />
      <path d="M14 5V13.5L15.5 12.2L17 13.5V5H14Z" fill="#fb7185" />
    </svg>
  );
}

function TargetSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <circle cx="12" cy="12" r="10" fill="#c4b5fd" />
      <circle cx="12" cy="12" r="9.5" stroke="#818cf8" strokeWidth="1" />
      <circle cx="12" cy="12" r="7.5" fill="#f8fafc" />
      <circle cx="12" cy="12" r="5" fill="#fb7185" />
      <circle cx="12" cy="12" r="4.6" stroke="#e11d48" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="2.5" fill="#fbbf24" />
      <circle cx="12" cy="12" r="1" fill="#fef3c7" />
      <path d="M18.5 5.5L14.5 9.5" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17.5 3.5L19.5 5.5L20.5 4.5" stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M19.5 7.5L21.5 5.5" stroke="#1e1b4b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function TagSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M5.5 6.5C4 4 4.5 1.5 7.5 2C10.5 2.5 8 5.5 6 6"
        stroke="#818cf8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 9.5L9.5 4.5C10.2 3.8 11.2 3.4 12.2 3.4H19C20.1 3.4 21 4.3 21 5.4V12.2C21 13.2 20.6 14.2 19.9 14.9L14.9 19.9C13.5 21.3 11.2 21.3 9.8 19.9L4.5 14.6C3.1 13.2 3.1 10.9 4.5 9.5Z"
        fill="#f59e0b"
      />
      <path
        d="M5.8 10.4L10.4 5.8C10.9 5.3 11.6 5 12.3 5H18.5C19.3 5 20 5.7 20 6.5V12.7C20 13.4 19.7 14.1 19.2 14.6L14.6 19.2C13.6 20.2 12.1 20.2 11.1 19.2L5.8 13.9C4.8 12.9 4.8 11.4 5.8 10.4Z"
        fill="#fbbf24"
      />
      <circle cx="16.5" cy="7.5" r="1.8" fill="#fef3c7" />
      <circle cx="16.5" cy="7.5" r="1" fill="#78350f" />
      <line x1="10" y1="13.5" x2="14" y2="9.5" stroke="#78350f" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="11.5" y1="15" x2="15.5" y2="11" stroke="#78350f" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
      <line x1="13" y1="16.5" x2="17" y2="12.5" stroke="#78350f" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.6" />
    </svg>
  );
}

function PaletteSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M12 2C6.48 2 2 6.48 2 12C2 16.5 5.5 20.2 10 20.9C10.7 21 11.3 20.4 11.3 19.7V18.5C11.3 17.1 12.4 16 13.8 16H16C19.3 16 22 13.3 22 10C22 5.58 17.52 2 12 2Z"
        fill="#f59e0b"
      />
      <path
        d="M12 3.5C7.3 3.5 3.5 7.3 3.5 12C3.5 15.8 6.5 19 10.3 19.4C10.1 18.9 10 18.3 10 17.7V17C10 15.3 11.3 14 13 14H15.5C18.5 14 20.5 12 20.5 9.5C20.5 5.9 16.8 3.5 12 3.5Z"
        fill="#fbbf24"
      />
      <ellipse cx="16.5" cy="16.5" rx="1.5" ry="1.8" fill="#78350f" />
      <circle cx="6.5" cy="8.5" r="1.8" fill="#fb7185" />
      <circle cx="11.5" cy="6" r="1.8" fill="#818cf8" />
      <circle cx="16.5" cy="7.5" r="1.8" fill="#2dd4bf" />
      <circle cx="7.5" cy="14" r="1.8" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.5" />
    </svg>
  );
}

function NoteSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <rect x="3.5" y="3" width="13" height="18" rx="1.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" />
      <rect x="3.5" y="3" width="13" height="3" rx="0.5" fill="#78350f" />
      <line x1="6.5" y1="6" x2="6.5" y2="21" stroke="#fb7185" strokeWidth="0.8" />
      <line x1="7.5" y1="9" x2="15" y2="9" stroke="#818cf8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="7.5" y1="12" x2="15" y2="12" stroke="#818cf8" strokeWidth="0.8" strokeLinecap="round" />
      <line x1="7.5" y1="15" x2="12" y2="15" stroke="#818cf8" strokeWidth="0.8" strokeLinecap="round" />
      <g transform="rotate(45 18 16)">
        <rect x="15" y="6" width="3" height="12" rx="0.5" fill="#fbbf24" />
        <rect x="15" y="4" width="3" height="2" rx="0.5" fill="#fb7185" />
        <rect x="15" y="5.7" width="3" height="0.8" fill="#e2e8f0" />
        <path d="M15 18L16.5 21L18 18H15Z" fill="#fef3c7" />
        <path d="M16 20L16.5 21L17 20H16Z" fill="#1e1b4b" />
      </g>
    </svg>
  );
}

function CoffeeSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path d="M7.5 5.5C7.5 4 8.5 3 8.5 1.5" stroke="#2dd4bf" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M11 5C11 3.5 12 2.5 12 1" stroke="#c4b5fd" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="10.5" cy="20.5" rx="8.5" ry="2" fill="#818cf8" />
      <ellipse cx="10.5" cy="20.5" rx="7" ry="1.2" fill="#c4b5fd" />
      <path
        d="M15 9.5C17.5 9.5 19.5 11 19.5 13C19.5 15 17.5 16.5 15 16.5"
        stroke="#6366f1"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M4.5 7.5H16.5V16C16.5 18.5 13.8 20 10.5 20C7.2 20 4.5 18.5 4.5 16V7.5Z"
        fill="#818cf8"
      />
      <ellipse cx="10.5" cy="7.5" rx="6" ry="2" fill="#6366f1" />
      <ellipse cx="10.5" cy="7.5" rx="5" ry="1.4" fill="#b45309" />
      <ellipse cx="10.5" cy="7.5" rx="3.5" ry="0.8" fill="#f59e0b" />
      <path d="M6.5 9.5V15.5" stroke="#f8fafc" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
    </svg>
  );
}

function StarSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M12 2.5L14.7 8.3L21 9.2L16.4 13.8L17.5 20.2L12 17.2L6.5 20.2L7.6 13.8L3 9.2L9.3 8.3L12 2.5Z"
        fill="#f59e0b"
      />
      <path
        d="M12 3.8L14.3 8.7C14.5 9.1 14.9 9.4 15.3 9.5L20.6 10.2L16.7 14.1C16.4 14.4 16.3 14.8 16.4 15.3L17.3 20.6L12.7 18C12.3 17.8 11.7 17.8 11.3 18L6.7 20.6L7.6 15.3C7.7 14.8 7.6 14.4 7.3 14.1L3.4 10.2L8.7 9.5C9.1 9.4 9.5 9.1 9.7 8.7L12 3.8Z"
        fill="#fbbf24"
      />
      <path
        d="M11 6L9 9.5C8.8 10 8.2 10.3 7.6 10.4L5.5 10.7"
        stroke="#fef3c7"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path d="M18.5 2V5M17 3.5H20" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SparklesSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M11 2C11 6.5 7.5 9.5 3 10C7.5 10.5 11 13.5 11 18C11 13.5 14.5 10.5 19 10C14.5 9.5 11 6.5 11 2Z"
        fill="#818cf8"
      />
      <circle cx="11" cy="10" r="1.5" fill="#f8fafc" />
      <path
        d="M18 12C18 14.5 16 16.5 13.5 17C16 17.5 18 19.5 18 22C18 19.5 20 17.5 22.5 17C20 16.5 18 14.5 18 12Z"
        fill="#2dd4bf"
      />
      <circle cx="18" cy="17" r="1" fill="#ccfbf1" />
      <path d="M6 17L7 19L9 20L7 21L6 23L5 21L3 20L5 19L6 17Z" fill="#fbbf24" />
      <circle cx="18" cy="5" r="1.2" fill="#fb7185" />
    </svg>
  );
}

function HeartSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill="#e11d48"
      />
      <path
        d="M12 20.5L10.7 19.3C6 15 3 12.1 3 8.7C3 6 5.1 4 7.7 4C9.3 4 10.8 4.7 11.8 5.9L12 6.1L12.2 5.9C13.2 4.7 14.7 4 16.3 4C18.9 4 21 6 21 8.7C21 12.1 18 15 13.3 19.3L12 20.5Z"
        fill="#fb7185"
      />
      <path d="M5 8C5 6.5 6.2 5.5 7.7 5.5" stroke="#ffe4e6" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M4 14L8 18L10 16L6 12L4 14Z" fill="#c4b5fd" />
      <path d="M14 8L16 6L20 10L18 12L14 8Z" fill="#c4b5fd" />
      <path d="M7 15L17 7" stroke="#f8fafc" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CalendarSvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" fill="#6366f1" />
      <rect x="4" y="6" width="16" height="14" rx="1.5" fill="#f8fafc" />
      <path d="M4 7.5C4 6.67 4.67 6 5.5 6H18.5C19.33 6 20 6.67 20 7.5V10.5H4V7.5Z" fill="#fb7185" />
      <rect x="7" y="3" width="2" height="4.5" rx="1" fill="#fbbf24" stroke="#78350f" strokeWidth="0.5" />
      <rect x="15" y="3" width="2" height="4.5" rx="1" fill="#fbbf24" stroke="#78350f" strokeWidth="0.5" />
      <rect x="7" y="13" width="2" height="4" rx="0.5" fill="#1e1b4b" />
      <path d="M11 13H15V14.5L12.5 17H15V18.5H11V17L13.5 14.5H11V13Z" fill="#1e1b4b" />
    </svg>
  );
}

function TrophySvg({ className, size }: SvgProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
    >
      <path
        d="M6 6H4.5C3.67 6 3 6.67 3 7.5V9.5C3 11.43 4.57 13 6.5 13H7"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 6H19.5C20.33 6 21 6.67 21 7.5V9.5C21 11.43 19.43 13 17.5 13H17"
        stroke="#f59e0b"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M6 4H18V10C18 13.31 15.31 16 12 16C8.69 16 6 13.31 6 10V4Z" fill="#fbbf24" />
      <rect x="5.5" y="3.5" width="13" height="2" rx="1" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.5" />
      <polygon
        points="12,7 13,9.5 15.5,9.5 13.5,11 14.2,13.5 12,12 9.8,13.5 10.5,11 8.5,9.5 11,9.5"
        fill="#f59e0b"
      />
      <path d="M10.5 16H13.5V18.5H10.5V16Z" fill="#f59e0b" />
      <rect x="8" y="18.5" width="8" height="2" rx="0.5" fill="#6366f1" />
      <rect x="6" y="20.5" width="12" height="2" rx="0.5" fill="#1e1b4b" />
      <rect x="9" y="19" width="6" height="1" rx="0.2" fill="#fef3c7" />
    </svg>
  );
}

const SVG_COMPONENTS: Record<FolderIconId, (props: SvgProps) => ReactElement> = {
  folder: FolderSvg,
  "folder-open": FolderOpenSvg,
  briefcase: BriefcaseSvg,
  rocket: RocketSvg,
  lightbulb: LightbulbSvg,
  book: BookSvg,
  target: TargetSvg,
  tag: TagSvg,
  palette: PaletteSvg,
  note: NoteSvg,
  coffee: CoffeeSvg,
  star: StarSvg,
  sparkles: SparklesSvg,
  heart: HeartSvg,
  calendar: CalendarSvg,
  trophy: TrophySvg
};

const LEGACY_EMOJI_TO_ID: Record<string, FolderIconId> = {
  "\u{1F4C1}": "folder",
  "\u{1F4C2}": "folder-open",
  "\u{1F4BC}": "briefcase",
  "\u{1F680}": "rocket",
  "\u{1F4A1}": "lightbulb",
  "\u{1F4DA}": "book",
  "\u{1F3AF}": "target",
  "\u{1F3F7}\uFE0F": "tag",
  "\u{1F3F7}": "tag",
  "\u{1F3A8}": "palette",
  "\u{1F4DD}": "note",
  "\u{2615}": "coffee",
  "\u{2B50}": "star",
  "\u{1F31F}": "star",
  "\u{2728}": "sparkles",
  "\u{2764}\uFE0F": "heart",
  "\u{2764}": "heart",
  "\u{1F496}": "heart",
  "\u{1F4C5}": "calendar",
  "\u{1F4C6}": "calendar",
  "\u{1F3C6}": "trophy"
};

export function isFolderIcon(icon?: string | null): boolean {
  if (!icon) return false;
  const trimmed = icon.trim();
  return trimmed in SVG_COMPONENTS || trimmed in LEGACY_EMOJI_TO_ID;
}

export function normalizeFolderIcon(icon?: string | null): FolderIconId {
  if (!icon) return "folder";
  const trimmed = icon.trim();
  if (trimmed in SVG_COMPONENTS) {
    return trimmed as FolderIconId;
  }
  if (trimmed in LEGACY_EMOJI_TO_ID) {
    return LEGACY_EMOJI_TO_ID[trimmed];
  }
  return "folder";
}

export function FolderIconGlyph({
  icon,
  className,
  size
}: {
  icon?: string | null;
  className?: string;
  size?: number;
}): ReactElement {
  if (!icon) {
    const Component = SVG_COMPONENTS.folder;
    return <Component className={className} size={size} />;
  }

  const trimmed = icon.trim();
  if (trimmed in SVG_COMPONENTS) {
    const Component = SVG_COMPONENTS[trimmed as FolderIconId];
    return <Component className={className} size={size} />;
  }

  if (trimmed in LEGACY_EMOJI_TO_ID) {
    const id = LEGACY_EMOJI_TO_ID[trimmed];
    const Component = SVG_COMPONENTS[id];
    return <Component className={className} size={size} />;
  }

  return <span className={className}>{icon}</span>;
}
