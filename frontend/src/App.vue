<script setup lang="ts">
  import { RouterView, RouterLink } from "vue-router"
</script>

<template>
  <header class="p-4">
    <h1 class="text-3xl text-amber-500">E-commerance</h1>
  </header>
  <nav class="p-4">
    <p>Navigation</p>
  </nav>
  <main class="bg-zinc-50 min-h-screen">
    <router-view />
  </main>
</template>
