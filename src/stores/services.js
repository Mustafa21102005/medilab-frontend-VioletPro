import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/api";

export const useServicesStore = defineStore("services", () => {
  const section = ref({ title: "", subtitle: "" });
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  const sortedItems = computed(() =>
    [...items.value].sort((a, b) => a.order - b.order),
  );

  async function fetchServices({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/services");
      section.value = {
        title: response.data.title ?? "",
        subtitle: response.data.subtitle ?? "",
      };
      items.value = response.data.items ?? [];
      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load services content.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function updateSection(payload) {
    await api.put("/service-section", payload);
    fetchServices({ force: true });
  }

  async function createItem(payload) {
    await api.post("/services", payload);
    fetchServices({ force: true });
  }

  async function updateItem(id, payload) {
    await api.put(`/services/${id}`, payload);
    fetchServices({ force: true });
  }

  async function deleteItem(id) {
    await api.delete(`/services/${id}`);
    fetchServices({ force: true });
  }

  return {
    section,
    items,
    sortedItems,
    loading,
    error,
    fetchServices,
    updateSection,
    createItem,
    updateItem,
    deleteItem,
  };
});
