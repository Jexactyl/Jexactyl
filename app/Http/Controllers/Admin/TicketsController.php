<?php

namespace Jexactyl\Http\Controllers\Admin;

use Illuminate\View\View;
use Jexactyl\Models\Ticket;
use Illuminate\View\Factory;
use Jexactyl\Models\TicketMessage;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Jexactyl\Http\Controllers\Controller;
use Jexactyl\Http\Requests\Admin\Tickets\TicketStatusRequest;
use Jexactyl\Http\Requests\Admin\Tickets\TicketToggleRequest;
use Jexactyl\Contracts\Repository\SettingsRepositoryInterface;
use Jexactyl\Http\Requests\Admin\Tickets\TicketMessageRequest;

class TicketsController extends Controller
{
    public function __construct(
        protected Factory $view,
        protected AlertsMessageBag $alert,
        protected SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * List the available tickets.
     */
    public function index(): View
    {
        return $this->view->make('admin.tickets.index', [
            'tickets' => Ticket::all(),
            'enabled' => $this->settings->get('jexactyl::tickets:enabled', false),
            'max' => $this->settings->get('jexactyl::tickets:max', 3),
        ]);
    }

    /**
     * View a specific ticket.
     */
    public function view(int $id): View
    {
        return $this->view->make('admin.tickets.view', [
            'ticket' => Ticket::findOrFail($id),
            'messages' => TicketMessage::where('ticket_id', $id)->get(),
        ]);
    }

    /**
     * Enable or disable tickets on the system.
     */
    public function toggle(TicketToggleRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('jexactyl::tickets:' . $key, $value);
        }

        return redirect()->route('admin.tickets.index');
    }

    /**
     * Update the status of a ticket.
     */
    public function status(TicketStatusRequest $request, int $id): RedirectResponse
    {
        Ticket::findOrFail($id)->update(['status' => $request->input('status')]);

        TicketMessage::create([
            'user_id' => 0,
            'ticket_id' => $id,
            'content' => 'Ticket status has been set to ' . $request->input('status'),
        ]);

        return redirect()->route('admin.tickets.view', $id);
    }

    /**
     * Add a message to the ticket.
     */
    public function message(TicketMessageRequest $request, int $id): RedirectResponse
    {
        TicketMessage::create([
            'user_id' => $request->user()->id,
            'ticket_id' => $id,
            'content' => $request->input('content'),
        ]);

        return redirect()->route('admin.tickets.view', $id);
    }

    /**
     * Deletes a ticket and the associated messages.
     */
    public function delete(int $id): RedirectResponse
    {
        Ticket::findOrFail($id)->delete();
        TicketMessage::where('ticket_id', $id)->delete();

        $this->alert->success('Ticket ' . $id . ' has been deleted.')->flash();

        return redirect()->route('admin.tickets.index');
    }
}
