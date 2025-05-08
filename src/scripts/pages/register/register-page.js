import RegisterPresenter from "./register-presenter.js";
import RegisterModel from "./register-model.js";

class RegisterPage {
  constructor() {
    this._model = new RegisterModel();
    this._presenter = new RegisterPresenter(this, this._model);
  }

  async render() {
    return `
      <section class="register-section">
        <div class="form-container">
          <h2>Register</h2>
          <form id="register-form">
            <div class="form-group">
              <label for="name" class="form-label">Nama</label>
              <input type="text" id="name" name="name" class="form-input" required />
            </div>
            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input type="email" id="email" name="email" class="form-input" required />
            </div>
            <div class="form-group">
              <label for="password" class="form-label">Password</label>
              <input type="password" id="password" name="password" class="form-input" required minlength="8" />
            </div>
            <button type="submit" class="form-button">Daftar</button>
          </form>
          <p>Sudah punya akun? <a href="#/login" class="form-link">Sign in</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        // Gunakan presenter untuk mendapatkan data form
        const formData = this._presenter.getRegisterFormData();
        
        // Validasi data form menggunakan presenter
        const validation = this._presenter.validateFormData(formData);
        if (!validation.isValid) {
          this.showError(validation.message);
          return;
        }

        // Ubah tombol menjadi loading state
        const submitButton = registerForm.querySelector(
          "button[type='submit']",
        );
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = "Connecting to server...";

        try {
          const result = await this._presenter.register(
            formData.name,
            formData.email,
            formData.password,
          );

          if (result.success) {
            // Gunakan presenter untuk navigasi
            this._presenter.navigateAfterSuccessfulRegister();
          } else {
            // Kembalikan tombol ke state awal jika registrasi gagal
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
            
            // Tampilkan pesan error jika ada
            if (result.message) {
              this.showError(result.message);
            }
          }
        } catch (error) {
          console.error("Register error:", error);
          // Kembalikan tombol ke state awal jika terjadi error
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
          
          // Tampilkan pesan error
          this.showError(error.message || "Terjadi kesalahan saat registrasi");
        }
      });
    }
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
    
    formContainer.insertBefore(errorElement, document.getElementById("register-form"));
  }
}

export default new RegisterPage();

