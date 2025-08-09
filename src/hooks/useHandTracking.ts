import { useRef, useEffect, useCallback, useState } from 'react';
import { Hands, Results } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandTrackingResult {
  landmarks: HandLandmark[][];
  isDrawing: boolean;
  fingerTipPosition: { x: number; y: number } | null;
}

export const useHandTracking = (
  videoRef: React.RefObject<HTMLVideoElement>,
  canvasWidth: number,
  canvasHeight: number
) => {
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const [handResult, setHandResult] = useState<HandTrackingResult>({
    landmarks: [],
    isDrawing: false,
    fingerTipPosition: null
  });

  const onResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      // Get index finger tip (landmark 8) and thumb tip (landmark 4)
      const indexTip = landmarks[8];
      const thumbTip = landmarks[4];
      const indexMcp = landmarks[5]; // Index finger MCP joint
      
      // Convert normalized coordinates to canvas coordinates
      const fingerTipPosition = {
        x: (1 - indexTip.x) * canvasWidth, // Mirror horizontally
        y: indexTip.y * canvasHeight
      };
      
      // Calculate distance between thumb and index finger
      const thumbIndexDistance = Math.sqrt(
        Math.pow(indexTip.x - thumbTip.x, 2) + 
        Math.pow(indexTip.y - thumbTip.y, 2)
      );
      
      // Check if index finger is extended (drawing gesture)
      const indexExtended = indexTip.y < indexMcp.y;
      
      // Drawing when index finger is extended and close to thumb (pinch gesture)
      const isDrawing = indexExtended && thumbIndexDistance < 0.05;
      
      setHandResult({
        landmarks: results.multiHandLandmarks,
        isDrawing,
        fingerTipPosition
      });
    } else {
      setHandResult({
        landmarks: [],
        isDrawing: false,
        fingerTipPosition: null
      });
    }
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    if (!videoRef.current) return;

    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);
    handsRef.current = hands;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && handsRef.current) {
          await handsRef.current.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720
    });

    cameraRef.current = camera;
    camera.start();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onResults, videoRef]);

  return handResult;
};