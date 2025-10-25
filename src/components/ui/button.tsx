import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	children?: React.ReactNode;
	variant?: "outline" | "primary" | "ghost" | string;
};

export const Button: React.FC<ButtonProps> = ({ children, className = "", ...rest }) => {
	return (
		<button {...rest} className={`inline-flex items-center justify-center ${className}`}>
			{children}
		</button>
	);
};

export default Button;
