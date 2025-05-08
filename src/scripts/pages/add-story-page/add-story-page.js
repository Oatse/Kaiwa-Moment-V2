import AddStoryPresenter from "./add-story-presenter.js";
import AddStoryModel from "./add-story-model.js";
import { showNotification } from "../../utils/index.js";

class AddStoryPage {
  constructor() {
    this._model = new AddStoryModel();
    this._presenter = new AddStoryPresenter(this, this._model);
  }

  async render() {
    return `
      <section tabindex="0" aria-label="Tambah Cerita" class="add-story-section">
        <h1 class="form-title">Tambah Cerita</h1>
        <form id="add-story-form" class="add-story-form">
          <div class="form-group">
            <label for="story-description" class="form-label">Deskripsi</label>
            <textarea id="story-description" name="description" class="form-input" placeholder="Tulis deskripsi cerita Anda..." required></textarea>
          </div>
          <div class="form-group">
            <label for="story-photo" class="form-label">Foto</label>
            <div class="photo-options">
              <input type="file" id="story-photo" name="photo" class="form-input" accept="image/*" />
              <button type="button" id="open-camera" class="form-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">  
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>  
                  <circle cx="12" cy="13" r="3.5"></circle>  
                  <path d="M16 8.5a2.5 2.5 0 0 0 2.5-2.5"></path>  
                </svg>  
              </button>
            </div>
            <div id="camera-container" class="camera-container">
              <video id="camera-stream" autoplay playsinline></video>
              <button type="button" id="capture-photo" class="form-button">Ambil Foto</button>
              <button type="button" id="close-camera" class="form-button">Tutup Kamera</button>
              <canvas id="camera-canvas"></canvas>
            </div>
          </div>
          <div class="form-group">
            <label for="story-lat" class="form-label">Latitude (Opsional)</label>
            <input type="number" id="story-lat" name="lat" class="form-input" step="any" placeholder="Contoh: -6.200000" />
          </div>
          <div class="form-group">
            <label for="story-lon" class="form-label">Longitude (Opsional)</label>
            <input type="number" id="story-lon" name="lon" class="form-input" step="any" placeholder="Contoh: 106.816666" />
          </div>
          <div id="map" style="height: 400px;"></div>
          <button type="submit" class="form-button">Tambah Cerita</button>
        </form>
      </section>
    `;
  }

  async afterRender() {
    const map = L.map("map").setView([-6.2, 106.816666], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    let marker;
    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      document.getElementById("story-lat").value = lat;
      document.getElementById("story-lon").value = lng;

      if (marker) {
        marker.setLatLng(event.latlng);
      } else {
        marker = L.marker(event.latlng).addTo(map);
      }
    });

    this._initCameraFeature();
    this._initFormSubmission();
  }

  _initCameraFeature() {
    const openCameraButton = document.getElementById("open-camera");
    const cameraContainer = document.getElementById("camera-container");
    const video = document.getElementById("camera-stream");
    const canvas = document.getElementById("camera-canvas");
    const capturePhotoButton = document.getElementById("capture-photo");
    const closeCameraButton = document.getElementById("close-camera");

    let stream;

    // Fungsi untuk mematikan kamera
    const stopCamera = () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        stream = null;
      }
      cameraContainer.style.display = "none";
    };

    // Event listener untuk tombol buka kamera
    openCameraButton.addEventListener("click", async () => {
      try {
        // Matikan kamera yang mungkin masih menyala sebelumnya
        stopCamera();

        // Buka kamera baru
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        cameraContainer.style.display = "block";
      } catch (error) {
        console.error("Gagal membuka kamera:", error);
        alert("Kamera tidak dapat diakses.");
      }
    });

    // Event listener untuk tombol ambil foto
    capturePhotoButton.addEventListener("click", () => {
      const context = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Konversi gambar ke Blob dan simpan ke input file
      canvas.toBlob((blob) => {
        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        document.getElementById("story-photo").files = dataTransfer.files;

        // Ganti alert dengan showNotification
        showNotification("Foto berhasil diambil!", "success");
        stopCamera(); // Matikan kamera setelah mengambil foto
      });
    });

    // Event listener untuk tombol tutup kamera
    closeCameraButton.addEventListener("click", () => {
      stopCamera();
    });

    // Matikan kamera saat pengguna meninggalkan halaman
    window.addEventListener("hashchange", () => {
      stopCamera();
    });

    // Matikan kamera saat form disubmit
    document.getElementById("add-story-form").addEventListener("submit", () => {
      stopCamera();
    });
  }

  _initFormSubmission() {
    const form = document.getElementById("add-story-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // Gunakan presenter untuk mendapatkan data form
      const storyData = this._presenter.getFormData();
      
      const result = await this._presenter.submitStory(storyData);

      if (result.success) {
        if (result.userSession && result.userSession.token) {
          window.location.hash = "#/";
        } else {
          setTimeout(() => {
            location.reload();
          }, 2000);
        }
      }
    });
  }
}

export default new AddStoryPage();


