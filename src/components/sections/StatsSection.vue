<script setup>
import { iconMap } from "@/lib/icons";
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useStatsStore } from "@/stores/stats";
import { storeToRefs } from "pinia";

const statsStore = useStatsStore();
const { sortedStats, loading, error } = storeToRefs(statsStore);

const displayValues = ref([]);
const sectionEl = ref(null);

let hasAnimated = false;
let observer;

function animateCounts() {
  if (hasAnimated || !sortedStats.value.length) return;

  hasAnimated = true;

  sortedStats.value.forEach((stat, index) => {
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      displayValues.value[index] = Math.floor(progress * stat.value);
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
}

watch(sortedStats, (newStats) => {
  displayValues.value = newStats.map(() => 0);
});

onMounted(async () => {
  await statsStore.fetchStats();

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) animateCounts();
    },
    { threshold: 0.3 },
  );

  if (sectionEl.value) observer.observe(sectionEl.value);
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <section id="stats" ref="sectionEl" class="bg-slate-50 py-16">
    <div v-if="loading" class="py-32 text-center text-slate-400">
      Loading...
    </div>

    <div v-else-if="error" class="py-32 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else>
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div
            v-for="(stat, index) in sortedStats"
            :key="stat.id"
            class="relative rounded-xl bg-white px-8 pb-8 pt-12 text-center shadow-sm mb-5"
          >
            <div
              class="absolute left-1/2 top-0 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blue-600 text-white"
            >
              <component :is="iconMap[stat.icon]" class="h-7 w-7" />
            </div>

            <p class="mt-4 text-3xl font-bold text-slate-900">
              {{ displayValues[index] }}
            </p>

            <p class="mt-1 text-xl text-slate-500">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
