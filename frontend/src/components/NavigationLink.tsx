import { Link, LinkProps } from 'react-router-dom';
import { ReactNode, MouseEvent } from 'react';

interface NavigationLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: ReactNode;
  className?: string;
  delay?: number;
}

export default function NavigationLink({ 
  to, 
  children, 
  className = '', 
  delay = 300,
  ...props 
}: NavigationLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Let the RouteTransition component handle the animation
    // No need to prevent default
  };

  return (
    <Link 
      to={to} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
