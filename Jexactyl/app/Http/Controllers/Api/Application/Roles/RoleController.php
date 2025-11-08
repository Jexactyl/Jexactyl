<?php

namespace Everest\Http\Controllers\Api\Application\Roles;

use Everest\Models\User;
use Everest\Models\AdminRole;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;
use Everest\Exceptions\Http\QueryValueOutOfRangeHttpException;
use Everest\Transformers\Api\Application\AdminRoleTransformer;
use Everest\Http\Requests\Api\Application\Roles\GetRoleRequest;
use Everest\Http\Requests\Api\Application\Roles\GetRolesRequest;
use Everest\Http\Requests\Api\Application\Roles\StoreRoleRequest;
use Everest\Http\Requests\Api\Application\Roles\DeleteRoleRequest;
use Everest\Http\Requests\Api\Application\Roles\UpdateRoleRequest;
use Everest\Http\Controllers\Api\Application\ApplicationApiController;

class RoleController extends ApplicationApiController
{
    /**
     * RoleController constructor.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Returns an array of all roles.
     */
    public function index(GetRolesRequest $request): array
    {
        $perPage = (int) $request->query('per_page', '20');
        if ($perPage < 1 || $perPage > 100) {
            throw new QueryValueOutOfRangeHttpException('per_page', 1, 100);
        }

        $roles = QueryBuilder::for(AdminRole::query())
            ->allowedFilters(['id', 'name'])
            ->allowedSorts(['id', 'name'])
            ->paginate($perPage);

        return $this->fractal->collection($roles)
            ->transformWith(AdminRoleTransformer::class)
            ->toArray();
    }

    /**
     * Returns a single role.
     */
    public function view(GetRoleRequest $request, AdminRole $role): array
    {
        return $this->fractal->item($role)
            ->transformWith(AdminRoleTransformer::class)
            ->toArray();
    }

    /**
     * Returns all of the available admin permissions assignable to users.
     */
    protected function permissions(GetRoleRequest $request): array
    {
        return [
            'object' => 'role_permissions',
            'attributes' => [
                'permissions' => AdminRole::permissions(),
            ],
        ];
    }

    /**
     * Creates a new role.
     */
    public function store(StoreRoleRequest $request): JsonResponse
    {
        $data = array_merge($request->validated(), [
            'sort_id' => 99,
        ]);
        $role = AdminRole::query()->create($data);

        return $this->fractal->item($role)
            ->transformWith(AdminRoleTransformer::class)
            ->respond(JsonResponse::HTTP_CREATED);
    }

    /**
     * Updates a role.
     */
    public function update(UpdateRoleRequest $request, AdminRole $role): array
    {
        $role->update($request->validated());

        return $this->fractal->item($role)
            ->transformWith(AdminRoleTransformer::class)
            ->toArray();
    }

    /**
     * Updates the assigned permissions to a role.
     */
    public function updatePermissions(UpdateRoleRequest $request, AdminRole $role): array
    {
        dd($request->input('permissions'));

        return $this->fractal->item($role)
            ->transformWith(AdminRoleTransformer::class)
            ->toArray();
    }

    /**
     * Deletes a role.
     *
     * @throws \Exception
     */
    public function delete(DeleteRoleRequest $request, AdminRole $role): Response
    {
        // Use DB::transaction to ensure both changes happen successfully, or not at all.
        DB::transaction(function () use ($role) {
            User::where('admin_role_id', $role->id)->update(['admin_role_id' => null, 'root_admin' => false]);

            $role->delete();
        });

        return $this->returnNoContent();
    }
}
