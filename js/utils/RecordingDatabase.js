// js/utils/RecordingDatabase.js
// Utility for managing interview recordings in IndexedDB

class RecordingDatabase {
  constructor() {
    this.dbName = "InterviewPracticeDB";
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create recordings object store
        if (!db.objectStoreNames.contains("recordings")) {
          const store = db.createObjectStore("recordings", {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("question", "question", { unique: false });
        }
      };
    });
  }

  async addRecording(recording) {
    if (!this.db) await this.init();

    // Convert Blob to ArrayBuffer for storage
    const arrayBuffer = await recording.videoBlob.arrayBuffer();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recordings"], "readwrite");
      const store = transaction.objectStore("recordings");

      const recordingData = {
        question: recording.question,
        transcript: recording.transcript,
        videoData: arrayBuffer, // Store as ArrayBuffer
        videoType: recording.videoBlob.type, // Store the MIME type
        timestamp: new Date().toISOString(),
        id: Date.now(), // Simple ID generation
      };

      const request = store.add(recordingData);

      request.onsuccess = () => resolve(recordingData.id);
      request.onerror = () => reject(request.error);
    });
  }

  async getRecording(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recordings"], "readonly");
      const store = transaction.objectStore("recordings");

      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          // Convert ArrayBuffer back to Blob
          result.videoBlob = new Blob([result.videoData], {
            type: result.videoType,
          });
        }
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllRecordings() {
    console.log("gettin recordings");
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recordings"], "readonly");
      const store = transaction.objectStore("recordings");

      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        // Convert ArrayBuffers back to Blobs
        results.forEach((result) => {
          if (result.videoData) {
            result.videoBlob = new Blob([result.videoData], {
              type: result.videoType,
            });
          }
        });
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRecording(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recordings"], "readwrite");
      const store = transaction.objectStore("recordings");

      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllRecordings() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["recordings"], "readwrite");
      const store = transaction.objectStore("recordings");

      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Export a singleton instance
export default new RecordingDatabase();
