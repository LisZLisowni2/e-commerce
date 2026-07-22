<script setup lang="ts">
const props = defineProps<{
    title: string;
    price: number;
    lowestPrice30Days?: number;
    imageUrl: string;
}>();

import { Card, CardContent } from "@/components/ui/card";

import { useCountryCode } from "@/composables/useCountryCode";
import { useImageProduct } from "@/composables/useImageProduct";
const { data: countryCode, isLoading } = useCountryCode();

const { data: image, isLoading: isImageLoading } = useImageProduct(props.imageUrl);

</script>

<template>
    <Card class="inline-block px-2 mx-2 w-full">
        <CardContent
            class="text-center flex flex-col justify-center items-center"
        >
            <img v-if="!isImageLoading"
                :src="image"
                :alt="`${title}-image`"
            />
            <span v-else>Image loading...</span>
            <h2 class="text-xl">{{ title }}</h2>
            <p class="text-2xl font-bold">${{ price }}</p>
            <p v-if="isLoading">Loading...</p>
            <p v-else></p>
            <p
                v-if="countryCode === 'PL' && lowestPrice30Days"
                class="text-sm text-gray-500 mt-1"
                data-testid="lowest-price"
            >
                The lowest price in 30 days range: {{ lowestPrice30Days }} zł
            </p>
        </CardContent>
    </Card>
</template>
