<script setup lang="ts">
import Section from "@/components/ui/Section.vue";
import { useI18n } from "vue-i18n";
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

const profileSchema = z.object({
    username: z
        .string()
        .min(3, { message: "Username must be at least 3 characters" })
        .max(20, { message: "Username cannot exceed 20 characters" }),

    email: z
        .string()
        .min(1, { message: "Email is required" })
        .email({ message: "Must be a valid email address" }),

    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" }),

    confirmPassword: z
        .string()
        .min(1, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'], 
})

type ProfileFormValue = z.infer<typeof profileSchema>

const { handleSubmit, errors } = useForm<ProfileFormValue>({
    validationSchema: toTypedSchema(profileSchema)
})

const { value: username } = useField<string>('username')
const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')
const { value: confirmPassword } = useField<string>('confirmPassword')

const onSubmit = handleSubmit((values) => {
    console.log(`Data: ${JSON.stringify(values, null, 2)}`)
})

const { t } = useI18n();

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button"
</script>

<template>
    <Section>
        <div class="md:w-1/3">
            <h1>Register form</h1>
            <form @submit.prevent="onSubmit" class="py-10 grid gap-4">
                <div class="grid gap-3">
                    <Label for="username">Username</Label>
                    <Input id="username" v-model="username" type="text" :class="{ 'border-red-500': errors.username }" />
                    <span class="text-red-500" v-if="errors.username">{{ errors.username }}</span>
                </div>
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
                    <Label for="confirmPassword">Confirm password</Label>
                    <Input id="confirmPassword" v-model="confirmPassword" type="password" :class="{ 'border-red-500': errors.confirmPassword }" />
                    <span class="text-red-500" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
                </div>
                <Button>Register</Button>
            </form>
        </div> 
    </Section>
</template>
