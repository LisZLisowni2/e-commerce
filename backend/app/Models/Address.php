<?php

namespace App\Models;

use App\AddressType;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    //

    protected function casts(): array {
        return [
            "address_type" => AddressType::class
        ];
    }
}
