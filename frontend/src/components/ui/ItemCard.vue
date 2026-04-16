<script setup lang="ts">
    defineProps<{
        title: string,
        price: number,
        lowestPrice30Days: number,
        imageUrl: string,
    }>()
    
    import {
        Card,
        CardContent,
    } from '@/components/ui/card'

    import useCountry from "@/composables/useCountry"

    const { countryCode, isLoading } = useCountry()
</script>

<template>
    <Card class="inline-block px-2 mx-2 w-full">
        <CardContent class="text-center flex flex-col justify-center items-center">
            <img :src="imageUrl" :alt="`${title}-image`" width="180" class="p-2" />
            <h2 class="text-xl">{{ title }}</h2>
            <p class="text-2xl font-bold">${{ price }}</p>
            <p v-if="isLoading">
                Loading...
            </p>
            <p v-else-if="!isLoading && countryCode === 'PL' && lowestPrice30Days" class="text-sm text-gray-500 mt-1">
                Najniższa cena z 30 dni: {{ lowestPrice30Days }} zł
            </p>
        </CardContent>
    </Card>
</template>