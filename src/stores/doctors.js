import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/lib/api";

export const useDoctorsStore = defineStore("doctors", () => {
  const doctors = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  async function fetchDoctors({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/doctors");
      doctors.value = response.data.doctors;
      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load doctors.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function createDoctor(payload) {
    await api.post("/doctors", payload);
    fetchDoctors({ force: true });
  }

  async function updateDoctor(id, payload) {
    await api.put(`/doctors/${id}`, payload);
    fetchDoctors({ force: true });
  }

  async function deleteDoctor(id) {
    await api.delete(`/doctors/${id}`);
    fetchDoctors({ force: true });
  }

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  };
});
