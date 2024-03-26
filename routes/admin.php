<?php

use Everest\Http\Controllers\Admin;
use Illuminate\Support\Facades\Route;

Route::get('/', [Admin\BaseController::class, 'index'])->name('admin.index')->fallback();
Route::get('/{react}', [Admin\BaseController::class, 'index'])->where('react', '.+');
