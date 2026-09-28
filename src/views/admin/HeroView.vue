<script setup>
import { ref, computed, watch } from "vue";
import { useToastStore } from "@/stores/toast";
import { iconMap } from "@/lib/icons";
import { House, LoaderCircle, Pencil, X, ShieldCheck } from "@lucide/vue";
import Select2IconPicker from "@/components/Select2IconPicker.vue";
import { useHeroStore } from "@/stores/hero";
import { storeToRefs } from "pinia";

const toastStore = useToastStore();
const heroStore = useHeroStore();
const { hero, sortedItems, loading } = storeToRefs(heroStore);

const saving = ref(false);
const formErrors = ref({});
const formError = ref("");

const form = ref({
  main_title: "",
  subtitle: "",
  why_choose_title: "",
  why_choose_text: "",
});

watch(
  hero,
  (val) => {
    if (!val) return;
    form.value = {
      main_title: val.main_title,
      subtitle: val.subtitle,
      why_choose_title: val.why_choose_title,
      why_choose_text: val.why_choose_text,
    };
  },
  { immediate: true },
);

const selectedFile = ref(null);
let previewObjectUrl = null;

const previewUrl = computed(() => {
  if (selectedFile.value) return previewObjectUrl;
  return hero.value?.background_image;
});

function clearFormErrors() {
  formErrors.value = {};
  formError.value = "";
}

function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

function handleFileChange(event) {
  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);

  selectedFile.value = event.target.files[0];
  previewObjectUrl = selectedFile.value
    ? URL.createObjectURL(selectedFile.value)
    : null;
}

async function handleSubmit() {
  saving.value = true;
  clearFormErrors();

  try {
    const formData = new FormData();

    formData.append("_method", "PUT");
    formData.append("main_title", form.value.main_title);
    formData.append("subtitle", form.value.subtitle);
    formData.append("why_choose_title", form.value.why_choose_title);
    formData.append("why_choose_text", form.value.why_choose_text);

    if (selectedFile.value) {
      formData.append("background_image", selectedFile.value);
    }

    await heroStore.updateHero(formData);

    toastStore.show("Hero updated successfully");

    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    selectedFile.value = null;
    previewObjectUrl = null;
  } catch (error) {
    if (error.response?.status === 422) {
      formErrors.value = error.response.data.errors ?? {};
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
const editingId = ref(null);
const itemSaving = ref(false);

const itemForm = ref({
  icon: "",
  title: "",
  description: "",
  order: 1,
});

const itemFormErrors = ref({});
const itemFormError = ref("");

function clearItemFormErrors() {
  itemFormErrors.value = {};
  itemFormError.value = "";
}

function getItemFieldError(field) {
  return itemFormErrors.value[field]?.[0] ?? "";
}

function openEditForm(item) {
  editingId.value = item.id;
  clearItemFormErrors();

  itemForm.value = {
    icon: item.icon,
    title: item.title,
    description: item.description,
    order: item.order,
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
    await heroStore.updateWhyChooseItem(editingId.value, itemForm.value);
    toastStore.show("Item updated successfully");
    showForm.value = false;
  } catch (error) {
    if (error.response?.status === 422) {
      itemFormErrors.value = error.response.data.errors ?? {};
    } else {
      itemFormError.value =
        error.response?.data?.message ??
        "Something went wrong. Please try again.";
    }
  } finally {
    itemSaving.value = false;
  }
}

heroStore.fetchHero();
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <!-- Loading -->
    <div v-if="loading" class="flex min-h-[70vh] items-center justify-center">
      <div
        class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm"
      >
        <LoaderCircle class="h-5 w-5 animate-spin text-blue-600" />

        <span class="text-sm font-medium text-slate-500">
          Loading hero settings...
        </span>
      </div>
    </div>

    <div v-else class="mx-auto w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
        >
          <House class="h-5 w-5" />
        </div>

        <h1
          class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Hero Section
        </h1>

        <p class="mx-auto mt-2 text-sm leading-6 text-slate-500">
          Customize the main hero section of your website, including its
          background image, titles, and supporting content.
        </p>
      </div>

      <!-- Hero Card -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <!-- Image Preview -->
        <div class="relative overflow-hidden bg-slate-900">
          <div v-if="previewUrl" class="relative w-full">
            <img
              :src="previewUrl"
              alt="Hero background"
              class="block h-auto max-h-130 min-h-65 w-full object-cover"
            />

            <div
              class="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/60 via-slate-950/10 to-transparent"
            />

            <div
              class="absolute bottom-5 left-5 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md"
            >
              Hero Preview
            </div>
          </div>

          <!-- Empty image state -->
          <div
            v-else
            class="flex min-h-70 items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-blue-950"
          >
            <div class="text-center text-white">
              <div
                class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl backdrop-blur"
              >
                🖼️
              </div>

              <p class="font-semibold">No background image</p>

              <p class="mt-1 text-sm text-white/60">
                Upload an image below to create your hero.
              </p>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto">
            <!-- Section heading -->
            <div class="mb-7">
              <p
                class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600"
              >
                Content settings
              </p>

              <h2 class="mt-1 text-xl font-bold text-slate-900">
                Customize your hero
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Update the content visitors see when they land on your website.
              </p>
            </div>

            <!-- Image Upload -->
            <div class="mb-7">
              <label
                class="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                Background Image
              </label>

              <label
                class="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50"
              >
                <div class="flex min-w-0 items-center gap-4">
                  <div
                    class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm ring-1 ring-slate-200 transition group-hover:ring-blue-200"
                  >
                    📷
                  </div>

                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-slate-700">
                      {{
                        selectedFile
                          ? selectedFile.name
                          : "Choose a new background image"
                      }}
                    </p>

                    <p class="mt-0.5 text-xs text-slate-400">
                      PNG, JPG, WEBP or other image formats
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
                  accept="image/*"
                  @change="handleFileChange"
                  class="hidden"
                />
              </label>
            </div>

            <!-- Fields -->
            <div class="grid gap-5 sm:grid-cols-2">
              <!-- Main Title -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600">
                  Main Title
                </label>

                <input
                  v-model="form.main_title"
                  placeholder="Enter the main title"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

                <p
                  v-if="getFieldError('main_title')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("main_title") }}
                </p>
              </div>

              <!-- Subtitle -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600">
                  Subtitle
                </label>

                <input
                  v-model="form.subtitle"
                  placeholder="Enter the subtitle"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

                <p
                  v-if="getFieldError('subtitle')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("subtitle") }}
                </p>
              </div>

              <!-- Why Choose Title -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600">
                  Why Choose Title
                </label>

                <input
                  v-model="form.why_choose_title"
                  placeholder="Enter the section title"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

                <p
                  v-if="getFieldError('why_choose_title')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("why_choose_title") }}
                </p>
              </div>

              <!-- Why Choose Text -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600">
                  Why Choose Text
                </label>

                <input
                  v-model="form.why_choose_text"
                  placeholder="Enter supporting text"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

                <p
                  v-if="getFieldError('why_choose_text')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("why_choose_text") }}
                </p>
              </div>
            </div>

            <!-- Error -->
            <div
              v-if="formError"
              class="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              <span class="mt-0.5">⚠️</span>
              <span>{{ formError }}</span>
            </div>

            <div class="my-8 h-px bg-slate-100"></div>

            <!-- Actions -->
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

      <section class="mt-12">
        <!-- Header -->
        <div
          class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div class="flex items-center gap-3">
              <div
                class="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
              >
                <ShieldCheck class="h-5 w-5" />
              </div>

              <div>
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">
                  Why Choose Us
                </h2>

                <p class="mt-0.5 text-sm text-slate-500">
                  Manage the benefits and features displayed on your website.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Table -->
        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="translate-y-2 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <!-- Content -->
          <div
            key="items-content"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
          >
            <div class="overflow-x-auto">
              <table class="w-full min-w-190 text-left text-sm">
                <!-- Header -->
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

                <!-- Body -->
                <tbody class="divide-y divide-slate-100">
                  <TransitionGroup
                    enter-active-class="transition-all duration-400 ease-out"
                    enter-from-class="translate-x-4 opacity-0"
                    enter-to-class="translate-x-0 opacity-100"
                    leave-active-class="transition-all duration-300 ease-in"
                    leave-from-class="opacity-100 scale-100"
                    leave-to-class="opacity-0 scale-95"
                  >
                    <tr
                      v-for="(item, index) in sortedItems"
                      :key="item.id"
                      class="group transition-all duration-200 hover:bg-slate-50"
                      :style="{
                        transitionDelay: `${index * 30}ms`,
                      }"
                    >
                      <!-- Order -->
                      <td class="px-5 py-4 text-slate-500">
                        <span
                          class="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-600 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600"
                        >
                          {{ item.order }}
                        </span>
                      </td>

                      <!-- Icon -->
                      <td class="px-5 py-4">
                        <span
                          class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-100 group-hover:shadow-sm"
                        >
                          <component
                            :is="iconMap[item.icon] || ShieldCheck"
                            class="h-5 w-5"
                          />
                        </span>
                      </td>

                      <!-- Title -->
                      <td class="px-5 py-4">
                        <span
                          class="font-semibold text-slate-900 transition-colors duration-200 group-hover:text-blue-600"
                        >
                          {{ item.title }}
                        </span>
                      </td>

                      <!-- Description -->
                      <td class="max-w-md px-5 py-4 text-slate-600">
                        <span class="line-clamp-2">
                          {{ item.description }}
                        </span>
                      </td>

                      <!-- Actions -->
                      <td class="px-5 py-4 text-right">
                        <div
                          class="flex justify-end gap-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                        >
                          <!-- Edit -->
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
                  </TransitionGroup>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </section>
    </div>

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
        <!-- Modal -->
        <div
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
          >
            <div>
              <h2 class="text-lg font-bold text-slate-900">Edit Item</h2>

              <p class="mt-0.5 text-xs text-slate-500">
                Update this benefit item.
              </p>
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

          <!-- Form -->
          <form @submit.prevent="handleItemSubmit" class="space-y-4 p-6">
            <!-- Icon -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"> Icon </label>

              <Select2IconPicker v-model="itemForm.icon" />

              <p
                v-if="getItemFieldError('icon')"
                class="text-xs font-medium text-red-600"
              >
                {{ getItemFieldError("icon") }}
              </p>
            </div>

            <!-- Title -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Title
              </label>

              <input
                v-model="itemForm.title"
                type="text"
                placeholder="Title (e.g. Fast & Reliable)"
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

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Description
              </label>

              <textarea
                v-model="itemForm.description"
                rows="4"
                placeholder="Describe why users should choose your service..."
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

            <!-- Order -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Display Order
              </label>

              <input
                v-model.number="itemForm.order"
                type="number"
                min="1"
                placeholder="Order"
                :class="[
                  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
                  getItemFieldError('order')
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200',
                ]"
                required
              />

              <p
                v-if="getItemFieldError('order')"
                class="text-xs font-medium text-red-600"
              >
                {{ getItemFieldError("order") }}
              </p>
            </div>

            <!-- General error -->
            <div
              v-if="itemFormError"
              class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {{ itemFormError }}
            </div>

            <!-- Submit -->
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

              <span>
                {{ itemSaving ? "Saving..." : "Update Item" }}
              </span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
