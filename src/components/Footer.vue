<script setup>
import { ref } from "vue";
import { Phone, Mail, ChevronRight, HeartPulse } from "@lucide/vue";

const quickLinks = ref([
  { label: "Home", href: "/" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Departments", href: "#departments" },
  { label: "Doctors", href: "#doctors" },
  { label: "Contact", href: "#contact" },
]);

const contact = ref({
  phone: "+1 (555) 234-5678",
  phoneHref: "+15552345678",
  email: "info@medilab.com",
});
</script>

<template>
  <footer class="bg-slate-900 text-slate-300">
    <div class="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
      <div class="grid gap-12 lg:grid-cols-3">
        <div>
          <a
            href="/"
            class="relative flex items-center gap-2 text-2xl font-bold text-white"
          >
            <HeartPulse class="h-7 w-7" />
            Medilab
          </a>
          <p class="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            A team of talented designers making quality healthcare accessible,
            combining modern medicine with genuine care.
          </p>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-white">Quick Links</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="link in quickLinks" :key="link.label">
              <a
                :href="link.href"
                class="group flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-blue-500"
              >
                <ChevronRight
                  class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                />
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold text-white">Contact Us</h3>
          <ul class="mt-5 space-y-4">
            <li class="flex items-start gap-3">
              <Phone class="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <a
                :href="`tel:${contact.phoneHref}`"
                class="text-sm text-slate-400 hover:text-blue-500"
              >
                {{ contact.phone }}
              </a>
            </li>
            <li class="flex items-start gap-3">
              <Mail class="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
              <a
                :href="`mailto:${contact.email}`"
                class="text-sm text-slate-400 hover:text-blue-500"
              >
                {{ contact.email }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-14 border-t border-slate-800 pt-8 text-center text-sm text-slate-500"
      >
        © {{ new Date().getFullYear() }} Medilab. All rights reserved.
      </div>
    </div>
  </footer>
</template>
