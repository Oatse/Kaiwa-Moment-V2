// CSS imports
import "../styles/styles.css";
import "../styles/add-story.css";
import "../styles/animations.css";
import "../styles/home-page.css";
import "../styles/header.css";
import "../styles/about.css";
import "../styles/sidebar.css";
import "../styles/detail-page.css";
import "../styles/transitions.css";
import "../styles/auth.css";
import app from "./pages/app.js";
import { initSidebar, updateSidebarUserInfo } from "./sidebar.js";

document.addEventListener("DOMContentLoaded", () => {
  // Debug hamburger button
  const hamburgerButton = document.getElementById("hamburger-button");
  console.log("Hamburger button on load:", hamburgerButton);

  if (hamburgerButton) {
    // Tambahkan event listener langsung di sini
    hamburgerButton.addEventListener("click", function (event) {
      console.log("Index.js - Hamburger button clicked!");
      event.preventDefault();
      event.stopPropagation();

      // Coba toggle sidebar baru jika ada
      const newSidebar = document.getElementById("new-sidebar");
      const overlay = document.getElementById("new-sidebar-overlay");

      if (newSidebar) {
        newSidebar.classList.add("active");
        console.log(
          "Toggling new sidebar, active:",
          newSidebar.classList.contains("active"),
        );

        if (overlay) {
          overlay.style.display = "block";
          setTimeout(() => {
            overlay.style.opacity = "1";
          }, 10);
        }

        document.body.classList.add("sidebar-open");
      }
    });
  }

  // Inisialisasi aplikasi
  app.init();

  // Inisialisasi sidebar baru
  initSidebar();

  // Update sidebar user info
  updateSidebarUserInfo();

  // Perbaiki viewport height
  fixViewportHeight();
});

// Fungsi untuk memperbaiki viewport height di mobile
function fixViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);

  window.addEventListener("resize", () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  });
}

// Tambahkan event listener untuk logout event
document.addEventListener("userLoggedOut", () => {
  console.log("Index.js received logout event");

  // Refresh sidebar untuk memastikan UI diperbarui
  try {
    updateSidebarUserInfo();
    refreshSidebar();
  } catch (error) {
    console.error("Error updating sidebar after logout:", error);
  }
});

// Tambahkan event listener untuk login event
document.addEventListener("userLoggedIn", () => {
  console.log("Index.js received login event");

  // Update UI setelah login berhasil
  try {
    // Jika app sudah diinisialisasi, panggil updateAuthButtons
    if (app && typeof app.updateAuthButtons === 'function') {
      app.updateAuthButtons();
    }
    
    // Update sidebar
    updateSidebarUserInfo();
  } catch (error) {
    console.error("Error updating UI after login:", error);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Skip to content functionality
  const skipLink = document.querySelector('.skip-to-content');
  const mainContent = document.getElementById('main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      
      // Scroll to main content for better user experience
      mainContent.scrollIntoView({ behavior: 'smooth' });
    });
  }
});



