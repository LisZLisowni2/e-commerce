<script setup lang="ts">
    import { computed } from "vue"
    import { useRoute } from "vue-router";
    import DefaultLayout from "@/layouts/DefaultLayout.vue";
    import DashboardLayout from "@/layouts/DashboardLayout.vue";
    import VendorDashboardLayout from "@/layouts/VendorDashboardLayout.vue";

    const route = useRoute()

    const layout = computed(() => {
        if (route.meta.layout === "dashboard") return DashboardLayout
        if (route.meta.layout === "vendor-dashboard") return VendorDashboardLayout
        return DefaultLayout
    })
</script>

<template>
    <component :is="layout">
        <RouterView />
    </component>
</template>
