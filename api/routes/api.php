<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;


Route::middleware("guest")->group(
    callback: function (): void {
        Route::post('/signup', [RegisteredUserController::class, 'store'])
            ->middleware('guest')
            ->name('signup');

        Route::post('/login', [AuthenticatedSessionController::class, 'store'])
            ->middleware('guest')
            ->name('login');
    }
);

Route::middleware(['auth:sanctum'])
     ->group(callback: function (): void {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
        ->name('logout');

    Route::get('/user', function (Request $request): mixed {
        return $request->user();
    });
});