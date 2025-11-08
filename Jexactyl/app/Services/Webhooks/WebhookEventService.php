<?php

namespace Everest\Services\Webhooks;

use Everest\Models\User;
use Everest\Models\WebhookEvent;
use Illuminate\Support\Facades\Http;
use Everest\Exceptions\DisplayException;
use Everest\Contracts\Repository\ThemeRepositoryInterface;
use Everest\Contracts\Repository\SettingsRepositoryInterface;

class WebhookEventService
{
    /**
     * WebhookEventService constructor.
     */
    public function __construct(
        private SettingsRepositoryInterface $settings,
        private ThemeRepositoryInterface $theme,
    ) {
    }

    /**
     * Convert hex color to integer.
     */
    private function hexToInt(string $hex): int
    {
        $hex = ltrim($hex, '#');
        
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        return hexdec($hex);
    }

    /**
     * Send a webhook through the defined URL.
     *
     * @throws \Exception
     */
    public function send(User $user, WebhookEvent $event): void
    {
        $colorHex = $this->theme->get('theme::colors:primary');
        $url = $this->settings->get('settings::modules:webhooks:url');

        if (!$url) {
            throw new DisplayException('No Webhook URL has been defined.');
        }

        // Hex to integer
        $colorInt = $this->hexToInt($colorHex);

        try {
            Http::post($url, [
                'embeds' => [[
                    'title' => $event->key,
                    'description' => $event->description,
                    'url' => env('APP_URL') . '/admin',
                    'color' => $colorInt,
                    'timestamp' => now()->toIso8601String(),
                    'footer' => [
                        'text' => 'Jexactyl v4',
                        'icon_url' => 'https://avatars.githubusercontent.com/u/91636558?s=200&v=4',
                    ],
                    'author' => [
                        'name' => $user->email,
                        'url' => env('APP_URL') . '/admin/users/' . $user->id,
                    ],
                ]],
            ]);
        } catch (DisplayException $ex) {
            throw new DisplayException('Unable to send webhook through URL.');
        }
    }
}
