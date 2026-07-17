<?php

namespace Everest\Http\Controllers\Api\Application;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Illuminate\Container\Container;
use Everest\Http\Controllers\Controller;
use Everest\Extensions\Spatie\Fractalistic\Fractal;
use Everest\Services\Permission\AdminPermissionService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use League\Fractal\Pagination\IlluminatePaginatorAdapter;

abstract class ApplicationApiController extends Controller
{
    protected Fractal $fractal;
    protected Request $request;
    protected AdminPermissionService $permissionService;

    /**
     * ApplicationApiController constructor.
     */
    public function __construct()
    {
        Container::getInstance()->call([$this, 'loadDependencies']);

        // Parse all the includes to use on this request.
        $input = $this->request->input('include', []);
        $input = is_array($input) ? $input : explode(',', $input);

        $includes = (new Collection($input))->map(function ($value) {
            return trim($value);
        })->filter()->toArray();

        $this->fractal->parseIncludes($includes);
        $this->fractal->limitRecursion(2);
    }

    /**
     * Perform dependency injection of certain classes needed for core functionality
     * without littering the constructors of classes that extend this abstract.
     */
    public function loadDependencies(Fractal $fractal, Request $request)
    {
        $this->fractal = $fractal;
        $this->request = $request;
    }

    /**
     * Return an HTTP/201 response for the API.
     */
    protected function returnAccepted(): Response
    {
        return new Response('', Response::HTTP_ACCEPTED);
    }

    /**
     * Return an HTTP/204 response for the API.
     */
    protected function returnNoContent(): Response
    {
        return new Response('', Response::HTTP_NO_CONTENT);
    }

    /**
     * Return an HTTP/204 response for the API.
     */
    protected function adminPermissions(Request $request): array
    {
        return [
            'object' => 'admin_permissions',
            'attributes' => [
                'permissions' => $this->permissionService->handle($request->user()),
            ],
        ];
    }

    protected function transform(mixed $data, string $transformer): array
    {
        $transformerInstance = is_string($transformer)
            ? app($transformer)
            : $transformer;

        if ($data instanceof LengthAwarePaginator) {
            return $this->fractal
                ->collection($data->items())
                ->transformWith($transformerInstance)
                ->paginateWith(new IlluminatePaginatorAdapter($data))
                ->toArray();
        }

        $resource = is_iterable($data)
            ? $this->fractal->collection($data)
            : $this->fractal->item($data);

        return $resource
            ->transformWith($transformerInstance)
            ->toArray();
    }
}
