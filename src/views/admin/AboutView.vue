<script setup>
import { ref, computed, watch } from "vue";
import { useToastStore } from "@/stores/toast";
import {
  CircleUserRound,
  LoaderCircle,
  Pencil,
  X,
  FlaskConical,
  Info,
  ExternalLink,
  Link,
  ImagePlus,
} from "@lucide/vue";
import Select2IconPicker from "@/components/Select2IconPicker.vue";
import { iconMap } from "@/lib/icons";
import { useAboutStore } from "@/stores/about";
import { storeToRefs } from "pinia";

const toastStore = useToastStore();
const aboutStore = useAboutStore();
const { about, sortedFeatures, loading } = storeToRefs(aboutStore);

const saving = ref(false);
const formErrors = ref({});
const formError = ref("");

const form = ref({
  title: "",
  description: "",
  media_url: "",
});

watch(
  about,
  (val) => {
    if (!val) return;
    form.value = {
      title: val.title,
      description: val.description,
      media_url: val.media_url,
    };
  },
  { immediate: true },
);

const selectedImage = ref(null);
let previewObjectUrl = null;

const imagePreviewUrl = computed(() => {
  if (selectedImage.value) return previewObjectUrl;
  return about.value?.image ?? "";
});

function handleImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

  selectedImage.value = file;
  previewObjectUrl = URL.createObjectURL(file);
}

function removeSelectedImage(event) {
  event.target.value = "";

  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

  selectedImage.value = null;
  previewObjectUrl = null;
}

function clearFormErrors() {
  formErrors.value = {};
  formError.value = "";
}

function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

function clearItemFormErrors() {
  itemFormErrors.value = {};
  itemFormError.value = "";
}

function getItemFieldError(field) {
  return itemFormErrors.value[field]?.[0] ?? "";
}

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

async function handleSubmit() {
  saving.value = true;
  clearFormErrors();

  try {
    const formData = new FormData();
    formData.append("title", form.value.title);
    formData.append("description", form.value.description);
    formData.append("media_url", form.value.media_url);

    if (selectedImage.value) {
      formData.append("image", selectedImage.value);
    }

    await aboutStore.updateAbout(formData);

    toastStore.show("About section updated successfully");

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    selectedImage.value = null;
    previewObjectUrl = null;
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response?.data?.errors ?? {};
    } else {
      formError.value =
        error.response?.data?.message ??
        "Something went wrong. Please try again.";
    }
  } finally {
    saving.value = false;
  }
}

const showForm = ref(false);
const itemSaving = ref(false);

const itemForm = ref({
  id: null,
  icon: "",
  title: "",
  description: "",
  order: 1,
});

const itemFormErrors = ref({});
const itemFormError = ref("");

function openEditForm(item) {
  clearItemFormErrors();

  itemForm.value = {
    id: item.id,
    icon: item.icon ?? "",
    title: item.title ?? "",
    description: item.description ?? "",
    order: item.order ?? 1,
  };

  showForm.value = true;
}

function closeForm() {
  if (itemSaving.value) return;
  showForm.value = false;
}

async function handleItemSubmit() {
  itemSaving.value = true;
  clearItemFormErrors();

  try {
    await aboutStore.updateFeature(itemForm.value.id, {
      icon: itemForm.value.icon,
      title: itemForm.value.title,
      description: itemForm.value.description,
      order: itemForm.value.order,
    });

    toastStore.show("Feature updated successfully");
    showForm.value = false;
  } catch (error) {
    if (error.response?.status === 422) {
      itemFormErrors.value = error.response?.data?.errors ?? {};
    } else {
      itemFormError.value =
        error.response?.data?.message ??
        "Something went wrong. Please try again.";
    }
  } finally {
    itemSaving.value = false;
  }
}

function getIconComponent(icon) {
  return iconMap[icon] || FlaskConical;
}

aboutStore.fetchAbout();
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Loading -->
    <div v-if="loading" class="flex min-h-[70vh] items-center justify-center">
      <div
        class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
      >
        <LoaderCircle class="h-5 w-5 animate-spin text-blue-600" />
        <span class="text-sm font-medium text-slate-500"
          >Loading about settings...</span
        >
      </div>
    </div>

    <div v-else class="mx-auto w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
        >
          <Info class="h-5 w-5" />
        </div>
        <h1
          class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          About Section
        </h1>
        <p class="mx-auto mt-2 text-sm leading-6 text-slate-500">
          Customize the About section of your website, including its content,
          external link, and feature highlights.
        </p>
      </div>

      <!-- About Card -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <!-- Media / Link Preview -->
        <div class="relative overflow-hidden bg-slate-900">
          <!-- YouTube Preview -->
          <div
            v-if="isYouTubeUrl(form.media_url)"
            class="relative aspect-video w-full"
          >
            <iframe
              :src="getYouTubeEmbedUrl(form.media_url)"
              title="About YouTube video preview"
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
            />
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/30 via-transparent to-transparent"
            />
            <div
              class="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"
            >
              YouTube Preview
            </div>
          </div>

          <!-- Non-YouTube link: show uploaded image if present, else generic card -->
          <div
            v-else-if="form.media_url && imagePreviewUrl"
            class="relative min-h-70 w-full"
          >
            <img
              :src="imagePreviewUrl"
              alt="About image preview"
              class="h-70 w-full object-cover"
            />
            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/60 via-slate-950/10 to-transparent"
            />
            <div
              class="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"
            >
              <ExternalLink class="h-4 w-4" />
              {{ getUrlHostname(form.media_url) }}
            </div>
          </div>

          <div
            v-else-if="form.media_url"
            class="flex min-h-70 items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-blue-950 px-6"
          >
            <div class="text-center text-white">
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur"
              >
                <Link class="h-7 w-7" />
              </div>
              <p class="font-semibold">External Link</p>
              <p class="mt-1 text-sm text-white/60">
                {{ getUrlHostname(form.media_url) }}
              </p>
              <a
                :href="form.media_url"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <ExternalLink class="h-4 w-4" />
                Open Link
              </a>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else
            class="flex min-h-70 items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-blue-950"
          >
            <div class="text-center text-white">
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur"
              >
                <Link class="h-7 w-7" />
              </div>
              <p class="font-semibold">No Link Available</p>
              <p class="mt-1 text-sm text-white/60">
                Add a YouTube video or external link below.
              </p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto">
            <div class="mb-7">
              <h2 class="mt-1 text-xl font-bold text-slate-900">
                Customize your About section
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Update the content visitors see in the About section.
              </p>
            </div>

            <!-- Content Link -->
            <div class="mb-7 space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"
                >Content Link</label
              >
              <input
                v-model="form.media_url"
                type="url"
                placeholder="https://example.com/..."
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p class="text-xs text-slate-400">
                Add a YouTube, Instagram, Facebook, TikTok, website, or other
                public URL.
              </p>
              <p
                v-if="getFieldError('media_url')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("media_url") }}
              </p>
            </div>

            <!-- Image upload: only meaningful for non-YouTube links, but always available -->
            <div class="mb-7 space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"
                >Preview Image</label
              >
              <p class="text-xs text-slate-400">
                Shown instead of the generic link card when the Content Link
                isn't a YouTube video.
              </p>

              <label
                class="group mt-2 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50"
              >
                <div class="flex min-w-0 items-center gap-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition group-hover:ring-blue-200"
                  >
                    <ImagePlus class="h-5 w-5 text-blue-600" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-700">
                      {{
                        selectedImage
                          ? selectedImage.name
                          : "Choose a preview image"
                      }}
                    </p>
                    <p class="mt-0.5 text-xs text-slate-400">
                      PNG, JPG, JPEG or WEBP
                    </p>
                  </div>
                </div>

                <span
                  class="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition group-hover:text-blue-600"
                >
                  Browse
                </span>

                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  @change="handleImageChange"
                  class="hidden"
                />
              </label>

              <button
                v-if="selectedImage"
                type="button"
                @click="removeSelectedImage"
                class="text-xs font-medium text-slate-500 hover:text-red-600"
              >
                Remove selected image
              </button>

              <p
                v-if="getFieldError('image')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("image") }}
              </p>
            </div>

            <!-- Fields -->
            <div class="grid gap-5">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600"
                  >Title</label
                >
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Enter the About title"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                <p
                  v-if="getFieldError('title')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("title") }}
                </p>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600"
                  >Description</label
                >
                <textarea
                  v-model="form.description"
                  rows="5"
                  placeholder="Enter the About description"
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />
                <p
                  v-if="getFieldError('description')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("description") }}
                </p>
              </div>
            </div>

            <div
              v-if="formError"
              class="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <span class="mt-0.5">⚠️</span>
              <span>{{ formError }}</span>
            </div>

            <div class="my-8 h-px bg-slate-100" />

            <div
              class="flex flex-col-reverse items-center justify-center gap-3 sm:flex-row"
            >
              <button
                type="submit"
                :disabled="saving"
                class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LoaderCircle v-if="saving" class="mr-2 h-4 w-4 animate-spin" />
                {{ saving ? "Saving..." : "Save Changes" }}
              </button>
            </div>
          </div>
        </div>
      </form>

      <!-- Features (unchanged from your original, just swapped to sortedFeatures) -->
      <section class="mt-12">
        <div
          class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div class="flex items-center gap-3">
              <div
                class="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
              >
                <CircleUserRound class="h-5 w-5" />
              </div>
              <div>
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">
                  About Features
                </h2>
                <p class="mt-0.5 text-sm text-slate-500">
                  Manage the feature highlights displayed beside your About
                  content.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="overflow-x-auto">
            <table class="w-full min-w-190 text-left text-sm">
              <thead
                class="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                <tr>
                  <th class="px-5 py-4">Order</th>
                  <th class="px-5 py-4">Icon</th>
                  <th class="px-5 py-4">Title</th>
                  <th class="px-5 py-4">Description</th>
                  <th class="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="item in sortedFeatures"
                  :key="item.id"
                  class="group transition-all duration-200 hover:bg-slate-50"
                >
                  <td class="px-5 py-4 text-slate-500">
                    <span
                      class="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-600 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600"
                    >
                      {{ item.order }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-100 group-hover:shadow-sm"
                    >
                      <component
                        :is="getIconComponent(item.icon)"
                        class="h-5 w-5"
                      />
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span
                      class="font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-600"
                      >{{ item.title }}</span
                    >
                  </td>
                  <td class="max-w-md px-5 py-4 text-slate-600">
                    <span class="line-clamp-2">{{ item.description }}</span>
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div
                      class="flex justify-end gap-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      <button
                        type="button"
                        @click="openEditForm(item)"
                        class="group/edit grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                        title="Edit"
                      >
                        <Pencil
                          class="h-4 w-4 transition-transform duration-200 group-hover/edit:-rotate-3 group-hover/edit:scale-110"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-if="sortedFeatures.length === 0"
            class="flex flex-col items-center justify-center px-6 py-16 text-center"
          >
            <div
              class="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"
            >
              <FlaskConical class="h-6 w-6" />
            </div>
            <h3 class="mt-4 font-semibold text-slate-900">
              No features available
            </h3>
            <p class="mt-1 text-sm text-slate-500">
              There are currently no About features to edit.
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Feature Edit Modal (unchanged) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showForm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm sm:px-6"
        @click.self="closeForm"
      >
        <div
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
          >
            <div>
              <h2 class="text-lg font-bold text-slate-900">
                Edit About Feature
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">Update this feature.</p>
            </div>
            <button
              type="button"
              @click="closeForm"
              :disabled="itemSaving"
              class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-90 disabled:opacity-50"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <form @submit.prevent="handleItemSubmit" class="space-y-4 p-6">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">Icon</label>
              <Select2IconPicker v-model="itemForm.icon" />
              <p
                v-if="getItemFieldError('icon')"
                class="text-xs font-medium text-red-600"
              >
                {{ getItemFieldError("icon") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">Title</label>
              <input
                v-model="itemForm.title"
                type="text"
                placeholder="Title"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getItemFieldError('title')"
                class="text-xs font-medium text-red-600"
              >
                {{ getItemFieldError("title") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"
                >Description</label
              >
              <textarea
                v-model="itemForm.description"
                rows="4"
                placeholder="Describe this feature..."
                class="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getItemFieldError('description')"
                class="text-xs font-medium text-red-600"
              >
                {{ getItemFieldError("description") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"
                >Display Order</label
              >
              <input
                v-model.number="itemForm.order"
                type="number"
                min="1"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getItemFieldError('order')"
                class="text-xs font-medium text-red-600"
              >
                {{ getItemFieldError("order") }}
              </p>
            </div>

            <div
              v-if="itemFormError"
              class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {{ itemFormError }}
            </div>

            <button
              type="submit"
              :disabled="itemSaving"
              class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <LoaderCircle v-if="itemSaving" class="h-4 w-4 animate-spin" />
              <Pencil
                v-else
                class="h-4 w-4 transition-transform duration-200 group-hover:-rotate-6"
              />
              <span>{{ itemSaving ? "Saving..." : "Update Feature" }}</span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
