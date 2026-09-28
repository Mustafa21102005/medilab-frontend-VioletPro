<script setup>
import { useToastStore } from "@/stores/toast";
import { CheckCircle2, XCircle, X } from "@lucide/vue";

const toastStore = useToastStore();
</script>

<template>
  <Teleport to="body">
    <div class="fixed bottom-6 right-6 z-100 flex flex-col gap-2">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="translate-x-8 opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="translate-x-4 opacity-0"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg"
          :class="
            toast.type === 'success' ? 'border-green-100' : 'border-red-100'
          "
        >
          <CheckCircle2
            v-if="toast.type === 'success'"
            class="h-5 w-5 shrink-0 text-green-600"
          />
          <XCircle v-else class="h-5 w-5 shrink-0 text-red-600" />
          <span class="text-sm font-medium text-slate-700">{{
            toast.message
          }}</span>
          <button
            @click="toastStore.remove(toast.id)"
            class="ml-2 text-slate-400 hover:text-slate-600"
          >
            <X class="h-4 w-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
