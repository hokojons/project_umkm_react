import React, { useState } from "react";
import { Package } from "lucide-react";

export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>
) {
  const [didError, setDidError] = useState(false);

  const handleError = () => {
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;

  // When error occurs, show a simple package icon placeholder with same size
  if (didError) {
    return (
      <div
        className={`flex-shrink-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${className ?? ""}`}
        style={style}
      >
        <Package className="w-1/2 h-1/2 text-gray-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`flex-shrink-0 ${className ?? ""}`}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
