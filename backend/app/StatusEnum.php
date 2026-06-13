<?php

namespace App;

enum StatusEnum: string
{
    case ACTIVE = "active";
    case BANNED = "banned";
    case INACTIVE = "inactive";
}
