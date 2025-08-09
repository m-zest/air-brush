import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, Download, Trash2, Settings, Maximize, Hand, Circle, Zap } from 'lucide-react';
import { useHandTracking } from './hooks/useHandTracking';
import { HandOverlay } from './components/HandOverlay';

interface Point {
  x: number;
  y: number;
}

interface DrawingPath {
  points: Point[];
  color: string;
  size: number;
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const handOverlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [brushColor, setBrushColor] = useState('#ff6b6b');
  const [brushSize, setBrushSize] = useState(5);
  const [showControls, setShowControls] = useState(true);
  const [showHandOverlay, setShowHandOverlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 1280, height: 720 });

  // Use hand tracking hook
  const { landmarks, isDrawing, fingerTipPosition } = useHandTracking(
    videoRef,
    canvasDimensions.width,
    canvasDimensions.height
  );

  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
  ];

  const startCamera = useCallback(async () => {
    try {
      setIsStreaming(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    setIsStreaming(false);
  }, []);

  const clearDrawing = useCallback(() => {
    setPaths([]);
    setCurrentPath([]);
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const downloadDrawing = useCallback(() => {
    const canvas = drawingCanvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `gesture-drawing-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Handle gesture drawing
  useEffect(() => {
    if (!fingerTipPosition) return;

    if (isDrawing) {
      setCurrentPath(prev => [...prev, fingerTipPosition]);
    } else {
      // End current path if we were drawing
      if (currentPath.length > 0) {
        setPaths(prev => [...prev, {
          points: [...currentPath],
          color: brushColor,
          size: brushSize
        }]);
        setCurrentPath([]);
      }
    }
  }, [fingerTipPosition, isDrawing, currentPath, brushColor, brushSize]);

  // Update canvas dimensions when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateDimensions = () => {
      if (video.videoWidth && video.videoHeight) {
        setCanvasDimensions({
          width: video.videoWidth,
          height: video.videoHeight
        });
      }
    };

    video.addEventListener('loadedmetadata', updateDimensions);
    return () => video.removeEventListener('loadedmetadata', updateDimensions);
  }, []);

  // Render drawing paths
  useEffect(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const drawingCtx = drawingCanvas.getContext('2d');
    if (!drawingCtx) return;

    drawingCanvas.width = canvasDimensions.width;
    drawingCanvas.height = canvasDimensions.height;

    // Set up drawing context
    drawingCtx.lineCap = 'round';
    drawingCtx.lineJoin = 'round';

    redrawPaths(drawingCtx);
  }, [paths, currentPath, canvasDimensions, brushColor, brushSize]);

  const redrawPaths = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw completed paths
    paths.forEach(path => {
      if (path.points.length < 2) return;
      
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current path
    if (currentPath.length > 1) {
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      
      for (let i = 1; i < currentPath.length; i++) {
        ctx.lineTo(currentPath[i].x, currentPath[i].y);
      }
      ctx.stroke();
    }
  }, [paths, currentPath, brushColor, brushSize]);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Main Video Container */}
      <div className="relative w-full h-screen">
        {/* Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
        />
        
        {/* Hand Overlay */}
        {showHandOverlay && (
          <HandOverlay
            landmarks={landmarks}
            canvasRef={handOverlayCanvasRef}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        )}
        
        {/* Drawing Canvas */}
        <canvas
          ref={drawingCanvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Camera Status */}
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-center">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg mb-4">Initializing hand tracking...</p>
              <button
                onClick={startCamera}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Start Hand Tracking</span>
              </button>
            </div>
          </div>
        )}

        {/* Finger Tip Indicator */}
        {fingerTipPosition && (
          <div
            className={`absolute w-4 h-4 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ${
              isDrawing 
                ? 'border-2 border-red-400 bg-red-400 bg-opacity-50 scale-150' 
                : 'border-2 border-blue-400 bg-blue-400 bg-opacity-30'
            }`}
            style={{ 
              left: `${(fingerTipPosition.x / canvasDimensions.width) * 100}%`,
              top: `${(fingerTipPosition.y / canvasDimensions.height) * 100}%`
            }}
          >
            <Circle className={`w-2 h-2 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
              isDrawing ? 'text-red-400' : 'text-blue-400'
            }`} />
          </div>
        )}

        {/* Gesture State Indicator */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
          <Hand className="w-5 h-5 text-blue-400" />
          <span className="text-white text-sm">
            {isDrawing ? 'Drawing' : fingerTipPosition ? 'Tracking' : 'No Hand'}
          </span>
        </div>

        {/* Controls Panel */}
        {showControls && (
          <div className="absolute top-4 right-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-xl p-4 space-y-4 animate-in slide-in-from-top duration-300">
            {/* Brush Colors */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Brush Color</label>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBrushColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      brushColor === color ? 'border-white scale-110' : 'border-gray-600'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Brush Size ({brushSize}px)
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => setShowHandOverlay(!showHandOverlay)}
                className={`w-full flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-colors text-sm ${
                  showHandOverlay 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                <Hand className="w-4 h-4" />
                <span>{showHandOverlay ? 'Hide' : 'Show'} Hand</span>
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={clearDrawing}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear</span>
                </button>
                <button
                  onClick={downloadDrawing}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gesture Instructions */}
        {isStreaming && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-black bg-opacity-70 backdrop-blur-sm rounded-xl px-6 py-4 max-w-lg">
              <h3 className="text-white font-medium mb-2">Hand Gesture Controls</h3>
              <div className="text-gray-300 text-sm space-y-1">
                <p>✋ <strong>Point:</strong> Extend index finger to position cursor</p>
                <p>✌️ <strong>Draw:</strong> Pinch thumb and index finger together</p>
                <p>🖐️ <strong>Stop:</strong> Open hand or move away from camera</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-black bg-opacity-80 backdrop-blur-sm rounded-xl px-6 py-3">
          <button
            onClick={() => setShowControls(!showControls)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Controls</span>
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Maximize className="w-4 h-4" />
            <span>Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;