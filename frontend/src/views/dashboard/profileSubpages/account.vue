<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProfileCard from "@/components/ui/ProfileCard.vue";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import * as z from "zod";
import api from "@/api";
import { toTypedSchema } from "@vee-validate/zod";
import { useAuthStore } from "@/stores/useAuthStore";
import { useForm } from "vee-validate";
import { useQueryClient, useMutation } from "@tanstack/vue-query";

const emailSchema = z.object({
    email: z.string().email({ message: "Must be a valid email" }),
    current_password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
});

const passwordSchema = z
    .object({
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
        password_confirmation: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
        current_password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters" }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

type emailType = z.infer<typeof emailSchema>;
type passwordType = z.infer<typeof passwordSchema>;

const { handleSubmit: handleEmailSubmit, errors: emailErrors, defineField: defineEmailField } = useForm<emailType>({
    validationSchema: toTypedSchema(emailSchema),
});

const { handleSubmit: handlePasswordSubmit, errors: passwordErrors, defineField: definePasswordField } = useForm<passwordType>({
    validationSchema: toTypedSchema(passwordSchema),
});

const [email, emailAttrs] = defineEmailField("email");
const [emailCurrentPassword, emailCurrentPasswordAttrs] = defineEmailField("current_password");

const [password, passwordAttrs] = definePasswordField("password");
const [passwordConfirmation, passwordConfirmationAttrs] = definePasswordField("password_confirmation");
const [passwordCurrentPassword, passwordCurrentPasswordAttrs] = definePasswordField("current_password");

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

const onSubmitEmail = handleEmailSubmit((values) => {
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

const onSubmitPassword = handlePasswordSubmit((values) => {
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
                        <form @submit.prevent="onSubmitEmail">
                            <div class="grid gap-4 p-3">
                                <div class="grid gap-3">
                                    <Label for="email-1">New email</Label>
                                    <Input
                                        id="email-1"
                                        v-model="email"
                                        v-bind="emailAttrs"
                                        type="email"
                                    />
                                    <span
                                        class="text-red-500"
                                        v-if="emailErrors.email"
                                        >{{ emailErrors.email }}</span
                                    >
                                    <Label for="email-password"
                                        >Current password</Label
                                    >
                                    <Input
                                        id="email-password"
                                        v-model="emailCurrentPassword"
                                        v-bind="emailCurrentPasswordAttrs"
                                        type="password"
                                    />
                                    <span
                                        class="text-red-500"
                                        v-if="emailErrors.current_password"
                                        >{{ emailErrors.current_password }}</span
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
                                    v-bind="passwordAttrs"
                                    type="password"
                                />
                                <span
                                    class="text-red-500"
                                    v-if="passwordErrors.password"
                                    >{{ passwordErrors.password }}</span
                                >
                                <Label for="password-2">Confirm password</Label>
                                <Input
                                    id="password-2"
                                    v-model="passwordConfirmation"
                                    v-bind="passwordConfirmationAttrs"
                                    type="password"
                                />
                                <span
                                    class="text-red-500"
                                    v-if="passwordErrors.password_confirmation"
                                    >{{
                                        passwordErrors.password_confirmation
                                    }}</span
                                >
                                <Label for="password-current"
                                    >Current password</Label
                                >
                                <Input
                                    id="password-current"
                                    v-model="passwordCurrentPassword"
                                    v-bind="passwordCurrentPasswordAttrs"
                                    type="password"
                                />
                                <span
                                    class="text-red-500"
                                    v-if="passwordErrors.current_password"
                                    >{{
                                        passwordErrors.current_password
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
