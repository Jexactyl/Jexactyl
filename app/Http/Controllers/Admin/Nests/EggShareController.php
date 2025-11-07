<?php

namespace Jexactyl\Http\Controllers\Admin\Nests;

use Jexactyl\Models\Egg;
use Illuminate\Http\RedirectResponse;
use Prologue\Alerts\AlertsMessageBag;
use Jexactyl\Http\Controllers\Controller;
use Symfony\Component\HttpFoundation\Response;
use Jexactyl\Services\Eggs\Sharing\EggExporterService;
use Jexactyl\Services\Eggs\Sharing\EggImporterService;
use Jexactyl\Http\Requests\Admin\Egg\EggImportFormRequest;
use Jexactyl\Services\Eggs\Sharing\EggUpdateImporterService;

class EggShareController extends Controller
{
    /**
     * EggShareController constructor.
     */
    public function __construct(
        protected AlertsMessageBag $alert,
        protected EggExporterService $exporterService,
        protected EggImporterService $importerService,
        protected EggUpdateImporterService $updateImporterService
    ) {
    }

    /**
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     */
    public function export(Egg $egg): Response
    {
        $filename = trim(preg_replace('/\W/', '-', kebab_case($egg->name)), '-');

        return response($this->exporterService->handle($egg->id), 200, [
            'Content-Transfer-Encoding' => 'binary',
            'Content-Description' => 'File Transfer',
            'Content-Disposition' => 'attachment; filename=egg-' . $filename . '.json',
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Import a new service option using an XML file.
     *
     * @throws \Jexactyl\Exceptions\Model\DataValidationException
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     * @throws \Jexactyl\Exceptions\Service\Egg\BadJsonFormatException
     * @throws \Jexactyl\Exceptions\Service\InvalidFileUploadException
     */
    public function import(EggImportFormRequest $request): RedirectResponse
    {
        $files = $request->file('import_files', []);
        $nestId = $request->input('import_to_nest');
    
        if (empty($files) && $request->hasFile('import_file')) {
            $files = [$request->file('import_file')];
        }
    
        $imported = [];
        $failed = [];
    
        foreach ($files as $file) {
            try {
                $egg = $this->importerService->handle($file, $nestId);
                $imported[] = $egg->name;
            } catch (\Throwable $ex) {
                $failed[] = $file->getClientOriginalName() . ' (' . $ex->getMessage() . ')';
            }
        }
    
        if ($imported) {
            $this->alert->success('Successfully imported: ' . implode(', ', $imported))->flash();
        }
    
        if ($failed) {
            $this->alert->danger('Failed to import: ' . implode(', ', $failed))->flash();
        }
    
        return redirect()->route('admin.nests');
    }

    /**
     * Update an existing Egg using a new imported file.
     *
     * @throws \Jexactyl\Exceptions\Model\DataValidationException
     * @throws \Jexactyl\Exceptions\Repository\RecordNotFoundException
     * @throws \Jexactyl\Exceptions\Service\Egg\BadJsonFormatException
     * @throws \Jexactyl\Exceptions\Service\InvalidFileUploadException
     */
    public function update(EggImportFormRequest $request, Egg $egg): RedirectResponse
    {
        $this->updateImporterService->handle($egg, $request->file('import_file'));
        $this->alert->success(trans('admin/nests.eggs.notices.updated_via_import'))->flash();

        return redirect()->route('admin.nests.egg.view', ['egg' => $egg]);
    }
}
