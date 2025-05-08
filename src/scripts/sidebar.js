import { getUserSession, clearUserSession } from "./data/session.js";

function updateSidebarUserInfo() {
  try {
    // Dapatkan session dari memory
    const userSession = getUserSession();
    console.log("Updating sidebar with user session:", userSession);

    // Dapatkan elemen-elemen sidebar
    const sidebarAvatar = document.getElementById("sidebar-user-avatar");
    const sidebarUsername = document.getElementById("sidebar-username");
    const sidebarLoginItem = document.getElementById("sidebar-login-item");
    const sidebarRegisterItem = document.getElementById(
      "sidebar-register-item",
    );
    const sidebarLogoutItem = document.getElementById("sidebar-logout-item");

    if (userSession && userSession.token) {
      // User sudah login
      console.log("User logged in as:", userSession.name);

      if (sidebarAvatar) {
        sidebarAvatar.src =
          "https://media.tenor.com/PLWtefAc3TMAAAAM/kiana-kaslana.gif";
        console.log("Updated avatar");
      }

      if (sidebarUsername) {
        sidebarUsername.textContent = userSession.name || "User";
        console.log(
          "Updated sidebar username to:",
          sidebarUsername.textContent,
        );
      }

      if (sidebarLoginItem) {
        sidebarLoginItem.style.display = "none";
        console.log("Hide login item");
      }

      if (sidebarRegisterItem) {
        sidebarRegisterItem.style.display = "none";
        console.log("Hide register item");
      }

      if (sidebarLogoutItem) {
        sidebarLogoutItem.style.display = "block";
        console.log("Show logout item");
      }
    } else {
      // User belum login
      console.log("User not logged in, showing as Guest");

      if (sidebarAvatar)
        sidebarAvatar.src =
          "https://media.tenor.com/PLWtefAc3TMAAAAM/kiana-kaslana.gif";
      if (sidebarUsername) sidebarUsername.textContent = "Guest";
      if (sidebarLoginItem) sidebarLoginItem.style.display = "block";
      if (sidebarRegisterItem) sidebarRegisterItem.style.display = "block";
      if (sidebarLogoutItem) sidebarLogoutItem.style.display = "none";
    }
  } catch (error) {
    console.error("Error updating sidebar user info:", error);
  }
}

function initSidebar() {
  // Jangan inisialisasi sidebar jika layar lebih besar dari 1000px
  if (window.innerWidth > 1000) {
    console.log("Skipping sidebar initialization for desktop view");
    return;
  }

  console.log("Initializing sidebar for mobile view");

  // Hapus sidebar lama jika ada
  const oldSidebar = document.getElementById("new-sidebar");
  if (oldSidebar) {
    oldSidebar.remove();
  }

  const oldOverlay = document.getElementById("new-sidebar-overlay");
  if (oldOverlay) {
    oldOverlay.remove();
  }

  // Dapatkan user session terlebih dahulu
  const userSession = getUserSession();
  const userName =
    userSession && userSession.token ? userSession.name : "Guest";
  console.log("Creating sidebar with initial username:", userName);

  // Buat elemen sidebar baru
  const sidebar = document.createElement("div");
  sidebar.id = "new-sidebar";

  // Buat konten sidebar dengan nama pengguna yang sudah diambil
  sidebar.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 20px 0 20px;">
      <h2 style="margin: 0; font-size: 22px; color: #333;">Menu</h2>
      <button id="close-sidebar" style="background: none; border: none; font-size: 24px; cursor: pointer;">&times;</button>
    </div>
    <div class="user-profile">
      <img id="sidebar-user-avatar" src="https://media.tenor.com/PLWtefAc3TMAAAAM/kiana-kaslana.gif" alt="User Avatar" class="sidebar-avatar" />
      <div>
        <span id="sidebar-username" class="sidebar-username">${userName}</span>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;">Welcome back!</p>
      </div>
    </div>
    <ul class="nav-list">
      <li><a href="#/"><i class="fas fa-home"></i> Beranda</a></li>
      <li><a href="#/about"><i class="fas fa-info-circle"></i> About</a></li>
      <li><a href="#/add" id="sidebar-add-story-link"><i class="fas fa-plus-circle"></i> Tambah Cerita</a></li>
      <li id="sidebar-login-item" ${userSession && userSession.token ? 'style="display: none;"' : ""}><a href="#/login"><i class="fas fa-sign-in-alt"></i> Login</a></li>
      <li id="sidebar-register-item" ${userSession && userSession.token ? 'style="display: none;"' : ""}><a href="#/register"><i class="fas fa-user-plus"></i> Register</a></li>
      <li id="sidebar-logout-item" ${userSession && userSession.token ? "" : 'style="display: none;"'}><a href="#" id="sidebar-logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
    </ul>
    <div style="padding: 20px; margin-top: 30px; text-align: center; color: #999; font-size: 14px;">
      <p>© Oatse Rizqy Hendarto</p>
    </div>
  `;

  // Buat overlay
  const overlay = document.createElement("div");
  overlay.id = "new-sidebar-overlay";

  // Tambahkan elemen ke body
  document.body.appendChild(sidebar);
  document.body.appendChild(overlay);

  // Dapatkan tombol hamburger
  const hamburgerBtn = document.getElementById("hamburger-button");
  console.log("Hamburger button found:", hamburgerBtn);

  if (hamburgerBtn) {
    // Tambahkan event listener untuk tombol hamburger
    hamburgerBtn.addEventListener("click", function (event) {
      console.log("Hamburger button clicked!");
      event.preventDefault();
      event.stopPropagation();

      // Update sidebar info sebelum menampilkan
      updateSidebarUserInfo();

      // Toggle sidebar dengan animasi
      sidebar.classList.add("active");
      overlay.style.display = "block";
      document.body.classList.add("sidebar-open");

      // Tambahkan animasi fade-in untuk overlay
      setTimeout(() => {
        overlay.style.opacity = "1";
      }, 10);
    });
  } else {
    console.error("Hamburger button not found");
  }

  // Tambahkan event listener untuk tombol tutup
  const closeBtn = document.getElementById("close-sidebar");
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      console.log("Close button clicked");
      closeSidebar(sidebar, overlay);
    });
  }

  // Tambahkan event listener untuk overlay
  overlay.addEventListener("click", function () {
    console.log("Overlay clicked");
    closeSidebar(sidebar, overlay);
  });

  // Tambahkan event listener untuk link di sidebar
  const sidebarLinks = sidebar.querySelectorAll("a");
  sidebarLinks.forEach(function (link) {
    if (link.id !== "sidebar-logout-link") {
      link.addEventListener("click", function () {
        closeSidebar(sidebar, overlay);
      });
    }
  });

  // Add logout functionality - FIXED VERSION
  setTimeout(() => {
    const logoutLink = document.getElementById("sidebar-logout-link");
    console.log("Logout link found:", logoutLink);

    if (logoutLink) {
      // Remove any existing event listeners
      logoutLink.removeEventListener("click", handleLogout);

      // Add new event listener
      logoutLink.addEventListener("click", handleLogout);
      console.log("Logout event listener attached");
    } else {
      console.error("Logout link not found in sidebar");
    }
  }, 100);

  // Panggil updateSidebarUserInfo untuk memastikan status login terbaru
  updateSidebarUserInfo();

  console.log("Sidebar setup complete");
}

// Separate function for logout handling
function handleLogout(e) {
  e.preventDefault();
  e.stopPropagation(); // Stop event propagation
  console.log("🔴 SIDEBAR: Logout button clicked");

  try {
    // Hapus session
    const logoutResult = clearUserSession();

    if (logoutResult) {
      console.log("✅ SIDEBAR: Logout successful - Session cleared");
    } else {
      console.log("❌ SIDEBAR: Logout failed - Could not clear session");
    }

    // Get sidebar and overlay elements
    const sidebar = document.getElementById("new-sidebar");
    const overlay = document.getElementById("new-sidebar-overlay");

    // Tutup sidebar
    if (sidebar && overlay) {
      closeSidebar(sidebar, overlay);
      console.log("🔵 SIDEBAR: Sidebar closed after logout attempt");
    }

    // Redirect ke halaman login
    console.log("🔵 SIDEBAR: Redirecting to login page");
    window.location.hash = "#/login";
  } catch (error) {
    console.error("❌ SIDEBAR: Error during logout process:", error);
  }
}

// Add a direct event listener to document for debugging
document.addEventListener("click", function (e) {
  if (
    e.target &&
    (e.target.id === "sidebar-logout-link" ||
      (e.target.parentElement &&
        e.target.parentElement.id === "sidebar-logout-link"))
  ) {
    console.log("🔍 Document-level click detected on logout link");
    handleLogout(e);
  }
});

// Fungsi untuk menutup sidebar dengan animasi
function closeSidebar(sidebar, overlay) {
  sidebar.classList.remove("active");
  overlay.style.opacity = "0";

  // Tunggu animasi selesai sebelum menyembunyikan overlay
  setTimeout(() => {
    overlay.style.display = "none";
    document.body.classList.remove("sidebar-open");
  }, 300);
}

// Tambahkan fungsi untuk memperbarui sidebar secara manual
export function refreshSidebar() {
  // Hapus sidebar lama
  const oldSidebar = document.getElementById("new-sidebar");
  if (oldSidebar) {
    oldSidebar.remove();
  }

  // Inisialisasi sidebar baru
  initSidebar();
}

// Export fungsi
export { initSidebar, updateSidebarUserInfo };

// Tambahkan event listener untuk resize window
window.addEventListener("resize", function () {
  const sidebar = document.getElementById("new-sidebar");
  const overlay = document.getElementById("new-sidebar-overlay");

  if (window.innerWidth > 1000) {
    // Jika layar lebih besar dari 1000px, hapus sidebar
    if (sidebar) {
      sidebar.classList.remove("active");
      sidebar.style.display = "none";
    }

    if (overlay) {
      overlay.style.display = "none";
    }

    document.body.classList.remove("sidebar-open");
  } else {
    // Jika layar 1000px atau lebih kecil, pastikan sidebar ada
    if (!sidebar) {
      initSidebar();
    }
  }
});
