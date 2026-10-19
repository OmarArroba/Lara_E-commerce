<?php

namespace App\Enums;

enum MovementType: string
{
    case In = 'in';
    case Out = 'out';
    case Adjustment = 'adjustment';
    case Return = 'return';
    case TransferOut = 'transfer_out';
    case TransferIn = 'transfer_in';
    case PurchaseReceipt = 'purchase_receipt';

    /** Movimientos que exigen confirmación de contraseña y quedan marcados para auditoría. */
    public function isSensitive(): bool
    {
        return in_array($this, [self::Adjustment, self::Out], true);
    }
}
