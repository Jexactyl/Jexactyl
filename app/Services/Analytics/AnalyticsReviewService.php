<?php

namespace Jexactyl\Services\Analytics;

use Jexactyl\Models\Server;
use Jexactyl\Models\AnalyticsData;
use Jexactyl\Models\AnalyticsMessage;

class AnalyticsReviewService
{
    /**
     * Reviews analytics data for a server and sends
     * messages to the UI containing recommendations and information.
     */
    public function handle(Server $server)
    {
        $total = ['cpu' => 0, 'memory' => 0, 'disk' => 0];
        $analytics = AnalyticsData::where('server_id', $server->id)->select('cpu', 'memory', 'disk')->get();
        $size = count($analytics);

        foreach ($analytics as $data) {
            $total['cpu'] += $data->cpu;
            $total['memory'] += $data->memory;
            $total['disk'] += $data->disk;
        }

        $total['cpu'] /= $size;
        $total['memory'] /= $size;
        $total['disk'] /= $size;

        $this->calculate($server->id, $total);
    }

    /**
     * Calculates the average usage per resource and sends notifications
     * when a conditional statement is true.
     */
    public function calculate(int $id, array $values): void
    {
        $min = 25;
        $max = 50;
        $size = count($values);

        foreach ($values as $key => $value) {
            if ($value <= 25) {
                $this->message($id, $size, $key, $value, false);
            }

            if ($value >= 50) {
                $this->message($id, $size, $key, $value, true);
            }
        }
    }

    /**
     * Sends a message to the server analytics UI.
     */
    public function message(int $id, int $size, string $key, int $value, bool $warning): void
    {
        $suffix = '% usage over past ' . $size . ' checks';

        AnalyticsMessage::create([
            'server_id' => $id,
            'title' => $key . ' usage was ' . ($warning ? 'over 75' : 'under 25') . '%',
            'content' => 'Measured ' . $value . $suffix,
            'type' => ($warning ? 'warning' : 'success'),
        ]);
    }
}
