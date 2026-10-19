<?php

namespace App\Enums;

enum WarehouseStatus: string
{
    case Operational = 'operational';
    case Maintenance = 'maintenance';
    case Closed = 'closed';
}
