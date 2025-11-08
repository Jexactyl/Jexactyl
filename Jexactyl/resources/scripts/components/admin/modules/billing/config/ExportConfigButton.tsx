import { Button } from '@/elements/button';
import useFlash from '@/plugins/useFlash';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { exportBillingConfiguration } from '@/api/routes/admin/billing/config';

export default () => {
    const { clearAndAddHttpError, clearFlashes, addFlash } = useFlash();

    const submit = () => {
        clearFlashes();

        exportBillingConfiguration()
            .then(() => {
                addFlash({
                    key: 'billing:config',
                    type: 'success',
                    message: 'Billing configuration exported successfully.',
                });
            })
            .catch(error => clearAndAddHttpError({ key: 'billing:config', error }));
    };

    return (
        <>
            <Button onClick={submit}>
                <FontAwesomeIcon icon={faDownload} className={'mr-1'} /> Export
            </Button>
        </>
    );
};
