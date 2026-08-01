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
import { useAuthStore } from "@/stores/useAuthStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories, useCategoriesFlat } from "@/composables/useCategories";

const authStore = useAuthStore();

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const productSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    quantity: z.coerce.number().int().positive().optional(),
    image: 
        z.any()
            .refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size if 5MB")
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg, .jpeg, .png and .webp formats are supported.")
            .optional(),
    last30DaysPrice: z.coerce.number().min(0).optional(),
    category_id: z.coerce.number().positive().optional(),
})

type productSchemaType = z.infer<typeof productSchema>

const addProductSchema = z.object({
    name: z.string({ message: "Name is required" }).min(1, { message: "Name is required" }),
    description: z.string({ message: "Description is required" }).min(1, { message: "Description is required" }),
    price: z.coerce.number({ message: "Number must be greater than 0" }).min(0, { message: "Number must be greater than 0" }),
    quantity: z.coerce.number({ message: "Number must be greater than 0" }).int().positive({ message: "Number must be greater than 0" }),
    image: 
        z.any()
            .refine((file) => file?.size <= MAX_FILE_SIZE, "Max image size if 5MB")
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file?.type), "Only .jpg, .jpeg, .png and .webp formats are supported."),
    last30DaysPrice: z.coerce.number({ message: "Number must be greater than 0" }).min(0).optional(),
    category_id: z.coerce.number({ message: "Category is required" }).min(1, { message: "Category is required" }),
})

type addProductSchemaType = z.infer<typeof addProductSchema>

const editForm = useForm<productSchemaType>({
    validationSchema: toTypedSchema(productSchema)
})

const { handleSubmit, defineField, errors } = editForm

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [price, priceAttrs] = defineField('price')
const [quantity, quantityAttrs] = defineField('quantity')
const [image, imageAttrs] = defineField('image')
const [last30DaysPrice, last30DaysPriceAttrs] = defineField('last30DaysPrice')
const [categoryId, categoryIdAttrs] = defineField('category_id')

const addForm = useForm<addProductSchemaType>({
    validationSchema: toTypedSchema(addProductSchema)
})

const { errors: addErrors } = addForm

const [addName, addNameAttrs] = addForm.defineField('name')
const [addDescription, addDescriptionAttrs] = addForm.defineField('description')
const [addPrice, addPriceAttrs] = addForm.defineField('price')
const [addQuantity, addQuantityAttrs] = addForm.defineField('quantity')
const [addImage, addImageAttrs] = addForm.defineField('image')
const [addLast30DaysPrice, addLast30DaysPriceAttrs] = addForm.defineField('last30DaysPrice')
const [addCategoryId, addCategoryIdAttrs] = addForm.defineField('category_id')

const queryClient = useQueryClient()

const { mutate: updateMutation } = useMutation({
    mutationFn: async (credentials: productSchemaType & {
        id: number
    }) => {
        if (credentials.image) {
            const formData = new FormData()
            formData.append('image', credentials.image)
            
            if (credentials.name) formData.append('name', credentials.name)
            if (credentials.description) formData.append('description', credentials.description)
            if (credentials.price !== undefined) formData.append('price', String(credentials.price))
            if (credentials.quantity !== undefined) formData.append('quantity', String(credentials.quantity))
            if (credentials.last30DaysPrice !== undefined) formData.append('last30DaysPrice', String(credentials.last30DaysPrice))
            if (credentials.category_id !== undefined) formData.append('category_id', String(credentials.category_id))
    
            // Laravel needs method spoofing for PUT + multipart form data
            formData.append('_method', 'PUT')
    
            const { data } = await api.put(`/products/${credentials.id}`, formData)
            return data
        } else {
            const { data } = await api.put(`/products/${credentials.id}`, credentials)
            return data
        }
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const { mutate: deleteMutation } = useMutation({
    mutationFn: async (id: number) => {
        const { data } = await api.delete(`/products/${id}`)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const { mutate: createMutation } = useMutation({
    mutationFn: async (credentials: addProductSchemaType) => {
        const formData = new FormData()
        formData.append('name', credentials.name)
        formData.append('description', credentials.description)
        formData.append('price', String(credentials.price))
        formData.append('quantity', String(credentials.quantity))
        formData.append('image', credentials.image) // actual File object
        formData.append('category_id', String(credentials.category_id))

        if (credentials.last30DaysPrice !== undefined) {
            formData.append('last30DaysPrice', String(credentials.last30DaysPrice))
        }
        const { data } = await api.post(`/products`, formData)
        return data
    },
    onSuccess: () => {
        queryClient.invalidateQueries()
    }
})

const selectedProduct = ref<number>(-1)

const onSubmit = handleSubmit((values) => {
    if (selectedProduct.value < 0) return;

    updateMutation({
        ...values,
        id: selectedProduct.value
    })
})

const onAddSubmit = addForm.handleSubmit((values) => {
    createMutation(values)
})

const onDelete = (productID: number) => {
    deleteMutation(productID)
}

const { data, isLoading } = useProducts(authStore.user?.id);
const { data: categoryData } = useCategoriesFlat();

const filterInput = ref("")

const filteredData = computed(() => {
    return data.value?.filter((product) => {
        return product.name.toLowerCase().startsWith(filterInput.value.toLocaleLowerCase())
    })
})

function handleFileChangesAdd(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0]
    addImage.value = file
}

function handleFileChanges(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0]
    image.value = file
}

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
                    <form @submit.prevent="onAddSubmit" class="grid gap-3">
                        <FormField>
                            <Label for="add-name">Name</Label>
                            <Input
                                id="add-name"
                                type="text"
                                v-model="addName"
                                v-bind="addNameAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.name"
                            >
                                {{ addErrors.name }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-description">Description</Label>
                            <Input
                                id="add-description"
                                type="text"
                                v-model="addDescription"
                                v-bind="addDescriptionAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.description"
                            >
                                {{ addErrors.description }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-price">Price</Label>
                            <Input
                                id="add-price"
                                type="text"
                                v-model="addPrice"
                                v-bind="addPriceAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.price"
                            >
                                {{ addErrors.price }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-quantity">Quantity</Label>
                            <Input
                                id="add-quantity"
                                type="text"
                                v-model="addQuantity"
                                v-bind="addQuantityAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.quantity"
                            >
                                {{ addErrors.quantity }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-image">Image</Label>
                            <input
                                id="add-image"
                                type="file"
                                class="border rounded-xl p-2 max-w-sm"
                                @change="handleFileChangesAdd"
                                v-bind="addImageAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.image"
                            >
                                {{ addErrors.image }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-last30DaysPrice">Last 30 Days Price</Label>
                            <Input
                                id="add-last30DaysPrice"
                                type="text"
                                v-model="addLast30DaysPrice"
                                v-bind="addLast30DaysPriceAttrs"
                            />
                            <span
                                class="text-red-500"
                                v-if="addErrors.last30DaysPrice"
                            >
                                {{ addErrors.last30DaysPrice }}
                            </span>
                        </FormField>
                        <FormField>
                            <Label for="add-category">Category</Label>
                            <Select v-model="addCategoryId" v-bind="addCategoryIdAttrs">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem v-for="category in categoryData?.categories" :key="category.id" :value="String(category.id)">
                                        {{ category.name }}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <span
                                class="text-red-500"
                                v-if="addErrors.category_id"
                            >
                                {{ addErrors.category_id }}
                            </span>
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
                <TableCaption>A list of products</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Image URL</TableHead>
                        <TableHead>Last 30 Days Price</TableHead>
                        <TableHead>Category ID</TableHead>
                        <TableHead>Created at</TableHead>
                        <TableHead>Updated at</TableHead>
                        <TableHead></TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="product in filteredData">
                        <TableCell>{{ product.id }}</TableCell>
                        <TableCell>{{ product.name }}</TableCell>
                        <TableCell>{{ product.description.substring(0, 100) }}</TableCell>
                        <TableCell>{{ product.price }}</TableCell>
                        <TableCell>{{ product.quantity }}</TableCell>
                        <TableCell>{{ product.imageURL }}</TableCell>
                        <TableCell>{{ product.last30DaysPrice }}</TableCell>
                        <TableCell>{{ product.category_id }}</TableCell>
                        <TableCell>{{ product.created_at }}</TableCell>
                        <TableCell>{{ product.updated_at }}</TableCell>
                        <TableCell>
                            <Dialog>
                                <DialogTrigger as-child>
                                    <Button variant="outline" @click="selectedProduct = product.id">
                                        <Pencil />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogTitle>
                                        Edit Product of ID {{ product.id }}
                                    </DialogTitle>
                                    <form @submit.prevent="onSubmit" class="grid gap-3">
                                        <FormField>
                                            <Label for="name">Name</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                v-model="name"
                                                v-bind="nameAttrs"
                                                :default-value="product.name"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.name"
                                            >
                                                {{ errors.name }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="description">Description</Label>
                                            <Input
                                                id="description"
                                                type="text"
                                                v-model="description"
                                                v-bind="descriptionAttrs"
                                                :default-value="product.description"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.description"
                                            >
                                                {{ errors.description }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="price">Price</Label>
                                            <Input
                                                id="price"
                                                type="text"
                                                v-model="price"
                                                v-bind="priceAttrs"
                                                :default-value="product.price"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.price"
                                            >
                                                {{ errors.price }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="quantity">Quantity</Label>
                                            <Input
                                                id="quantity"
                                                type="text"
                                                v-model="quantity"
                                                v-bind="quantityAttrs"
                                                :default-value="product.quantity"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.quantity"
                                            >
                                                {{ errors.quantity }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="image">New image</Label>
                                            <input
                                                id="image"
                                                type="file"
                                                class="border rounded-xl p-2 max-w-sm"
                                                @change="handleFileChanges"
                                                v-bind="imageAttrs"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.image"
                                            >
                                                {{ errors.image }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="last30DaysPrice">Last 30 Days Price</Label>
                                            <Input
                                                id="last30DaysPrice"
                                                type="text"
                                                v-model="last30DaysPrice"
                                                v-bind="last30DaysPriceAttrs"
                                                :default-value="product.last30DaysPrice"
                                            />
                                            <span
                                                class="text-red-500"
                                                v-if="errors.last30DaysPrice"
                                            >
                                                {{ errors.last30DaysPrice }}
                                            </span>
                                        </FormField>
                                        <FormField>
                                            <Label for="category">Category</Label>
                                            <Select v-model="categoryId" v-bind="categoryIdAttrs" :default-value="String(product.category_id)">
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem v-for="category in categoryData?.categories" :key="category.id" :value="String(category.id)">
                                                        {{ category.name }}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <span
                                                class="text-red-500"
                                                v-if="errors.category_id"
                                            >
                                                {{ errors.category_id }}
                                            </span>
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
                                        Deletion of product of ID {{ product.id }}
                                    </DialogTitle>
                                    Are you sure?
                                    <DialogFooter>
                                        <DialogClose class="flex gap-3">
                                            <Button variant="destructive" @click="onDelete(product.id)">Yes</Button>
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
