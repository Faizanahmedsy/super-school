import React from 'react';

interface RedCircleProps {
  size?: number; // Circle size in pixels
  color?: string; // Circle color
}

const RedCircle: React.FC<RedCircleProps> = ({ size = 50, color = 'red' }) => {
  const circleStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: color,
  };

  return <div style={circleStyle}></div>;
};

export default RedCircle;
