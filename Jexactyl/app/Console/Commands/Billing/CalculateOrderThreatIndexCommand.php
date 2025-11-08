<?php

namespace Everest\Console\Commands\Billing;

use Carbon\Carbon;
use Everest\Models\User;
use Illuminate\Console\Command;
use Everest\Models\Billing\Order;

class CalculateOrderThreatIndexCommand extends Command
{
    protected $description = 'An automated task to calculate the threat index of an order.';

    protected $signature = 'p:billing:calculate-order-threat-index';

    protected $reputableProviders = [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'hotmail.com',
        'icloud.com',
        'zoho.com',
        'aol.com',
        'protonmail.com',
        'mail.com',
        'yandex.com',
        'office.com',
        'outlook.co.uk',
        'live.com',
        'live.co.uk',
        'msn.com',
        'sky.com',
        'me.com',
        'btinternet.com',
    ];

    /**
     * CalculateOrderThreatIndexCommand constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Handle command execution.
     */
    public function handle()
    {
        foreach (Order::where('threat_index', -1)->get() as $order) {
            $index = 0;
            $user = User::find($order->user_id);

            if ($user->created_at->lt(Carbon::now()->subWeek())) {
                $index += 30;
            }

            if (!$order->is_renewal) {
                $index += 10;
            }

            if (in_array($domain = substr(strrchr($user->email, '@'), 1), $this->reputableProviders)) {
                $index += 25;
            }

            if (!$user->use_totp) {
                $index += 15;
            }

            if ($order->status === 'failed') {
                $index += 20;
            }

            $order->update(['threat_index' => $index]);
        }
    }
}
