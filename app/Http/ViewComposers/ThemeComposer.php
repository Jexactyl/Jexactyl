<?php

namespace Everest\Http\ViewComposers;

use Illuminate\View\View;

class ThemeComposer
{
    /**
     * Provide access to the asset service in the views.
     */
    public function compose(View $view): void
    {    
        $view->with('themeConfiguration', [
            'colors' => [
                'primary' => config('colors.primary') ?? config('modules.theme.colors.primary'),
                'secondary' => config('colors.secondary') ??  config('modules.theme.colors.secondary'),
    
                'background' => config('colors.background') ??  config('modules.theme.colors.background'),
                'headers' => config('colors.headers') ??  config('modules.theme.colors.headers'),
                'sidebar' => config('colors.sidebar') ??  config('modules.theme.colors.sidebar'),
            ],
        ]);
    }
}
