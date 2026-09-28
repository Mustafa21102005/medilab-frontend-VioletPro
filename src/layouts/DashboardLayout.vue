<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import {
  LayoutDashboard,
  Home,
  Info,
  BarChart3,
  Stethoscope,
  Building2,
  CalendarDays,
  LogOut,
  HeartPulse,
  LoaderCircle,
  Menu,
  X,
  BriefcaseMedical,
  PanelLeftClose,
  PanelLeftOpen,
} from "@lucide/vue";
import { ref, onMounted } from "vue";
import ToastContainer from "@/components/ToastContainer.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const auth = useAuthStore();
const router = useRouter();

const navItems = [
  { label: "Dashboard", to: { name: "dashboard" }, icon: LayoutDashboard },
  { label: "Hero", to: { name: "hero" }, icon: Home },
  { label: "About", to: { name: "about" }, icon: Info },
  { label: "Stats", to: { name: "stats" }, icon: BarChart3 },
  { label: "Services", to: { name: "services" }, icon: Stethoscope },
  { label: "Departments", to: { name: "departments" }, icon: Building2 },
  { label: "Doctors", to: { name: "doctors" }, icon: BriefcaseMedical },
  { label: "Appointments", to: { name: "appointments" }, icon: CalendarDays },
];

const loggingOut = ref(false);
const mobileMenuOpen = ref(false);

const sidebarCollapsed = ref(
  localStorage.getItem("sidebarCollapsed") === "true",
);

function closeMobileMenu() {
  mobileMenuOpen.value = false;
}

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;

  localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed.value));
};

async function handleLogout() {
  loggingOut.value = true;

  try {
    await auth.logout();
    await router.push({ name: "login" });
  } finally {
    loggingOut.value = false;
    closeMobileMenu();
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Mobile Header -->
    <header
      class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm lg:hidden"
    >
      <RouterLink
        :to="{ name: 'home' }"
        class="flex cursor-pointer items-center gap-2 text-lg font-bold text-slate-900 transition-colors duration-200 hover:text-blue-600"
      >
        <HeartPulse class="h-6 w-6 text-blue-600" />
        Medilab
      </RouterLink>

      <button
        type="button"
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="grid h-10 w-10 place-items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-blue-600"
        :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
      >
        <X v-if="mobileMenuOpen" class="h-5 w-5" />
        <Menu v-else class="h-5 w-5" />
      </button>
    </header>

    <!-- Mobile Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm lg:hidden"
      />
    </Transition>

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white',
        'transition-all duration-300 ease-out',

        // Mobile
        'w-72',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',

        // Desktop
        'lg:translate-x-0 lg:z-30',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
      ]"
    >
      <!-- Sidebar Header -->
      <div
        :class="[
          'flex h-20 items-center border-b border-slate-100',
          sidebarCollapsed ? 'justify-center px-3' : 'justify-between px-6',
        ]"
      >
        <RouterLink
          :to="{ name: 'home' }"
          class="flex items-center gap-2 text-lg font-bold text-slate-900 transition-colors duration-200 hover:text-blue-600"
        >
          <HeartPulse class="h-6 w-6 shrink-0 text-blue-600" />

          <span
            class="whitespace-nowrap transition-all duration-200 lg:block"
            :class="sidebarCollapsed ? 'lg:hidden' : ''"
          >
            Medilab
          </span>
        </RouterLink>

        <!-- Desktop Collapse Button -->
        <button
          type="button"
          @click="toggleSidebar"
          class="absolute -right-4 top-1/2 z-50 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition-all duration-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:shadow-lg lg:grid"
          :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
          :title="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <PanelLeftOpen v-if="sidebarCollapsed" class="h-4 w-4" />

          <PanelLeftClose v-else class="h-4 w-4" />
        </button>

        <!-- Mobile Close Button -->
        <button
          type="button"
          @click="closeMobileMenu"
          class="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Close menu"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="(item, index) in navItems"
          :key="item.label"
          :to="item.to"
          active-class="bg-blue-50 text-blue-600"
          @click="closeMobileMenu"
          :class="[
            'group relative flex items-center rounded-lg py-2.5 text-sm font-medium text-slate-600',
            'transition-all duration-200 hover:bg-slate-50 hover:text-blue-600',
            'animate-[fadeSlide_0.4s_ease-out_both]',
            sidebarCollapsed ? 'justify-center px-3' : 'gap-3 px-3',
          ]"
          :style="{ animationDelay: `${index * 50}ms` }"
          :title="sidebarCollapsed ? item.label : undefined"
        >
          <span
            class="absolute left-0 h-6 w-1 scale-y-0 rounded-r-full bg-blue-600 transition-transform duration-200 group-[.router-link-active]:scale-y-100"
          />

          <component
            :is="item.icon"
            class="h-4.5 w-4.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-110"
          />

          <span
            class="whitespace-nowrap transition-all duration-200"
            :class="sidebarCollapsed ? 'lg:hidden' : ''"
          >
            {{ item.label }}
          </span>
        </RouterLink>
      </nav>

      <!-- User Section -->
      <div class="border-t border-slate-200 p-4">
        <div
          :class="[
            'group flex items-center rounded-xl py-2 transition-colors duration-200 hover:bg-slate-50',
            sidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-2',
          ]"
        >
          <!-- Avatar -->
          <div
            class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 transition-all duration-300 group-hover:scale-105 group-hover:ring-4 group-hover:ring-blue-50"
            :title="sidebarCollapsed ? (auth.user?.name ?? 'Admin') : undefined"
          >
            {{ auth.user?.name?.charAt(0) ?? "A" }}
          </div>

          <!-- User Info -->
          <div v-if="!sidebarCollapsed" class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900">
              {{ auth.user?.name ?? "Admin" }}
            </p>

            <p class="truncate text-xs text-slate-500">
              {{ auth.user?.email }}
            </p>
          </div>
        </div>

        <!-- Logout -->
        <button
          @click="handleLogout"
          :disabled="loggingOut"
          :class="[
            'group mt-3 flex w-full items-center rounded-full py-2.5 text-sm font-semibold text-red-600',
            'bg-red-50 transition-all duration-200 hover:bg-red-100 hover:shadow-sm',
            'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
            sidebarCollapsed ? 'justify-center px-0' : 'justify-center gap-2',
          ]"
          :title="sidebarCollapsed ? 'Log Out' : undefined"
        >
          <LoaderCircle v-if="loggingOut" class="h-4 w-4 animate-spin" />

          <LogOut
            v-else
            class="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />

          <span v-if="!sidebarCollapsed" class="whitespace-nowrap">
            {{ loggingOut ? "Logging out..." : "Log Out" }}
          </span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main
      class="min-h-screen transition-[margin] duration-300 ease-out"
      :class="sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'"
    >
      <RouterView v-slot="{ Component, route }">
        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="-translate-y-1 opacity-0"
        >
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </main>

    <ToastContainer />
    <ConfirmDialog />
  </div>
</template>
