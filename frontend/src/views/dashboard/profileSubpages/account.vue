<script setup lang="ts">
import { Button } from "@/components/ui/button";
import ProfileCard from "@/components/ui/ProfileCard.vue";
import { useAuthStore } from "@/stores/useAuthStore";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import api from "@/api";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm, useField } from "vee-validate";
import { useQueryClient, useMutation } from "@tanstack/vue-query";

const emailSchema = z.object({
    email: z.string().email({ message: "Must be a valid email" }),
});

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
        password_confirmation: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
    })
    .refine((data) => data.password !== data.password_confirmation, {
        message: "Passwords do not match",
    });

type emailType = z.infer<typeof emailSchema>;
type passwordType = z.infer<typeof passwordSchema>;

const { handleSubmit, errors } = useForm<emailType>({
    validationSchema: toTypedSchema(emailSchema),
});

const { handleSubmit: handleSubmitPassword, errors: errorsPassword } =
    useForm<passwordType>({
        validationSchema: toTypedSchema(passwordSchema),
    });

const { value: email } = useField<string>("email");

const { value: password } = useField<string>("password");
const { value: password_confirmation } = useField<string>(
    "password_confirmation",
);

const queryClient = useQueryClient();

const { mutate } = useMutation({
    mutationFn: async (credentials: emailType) => {
        const { data } = await api.put("/user/email", credentials);

        return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries();
    },
});

const onSubmit = handleSubmit((values) => {
    mutate(values);
});

const { mutate: mutatePassword } = useMutation({
    mutationFn: async (credentials: passwordType) => {
        const { data } = await api.put("/user/password", credentials);

        return data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries();
    },
});

const onSubmitPassword = handleSubmitPassword((values) => {
    mutatePassword(values);
});

const authStore = useAuthStore();
</script>

<template>
    <section>
        <div class="p-4">
            <p class="text-2xl p-1 items-center max-md:flex-col md:flex gap-8">
                Email: {{ authStore.user?.email }}
                <Dialog>
                    <DialogTrigger as-child>
                        <Button>Change Email</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader> Email Change </DialogHeader>
                        <form @submit.prevent="onSubmit">
                            <div class="grid gap-4 p-3">
                                <div class="grid gap-3">
                                    <Label for="email-1">New email</Label>
                                    <Input
                                        id="email-1"
                                        v-model="email"
                                        name="email"
                                        type="email"
                                    />
                                    <span
                                        class="text-red-500"
                                        v-if="errors.email"
                                        >{{ errors.email }}</span
                                    >
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Change email</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </p>
        </div>
        <ProfileCard> Scope: {{ authStore.user?.scope }} </ProfileCard>
        <div class="p-4">
            <Dialog>
                <DialogTrigger as-child>
                    <Button>Change password</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader> Password Change </DialogHeader>
                    <form @submit.prevent="onSubmitPassword">
                        <div class="grid gap-4 p-3">
                            <div class="grid gap-3">
                                <Label for="password-1">New password</Label>
                                <Input
                                    id="password-1"
                                    v-model="password"
                                    name="password-1"
                                    type="password"
                                />
                                <span
                                    class="text-red-500"
                                    v-if="errorsPassword.password"
                                    >{{ errorsPassword.password }}</span
                                >
                                <Label for="password-2">Confirm password</Label>
                                <Input
                                    id="password-2"
                                    v-model="password_confirmation"
                                    name="password-2"
                                    type="password"
                                />
                                <span
                                    class="text-red-500"
                                    v-if="errorsPassword.password_confirmation"
                                    >{{
                                        errorsPassword.password_confirmation
                                    }}</span
                                >
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Change password</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    </section>
</template>
