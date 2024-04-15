<?php

namespace Everest\Http\Controllers\Api\Application\Theme;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Everest\Contracts\Repository\ThemeRepositoryInterface;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class ThemeController extends ApplicationApiController
{
    /**
     * ThemeController constructor.
     */
    public function __construct(
        private ThemeRepositoryInterface $settings
    ) {
        parent::__construct();
    }

    /**
     * Update the theme on the Panel.
     *
     * @throws \Throwable
     */
    public function update(Request $request): Response
    {
        $this->settings->set($request->input('key'), $request->input('value'));

        return $this->returnNoContent();
    }
}
