import { Image as AntdImage } from 'antd';
import React from 'react';
import { useInView } from 'react-intersection-observer';

// Define props interface for LazyImage
interface LazyImageProps {
  src: string;
  alt: string;
  width?: number | string; // width can be a number or string (px, %, etc.)
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, width }) => {
  // Use InView hook with types
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <AntdImage
          width={width}
          src={src}
          alt={alt}
          placeholder={<div className="skeleton-loader" />}
          preview={false}
        />
      ) : (
        <div className="skeleton-loader" />
      )}
    </div>
  );
};

export default LazyImage;
