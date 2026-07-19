<script setup lang="ts">
    import { useAuthStore } from '@/stores/useAuthStore';

    const authStore = useAuthStore();
</script>

<template>
    <div v-if="!authStore.user">
        <h1>Account not found</h1>
    </div>
    <div v-else>
        <div class="w-3/4 m-auto grid grid-cols-1 md:grid-cols-[1fr_4fr] gap-4">
            <aside>
                <ul class="list-none *:py-2 bg-white dark:bg-zinc-950 text-center">
                    <li>Details</li>
                    <li>Details</li>
                    <li>Details</li>
                    <li>Details</li>
                    <li>Details</li>
                    <li>Details</li>
                </ul>
            </aside>
            <section class="p-10">
                <h1 class="text-4xl">Details</h1>
                <p>{{ authStore.user?.name }}</p>
                <p>{{ authStore.user?.email }}</p>
            </section>
        </div>
    </div>
</template>