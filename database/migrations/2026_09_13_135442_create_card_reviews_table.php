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
        Schema::create('card_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_record_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating');
            $table->timestamp('reviewed_at');
            $table->unsignedInteger('interval_before_minutes');
            $table->unsignedInteger('interval_after_minutes');
            $table->timestamp('due_at_before')->nullable();
            $table->timestamp('due_at_after')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamps();

            $table->index(['learning_record_id', 'reviewed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('card_reviews');
    }
};
