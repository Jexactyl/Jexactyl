import { useState } from 'react';
import { rotateDatabasePassword } from '@/api/routes/server/databases';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { ServerContext } from '@/state/server';
import { type Database } from '@definitions/server';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/elements/button';
import tw from 'twin.macro';

export default ({ databaseId, onUpdate }: { databaseId: string; onUpdate: (database: Database) => void }) => {
    const [loading, setLoading] = useState(false);
    const { addFlash, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);
    const server = ServerContext.useStoreState(state => state.server.data!);

    if (!databaseId) {
        return null;
    }

    const rotate = () => {
        setLoading(true);
        clearFlashes();

        rotateDatabasePassword(server.uuid, databaseId)
            .then(database => onUpdate(database))
            .catch(error => {
                console.error(error);
                addFlash({
                    type: 'error',
                    title: 'Error',
                    message: httpErrorToHuman(error),
                    key: 'database-connection-modal',
                });
            })
            .then(() => setLoading(false));
    };

    return (
        <Button color={'primary'} css={tw`mr-2`} onClick={rotate} disabled={loading}>
            Rotate Password
        </Button>
    );
};
