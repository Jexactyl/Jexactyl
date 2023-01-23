<?php

namespace Jexactyl\Http\Controllers\Api\Client\Store;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Jexactyl\Exceptions\DisplayException;
use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\ProductionEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;
use Jexactyl\Http\Controllers\Api\Client\ClientApiController;
use Jexactyl\Http\Requests\Api\Client\Store\Gateways\PayPalRequest;

class PayPalController extends ClientApiController
{
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Constructs the PayPal order request and redirects
     * the user over to PayPal for credits purchase.
     *
     * @throws DisplayException
     */
    public function purchase(PayPalRequest $request): JsonResponse
    {
        if ($this->settings->get('jexactyl::store:paypal:enabled') != 'true') {
            throw new DisplayException('Unable to purchase via PayPal: module not enabled');
        }

        $amount = $request->input('amount');
        $cost = config('gateways.paypal.cost', 1) / 100 * $amount;
        $currency = config('gateways.currency', 'USD');

        DB::table('paypal')->insert([
            'user_id' => $request->user()->id,
            'amount' => $amount,
        ]);

        $order = new OrdersCreateRequest();
        $order->prefer('return=representation');

        $order->body = [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'reference_id' => uniqid(),
                    'description' => $amount . ' Credits | ' . $this->settings->get('settings::app:name'),
                    'amount' => [
                        'value' => $cost,
                        'currency_code' => strtoupper($currency),
                        'breakdown' => [
                            'item_total' => ['currency_code' => strtoupper($currency), 'value' => $cost],
                        ],
                    ],
                ],
            ],
            'application_context' => [
                'cancel_url' => route('api:client.index'),
                'return_url' => route('api:client:store.paypal.callback'),
                'brand_name' => $this->settings->get('settings::app:name'),
                'shipping_preference' => 'NO_SHIPPING',
            ],
        ];

        try {
            $response = $this->getClient()->execute($order);
        } catch (\Exception $ex) {
            throw new DisplayException('Unable to process order.');
        }

        return new JsonResponse($response->result->links[1]->href ?? '/', 200, [], null, true);
    }

    /**
     * Add balance to a user when the purchase is successful.
     *
     * @throws DisplayException
     */
    public function callback(Request $request): RedirectResponse
    {
        $user = $request->user();
        $data = DB::table('paypal')->where('user_id', $user->id)->first();

        $order = new OrdersCaptureRequest($request->input('token'));
        $order->prefer('return=representation');

        try {
            $res = $this->getClient()->execute($order);
        } catch (DisplayException $ex) {
            throw new DisplayException('Unable to process order.');
        }

        if ($res->statusCode == 200 || 201) {
            $user->update([
                'store_balance' => $user->store_balance + $data->amount,
            ]);
        }

        DB::table('paypal')->where('user_id', $user->id)->delete();

        return redirect('/store');
    }

    /**
     * Returns a PayPal client which can be used
     * for processing orders via the API.
     *
     * @throws DisplayException
     */
    protected function getClient(): PayPalHttpClient
    {
        return new PayPalHttpClient(new ProductionEnvironment(
            config('gateways.paypal.client_id'),
            config('gateways.paypal.client_secret')
        ));
    }
}
