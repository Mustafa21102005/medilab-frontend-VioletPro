<script setup>
import { ref } from "vue";
import {
  Plus,
  Pencil,
  Trash2,
  LoaderCircle,
  BriefcaseMedical,
} from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useConfirmStore } from "@/stores/confirm";
import { useDoctorsStore } from "@/stores/doctors";
import { storeToRefs } from "pinia";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-dt";
import DoctorFormModal from "@/components/DoctorFormModal.vue";

DataTable.use(DataTablesCore);

const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const doctorsStore = useDoctorsStore();

const { doctors, loading } = storeToRefs(doctorsStore);

const dataTableKey = ref(0);
const doctorModal = ref(null);

const columns = [
  { data: "name", title: "Name" },
  { data: "department.name", title: "Department" },
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
    searchPlaceholder: "Search doctors...",
    lengthMenu: "Show _MENU_",
    info: "Showing _START_ to _END_ of _TOTAL_ doctors",
    infoEmpty: "No doctors found",
    zeroRecords: "No matching doctors found",
    emptyTable: "No doctors yet",
  },
};

function openCreateForm() {
  doctorModal.value?.openCreate();
}

function openEditForm(doctor) {
  doctorModal.value?.openEdit(doctor);
}

async function handleDelete(id) {
  const confirmed = await confirmStore.open({
    title: "Delete this doctor?",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
  });

  if (!confirmed) return;

  try {
    await doctorsStore.deleteDoctor(id);
    dataTableKey.value++;
    toastStore.show("Doctor deleted", "success");
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

doctorsStore.fetchDoctors();
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
            <BriefcaseMedical class="h-5 w-5" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900">Doctors</h1>
        </div>
        <p class="mt-1 text-sm text-slate-500">Manage all doctors here.</p>
      </div>

      <button
        @click="openCreateForm"
        class="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.97]"
      >
        <Plus
          class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
        />
        <span>Add Doctor</span>
      </button>
    </div>

    <Transition
      mode="out-in"
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="loading"
        key="loading"
        class="mt-8 flex items-center justify-center rounded-xl border border-slate-200 bg-white py-20"
      >
        <div class="flex items-center gap-3 text-sm text-slate-400">
          <LoaderCircle class="h-5 w-5 animate-spin text-blue-600" />
          <span>Loading doctors...</span>
        </div>
      </div>

      <div
        v-else
        key="content"
        class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
      >
        <div class="overflow-x-auto p-5">
          <DataTable
            :key="dataTableKey"
            :data="doctors"
            :columns="columns"
            :options="dataTableOptions"
            class="display w-full"
          >
            <template #column-1="{ rowData }">
              <span class="text-sm text-slate-600">{{
                rowData.department?.name ?? "—"
              }}</span>
            </template>

            <template #column-2="{ rowData }">
              <div class="flex justify-end gap-1">
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
    </Transition>

    <DoctorFormModal ref="doctorModal" />
  </div>
</template>
