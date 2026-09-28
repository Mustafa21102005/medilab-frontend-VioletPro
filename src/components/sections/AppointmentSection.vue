<script setup>
import { ref, onMounted, computed, watch } from "vue";
import api from "@/lib/api";
import { useDoctorsStore } from "@/stores/doctors";
import { useDepartmentsStore } from "@/stores/departments";
import { storeToRefs } from "pinia";

const doctorsStore = useDoctorsStore();
const departmentsStore = useDepartmentsStore();
const { doctors } = storeToRefs(doctorsStore);
const { items: departments } = storeToRefs(departmentsStore);

const form = ref({
  name: "",
  email: "",
  phone: "",
  datetime: "",
  department_id: "",
  doctor_id: "",
  message: "",
});

const filteredDoctors = computed(() => {
  if (!form.value.department_id) return [];
  return doctors.value.filter(
    (d) => d.department_id === form.value.department_id,
  );
});

watch(
  () => form.value.department_id,
  () => {
    form.value.doctor_id = "";
  },
);

const submitting = ref(false);
const submitStatus = ref(null);

async function handleSubmit() {
  submitting.value = true;
  submitStatus.value = null;

  try {
    await api.post("/appointments", form.value);

    submitStatus.value = {
      type: "success",
      message: "Appointment request sent — we'll be in touch soon.",
    };

    form.value = {
      name: "",
      email: "",
      phone: "",
      datetime: "",
      department_id: "",
      doctor_id: "",
      message: "",
    };
  } catch (err) {
    console.error(err);

    const response = err.response;

    if (response?.status === 422 && response.data?.errors) {
      const errors = Object.values(response.data.errors).flat();
      submitStatus.value = {
        type: "error",
        message: errors[0] || "Please check the form and try again.",
      };
    } else if (response?.data?.message) {
      submitStatus.value = { type: "error", message: response.data.message };
    } else {
      submitStatus.value = {
        type: "error",
        message: "Something went wrong. Please try again.",
      };
    }
  } finally {
    submitting.value = false;
  }
}

const inputClass =
  "w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition";

const appointment = ref(null);
const loading = ref(true);
const error = ref(null);

async function loadAppointmentSection() {
  loading.value = true;
  error.value = null;

  try {
    const response = await api.get("/appointment-section");
    appointment.value = response.data;
  } catch (err) {
    error.value = "Couldn't load appointment content.";
    console.error(err);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await Promise.all([
    loadAppointmentSection(),
    doctorsStore.fetchDoctors(),
    departmentsStore.fetchDepartments(),
  ]);
});
</script>

<template>
  <section id="appointment" class="bg-slate-50 py-20 lg:py-28">
    <div v-if="loading" class="py-32 text-center text-slate-400">
      Loading...
    </div>

    <div v-else-if="error" class="py-32 text-center text-red-500">
      {{ error }}
    </div>

    <template v-else>
      <div class="mx-auto max-w-5xl px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
          <h2 class="text-3xl font-bold text-slate-900 sm:text-4xl">
            {{ appointment.title }}
          </h2>
          <div class="mx-auto mt-3 h-1 w-16 rounded-full bg-blue-600"></div>
          <p class="mt-4 text-slate-600">{{ appointment.subtitle }}</p>
        </div>

        <form
          @submit.prevent="handleSubmit"
          class="mt-12 grid gap-5 rounded-2xl bg-white p-8 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
        >
          <input
            v-model="form.name"
            type="text"
            placeholder="Your Name"
            :class="inputClass"
            required
          />
          <input
            v-model="form.email"
            type="email"
            placeholder="Your Email"
            :class="inputClass"
            required
          />
          <input
            v-model="form.phone"
            type="tel"
            placeholder="Your Phone"
            :class="inputClass"
            required
          />
          <input
            v-model="form.datetime"
            type="datetime-local"
            :class="inputClass"
            required
          />

          <select v-model="form.department_id" :class="inputClass" required>
            <option value="" disabled>Select Department</option>
            <option v-for="dept in departments" :key="dept.id" :value="dept.id">
              {{ dept.name }}
            </option>
          </select>

          <select
            v-model="form.doctor_id"
            :class="inputClass"
            :disabled="!form.department_id"
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

          <textarea
            v-model="form.message"
            rows="5"
            placeholder="Message (Optional)"
            :class="[inputClass, 'sm:col-span-2 lg:col-span-3 resize-none']"
          ></textarea>

          <div class="sm:col-span-2 lg:col-span-3 text-center">
            <p
              v-if="submitStatus"
              class="mb-4 text-sm font-medium"
              :class="
                submitStatus.type === 'success'
                  ? 'text-green-600'
                  : 'text-red-600'
              "
            >
              {{ submitStatus.message }}
            </p>

            <button
              type="submit"
              :disabled="submitting"
              class="rounded-full bg-blue-600 px-10 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {{ submitting ? "Sending..." : "Make an Appointment" }}
            </button>
          </div>
        </form>
      </div>
    </template>
  </section>
</template>
