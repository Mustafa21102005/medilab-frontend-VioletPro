import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import LoginView from "@/views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import DashboardLayout from "@/layouts/DashboardLayout.vue";
import DashboardView from "@/views/admin/DashboardView.vue";
import StatsView from "@/views/admin/StatsView.vue";
import HeroView from "@/views/admin/HeroView.vue";
import AboutView from "@/views/admin/AboutView.vue";
import ServiceView from "@/views/admin/ServiceView.vue";
import AppointmentView from "@/views/admin/AppointmentView.vue";
import DepartmentView from "@/views/admin/DepartmentView.vue";
import CreateDepartmentView from "@/views/admin/CreateDepartmentView.vue";
import EditDepartmentView from "@/views/admin/EditDepartmentView.vue";
import DoctorView from "@/views/admin/DoctorView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/login", name: "login", component: LoginView },
    {
      path: "/admin",
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: DashboardView,
        },
        {
          path: "stats",
          name: "stats",
          component: StatsView,
        },
        {
          path: "hero",
          name: "hero",
          component: HeroView,
        },
        {
          path: "about",
          name: "about",
          component: AboutView,
        },
        {
          path: "services",
          name: "services",
          component: ServiceView,
        },
        {
          path: "appointments",
          name: "appointments",
          component: AppointmentView,
        },
        {
          path: "doctors",
          name: "doctors",
          component: DoctorView,
        },
        {
          path: "departments",
          name: "departments",
          component: DepartmentView,
        },
        {
          path: "create/departments",
          name: "create-departments",
          component: CreateDepartmentView,
        },
        {
          path: "edit/departments/:id",
          name: "edit-departments",
          component: EditDepartmentView,
        },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (to.name === "login" && auth.isAuthenticated) {
    return { name: "dashboard" };
  }

  if (requiresAuth && !auth.isAuthenticated) {
    return { name: "login" };
  }
});

export default router;
