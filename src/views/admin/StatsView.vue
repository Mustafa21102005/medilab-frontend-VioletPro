<script setup>
import { ref } from "vue";
import { iconMap } from "@/lib/icons";
import { Plus, Pencil, Trash2, X, LoaderCircle, BarChart3 } from "@lucide/vue";
import Select2IconPicker from "@/components/Select2IconPicker.vue";
import { useToastStore } from "@/stores/toast";
import { useConfirmStore } from "@/stores/confirm";
import { useStatsStore } from "@/stores/stats";
import { storeToRefs } from "pinia";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-dt";

DataTable.use(DataTablesCore);

const statsStore = useStatsStore();
const { sortedStats, loading } = storeToRefs(statsStore);

const dataTableKey = ref(0);
const showForm = ref(false);
const editingId = ref(null);

const form = ref({ icon: "", value: 0, label: "", order: 0 });
const saving = ref(false);
const formErrors = ref({});
const formError = ref("");

const toastStore = useToastStore();
const confirmStore = useConfirmStore();

const columns = [
  {
    data: "order",
    title: "Order",
    className: "text-left",
  },
  {
    data: "icon",
    title: "Icon",
    orderable: false,
    searchable: false,
  },
  {
    data: "value",
    title: "Value",
  },
  {
    data: "label",
    title: "Label",
  },
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
    searchPlaceholder: "Search statistics...",
    lengthMenu: "Show _MENU_",
    info: "Showing _START_ to _END_ of _TOTAL_ statistics",
    infoEmpty: "No statistics found",
    zeroRecords: "No matching statistics found",
    emptyTable: "No statistics yet",
  },
};

function openCreateForm() {
  editingId.value = null;
  clearFormErrors();

  const nextOrder = sortedStats.value.length
    ? Math.max(...sortedStats.value.map((s) => s.order)) + 1
    : 1;

  form.value = { icon: "", value: 0, label: "", order: nextOrder };
  showForm.value = true;
}

function openEditForm(stat) {
  editingId.value = stat.id;
  clearFormErrors();

  form.value = {
    icon: stat.icon,
    value: stat.value,
    label: stat.label,
    order: stat.order,
  };
  showForm.value = true;
}

function closeForm() {
  if (saving.value) return;
  showForm.value = false;
}

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
    if (editingId.value) {
      await statsStore.updateStat(editingId.value, form.value);
      toastStore.show("Stat updated successfully");
    } else {
      await statsStore.createStat(form.value);
      toastStore.show("Stat created successfully");
    }

    showForm.value = false;
    dataTableKey.value++;
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

async function handleDelete(id) {
  const confirmed = await confirmStore.open({
    title: "Delete this stat?",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
  });

  if (!confirmed) return;

  try {
    await statsStore.deleteStat(id);
    dataTableKey.value++;
    toastStore.show("Stat deleted", "success");
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

statsStore.fetchStats();
</script>

<template>
  <div class="min-h-screen p-4 sm:p-6 lg:p-8">
    <!-- Header -->
    <div
      class="flex flex-col gap-4 animate-[fadeUp_0.5s_ease-out] sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <div class="flex items-center gap-2">
          <div
            class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
          >
            <BarChart3 class="h-5 w-5" />
          </div>

          <h1 class="text-2xl font-bold text-slate-900">Stats</h1>
        </div>

        <p class="mt-1 text-sm text-slate-500">
          Manage the statistics displayed on your website.
        </p>
      </div>

      <!-- Add button -->
      <button
        @click="openCreateForm"
        class="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.97]"
      >
        <Plus
          class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
        />

        <span>Add Stat</span>
      </button>
    </div>

    <!-- Loading / Content -->
    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <!-- Loading -->
      <div
        v-if="loading"
        key="loading"
        class="mt-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white py-20"
      >
        <div class="flex items-center gap-3 text-sm text-slate-400">
          <LoaderCircle class="h-5 w-5 animate-spin text-blue-600" />

          <span>Loading statistics...</span>
        </div>
      </div>

      <!-- Content -->
      <div
        v-else
        key="content"
        class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
      >
        <div class="overflow-x-auto p-5">
          <DataTable
            :key="dataTableKey"
            :data="sortedStats"
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
                  :is="iconMap[rowData.icon] || BarChart3"
                  class="h-4.5 w-4.5"
                />
              </span>
            </template>

            <!-- Actions column -->
            <template #column-4="{ rowData }">
              <div class="flex justify-end gap-1">
                <!-- Edit -->
                <button
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
    </Transition>

    <!-- Modal -->
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
        <!-- Modal card -->
        <div
          class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
        >
          <!-- Modal header -->
          <div
            class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
          >
            <div>
              <h2 class="text-lg font-bold text-slate-900">
                {{ editingId ? "Edit Stat" : "Add Stat" }}
              </h2>

              <p class="mt-0.5 text-xs text-slate-500">
                {{
                  editingId
                    ? "Update this statistic."
                    : "Create a new statistic."
                }}
              </p>
            </div>

            <button
              @click="closeForm"
              :disabled="saving"
              class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-90 disabled:opacity-50"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
            <!-- Icon -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"> Icon </label>

              <Select2IconPicker v-model="form.icon" />

              <p
                v-if="getFieldError('icon')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("icon") }}
              </p>
            </div>

            <!-- Value -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Value
              </label>

              <input
                v-model.number="form.value"
                type="number"
                min="0"
                placeholder="Value"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />

              <p
                v-if="getFieldError('value')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("value") }}
              </p>
            </div>

            <!-- Label -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Label
              </label>

              <input
                v-model="form.label"
                placeholder="Label (e.g. Doctors)"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />

              <p
                v-if="getFieldError('label')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("label") }}
              </p>
            </div>

            <!-- Order -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">
                Display Order
              </label>

              <input
                v-model.number="form.order"
                type="number"
                min="1"
                placeholder="Order"
                :class="[
                  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
                  getFieldError('order')
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200',
                ]"
              />

              <p
                v-if="getFieldError('order')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("order") }}
              </p>
            </div>

            <!-- General error -->
            <div
              v-if="formError"
              class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {{ formError }}
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="saving"
              class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />

              <Plus
                v-else-if="!editingId"
                class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
              />

              <Pencil
                v-else
                class="h-4 w-4 transition-transform duration-200 group-hover:-rotate-6"
              />

              <span>
                {{
                  saving ? "Saving..." : editingId ? "Update Stat" : "Save Stat"
                }}
              </span>
            </button>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>
