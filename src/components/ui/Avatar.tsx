import styles from "./Avatar.module.css";

type AvatarProps = {
  size?: "sm" | "md";
  initials?: string;
  src?: string;
  alt?: string;
  tone?: "photo" | "muted" | "plus";
  color?: string;
};

export function Avatar({
  size = "md",
  initials,
  src,
  alt = "",
  tone = "photo",
  color,
}: AvatarProps) {
  return (
    <span
      className={`${styles.avatar} ${styles[size]} ${color ? "" : styles[tone]}`}
      style={color ? { backgroundColor: color } : undefined}
      aria-hidden={!alt}
    >
      {src ? <img src={src} alt={alt} className={styles.image} /> : null}
      {initials ? <span className={styles.initials}>{initials}</span> : null}
    </span>
  );
}
