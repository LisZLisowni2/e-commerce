<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->boolean('flat')) {
            return response()->json([
                "categories" => Category::all()
            ]);
        } 

        $categories = Category::whereNull('parent_id')
                                ->with('childrenRecursive')
                                ->get();
        
        return response()->json([
            "categories" => $categories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            "name" => ["required", "string", "max:255"],
            "parent_id" => ["nullable", "exists:categories,id"]
        ]);

        $data["slug"] = Str::slug($data["name"]);

        $category = Category::create($data);

        return response()->json([
            "category" => $category
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $subCategories = $category->childrenRecursive()
                                ->get();

        return response()->json([
            "category" => $category,
            "subCategories" => $subCategories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            "name" => [
                "sometimes", 
                "string", 
                "max:255",
            ],
            "parent_id" => [
                "nullable", 
                "exists:categories,id", 
                Rule::notIn([$category->id]),
            ]
        ]);

        // Check if name was provided and actually changed
        if (isset($data['name']) && $data['name'] != $category->name) {
            Log::debug("Condition is true");
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);
        return response()->json([
            "category" => $category
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->noContent();
    }
}
