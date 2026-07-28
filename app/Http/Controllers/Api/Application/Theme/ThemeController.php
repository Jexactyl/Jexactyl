<?php

namespace Everest\Http\Controllers\Api\Application\Theme;

use Everest\Models\Theme;
use Everest\Facades\Activity;
use Illuminate\Http\Response;
use Everest\Contracts\Repository\ThemeRepositoryInterface;
use Everest\Http\Requests\Api\Application\Theme\UpdateThemeRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class ThemeController extends ApplicationApiController
{
    /**
     * ThemeController constructor.
     */
    public function __construct(
        private ThemeRepositoryInterface $theme,
    ) {
        parent::__construct();
    }

    /**
     * Update the colors for the panel theme.
     *
     * @throws \Throwable
     */
    public function colors(UpdateThemeRequest $request): Response
    {
        $this->theme->set('theme::colors:' . $request->input('key'), $request->input('value'));

        Activity::event('admin:theme:update')
            ->property('key', $request->input('key'))
            ->property('value', $request->input('value'))
            ->description('A panel theme color was updated')
            ->log();

        return $this->returnNoContent();
    }

    /**
     * Reset all of the theme keys to factory defaults.
     */
    public function reset(UpdateThemeRequest $request): Response
    {
        foreach ($this->theme->all() as $setting) {
            $setting->delete();
        }

        Activity::event('admin:theme:reset')
            ->description('The panel theme was reset to factory defaults')
            ->log();

        return $this->returnNoContent();
    }
}
