import DetailPresenter from "./detail-presenter.js";
import DetailModel from "./detail-model.js";
import { showNotification } from "../../utils/index.js";

class DetailPage {
  constructor() {
    this._model = new DetailModel();
    this._presenter = new DetailPresenter(this, this._model);
  }

  showError(message) {
    showNotification(message, "error");
    window.location.hash = "#/";
  }

  async render() {
    return `
      <section tabindex="0" aria-label="Detail Cerita" class="detail-section">
        <div class="detail-container">
          <div class="detail-header">
            <button id="back-button" class="back-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Kembali
            </button>
          </div>
          <h1 id="story-title">Memuat Detail Cerita...</h1>
          <div id="story-content" class="detail-content">
            <div class="loading-indicator">
              <div class="spinner"></div>
              <p>Memuat konten...</p>
            </div>
          </div>
          <div id="detail-map"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const backButton = document.getElementById("back-button");

    // Add event listener for back button
    backButton.addEventListener("click", () => {
      window.history.back();
    });

    // Get story ID from URL
    const url = window.location.hash;
    const idMatch = url.match(/#\/detail\/([^/]+)/);

    if (!idMatch) {
      this.showError("ID cerita tidak ditemukan");
      return;
    }

    const storyId = idMatch[1];

    try {
      // Fetch story details using presenter
      const story = await this._presenter.getStoryDetail(storyId);
      
      if (!story) {
        this.showError("Cerita tidak ditemukan");
        return;
      }
      
      // Gunakan presenter untuk mempersiapkan data tampilan
      const viewData = this._presenter.prepareStoryDetailView(story);
      
      // Update page with story details
      document.getElementById("story-title").textContent = viewData.title;

      const contentContainer = document.getElementById("story-content");
      contentContainer.innerHTML = `
        <div class="detail-card">
          <div class="detail-image-container">
            <img src="${viewData.photoUrl}" alt="Foto cerita oleh ${viewData.author}" class="detail-image" />
          </div>
          <div class="detail-info">
            <div class="detail-meta">
              <span class="detail-date">${viewData.formattedDate}</span>
              <span class="detail-author">Diposting oleh: ${viewData.author}</span>
            </div>
            <p class="detail-description">${viewData.description}</p>
            <div class="detail-location">
              <svg xmlns="http://www.w3.org/2000/svg" class="location-pin" viewBox="0 0 24 24">
                <!-- SVG path data -->
              </svg>
              <span>${viewData.location}</span>
            </div>
          </div>
        </div>
      `;

      // Initialize map if coordinates are available
      this._renderMap(viewData);
      
    } catch (error) {
      console.error("Error fetching story details:", error);
      this.showError("Gagal memuat detail cerita");
    }
  }

  _renderMap(viewData) {
    if (!viewData.hasLocation) {
      document.getElementById("detail-map").style.display = "none";
      return;
    }
    
    const isLeafletAvailable = this._presenter.isLeafletAvailable();
    const mapContainer = document.getElementById("detail-map");
    
    if (isLeafletAvailable) {
      mapContainer.innerHTML = `
        <div class="map-card">
          <h2 class="map-title">Lokasi Cerita</h2>
          <div id="map-container" style="height: 400px;"></div>
        </div>
      `;

      const map = L.map("map-container").setView(
        [viewData.lat, viewData.lon],
        13,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([viewData.lat, viewData.lon]).addTo(map);
      marker
        .bindPopup(`<b>${viewData.title}</b><br>${viewData.description}`)
        .openPopup();

      // Improve map responsiveness
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } else {
      mapContainer.innerHTML = `
        <div class="map-card">
          <h2 class="map-title">Lokasi Cerita</h2>
          <div style="padding: 20px; text-align: center; background-color: #f8f9fa; border-radius: 8px;">
            <p>Peta tidak dapat dimuat. Pastikan koneksi internet Anda aktif.</p>
            <p>Lokasi: ${viewData.location}</p>
          </div>
        </div>
      `;
    }
  }
}

export default new DetailPage();



