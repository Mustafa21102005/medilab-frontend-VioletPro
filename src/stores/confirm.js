import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfirmStore = defineStore("confirm", () => {
  const isOpen = ref(false);
  const title = ref("");
  const message = ref("");
  const confirmLabel = ref("Delete");
  let resolvePromise = null;

  function open({
    title: t = "Are you sure?",
    message: m = "",
    confirmLabel: c = "Delete",
  } = {}) {
    title.value = t;
    message.value = m;
    confirmLabel.value = c;
    isOpen.value = true;

    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  }

  function confirm() {
    isOpen.value = false;
    resolvePromise?.(true);
  }

  function cancel() {
    isOpen.value = false;
    resolvePromise?.(false);
  }

  return { isOpen, title, message, confirmLabel, open, confirm, cancel };
});
