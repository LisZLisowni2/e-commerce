<script setup lang="ts">
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import ProfileCard from '@/components/ui/ProfileCard.vue';
    import {
        Select,
        SelectContent,
        SelectTrigger,
        SelectValue,
        SelectItem,
    } from "@/components/ui/select"
    import * as z from "zod"
    import { useForm, useField } from "vee-validate";
    import { useQueryClient, useMutation } from "@tanstack/vue-query";
    import { toTypedSchema } from "@vee-validate/zod";
    import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
    import { CalendarIcon } from '@lucide/vue';
    import { Calendar } from '@/components/ui/calendar'
    import { ref } from "vue"
    import {
        Popover,
        PopoverContent,
        PopoverTrigger,
    } from '@/components/ui/popover'
    import api from "@/api";

    const personalSchema = z.object({
        firstname: z.string().min(1, { message: "First name is required" }),
        lastname: z.string().min(1, { message: "First name is required" }),
        phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, { message: "Must be a valid phone number" }),
        dateofbirth: z.custom<DateValue>((val) => val !== null && val !== undefined, {
            message: "Please select a date",
        }).transform((val) => val.toDate(getLocalTimeZone())),
        gender: z.string({ message: "Must be a selected gender" }),
    })

    type PersonalType = z.infer<typeof personalSchema>;
    
    const { handleSubmit, errors } = useForm<PersonalType>({
        validationSchema: toTypedSchema(personalSchema)
    })

    const { value: firstname } = useField<string>('firstname')
    const { value: lastname } = useField<string>('lastname')
    const { value: phone } = useField<string>('phone')
    const { value: dateofbirth } = useField<DateValue>('dateofbirth')
    const { value: gender } = useField<string>('gender')

    import { useAuthStore } from '@/stores/useAuthStore';

    const authStore = useAuthStore();
    const dateDefaultPlaceholder = today(getLocalTimeZone())
    const globalMessage = ref<string>()

    const queryClient = useQueryClient();

    const { mutate } = useMutation({
        mutationFn: async (credentials: PersonalType) => {
            const { data } = await api.put("/user/personal", credentials);

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries();

            globalMessage.value = "Data updated successfully!";
        }
    })

    const onSubmit = handleSubmit((values) => {
        globalMessage.value = ""

        mutate(values)
    })

</script>

<template>
    <section>
        <form @submit.prevent="onSubmit">
            <ProfileCard>
                Firstname: <Input :default-value="authStore.user?.first_name" v-model="firstname" />
                <p class="text-sm py-2 text-red-500" v-if="errors.firstname">{{ errors.firstname }}</p>
            </ProfileCard>
            <ProfileCard>
                Lastname: <Input :default-value="authStore.user?.last_name" v-model="lastname" />
                <p class="text-sm py-2 text-red-500" v-if="errors.lastname">{{ errors.lastname }}</p>
            </ProfileCard>
            <ProfileCard>
                Phone: <Input :default-value="authStore.user?.phone" v-model="phone" />
                <p class="text-sm py-2 text-red-500" v-if="errors.phone">{{ errors.phone }}</p>
            </ProfileCard>
            <ProfileCard>
                Date Of Birth:
                <Popover>
                    <PopoverTrigger as-child>
                        <Button variant="outline">
                            <CalendarIcon class="mr-2 h-4 w-4" />
                            {{ dateofbirth ? dateofbirth.toString() : "Pick a date" }}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent class="w-auto p-0">
                        <Calendar 
                            v-model="dateofbirth"
                            :initial-focus="true"
                            :default-placeholder="dateDefaultPlaceholder"
                            layout="month-and-year"
                        />
                    </PopoverContent>
                </Popover>
                <p class="text-sm py-2 text-red-500" v-if="errors.dateofbirth">{{ errors.dateofbirth }}</p>
            </ProfileCard>
            <ProfileCard>
                Gender: 
                    <Select :default-value="authStore.user?.gender" v-model="gender">
                        <SelectTrigger>
                            <SelectValue placeholder="Select a gender" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="man">
                                Man
                            </SelectItem>
                            <SelectItem value="woman">
                                Woman
                            </SelectItem>
                            <SelectItem value="nonbinary">
                                Nonbinary
                            </SelectItem>
                        </SelectContent>
                    </Select>
                <p class="text-sm py-2 text-red-500" v-if="errors.gender">{{ errors.gender }}</p>
            </ProfileCard>
            <div class="p-4">
                <Button>Change data</Button>
                <p>{{ globalMessage }}</p>
            </div>
        </form>
    </section>
</template>
