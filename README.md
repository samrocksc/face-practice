# Interview Practice App

A web application that helps you practice interview questions with audio and video recording capabilities and real-time captions.

## Features

- Record yourself answering common interview questions
- Real-time speech-to-text captions
- Video and audio recording
- Playback of your recordings
- Customizable question set
- Multiple camera support with easy switching
- Responsive design that works on desktop and mobile

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Firefox, Edge recommended)
2. Allow camera and microphone permissions when prompted
3. Select your preferred camera from the dropdown (if you have multiple cameras)
4. Select an interview question or add your own
5. Click "Start Recording" to begin practicing
6. Your speech will be transcribed in real-time as captions
7. Click "Stop Recording" when finished
8. Your recording will be saved and displayed in the recordings section
9. Play back your recordings to review your performance

## Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Edge)
- Camera and microphone access
- Speech Recognition API support (Chrome recommended for best results)

## Technical Details

This application is built with:
- Vanilla JavaScript (no frameworks)
- Web Components for modular architecture
- MediaRecorder API for recording
- Web Speech API for real-time captions
- Tailwind CSS for styling
- CSS Grid and Flexbox for responsive layout

## File Structure

- `index.html` - Main HTML file
- `js/app.js` - Main JavaScript application file
- `js/components/InterviewQuestionPanel.js` - Interview question web component
- `js/components/RecordingControls.js` - Recording controls web component
- `styles.css` - Custom styling for the application
- `Makefile` - Build and run scripts

## Limitations

- Speech recognition works best in Chrome
- Recordings are stored in browser memory and will be lost on page refresh
- For best results, use in a quiet environment
- Browsers may not show all camera options until camera permissions are granted. If you don't see all your cameras in the dropdown, click "Refresh Cameras" after allowing camera access.

## Development

To run locally with Makefile (recommended):
1. Run `make serve` to start the server on port 8080
2. Open `http://localhost:8080` in your browser
3. To use a different port: `make serve PORT=8081`

To run locally manually:
1. Serve the files using a local web server:
   ```bash
   python3 -m http.server 8080
   ```
2. Open `http://localhost:8080` in your browser

To stop the server:
- Press Ctrl+C in the terminal where the server is running
- Or run `make clean` to kill any running Python HTTP servers
