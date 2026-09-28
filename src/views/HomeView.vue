<script setup>
import Footer from "@/components/Footer.vue";
import NavBar from "@/components/NavBar.vue";
import AboutSection from "@/components/sections/AboutSection.vue";
import AppointmentSection from "@/components/sections/AppointmentSection.vue";
import DepartmentsSection from "@/components/sections/DepartmentsSection.vue";
import HeroSection from "@/components/sections/HeroSection.vue";
import ServicesSection from "@/components/sections/ServicesSection.vue";
import StatsSection from "@/components/sections/StatsSection.vue";
</script>

<template>
  <NavBar />
  <HeroSection />
  <AboutSection />
  <StatsSection />
  <ServicesSection />
  <AppointmentSection />
  <DepartmentsSection />
  <Footer />
</template>
