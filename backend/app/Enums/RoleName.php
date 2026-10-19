<?php

namespace App\Enums;

enum RoleName: string
{
    case SuperAdmin = 'super_admin';
    case Admin = 'admin';
    case InventoryManager = 'inventory_manager';
    case Sales = 'sales';
    case ApiClient = 'api_client';

    /** @return list<string> */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
