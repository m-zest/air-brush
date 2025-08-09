# AirBrush – Gesture-Controlled Drawing Camera App

**AirBrush** is a real-time camera app that turns your hand gestures into a digital brush.  
Perfect for presentations, meetings, or creative sessions — no mouse, no touchscreen, just your hand.

---

##  Features

- **Real Hand Tracking** – Uses [MediaPipe Hands](https://developers.google.com/mediapipe) for accurate hand gesture detection.
- **Pinch-to-Draw** – Pinch your thumb and index finger together to start drawing.
- **Point-to-Navigate** – Extend your index finger to move the drawing cursor.
- **Open Hand to Stop** – Separate your fingers to stop drawing.
- **Brush Customization** – Choose different colors and sizes.
- **Overlay Toggle** – Show/hide hand landmark skeleton for cleaner presentations.
- **Fullscreen Mode** – For distraction-free presenting.
- **Save & Clear** – Save your drawings or reset the canvas instantly.

---

##  Tech Stack

- **React + TypeScript** – Modern, responsive front-end
- **MediaPipe Hands** – Real-time hand gesture detection
- **Canvas API** – Drawing system overlay
- **Vite** – Fast development build tool

---

##  How It Works

1. The camera captures your video feed.
2. **MediaPipe Hands** detects 21 key landmarks on your hand.
3. The app interprets gestures:
   - **Point Mode** – Cursor follows your index finger.
   - **Draw Mode** – Pinching thumb and index triggers the brush.
   - **Stop Mode** – Open hand pauses drawing.
4. Your strokes are drawn on an invisible canvas above the video feed.

---


##  How MediaPipe Works

**MediaPipe Hands** is a pre-trained machine learning model from Google that can detect and track hands in real time.

###  Process Flow

1. **Camera Feed** → The webcam provides a live video stream.
2. **Palm Detection Model** → Finds where hands are located in each frame.
3. **Hand Landmark Model** → Predicts **21 3D landmarks** (key points) on each hand.
4. **Gesture Recognition (Custom)** → We define rules like:
   - Pinch = Draw
   - Point = Move Cursor
   - Open Hand = Stop Drawing
5. **Canvas Drawing** → Landmarks are mapped to brush strokes using the Canvas API.

```

📷 Camera Feed → 🤚 Palm Detection → 🎯 Landmark Prediction → ✋ Gesture Detection → 🎨 Drawing

```

---

### Why This Works Well

- **Pre-trained Model** – No need to collect data or train a model from scratch.
- **Runs Locally** – No internet required after loading the library.
- **High Accuracy** – Works in various lighting conditions and angles.
- **Free & Open Source** – Apache 2.0 License.

---

![MediaPipe Hands Diagram](https://raw.githubusercontent.com/m-zest/air-brush/main/src/hand_landmarks.png)

*Example landmark points from MediaPipe Hands (21 points per hand).*
![MediaPipe Hands Diagram](https://raw.githubusercontent.com/m-zest/air-brush/main/src/1.png)
