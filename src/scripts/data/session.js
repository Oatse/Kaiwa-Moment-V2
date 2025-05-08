import { updateSidebarUserInfo } from "../sidebar.js";
import CONFIG from "../config.js";

let currentUserSession = null;

// Fungsi untuk menyimpan sesi pengguna
export function setUserSession(userData) {
  currentUserSession = userData;
  console.log("User session set:", userData);

  // Simpan token ke cookie dengan expiry 1 hari
  if (userData && userData.token) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000); // 1 hari
    document.cookie = `authToken=${userData.token}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    document.cookie = `userId=${userData.userId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    document.cookie = `userName=${userData.name}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    console.log("Auth cookies set with expiry:", expiryDate);
  }

  // Update sidebar setelah set session
  try {
    if (typeof updateSidebarUserInfo === "function") {
      updateSidebarUserInfo();
      console.log("Sidebar updated after setting session");
    }
  } catch (error) {
    console.error("Error updating sidebar after setting session:", error);
  }
}

// Fungsi untuk mendapatkan sesi pengguna
export function getUserSession() {
  // Jika sudah ada di memory, gunakan itu
  if (currentUserSession) {
    return currentUserSession;
  }

  // Jika tidak ada di memory, coba ambil dari cookies
  try {
    const cookies = document.cookie.split(";");
    let token = "";
    let userId = "";
    let name = "";

    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith("authToken=")) {
        token = cookie.substring("authToken=".length, cookie.length);
      } else if (cookie.startsWith("userId=")) {
        userId = cookie.substring("userId=".length, cookie.length);
      } else if (cookie.startsWith("userName=")) {
        name = cookie.substring("userName=".length, cookie.length);
      }
    }

    // Jika token ada, buat session baru
    if (token) {
      currentUserSession = { token, userId, name };
      return currentUserSession;
    }

    return null;
  } catch (error) {
    console.error("Error getting user session:", error);
    return null;
  }
}

// Fungsi untuk menghapus sesi pengguna
export function clearUserSession() {
  try {
    // Hapus session dari memory
    currentUserSession = null;
    console.log("User session cleared from memory");

    // Hapus cookies dengan cara yang lebih robust
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    document.cookie =
      "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    document.cookie =
      "userName=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";

    // Hapus dari localStorage juga untuk berjaga-jaga
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");

    console.log("Auth cookies and localStorage cleared successfully");

    // Trigger event untuk memberitahu komponen lain bahwa user telah logout
    const logoutEvent = new CustomEvent("userLoggedOut");
    document.dispatchEvent(logoutEvent);
    console.log("Logout event dispatched");

    return true;
  } catch (error) {
    console.error("Error clearing user session:", error);
    return false;
  }
}

// Fungsi untuk memeriksa status login dari API
export async function checkLoginStatus() {
  try {
    // Dapatkan session, baik dari memory atau cookie
    const userSession = getUserSession();

    // Jika tidak ada token, user tidak login
    if (!userSession || !userSession.token) {
      return false;
    }

    // Coba validasi token dengan API yang tersedia
    const response = await fetch(`${CONFIG.BASE_URL}/stories?size=1`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userSession.token}`,
      },
    });

    if (response.ok) {
      // Token valid
      return true;
    } else {
      // Token tidak valid, hapus session
      clearUserSession();
      return false;
    }
  } catch (error) {
    console.error("Error checking login status:", error);
    return false;
  }
}

// Fungsi helper untuk mendapatkan nilai cookie berdasarkan nama
function getCookie(name) {
  const cookieValue = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (cookieValue) {
    return cookieValue.split("=")[1];
  }

  return null;
}
