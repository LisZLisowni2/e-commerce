<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'unique:users'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::create([...$data, 'password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'User created successfully'], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'User with that email does not exist',
            ], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid password',
            ], 422);
        }

        $token = $user->createToken('token')->plainTextToken;

        return response()->json(['token' => $token]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function show(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    public function updateEmail(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'current_password' => ['required'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Invalid password'], 422);
        }

        $user->update(['email' => $data['email']]);

        return response()->json(['message' => 'Email updated successfully']);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'confirmed', 'min:8'],
            'current_password' => ['required'],
        ]);

        $user = $request->user();

        if (! Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Invalid password'], 422);
        }

        $user->update(['password' => Hash::make($data['password'])]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function updatePersonal(Request $request): JsonResponse
    {
        $data = $request->validate([
            'firstname' => ['required', 'string', 'max:255'],
            'lastname' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^\+?[1-9]\d{7,14}$/'],
            'dateofbirth' => ['required', 'date'],
            'gender' => ['required', 'string', 'in:man,woman,nonbinary'],
        ]);

        $request->user()->update([
            'first_name' => $data['firstname'],
            'last_name' => $data['lastname'],
            'phone' => $data['phone'],
            'date_of_birth' => $data['dateofbirth'],
            'gender' => $data['gender'],
        ]);

        return response()->json(['message' => 'Personal information updated successfully']);
    }
}
