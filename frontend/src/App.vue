<script setup lang="ts">
  import { RouterView, RouterLink } from "vue-router"
  import { useThemeStore } from "./stores/useThemeStore";
  import Button from "./components/ui/button/Button.vue";

  const themeStore = useThemeStore();
</script>

<template>
  <header class="p-4 flex flex-row *:mr-4 items-center">
    <h1 class="text-3xl text-amber-500">E-commerance</h1>
    <Button @click="themeStore.mode === 'light' ? themeStore.mode = 'dark' : themeStore.mode = 'light'">
      Toggle Theme
    </Button>
  </header>
  <nav class="p-4">
    <p>Navigation</p>
  </nav>
  <main class="bg-zinc-50 min-h-screen dark:bg-zinc-900">
    <router-view />
  </main>
</template>
