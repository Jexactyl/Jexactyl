import { useEffect, useState } from 'react';
import { getSchedules } from '@/api/routes/server/schedules';
import { ServerContext } from '@/state/server';
import Spinner from '@/elements/Spinner';
import FlashMessageRender from '@/elements/FlashMessageRender';
import ScheduleRow from '@server/schedules/ScheduleRow';
import { httpErrorToHuman } from '@/api/http';
import EditScheduleModal from '@server/schedules/EditScheduleModal';
import Can from '@/elements/Can';
import useFlash from '@/plugins/useFlash';
import tw from 'twin.macro';
import { Button } from '@/elements/button/index';
import PageContentBlock from '@/elements/PageContentBlock';

function ScheduleContainer() {
    const server = ServerContext.useStoreState(state => state.server.data!);
    const { clearFlashes, addError } = useFlash();
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);

    const schedules = ServerContext.useStoreState(state => state.schedules.data);
    const setSchedules = ServerContext.useStoreActions(actions => actions.schedules.setSchedules);

    useEffect(() => {
        clearFlashes('schedules');

        getSchedules(server.uuid)
            .then(schedules => setSchedules(schedules))
            .catch(error => {
                addError({ message: httpErrorToHuman(error), key: 'schedules' });
                console.error(error);
            })
            .then(() => setLoading(false));
    }, []);

    return (
        <PageContentBlock title={'Schedules'} header description={'Create and edit automatic tasks for your server.'}>
            <FlashMessageRender byKey={'schedules'} css={tw`mb-4`} />
            {!schedules.length && loading ? (
                <Spinner size={'large'} centered />
            ) : (
                <>
                    {schedules.length === 0 ? (
                        <p css={tw`text-sm text-center text-neutral-300`}>
                            There are no schedules configured for this server.
                        </p>
                    ) : (
                        schedules.map(schedule => (
                            <ScheduleRow
                                key={schedule.id}
                                schedule={schedule}
                                to={`/server/${server.id}/schedules/${schedule.id}`}
                            />
                        ))
                    )}
                    <Can action={'schedule.create'}>
                        <div css={tw`mt-8 flex justify-end`}>
                            <EditScheduleModal visible={visible} onModalDismissed={() => setVisible(false)} />
                            <Button type={'button'} onClick={() => setVisible(true)}>
                                Create schedule
                            </Button>
                        </div>
                    </Can>
                </>
            )}
        </PageContentBlock>
    );
}

export default ScheduleContainer;
