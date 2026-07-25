<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
} from '@/components/ui/dialog';
import { 
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FormField from '@/components/ui/FormField.vue';
import * as z from "zod"
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod"
import { useQueryClient, useMutation } from "@tanstack/vue-query"
import api from '@/api';
import { useAuthStore } from '@/stores/useAuthStore';
import router from '@/router/router';

const addressSchema = z.object({
    address_type: z.string().min(1, { message: "Address type is required" }),
    address_line_1: z.string().min(1, { message: "Address line 1 is required" }),
    address_line_2: z.string().optional(),
    city: z.string().min(1, { message: "City is required" }),
    state_province: z.string().min(1, { message: "State province is required" }),
    postal_code: z.string().min(1, { message: "Postal code is required" }),
    country_code: z.string().min(1, { message: "Country code is required" }),
})

type addressSchemaType = z.infer<typeof addressSchema>

const { handleSubmit, defineField, errors } = useForm<addressSchemaType>({
    validationSchema: toTypedSchema(addressSchema)
})

const [addressType, addressTypeAttrs] = defineField("address_type")
const [addressLine1, addressLine1Attrs] = defineField("address_line_1")
const [addressLine2, addressLine2Attrs] = defineField("address_line_2")
const [city, cityAttrs] = defineField("city")
const [stateProvince, stateProvinceAttrs] = defineField("state_province")
const [postalCode, postalCodeAttrs] = defineField("postal_code")
const [countryCode, countryCodeAttrs] = defineField("country_code")

const queryClient = useQueryClient()

const { mutate } = useMutation({
    mutationFn: async (credentials: addressSchemaType & {
        user_id: number
    }) => {
        const { data } = await api.post("/address", credentials)

        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const authStore = useAuthStore()

const onSubmit = handleSubmit((values) => {
    if (!authStore.user) {
        return;
    }

    mutate({ ...values, user_id: authStore.user.id })
})

</script>

<template>
    <section>
        <Dialog>
            <DialogTrigger as-child>
                <Button class="m-8">Add a new address</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>Address details</DialogHeader>
                <form class="grid gap-3" @submit.prevent="onSubmit">
                    <FormField>
                        <Label for="address_type">Address Type</Label>
                        <Select 
                            id="address_type"
                            v-model="addressType"
                            v-bind="addressTypeAttrs"
                            >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a address type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shipping">
                                    Shipping
                                </SelectItem>
                                <SelectItem value="billing">
                                    Billing
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <span class="text-red-500" v-if="errors.address_type">
                            {{ errors.address_type }}
                        </span>
                    </FormField>
                    <FormField>
                        <Label for="address_line_1">Address line 1</Label>
                        <Input
                            id="address_line_1"
                            type="text"
                            v-model="addressLine1"
                            v-bind="addressLine1Attrs"
                        />
                        <span class="text-red-500" v-if="errors.address_line_1">
                            {{ errors.address_line_1 }}
                        </span>
                    </FormField>
                    <FormField>
                        <Label for="address_line_2">Address line 2</Label>
                        <Input
                            v-model="addressLine2"
                            v-bind="addressLine2Attrs"
                            id="address_line_2"
                            type="text"
                        />
                        <span class="text-red-500" v-if="errors.address_line_2">
                            {{ errors.address_line_2 }}
                        </span>
                    </FormField>
                    <FormField>
                        <Label for="city">City</Label>
                        <Input
                            v-model="city"
                            v-bind="cityAttrs"
                            id="city"
                            type="text"
                        />
                        <span class="text-red-500" v-if="errors.city">
                            {{ errors.city }}
                        </span>
                    </FormField>
                    <FormField>
                        <Label for="state_province">State province</Label>
                        <Input
                            v-model="stateProvince"
                            v-bind="stateProvinceAttrs"
                            id="state_province"
                            type="text"
                        />
                        <span class="text-red-500" v-if="errors.state_province">
                            {{ errors.state_province }}
                        </span>
                    </FormField>
                    <FormField>
                        <Label for="postal_code">Postal Code</Label>
                        <Input
                            v-model="postalCode"
                            v-bind="postalCodeAttrs"
                            id="postal_code"
                            type="text"
                        />
                        <span class="text-red-500" v-if="errors.postal_code">
                            {{ errors.postal_code }}
                        </span>
                    </FormField>
                    <FormField>
                        <Label for="country_code">Country Code</Label>
                        <Input
                            v-model="countryCode"
                            v-bind="countryCodeAttrs"
                            id="country_code"
                            type="text"
                        />
                        <span class="text-red-500" v-if="errors.country_code">
                            {{ errors.country_code }}
                        </span>
                    </FormField>
                    <DialogFooter>
                        <Button type="submit">Add</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        <div class="flex flex-wrap">

        </div>
    </section>
</template>
