<script setup>
import { ref } from "vue";
import { X, LoaderCircle, Plus, Pencil } from "@lucide/vue";
import { useToastStore } from "@/stores/toast";
import { useDoctorsStore } from "@/stores/doctors";
import { useDepartmentsStore } from "@/stores/departments";
import { storeToRefs } from "pinia";

const toastStore = useToastStore();
const doctorsStore = useDoctorsStore();
const departmentsStore = useDepartmentsStore();

const { items: departments } = storeToRefs(departmentsStore);

const show = ref(false);
const editingId = ref(null);
const saving = ref(false);

const form = ref({ name: "", department_id: "" });
const formErrors = ref({});
const formError = ref("");

function clearFormErrors() {
  formErrors.value = {};
  formError.value = "";
}
function getFieldError(field) {
  return formErrors.value[field]?.[0] ?? "";
}

function openCreate() {
  editingId.value = null;
  clearFormErrors();
  form.value = { name: "", department_id: "" };
  show.value = true;
  departmentsStore.fetchDepartments();
}

function openEdit(doctor) {
  editingId.value = doctor.id;
  clearFormErrors();
  form.value = {
    name: doctor.name ?? "",
    department_id: doctor.department?.id ?? "",
  };
  show.value = true;
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
      await doctorsStore.updateDoctor(editingId.value, form.value);
      toastStore.show("Doctor updated successfully");
    } else {
      await doctorsStore.createDoctor(form.value);
      toastStore.show("Doctor created successfully");
    }

    show.value = false;
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
        class="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-900/20"
      >
        <div
          class="flex items-center justify-between border-b border-slate-100 px-6 py-5"
        >
          <div>
            <h2 class="text-lg font-bold text-slate-900">
              {{ editingId ? "Edit Doctor" : "Add Doctor" }}
            </h2>
            <p class="mt-0.5 text-xs text-slate-500">
              {{
                editingId
                  ? "Update this doctor's information."
                  : "Add a new doctor."
              }}
            </p>
          </div>

          <button
            @click="close"
            :disabled="saving"
            class="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-all duration-200 hover:bg-slate-100 hover:text-slate-700 active:scale-90 disabled:opacity-50"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 p-6">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-slate-600">Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Doctor name"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
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
            <label class="text-xs font-semibold text-slate-600"
              >Department</label
            >
            <select
              v-model="form.department_id"
              class="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all duration-200 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              required
            >
              <option value="" disabled>Select Department</option>
              <option
                v-for="department in departments"
                :key="department.id"
                :value="department.id"
              >
                {{ department.name }}
              </option>
            </select>
            <p
              v-if="getFieldError('department_id')"
              class="text-xs font-medium text-red-600"
            >
              {{ getFieldError("department_id") }}
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
            <Plus
              v-else-if="!editingId"
              class="h-4 w-4 transition-transform duration-300 group-hover:rotate-90"
            />
            <Pencil
              v-else
              class="h-4 w-4 transition-transform duration-200 group-hover:-rotate-6"
            />
            <span>{{
              saving ? "Saving..." : editingId ? "Update Doctor" : "Save Doctor"
            }}</span>
          </button>
        </form>
      </div>
    </div>
  </Transition>
</template>
