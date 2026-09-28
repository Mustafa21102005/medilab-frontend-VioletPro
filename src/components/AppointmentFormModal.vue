<script setup>
import { ref, computed } from "vue";
import { X, LoaderCircle } from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useAppointmentsStore } from "@/stores/appointments";
import { useDoctorsStore } from "@/stores/doctors";
import { useDepartmentsStore } from "@/stores/departments";
import { storeToRefs } from "pinia";

const emit = defineEmits(["saved"]);

const toastStore = useToastStore();
const appointmentsStore = useAppointmentsStore();
const doctorsStore = useDoctorsStore();
const departmentsStore = useDepartmentsStore();

const { doctors } = storeToRefs(doctorsStore);
const { items: departments } = storeToRefs(departmentsStore);

const show = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = ref({
  name: "",
  email: "",
  phone: "",
  datetime: "",
  department_id: "",
  doctor_id: "",
  message: "",
});

const formErrors = ref({});
const formError = ref("");

function clearFormErrors() {
  formErrors.value = {};
  formError.value = "";
}
function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

const filteredDoctors = computed(() => {
  if (!form.value.department_id) return [];
  return doctors.value.filter(
    (d) => d.department_id === form.value.department_id,
  );
});

function openCreate() {
  editingId.value = null;
  clearFormErrors();

  form.value = {
    name: "",
    email: "",
    phone: "",
    datetime: "",
    department_id: "",
    doctor_id: "",
    message: "",
  };

  show.value = true;
  doctorsStore.fetchDoctors();
  departmentsStore.fetchDepartments();
}

function openEdit(appointment) {
  editingId.value = appointment.id;
  clearFormErrors();

  form.value = {
    name: appointment.name ?? "",
    email: appointment.email ?? "",
    phone: appointment.phone ?? "",
    datetime: appointment.datetime ? appointment.datetime.slice(0, 16) : "",
    department_id: appointment.department_id ?? "",
    doctor_id: appointment.doctor_id ?? "",
    message: appointment.message ?? "",
  };

  show.value = true;
  doctorsStore.fetchDoctors();
  departmentsStore.fetchDepartments();
}

function close() {
  if (saving.value) return;
  show.value = false;
}

async function handleSubmit() {
  saving.value = true;
  clearFormErrors();

  try {
    if (editingId.value) {
      await appointmentsStore.updateAppointment(editingId.value, form.value);
      toastStore.show("Appointment updated successfully");
    } else {
      await appointmentsStore.createAppointment(form.value);
      toastStore.show("Appointment created successfully");
    }

    show.value = false;
    emit("saved");
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

defineExpose({ openCreate, openEdit });
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm sm:px-6"
      @click.self="close"
    >
      <div
        class="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ editingId ? "Edit Appointment" : "Add Appointment" }}
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{
                editingId
                  ? "Update this appointment."
                  : "Create a new appointment."
              }}
            </p>
          </div>
          <button
            type="button"
            @click="close"
            :disabled="saving"
            class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-90 disabled:opacity-50"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="max-h-[70vh] space-y-4 overflow-y-auto p-6"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getFieldError('name')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("name") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getFieldError('email')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("email") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">Phone</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getFieldError('phone')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("phone") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"
                >Date & Time</label
              >
              <input
                v-model="form.datetime"
                type="datetime-local"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
              <p
                v-if="getFieldError('datetime')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("datetime") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600"
                >Department</label
              >
              <select
                v-model="form.department_id"
                @change="form.doctor_id = ''"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              >
                <option value="" disabled>Select Department</option>
                <option
                  v-for="dept in departments"
                  :key="dept.id"
                  :value="dept.id"
                >
                  {{ dept.name }}
                </option>
              </select>
              <p
                v-if="getFieldError('department_id')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("department_id") }}
              </p>
            </div>

            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-slate-600">Doctor</label>
              <select
                v-model="form.doctor_id"
                :disabled="!form.department_id"
                class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              >
                <option value="" disabled>
                  {{
                    form.department_id
                      ? "Select Doctor"
                      : "Select a department first"
                  }}
                </option>
                <option
                  v-for="doctor in filteredDoctors"
                  :key="doctor.id"
                  :value="doctor.id"
                >
                  {{ doctor.name }}
                </option>
              </select>
              <p
                v-if="getFieldError('doctor_id')"
                class="text-xs font-medium text-red-600"
              >
                {{ getFieldError("doctor_id") }}
              </p>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600">Message</label>
            <textarea
              v-model="form.message"
              rows="3"
              class="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
            <p
              v-if="getFieldError('message')"
              class="text-xs font-medium text-red-600"
            >
              {{ getFieldError("message") }}
            </p>
          </div>

          <div
            v-if="formError"
            class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {{ formError }}
          </div>

          <button
            type="submit"
            :disabled="saving"
            class="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LoaderCircle v-if="saving" class="h-4 w-4 animate-spin" />
            <span>{{
              saving
                ? "Saving..."
                : editingId
                  ? "Update Appointment"
                  : "Create Appointment"
            }}</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>
