import LoginPresenter from "./login-presenter.js";
import LoginModel from "./login-model.js";

class LoginPage {
  constructor() {
    this._model = new LoginModel();
    this._presenter = new LoginPresenter(this, this._model);
  }

  async render() {
    return `
      <section class="login-section">
        <div class="form-container">
          <h2>Login</h2>
          <form id="login-form">
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" name="email" class="form-input" required />
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" name="password" class="form-input" required />
            </div>
            <button type="submit" class="form-button">Login</button>
          </form>
          <p>Belum punya akun? <a href="#/register" id="register-link" class="form-link">Register</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const loginForm = document.getElementById("login-form");
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      
      // Gunakan presenter untuk mendapatkan data form
      const { email, password } = this._presenter.getLoginFormData();
      
      // Tambahkan loading state pada tombol
      const submitButton = loginForm.querySelector("button[type='submit']");
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Logging in...";
      
      try {
        const result = await this._presenter.login(email, password);
        
        if (result.success) {
          // Gunakan presenter untuk navigasi
          this._presenter.navigateAfterSuccessfulLogin();
        } else {
          // Kembalikan tombol ke state awal jika login gagal
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          
          // Tampilkan pesan error jika ada
          if (result.message) {
            this.showError(result.message);
          }
        }
      } catch (error) {
        // Kembalikan tombol ke state awal jika terjadi error
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        console.error("Login error:", error);
        
        // Tampilkan pesan error
        this.showError(error.message || "Terjadi kesalahan saat login");
      }
    });
   
  }
  
  // Tambahkan metode untuk menampilkan error
  showError(message) {
    const errorElement = document.createElement("div");
    errorElement.classList.add("error-message");
    errorElement.textContent = message;
    
    const formContainer = document.querySelector(".form-container");
    const existingError = formContainer.querySelector(".error-message");
    
    if (existingError) {
      existingError.remove();
    }
    
    formContainer.insertBefore(errorElement, document.getElementById("login-form"));
  }
}

export default new LoginPage();



