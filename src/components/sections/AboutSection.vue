<script setup>
import { iconMap } from "@/lib/icons";
import { ExternalLink, Link } from "@lucide/vue";
import { useAboutStore } from "@/stores/about";
import { storeToRefs } from "pinia";

const aboutStore = useAboutStore();
const { about, sortedFeatures, loading, error } = storeToRefs(aboutStore);

function isYouTubeUrl(url) {
  if (!url) return false;

  try {
    const parsed = new URL(url);

    return [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
      "www.youtu.be",
    ].includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function getYouTubeEmbedUrl(url) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "youtu.be" || hostname === "www.youtu.be") {
      const videoId = parsed.pathname.slice(1).split("/")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
    }

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.startsWith("/embed/")) return url;
    }

    return "";
  } catch {
    return "";
  }
}

function getUrlHostname(url) {
  if (!url) return "";

  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

aboutStore.fetchAbout();
</script>

<template>
  <section id="about" class="py-20 lg:py-28">
    <div v-if="loading" class="py-32 text-center text-slate-400">
      Loading...
    </div>

    <div v-else-if="error" class="py-32 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else>
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid gap-12 lg:grid-cols-2 lg:items-center">
          <!-- Media / Link -->
          <div
            class="group relative aspect-4/3 overflow-hidden rounded-2xl bg-slate-100 shadow-xl"
          >
            <!-- YouTube: video embed takes priority regardless of image -->
            <iframe
              v-if="isYouTubeUrl(about.media_url)"
              :src="getYouTubeEmbedUrl(about.media_url)"
              title="About Medilab"
              class="h-full w-full"
              frameborder="0"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share;
              "
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
            ></iframe>

            <!-- Non-YouTube link WITH an admin-uploaded image: image is the click-through -->
            <a
              v-else-if="about.media_url && about.image"
              :href="about.media_url"
              target="_blank"
              rel="noopener noreferrer"
              class="block h-full w-full"
            >
              <img
                :src="about.image"
                alt="About preview"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />

              <div
                class="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/60 via-slate-950/10 to-transparent"
              />

              <div
                class="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"
              >
                <ExternalLink class="h-4 w-4" />
                {{ getUrlHostname(about.media_url) }}
              </div>
            </a>

            <!-- Non-YouTube link WITHOUT an image yet: fallback to the old generic card -->
            <div
              v-else-if="about.media_url"
              class="flex h-full w-full flex-col items-center justify-center px-6 text-center"
            >
              <div
                class="grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"
              >
                <Link class="h-8 w-8" />
              </div>

              <h3 class="mt-5 text-xl font-semibold text-slate-900">
                External Content
              </h3>

              <p class="mt-2 text-sm text-slate-500">
                {{ getUrlHostname(about.media_url) }}
              </p>

              <a
                :href="about.media_url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                <ExternalLink class="h-4 w-4" />
                Open Link
              </a>
            </div>

            <!-- No URL at all -->
            <div
              v-else
              class="flex h-full w-full flex-col items-center justify-center px-6 text-center"
            >
              <div
                class="grid h-16 w-16 place-items-center rounded-2xl bg-slate-200 text-slate-500"
              >
                <Link class="h-8 w-8" />
              </div>

              <h3 class="mt-5 text-xl font-semibold text-slate-900">
                No Content Available
              </h3>

              <p class="mt-2 text-sm text-slate-500">
                Content will appear here when available.
              </p>
            </div>
          </div>

          <!-- About Content -->
          <div>
            <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
              {{ about.title }}
            </h2>

            <p class="mt-4 leading-relaxed text-slate-600">
              {{ about.description }}
            </p>

            <div class="mt-10 space-y-7">
              <div
                v-for="feature in sortedFeatures"
                :key="feature.id"
                class="flex gap-4"
              >
                <div
                  class="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-blue-600"
                >
                  <component :is="iconMap[feature.icon]" class="h-5 w-5" />
                </div>

                <div>
                  <h4 class="font-semibold text-slate-900">
                    {{ feature.title }}
                  </h4>

                  <p class="mt-1 text-sm text-slate-500">
                    {{ feature.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
