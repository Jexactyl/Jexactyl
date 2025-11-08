import { useEffect, useState } from 'react';
import Spinner from '@/elements/Spinner';
import { getEvents, sendTestEvent, toggleEventStatus, WebhookEvent } from '@/api/routes/admin/webhooks';
import EventsTable from './EventsTable';
import { Button } from '@/elements/button';
import { useStoreState } from '@/state/hooks';
import useFlash from '@/plugins/useFlash';
import Input from '@/elements/Input';

export default () => {
    const { colors } = useStoreState(s => s.theme.data!);
    const [events, setEvents] = useState<WebhookEvent[]>();
    const [filteredEvents, setFilteredEvents] = useState<WebhookEvent[]>();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const { clearFlashes, addFlash, clearAndAddHttpError } = useFlash();

    useEffect(() => {
        getEvents().then(fetchedEvents => {
            setEvents(fetchedEvents);
            setFilteredEvents(fetchedEvents); // Set filtered events initially
        });
    }, []);

    const handleSearch = (searchValue: string) => {
        setSearchTerm(searchValue);

        // Filter by key or description using searchValue (case insensitive)
        if (events) {
            const filtered = events.filter(
                event =>
                    event.key.toLowerCase().includes(searchValue.toLowerCase()) ||
                    event.description.toLowerCase().includes(searchValue.toLowerCase()),
            );
            setFilteredEvents(filtered);
        }
    };

    const doDisable = () => {
        toggleEventStatus(false).then(() => window.location.reload());
    };

    const doEnable = () => {
        toggleEventStatus(true).then(() => window.location.reload());
    };

    const doTest = () => {
        clearFlashes();

        sendTestEvent()
            .then(() => {
                addFlash({ key: 'admin:webhooks', type: 'success', message: 'Webhook sent successfully!' });
            })
            .catch(error => clearAndAddHttpError({ key: 'admin:webhooks', error }));
    };

    if (!events) return <Spinner size={'large'} centered />;

    return (
        <>
            <div className={'flex grid lg:grid-cols-2 mb-6'}>
                <Input
                    placeholder={'Search for a webhook event...'}
                    value={searchTerm}
                    onChange={e => handleSearch(e.target.value)}
                />
                <div className={'flex justify-end'}>
                    <div className={'p-2 w-fit rounded-lg space-x-3'} style={{ background: colors.secondary }}>
                        <Button.Text onClick={doTest} variant={Button.Variants.Secondary}>
                            Send Test
                        </Button.Text>
                        <Button.Danger onClick={doDisable}>Disable All</Button.Danger>
                        <Button onClick={doEnable}>Enable All</Button>
                    </div>
                </div>
            </div>
            <EventsTable events={filteredEvents} />
        </>
    );
};
