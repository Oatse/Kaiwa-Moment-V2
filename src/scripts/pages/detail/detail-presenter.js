class DetailPresenter {
  constructor(view, model) {
    this._view = view;
    this._model = model;
  }

  async getStoryDetail(id) {
    try {
      const story = await this._model.fetchStoryDetail(id);
      if (!story) {
        this._view.showError("Cerita tidak ditemukan");
        return null;
      }
      return story;
    } catch (error) {
      this._view.showError("Gagal memuat detail cerita");
      console.error("Error fetching story details:", error);
      return null;
    }
  }

  getDescription(story) {
    return story.description || "Tidak ada deskripsi";
  }
  
  formatDate(dateString) {
    const createdDate = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(createdDate);
  }
  
  // Tambahkan metode untuk mempersiapkan data tampilan
  prepareStoryDetailView(story) {
    if (!story) return null;
    
    return {
      title: story.name,
      formattedDate: this.formatDate(story.createdAt),
      description: this.getDescription(story),
      photoUrl: story.photoUrl,
      author: story.name,
      hasLocation: !!(story.lat && story.lon),
      location: story.lat && story.lon ? 
        `Lat: ${story.lat.toFixed(6)}, Lon: ${story.lon.toFixed(6)}` : 
        'Lokasi tidak tersedia',
      lat: story.lat,
      lon: story.lon
    };
  }
  
  // Tambahkan metode untuk memeriksa ketersediaan Leaflet
  isLeafletAvailable() {
    return typeof L !== "undefined";
  }
}

export default DetailPresenter;


