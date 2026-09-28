import { defineStore } from "pinia";
import { ref } from "vue";

let nextId = 0;

export const useToastStore = defineStore("toast", () => {
  const toasts = ref([]);

  function show(message, type = "success", duration = 3000) {
    const id = nextId++;
    toasts.value.push({ id, message, type });

    setTimeout(() => remove(id), duration);
  }

  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }

  return { toasts, show, remove };
});
