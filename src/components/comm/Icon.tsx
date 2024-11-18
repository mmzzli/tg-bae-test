import React, { useEffect } from 'react';

interface IconProps {
  name: string; // 图标名称
  className?: string; // 可选的样式类名
  style?: React.CSSProperties; // 可选的内联样式
}

const Icon: React.FC<IconProps> = ({ name, className = '', style }) => {

  return (
    <svg className={`icon flex flex-col items-center justify-center ${className}`} style={style}>
      <use xlinkHref={`#${name}`} />
    </svg>
  );
};

export default Icon;
