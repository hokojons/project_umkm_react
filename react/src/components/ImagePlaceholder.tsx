import React from 'react';

interface ImagePlaceholderProps {
    text?: string;
    width?: number;
    height?: number;
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
}

export function ImagePlaceholder({
    text = "No Image",
    width = 400,
    height = 300,
    bgColor = "#e5e7eb",
    textColor = "#9ca3af",
    fontSize = 24,
}: ImagePlaceholderProps) {
    const encodedText = encodeURIComponent(text);

    // Create inline SVG as data URL
    const svgString = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `;

    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svgString)}`;

    return (
        <img
            src={dataUrl}
            alt={text}
            className="w-full h-full object-cover"
            onError={(e) => {
                console.log('Placeholder image error fallback');
                e.currentTarget.style.display = 'none';
            }}
        />
    );
}

// Utility function to generate placeholder data URL
export function getPlaceholderDataUrl(
    text: string = "No Image",
    width: number = 400,
    height: number = 300,
    bgColor: string = "#e5e7eb",
    textColor: string = "#9ca3af"
): string {
    const fontSize = Math.min(width, height) / 10;

    const svgString = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${text}
      </text>
    </svg>
  `.trim();

    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
}
