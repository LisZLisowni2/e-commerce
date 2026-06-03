<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Slide from "@/components/swiper/Slide.vue";
import ItemCard from "@/components/ui/ItemCard.vue";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Section from "@/components/ui/Section.vue";
const modules = [Navigation, Pagination, A11y];
</script>

<template>
    <Section>
        <swiper
            :slides-per-view="1"
            :space-between="50"
            navigation
            :modules="modules"
            :pagination="{ clickable: true }"
            :scrollbar="{ draggable: true }"
            :autoplay="{ delay: 5000 }"
        >
        </swiper>
    </Section>
    <Section>
        <h1 class="text-3xl font-bold">Latest</h1>
        <swiper
            :slides-per-view="1"
            :breakpoints="{
                640: { slidesPerView: 2, spaceBetween: 20 },
                768: { slidesPerView: 3, spaceBetween: 30 },
                1024: { slidesPerView: 4, spaceBetween: 40 },
                1280: { slidesPerView: 6, spaceBetween: 50 }
            }"
            :space-between="50"
            navigation
            :modules="modules"
            :pagination="{ clickable: true }"
            :scrollbar="{ draggable: true }"
            :autoplay="{ delay: 5000 }"
            class="m-8"
        >
        </swiper>
        <div class="m-5 overflow-auto whitespace-nowrap p-5"></div>
    </Section>
</template>
