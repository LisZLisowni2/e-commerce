<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// ─── Update Email ───

test('update email successfully', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/email', [
        'email' => 'newemail@example.com',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJson(['message' => 'Email updated successfully']);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => 'newemail@example.com',
    ]);
});

test('update email fails with invalid password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/email', [
        'email' => 'newemail@example.com',
        'current_password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
        ->assertJson(['message' => 'Invalid password']);
});

test('update email fails with invalid email', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/email', [
        'email' => 'not-an-email',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('update email fails with duplicate email', function () {
    User::factory()->create(['email' => 'taken@example.com']);

    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/email', [
        'email' => 'taken@example.com',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('unauthorized update email', function () {
    $response = $this->putJson('/api/user/email', [
        'email' => 'newemail@example.com',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(401);
});

// ─── Update Password ───

test('update password successfully', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/password', [
        'password' => 'newpassword456',
        'password_confirmation' => 'newpassword456',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJson(['message' => 'Password updated successfully']);

    $user->refresh();
    expect(Hash::check('newpassword456', $user->password))->toBeTrue();
});

test('update password fails with invalid current password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/password', [
        'password' => 'newpassword456',
        'password_confirmation' => 'newpassword456',
        'current_password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
        ->assertJson(['message' => 'Invalid password']);
});

test('update password fails with short password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/password', [
        'password' => 'short',
        'password_confirmation' => 'short',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('password');
});

test('update password fails without confirmation', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/password', [
        'password' => 'newpassword456',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('password');
});

test('unauthorized update password', function () {
    $response = $this->putJson('/api/user/password', [
        'password' => 'newpassword456',
        'password_confirmation' => 'newpassword456',
        'current_password' => 'password123',
    ]);

    $response->assertStatus(401);
});

// ─── Update Personal ───

test('update personal info successfully', function () {
    $user = User::factory()->create();

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/personal', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'phone' => '+48123456789',
        'dateofbirth' => '1990-05-15',
        'gender' => 'man',
    ]);

    $response->assertStatus(200)
        ->assertJson(['message' => 'Personal information updated successfully']);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'phone' => '+48123456789',
        'gender' => 'man',
    ]);
});

test('update personal fails with missing fields', function () {
    $user = User::factory()->create();

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/personal', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['firstname', 'lastname', 'phone', 'dateofbirth', 'gender']);
});

test('update personal fails with invalid phone', function () {
    $user = User::factory()->create();

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/personal', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'phone' => 'abc',
        'dateofbirth' => '1990-05-15',
        'gender' => 'man',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('phone');
});

test('update personal fails with invalid gender', function () {
    $user = User::factory()->create();

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/personal', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'phone' => '+48123456789',
        'dateofbirth' => '1990-05-15',
        'gender' => 'invalid',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('gender');
});

test('update personal fails with invalid date', function () {
    $user = User::factory()->create();

    $token = $user->createToken('test-token')->plainTextToken;

    $response = $this->withToken($token)->putJson('/api/user/personal', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'phone' => '+48123456789',
        'dateofbirth' => 'not-a-date',
        'gender' => 'man',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors('dateofbirth');
});

test('unauthorized update personal', function () {
    $response = $this->putJson('/api/user/personal', [
        'firstname' => 'John',
        'lastname' => 'Doe',
        'phone' => '+48123456789',
        'dateofbirth' => '1990-05-15',
        'gender' => 'man',
    ]);

    $response->assertStatus(401);
});
