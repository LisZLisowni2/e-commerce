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
import { useProducts } from "@/composables/useProducts";
import { useUsers } from "@/composables/useUsers";
import type { User } from "@/types/User";
import { Eraser, Pencil, Plus, Search } from "@lucide/vue";
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
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import api from "@/api";
import { computed, ref } from "vue";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategoriesFlat } from "@/composables/useCategories";

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const categorySchema = z.object({
    name: z.string().optional(),
    parent_id: z.coerce.number().positive().nullable().optional(),
})

type categorySchemaType = z.infer<typeof categorySchema>

const addCategorySchema = z.object({
    name: z.string({ message: "Name is required" }).min(1, { message: "Name is required" }),
    parent_id: z.coerce.number().positive().nullable().optional(),
})

type addCategoryType = z.infer<typeof addCategorySchema>

const editForm = useForm<categorySchemaType>({
    validationSchema: toTypedSchema(categorySchema)
})

const { handleSubmit, defineField, errors } = editForm

const addForm = useForm<addCategoryType>({
    validationSchema: toTypedSchema(addCategorySchema)
})

const { handleSubmit: addHandleSubmit, defineField: addDefineField, errors: addErrors } = addForm

const [name, nameAttrs] = defineField("name")
const [parentID, parentIDAttrs] = defineField("parent_id")

const [addName, addNameAttrs] = addDefineField("name")
const [addParentID, addParentIDAttrs] = addDefineField("parent_id")

const queryClient = useQueryClient()

const editGlobalMessage = ref("")
const addGlobalMessage = ref("")

const { mutate: updateMutation } = useMutation({
    mutationFn: async (credentials: categorySchemaType & {
        id: number
    }) => {
        const { data } = await api.put(`/categories/${credentials.id}`, credentials)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
        editGlobalMessage.value = "Update successful"
    }
})

const { mutate: deleteMutation } = useMutation({
    mutationFn: async (id: number) => {
        const { data } = await api.delete(`/categories/${id}`)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const { mutate: createMutation } = useMutation({
    mutationFn: async (credentials: addCategoryType) => {
        const { data } = await api.post(`/categories`, credentials)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
        addGlobalMessage.value = "Addition successful"
    }
})

const selectedCategory = ref<number>(-1)

const onSubmit = handleSubmit((values) => {
    editGlobalMessage.value = ""
    if (selectedCategory.value < 0) return;

    updateMutation({
        ...values,
        id: selectedCategory.value
    })
})

const onAddSubmit = addHandleSubmit((values) => {
    addGlobalMessage.value = ""

    createMutation(values)
})

const onDelete = (productID: number) => {
    deleteMutation(productID)
}

const { data, isLoading } = useCategoriesFlat();

const filterInput = ref("")

const filteredData = computed(() => {
    return data.value?.categories.filter((category) => {
        return category.name.toLowerCase().startsWith(filterInput.value.toLocaleLowerCase())
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
                        <Plus />
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>
                        Add Product
                    </DialogTitle>
                    <form @submit.prevent="onAddSubmit" enctype="multipart/form-data" class="grid gap-3">
                        <FormField>
                            <Label for="add-name">Name</Label>
                            <Input 
                                id="add-name"
                                v-model="addName"
                                v-bind="addNameAttrs"
                                type="text"
                            />
                            <p class="text-red-500" v-if="addErrors.name">
                                {{ addErrors.name }}
                            </p>
                        </FormField>
                        <FormField>
                            <Label for="parent_id">Parent</Label>
                            <Select v-model="addParentID" v-bind="addParentIDAttrs">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parent" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key="null" :value="null">None</SelectItem>
                                    <SelectItem v-for="category in data?.categories" :key="category.id" :value="String(category.id)">
                                        {{ category.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <span
                                class="text-red-500"
                                v-if="addErrors.parent_id"
                            >
                                {{ addErrors.parent_id }}
                            </span>
                        </FormField>
                        <DialogFooter>
                            <div class="flex flex-col gap-3">
                                <Button>Add</Button>
                                <span class="text-green-500">{{ addGlobalMessage }}</span>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
        <ScrollArea class="w-full whitespace-nowrap">
            <Table>
                <TableCaption>A list of categories</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Parent ID</TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="category in filteredData">
                        <TableCell>{{ category.id }}</TableCell>
                        <TableCell>{{ category.name }}</TableCell>
                        <TableCell>{{ category.slug }}</TableCell>
                        <TableCell>{{ category.parent_id }}</TableCell>
                        <TableCell>
                            <Dialog>
                                <DialogTrigger as-child>
                                    <Button variant="outline" @click="selectedCategory = category.id">
                                        <Pencil />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>
                                        Edit category of ID {{ category.id }}
                                    </DialogTitle>
                                    <form @submit.prevent="onSubmit" enctype="multipart/form-data" class="grid gap-3">
                                        <FormField>
                                        <Label for="name">Name</Label>
                                        <Input 
                                            id="name"
                                            v-model="name"
                                            v-bind="nameAttrs"
                                            type="text"
                                            :default-value="category.name"
                                        />
                                        <p class="text-red-500" v-if="errors.name">
                                            {{ errors.name }}
                                        </p>
                                    </FormField>
                                    <FormField>
                                        <Label for="parent_id">Parent</Label>
                                        <Select v-model="parentID" v-bind="parentIDAttrs" :default-value="String(category.parent_id)">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a parent" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem key="null" :value="null">None</SelectItem>
                                                <SelectItem v-for="category in data?.categories" :key="category.id" :value="String(category.id)">
                                                    {{ category.name }}
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <span
                                            class="text-red-500"
                                            v-if="errors.parent_id"
                                        >
                                            {{ errors.parent_id }}
                                        </span>
                                    </FormField>
                                    <DialogFooter>
                                        <div class="flex flex-col gap-3">
                                            <Button>Edit</Button>
                                            <span class="text-green-500">{{ editGlobalMessage }}</span>
                                        </div>
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
                                        Deletion of category of ID {{ category.id }}
                                    </DialogTitle>
                                    Are you sure?
                                    <DialogFooter>
                                        <DialogClose class="flex gap-3">
                                            <Button variant="destructive" @click="onDelete(category.id)">Yes</Button>
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
