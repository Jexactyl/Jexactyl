import { createTypedHooks } from 'easy-peasy';
import { ApplicationStore } from '@/state/index';

const hooks = createTypedHooks<ApplicationStore>();

export const useStoreState = hooks.useStoreState;
export const useStoreActions = hooks.useStoreActions;
