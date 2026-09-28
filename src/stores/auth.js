import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/api";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("auth_token"));
  const user = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    const response = await api.post("/login", { email, password });
    token.value = response.data.token;
    user.value = response.data.user;
    localStorage.setItem("auth_token", token.value);
  }

  async function logout() {
    try {
      await api.post("/logout");
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem("auth_token");
    }
  }

  async function fetchUser() {
    try {
      const response = await api.get("/me");
      user.value = response.data;
    } catch {
      token.value = null;
      user.value = null;
      localStorage.removeItem("auth_token");
    }
  }

  return { token, user, isAuthenticated, login, logout, fetchUser };
});
