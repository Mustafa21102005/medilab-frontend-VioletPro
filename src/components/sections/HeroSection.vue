<script setup>
import { iconMap } from "@/lib/icons";
import { ChevronRight } from "@lucide/vue";
import { useHeroStore } from "@/stores/hero";
import { storeToRefs } from "pinia";

const heroStore = useHeroStore();
const { hero, sortedItems, loading, error } = storeToRefs(heroStore);

heroStore.fetchHero();
</script>

<template>
  <section id="hero" class="relative min-h-screen overflow-hidden bg-slate-50">
    <div v-if="loading" class="py-32 text-center text-slate-400">
      Loading...
    </div>

    <div v-else-if="error" class="py-32 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else>
      <div class="absolute inset-0">
        <img
          :src="hero.background_image"
          alt="hero doctor image"
          class="h-full w-full object-cover"
        />
        <div class="absolute inset-0"></div>
      </div>

      <div
        class="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 py-28 lg:px-8"
      >
        <div class="mb-12 max-w-xl">
          <h1
            class="text-4xl font-extrabold leading-tight text-slate-700 sm:text-5xl"
          >
            {{ hero.main_title }}
          </h1>
          <p class="mt-4 text-lg text-slate-600">{{ hero.subtitle }}</p>
        </div>

        <div class="grid gap-6 lg:grid-cols-4 items-center">
          <div
            class="flex min-h-112 flex-col justify-between rounded-xl bg-blue-600 p-8 text-white shadow-xl"
          >
            <div>
              <h3 class="text-2xl font-bold">{{ hero.why_choose_title }}</h3>
              <p class="mt-3 text-sm leading-relaxed text-blue-100">
                {{ hero.why_choose_text }}
              </p>
            </div>
            <a
              href="#about"
              class="mt-6 inline-flex w-fit items-center gap-1 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:-translate-y-0.5"
            >
              Learn More <ChevronRight class="h-4 w-4" />
            </a>
          </div>

          <div
            v-for="item in sortedItems"
            :key="item.id"
            class="flex min-h-90 flex-col justify-center rounded-xl border border-slate-100 bg-white/80 p-6 text-center shadow-lg transition-transform hover:-translate-y-1"
          >
            <div
              class="grid h-10 w-full place-items-center justify-center rounded-lg text-blue-600"
            >
              <component :is="iconMap[item.icon]" class="h-6 w-6" />
            </div>
            <h4 class="mt-4 font-semibold text-slate-900">{{ item.title }}</h4>
            <p class="mt-2 text-sm text-slate-500">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
