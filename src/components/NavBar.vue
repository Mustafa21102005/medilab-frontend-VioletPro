<script setup>
import { ChevronDown, HeartPulse } from "@lucide/vue";
import { ref, onMounted, onUnmounted } from "vue";
import { useScrollSpy } from "@/composables/useScrollSpy";

const { activeSection } = useScrollSpy([
  "hero",
  "about",
  "stats",
  "services",
  "appointment",
  "departments",
]);

const isScrolled = ref(false);
const isMobileOpen = ref(false);
const isDropdownOpen = ref(false);

const navLinks = ref([
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Departments", href: "#departments" },
  { label: "Doctors", href: "#doctors" },
  {
    label: "Dropdown",
    children: [
      { label: "Dropdown 1", href: "#" },
      { label: "Dropdown 2", href: "#" },
    ],
  },
  { label: "Contact", href: "#contact" },
]);

function handleScroll() {
  isScrolled.value = window.scrollY > 20;
}

onMounted(() => window.addEventListener("scroll", handleScroll));

onUnmounted(() => window.removeEventListener("scroll", handleScroll));

function toggleMobileMenu() {
  isMobileOpen.value = !isMobileOpen.value;
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
}

function closeMobileMenu() {
  isMobileOpen.value = false;
}
</script>

<template>
  <header
    id="header"
    class="sticky top-0 z-50 border-b transition-all duration-300"
    :class="
      isScrolled
        ? 'bg-white/95 backdrop-blur-sm border-slate-200 shadow-sm'
        : 'bg-white border-transparent'
    "
  >
    <div
      class="mx-auto flex items-center justify-between px-6 py-4 lg:px-8 gap-6"
    >
      <!-- Logo -->
      <a
        href="/"
        class="relative flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-700"
      >
        <HeartPulse class="h-7 w-7" />
        Medilab
      </a>

      <!-- Desktop nav -->
      <nav class="hidden lg:block">
        <ul class="flex items-center gap-8">
          <li v-for="link in navLinks" :key="link.label" class="relative">
            <template v-if="link.children">
              <button
                type="button"
                class="flex items-center text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
                @click="toggleDropdown"
              >
                {{ link.label }}
                <ChevronDown
                  class="h-4 w-4 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': isDropdownOpen }"
                />
              </button>
              <Transition name="fade">
                <ul
                  v-show="isDropdownOpen"
                  class="absolute top-full left-0 mt-3 min-w-44 rounded-lg border border-slate-100 bg-white py-2 shadow-xl"
                >
                  <li v-for="child in link.children" :key="child.label">
                    <a
                      :href="child.href"
                      class="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600"
                    >
                      {{ child.label }}
                    </a>
                  </li>
                </ul>
              </Transition>
            </template>

            <a
              v-else
              :href="link.href"
              class="relative text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              :class="{ 'text-blue-600': activeSection === link.href.slice(1) }"
              @click="closeMobileMenu"
            >
              {{ link.label }}
              <span
                class="absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-blue-600 transition-all duration-300"
                :class="activeSection === link.href.slice(1) ? 'w-full' : 'w-0'"
              />
            </a>
          </li>
        </ul>
      </nav>

      <!-- CTA -->
      <a
        href="#appointment"
        class="hidden rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md lg:inline-block"
      >
        Make an Appointment
      </a>

      <!-- Mobile toggle -->
      <button
        class="grid h-10 w-10 place-items-center rounded-lg text-2xl text-slate-700 hover:bg-slate-100 lg:hidden"
        @click="toggleMobileMenu"
        aria-label="Toggle menu"
      >
        {{ isMobileOpen ? "✕" : "☰" }}
      </button>
    </div>

    <!-- Mobile menu -->
    <Teleport to="body">
      <Transition name="slide">
        <div
          v-if="isMobileOpen"
          class="fixed inset-x-0 top-18.25 bottom-0 overflow-y-auto bg-white px-6 py-4 lg:hidden"
        >
          <ul class="divide-y divide-slate-100">
            <li v-for="link in navLinks" :key="link.label">
              <div class="flex items-center justify-between py-4">
                <a
                  :href="link.children ? '#' : link.href"
                  class="text-base font-medium"
                  :class="
                    activeSection === link.href?.slice(1)
                      ? 'text-blue-600'
                      : 'text-slate-800'
                  "
                  @click="link.children ? toggleDropdown() : closeMobileMenu()"
                >
                  {{ link.label }}
                </a>
                <button
                  v-if="link.children"
                  class="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 transition-transform duration-200"
                  :class="{ 'rotate-180': isDropdownOpen }"
                  @click="toggleDropdown"
                >
                  <ChevronDown />
                </button>
              </div>
              <ul
                v-if="link.children && isDropdownOpen"
                class="space-y-1 pb-3 pl-4"
              >
                <li v-for="child in link.children" :key="child.label">
                  <a
                    :href="child.href"
                    class="block py-1.5 text-sm text-slate-500"
                    >{{ child.label }}</a
                  >
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </Transition>
    </Teleport>
  </header>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.slide-enter-active,
.slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
