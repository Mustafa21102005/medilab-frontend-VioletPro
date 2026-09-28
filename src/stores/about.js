import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/api";

export const useAboutStore = defineStore("about", () => {
  const about = ref(null);
  const features = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  const sortedFeatures = computed(() =>
    [...features.value].sort((a, b) => a.order - b.order),
  );

  async function fetchAbout({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/about");
      about.value = {
        title: response.data.title,
        description: response.data.description,
        media_url: response.data.media_url,
        image: response.data.image,
      };
      features.value = response.data.features ?? [];
      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load about content.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function updateAbout(formData) {
    await api.post("/about?_method=PUT", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    fetchAbout({ force: true });
  }

  async function updateFeature(id, payload) {
    await api.put(`/about-features/${id}`, payload);
    fetchAbout({ force: true });
  }

  return {
    about,
    features,
    sortedFeatures,
    loading,
    error,
    fetchAbout,
    updateAbout,
    updateFeature,
  };
});
