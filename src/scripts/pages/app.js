import routes from "../routes/routes.js";
import { getActiveRoute } from "../routes/url-parser.js";
import {
  getUserSession,
  clearUserSession,
  checkLoginStatus,
} from "../data/session.js";
import { showNotification } from "../utils/index.js";
import { updateSidebarUserInfo, refreshSidebar } from "../sidebar.js";
import "../../styles/animations.css";

const app = {
  async renderPage() {
    const parsedUrl = getActiveRoute();
    const userSession = getUserSession();

    console.log("Rendering page:", parsedUrl);
    console.log("Current hash:", window.location.hash);
    console.log("User session:", userSession);

    // Periksa status login jika ada session
    if (userSession && userSession.token) {
      const isLoggedIn = await checkLoginStatus();
      if (!isLoggedIn && parsedUrl !== "/login") {
        console.log("Session tidak valid, redirect ke login");
        showNotification(
          "Sesi Anda telah berakhir. Silakan login kembali.",
          "error",
        );
        window.location.hash = "#/login";
        return;
      }
    }

    // Cek protected routes
    const protectedRoutes = ["/"];
    if (
      protectedRoutes.includes(parsedUrl) &&
      (!userSession || !userSession.token)
    ) {
      if (parsedUrl !== "/add") {
        console.log("User belum login, redirect ke halaman login");
        showNotification(
          "Anda harus login untuk mengakses halaman ini.",
          "error",
        );
        if (window.location.hash !== "#/login") {
          window.location.hash = "#/login";
        }
        return;
      }
    }

    const page = routes[parsedUrl] || routes["/"];
    const main = document.querySelector("main");

    if (main && page) {
      // Tambahkan class untuk menandai halaman yang akan ditinggalkan
      document.documentElement.classList.add("page-transition");

      // Gunakan View Transition API jika tersedia
      if (document.startViewTransition) {
        try {
          await document.startViewTransition(async () => {
            // Tambahkan class untuk animasi
            document.body.classList.add("page-transitioning");

            // Render konten baru
            main.innerHTML = await page.render();

            // Jalankan afterRender jika ada
            if (page.afterRender) {
              await page.afterRender();
            }
          }).finished;

          // Hapus class setelah transisi selesai
          setTimeout(() => {
            document.body.classList.remove("page-transitioning");
            document.documentElement.classList.remove("page-transition");
          }, 700); // Increased from 500ms to 700ms for smoother transitions
        } catch (error) {
          console.error("View Transition error:", error);
          // Fallback jika terjadi error
          main.innerHTML = await page.render();
          if (page.afterRender) {
            await page.afterRender();
          }
          document.body.classList.remove("page-transitioning");
          document.documentElement.classList.remove("page-transition");
        }
      } else {
        // Fallback untuk browser yang tidak mendukung
        await main.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 400,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }).finished;

        main.innerHTML = await page.render();

        await main.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 400,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }).finished;

        if (page.afterRender) {
          await page.afterRender();
        }

        document.documentElement.classList.remove("page-transition");
      }

      // Perbarui sidebar setelah render halaman
      refreshSidebar();
    } else {
      console.error("Main element or page not found");
    }
  },

  async updateAuthButtons() {
    const userSession = getUserSession();
    const loginButton = document.getElementById("login-button");
    const signupButton = document.getElementById("register-link");
    const userIcon = document.getElementById("user-icon");
    const logoutButton = document.getElementById("logout-button");
    const userDropdown = document.getElementById("user-dropdown");
    const addStoryLink = document.getElementById("add-story-link");
    const mobileUserProfile = document.getElementById("mobile-user-profile");

    console.log("Updating auth buttons with session:", userSession);

    // Update sidebar user info
    updateSidebarUserInfo();

    // Refresh sidebar untuk memastikan perubahan diterapkan
    refreshSidebar();

    if (userSession && userSession.token) {
      // Jika user sudah login
      if (loginButton) loginButton.style.display = "none";
      if (signupButton) signupButton.style.display = "none";
      if (userIcon) {
        userIcon.style.display = "flex"; // Ubah dari block ke flex untuk alignment yang lebih baik
        
        // Update avatar jika ada
        const userAvatar = userIcon.querySelector('.user-avatar');
        if (userAvatar) {
          userAvatar.alt = `${userSession.name}'s Avatar`;
        }
      }
      if (addStoryLink) addStoryLink.style.display = "block";
      if (mobileUserProfile) {
        mobileUserProfile.style.display = "flex";
        const mobileUsername = mobileUserProfile.querySelector(".username");
        if (mobileUsername) {
          mobileUsername.textContent = userSession.name;
        }
      }

      // Tambahkan event listener untuk menampilkan dropdown
      if (userIcon) {
        // Hapus event listener lama untuk mencegah duplikasi
        userIcon.removeEventListener("click", this.userIconClickHandler);
        
        // Tambahkan event listener baru
        this.userIconClickHandler = (event) => {
          event.stopPropagation(); // Prevent click from bubbling to document
          const isDropdownVisible = userDropdown.style.display === "block";
          userDropdown.style.display = isDropdownVisible ? "none" : "block";
        };
        
        userIcon.addEventListener("click", this.userIconClickHandler);
      }

      if (logoutButton) {
        // Hapus event listener lama jika ada
        logoutButton.removeEventListener("click", this.logoutHandler);

        // Tambahkan event listener baru
        this.logoutHandler = () => {
          console.log("Logout clicked from header");
          clearUserSession();
          this.updateAuthButtons();
          window.location.hash = "#/login";
          window.location.reload();
        };

        logoutButton.addEventListener("click", this.logoutHandler);
      }
      
      // Tambahkan event listener untuk menutup dropdown saat klik di luar
      if (!this.documentClickHandler) {
        this.documentClickHandler = (event) => {
          if (userDropdown && userDropdown.style.display === "block" && 
              !userIcon.contains(event.target) && 
              !userDropdown.contains(event.target)) {
            userDropdown.style.display = "none";
          }
        };
        
        document.addEventListener("click", this.documentClickHandler);
      }
    } else {
      // Jika user belum login (guest)
      if (loginButton) loginButton.style.display = "block";
      if (signupButton) signupButton.style.display = "block";
      if (userIcon) userIcon.style.display = "none";
      if (addStoryLink) addStoryLink.style.display = "none";
      if (mobileUserProfile) mobileUserProfile.style.display = "none";
      if (userDropdown) userDropdown.style.display = "none";
    }
  },

  init() {
    // Coba ambil session dari cookie saat aplikasi dimuat
    const userSession = getUserSession();
    console.log("Initial user session from cookies:", userSession);

    window.addEventListener("hashchange", () => this.renderPage());
    window.addEventListener("load", () => {
      this.renderPage();
      this.updateAuthButtons();

      // Tambahkan event listener untuk login button
      const loginButton = document.getElementById("login-button");
      if (loginButton) {
        loginButton.addEventListener("click", () => {
          window.location.hash = "#/login";
        });
      }
    });

    // Tambahkan event listener untuk logout event
    document.addEventListener("userLoggedOut", () => {
      console.log("App received logout event");
      try {
        // Update auth buttons
        this.updateAuthButtons();

        // Jika tidak sedang di halaman login, redirect ke login
        if (window.location.hash !== "#/login") {
          console.log("Redirecting to login page after logout from app.js");
          window.location.hash = "#/login";

          // Force reload halaman untuk memastikan state aplikasi bersih
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }
      } catch (error) {
        console.error("Error handling logout event:", error);
      }
    });
  },
};

export default app;

