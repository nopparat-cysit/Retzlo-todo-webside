import styles from "./login-scene.module.css";

export function MixtapeLogoMark() {
  return (<svg className={styles.brandMark} width="46" height="36" viewBox="0 0 46 36" fill="none" aria-hidden="true" focusable="false">
  <rect x="1.5" y="3.5" width="43" height="29" rx="7" fill="#D8B9FF" stroke="#432369" strokeWidth="2"/>
  <rect x="5.5" y="7.5" width="35" height="18" rx="4" fill="#FFF5FC" stroke="#432369" strokeWidth="1.5"/>
  <path d="M11 12H23M11 15H19" stroke="#C38DCB" strokeWidth="1.5" strokeLinecap="round"/>
  <rect x="11" y="17" width="24" height="7" rx="3.5" fill="#F0B0D7" stroke="#432369" strokeWidth="1.5"/>
  <g className={styles.brandReel}><circle cx="15" cy="20.5" r="2" fill="#D8B9FF" stroke="#432369" strokeWidth="1.2"/><path d="M13.7 20.5h2.6M15 19.2v2.6" stroke="#432369" strokeWidth=".8" strokeLinecap="round"/></g>
  <g className={styles.brandReel}><circle cx="31" cy="20.5" r="2" fill="#D8B9FF" stroke="#432369" strokeWidth="1.2"/><path d="M29.7 20.5h2.6M31 19.2v2.6" stroke="#432369" strokeWidth=".8" strokeLinecap="round"/></g>
  <path d="M16 32L18.5 27H27.5L30 32" fill="#F0B0D7"/>
  <path d="M16 32L18.5 27H27.5L30 32" stroke="#432369" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M32 10.5V14.5M30 12.5H34" stroke="#9164A0" strokeWidth="1.5" strokeLinecap="round"/>
</svg>);
}
