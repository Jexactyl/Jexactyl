<?php

namespace Everest\Services\Auth;

use Carbon\Carbon;
use Everest\Models\JGuardDelay;
use Everest\Models\JGuardAttempt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class JGuardService
{
    /**
     * Maps an admin-configurable "sensitivity" level to how far back we look for
     * recent registration/failed-login attempts from a given IP, and how many of
     * those attempts are tolerated before further signups from that IP are blocked.
     */
    protected const SENSITIVITY_LEVELS = [
        'low' => ['window' => 30, 'threshold' => 5],
        'medium' => ['window' => 60, 'threshold' => 3],
        'high' => ['window' => 180, 'threshold' => 2],
    ];

    protected const DEFAULT_SENSITIVITY = 'medium';

    /**
     * Determine if the given IP address has made enough recent registration or failed
     * login attempts to be considered suspicious of alt-account creation.
     */
    public function isSuspicious(string $ip): bool
    {
        [$window, $threshold] = $this->thresholds();

        $jguard_score = JGuardAttempt::query()
            ->where('ip', $ip)
            ->where('created_at', '>=', Carbon::now()->subMinutes($window))
            ->count() >= $threshold;
        $score = Cache::remember("abuseipdb:{$ip}", now()->addHour(), function () use ($ip) {
            try {
                $response = Http::withHeaders([
                    'Key' => config('modules.auth.jguard.abuseipdb_api_key'),
                    'Accept' => 'application/json',
                ])->timeout(3)->get('https://api.abuseipdb.com/api/v2/check', [
                    'ipAddress' => $ip,
                    'maxAgeInDays' => 90,
                ]);

                return $response->successful() ? $response->json('data.abuseConfidenceScore') : null;
            } catch (\Throwable $e) {
                logger()->warning('AbuseIPDB check failed', ['ip' => $ip, 'error' => $e->getMessage()]);
                return null;
            }
        });
        return ($score !== null && ($score >= (($threshold - 1) * 10))) || $jguard_score;
    }

    /**
     * Record a registration or failed login attempt from the given IP so that it can
     * count towards future suspicion checks.
     */
    public function recordAttempt(string $ip, string $type): void
    {
        JGuardAttempt::query()->create(['ip' => $ip, 'type' => $type]);
    }

    /**
     * Delay a newly created user's access to the Panel for the given number of minutes.
     */
    public function delay(int $userId, int $minutes): void
    {
        if ($minutes <= 0) {
            return;
        }

        JGuardDelay::query()->create([
            'user_id' => $userId,
            'expires_at' => Carbon::now()->addMinutes($minutes),
        ]);
    }

    /**
     * Returns the timestamp a user's access delay expires at, or null if the user is
     * not currently subject to one.
     */
    public function delayedUntil(int $userId): ?Carbon
    {
        $delay = JGuardDelay::query()
            ->where('user_id', $userId)
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('expires_at')
            ->first();

        return $delay?->expires_at;
    }

    /**
     * @return array{0: int, 1: int} the [window in minutes, attempt threshold] pair for
     *                               the configured sensitivity level
     */
    protected function thresholds(): array
    {
        $level = self::SENSITIVITY_LEVELS[config('modules.auth.jguard.sensitivity')]
            ?? self::SENSITIVITY_LEVELS[self::DEFAULT_SENSITIVITY];

        return [$level['window'], $level['threshold']];
    }
}
