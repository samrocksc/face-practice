// js/components/RecordingControls.js
class RecordingControls extends HTMLElement {
    constructor() {
        super();
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.recordingStartTime = null;
        this.recordingInterval = null;
        this.stream = null;
        this.speechRecognition = null;
        this.isRecording = false;
        this.selectedCameraId = null;
        this.cameras = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        this.initializeCamera().then(() => {
            // After initializing camera, enumerate all available cameras
            this.enumerateCameras();
        });
        this.initializeSpeechRecognition();
    }

    render() {
        this.innerHTML = `
            <div class="video-container">
                <video id="video-preview" autoplay muted></video>
                <div id="captions-display" class="captions-overlay">Speak to see captions here...</div>
            </div>
            
            <div class="recording-controls">
                <button id="start-recording" class="nickelodeon-btn nickelodeon-btn-red">Start Recording</button>
                <button id="stop-recording" class="nickelodeon-btn nickelodeon-btn-blue" disabled>Stop Recording</button>
                <button id="playback" class="nickelodeon-btn nickelodeon-btn-green" disabled>Play Recording</button>
            </div>
            
            <div class="recording-status">
                <span id="recording-indicator" class="recording-dot hidden"></span>
                <span id="recording-time" class="text-lg font-bold text-gray-800">00:00</span>
            </div>
        `;
    }

    setupEventListeners() {
        this.querySelector('#start-recording').addEventListener('click', () => this.startRecording());
        this.querySelector('#stop-recording').addEventListener('click', () => this.stopRecording());
        this.querySelector('#playback').addEventListener('click', () => this.playRecording());
        
        // Set up camera selection events
        document.getElementById('camera-select').addEventListener('change', (e) => {
            this.selectedCameraId = e.target.value;
            this.switchCamera();
        });
        
        document.getElementById('refresh-cameras').addEventListener('click', () => {
            this.enumerateCameras();
        });
    }

    async enumerateCameras() {
        try {
            // First, get devices without labels (may be empty if permissions not granted)
            let devices = await navigator.mediaDevices.enumerateDevices();
            let videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            // If we don't have labels, we need to request camera access first
            if (videoDevices.length > 0 && !videoDevices[0].label) {
                // We already have camera access, but labels might be empty
                // Stop current stream temporarily
                if (this.stream) {
                    this.stream.getTracks().forEach(track => track.stop());
                }
                
                // Request access again to get labels
                const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
                // Now enumerate devices again - labels should be available
                devices = await navigator.mediaDevices.enumerateDevices();
                videoDevices = devices.filter(device => device.kind === 'videoinput');
                
                // Stop temporary stream
                tempStream.getTracks().forEach(track => track.stop());
                
                // Restore original stream if we had one
                if (this.stream) {
                    this.initializeCamera();
                }
            }
            
            this.cameras = videoDevices;
            
            const cameraSelect = document.getElementById('camera-select');
            cameraSelect.innerHTML = '';
            
            if (this.cameras.length === 0) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'No cameras found';
                cameraSelect.appendChild(option);
                return;
            }
            
            // Add cameras to the dropdown
            this.cameras.forEach((camera, index) => {
                const option = document.createElement('option');
                option.value = camera.deviceId;
                option.textContent = camera.label || `Camera ${index + 1}`;
                cameraSelect.appendChild(option);
            });
            
            // Select the first camera by default if none selected
            if (!this.selectedCameraId && this.cameras.length > 0) {
                this.selectedCameraId = this.cameras[0].deviceId;
                cameraSelect.value = this.selectedCameraId;
            }
        } catch (error) {
            console.error('Error enumerating cameras:', error);
        }
    }

    async initializeCamera() {
        try {
            // Request camera and microphone access
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            const videoPreview = this.querySelector('#video-preview');
            videoPreview.srcObject = this.stream;
        } catch (error) {
            console.error('Error accessing camera and microphone:', error);
            alert('Could not access camera and microphone. Please check permissions.');
        }
    }

    async switchCamera() {
        if (!this.selectedCameraId) return;
        
        try {
            // Stop the current stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            
            // Start a new stream with the selected camera
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { deviceId: { exact: this.selectedCameraId } }, 
                audio: true 
            });
            
            const videoPreview = this.querySelector('#video-preview');
            videoPreview.srcObject = this.stream;
        } catch (error) {
            console.error('Error switching camera:', error);
            alert('Could not switch to the selected camera.');
        }
    }

    initializeSpeechRecognition() {
        // Check if the browser supports SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = true;
            this.speechRecognition.interimResults = true;
            this.speechRecognition.lang = 'en-US';
            
            this.speechRecognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                const captionsDisplay = this.querySelector('#captions-display');
                if (captionsDisplay) {
                    captionsDisplay.textContent = finalTranscript || interimTranscript || 'Speak to see captions here...';
                }
            };
            
            this.speechRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        } else {
            console.warn('Speech recognition not supported in this browser.');
            const captionsDisplay = this.querySelector('#captions-display');
            if (captionsDisplay) {
                captionsDisplay.textContent = 'Captions not supported in this browser';
            }
        }
    }

    startRecording() {
        if (!this.stream) {
            alert('Camera and microphone not initialized. Please refresh the page.');
            return;
        }

        this.recordedChunks = [];
        this.mediaRecorder = new MediaRecorder(this.stream, {
            mimeType: 'video/webm; codecs=vp9'
        });

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.onstop = () => {
            this.saveRecording();
        };

        this.mediaRecorder.start();
        this.isRecording = true;

        // Start speech recognition if available
        if (this.speechRecognition) {
            this.speechRecognition.start();
        }

        // Update UI
        this.querySelector('#start-recording').disabled = true;
        this.querySelector('#stop-recording').disabled = false;
        this.querySelector('#playback').disabled = true;
        
        const recordingIndicator = this.querySelector('#recording-indicator');
        recordingIndicator.classList.remove('hidden');
        
        // Start recording timer
        this.recordingStartTime = Date.now();
        this.updateRecordingTime();
        this.recordingInterval = setInterval(() => this.updateRecordingTime(), 1000);
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
            // Stop speech recognition if available
            if (this.speechRecognition) {
                this.speechRecognition.stop();
            }
            
            // Update UI
            this.querySelector('#start-recording').disabled = false;
            this.querySelector('#stop-recording').disabled = true;
            this.querySelector('#playback').disabled = false;
            
            const recordingIndicator = this.querySelector('#recording-indicator');
            recordingIndicator.classList.add('hidden');
            
            // Stop recording timer
            clearInterval(this.recordingInterval);
            this.querySelector('#recording-time').textContent = '00:00';
        }
    }

    updateRecordingTime() {
        if (this.recordingStartTime) {
            const elapsed = Date.now() - this.recordingStartTime;
            const totalSeconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            this.querySelector('#recording-time').textContent = `${minutes}:${seconds}`;
        }
    }

    saveRecording() {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create a recording item
        const recordingsList = document.querySelector('#recordings-list');
        if (recordingsList) {
            // Clear the initial message if it's the first recording
            if (recordingsList.querySelector('p')) {
                recordingsList.innerHTML = '';
            }
            
            const questionDisplay = document.querySelector('#current-question');
            const question = questionDisplay ? questionDisplay.textContent : 'Interview Practice';
            
            const recordingItem = document.createElement('div');
            recordingItem.className = 'recording-item';
            recordingItem.innerHTML = `
                <video controls class="w-full h-48 object-cover"></video>
                <div class="recording-info p-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${question}</h3>
                    <p class="text-gray-600 text-sm mb-4">${new Date().toLocaleString()}</p>
                    <div class="recording-actions flex gap-2">
                        <button class="play-recording nickelodeon-btn nickelodeon-btn-blue flex-1">Play</button>
                        <button class="delete-recording nickelodeon-btn nickelodeon-btn-red flex-1">Delete</button>
                    </div>
                </div>
            `;
            
            const video = recordingItem.querySelector('video');
            video.src = url;
            
            const playButton = recordingItem.querySelector('.play-recording');
            playButton.addEventListener('click', () => {
                video.play();
            });
            
            const deleteButton = recordingItem.querySelector('.delete-recording');
            deleteButton.addEventListener('click', () => {
                recordingItem.remove();
                // Show message if no recordings left
                if (recordingsList.children.length === 0) {
                    recordingsList.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No recordings yet. Start recording to see them here.</p>';
                }
            });
            
            recordingsList.prepend(recordingItem);
        }
    }

    playRecording() {
        // This would play the last recorded video
        // In a more complete implementation, you might have a selected recording to play
        alert('Playing last recording');
    }
}

customElements.define('recording-controls', RecordingControls);

export default RecordingControls;
