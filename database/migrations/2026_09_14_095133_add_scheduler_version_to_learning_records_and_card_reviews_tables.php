<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('learning_records', function (Blueprint $table) {
            $table->string('scheduler_version')->default('fsrs_6')->after('difficulty_score');
        });

        Schema::table('card_reviews', function (Blueprint $table) {
            $table->string('scheduler_version')->default('fsrs_6')->after('rating_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learning_records', function (Blueprint $table) {
            $table->dropColumn('scheduler_version');
        });

        Schema::table('card_reviews', function (Blueprint $table) {
            $table->dropColumn('scheduler_version');
        });
    }
};
