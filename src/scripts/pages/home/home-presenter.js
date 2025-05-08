import { getUserSession } from "../../data/session.js";

class HomePresenter {
  constructor(view, model) {
    this._view = view;
    this._model = model;
    this._storiesPerPage = 8;
    this._stories = [];
    this._currentPage = 1;
  }

  async loadStories(token) {
    try {
      const stories = await this._model.fetchStories(token);
      if (!stories || stories.length === 0) {
        this._view.showEmptyStories();
      }
      return stories;
    } catch (error) {
      console.error("Error loading stories:", error);
      this._view.showError("Gagal memuat cerita");
      return [];
    }
  }
  
  formatDate(dateString) {
    const createdDate = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(createdDate);
  }
  
  preparePaginationData(stories) {
    return {
      storiesPerPage: this._storiesPerPage,
      totalPages: Math.ceil(stories.length / this._storiesPerPage)
    };
  }
  
  getStoriesForPage(stories, page) {
    const startIndex = (page - 1) * this._storiesPerPage;
    const endIndex = Math.min(startIndex + this._storiesPerPage, stories.length);
    return stories.slice(startIndex, endIndex);
  }
  
  formatStoryItemHTML(story) {
    return `
      <div class="story-item" tabindex="0" aria-label="Cerita ${story.name}">
        <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" />
        <h3>${story.name}</h3>
        <span class="story-item-date">  
        ${new Date(story.createdAt).toLocaleDateString()}  
        </span>
        <p>${story.description || story.content || ""}</p>
        <div class="story-author-info">  
          <svg xmlns="http://www.w3.org/2000/svg" class="story-author-icon" viewBox="0 0 24 24">  
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>  
            <polyline points="22,6 12,13 2,6"></polyline>  
          </svg>  
          <span>Diposting oleh: ${story.author || story.name}</span>  
        </div> 
        
        <div class="location-info">  
          <svg xmlns="http://www.w3.org/2000/svg" class="location-pin" viewBox="0 0 24 24">  
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>  
          </svg>  
        <span class="location-coordinates">  
          Lat: ${story.lat || "Tidak tersedia"}, Lon: ${story.lon || "Tidak tersedia"}  
        </span>  
      </div>
      <a href="#/detail/${story.id}" class="detail-link">Lihat Detail →</a>
      </div>
    `;
  }
  
  isLeafletAvailable() {
    return typeof L !== "undefined";
  }
  
  prepareMapData(stories) {
    return stories.filter(story => story && story.lat && story.lon).map(story => ({
      lat: story.lat,
      lon: story.lon,
      popupContent: `
        <div class="popup-content">
          <img src="${story.photoUrl}" alt="Foto cerita oleh ${story.name}" />
          <h3>${story.name}</h3>
          <p>${story.description || story.content || ""}</p>
          <p><small>Diposting oleh: ${story.author || story.name}</small></p>
        </div>
      `
    }));
  }
  
  verifyUserLogin() {
    const userSession = getUserSession();
    if (!userSession || !userSession.token) {
      this._view.showError("Anda harus login terlebih dahulu.");
      window.location.hash = "#/login";
      return false;
    }
    return true;
  }
  
  generatePaginationHTML(currentPage, totalPages) {
    let paginationHTML = '';
    
    // Tombol Previous
    paginationHTML += `<button class="pagination-button prev-button" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}"><</button>`;
    
    // Nomor halaman
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<button class="pagination-button page-number ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    
    // Tombol Next
    paginationHTML += `<button class="pagination-button next-button" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">></button>`;
    
    return paginationHTML;
  }
  
  async initializePage() {
    const userSession = getUserSession();
    this._stories = await this.loadStories(userSession.token);
    
    if (!this._stories || this._stories.length === 0) {
      return;
    }
    
    // Render stories untuk halaman pertama
    this.renderCurrentPage();
    
    // Setup event listener untuk pagination
    this.setupPaginationListeners();
    
    // Setup map jika Leaflet tersedia
    this.setupMap();
  }
  
  renderCurrentPage() {
    // Get stories untuk halaman saat ini
    const currentPageStories = this.getStoriesForPage(this._stories, this._currentPage);
    
    // Generate HTML untuk stories
    let storiesHTML = '';
    currentPageStories.forEach(story => {
      storiesHTML += this.formatStoryItemHTML(story);
    });
    
    // Render stories ke view
    this._view.renderStories(storiesHTML);
    
    // Generate dan render pagination
    const { totalPages } = this.preparePaginationData(this._stories);
    const paginationHTML = this.generatePaginationHTML(this._currentPage, totalPages);
    this._view.renderPagination(paginationHTML);
    
    // Setup event listeners untuk story items
    this.setupStoryItemListeners();
  }
  
  setupPaginationListeners() {
    const paginationContainer = document.getElementById("pagination");
    if (paginationContainer) {
      paginationContainer.addEventListener("click", (event) => {
        const button = event.target.closest(".pagination-button");
        if (button && !button.disabled) {
          const page = parseInt(button.dataset.page, 10);
          this._currentPage = page;
          this.renderCurrentPage();
        }
      });
    }
  }
  
  setupStoryItemListeners() {
    const storyItems = document.querySelectorAll(".story-item");
    storyItems.forEach(item => {
      item.addEventListener("click", (event) => {
        // Jika yang diklik adalah link detail, biarkan default behavior
        if (event.target.closest(".detail-link")) {
          return;
        }
        
        // Jika bukan link detail, buka detail cerita
        const detailLink = item.querySelector(".detail-link");
        if (detailLink) {
          window.location.hash = detailLink.getAttribute("href");
        }
      });
      
      // Tambahkan keyboard accessibility
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          const detailLink = item.querySelector(".detail-link");
          if (detailLink) {
            window.location.hash = detailLink.getAttribute("href");
          }
        }
      });
    });
  }
  
  setupMap() {
    if (!this.isLeafletAvailable()) {
      return;
    }
    
    const mapElement = document.getElementById("map");
    if (!mapElement) {
      return;
    }
    
    // Siapkan base maps
    const baseMaps = {
      "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),
      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      })
    };
    
    // Siapkan data untuk peta
    const storiesWithLocation = this.prepareMapData(this._stories);
    
    // Inisialisasi peta melalui view
    this._view.initMap({
      mapElement,
      baseMaps,
      storiesWithLocation
    });
  }
}

export default HomePresenter;

