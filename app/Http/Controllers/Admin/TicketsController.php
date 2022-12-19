<?php

namespace Pterodactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Illuminate\View\Factory;
use Pterodactyl\Models\Ticket;
use Pterodactyl\Http\Controllers\Controller;

class TicketsController extends Controller
{
    public function __construct(protected Factory $view) {
    }

    /**
     * List the available tickets.
     */
    public function index(): View
    {
        return $this->view->make('admin.tickets.index', ['tickets' => Ticket::all()]);
    }
}