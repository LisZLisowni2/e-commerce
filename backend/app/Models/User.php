<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\AddressType;
use App\ScopeEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

// #[Fillable(['name', 'email', 'password'])]
// #[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens;

    use HasFactory;

    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'password',
        'scope',
        'status',
        'first_name',
        'last_name',
        'phone',
        'date_of_birth',
        'gender',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'scope' => ScopeEnum::class,
        ];
    }

    /**
     * Get all of the user's saved addresses.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    /**
     * Get the user's default shipping address.
     */
    public function defaultShippingAddress()
    {
        return $this->hasMany(Address::class)
            ->where('address_type', AddressType::SHIPPING)
            ->where('is_default', true)
            ->limit(1);
    }

    /*
        Get the user's products
    */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function hasScope(ScopeEnum ...$scopes)
    {
        return in_array($this->scope, $scopes, true);
    }
}
