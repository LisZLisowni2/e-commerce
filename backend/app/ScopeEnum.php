<?php

namespace App;

enum ScopeEnum: string
{
    case USER = "user";
    case ADMIN = "admin";
    case VENDOR = "vendor";
    case SUPPORT = "support";
}
