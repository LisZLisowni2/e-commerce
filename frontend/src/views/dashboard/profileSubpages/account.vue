<script setup lang="ts">
    import Input from '@/components/ui/input/Input.vue';
    import { useAuthStore } from '@/stores/useAuthStore';

    const authStore = useAuthStore();
</script>

<template>
    <section>
        <div class="p-4">
            <p class="text-2xl p-1">Email: <Input type="text" :default-value="authStore.user?.email" /></p>
        </div>
        <div class="p-4">
            <p class="text-2xl p-1">Passsword <Input type="password" :default-value="authStore.user?.password" /></p>
        </div>
    </section>
</template>