<script setup>
import { ref, watch } from "vue";
import {
  CalendarDays,
  ClipboardList,
  LoaderCircle,
  Eye,
  CheckCheck,
  Undo2,
  Trash2,
  X,
  Plus,
  Pencil,
} from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useConfirmStore } from "@/stores/confirm";
import { useAppointmentsStore } from "@/stores/appointments";
import { storeToRefs } from "pinia";
import DataTable from "datatables.net-vue3";
import DataTablesCore from "datatables.net-dt";
import AppointmentFormModal from "@/components/AppointmentFormModal.vue";

DataTable.use(DataTablesCore);

const toastStore = useToastStore();
const confirmStore = useConfirmStore();
const appointmentsStore = useAppointmentsStore();

const { section, appointments, loading } = storeToRefs(appointmentsStore);

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
  { data: "email", title: "Email" },
  { data: "phone", title: "Phone" },
  { data: "datetime", title: "Date & Time" },
  { data: "department.name", title: "Department" },
  { data: "doctor.name", title: "Doctor" },
  { data: "is_read", title: "Status" },
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
  order: [[3, "desc"]],
  autoWidth: false,
  language: {
    search: "",
    searchPlaceholder: "Search appointments...",
    lengthMenu: "Show _MENU_",
    info: "Showing _START_ to _END_ of _TOTAL_ appointments",
    infoEmpty: "No appointments found",
    zeroRecords: "No matching appointments found",
    emptyTable: "No appointments yet",
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
    await appointmentsStore.updateSection(form.value);
    toastStore.show("Appointment section updated successfully");
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

function formatDateTime(datetime) {
  if (!datetime) return "—";
  return new Date(datetime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

async function handleDelete(id) {
  const confirmed = await confirmStore.open({
    title: "Delete this appointment?",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
  });

  if (!confirmed) return;

  try {
    await appointmentsStore.deleteAppointment(id);
    dataTableKey.value++;
    toastStore.show("Appointment deleted", "success");

    if (viewingAppointment.value?.id === id) {
      closeViewModal();
    }
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

async function markAsRead(appointment) {
  if (appointment.is_read) return;

  const confirmed = await confirmStore.open({
    title: "Mark this appointment as read?",
    message: "You can mark it unread again later if you need to.",
    confirmLabel: "Mark as read",
  });

  if (!confirmed) return;

  try {
    await appointmentsStore.markAsRead(appointment.id);
    toastStore.show("Appointment marked as read");
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

async function markAsUnread(appointment) {
  if (!appointment.is_read) return;

  const confirmed = await confirmStore.open({
    title: "Mark this appointment as unread?",
    message: "It will show up as a new appointment again.",
    confirmLabel: "Mark as unread",
  });

  if (!confirmed) return;

  try {
    await appointmentsStore.markAsUnread(appointment.id);
    toastStore.show("Appointment marked as unread");
  } catch (error) {
    toastStore.show(
      error.response?.data?.message ??
        "Something went wrong. Please try again.",
      "error",
    );
  }
}

const viewingAppointment = ref(null);

function viewAppointment(appointment) {
  viewingAppointment.value = appointment;
}

function closeViewModal() {
  viewingAppointment.value = null;
}

const appointmentModal = ref(null);

function openCreateAppointmentForm() {
  appointmentModal.value?.openCreate();
}

function openEditAppointmentForm(appointment) {
  appointmentModal.value?.openEdit(appointment);
}

appointmentsStore.fetchAppointments();
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
          Loading appointment settings...
        </span>
      </div>
    </div>

    <div v-else class="mx-auto w-full">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
        >
          <CalendarDays class="h-5 w-5" />
        </div>
        <h1
          class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          Appointment Section
        </h1>
        <p class="mx-auto mt-2 text-sm leading-6 text-slate-500">
          Customize the Appointment section of your website and manage submitted
          appointments.
        </p>
      </div>

      <!-- Appointment Section Settings -->
      <form
        @submit.prevent="handleSubmit"
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
      >
        <div class="p-6 sm:p-8 lg:p-10">
          <div class="mx-auto">
            <div class="mb-7">
              <h2 class="text-xl font-bold text-slate-900">
                Customize your Appointment section
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Update the title and subtitle visitors see in the Appointment
                section.
              </p>
            </div>

            <div class="grid gap-5">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-slate-600"
                  >Title</label
                >
                <input
                  v-model="form.title"
                  type="text"
                  placeholder="Enter the Appointment title"
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
                  >Subtitle</label
                >
                <textarea
                  v-model="form.subtitle"
                  rows="5"
                  placeholder="Enter the Appointment subtitle"
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

      <!-- Appointments -->
      <section class="mt-12">
        <div
          class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <div
              class="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/20 transition-all duration-300 hover:scale-105 hover:rotate-3 hover:bg-blue-100"
            >
              <ClipboardList class="h-5 w-5" />
            </div>
            <div>
              <h2 class="text-2xl font-bold tracking-tight text-slate-900">
                Appointments
              </h2>
              <p class="mt-0.5 text-sm text-slate-500">
                View and manage submitted appointments.
              </p>
            </div>
          </div>

          <button
            type="button"
            @click="openCreateAppointmentForm"
            class="group flex items-center justify-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.97]"
          >
            <Plus
              class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
            />
            <span>Add Appointment</span>
          </button>
        </div>

        <div
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
        >
          <div class="overflow-x-auto p-5">
            <DataTable
              :key="dataTableKey"
              :data="appointments"
              :columns="columns"
              :options="dataTableOptions"
              class="display w-full"
            >
              <template #column-3="{ rowData }">
                <span class="whitespace-nowrap text-sm text-slate-600">
                  {{ formatDateTime(rowData.datetime) }}
                </span>
              </template>

              <template #column-6="{ rowData }">
                <span
                  v-if="rowData.is_read"
                  class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                >
                  Read
                </span>
                <span
                  v-else
                  class="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600"
                >
                  New
                </span>
              </template>

              <template #column-7="{ rowData }">
                <div class="flex justify-end gap-1">
                  <button
                    v-if="!rowData.is_read"
                    type="button"
                    @click="markAsRead(rowData)"
                    class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-green-50 hover:text-green-600 active:scale-90"
                    title="Mark as read"
                  >
                    <CheckCheck class="h-4 w-4" />
                  </button>

                  <button
                    v-else
                    type="button"
                    @click="markAsUnread(rowData)"
                    class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-amber-50 hover:text-amber-600 active:scale-90"
                    title="Mark as unread"
                  >
                    <Undo2 class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    @click="viewAppointment(rowData)"
                    class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                    title="View appointment"
                  >
                    <Eye class="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    @click="openEditAppointmentForm(rowData)"
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

    <!-- View Appointment Modal -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="viewingAppointment"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm sm:px-6"
        @click.self="closeViewModal"
      >
        <div
          class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
        >
          <div
            class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
          >
            <div>
              <h2 class="text-lg font-bold text-slate-900">
                Appointment Details
              </h2>
              <p class="mt-0.5 text-xs text-slate-500">
                Submitted {{ formatDateTime(viewingAppointment.created_at) }}
              </p>
            </div>
            <button
              type="button"
              @click="closeViewModal"
              class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-90"
            >
              <X class="h-5 w-5" />
            </button>
          </div>

          <div class="space-y-4 p-6">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs font-semibold text-slate-500">Name</p>
                <p class="mt-1 text-sm text-slate-900">
                  {{ viewingAppointment.name }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-500">
                  Requested Date & Time
                </p>
                <p class="mt-1 text-sm text-slate-900">
                  {{ formatDateTime(viewingAppointment.datetime) }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-500">Email</p>
                <p class="mt-1 text-sm text-slate-900">
                  {{ viewingAppointment.email }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-500">Phone</p>
                <p class="mt-1 text-sm text-slate-900">
                  {{ viewingAppointment.phone }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-500">Department</p>
                <p class="mt-1 text-sm text-slate-900">
                  {{ viewingAppointment.department?.name ?? "—" }}
                </p>
              </div>
              <div>
                <p class="text-xs font-semibold text-slate-500">Doctor</p>
                <p class="mt-1 text-sm text-slate-900">
                  {{ viewingAppointment.doctor?.name ?? "—" }}
                </p>
              </div>
            </div>

            <div>
              <p class="text-xs font-semibold text-slate-500">Message</p>
              <p class="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {{ viewingAppointment.message || "No message provided." }}
              </p>
            </div>
          </div>

          <div
            class="flex justify-end gap-2 border-t border-slate-100 px-6 py-4"
          >
            <button
              type="button"
              @click="closeViewModal"
              class="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <AppointmentFormModal ref="appointmentModal" />
  </div>
</template>
