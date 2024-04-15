import { SiteTheme } from '@/state/theme';
import { overrideTailwindClasses } from 'tailwind-override';

function overwrite(theme: SiteTheme) {
    overrideTailwindClasses(`text-primary-400 text-[${theme.colors.primary}]`);
}

export default overwrite;
