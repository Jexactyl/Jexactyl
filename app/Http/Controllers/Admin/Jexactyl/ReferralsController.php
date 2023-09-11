<?php

namespace Jexactyl\Http\Controllers\Admin\Jexactyl;

use Illuminate\View\View;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Jexactyl\Http\Controllers\Controller;
use Jexactyl\Contracts\Repository\SettingsRepositoryInterface;
use Jexactyl\Http\Requests\Admin\Jexactyl\ReferralsFormRequest;

class ReferralsController extends Controller
{
    /**
     * RegistrationController constructor.
     */
    public function __construct(
        private AlertsMessageBag $alert,
        private SettingsRepositoryInterface $settings
    ) {
    }

    /**
     * Render the Jexactyl referrals interface.
     */
    public function index(): View
    {
        return view('admin.jexactyl.referrals', [
            'enabled' => $this->settings->get('jexactyl::referrals:enabled', false),
            'reward' => $this->settings->get('jexactyl::referrals:reward', 250),
        ]);
    }

    /**
     * Handle settings update.
     *
     * @throws \Jexactyl\Exceptions\Model\DataValidationException
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function update(ReferralsFormRequest $request): RedirectResponse
    {
        foreach ($request->normalize() as $key => $value) {
            $this->settings->set('jexactyl::referrals:' . $key, $value);
        }

        $this->alert->success('Referral system has been updated.')->flash();

        return redirect()->route('admin.jexactyl.referrals');
    }
}
