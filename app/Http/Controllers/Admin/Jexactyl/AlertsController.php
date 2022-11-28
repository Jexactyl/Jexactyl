<?php

namespace Pterodactyl\Http\Controllers\Admin\Jexactyl;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Pterodactyl\Http\Controllers\Controller;
use Pterodactyl\Exceptions\Model\DataValidationException;
use Pterodactyl\Exceptions\Repository\RecordNotFoundException;
use Pterodactyl\Http\Requests\Admin\Jexactyl\AlertFormRequest;
use Pterodactyl\Contracts\Repository\SettingsRepositoryInterface;

class AlertsController extends Controller
{
    /**
     * AppearanceController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * Render the Jexactyl settings interface.
     */
    public function index(): View
    {
        return view('admin.jexactyl.alerts', [
            'type' => $this->settings->get('jexactyl::alert:type', 'success'),
            'message' => $this->settings->get('jexactyl::alert:message'),
        ]);
    }

    /**
     * Update or create an alert.
     *
     * @throws DataValidationException|RecordNotFoundException
     */
    public function update(AlertFormRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('jexactyl::' . $key, $value);
        }

        $this->alert->success('Jexactyl Alert has been updated.')->flash();

        return redirect()->route('admin.jexactyl.alerts');
    }

    /**
     * Delete the current alert.
     */
    public function remove(): RedirectResponse
    {
        $this->settings->forget('jexactyl::alert:type');
        $this->settings->forget('jexactyl::alert:message');

        $this->alert->success('Jexactyl Alert has been removed.')->flash();

        return redirect()->route('admin.jexactyl.alerts');
    }
}
