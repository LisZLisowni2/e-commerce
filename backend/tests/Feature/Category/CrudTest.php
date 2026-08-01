<?php

use App\Models\Category;
use App\Models\User;
use App\ScopeEnum;

test('unauthenticated user can list top-level categories', function () {
    $parent = Category::factory()->create();
    Category::factory()->create(['parent_id' => $parent->id]);

    $response = $this->getJson('/api/categories');

    $response->assertStatus(200);
    expect(count($response->json('categories')))->toBe(1);
    expect($response->json('categories.0.id'))->toBe($parent->id);
    expect(count($response->json('categories.0.children_recursive')))->toBe(1);
});

test('categories can be listed flat', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->create(['parent_id' => $parent->id]);

    $response = $this->getJson('/api/categories?flat=true');

    $response->assertStatus(200);
    expect(count($response->json('categories')))->toBe(2);
    expect(collect($response->json('categories'))->pluck('id'))->toContain($child->id);
});

test('unauthenticated user can view single category with its subcategories', function () {
    $parent = Category::factory()->create();
    $child = Category::factory()->create(['parent_id' => $parent->id]);

    $response = $this->getJson("/api/categories/{$parent->id}");

    $response->assertStatus(200);
    expect($response->json('category.id'))->toBe($parent->id);
    expect(count($response->json('subCategories')))->toBe(1);
    expect($response->json('subCategories.0.id'))->toBe($child->id);
});

test('unauthenticated user cannot create a category', function () {
    $response = $this->postJson('/api/categories', [
        'name' => 'New Category',
    ]);

    $response->assertStatus(401);
});

test('user role cannot create a category', function () {
    $user = User::factory()->create(['scope' => ScopeEnum::USER]);

    $response = $this->actingAs($user)->postJson('/api/categories', [
        'name' => 'New Category',
    ]);

    $response->assertStatus(403);
});

test('vendor role cannot create a category', function () {
    $vendor = User::factory()->create(['scope' => ScopeEnum::VENDOR]);

    $response = $this->actingAs($vendor)->postJson('/api/categories', [
        'name' => 'New Category',
    ]);

    $response->assertStatus(403);
});

test('support role cannot create a category', function () {
    $support = User::factory()->create(['scope' => ScopeEnum::SUPPORT]);

    $response = $this->actingAs($support)->postJson('/api/categories', [
        'name' => 'New Category',
    ]);

    $response->assertStatus(403);
});

test('admin can create a category with a generated slug', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);

    $response = $this->actingAs($admin)->postJson('/api/categories', [
        'name' => 'Laptops & Notebooks',
    ]);

    $response->assertStatus(201);
    expect($response->json('category.name'))->toBe('Laptops & Notebooks');
    expect($response->json('category.slug'))->toBe('laptops-notebooks');
    expect(Category::count())->toBe(1);
});

test('admin can create a subcategory', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $parent = Category::factory()->create();

    $response = $this->actingAs($admin)->postJson('/api/categories', [
        'name' => 'Gaming Laptops',
        'parent_id' => $parent->id,
    ]);

    $response->assertStatus(201);
    expect($response->json('category.parent_id'))->toBe($parent->id);
});

test('superadmin can create a category', function () {
    $superadmin = User::factory()->create(['scope' => ScopeEnum::SUPERADMIN]);

    $response = $this->actingAs($superadmin)->postJson('/api/categories', [
        'name' => 'Servers',
    ]);

    $response->assertStatus(201);
    expect($response->json('category.slug'))->toBe('servers');
});

test('creating a category requires a name', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);

    $response = $this->actingAs($admin)->postJson('/api/categories', []);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['name']);
});

test('creating a category rejects a non-existent parent', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);

    $response = $this->actingAs($admin)->postJson('/api/categories', [
        'name' => 'Orphans',
        'parent_id' => 9999,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['parent_id']);
});

test('admin can update a category name and regenerate its slug', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $category = Category::factory()->create(['name' => 'Laptops', 'slug' => 'laptops']);

    $response = $this->actingAs($admin)->putJson("/api/categories/{$category->id}", [
        'name' => 'Gaming Laptops',
    ]);

    $response->assertStatus(200);
    expect($response->json('category.name'))->toBe('Gaming Laptops');
    expect($response->json('category.slug'))->toBe('gaming-laptops');
});

test('admin cannot set a category as its own parent', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->putJson("/api/categories/{$category->id}", [
        'parent_id' => $category->id,
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['parent_id']);
});

test('user role cannot update a category', function () {
    $user = User::factory()->create(['scope' => ScopeEnum::USER]);
    $category = Category::factory()->create();

    $response = $this->actingAs($user)->putJson("/api/categories/{$category->id}", [
        'name' => 'Hijacked',
    ]);

    $response->assertStatus(403);
});

test('admin can delete a category', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $category = Category::factory()->create();

    $response = $this->actingAs($admin)->deleteJson("/api/categories/{$category->id}");

    $response->assertStatus(204);
    expect(Category::count())->toBe(0);
});

test('superadmin can delete a category', function () {
    $superadmin = User::factory()->create(['scope' => ScopeEnum::SUPERADMIN]);
    $category = Category::factory()->create();

    $response = $this->actingAs($superadmin)->deleteJson("/api/categories/{$category->id}");

    $response->assertStatus(204);
    expect(Category::count())->toBe(0);
});

test('vendor role cannot delete a category', function () {
    $vendor = User::factory()->create(['scope' => ScopeEnum::VENDOR]);
    $category = Category::factory()->create();

    $response = $this->actingAs($vendor)->deleteJson("/api/categories/{$category->id}");

    $response->assertStatus(403);
});
