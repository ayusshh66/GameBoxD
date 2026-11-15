"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";

type AnimatedInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value"> & {
  label: string;
  value: string;
  trailing?: ReactNode;
};

// Same animation as the supplied 21st.dev reference.
const containerVariants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.05 } },
};

const letterVariants = {
  initial: { y: 0, color: "inherit" },
  animate: {
    y: "-120%",
    color: "var(--muted)",
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export function AnimatedInput({
  id,
  label,
  value,
  trailing,
  onFocus,
  onBlur,
  className = "",
  ...inputProps
}: AnimatedInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const showLabel = isFocused || value.length > 0;

  return (
    <div className={`gameboxd-animated-input ${className}`}>
      <motion.label
        htmlFor={inputId}
        className="gameboxd-animated-label"
        variants={containerVariants}
        initial="initial"
        animate={showLabel ? "animate" : "initial"}
      >
        {label.split("").map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={letterVariants}
            style={{ willChange: "transform" }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.label>

      <input
        {...inputProps}
        id={inputId}
        value={value}
        placeholder=" "
        className={trailing ? "gameboxd-animated-control has-trailing" : "gameboxd-animated-control"}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
      />

      {trailing && <div className="gameboxd-animated-trailing">{trailing}</div>}
    </div>
  );
}
