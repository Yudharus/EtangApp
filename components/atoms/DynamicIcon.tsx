import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 20, className = '', ...props }) => {
  // Access icon from Lucide icon collection safely
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<Icons.LucideProps>>)[name] || Icons.CircleHelp;

  return <IconComponent size={size} className={className} {...props} />;
};
