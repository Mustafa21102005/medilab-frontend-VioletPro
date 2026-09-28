import { defineStore } from "pinia";
import { ref } from "vue";
import api from "@/lib/api";

export const useAppointmentsStore = defineStore("appointments", () => {
  const section = ref({ title: "", subtitle: "" });
  const appointments = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  async function fetchAppointments({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/appointment-section");
      section.value = {
        title: response.data.title ?? "",
        subtitle: response.data.subtitle ?? "",
      };
      appointments.value = response.data.appointments ?? [];
      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load appointment content.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function updateSection(payload) {
    await api.put("/appointment-section", payload);
    fetchAppointments({ force: true });
  }

  async function createAppointment(payload) {
    await api.post("/appointments", payload);
    fetchAppointments({ force: true });
  }

  async function updateAppointment(id, payload) {
    await api.put(`/appointments/${id}`, payload);
    fetchAppointments({ force: true });
  }

  async function markAsRead(id) {
    await api.patch(`/appointments/${id}/read`);
    const appointment = appointments.value.find((a) => a.id === id);
    if (appointment) appointment.is_read = true;
  }

  async function markAsUnread(id) {
    await api.patch(`/appointments/${id}/unread`);
    const appointment = appointments.value.find((a) => a.id === id);
    if (appointment) appointment.is_read = false;
  }

  async function deleteAppointment(id) {
    await api.delete(`/appointments/${id}`);
    appointments.value = appointments.value.filter((a) => a.id !== id);
  }

  return {
    section,
    appointments,
    loading,
    error,
    fetchAppointments,
    updateSection,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    markAsRead,
    markAsUnread,
  };
});
