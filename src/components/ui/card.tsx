import React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
	children?: React.ReactNode;
};

export const Card: React.FC<CardProps> = ({ children, className = "", ...rest }) => {
	return (
		<div {...rest} className={`rounded-lg shadow-sm ${className}`}>
			{children}
		</div>
	);
};

export default Card;

export type CardContentProps = React.HTMLAttributes<HTMLDivElement> & {
	children?: React.ReactNode;
};

export const CardContent: React.FC<CardContentProps> = ({ children, className = "", ...rest }) => {
	return (
		<div {...rest} className={`${className}`}>
			{children}
		</div>
	);
};
