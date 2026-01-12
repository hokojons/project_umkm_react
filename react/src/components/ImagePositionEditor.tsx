import { useState, useRef, useEffect } from 'react';
import { Move, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

interface ImagePositionEditorProps {
  imageUrl: string;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  onPositionChange: (x: number, y: number, scale: number) => void;
  containerHeight?: string;
}

export function ImagePositionEditor({
  imageUrl,
  initialX = 0,
  initialY = 0,
  initialScale = 1,
  onPositionChange,
  containerHeight = '400px',
}: ImagePositionEditorProps) {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [scale, setScale] = useState(initialScale);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
    setScale(initialScale);
  }, [imageUrl, initialX, initialY, initialScale]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
    onPositionChange(newX, newY, scale);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    setPosition({ x: newX, y: newY });
    onPositionChange(newX, newY, scale);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.1, 3);
    setScale(newScale);
    onPositionChange(position.x, position.y, newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.1, 0.5);
    setScale(newScale);
    onPositionChange(position.x, position.y, newScale);
  };

  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    setScale(1);
    onPositionChange(0, 0, 1);
  };

  return (
    <div className="space-y-3">
      {/* Control Buttons */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
          <Move className="w-4 h-4" />
          <span className="font-medium">Geser Gambar:</span>
        </div>
        
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-lg bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-gray-700 dark:text-gray-200" />
        </button>

        <div className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-mono text-gray-700 dark:text-gray-200">
          {Math.round(scale * 100)}%
        </div>

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-lg bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-gray-700 dark:text-gray-200" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="ml-auto p-2 rounded-lg bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors"
          title="Reset Position"
        >
          <RotateCcw className="w-4 h-4 text-orange-700 dark:text-orange-200" />
        </button>
      </div>

      {/* Image Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800"
        style={{ height: containerHeight }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-400 dark:border-gray-500" />
            ))}
          </div>
        </div>

        {/* Hero Slider Preview - Same as actual display */}
        {imageUrl && (
          <div 
            className="w-full h-full relative"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Preview"
              className={`w-full h-full select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              style={{
                objectFit: 'cover',
                objectPosition: `${position.x}px ${position.y}px`,
                transform: `scale(${scale})`,
              }}
              draggable={false}
            />
          </div>
        )}

        {/* Center Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8">
            <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-orange-500 -translate-x-1/2" />
            <div className="absolute top-1/2 left-1/2 w-0.5 h-8 bg-orange-500 -translate-y-1/2" />
          </div>
        </div>

        {/* Position Info Overlay */}
        {isDragging && (
          <div className="absolute top-2 left-2 bg-black/75 text-white px-3 py-2 rounded-lg text-xs font-mono">
            <div>X: {Math.round(position.x)}px</div>
            <div>Y: {Math.round(position.y)}px</div>
            <div>Scale: {Math.round(scale * 100)}%</div>
          </div>
        )}

        {/* Help Text */}
        {!isDragging && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-xs flex items-center gap-2">
            <Move className="w-3 h-3" />
            <span>Klik & Geser Gambar untuk Atur Posisi</span>
          </div>
        )}
      </div>

      {/* Position Values (Hidden but accessible) */}
      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-4">
        <span>Posisi X: <strong className="text-gray-700 dark:text-gray-200">{Math.round(position.x)}</strong></span>
        <span>Posisi Y: <strong className="text-gray-700 dark:text-gray-200">{Math.round(position.y)}</strong></span>
        <span>Zoom: <strong className="text-gray-700 dark:text-gray-200">{Math.round(scale * 100)}%</strong></span>
      </div>
    </div>
  );
}
