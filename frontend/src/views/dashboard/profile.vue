<script setup lang="ts">
    import { useAuthStore } from '@/stores/useAuthStore';

    const authStore = useAuthStore();

    const options = [
        {
            "label": "Account details",
            "path": "/profile"
        },
        {
            "label": "Personal data",
            "path": "/profile/personal"
        },
        {
            "label": "Addresses",
            "path": "/profile/addresses"
        }
    ]
</script>

<template>
    <div v-if="!authStore.user">
        <h1>Account not found</h1>
    </div>
    <div class="h-full" v-else>
        <div class="w-3/4 m-auto grid grid-cols-1 md:grid-cols-[1fr_4fr] gap-4">
            <aside class="bg-white dark:bg-zinc-950">
                <ul class="list-none text-center">
                    <RouterLink v-for="option in options" :to="option.path">
                        <li class="py-2 hover:bg-amber-500 hover:text-white hover:scale-105 transition-all">
                            {{ option.label }}
                        </li>
                    </RouterLink>
                </ul>
            </aside>
            <RouterView />
        </div>
    </div>
</template>