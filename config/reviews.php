<?php

use App\Enums\SchedulerVersion;

return [
    'default_algorithm' => SchedulerVersion::Fsrs6->value,

    /*
    |--------------------------------------------------------------------------
    | Review policy
    |--------------------------------------------------------------------------
    |
    | These are product choices. They may be changed independently of the
    | scheduling algorithm, and can later be replaced by per-user settings.
    |
    */
    'policy' => [
        'desired_retention' => 0.9,
        'forgot_review_after_minutes' => 20,
    ],
];
