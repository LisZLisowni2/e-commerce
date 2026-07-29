<script setup lang="ts">
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHeader,
    TableHead,
    TableRow,
} from "@/components/ui/table";
import { useUsers } from "@/composables/useUsers";
import { Eraser, Pencil } from "@lucide/vue";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/FormField.vue";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as z from "zod"
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { getLocalTimeZone, type DateValue } from "@internationalized/date";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const userSchema = z.object({
    email: z.string().email(),
    scope: z.string(),
    status: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, { message: "Must be a valid phone number" }).optional(),
    dateofbirth: z.custom<DateValue>((val) => val !== null && val !== undefined, {
        message: "Please select a date",
    }).transform((val) => val.toDate(getLocalTimeZone())).optional(),
    gender: z.string().optional()
})

type userSchemaType = z.infer<typeof userSchema>

const { handleSubmit, defineField, errors } = useForm<userSchemaType>({
    validationSchema: toTypedSchema(userSchema)
})

const [email, emailAttrs] = defineField('email')
const [scope, scopeAttrs] = defineField('scope')
const [status, statusAttrs] = defineField('status')
const [firstname, firstnameAttrs] = defineField('first_name')
const [lastname, lastnameAttrs] = defineField('last_name')
const [phone, phoneAttrs] = defineField('phone')
const [dateOfBirth, dateOfBirthAttrs] = defineField('dateofbirth')
const [gender, genderAttrs] = defineField('gender')

const { data, isLoading } = useUsers();
</script>

<template>
    <h1 v-if="isLoading">Loading...</h1>
    <Table v-else>
        <TableCaption>A list of users</TableCaption>
        <TableHeader>
            <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Email verified at</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>First name</TableHead>
                <TableHead>Last name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Created at</TableHead>
                <TableHead>Updated at</TableHead>
                <TableHead></TableHead>
                <TableHead></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow v-for="user in data?.users">
                <TableCell>{{ user.id }}</TableCell>
                <TableCell>{{ user.email }}</TableCell>
                <TableCell>{{ user.email_verified_at }}</TableCell>
                <TableCell>{{ user.scope }}</TableCell>
                <TableCell>{{ user.status }}</TableCell>
                <TableCell>{{ user.first_name }}</TableCell>
                <TableCell>{{ user.last_name }}</TableCell>
                <TableCell>{{ user.phone }}</TableCell>
                <TableCell>{{ user.date_of_birth }}</TableCell>
                <TableCell>{{ user.gender }}</TableCell>
                <TableCell>{{ user.created_at }}</TableCell>
                <TableCell>{{ user.updated_at }}</TableCell>
                <TableCell>
                    <Dialog>
                        <DialogTrigger as-child>
                            <Button variant="outline">
                                <Pencil />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle>
                                Edit User of ID {{ user.id }}
                            </DialogTitle>
                            <form class="grid gap-3">
                                <FormField>
                                    <Label for="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="text"
                                        v-model="email"
                                        v-bind="emailAttrs"
                                        :default-value="user.email"
                                    />
                                    <span
                                        class="text-red-500"
                                        v-if="errors.email"
                                    >
                                        {{ errors.email }}
                                    </span>
                                </FormField>
                                <FormField>
                                    <Label for="email">Scope</Label>
                                    <Select :default-value="user.scope" v-model="scope" v-bind="scopeAttrs">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a scope" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">
                                                User
                                            </SelectItem>
                                            <SelectItem value="vendor">
                                                Vendor
                                            </SelectItem>
                                            <SelectItem value="support">
                                                Support
                                            </SelectItem>
                                            <SelectItem value="admin">
                                                Admin
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span
                                        class="text-red-500"
                                        v-if="errors.scope"
                                    >
                                        {{ errors.scope }}
                                    </span>
                                </FormField>
                                <FormField>
                                    Gender: 
                                        <Select :default-value="user.gender" v-model="gender">
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
                                </FormField>
                                <DialogFooter>
                                    <Button>Edit</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TableCell>
                <TableCell>
                    <Button variant="outline">
                        <Eraser />
                    </Button>
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>
