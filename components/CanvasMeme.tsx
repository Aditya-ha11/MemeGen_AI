import React, { useEffect, useRef, useState } from 'react';
import { MemeConfig } from '../types';
import { Download } from 'lucide-react';

interface CanvasMemeProps {
  imageSrc: string | null;
  config: MemeConfig;
  className?: string;
}

const CanvasMeme: React.FC<CanvasMemeProps> = ({ imageSrc, config, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const [isDrawing, setIsDrawing] = useState(false);

  // Helper to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, isBottom: boolean) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && i > 0) {
        lines.push(line);
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Draw lines
    let startY = y;
    if (isBottom) {
        // For bottom text, we draw upwards from the bottom or standard down?
        // Let's standard draw down, but we need to calculate total height to position correctly if we wanted to stick to bottom
        // Simplified: User passes Y as the starting baseline for the first line usually.
        // But for memes, bottom text starts low. 
        // Let's adjust Y based on number of lines to ensure it fits above the bottom edge.
        startY = y - ((lines.length - 1) * lineHeight);
    }

    lines.forEach((l, index) => {
      ctx.strokeText(l, x, startY + (index * lineHeight));
      ctx.fillText(l, x, startY + (index * lineHeight));
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      // Calculate aspect ratio fit
      const MAX_WIDTH = 800;
      const scale = Math.min(MAX_WIDTH / img.width, 1); // Only scale down, not up
      const canvasWidth = img.width * scale;
      const canvasHeight = img.height * scale;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      setDimensions({ width: canvasWidth, height: canvasHeight });

      // Draw Image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Configure Text Styles
      ctx.fillStyle = config.textColor;
      ctx.strokeStyle = config.strokeColor;
      ctx.lineWidth = config.fontSize / 8;
      ctx.lineJoin = 'round';
      ctx.textAlign = 'center';
      ctx.font = `900 ${config.fontSize}px "Oswald", sans-serif`; 
      // Note: "Oswald" must be loaded in index.html

      const padding = 20;
      const maxWidth = canvasWidth - (padding * 2);
      const lineHeight = config.fontSize * 1.2;

      // Draw Top Text
      if (config.topText) {
        ctx.textBaseline = 'top';
        wrapText(ctx, config.topText.toUpperCase(), canvasWidth / 2, padding, maxWidth, lineHeight, false);
      }

      // Draw Bottom Text
      if (config.bottomText) {
        ctx.textBaseline = 'bottom';
        wrapText(ctx, config.bottomText.toUpperCase(), canvasWidth / 2, canvasHeight - padding, maxWidth, lineHeight, true);
      }
    };
  }, [imageSrc, config]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'meme-gen-ai.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (!imageSrc) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 rounded-lg border-2 border-dashed border-slate-600 ${className}`} style={{ height: 400 }}>
        <p className="text-slate-400">Select an image or generate one to start</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col items-center gap-4 ${className}`}>
      <div className="relative shadow-2xl rounded-sm overflow-hidden bg-black">
        <canvas ref={canvasRef} className="max-w-full h-auto block" />
      </div>
      <button 
        onClick={handleDownload}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-blue-500/25"
      >
        <Download size={20} />
        Download Meme
      </button>
    </div>
  );
};

export default CanvasMeme;