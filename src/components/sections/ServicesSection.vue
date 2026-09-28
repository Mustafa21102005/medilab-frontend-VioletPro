<script setup>
import { ref, computed } from "vue";
import { iconMap } from "@/lib/icons";
import { useServicesStore } from "@/stores/services";
import { storeToRefs } from "pinia";

const servicesStore = useServicesStore();

const { section, sortedItems, loading, error } = storeToRefs(servicesStore);

const showAll = ref(false);

const visibleItems = computed(() => {
  if (showAll.value) {
    return sortedItems.value;
  }

  return sortedItems.value.slice(0, 6);
});

servicesStore.fetchServices();
</script>

<template>
  <section id="services" class="py-20 lg:py-28">
    <div v-if="loading" class="py-32 text-center text-slate-400">
      Loading...
    </div>

    <div v-else-if="error" class="py-32 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else>
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
            {{ section.title }}
          </h2>

          <div class="mx-auto mt-3 h-1 w-16 rounded-full bg-blue-600"></div>

          <p class="mt-4 text-slate-600">
            {{ section.subtitle }}
          </p>
        </div>

        <div class="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in visibleItems"
            :key="item.id"
            class="group border border-slate-100 p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-blue-600 hover:shadow-lg"
          >
            <div class="relative grid h-14 w-14 place-items-center">
              <div
                class="absolute inset-0 -translate-x-1 -translate-y-1 rounded bg-blue-200 transition-transform duration-300 group-hover:bg-blue-200"
              ></div>

              <div
                class="relative grid h-14 w-14 place-items-center rounded bg-blue-600 text-white group-hover:bg-blue-100"
              >
                <component
                  :is="iconMap[item.icon]"
                  class="h-6 w-6 group-hover:text-blue-600"
                />
              </div>
            </div>

            <h3
              class="mt-5 text-lg font-semibold text-slate-900 group-hover:text-slate-100"
            >
              {{ item.title }}
            </h3>

            <p
              class="mt-2 text-sm leading-relaxed text-slate-500 group-hover:text-slate-100"
            >
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Show more -->
        <div
          v-if="sortedItems.length > 6 && !showAll"
          class="mt-10 flex justify-center"
        >
          <button
            type="button"
            @click="showAll = true"
            class="grid h-12 w-34 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-blue-600 hover:text-blue-600 hover:shadow-md"
            aria-label="Show more services"
          >
            <span class="font-bold leading-none">Show More</span>
          </button>
        </div>
      </div>
    </template>
  </section>
</template>
