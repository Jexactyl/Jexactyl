<?php

namespace Jexactyl\Console\Commands\Schedule;

use Carbon\Carbon;
use Jexactyl\Models\Coupon;
use Illuminate\Console\Command;

class CouponCommand extends Command
{
    protected $signature = 'p:schedule:coupon';
    protected $description = 'Process coupon expirations.';

    public function handle(): void
    {
        $this->line('Beginning check for expired coupons.');
        $coupons = Coupon::query()->get();
        foreach ($coupons as $coupon) {
            $carbon = new Carbon($coupon->expires);
            $expires = $carbon->timestamp;
            if (Carbon::now()->timestamp >= $expires) {
                $coupon->update(['expired' => true]);
                $this->line('Coupon #' . $coupon->id . ' has been set as expired.');
            }
        }
        $this->line('Completed check for expired coupons.');
    }
}
