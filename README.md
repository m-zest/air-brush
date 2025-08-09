# AirBrush – Gesture-Controlled Drawing Camera App

**AirBrush** is a real-time camera app that turns your hand gestures into a digital brush.  
Perfect for presentations, meetings, or creative sessions — no mouse, no touchscreen, just your hand.

---

## ✨ Features

- **Real Hand Tracking** – Uses [MediaPipe Hands](https://developers.google.com/mediapipe) for accurate hand gesture detection.
- **Pinch-to-Draw** – Pinch your thumb and index finger together to start drawing.
- **Point-to-Navigate** – Extend your index finger to move the drawing cursor.
- **Open Hand to Stop** – Separate your fingers to stop drawing.
- **Brush Customization** – Choose different colors and sizes.
- **Overlay Toggle** – Show/hide hand landmark skeleton for cleaner presentations.
- **Fullscreen Mode** – For distraction-free presenting.
- **Save & Clear** – Save your drawings or reset the canvas instantly.

---

## 🛠 Tech Stack

- **React + TypeScript** – Modern, responsive front-end
- **MediaPipe Hands** – Real-time hand gesture detection
- **Canvas API** – Drawing system overlay
- **Vite** – Fast development build tool

---

## 📸 How It Works

1. The camera captures your video feed.
2. **MediaPipe Hands** detects 21 key landmarks on your hand.
3. The app interprets gestures:
   - **Point Mode** – Cursor follows your index finger.
   - **Draw Mode** – Pinching thumb and index triggers the brush.
   - **Stop Mode** – Open hand pauses drawing.
4. Your strokes are drawn on an invisible canvas above the video feed.

---
