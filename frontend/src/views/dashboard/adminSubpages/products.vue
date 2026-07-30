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
import { Eraser, Pencil } from "@lucide/vue";
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
import { ref } from "vue";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const productSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0).optional(),
    quantity: z.coerce.number().int().positive().optional(),
    imageURL: z.string().optional(),
    last30DaysPrice: z.coerce.number().min(0).optional(),
})

type productSchemaType = z.infer<typeof productSchema>

const { handleSubmit, defineField, errors } = useForm<productSchemaType>({
    validationSchema: toTypedSchema(productSchema)
})

const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [price, priceAttrs] = defineField('price')
const [quantity, quantityAttrs] = defineField('quantity')
const [imageURL, imageURLAttrs] = defineField('imageURL')
const [last30DaysPrice, last30DaysPriceAttrs] = defineField('last30DaysPrice')

const queryClient = useQueryClient()

const { mutate: updateMutation } = useMutation({
    mutationFn: async (credentials: productSchemaType & {
        id: number
    }) => {
        const { data } = await api.put(`/products/${credentials.id}`, credentials)
        return data
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

const selectedProduct = ref<number>(-1)

const onSubmit = handleSubmit((values) => {
    if (selectedProduct.value < 0) return;

    updateMutation({
        ...values,
        id: selectedProduct.value
    })
})

const onDelete = (productID: number) => {
    deleteMutation(productID)
}

const { data, isLoading } = useProducts();
</script>

<template>
    <h1 v-if="isLoading">Loading...</h1>
    <ScrollArea class="w-full whitespace-nowrap">
        <Table>
            <TableCaption>A list of products</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Vendor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Image URL</TableHead>
                    <TableHead>Last 30 Days Price</TableHead>
                    <TableHead>Created at</TableHead>
                    <TableHead>Updated at</TableHead>
                    <TableHead></TableHead>
                    <TableHead></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow v-for="product in data">
                    <TableCell>{{ product.id }}</TableCell>
                    <TableCell>{{ product.vendor_id }}</TableCell>
                    <TableCell>{{ product.name }}</TableCell>
                    <TableCell>{{ product.description }}</TableCell>
                    <TableCell>{{ product.price }}</TableCell>
                    <TableCell>{{ product.quantity }}</TableCell>
                    <TableCell>{{ product.imageURL }}</TableCell>
                    <TableCell>{{ product.last30DaysPrice }}</TableCell>
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
                                        <Label for="imageURL">Image URL</Label>
                                        <Input
                                            id="imageURL"
                                            type="text"
                                            v-model="imageURL"
                                            v-bind="imageURLAttrs"
                                            :default-value="product.imageURL"
                                        />
                                        <span
                                            class="text-red-500"
                                            v-if="errors.imageURL"
                                        >
                                            {{ errors.imageURL }}
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
</template>
