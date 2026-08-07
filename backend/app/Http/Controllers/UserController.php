<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->boolean('paginated')) {
            return response()->json(["users" => User::query()->paginate(20)]);
        }

        return response()->json(["users" => User::all()]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'scope' => ['sometimes', 'string', 'in:user,admin,vendor,support,superadmin'],
            'status' => ['sometimes', 'string', 'in:active,banned,inactive'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:man,woman,nonbinary'],
        ]);

        $user = User::create($data);

        return response()->json(['user' => $user], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {

        return response()->json(["user" => $user]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'scope' => 'sometimes|string|in:user,admin,vendor,support,superadmin',
            'status' => 'sometimes|string|in:active,banned,inactive',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
        ]);

        $user->update($validated);

        return response()->json(["user" => $user]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return response()->json(['message' => "User successfully deleted"]);
    }
}
