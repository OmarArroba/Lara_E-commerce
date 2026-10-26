<?php

namespace App\Http\Resources\Api\V1;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Activitylog\Models\Activity;

/** @mixin Activity */
class AuditLogResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $causer = $this->relationLoaded('causer') ? $this->causer : null;

        return [
            'id' => $this->id,
            'log_name' => $this->log_name ?? 'default',
            'description' => $this->description,
            'subject_type' => $this->subject_type ? class_basename($this->subject_type) : null,
            'subject_id' => $this->subject_id,
            'causer' => $causer instanceof User ? [
                'id' => $causer->id,
                'name' => $causer->name,
                'email' => $causer->email,
            ] : null,
            'properties' => $this->properties?->toArray() ?? [],
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
