import React from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

interface HandOverlayProps {
  landmarks: any[][];
  canvasRef: React.RefObject<HTMLCanvasElement>;
  width: number;
  height: number;
}

export const HandOverlay: React.FC<HandOverlayProps> = ({ 
  landmarks, 
  canvasRef, 
  width, 
  height 
}) => {
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Draw hand landmarks and connections
    if (landmarks.length > 0) {
      landmarks.forEach((handLandmarks) => {
        // Draw connections
        drawConnectors(ctx, handLandmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 2
        });
        
        // Draw landmarks
        drawLandmarks(ctx, handLandmarks, {
          color: '#FF0000',
          lineWidth: 1,
          radius: 3
        });
      });
    }
  }, [landmarks, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ transform: 'scaleX(-1)' }}
    />
  );
};