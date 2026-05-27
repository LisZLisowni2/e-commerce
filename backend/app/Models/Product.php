<?php

namespace App\Models;

use App\Casts\PriceCast;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    public $timestamps = true;

    public const CREATED_AT = 'created_at';
    public const UPDATED_AT = 'updated_at';
    protected $fillable = [
        'name',
        'description',
        'price',
        'imageURL',
        'last30DaysPrice',
    ];

    protected $casts = [
        "name" => "string",
        "description" => "string",
        "price" => PriceCast::class,
        "imageURL" => "string",
        "last30DaysPrice" => PriceCast::class,
    ];
}
