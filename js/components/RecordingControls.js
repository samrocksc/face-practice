// js/components/RecordingControls.js
import recordingDB from "../utils/RecordingDatabase.js";

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
    this.transcript = ""; // Store speech recognition transcript
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.initializeCamera().then(() => {
      // After initializing camera, enumerate all available cameras
      this.enumerateCameras();
    });
    this.initializeSpeechRecognition();

    // Load existing recordings from IndexedDB
    this.loadRecordingsFromDB();
  }

  render() {
    this.innerHTML = /* html */ `
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
    this.querySelector("#start-recording").addEventListener("click", () =>
      this.startRecording(),
    );
    this.querySelector("#stop-recording").addEventListener("click", () =>
      this.stopRecording(),
    );
    this.querySelector("#playback").addEventListener("click", () =>
      this.playRecording(),
    );

    // Camera selection
    const cameraSelect = this.querySelector("#camera-select");
    if (cameraSelect) {
      cameraSelect.addEventListener("change", (e) => {
        this.selectedCameraId = e.target.value;
        this.initializeCamera();
      });
    }

    // Refresh cameras button
    const refreshButton = this.querySelector("#refresh-cameras");
    if (refreshButton) {
      refreshButton.addEventListener("click", () => this.enumerateCameras());
    }
  }

  async initializeCamera() {
    try {
      // Stop existing stream if any
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          deviceId: this.selectedCameraId
            ? { exact: this.selectedCameraId }
            : undefined,
        },
        audio: true,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = this.querySelector("#video-preview");
      if (video) {
        video.srcObject = this.stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access the camera. Please check permissions.");
    }
  }

  async enumerateCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.cameras = devices.filter((device) => device.kind === "videoinput");

      const cameraSelect = this.querySelector("#camera-select");
      if (cameraSelect) {
        cameraSelect.innerHTML = "";
        this.cameras.forEach((camera, index) => {
          const option = document.createElement("option");
          option.value = camera.deviceId;
          option.textContent = camera.label || `Camera ${index + 1}`;
          cameraSelect.appendChild(option);
        });
      }
    } catch (error) {
      console.error("Error enumerating cameras:", error);
    }
  }

  initializeSpeechRecognition() {
    // Check if SpeechRecognition is available
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = true;
      this.speechRecognition.interimResults = true;

      this.speechRecognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the transcript property
        this.transcript = finalTranscript + interimTranscript;

        // Update captions display
        const captionsDisplay = this.querySelector("#captions-display");
        if (captionsDisplay) {
          captionsDisplay.textContent =
            this.transcript || "Speak to see captions here...";
        }
      };

      this.speechRecognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };
    } else {
      console.log("Speech recognition not supported in this browser");

      // Update captions display to show that speech recognition is not available
      const captionsDisplay = this.querySelector("#captions-display");
      if (captionsDisplay) {
        captionsDisplay.textContent =
          "Speech recognition not available in this browser";
      }
    }
  }

  async startRecording() {
    if (!this.stream) {
      alert("Please allow camera and microphone access first.");
      return;
    }

    this.recordedChunks = [];
    this.transcript = ""; // Reset transcript

    // Clear captions display
    const captionsDisplay = this.querySelector("#captions-display");
    if (captionsDisplay) {
      captionsDisplay.textContent = "Recording... Speak now!";
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: "video/webm",
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
      this.querySelector("#start-recording").disabled = true;
      this.querySelector("#stop-recording").disabled = false;
      this.querySelector("#playback").disabled = true;

      const recordingIndicator = this.querySelector("#recording-indicator");
      recordingIndicator.classList.remove("hidden");

      // Start recording timer
      this.recordingStartTime = Date.now();
      this.updateRecordingTime();
      this.recordingInterval = setInterval(
        () => this.updateRecordingTime(),
        1000,
      );
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Error starting recording: " + error.message);
    }
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
      this.querySelector("#start-recording").disabled = false;
      this.querySelector("#stop-recording").disabled = true;
      this.querySelector("#playback").disabled = false;

      const recordingIndicator = this.querySelector("#recording-indicator");
      recordingIndicator.classList.add("hidden");

      // Stop recording timer
      clearInterval(this.recordingInterval);
      this.querySelector("#recording-time").textContent = "00:00";
    }
  }

  updateRecordingTime() {
    if (this.recordingStartTime) {
      const elapsed = Date.now() - this.recordingStartTime;
      const totalSeconds = Math.floor(elapsed / 1000);
      const minutes = Math.floor(totalSeconds / 60)
        .toString()
        .padStart(2, "0");
      const seconds = (totalSeconds % 60).toString().padStart(2, "0");
      this.querySelector("#recording-time").textContent =
        `${minutes}:${seconds}`;
    }
  }

  async saveRecording() {
    const blob = new Blob(this.recordedChunks, { type: "video/webm" });

    // Get the current question
    const questionDisplay = document.querySelector("#current-question");
    const question = questionDisplay
      ? questionDisplay.textContent
      : "Interview Practice";

    // Save to IndexedDB
    try {
      const recordingId = await recordingDB.addRecording({
        question: question,
        transcript: this.transcript,
        videoBlob: blob,
        timestamp: new Date().toISOString(),
      });

      console.log("Recording saved to IndexedDB with ID:", recordingId);

      // Also display in UI as before
      this.displayRecordingInUI(blob, question, this.transcript, recordingId);
    } catch (error) {
      console.error("Error saving recording to IndexedDB:", error);
      alert(
        "Failed to save recording to database. Recording will only be available in this session.",
      );

      // Still display in UI even if DB save fails
      this.displayRecordingInUI(blob, question, this.transcript);
    }
  }

  displayRecordingInUI(blob, question, transcript, recordingId = null) {
    const url = URL.createObjectURL(blob);

    // Create a recording item
    const recordingsList = document.querySelector("#recordings-list");
    if (recordingsList) {
      // Clear the initial message if it's the first recording
      if (recordingsList.querySelector("p")) {
        recordingsList.innerHTML = "";
      }

      const recordingItem = document.createElement("div");
      recordingItem.className = "recording-item";
      recordingItem.dataset.recordingId = recordingId || Date.now(); // Use DB ID or timestamp

      console.log("recordingsList", recordingsList);

      recordingItem.innerHTML = /* html */ `
                <video controls class="w-full h-48 object-cover"></video>
                <div class="recording-info p-4">
                    <h3 class="text-lg font-bold text-gray-800 mb-2">${question}</h3>
                    <p class="text-gray-600 text-sm mb-2">Recorded: ${new Date().toLocaleString()}</p>
                    ${transcript ? `<p class="text-gray-700 text-sm mb-4 bg-gray-100 p-2 rounded"><strong>Transcript:</strong> ${transcript}</p>` : ""}
                    <div class="recording-actions flex gap-2">
                        <button class="play-recording nickelodeon-btn nickelodeon-btn-blue flex-1">Play</button>
                        <button class="delete-recording nickelodeon-btn nickelodeon-btn-red flex-1">Delete</button>
                    </div>
                </div>
            `;

      const video = recordingItem.querySelector("video");
      video.src = url;

      const playButton = recordingItem.querySelector(".play-recording");
      playButton.addEventListener("click", () => {
        video.play();
      });

      const deleteButton = recordingItem.querySelector(".delete-recording");
      deleteButton.addEventListener("click", async () => {
        recordingItem.remove();

        // Delete from IndexedDB if it has an ID
        if (recordingId) {
          try {
            await recordingDB.deleteRecording(recordingId);
            console.log("Recording deleted from IndexedDB");
          } catch (error) {
            console.error("Error deleting recording from IndexedDB:", error);
          }
        }

        // Show message if no recordings left
        if (recordingsList.children.length === 0) {
          recordingsList.innerHTML =
            '<p class="text-gray-500 col-span-full text-center py-8">No recordings yet. Start recording to see them here.</p>';
        }
      });

      recordingsList.prepend(recordingItem);
    }
  }

  async loadRecordingsFromDB() {
    try {
      const recordings = await recordingDB.getAllRecordings();
      console.log("Loaded recordings from DB:", recordings);

      const recordingsList = document.querySelector("#recordings-list");
      if (recordingsList && recordings.length > 0) {
        // Clear the initial message
        recordingsList.innerHTML = "";

        // Display each recording (in reverse order to show newest first)
        for (let i = recordings.length - 1; i >= 0; i--) {
          const recording = recordings[i];

          // Use the videoBlob that was reconstructed from the database
          this.displayRecordingInUI(
            recording.videoBlob,
            recording.question,
            recording.transcript,
            recording.id,
          );
        }
      }
    } catch (error) {
      console.error("Error loading recordings from IndexedDB:", error);
    }
  }

  playRecording() {
    // This would play the last recorded video
    // In a more complete implementation, you might have a selected recording to play
    alert("Playing last recording");
  }
}

customElements.define("recording-controls", RecordingControls);

export default RecordingControls;
