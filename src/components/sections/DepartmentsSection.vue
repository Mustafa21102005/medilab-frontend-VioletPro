<script setup>
import { computed } from "vue";
import { useDepartmentsStore } from "@/stores/departments";
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";

const departmentsStore = useDepartmentsStore();
const { section, items, loading, error } = storeToRefs(departmentsStore);

const activeId = ref(null);

watch(
  items,
  (newItems) => {
    if (!activeId.value && newItems.length) {
      activeId.value = newItems[0].id;
    }
  },
  { immediate: true },
);

const activeDept = computed(() =>
  items.value.find((d) => d.id === activeId.value),
);

departmentsStore.fetchDepartments();
</script>

<template>
  <section id="departments" class="py-20 lg:py-28">
    <div v-if="loading" class="py-32 text-center text-slate-400">
      Loading...
    </div>

    <div v-else-if="error" class="py-32 text-center text-red-500">
      {{ error }}
    </div>

    <div v-else-if="!items.length" class="py-32 text-center text-slate-400">
      No departments to show yet.
    </div>

    <template v-else>
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
            {{ section.title }}
          </h2>
          <div class="mx-auto mt-3 h-1 w-16 rounded-full bg-blue-600"></div>
          <p class="mt-4 text-slate-600">{{ section.subtitle }}</p>
        </div>

        <div class="mt-14 grid gap-10 lg:grid-cols-[220px_1fr]">
          <nav>
            <ul class="space-y-1 border-l border-slate-200">
              <li v-for="dept in items" :key="dept.id">
                <button
                  type="button"
                  class="-ml-px block w-full border-l-2 px-5 py-3 text-left text-sm font-medium transition-colors cursor-default"
                  :class="
                    activeId === dept.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-blue-600'
                  "
                  @click="activeId = dept.id"
                >
                  <span class="cursor-pointer">{{ dept.name }}</span>
                </button>
              </li>
            </ul>
          </nav>

          <Transition name="fade" mode="out-in">
            <div
              v-if="activeDept"
              :key="activeDept.id"
              class="grid gap-8 lg:grid-cols-2 lg:items-center"
            >
              <div>
                <h3 class="text-2xl font-bold text-slate-900">
                  {{ activeDept.name }}
                </h3>
                <p class="mt-4 text-slate-500 italic">
                  {{ activeDept.subtitle }}
                </p>
                <p class="mt-4 leading-relaxed text-slate-600">
                  {{ activeDept.description }}
                </p>
              </div>
              <img
                :src="activeDept.image"
                :alt="activeDept.name"
                class="aspect-4/3 w-full rounded-xl object-cover shadow-lg"
              />
            </div>
          </Transition>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
