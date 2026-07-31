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
import { CalendarIcon, Eraser, Pencil, Search, UserPlus } from "@lucide/vue";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FormField from "@/components/ui/FormField.vue";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import * as z from "zod"
import { useForm, useField } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { fromDate, getLocalTimeZone, type DateValue } from "@internationalized/date";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Calendar from "@/components/ui/calendar/Calendar.vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import api from "@/api";
import { computed, ref } from "vue";
import { useAuthStore } from "@/stores/useAuthStore";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const userSchema = z.object({
    email: z.string().email(),
    scope: z.string(),
    status: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, { message: "Must be a valid phone number" }).optional(),
    date_of_birth: z.custom<DateValue>((val) => val !== null && val !== undefined, {
        message: "Please select a date",
    }).transform((val) => val.toDate(getLocalTimeZone())).optional(),
    gender: z.string().optional()
})

type userSchemaType = z.infer<typeof userSchema>

const addUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    scope: z.string(),
    status: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    phone: z.string().regex(/^\+?[1-9]\d{7,14}$/, { message: "Must be a valid phone number" }).optional(),
    date_of_birth: z.custom<DateValue>((val) => val !== null && val !== undefined, {
        message: "Please select a date",
    }).transform((val) => val.toDate(getLocalTimeZone())).optional(),
    gender: z.string().optional()
})

type addUserSchemaType = z.infer<typeof addUserSchema>

const editForm = useForm<userSchemaType>({
    validationSchema: toTypedSchema(userSchema)
})

const { handleSubmit, defineField, errors } = editForm

const [email, emailAttrs] = defineField('email')
const [scope, scopeAttrs] = defineField('scope')
const [status, statusAttrs] = defineField('status')
const [firstname, firstnameAttrs] = defineField('first_name')
const [lastname, lastnameAttrs] = defineField('last_name')
const [phone, phoneAttrs] = defineField('phone')
const [gender, genderAttrs] = defineField('gender')

const { value: dateOfBirth } = useField<DateValue>('date_of_birth', undefined, { form: editForm })

const addForm = useForm<addUserSchemaType>({
    validationSchema: toTypedSchema(addUserSchema)
})

const { errors: addErrors } = addForm

const [addEmail, addEmailAttrs] = addForm.defineField('email')
const [addPassword, addPasswordAttrs] = addForm.defineField('password')
const [addScope, addScopeAttrs] = addForm.defineField('scope')
const [addStatus, addStatusAttrs] = addForm.defineField('status')
const [addFirstname, addFirstnameAttrs] = addForm.defineField('first_name')
const [addLastname, addLastnameAttrs] = addForm.defineField('last_name')
const [addPhone, addPhoneAttrs] = addForm.defineField('phone')
const [addGender, addGenderAttrs] = addForm.defineField('gender')

const { value: addDateOfBirth } = useField<DateValue>('date_of_birth', undefined, { form: addForm })

const authStore = useAuthStore()
const queryClient = useQueryClient()

const { mutate: updateMutation } = useMutation({
    mutationFn: async (credentials: userSchemaType & {
        id: number
    }) => {
        const { data } = await api.put(`/users/${credentials.id}`, credentials)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const { mutate: deleteMutation } = useMutation({
    mutationFn: async (id: number) => {
        const { data } = await api.delete(`/users/${id}`)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const { mutate: createMutation } = useMutation({
    mutationFn: async (credentials: addUserSchemaType) => {
        const { data } = await api.post(`/users`, credentials)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const selectedUser = ref<number>(-1)

const onSubmit = handleSubmit((values) => {
    if (selectedUser.value < 0) return;

    if (authStore.user?.scope !== "SUPERADMIN" && values.scope === "SUPERADMIN") return;

    updateMutation({
        ...values,
        id: selectedUser.value
    })
})

const onAddSubmit = addForm.handleSubmit((values) => {
    if (authStore.user?.scope !== "SUPERADMIN" && values.scope === "SUPERADMIN") return;

    createMutation(values)
})

const onDelete = (userID: number) => {
    if (userID === authStore.user?.id) return;

    deleteMutation(userID)
}

const { data, isLoading } = useUsers();

const filterInput = ref("")

const filteredData = computed(() => {
    return data.value?.users.filter((user) => {
        return user.email.toLowerCase().startsWith(filterInput.value.toLocaleLowerCase())
    })
})
</script>

<template>
    <h1 v-if="isLoading">Loading...</h1>
    <div v-else>
        <div class="flex items-center justify-between">
            <InputGroup class="max-w-sm">
                <InputGroupInput v-model="filterInput" placeholder="Search..." />
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
            </InputGroup>
            <Dialog>
                <DialogTrigger as-child>
                    <Button variant="outline">
                        <UserPlus />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>
                        Add User
                    </DialogTitle>
                    <form @submit.prevent="onAddSubmit" class="grid gap-3">
                        <FormField>
                            <Label for="add-email">Email</Label>
                            <Input
                                id="add-email"
                                type="text"
                                v-model="addEmail"
                                v-bind="addEmailAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.email"
                            >
                                {{ addErrors.email }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-password">Password</Label>
                            <Input
                                id="add-password"
                                type="password"
                                v-model="addPassword"
                                v-bind="addPasswordAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.password"
                            >
                                {{ addErrors.password }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-scope">Scope</Label>
                            <Select id="add-scope" v-model="addScope" v-bind="addScopeAttrs">
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
                                v-if="addErrors.scope"
                            >
                                {{ addErrors.scope }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-status">Status</Label>
                            <Select id="add-status" v-model="addStatus" v-bind="addStatusAttrs">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="banned">
                                        Banned
                                    </SelectItem>
                                    <SelectItem value="inactive">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <span
                                class="text-red-500"
                                v-if="addErrors.status"
                            >
                                {{ addErrors.status }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-firstname">Firstname</Label>
                            <Input
                                id="add-firstname"
                                type="text"
                                v-model="addFirstname"
                                v-bind="addFirstnameAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.first_name"
                            >
                                {{ addErrors.first_name }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-lastname">Lastname</Label>
                            <Input
                                id="add-lastname"
                                type="text"
                                v-model="addLastname"
                                v-bind="addLastnameAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.last_name"
                            >
                                {{ addErrors.last_name }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-phone">Phone</Label>
                            <Input
                                id="add-phone"
                                type="text"
                                v-model="addPhone"
                                v-bind="addPhoneAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.phone"
                            >
                                {{ addErrors.phone }}
                            </span>
                        </FormField>
                        <FormField>
                            Date Of Birth:
                            <Popover>
                                <PopoverTrigger as-child>
                                    <Button variant="outline">
                                        <CalendarIcon class="mr-2 h-4 w-4" />
                                        {{ addDateOfBirth ? addDateOfBirth.toString() : "Pick a date" }}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent class="w-auto p-0">
                                    <Calendar
                                        v-model="addDateOfBirth"
                                        :initial-focus="true"
                                        layout="month-and-year"
                                    />
                                </PopoverContent>
                            </Popover>
                            <p class="text-sm py-2 text-red-500" v-if="addErrors.date_of_birth">{{ addErrors.date_of_birth }}</p>
                        </FormField>
                        <FormField>
                            Gender:
                                <Select v-bind="addGenderAttrs" v-model="addGender">
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
                            <p class="text-sm py-2 text-red-500" v-if="addErrors.gender">{{ addErrors.gender }}</p>
                        </FormField>
                        <DialogFooter>
                            <Button>Add</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        <ScrollArea class="w-full whitespace-nowrap">
            <Table>
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
                    <TableRow v-for="user in filteredData">
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
                                    <Button variant="outline" @click="selectedUser = user.id">
                                        <Pencil />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>
                                        Edit User of ID {{ user.id }}
                                    </DialogTitle>
                                    <form @submit.prevent="onSubmit" class="grid gap-3">
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
                                            <Label for="scope">Scope</Label>
                                            <Select id="scope" :default-value="user.scope" v-model="scope" v-bind="scopeAttrs">
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
                                            <Label for="status">Status</Label>
                                            <Select id="status" :default-value="user.status" v-model="status" v-bind="statusAttrs">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">
                                                        Active
                                                    </SelectItem>
                                                    <SelectItem value="banned">
                                                        Banned
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span
                                                class="text-red-500"
                                                v-if="errors.status"
                                            >
                                                {{ errors.status }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="firstname">Firstname</Label>
                                            <Input
                                                id="firstname"
                                                type="text"
                                                v-model="firstname"
                                                v-bind="firstnameAttrs"
                                                :default-value="user.first_name"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.first_name"
                                            >
                                                {{ errors.first_name }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="lastname">Lastname</Label>
                                            <Input
                                                id="lastname"
                                                type="text"
                                                v-model="lastname"
                                                v-bind="lastnameAttrs"
                                                :default-value="user.last_name"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.last_name"
                                            >
                                                {{ errors.last_name }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="phone">Phone</Label>
                                            <Input
                                                id="phone"
                                                type="text"
                                                v-model="phone"
                                                v-bind="phoneAttrs"
                                                :default-value="user.phone"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.phone"
                                            >
                                                {{ errors.phone }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            Date Of Birth:
                                            <Popover>
                                                <PopoverTrigger as-child>
                                                    <Button variant="outline">
                                                        <CalendarIcon class="mr-2 h-4 w-4" />
                                                        {{ dateOfBirth ? dateOfBirth.toString() : "Pick a date" }}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent class="w-auto p-0">
                                                    <Calendar 
                                                        v-model="dateOfBirth"
                                                        :initial-focus="true"
                                                        :default-value="user.date_of_birth ? fromDate(new Date(user.date_of_birth), getLocalTimeZone()) : undefined"
                                                        layout="month-and-year"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <p class="text-sm py-2 text-red-500" v-if="errors.date_of_birth">{{ errors.date_of_birth }}</p>
                                        </FormField>
                                        <FormField>
                                            Gender: 
                                                <Select :default-value="user.gender" v-bind="genderAttrs" v-model="gender">
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
                            <Dialog>
                                <DialogTrigger as-child> 
                                    <Button variant="outline">
                                        <Eraser />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>
                                        Deletion of user of ID {{ user.id }}
                                    </DialogTitle>
                                    Are you sure?
                                    <DialogFooter>
                                        <DialogClose class="flex gap-3">
                                            <Button variant="destructive" @click="onDelete(user.id)">Yes</Button>
                                            <Button variant="outline">No</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    </div>
</template>
