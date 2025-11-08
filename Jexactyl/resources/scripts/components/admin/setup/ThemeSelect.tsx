import updateColors from '@/api/routes/admin/theme/updateColors';
import useStatus from '@/plugins/useStatus';
import { useStoreActions, useStoreState } from '@/state/hooks';
import AdminBox from '@/elements/AdminBox';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleIcon } from '@heroicons/react/outline';

const colorOptions = [
    { hex: '#16a34a', name: 'Jexactyl Green' },
    { hex: '#12aaaa', name: 'Microsoft Teal' },
    { hex: '#ff0000', name: 'Brick Red' },
    { hex: '#9D00FF', name: 'Iris Purple' },
    { hex: '#FFA500', name: 'Orange Orange' },
    { hex: '#32559f', name: 'Ptero Blue' },
    { hex: '#ff99c8', name: 'Pretty Pink' },
    { hex: '#5e6472', name: 'Plain Grey' },
];

export default ({ defaultColor }: { defaultColor: string }) => {
    const { status, setStatus } = useStatus();
    const theme = useStoreState(state => state.theme.data!);
    const setTheme = useStoreActions(actions => actions.theme.setTheme);

    const changeColor = (hex: string) => {
        setStatus('loading');

        updateColors('primary', hex).then(() => {
            setStatus('success');
            setTheme({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary: hex,
                },
            });
        });
    };

    return (
        <div>
            <div className={'w-full flex flex-row items-center mb-8'}>
                <div className={'flex flex-col flex-shrink'} style={{ minWidth: '0' }}>
                    <h2 className={'text-2xl text-neutral-50 font-header font-medium'}>Theme Preferences</h2>
                    <p
                        className={
                            'hidden lg:block text-base text-neutral-400 whitespace-nowrap overflow-ellipsis overflow-hidden'
                        }
                    >
                        Select a preferred primary color for your Panel UI.
                    </p>
                </div>
            </div>
            <AdminBox status={status} title={'Set Primary Color'}>
                <div className={'grid grid-cols-4 lg:grid-cols-8 gap-4 lg:gap-8'}>
                    {colorOptions.map(option => (
                        <div
                            className={'text-center relative'}
                            key={option.hex}
                            onClick={() => changeColor(option.hex)}
                        >
                            <FontAwesomeIcon
                                icon={faCircle}
                                style={{ color: option.hex }}
                                size={'3x'}
                                className={'hover:brightness-125 transition duration-300'}
                            />
                            {defaultColor === option.hex && (
                                <div className={'absolute top-[10px] right-[27px]'}>
                                    <CheckCircleIcon className={'w-7'} />
                                </div>
                            )}
                            <p className={'italic text-xs mt-1 text-gray-400'}>{option.name}</p>
                        </div>
                    ))}
                </div>
            </AdminBox>
            <p className={'text-gray-400 mt-2 text-right'}>Select a color from the options to apply it.</p>
        </div>
    );
};
