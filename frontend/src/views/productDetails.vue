<script setup lang="ts">
import { useRoute } from 'vue-router';
import router from "@/router/router"

const route = useRoute()

if (!route.params.id) {
    router.push("/")
}



</script>

<template>

</template>
