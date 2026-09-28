import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "@/lib/api";

export const useStatsStore = defineStore("stats", () => {
  const stats = ref([]);
  const loading = ref(false);
  const error = ref(null);
  let hasFetched = false;

  const sortedStats = computed(() =>
    [...stats.value].sort((a, b) => a.order - b.order),
  );

  async function fetchStats({ force = false } = {}) {
    if (hasFetched && !force) return;

    loading.value = true;
    error.value = null;

    try {
      const response = await api.get("/stats");
      stats.value = response.data;
      hasFetched = true;
    } catch (err) {
      error.value = "Couldn't load stats.";
      console.error(err);
    } finally {
      loading.value = false;
    }
  }

  async function createStat(payload) {
    await api.post("/stats", payload);
    fetchStats({ force: true });
  }

  async function updateStat(id, payload) {
    await api.put(`/stats/${id}`, payload);
    fetchStats({ force: true });
  }

  async function deleteStat(id) {
    await api.delete(`/stats/${id}`);
    fetchStats({ force: true });
  }

  return {
    stats,
    sortedStats,
    loading,
    error,
    fetchStats,
    createStat,
    updateStat,
    deleteStat,
  };
});
