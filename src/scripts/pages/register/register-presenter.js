import { showNotification } from "../../utils/index.js";

class RegisterPresenter {
  constructor(view, model) {
    this._view = view;
    this._model = model;
  }

  async register(name, email, password) {
    try {
      const result = await this._model.registerUser(name, email, password);

      if (result && !result.error) {
        showNotification("Registrasi berhasil! Silakan login.", "success");
        return { success: true };
      } else {
        throw new Error(result?.message || "Registrasi gagal.");
      }
    } catch (error) {
      showNotification(`Error: ${error.message}`, "error");
      return { success: false, message: error.message };
    }
  }
  
  // Tambahkan metode untuk mendapatkan data form
  getRegisterFormData() {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    return { name, email, password };
  }
  
  // Tambahkan metode untuk validasi data form
  validateFormData(formData) {
    const { name, email, password } = formData;
    
    if (!name || name.trim() === '') {
      return { isValid: false, message: 'Nama tidak boleh kosong' };
    }
    
    if (!email || !email.includes('@')) {
      return { isValid: false, message: 'Email tidak valid' };
    }
    
    if (!password || password.length < 8) {
      return { isValid: false, message: 'Password minimal 8 karakter' };
    }
    
    return { isValid: true };
  }
  
  // Tambahkan metode untuk navigasi setelah registrasi berhasil
  navigateAfterSuccessfulRegister() {
    window.location.hash = "#/login";
  }
}

export default RegisterPresenter;

