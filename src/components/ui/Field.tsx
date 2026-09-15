import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/lib/types";
import styles from "./Field.module.css";

type FieldProps = {
  label: string;
  children: ReactNode;
  hint?: string;
};

export function Field({ label, children, hint }: FieldProps) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      {children}
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </label>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { trailingIcon?: IconName };

export function TextInput({ trailingIcon, className, ...props }: TextInputProps) {
  if (!trailingIcon) {
    return <input className={`${styles.control} ${className ?? ""}`} {...props} />;
  }
  return (
    <span className={styles.wrap}>
      <input className={`${styles.control} ${className ?? ""}`} {...props} />
      <span className={styles.trailing}>
        <Icon name={trailingIcon} size={16} />
      </span>
    </span>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { options: string[] };

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <span className={styles.wrap}>
      <select className={`${styles.control} ${styles.select} ${className ?? ""}`} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className={styles.trailing}>
        <Icon name="chevron-down" size={16} />
      </span>
    </span>
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${styles.control} ${styles.textarea} ${className ?? ""}`} {...props} />;
}

type CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  meta?: string;
};

export function Checkbox({ checked, onChange, label, meta }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className={styles.checkbox}
      data-press
      onClick={() => onChange(!checked)}
    >
      <span className={styles.box}>{checked ? <Icon name="check" size={12} /> : null}</span>
      <span className={styles.checkboxCopy}>
        <span className={styles.checkboxLabel}>{label}</span>
        {meta ? <span className={styles.hint}>{meta}</span> : null}
      </span>
    </button>
  );
}
