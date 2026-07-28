<?php

namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AddressController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Address::class);

        return response()->json(["addresses" => $request->user()->addresses]);
    }

    public function show(Address $address): JsonResponse
    {
        $this->authorize('view', $address);

        return response()->json(["address" => $address]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Address::class);

        $data = $request->validate([
            "address_type" => "required|string|in:shipping,billing",
            "address_line_1" => "required|string|max:255",
            "address_line_2" => "nullable|string|max:255",
            "city" => "required|string|max:255",
            "state_province" => "nullable|string|max:255",
            "postal_code" => "required|string|max:20",
            "country" => "required|string",
        ]);

        $address = $request->user()->addresses()->create($data);

        return response()->json(["address" => $address], 201);
    }

    public function update(Request $request, Address $address): JsonResponse
    {
        $this->authorize('update', $address);

        $data = $request->validate([
            "address_type" => "sometimes|string|in:shipping,billing",
            "address_line_1" => "sometimes|string|max:255",
            "address_line_2" => "nullable|string|max:255",
            "city" => "sometimes|string|max:255",
            "state_province" => "nullable|string|max:255",
            "postal_code" => "sometimes|string|max:20",
            "country" => "sometimes|string",
        ]);

        $address->update($data);

        return response()->json(["address" => $address]);
    }

    public function destroy(Address $address): JsonResponse
    {
        $this->authorize('delete', $address);

        $address->delete();

        return response()->json(null, 204);
    }
}
