<script setup lang="ts">
import img1 from "@/assets/testAd1.jpg"
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, A11y } from "swiper/modules";
import Slide from "@/components/swiper/Slide.vue";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const modules = [Navigation, Pagination, A11y];

const onSwiper = (swiper) => {
    console.log(swiper);
};

const onSlideChange = () => {
    console.log("Slide changed");
};
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
        >
            <swiper-slide>
                <slide> 
                    <img :src="img1" alt="ad1" />
                </slide>
            </swiper-slide>
            <swiper-slide>
                <slide> 
                    <img :src="img1" alt="ad1" />
                </slide>
            </swiper-slide>
            <swiper-slide>
                <slide> 
                    <img :src="img1" alt="ad1" />
                </slide>
            </swiper-slide>
        </swiper>
    </section>
</template>
