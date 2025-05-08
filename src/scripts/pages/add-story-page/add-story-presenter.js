import { showNotification } from "../../utils/index.js";

class AddStoryPresenter {
  constructor(view, model) {
    this._view = view;
    this._model = model;
  }

  async submitStory(storyData) {
    try {
      const userSession = this._model.getUserSession();
      const result = await this._model.submitStory(storyData);

      if (result && !result.error) {
        showNotification("Cerita berhasil ditambahkan!", "success");
        return { success: true, userSession };
      } else {
        throw new Error(result?.message || "Gagal menambahkan cerita.");
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
      return { success: false, error: error.message };
    }
  }
  
  // Tambahkan metode untuk mendapatkan form data
  getFormData() {
    const description = document.getElementById("story-description").value;
    const photo = document.getElementById("story-photo").files[0];
    const lat = document.getElementById("story-lat").value || null;
    const lon = document.getElementById("story-lon").value || null;

    return {
      description,
      photo,
      lat: lat ? parseFloat(lat) : null,
      lon: lon ? parseFloat(lon) : null,
    };
  }
}

export default AddStoryPresenter;


