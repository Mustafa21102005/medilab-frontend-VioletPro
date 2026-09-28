<script setup>
import { ref, onMounted, onUnmounted, nextTick, h, render } from "vue";
import { iconLibrary, iconMap } from "@/lib/icons";

const modelValue = defineModel();
const selectEl = ref(null);

function renderIconOption(item) {
  if (!item.id) return item.text;

  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-2";

  const iconWrapper = document.createElement("span");
  iconWrapper.className =
    "inline-flex h-5 w-5 items-center justify-center text-slate-500";
  wrapper.appendChild(iconWrapper);

  const label = document.createElement("span");
  label.textContent = item.text;
  wrapper.appendChild(label);

  const IconComponent = iconMap[item.id];
  if (IconComponent) {
    render(h(IconComponent, { class: "h-4 w-4" }), iconWrapper);
  }

  return wrapper;
}

function initSelect2() {
  const select = $(selectEl.value);

  select.select2({
    width: "100%",
    placeholder: "Select an icon",
    templateResult: renderIconOption,
    templateSelection: renderIconOption,
    escapeMarkup: (markup) => markup,
  });

  select.on("select2:select", (e) => {
    modelValue.value = e.params.data.id;
  });
}

function destroySelect2() {
  const select = $(selectEl.value);
  if (select.hasClass("select2-hidden-accessible")) {
    select.off("select2:select");
    select.select2("destroy");
  }
}

onMounted(async () => {
  await nextTick();
  initSelect2();
});

onUnmounted(() => {
  destroySelect2();
});
</script>

<template>
  <select ref="selectEl" v-model="modelValue">
    <option value="" disabled>Select an icon</option>
    <option v-for="item in iconLibrary" :key="item.key" :value="item.key">
      {{ item.label }}
    </option>
  </select>
</template>
