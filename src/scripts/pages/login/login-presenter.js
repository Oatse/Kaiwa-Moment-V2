import { showNotification } from "../../utils/index.js";
import { updateSidebarUserInfo, refreshSidebar } from "../../sidebar.js";

class LoginPresenter {
  constructor(view, model) {
    this._view = view;
    this._model = model;
  }

  async login(email, password) {
    try {
      const result = await this._model.loginUser(email, password);

      if (!result.error) {
        // Save session
        this._model.saveUserSession({
          token: result.loginResult.token,
          userId: result.loginResult.userId,
          name: result.loginResult.name,
        });

        // Update sidebar
        updateSidebarUserInfo();
        refreshSidebar();
        
        // Dispatch custom event untuk memperbarui UI
        const event = new CustomEvent('userLoggedIn', {
          detail: {
            userId: result.loginResult.userId,
            name: result.loginResult.name
          }
        });
        document.dispatchEvent(event);

        showNotification("Login berhasil!", "success");
        return { success: true };
      } else {
        showNotification(`Login gagal: ${result.message}`, "error");
        return { success: false, message: result.message };
      }
    } catch (error) {
      showNotification(
        "Terjadi kesalahan saat login. Silakan coba lagi.",
        "error"
      );
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  }
  
  // Tambahkan metode untuk mendapatkan data form
  getLoginFormData() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    return { email, password };
  }
  
  // Tambahkan metode untuk navigasi setelah login berhasil
  navigateAfterSuccessfulLogin() {
    window.location.hash = "#/";
  }
}
const registerLink = document.getElementById("register-link");
    if (registerLink) {
      registerLink.addEventListener("click", (event) => {
        // Gunakan View Transition API jika tersedia
        if (document.startViewTransition && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          
          // Tambahkan class untuk transisi
          document.documentElement.classList.add("page-transition");
          
          document.startViewTransition(() => {
            // Navigasi ke halaman register
            window.location.hash = "#/register";
          });
        }
        // Jika View Transition API tidak tersedia, navigasi default akan terjadi
      });
    }

export default LoginPresenter;



