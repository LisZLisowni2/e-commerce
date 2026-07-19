<script setup lang="ts">
import Section from "@/components/ui/Section.vue";
import { useForm, useField } from "vee-validate";
import { useQueryClient, useMutation } from "@tanstack/vue-query";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import api from "@/api";

const profileSchema = z.object({
    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Must be a valid email address" }),

    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),

    password_confirmation: z
        .string()
        .min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'], 
})

type ProfileFormValue = z.infer<typeof profileSchema>

const { handleSubmit, errors } = useForm<ProfileFormValue>({
    validationSchema: toTypedSchema(profileSchema)
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const { value: password_confirmation } = useField<string>('password_confirmation')
const successMessage = ref<string>()

const queryClient = useQueryClient()

const { mutate, isError, error } = useMutation({
    mutationFn: async (credentials: ProfileFormValue) => {
        const { data } = await api.post("/register", credentials)
        return data
    },
    onSuccess: async (res) => {
        successMessage.value = res.message

        queryClient.invalidateQueries()
    }
})

const onSubmit = handleSubmit((values) => {
    successMessage.value = ""

    mutate({ email: values.email, password: values.password, password_confirmation: values.password_confirmation })
})

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"
import { ref } from "vue";

</script>

<template>
    <Section>
        <div class="md:w-1/3">
            <h1>Register form</h1>
            <form @submit.prevent="onSubmit" class="py-10 grid gap-4">
                <div class="grid gap-3">
                    <Label for="email">Email</Label>
                    <Input id="email" v-model="email" type="text" :class="{ 'border-red-500': errors.email }" />
                    <span class="text-red-500" v-if="errors.email">{{ errors.email }}</span>
                </div>
                <div class="grid gap-3">
                    <Label for="password">Password</Label>
                    <Input id="password" v-model="password" type="password" :class="{ 'border-red-500': errors.password }" />
                    <span class="text-red-500" v-if="errors.password">{{ errors.password }}</span>
                </div>
                <div class="grid gap-3">
                    <Label for="password_confirmation">Confirm password</Label>
                    <Input id="password_confirmation" v-model="password_confirmation" type="password" :class="{ 'border-red-500': errors.password_confirmation }" />
                    <span class="text-red-500" v-if="errors.password_confirmation">{{ errors.password_confirmation }}</span>
                </div>
                <Button>Register</Button>
                <span class="text-red-500" v-if="isError">{{ error }}</span>
                <span class="text-green-500" v-if="successMessage">{{ successMessage }}</span>
            </form>
        </div> 
    </Section>
</template>
