<script setup lang="ts">
    import { 
        Table,
        TableBody,
        TableCaption,
        TableCell,
        TableHeader,
        TableHead,
        TableRow 
    } from '@/components/ui/table';
    import { useUsers } from '@/composables/useUsers';
import { Eraser, Pencil } from '@lucide/vue';

    const { data, isLoading } = useUsers();
</script>

<template>
    <h1 v-if="isLoading">Loading...</h1>
    <Table v-else>
        <TableCaption>A list of users</TableCaption>
        <TableBody>
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
            <TableRow v-for="user in data.users">
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
                    <Pencil />
                </TableCell>
                <TableCell>
                    <Eraser />
                </TableCell>
            </TableRow>
        </TableBody>
    </Table>
</template>