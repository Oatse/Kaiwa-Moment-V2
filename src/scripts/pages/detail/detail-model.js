import { getStoryDetail } from "../../data/api.js";
import { getUserSession } from "../../data/session.js";

class DetailModel {
  async fetchStoryDetail(id) {
    try {
      return await getStoryDetail(id);
    } catch (error) {
      console.error("Error fetching story details:", error);
      return null;
    }
  }
  
  getUserSession() {
    return getUserSession();
  }
}

export default DetailModel;