<?php

namespace App;

enum AddressType: string
{
    case SHIPPING = "shipping";
    case BILLING = "billing";
}
