<script setup>
import { useConfirmStore } from "@/stores/confirm";
import { AlertTriangle } from "@lucide/vue";

const confirmStore = useConfirmStore();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="confirmStore.isOpen"
        class="fixed inset-0 z-200 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm"
        @click.self="confirmStore.cancel"
      >
        <div
          class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl shadow-slate-900/20"
        >
          <div
            class="grid h-12 w-12 place-items-center rounded-full bg-red-50 text-red-600"
          >
            <AlertTriangle class="h-6 w-6" />
          </div>

          <h2 class="mt-4 text-lg font-bold text-slate-900">
            {{ confirmStore.title }}
          </h2>
          <p v-if="confirmStore.message" class="mt-1 text-sm text-slate-500">
            {{ confirmStore.message }}
          </p>

          <div class="mt-6 flex gap-3">
            <button
              @click="confirmStore.cancel"
              class="flex-1 rounded-full border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              @click="confirmStore.confirm"
              class="flex-1 rounded-full bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              {{ confirmStore.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
