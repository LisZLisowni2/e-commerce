<?php

namespace App\Models;

use App\AddressType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;
    protected $fillable = [
        "address_type",
        "address_line_1",
        "address_line_2",
        "city",
        "state_province",
        "postal_code",
        "country",
    ];

    protected function casts(): array {
        return [
            "address_type" => AddressType::class
        ];
    }
}
