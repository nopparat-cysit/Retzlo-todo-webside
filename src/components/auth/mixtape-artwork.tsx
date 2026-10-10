import Image from "next/image";
import styles from "./login-scene.module.css";

function PixelCloud() {
  return <svg viewBox="0 0 80 44" fill="none" aria-hidden="true"><path d="M4 30H12V22H20V14H28V6H44V14H52V18H60V26H72V34H76V40H4Z" fill="#FFF1E8" stroke="#432369" strokeWidth="3" strokeLinejoin="miter" /><path d="M7 35H24V30H32V35H46V31H56V35H73V38H7Z" fill="#F0B0D7" /></svg>;
}

function Star() {
  return <svg viewBox="0 0 40 48" fill="none" aria-hidden="true"><path d="M20 3L25 19L36 24L25 29L20 45L15 29L4 24L15 19Z" fill="#FFECB1" stroke="#432369" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}

export function MixtapeArtwork() {
  return (
    <div className={styles.sceneArtwork} aria-hidden="true">
      <div className={styles.cassetteLayer}><div className={styles.cassetteFloat}><Image src="/images/login-cassette-cutout.png" width={1536} height={1024} alt="" priority unoptimized className={styles.cassetteImage} /></div></div>
      <div className={styles.cloudLayer + " " + styles.cloudOne}><div className={styles.cloudFloat}><PixelCloud /></div></div>
      <div className={styles.cloudLayer + " " + styles.cloudTwo}><div className={styles.cloudFloat}><PixelCloud /></div></div>
      <div className={styles.cloudLayer + " " + styles.cloudThree}><div className={styles.cloudFloat}><PixelCloud /></div></div>
      <div className={styles.starLayer + " " + styles.starOne}><div className={styles.starFloat}><Star /></div></div>
      <div className={styles.starLayer + " " + styles.starTwo}><div className={styles.starFloat}><Star /></div></div>
      <div className={styles.starLayer + " " + styles.starThree}><div className={styles.starFloat}><Star /></div></div>
    </div>
  );
}