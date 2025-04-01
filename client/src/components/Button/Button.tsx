import React from "react";
import "./Button.css";

type ButtonProps = {
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  color?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
};

const Button: React.FC<ButtonProps> = ({
  children,
  size = "medium",
  color = "primary",
  className = "",
  onClick,
  type = "button",
}) => {
  const combinedClassName = [
    "ui-button",
    `ui-button--${size}`,
    `ui-button--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} onClick={onClick} className={combinedClassName}>
      {children}
    </button>
  );
};

export default Button;
