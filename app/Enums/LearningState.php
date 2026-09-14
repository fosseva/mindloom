<?php

namespace App\Enums;

enum LearningState: string
{
    case New = 'new';
    case Learning = 'learning';
    case Reviewing = 'reviewing';
    case Relearning = 'relearning';
}
