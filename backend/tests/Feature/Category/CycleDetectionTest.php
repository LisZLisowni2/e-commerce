<?php

use App\Models\Category;
use App\Models\User;
use App\ScopeEnum;

test('admin cannot move a category under its direct child', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $parent = Category::factory()->create();
    $child = Category::factory()->create(['parent_id' => $parent->id]);

    $response = $this->actingAs($admin)->putJson("/api/categories/{$parent->id}", [
        'parent_id' => $child->id,
    ]);

    $response->assertStatus(409);
    expect($response->json('message'))->toBe('Cycle in tree detected while update');
    expect($parent->fresh()->parent_id)->toBeNull();
});

test('admin cannot move a category under a deeper descendant', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $root = Category::factory()->create();
    $child = Category::factory()->create(['parent_id' => $root->id]);
    $grandchild = Category::factory()->create(['parent_id' => $child->id]);

    $response = $this->actingAs($admin)->putJson("/api/categories/{$root->id}", [
        'parent_id' => $grandchild->id,
    ]);

    $response->assertStatus(409);
    expect($response->json('message'))->toBe('Cycle in tree detected while update');
    expect($root->fresh()->parent_id)->toBeNull();
});

test('admin can move a category under a sibling', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $root = Category::factory()->create();
    $a = Category::factory()->create(['parent_id' => $root->id]);
    $b = Category::factory()->create(['parent_id' => $root->id]);

    $response = $this->actingAs($admin)->putJson("/api/categories/{$a->id}", [
        'parent_id' => $b->id,
    ]);

    $response->assertStatus(200);
    expect($response->json('category.parent_id'))->toBe($b->id);
    expect($a->fresh()->parent_id)->toBe($b->id);
});

test('admin can move a category to the root level', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $root = Category::factory()->create();
    $a = Category::factory()->create(['parent_id' => $root->id]);

    $response = $this->actingAs($admin)->putJson("/api/categories/{$a->id}", [
        'parent_id' => null,
    ]);

    $response->assertStatus(200);
    expect($response->json('category.parent_id'))->toBeNull();
    expect($a->fresh()->parent_id)->toBeNull();
});

test('admin cannot update a category when the tree already contains a cycle', function () {
    $admin = User::factory()->create(['scope' => ScopeEnum::ADMIN]);
    $a = Category::factory()->create();
    $b = Category::factory()->create(['parent_id' => $a->id]);
    $a->update(['parent_id' => $b->id]);

    $response = $this->actingAs($admin)->putJson("/api/categories/{$a->id}", [
        'name' => 'Corrupted',
    ]);

    $response->assertStatus(409);
    expect($response->json('message'))->toBe('Cycle in tree detected while update');
    expect($a->fresh()->name)->not->toBe('Corrupted');
});
