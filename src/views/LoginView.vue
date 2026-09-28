<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { Mail, Lock, Eye, EyeOff, HeartPulse, LoaderCircle } from "@lucide/vue";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const showPassword = ref(false);
const error = ref(null);
const submitting = ref(false);

async function handleLogin() {
  error.value = null;
  submitting.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push("/admin/dashboard");
  } catch (err) {
    error.value = "Invalid email or password.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="grid min-h-screen lg:grid-cols-2">
    <div
      class="relative hidden flex-col justify-between overflow-hidden bg-blue-600 p-12 text-white lg:flex"
    >
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]"
      ></div>

      <a href="/" class="relative flex items-center gap-2 text-2xl font-bold">
        <HeartPulse class="h-7 w-7" />
        Medilab
      </a>

      <div class="relative max-w-sm">
        <h2 class="text-3xl font-bold leading-snug">
          Manage your practice, all in one place.
        </h2>
        <p class="mt-4 text-blue-100">
          Sign in to update your site content and review incoming appointment
          requests.
        </p>
      </div>

      <p class="relative text-sm text-blue-200">
        © {{ new Date().getFullYear() }} Medilab
      </p>
    </div>

    <div class="flex items-center justify-center bg-slate-50 px-6 py-12">
      <form @submit.prevent="handleLogin" class="w-full max-w-sm">
        <div
          class="mb-8 flex items-center gap-2 text-xl font-bold text-slate-900 lg:hidden"
        >
          <HeartPulse class="h-6 w-6 text-blue-600" />
          Medilab
        </div>

        <h1 class="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p class="mt-1 text-sm text-slate-500">
          Log in to your admin dashboard.
        </p>

        <div class="mt-8 space-y-4">
          <div class="relative">
            <Mail
              class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="email"
              type="email"
              placeholder="Email address"
              autocomplete="email"
              class="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          <div class="relative">
            <Lock
              class="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              autocomplete="current-password"
              class="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <EyeOff v-if="showPassword" class="h-4 w-4" />
              <Eye v-else class="h-4 w-4" />
            </button>
          </div>
        </div>

        <Transition name="fade">
          <p
            v-if="error"
            class="mt-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600"
          >
            {{ error }}
          </p>
        </Transition>

        <button
          type="submit"
          :disabled="submitting"
          class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LoaderCircle v-if="submitting" class="h-4 w-4 animate-spin" />
          {{ submitting ? "Logging in..." : "Log In" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
