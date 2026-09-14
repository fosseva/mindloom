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
        Schema::create('apply_cards', function (Blueprint $table) {
            $table->foreignId('card_id')->primary()->constrained()->cascadeOnDelete();
            $table->text('scenario');
            $table->text('question');
            $table->text('solution');
            $table->text('key_takeaway')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('apply_cards');
    }
};
