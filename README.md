# Voice practice when you need to not sound so annoying

A long long time ago, I worked for an asshole named [@monteslu](https://github.com/monteslu). He was a real piece of work, but we were building this cool system
called pagenodes at the time(which may still be around <https://pagenodes.com>). Basically it was a bit of a rewrite of [node-red](https://nodered.org/) but with a focus on web pages as the output medium instead of IoT devices. Over time as a beginning engineer I learned how to love the web apis built into chrome. One of my first modules I built for it was a speech to text module using the web speech api. I thought it was super cool at the time, and I still do. So I built this little app to help people practice interviews using that same api.

So recently I stopped working for a job, and decided to start interviewing again. That said I went ahead and built this little app to help me practice answering interview questions. It's pretty simplistic, and I have Features I would
like to add. The goal is to not really use any react or any of that fancy bullshit. Just vanilla JS and webcomponents. If you want to contribute, then please do.

I used goose for a bunch of this, because I didn't want to fiddle with the CSS as much. So shout out to the block [goose](https://block.github.io/goose/) for making my life easier.

Can I do this better in react or svelte or whatever? Probably, but I don't want to, so meh.

## Shit you can do

Try it out at [https://look.imwithstupid.fun](https://look.imwithstupid.fun)

- Record yourself answering common interview questions
- Real-time speech-to-text captions
- Video and audio recording
- Playback of your recordings
- Customizable question set(sort of)
- Multiple camera support with easy switching
- Responsive design that works on desktop and mobile

## Shit you **can't** do(yet)

- [ ]track your face
- [ ] assess your answers
- [ ] Download your answers
- [ ] Save your videos(may never happen, i don't want to pay for this)

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
