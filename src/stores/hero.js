import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/api";

export const useHeroStore = defineStore("hero", () => {
  const hero = ref(null);
  const items = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  const sortedItems = computed(() =>
    [...items.value].sort((a, b) => a.order - b.order),
  );

  async function fetchHero({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/hero");

      hero.value = {
        main_title: response.data.main_title,
        subtitle: response.data.subtitle,
        why_choose_title: response.data.why_choose_title,
        why_choose_text: response.data.why_choose_text,
        background_image: response.data.background_image,
      };

      items.value = response.data.why_choose_items ?? [];

      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load hero content.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function updateHero(formData) {
    await api.post("/hero", formData);
    fetchHero({ force: true });
  }

  async function updateWhyChooseItem(id, payload) {
    await api.put(`/why-choose-items/${id}`, payload);
    fetchHero({ force: true });
  }

  return {
    hero,
    items,
    sortedItems,
    loading,
    error,
    fetchHero,
    updateHero,
    updateWhyChooseItem,
  };
});
