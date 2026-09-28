# Medilab Frontend (Vue 3)

Public website and admin panel for Medilab, a medical site where admins manage the content and visitors book appointments.

It talks to the Laravel REST API in **[medilab-backend](https://github.com/Mustafa21102005/medilab-back-end-VioletPro)**.

## Features

### Public website

- Hero, About, Services, Departments, and Stats sections, all driven by admin-managed content
- About section supports a YouTube embed, or an uploaded image linking to any external URL
- Animated counters for stats
- Appointment booking form with dependent Department → Doctor dropdowns

### Admin panel

- Dashboard with KPI cards, read-rate ring, appointments-by-department breakdown, recent appointments, and quick actions
- Appointments: create, edit, view details, delete, mark as read/unread (with confirmation dialogs)
- Doctors and departments CRUD (department images supported)
- Content editors for Hero, About, Services, and Stats
- Toast notifications and validation errors from the API shown inline

## Tech stack

- Vue 3 (Composition API, `<script setup>`)
- Pinia for state management
- Vue Router
- Axios
- Tailwind CSS
- DataTables (`datatables.net-vue3`)
- Select2 icon picker (jQuery)
- Lucide icons

## Getting started

### Prerequisites

- Node.js 22+
- The [Laravel backend](https://github.com/Mustafa21102005/medilab-back-end-VioletPro) running locally

### Install and run

```bash
git clone https://github.com/Mustafa21102005/medilab-frontend-VioletPro.git
cd medilab-frontend
npm install
```

```bash
npm run dev
```

## Project structure

```
src/
├── components/   # Shared components (AppointmentFormModal, DoctorFormModal, Select2IconPicker, ...)
├── lib/          # API client, icon map
├── stores/       # Pinia stores
├── views/        # Public sections and admin pages
└── router/
```

## Architecture notes

- **One Pinia store per domain** (`stats`, `services`, `hero`, `about`, `departments`, `doctors`, `appointments`, plus `toast`, `confirm`, and `auth`). Stores own the shared data and API calls. Components keep only local UI state (modals, form drafts).
- **Caching:** each `fetchX({ force })` skips the network if data was already loaded. Mutations refetch when the backend has side effects (e.g. reordering) and patch locally when they don't (e.g. mark as read).
- **Reusable modals:** `AppointmentFormModal` and `DoctorFormModal` expose `openCreate()` / `openEdit()` through `defineExpose`, so the same form works from the admin pages and the dashboard.
- **File uploads:** sent as `FormData` with `_method=PUT` for Laravel method spoofing. Preview object URLs are revoked to avoid memory leaks.

## License

This project is open-sourced under the [MIT License](LICENSE).

## Author

**Mustafa Azmi Khalil** — © 2026
