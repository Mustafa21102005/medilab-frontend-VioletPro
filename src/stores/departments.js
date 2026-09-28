import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/api";

export const useDepartmentsStore = defineStore("departments", () => {
  const section = ref({ title: "", subtitle: "" });
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  const sortedItems = computed(() => [...items.value]);

  async function fetchDepartments({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/departments");
      section.value = {
        title: response.data.title ?? "",
        subtitle: response.data.subtitle ?? "",
      };
      items.value = response.data.items ?? [];
      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load departments content.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function updateSection(payload) {
    await api.put("/department-section", payload);
    fetchDepartments({ force: true });
  }

  async function createDepartment(formData) {
    await api.post("/departments", formData);
    fetchDepartments({ force: true });
  }

  async function updateDepartment(id, formData) {
    await api.post(`/departments/${id}?_method=PUT`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchDepartments({ force: true });
  }

  async function deleteDepartment(id) {
    await api.delete(`/departments/${id}`);
    fetchDepartments({ force: true });
  }

  return {
    section,
    items,
    sortedItems,
    loading,
    error,
    fetchDepartments,
    updateSection,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
