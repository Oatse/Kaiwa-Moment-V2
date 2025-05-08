import { setUserSession } from "../../data/session.js";

class LoginModel {
  async loginUser(email, password) {
    try {
      const response = await fetch("https://story-api.dicoding.dev/v1/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      return await response.json();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  saveUserSession(sessionData) {
    setUserSession(sessionData);
  }
}

export default LoginModel;