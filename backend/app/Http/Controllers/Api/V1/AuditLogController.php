<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AuditLogResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        abort_unless($request->user()?->can('audit.view'), 403);

        $query = Activity::query()
            ->with('causer')
            ->latest('created_at')
            ->orderByDesc('id');

        if ($logName = $request->query('log_name')) {
            $query->where('log_name', $logName);
        }

        if ($search = trim((string) $request->query('q', ''))) {
            $term = '%'.strtolower($search).'%';
            $query->where(function ($q) use ($term) {
                $q->whereRaw('LOWER(description) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(log_name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(CAST(properties AS TEXT)) LIKE ?', [$term]);
            });
        }

        return AuditLogResource::collection($query->limit(100)->get());
    }
}
