import { getStories } from "../../data/api.js";

class HomeModel {
  async fetchStories(token) {
    try {
      return await getStories(token);
    } catch (error) {
      console.error("Error loading stories:", error);
      return [];
    }
  }
}

export default HomeModel;