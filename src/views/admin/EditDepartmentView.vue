<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Building2, ArrowLeft, ImagePlus, X, LoaderCircle } from "@lucide/vue";
import api from "@/lib/api";
import { useToastStore } from "@/stores/toast";
import { useDepartmentsStore } from "@/stores/departments";

const departmentsStore = useDepartmentsStore();
const route = useRoute();
const router = useRouter();
const toastStore = useToastStore();

const loading = ref(true);
const saving = ref(false);

const form = ref({
  name: "",
  subtitle: "",
  description: "",
  image: null,
});

const currentImage = ref("");
const imagePreview = ref("");

const formErrors = ref({});
const formError = ref("");

const fileInput = ref(null);

function goBack() {
  router.push({ name: "departments" });
}

function clearErrors() {
  formErrors.value = {};
  formError.value = "";
}

function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

function handleImageChange(event) {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  form.value.image = file;

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }

  imagePreview.value = URL.createObjectURL(file);
}

function removeNewImage() {
  form.value.image = null;

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
    imagePreview.value = "";
  }

  if (fileInput.value) {
    fileInput.value.value = "";
  }
}

async function loadDepartment() {
  loading.value = true;
  clearErrors();

  try {
    const response = await api.get(`/departments/${route.params.id}`);

    const department = response.data.department ?? response.data;

    form.value.name = department.name ?? "";
    form.value.subtitle = department.subtitle ?? "";
    form.value.description = department.description ?? "";

    currentImage.value = department.image ?? "";
  } catch (error) {
    formError.value =
      error.response?.data?.message ?? "Couldn't load the department.";

    toastStore.show(formError.value, "error");
  } finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  saving.value = true;
  clearErrors();

  try {
    const formData = new FormData();
    formData.append("name", form.value.name);
    formData.append("subtitle", form.value.subtitle);
    formData.append("description", form.value.description);

    if (form.value.image) {
      formData.append("image", form.value.image);
    }

    await departmentsStore.updateDepartment(route.params.id, formData);

    toastStore.show("Department updated successfully", "success");
    router.push({ name: "departments" });
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

onMounted(loadDepartment);
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
          Loading department...
        </span>
      </div>
    </div>

    <div v-else class="mx-auto w-full max-w-4xl">
      <!-- Back -->
      <button
        type="button"
        @click="goBack"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-blue-600"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Departments
      </button>

      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4">
          <div
            class="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20"
          >
            <Building2 class="h-5 w-5" />
          </div>

          <div>
            <h1 class="text-3xl font-bold tracking-tight text-slate-900">
              Edit Department
            </h1>

            <p class="mt-1 text-sm text-slate-500">
              Update the department information and image.
            </p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="grid gap-6">
            <!-- Name -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"> Name </label>

              <input
                v-model="form.name"
                type="text"
                placeholder="Enter the department name"
                class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              <p
                v-if="getFieldError('name')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("name") }}
              </p>
            </div>

            <!-- Subtitle -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Subtitle
              </label>

              <textarea
                v-model="form.subtitle"
                rows="4"
                placeholder="Enter the department subtitle"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              <p
                v-if="getFieldError('subtitle')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("subtitle") }}
              </p>
            </div>

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Description
              </label>

              <textarea
                v-model="form.description"
                rows="8"
                placeholder="Enter the department description"
                class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              <p
                v-if="getFieldError('description')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("description") }}
              </p>
            </div>

            <!-- Image -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <label class="text-xs font-semibold text-slate-600">
                  Department Image
                </label>

                <span class="text-xs text-slate-400">
                  PNG, JPG, JPEG, WEBP · Max 5MB
                </span>
              </div>

              <!-- Image Preview -->
              <div
                class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm"
              >
                <!-- New image preview -->
                <template v-if="imagePreview">
                  <img
                    :src="imagePreview"
                    alt="New department image"
                    class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-80"
                  />

                  <!-- Gradient overlay -->
                  <div
                    class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/20 to-transparent p-4"
                  >
                    <div class="flex items-end justify-between gap-4">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-white">
                          {{ form.image?.name }}
                        </p>

                        <p class="mt-0.5 text-xs text-white/70">New image</p>
                      </div>

                      <button
                        type="button"
                        @click="removeNewImage"
                        class="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/90 text-slate-700 shadow-lg transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                        title="Remove new image"
                      >
                        <X class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </template>

                <!-- Current image -->
                <template v-else-if="currentImage">
                  <img
                    :src="currentImage"
                    alt="Current department image"
                    class="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] sm:h-80"
                  />

                  <!-- Overlay -->
                  <div
                    class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/60 via-black/20 to-transparent p-4"
                  >
                    <div class="flex items-end justify-between gap-4">
                      <div>
                        <p class="text-sm font-semibold text-white">
                          Current image
                        </p>

                        <p class="mt-0.5 text-xs text-white/70">
                          Upload a new image to replace it
                        </p>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Empty state -->
                <div
                  v-else
                  class="flex h-64 flex-col items-center justify-center px-6 text-center sm:h-80"
                >
                  <div
                    class="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                  >
                    <ImagePlus class="h-6 w-6" />
                  </div>

                  <p class="text-sm font-semibold text-slate-700">
                    No image selected
                  </p>

                  <p class="mt-1 max-w-xs text-xs leading-5 text-slate-400">
                    Upload an image to represent this department.
                  </p>
                </div>
              </div>

              <!-- Upload button -->
              <label
                class="group flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-4 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div
                    class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100"
                  >
                    <ImagePlus class="h-5 w-5" />
                  </div>

                  <div class="min-w-0">
                    <p class="text-sm font-semibold text-slate-700">
                      {{
                        imagePreview
                          ? "Choose a different image"
                          : "Choose an image"
                      }}
                    </p>

                    <p class="mt-0.5 text-xs text-slate-400">
                      Select an image from your device
                    </p>
                  </div>
                </div>

                <span
                  class="shrink-0 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700"
                >
                  Browse
                </span>

                <input
                  ref="fileInput"
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  class="hidden"
                  @change="handleImageChange"
                />
              </label>

              <p
                v-if="getFieldError('image')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("image") }}
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

          <!-- Actions -->
          <div
            class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"
          >
            <button
              type="button"
              @click="goBack"
              class="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LoaderCircle v-if="saving" class="mr-2 h-4 w-4 animate-spin" />

              {{ saving ? "Updating..." : "Update Department" }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
