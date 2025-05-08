import CONFIG from "../config.js";
import { getUserSession } from "./session.js";

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
  STORIES_GUEST: `${CONFIG.BASE_URL}/stories/guest`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
};

async function getStories(location = 0) {
  try {
    const userSession = getUserSession();
    const headers = userSession
      ? { Authorization: `Bearer ${userSession.token}` }
      : {};
    const response = await fetch(
      `${CONFIG.BASE_URL}/stories?location=${location}`,
      { headers },
    );
    const data = await response.json();
    return data.listStory || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function addStory(storyData) {
  try {
    const userSession = getUserSession();
    const formData = new FormData();
    formData.append("description", storyData.description);
    formData.append("photo", storyData.photo);
    if (storyData.lat) formData.append("lat", storyData.lat);
    if (storyData.lon) formData.append("lon", storyData.lon);

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${userSession.token}`,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function addStoryAsGuest(storyData) {
  const formData = new FormData();
  formData.append("description", storyData.description);
  formData.append("photo", storyData.photo);
  if (storyData.lat !== null) formData.append("lat", storyData.lat);
  if (storyData.lon !== null) formData.append("lon", storyData.lon);

  try {
    const response = await fetch(`${CONFIG.BASE_URL}/stories/guest`, {
      method: "POST",
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error("Error adding story as guest:", error);
    throw new Error("Gagal menambahkan cerita sebagai guest.");
  }
}

async function login(email, password) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error saat login:", error);
    return { error: true, message: "Terjadi kesalahan saat login" };
  }
}

async function register(name, email, password) {
  try {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal registrasi");
    }

    return await response.json();
  } catch (error) {
    console.error("Error saat registrasi:", error);
    return null;
  }
}

async function getStoryDetail(id) {
  try {
    const userSession = getUserSession();
    const headers = userSession
      ? { Authorization: `Bearer ${userSession.token}` }
      : {};

    const response = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers,
    });
    const data = await response.json();

    if (data.error) {
      console.error("API Error:", data.message);
      return null;
    }

    return data.story;
  } catch (error) {
    console.error("Error fetching story detail:", error);
    return null;
  }
}

// Ekspor semua fungsi dalam satu baris
export {
  getStories,
  addStory,
  addStoryAsGuest,
  getStoryDetail,
  login,
  register,
};
