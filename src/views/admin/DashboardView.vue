<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import {
  CalendarClock,
  CalendarCheck,
  Eye,
  Stethoscope,
  Building2,
  Plus,
  LoaderCircle,
  Pencil,
  ArrowUpRight,
  CheckCheck,
  Undo2,
  Trash2,
  X,
} from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useConfirmStore } from "@/stores/confirm";
import { useAppointmentsStore } from "@/stores/appointments";
import { useDoctorsStore } from "@/stores/doctors";
import { useDepartmentsStore } from "@/stores/departments";
import { storeToRefs } from "pinia";
import AppointmentFormModal from "@/components/AppointmentFormModal.vue";
import DoctorFormModal from "@/components/DoctorFormModal.vue";

const router = useRouter();
const toastStore = useToastStore();
const confirmStore = useConfirmStore();

const appointmentsStore = useAppointmentsStore();
const doctorsStore = useDoctorsStore();
const departmentsStore = useDepartmentsStore();

const { appointments, loading: appointmentsLoading } =
  storeToRefs(appointmentsStore);
const { doctors } = storeToRefs(doctorsStore);
const { items: departments } = storeToRefs(departmentsStore);

const appointmentModal = ref(null);
const doctorModal = ref(null);

// --- KPIs ---
const totalAppointments = computed(() => appointments.value.length);

const unreadCount = computed(
  () => appointments.value.filter((a) => !a.is_read).length,
);

const totalDoctors = computed(() => doctors.value.length);
const totalDepartments = computed(() => departments.value.length);

// --- Recent 5 ---
const recentAppointments = computed(() =>
  [...appointments.value]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5),
);

// --- Read vs Unread ---
const readPercent = computed(() => {
  if (!totalAppointments.value) return 0;

  return Math.round(
    ((totalAppointments.value - unreadCount.value) / totalAppointments.value) *
      100,
  );
});

const ringCircumference = 2 * Math.PI * 54;

const ringOffset = computed(
  () => ringCircumference - (readPercent.value / 100) * ringCircumference,
);

// --- Appointments per department ---
const departmentBreakdown = computed(() => {
  const counts = {};

  // Start every department at 0 so empty ones still show up
  for (const department of departments.value) {
    counts[department.name] = 0;
  }

  for (const appointment of appointments.value) {
    const name = appointment.department?.name ?? "Unknown";
    counts[name] = (counts[name] ?? 0) + 1;
  }

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const max = entries.length ? entries[0][1] : 0;

  return entries.map(([name, count]) => ({
    name,
    count,
    percent: max ? Math.round((count / max) * 100) : 0,
  }));
});

function formatDateTime(datetime) {
  if (!datetime) return "—";

  return new Date(datetime).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// --- Row actions ---

const viewingAppointment = ref(null);

function viewAppointment(appointment) {
  viewingAppointment.value = appointment;
}

function closeViewModal() {
  viewingAppointment.value = null;
}

function openEditAppointmentForm(appointment) {
  appointmentModal.value?.openEdit(appointment);
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

async function handleDelete(id) {
  const confirmed = await confirmStore.open({
    title: "Delete this appointment?",
    message: "This action cannot be undone.",
    confirmLabel: "Delete",
  });

  if (!confirmed) return;

  try {
    await appointmentsStore.deleteAppointment(id);
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

appointmentsStore.fetchAppointments();
doctorsStore.fetchDoctors();
departmentsStore.fetchDepartments();
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <div class="mx-auto w-full max-w-7xl">
      <!-- Header -->
      <div
        class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1
            class="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Dashboard
          </h1>

          <p class="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            Monitor appointments, doctors, departments, and recent activity from
            one place.
          </p>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <!-- Appointments -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-50 opacity-70 transition-transform duration-300 group-hover:scale-125"
          ></div>

          <div class="relative">
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Total Appointments
              </p>

              <div
                class="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"
              >
                <CalendarCheck class="h-5 w-5" />
              </div>
            </div>

            <p class="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {{ totalAppointments }}
            </p>

            <p class="mt-1 text-xs text-slate-400">All appointments</p>
          </div>
        </div>

        <!-- Needs Review -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-50 opacity-80 transition-transform duration-300 group-hover:scale-125"
          ></div>

          <div class="relative">
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Needs Review
              </p>

              <div
                class="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600"
              >
                <CalendarClock class="h-5 w-5" />
              </div>
            </div>

            <p class="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {{ unreadCount }}
            </p>

            <p class="mt-1 text-xs text-slate-400">Unread appointments</p>
          </div>
        </div>

        <!-- Doctors -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-50 opacity-80 transition-transform duration-300 group-hover:scale-125"
          ></div>

          <div class="relative">
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Doctors
              </p>

              <div
                class="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600"
              >
                <Stethoscope class="h-5 w-5" />
              </div>
            </div>

            <p class="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {{ totalDoctors }}
            </p>

            <p class="mt-1 text-xs text-slate-400">Active doctors</p>
          </div>
        </div>

        <!-- Departments -->
        <div
          class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-50 opacity-80 transition-transform duration-300 group-hover:scale-125"
          ></div>

          <div class="relative">
            <div class="flex items-center justify-between">
              <p
                class="text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Departments
              </p>

              <div
                class="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-600"
              >
                <Building2 class="h-5 w-5" />
              </div>
            </div>

            <p class="mt-5 text-3xl font-bold tracking-tight text-slate-900">
              {{ totalDepartments }}
            </p>

            <p class="mt-1 text-xs text-slate-400">Available departments</p>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div
        class="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p class="text-sm font-semibold text-slate-900">Quick Actions</p>
        <p class="mt-0.5 text-xs text-slate-400">
          Jump straight into common tasks.
        </p>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <button
            type="button"
            @click="appointmentModal?.openCreate()"
            class="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
          >
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600 transition-transform duration-200 group-hover:scale-105"
            >
              <Plus class="h-4.5 w-4.5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900">
                Add Appointment
              </p>
              <p class="text-xs text-slate-400">Create a new appointment</p>
            </div>
          </button>

          <button
            type="button"
            @click="doctorModal?.openCreate()"
            class="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/50 hover:shadow-sm"
          >
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-600 transition-transform duration-200 group-hover:scale-105"
            >
              <Stethoscope class="h-4.5 w-4.5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900">Add Doctor</p>
              <p class="text-xs text-slate-400">Add a new Doctor</p>
            </div>
          </button>

          <button
            type="button"
            @click="router.push({ name: 'create-departments' })"
            class="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-sm"
          >
            <div
              class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-purple-50 text-purple-600 transition-transform duration-200 group-hover:scale-105"
            >
              <Plus class="h-4.5 w-4.5" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-slate-900">Add Department</p>
              <p class="text-xs text-slate-400">Create a new department</p>
            </div>
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="mt-6 grid gap-6 lg:grid-cols-3">
        <!-- Read rate -->
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">Read Rate</h3>

              <p class="mt-1 text-xs leading-5 text-slate-400">
                Share of appointments marked as read.
              </p>
            </div>

            <span
              class="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600"
            >
              {{ readPercent }}%
            </span>
          </div>

          <div class="relative mt-6 flex items-center justify-center">
            <svg
              width="160"
              height="160"
              viewBox="0 0 140 140"
              class="-rotate-90"
            >
              <circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="#f1f5f9"
                stroke-width="12"
              />

              <circle
                cx="70"
                cy="70"
                r="54"
                fill="none"
                stroke="#2563eb"
                stroke-width="12"
                stroke-linecap="round"
                :stroke-dasharray="ringCircumference"
                :stroke-dashoffset="ringOffset"
                class="transition-all duration-700 ease-out"
              />
            </svg>

            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
            >
              <span class="text-3xl font-bold tracking-tight text-slate-900">
                {{ readPercent }}%
              </span>

              <span class="mt-0.5 text-xs text-slate-400"> read </span>
            </div>
          </div>

          <div class="mt-3 flex justify-center gap-6 text-xs">
            <span class="flex items-center gap-2 text-slate-500">
              <span class="h-2 w-2 rounded-full bg-blue-600"></span>
              Read
            </span>

            <span class="flex items-center gap-2 text-slate-500">
              <span class="h-2 w-2 rounded-full bg-slate-200"></span>
              Unread
            </span>
          </div>
        </div>

        <!-- Department breakdown -->
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <div class="flex items-start justify-between">
            <div>
              <h3 class="text-sm font-semibold text-slate-900">
                Appointments by Department
              </h3>

              <p class="mt-1 text-xs leading-5 text-slate-400">
                Appointment volume across departments.
              </p>
            </div>

            <Building2 class="h-5 w-5 text-slate-300" />
          </div>

          <div v-if="departmentBreakdown.length" class="mt-6 space-y-5">
            <div v-for="dept in departmentBreakdown" :key="dept.name">
              <div class="mb-2 flex items-center justify-between">
                <span class="text-sm font-medium text-slate-700">
                  {{ dept.name }}
                </span>

                <span
                  class="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500"
                >
                  {{ dept.count }}
                </span>
              </div>

              <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  class="h-full rounded-full bg-blue-600 transition-all duration-700 ease-out"
                  :style="{ width: dept.percent + '%' }"
                />
              </div>
            </div>
          </div>

          <div v-else class="flex min-h-40 items-center justify-center">
            <p class="text-sm text-slate-400">No appointment data yet.</p>
          </div>
        </div>
      </div>

      <!-- Recent appointments -->
      <div
        class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <h3 class="text-sm font-semibold text-slate-900">
              Recent Appointments
            </h3>

            <p class="mt-1 text-xs text-slate-400">
              Your latest appointment activity.
            </p>
          </div>

          <button
            type="button"
            @click="router.push({ name: 'appointments' })"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            View all
            <ArrowUpRight class="h-3.5 w-3.5" />
          </button>
        </div>

        <!-- Loading -->
        <div
          v-if="appointmentsLoading"
          class="flex items-center justify-center gap-3 py-20 text-sm text-slate-400"
        >
          <LoaderCircle class="h-5 w-5 animate-spin text-blue-600" />
          Loading appointments...
        </div>

        <!-- Empty -->
        <div
          v-else-if="!recentAppointments.length"
          class="flex flex-col items-center justify-center py-20"
        >
          <div
            class="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400"
          >
            <CalendarCheck class="h-5 w-5" />
          </div>

          <p class="mt-4 text-sm font-medium text-slate-600">
            No appointments yet
          </p>

          <p class="mt-1 text-xs text-slate-400">
            Create your first appointment to see it here.
          </p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-180 text-left text-sm">
            <thead
              class="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400"
            >
              <tr>
                <th class="px-6 py-3.5">Name</th>
                <th class="px-6 py-3.5">Department</th>
                <th class="px-6 py-3.5">Date & Time</th>
                <th class="px-6 py-3.5">Status</th>
                <th class="w-16 px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="appointment in recentAppointments"
                :key="appointment.id"
                class="group transition-colors hover:bg-slate-50/80"
              >
                <!-- Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
                    >
                      {{ appointment.name?.charAt(0)?.toUpperCase() ?? "?" }}
                    </div>

                    <span class="font-semibold text-slate-800">
                      {{ appointment.name }}
                    </span>
                  </div>
                </td>

                <!-- Department -->
                <td class="px-6 py-4">
                  <span class="text-slate-600">
                    {{ appointment.department?.name ?? "—" }}
                  </span>
                </td>

                <!-- Date -->
                <td class="whitespace-nowrap px-6 py-4 text-slate-500">
                  {{ formatDateTime(appointment.datetime) }}
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span
                    v-if="appointment.is_read"
                    class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                    Read
                  </span>

                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                    New
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4">
                  <div
                    class="flex justify-end gap-1 opacity-70 transition-opacity duration-200 group-hover:opacity-100"
                  >
                    <!-- Mark as read -->
                    <button
                      v-if="!appointment.is_read"
                      type="button"
                      @click="markAsRead(appointment)"
                      class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-green-50 hover:text-green-600 active:scale-90"
                      title="Mark as read"
                    >
                      <CheckCheck class="h-4 w-4" />
                    </button>

                    <!-- Mark as unread -->
                    <button
                      v-else
                      type="button"
                      @click="markAsUnread(appointment)"
                      class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-amber-50 hover:text-amber-600 active:scale-90"
                      title="Mark as unread"
                    >
                      <Undo2 class="h-4 w-4" />
                    </button>

                    <!-- View -->
                    <button
                      type="button"
                      @click="viewAppointment(appointment)"
                      class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                      title="View appointment"
                    >
                      <Eye class="h-4 w-4" />
                    </button>

                    <!-- Edit -->
                    <button
                      type="button"
                      @click="openEditAppointmentForm(appointment)"
                      class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 active:scale-90"
                      title="Edit appointment"
                    >
                      <Pencil class="h-4 w-4" />
                    </button>

                    <!-- Delete -->
                    <button
                      type="button"
                      @click="handleDelete(appointment.id)"
                      class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
                      title="Delete appointment"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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
    <DoctorFormModal ref="doctorModal" />
  </div>
</template>
