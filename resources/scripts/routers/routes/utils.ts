import type { ComponentType, ElementType } from 'react';
import { matchRoutes } from 'react-router-dom';

export interface RouteDefinition {
    route: string;
    path: string;
    name?: string;
    component: ComponentType;
    end?: boolean;
    icon?: ElementType;
    condition?: Condition;
}

export interface ServerRouteDefinition extends RouteDefinition {
    category?: 'general' | 'data' | 'configuration' | null;
    permission?: string | string[];
}

export interface AdminRouteDefinition extends RouteDefinition {
    category?: 'general' | 'modules' | 'appearance' | 'management' | 'services';
    advanced?: boolean;
}

export const normalize = (route: string): string => route.replace(/[:*].*$/, '').replace(/\/+$/, '');

type Condition<T = any> = (flags: T) => boolean;

export function route<T extends ComponentType>(
    route: string,
    component: T,
    opts: Partial<RouteDefinition | ServerRouteDefinition | AdminRouteDefinition> = {},
): RouteDefinition {
    return {
        route,
        path: opts.path ?? normalize(route),
        component,
        ...opts,
    };
}

/**
 * Determines the key to use when animating between pages. Pages that contain their own nested
 * <Routes> (e.g. anything rendering <SubNavigation>) register a wildcard pattern such as
 * `nodes/:id/*`; matchRoutes() resolves the *static* portion of the currently matched pattern
 * (pathnameBase) so navigating between sub-navigation tabs doesn't remount/re-animate the
 * shared title + sub-navigation, while switching to a genuinely different page still does.
 */
export function getTransitionKey(patterns: string[], pathname: string): string {
    const matches = matchRoutes(
        patterns.map(path => ({ path })),
        pathname,
    );

    return matches?.[matches.length - 1]?.pathnameBase ?? pathname;
}
