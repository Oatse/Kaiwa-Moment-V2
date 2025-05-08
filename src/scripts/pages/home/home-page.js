import { getUserSession } from "../../data/session.js";
import HomePresenter from "./home-presenter.js";
import HomeModel from "./home-model.js";

class HomePage {
  constructor() {
    this._model = new HomeModel();
    this._presenter = new HomePresenter(this, this._model);
  }

  showError(message) {
    alert(message);
  }
  
  showEmptyStories() {
    document.getElementById("stories-list").innerHTML =
      "<p>Tidak ada cerita yang tersedia.</p>";
  }
  
  renderStories(storiesHTML) {
    const listContainer = document.getElementById("stories-list");
    listContainer.innerHTML = storiesHTML;
  }
  
  renderPagination(paginationHTML) {
    const paginationContainer = document.getElementById("pagination");
    paginationContainer.innerHTML = paginationHTML;
  }
  
  initMap(mapConfig) {
    if (!this._presenter.isLeafletAvailable()) {
      console.warn("Leaflet tidak tersedia, peta tidak dapat ditampilkan");
      return;
    }
    
    const { mapElement, baseMaps, storiesWithLocation } = mapConfig;
    
    // Inisialisasi peta
    const map = L.map(mapElement).setView([-2.548926, 118.0148634], 5);
    
    // Tambahkan tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Tambahkan Layer Control
    L.control.layers(baseMaps).addTo(map);
    
    // Tambahkan marker untuk setiap cerita
    storiesWithLocation.forEach((story) => {
      const marker = L.marker([story.lat, story.lon]).addTo(map);
      marker.bindPopup(story.popupContent, {
        maxWidth: 300,
        closeButton: true,
      });
    });
    
    return map;
  }

  async render() {
    return `
      <section tabindex="0" aria-label="Daftar Cerita">
        <div class="header-wrapper">
          <h1>Daftar Cerita</h1>
          <button id="add-story-button" class="add-story-button">  
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">  
              <line x1="12" y1="5" x2="12" y2="19"></line>  
              <line x1="5" y1="12" x2="19" y2="12"></line>  
            </svg>  
            Tambah Story  
          </button>  
        </div>
        <div class="story-wrapper">
          <div id="stories-list" class="story-list"></div>
          <div class="pagination-container">
            <div id="pagination" class="pagination"></div>
          </div>
        </div>
        <div id="map" style="height: 400px; margin-top: 20px;"></div>
      </section>
    `;
  }

  async afterRender() {
    // Verifikasi login melalui presenter
    if (!this._presenter.verifyUserLogin()) {
      return;
    }

    try {
      // Inisialisasi halaman melalui presenter
      await this._presenter.initializePage();
      
      // Tambahkan event listener untuk tombol tambah cerita
      const addStoryButton = document.getElementById("add-story-button");
      if (addStoryButton) {
        addStoryButton.addEventListener("click", () => {
          window.location.hash = "#/add";
        });
      }
    } catch (error) {
      console.error("Error initializing home page:", error);
      this.showError("Terjadi kesalahan saat memuat halaman");
    }
  }
}

export default new HomePage();

