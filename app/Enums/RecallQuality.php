<?php

namespace App\Enums;

enum RecallQuality: int
{
    case Forgot = 1;
    case Difficult = 2;
    case Remembered = 3;
    case Easy = 4;
}
