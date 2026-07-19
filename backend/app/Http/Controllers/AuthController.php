<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse {
        $data = $request->validate([
            'email'    => ['required', 'email', 'unique:users'],
            'password' => ['required', 'confirmed', 'min:8'],
        ]);

        $user = User::create([...$data, 'password' => Hash::make($data['password'])]);
        
        return response()->json(["message" => "User created successfully"], 201);
    }

    public function login(Request $request): JsonResponse {
        $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'min:8']
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'User with that email does not exist'
            ], 422);
        }

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid password'
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
}
