<?php

namespace Everest\Http\Controllers\Admin;

use Illuminate\View\View;
use Everest\Http\Controllers\Controller;

class BaseController extends Controller
{
    public function index(): View
    {
        return view('templates/base.core');
    }
}
