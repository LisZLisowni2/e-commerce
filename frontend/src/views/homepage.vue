<script setup lang="ts">
    import { Swiper, SwiperSlide } from "swiper/vue"
    import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules"
    import Slide from "@/components/swiper/Slide.vue"
    
    import "swiper/css"
    import "swiper/css/navigation"
    import "swiper/css/scrollbar"
    import "swiper/css/pagination"

    const modules = [Navigation, Pagination, Scrollbar, A11y]

    const onSwiper = (swiper) => {
        console.log(swiper)
    }

    const onSlideChange = () => {
        console.log("Slide changed")
    }
</script>

<template>
    <section class="w-full p-10">
        <swiper
            :slides-per-view="1"
            :space-between="50"
            navigation
            :modules="modules"
            :pagination="{ clickable: true }"
            :scrollbar="{ draggable: true }"
            @swiper="onSwiper" 
            @slide-change="onSlideChange"   
            class="h-40"
        >
            <swiper-slide><slide>1</slide></swiper-slide>
            <swiper-slide><slide>2</slide></swiper-slide>
            <swiper-slide><slide>3</slide></swiper-slide>
        </swiper>
    </section>
</template>