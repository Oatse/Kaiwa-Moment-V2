import { addStory, addStoryAsGuest } from "../../data/api.js";
import { getUserSession } from "../../data/session.js";

class AddStoryModel {
  async submitStory(storyData) {
    try {
      const userSession = getUserSession();

      if (userSession && userSession.token) {
        return await addStory(storyData);
      } else {
        return await addStoryAsGuest(storyData);
      }
    } catch (error) {
      console.error("Error submitting story:", error);
      throw error;
    }
  }

  getUserSession() {
    return getUserSession();
  }
}

export default AddStoryModel;