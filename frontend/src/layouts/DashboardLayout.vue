<!-- src/layouts/DashboardLayout.vue -->
<script setup lang="ts">
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarAdmin from "@/components/ui/SidebarAdmin.vue";
</script>

<template>
    <SidebarProvider>
        <SidebarAdmin />

        <SidebarInset>
            <header
                class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4"
            >
                <SidebarTrigger />
            </header>

            <main
                class="flex-1 p-6 bg-zinc-50 dark:bg-zinc-900 min-h-[calc(100vh-4rem)]"
            >
                <slot />
            </main>
        </SidebarInset>
    </SidebarProvider>
</template>
