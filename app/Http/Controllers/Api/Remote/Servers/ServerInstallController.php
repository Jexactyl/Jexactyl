<?php

namespace Everest\Http\Controllers\Api\Remote\Servers;

use Everest\Models\Server;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Everest\Repositories\Eloquent\ServerRepository;
use Everest\Http\Requests\Api\Remote\InstallationDataRequest;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class ServerInstallController extends ApplicationApiController
{
    /**
     * ServerInstallController constructor.
     */
    public function __construct(private ServerRepository $repository)
    {
    }

    /**
     * Returns installation information for a server.
     *
     * @throws \Everest\Exceptions\Repository\RecordNotFoundException
     */
    public function index(Request $request, string $uuid): JsonResponse
    {
        /** @var \Everest\Models\Node $node */
        $node = $request->attributes->get('node');

        $server = $this->repository->getByUuid($uuid);
        if ($server->node_id !== $node->id) {
            throw new NotFoundHttpException();
        }

        $egg = $server->egg;

        return new JsonResponse([
            'container_image' => $egg->copy_script_container,
            'entrypoint' => $egg->copy_script_entry,
            'script' => $egg->copy_script_install,
        ]);
    }

    /**
     * Updates the installation state of a server.
     *
     * @throws \Everest\Exceptions\Repository\RecordNotFoundException
     * @throws \Everest\Exceptions\Model\DataValidationException
     */
    public function store(InstallationDataRequest $request, string $uuid): Response
    {
        /** @var \Everest\Models\Node $node */
        $node = $request->attributes->get('node');

        $server = $this->repository->getByUuid($uuid);
        if ($server->node_id !== $node->id) {
            throw new NotFoundHttpException();
        }

        $status = null;

        // Make sure the type of failure is accurate
        if (!$request->boolean('successful')) {
            $status = Server::STATUS_INSTALL_FAILED;

            if ($request->boolean('reinstall')) {
                $status = Server::STATUS_REINSTALL_FAILED;
            }
        }

        // Keep the server suspended if it's already suspended
        if ($server->status === Server::STATUS_SUSPENDED) {
            $status = Server::STATUS_SUSPENDED;
        }

        $this->repository->update($server->id, ['status' => $status, 'installed_at' => CarbonImmutable::now()], true, true);

        return $this->returnNoContent();
    }
}
