<script setup>
import { ref, watch } from "vue";
import {
  Building2,
  Building,
  LoaderCircle,
  Trash2,
  Pencil,
  Plus,
} from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useConfirmStore } from "@/stores/confirm";
import { useRouter } from "vue-router";
import { useDepartmentsStore } from "@/stores/departments";
import { storeToRefs } from "pinia";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-dt";

DataTable.use(DataTablesCore);
const router = useRouter();

const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const departmentsStore = useDepartmentsStore();
const { section, items, loading } = storeToRefs(departmentsStore);

const saving = ref(false);
const dataTableKey = ref(0);

const form = ref({ title: "", subtitle: "" });
const formErrors = ref({});
const formError = ref("");

watch(
  section,
  (val) => {
    form.value = { title: val.title, subtitle: val.subtitle };
  },
  { immediate: true },
);

const columns = [
  { data: "name", title: "Name" },
  { data: "subtitle", title: "Subtitle" },
  { data: "description", title: "Description" },
  {
    data: null,
    title: "Image",
    orderable: false,
    searchable: false,
    defaultContent: "",
  },
  {
    data: null,
    title: "Actions",
    orderable: false,
    searchable: false,
    className: "text-right",
    defaultContent: "",
  },
];

const dataTableOptions = {
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[3, "desc"]],
  autoWidth: false,
  language: {
    search: "",
    searchPlaceholder: "Search departments...",
    lengthMenu: "Show _MENU_",
    info: "Showing _START_ to _END_ of _TOTAL_ departments",
    infoEmpty: "No departments found",
    zeroRecords: "No matching departments found",
    emptyTable: "No departments yet",
  },
};

function clearFormErrors() {
  formErrors.value = {};
  formError.value = "";
}
function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

async function handleSubmit() {
  saving.value = true;
  clearFormErrors();

  try {
    await departmentsStore.updateSection(form.value);
    toastStore.show("Department section updated successfully");
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

async function handleDelete(id) {
  const confirmed = await confirmStore.open({
    title: "Delete this department?",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
  });

  if (!confirmed) return;

  try {
    await departmentsStore.deleteDepartment(id);
    dataTableKey.value++;
    toastStore.show("Department deleted", "success");
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

departmentsStore.fetchDepartments();
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
          Loading department settings...
        </span>
      </div>
    </div>

    <div v-else class="mx-auto w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
        >
          <Building class="h-5 w-5" />
        </div>

        <h1
          class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Department Section
        </h1>

        <p class="mx-auto mt-2 text-sm leading-6 text-slate-500">
          Customize the department section of your website and manage their
          images, title, and more.
        </p>
      </div>

      <!-- Department Section Settings -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto">
            <!-- Section Heading -->
            <div class="mb-7">
              <h2 class="text-xl font-bold text-slate-900">
                Customize your Department section
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Update the title and subtitle visitors see in the Department
                section.
              </p>
            </div>

            <!-- Fields -->
            <div class="grid gap-5">
              <!-- Title -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600">
                  Title
                </label>

                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Enter the Department title"
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

              <!-- Subtitle -->
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600">
                  Subtitle
                </label>

                <textarea
                  v-model="form.subtitle"
                  rows="5"
                  placeholder="Enter the Department subtitle"
                  class="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  required
                />

                <p
                  v-if="getFieldError('subtitle')"
                  class="text-xs font-medium text-red-600"
                >
                  {{ getFieldError("subtitle") }}
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

            <div class="my-8 h-px bg-slate-100" />

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

      <!-- Departments -->
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
                <Building2 class="h-5 w-5" />
              </div>

              <div>
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">
                  Departments
                </h2>

                <p class="mt-0.5 text-sm text-slate-500">
                  View and manage all departments.
                </p>
              </div>
            </div>
          </div>

          <!-- Create Button -->
          <div>
            <button
              type="button"
              @click="router.push({ name: 'create-departments' })"
              class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/25 focus:outline-none focus:ring-4 focus:ring-blue-500/20 active:scale-[0.98] sm:w-auto"
            >
              <Plus class="h-4 w-4" />
              Create Department
            </button>
          </div>
        </div>

        <!-- Table -->
        <div
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="overflow-x-auto p-5">
            <DataTable
              :key="dataTableKey"
              :data="items"
              :columns="columns"
              :options="dataTableOptions"
              class="display w-full"
            >
              <!-- Image -->
              <template #column-3="{ rowData }">
                <div class="flex items-center">
                  <img
                    v-if="rowData.image"
                    :src="rowData.image"
                    :alt="rowData.name"
                    class="h-16 w-24 rounded-lg object-cover shadow-sm"
                  />
                </div>
              </template>

              <!-- Actions -->
              <template #column-4="{ rowData }">
                <div class="flex justify-end gap-1">
                  <!-- Edit -->
                  <button
                    type="button"
                    @click="
                      router.push({
                        name: 'edit-departments',
                        params: { id: rowData.id },
                      })
                    "
                    class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                    title="Edit"
                  >
                    <Pencil class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    @click="handleDelete(rowData.id)"
                    class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
                    title="Delete"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
