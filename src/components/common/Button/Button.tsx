import React, { ButtonHTMLAttributes, ReactNode, AnchorHTMLAttributes } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type ButtonVariant = 
  | 'primary' 
  | 'secondary' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'light' 
  | 'dark'
  | 'outlinePrimary'
  | 'outlineSecondary'
  | 'outlineDanger'
  | 'ghost';

type ButtonSize = 'small' | 'medium' | 'large';

interface CommonButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  as?: 'button' | 'a' | 'Link'; // To render as button, anchor, or React Router Link
}

// Props for a standard HTML button
type HtmlButtonProps = CommonButtonProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: 'button';
  href?: never; // Ensure href is not passed to button
  to?: never; // Ensure to is not passed to button
};

// Props for an anchor tag
type AnchorProps = CommonButtonProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
  as: 'a';
  to?: never; // Ensure to is not passed to anchor if href is used
};

// Props for a React Router Link
type RouterLinkProps = CommonButtonProps & Omit<LinkProps, 'className' | 'children'> & {
  as: 'Link';
  href?: never; // Ensure href is not passed to Link
};

export type ButtonProps = HtmlButtonProps | AnchorProps | RouterLinkProps;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  className = '',
  children,
  iconLeft,
  iconRight,
  as = 'button',
  type = 'button', // Default type for <button>
  ...props
}) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    className, // Allow external classes
  ].filter(Boolean).join(' ');

  const content = (
    <>
      {iconLeft && <span className={`${styles.icon} ${styles.iconLeft}`}>{iconLeft}</span>}
      {children}
      {iconRight && <span className={`${styles.icon} ${styles.iconRight}`}>{iconRight}</span>}
    </>
  );

  if (as === 'Link') {
    const { to, ...linkProps } = props as Omit<RouterLinkProps, 'as' | 'children' | 'className' | 'variant' | 'size' | 'fullWidth' | 'iconLeft' | 'iconRight'>;
    return (
      <Link to={to!} className={buttonClasses} {...linkProps}>
        {content}
      </Link>
    );
  }

  if (as === 'a') {
    const { href, ...anchorProps } = props as Omit<AnchorProps, 'as' | 'children' | 'className' | 'variant' | 'size' | 'fullWidth' | 'iconLeft' | 'iconRight'>;
    return (
      <a href={href} className={buttonClasses} {...anchorProps}>
        {content}
      </a>
    );
  }

  // Default to 'button'
  const { ...buttonProps } = props as Omit<HtmlButtonProps, 'as' | 'children' | 'className' | 'variant' | 'size' | 'fullWidth' | 'iconLeft' | 'iconRight'>;
  return (
    <button type={type as ButtonHTMLAttributes<HTMLButtonElement>['type']} className={buttonClasses} {...buttonProps}>
      {content}
    </button>
  );
};

export default Button;