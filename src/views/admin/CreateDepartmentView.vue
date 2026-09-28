<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import api from "@/lib/api";
import { ArrowLeft, Building2, ImagePlus, LoaderCircle, X } from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useDepartmentsStore } from "@/stores/departments";

const departmentsStore = useDepartmentsStore();
const router = useRouter();
const toastStore = useToastStore();
const saving = ref(false);

const form = ref({
  name: "",
  subtitle: "",
  description: "",
  image: null,
});

const formErrors = ref({});
const formError = ref("");
const imagePreview = ref("");

function clearFormErrors() {
  formErrors.value = {};
  formError.value = "";
}

function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

function handleImageChange(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  form.value.image = file;

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }

  imagePreview.value = URL.createObjectURL(file);
}

function removeImage() {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value);
  }

  imagePreview.value = "";
  form.value.image = null;

  const input = document.getElementById("image");

  if (input) {
    input.value = "";
  }
}

async function handleSubmit() {
  saving.value = true;
  clearFormErrors();

  try {
    const formData = new FormData();
    formData.append("name", form.value.name);
    formData.append("subtitle", form.value.subtitle);
    formData.append("description", form.value.description);

    if (form.value.image) {
      formData.append("image", form.value.image);
    }

    await departmentsStore.createDepartment(formData);

    toastStore.show("Department created successfully", "success");
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
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-4xl">
      <!-- Header -->
      <div class="mb-8">
        <button
          type="button"
          @click="router.back()"
          class="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-white hover:text-slate-900"
        >
          <ArrowLeft class="h-4 w-4" />
          Back
        </button>

        <div class="text-center">
          <div
            class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
          >
            <Building2 class="h-5 w-5" />
          </div>

          <h1
            class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Create Department
          </h1>

          <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Add a new department to your website with its title, description,
            and image.
          </p>
        </div>
      </div>

      <!-- Form -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto max-w-3xl">
            <!-- Section Heading -->
            <div class="mb-7">
              <h2 class="text-xl font-bold text-slate-900">
                Department Details
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Provide the information that visitors will see in the Department
                section.
              </p>
            </div>

            <!-- Fields -->
            <div class="grid gap-6">
              <!-- Name -->
              <div class="space-y-1.5">
                <label for="name" class="text-xs font-semibold text-slate-600">
                  Name
                </label>

                <input
                  id="name"
                  v-model="form.name"
                  type="text"
                  placeholder="Enter the department name"
                  class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
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
                <label
                  for="subtitle"
                  class="text-xs font-semibold text-slate-600"
                >
                  Subtitle
                </label>

                <input
                  id="subtitle"
                  v-model="form.subtitle"
                  type="text"
                  placeholder="Enter a short department subtitle"
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

              <!-- Description -->
              <div class="space-y-1.5">
                <label
                  for="description"
                  class="text-xs font-semibold text-slate-600"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  v-model="form.description"
                  rows="7"
                  placeholder="Enter the department description"
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

                <p
                  v-if="getFieldError('description')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("description") }}
                </p>
              </div>

              <!-- Image -->
              <div class="space-y-2">
                <label for="image" class="text-xs font-semibold text-slate-600">
                  Department Image
                </label>

                <div
                  v-if="!imagePreview"
                  class="relative flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50"
                >
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    class="absolute inset-0 cursor-pointer opacity-0"
                    @change="handleImageChange"
                  />

                  <div
                    class="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"
                  >
                    <ImagePlus class="h-5 w-5" />
                  </div>

                  <p class="text-sm font-semibold text-slate-700">
                    Upload department image
                  </p>

                  <p class="mt-1 text-xs text-slate-400">
                    PNG, JPG, JPEG or WEBP
                  </p>
                </div>

                <!-- Preview -->
                <div
                  v-else
                  class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                >
                  <img
                    :src="imagePreview"
                    alt="Department preview"
                    class="h-64 w-full object-cover"
                  />

                  <button
                    type="button"
                    @click="removeImage"
                    class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl bg-white/90 text-slate-600 shadow-sm backdrop-blur transition-all hover:bg-red-50 hover:text-red-600 active:scale-90"
                    title="Remove image"
                  >
                    <X class="h-4 w-4" />
                  </button>
                </div>

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

            <!-- Divider -->
            <div class="my-8 h-px bg-slate-100" />

            <!-- Actions -->
            <div
              class="flex flex-col-reverse items-center justify-end gap-3 sm:flex-row"
            >
              <button
                type="button"
                @click="router.back()"
                class="w-full rounded-2xl border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-200/60 sm:w-auto"
              >
                Cancel
              </button>

              <button
                type="submit"
                :disabled="saving"
                class="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                <LoaderCircle v-if="saving" class="mr-2 h-4 w-4 animate-spin" />

                {{ saving ? "Creating..." : "Create Department" }}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
