<script setup>
import { ref, watch } from "vue";
import { useToastStore } from "@/stores/toast";
import {
  ClipboardPlus,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
  FlaskConical,
  Stethoscope,
  Plus,
} from "@lucide/vue";
import Select2IconPicker from "@/components/Select2IconPicker.vue";
import { iconMap } from "@/lib/icons";
import { useConfirmStore } from "@/stores/confirm";
import { useServicesStore } from "@/stores/services";
import { storeToRefs } from "pinia";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-dt";

DataTable.use(DataTablesCore);

const confirmStore = useConfirmStore();
const toastStore = useToastStore();
const servicesStore = useServicesStore();
const { section, sortedItems, loading } = storeToRefs(servicesStore);

const dataTableKey = ref(0);

const columns = [
  { data: "order", title: "Order", className: "text-left" },
  { data: "icon", title: "Icon", orderable: false, searchable: false },
  { data: "title", title: "Title" },
  { data: "description", title: "Description" },
  {
    data: null,
    title: "Actions",
    orderable: false,
    searchable: false,
    className: "text-right",
  },
];

const dataTableOptions = {
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[0, "asc"]],
  autoWidth: false,
  language: {
    search: "",
    searchPlaceholder: "Search services...",
    lengthMenu: "Show _MENU_",
    info: "Showing _START_ to _END_ of _TOTAL_ services",
    infoEmpty: "No services found",
    zeroRecords: "No matching services found",
    emptyTable: "No services yet",
  },
};

const saving = ref(false);
const formErrors = ref({});
const formError = ref("");
const form = ref({ title: "", subtitle: "" });

watch(
  section,
  (val) => {
    form.value = { title: val.title, subtitle: val.subtitle };
  },
  { immediate: true },
);

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

async function handleSubmit() {
  saving.value = true;
  clearFormErrors();

  try {
    await servicesStore.updateSection(form.value);
    toastStore.show("Service section updated successfully");
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

function openCreateForm() {
  clearItemFormErrors();

  const nextOrder = sortedItems.value.length
    ? Math.max(...sortedItems.value.map((item) => item.order)) + 1
    : 1;

  itemForm.value = {
    id: null,
    icon: "",
    title: "",
    description: "",
    order: nextOrder,
  };
  showForm.value = true;
}

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
    const payload = {
      icon: itemForm.value.icon,
      title: itemForm.value.title,
      description: itemForm.value.description,
      order: itemForm.value.order,
    };

    if (itemForm.value.id) {
      await servicesStore.updateItem(itemForm.value.id, payload);
      toastStore.show("Service updated successfully");
    } else {
      await servicesStore.createItem(payload);
      toastStore.show("Service created successfully");
    }

    showForm.value = false;
    dataTableKey.value++;
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

async function handleDelete(id) {
  const confirmed = await confirmStore.open({
    title: "Delete this service?",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
  });

  if (!confirmed) return;

  try {
    await servicesStore.deleteItem(id);
    dataTableKey.value++;
    toastStore.show("Service deleted", "success");
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

function getIconComponent(icon) {
  return iconMap[icon] || FlaskConical;
}

servicesStore.fetchServices();
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
          Loading services settings...
        </span>
      </div>
    </div>

    <div v-else class="mx-auto w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
        >
          <Stethoscope class="h-5 w-5" />
        </div>

        <h1
          class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Services Section
        </h1>

        <p class="mx-auto mt-2 text-sm leading-6 text-slate-500">
          Customize the Services section of your website, including its title,
          subtitle, and all services.
        </p>
      </div>

      <!-- Service Card -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <!-- Form Content -->
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto">
            <!-- Section Heading -->
            <div class="mb-7">
              <h2 class="mt-1 text-xl font-bold text-slate-900">
                Customize your Service section
              </h2>

              <p class="mt-1 text-sm text-slate-500">
                Update the content visitors see in the Service section.
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
                  placeholder="Enter the Service title"
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
                  placeholder="Enter the Service subtitle"
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

      <!-- Services -->
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
                <ClipboardPlus class="h-5 w-5" />
              </div>

              <div>
                <h2 class="text-2xl font-bold tracking-tight text-slate-900">
                  Services
                </h2>

                <p class="mt-0.5 text-sm text-slate-500">
                  Manage the services displayed.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            @click="openCreateForm"
            class="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.97]"
          >
            <Plus
              class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
            />
            <span>Add Service</span>
          </button>
        </div>

        <!-- Table -->
        <div
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="overflow-x-auto p-5">
            <DataTable
              :key="dataTableKey"
              :data="sortedItems"
              :columns="columns"
              :options="dataTableOptions"
              class="display w-full"
            >
              <!-- Icon column -->
              <template #column-1="{ rowData }">
                <span
                  class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all duration-200 hover:scale-110 hover:bg-blue-100 hover:shadow-sm"
                >
                  <component
                    :is="getIconComponent(rowData.icon)"
                    class="h-4.5 w-4.5"
                  />
                </span>
              </template>

              <!-- Actions column -->
              <template #column-4="{ rowData }">
                <div class="flex justify-end gap-1">
                  <!-- Edit -->
                  <button
                    type="button"
                    @click="openEditForm(rowData)"
                    class="group/edit grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                    title="Edit"
                  >
                    <Pencil
                      class="h-4 w-4 transition-transform duration-200 group-hover/edit:scale-110 group-hover/edit:-rotate-3"
                    />
                  </button>

                  <!-- Delete -->
                  <button
                    type="button"
                    @click="handleDelete(rowData.id)"
                    class="group/delete grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
                    title="Delete"
                  >
                    <Trash2
                      class="h-4 w-4 transition-transform duration-200 group-hover/delete:scale-110 group-hover/delete:rotate-6"
                    />
                  </button>
                </div>
              </template>
            </DataTable>
          </div>
        </div>
      </section>
    </div>

    <!-- Services Modal -->
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
              <h2 class="text-lg font-bold text-slate-900">
                {{ itemForm.id ? "Edit Service" : "Add Service" }}
              </h2>

              <p class="mt-0.5 text-xs text-slate-500">
                {{
                  itemForm.id ? "Update this service." : "Create a new service."
                }}
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

            <!-- Description -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Description
              </label>

              <textarea
                v-model="itemForm.description"
                rows="4"
                placeholder="Describe this Service..."
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

            <!-- General Error -->
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
              <Pencil
                v-if="!itemSaving && itemForm.id"
                class="h-4 w-4 transition-transform duration-200 group-hover:-rotate-6"
              />

              <Plus
                v-else-if="!itemSaving"
                class="h-4 w-4 transition-transform duration-200 group-hover:rotate-90"
              />

              <LoaderCircle v-if="itemSaving" class="h-4 w-4 animate-spin" />

              <span>
                <span>
                  {{
                    itemSaving
                      ? itemForm.id
                        ? "Saving..."
                        : "Creating..."
                      : itemForm.id
                        ? "Update Service"
                        : "Create Service"
                  }}
                </span>
              </span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
