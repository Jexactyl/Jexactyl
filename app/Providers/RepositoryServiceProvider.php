<?php

namespace Jexactyl\Providers;

use Illuminate\Support\ServiceProvider;
use Jexactyl\Repositories\Eloquent\EggRepository;
use Jexactyl\Repositories\Eloquent\NestRepository;
use Jexactyl\Repositories\Eloquent\NodeRepository;
use Jexactyl\Repositories\Eloquent\TaskRepository;
use Jexactyl\Repositories\Eloquent\UserRepository;
use Jexactyl\Repositories\Eloquent\ApiKeyRepository;
use Jexactyl\Repositories\Eloquent\ServerRepository;
use Jexactyl\Repositories\Eloquent\SessionRepository;
use Jexactyl\Repositories\Eloquent\SubuserRepository;
use Jexactyl\Repositories\Eloquent\DatabaseRepository;
use Jexactyl\Repositories\Eloquent\LocationRepository;
use Jexactyl\Repositories\Eloquent\ScheduleRepository;
use Jexactyl\Repositories\Eloquent\SettingsRepository;
use Jexactyl\Repositories\Eloquent\AllocationRepository;
use Jexactyl\Contracts\Repository\EggRepositoryInterface;
use Jexactyl\Repositories\Eloquent\EggVariableRepository;
use Jexactyl\Contracts\Repository\NestRepositoryInterface;
use Jexactyl\Contracts\Repository\NodeRepositoryInterface;
use Jexactyl\Contracts\Repository\TaskRepositoryInterface;
use Jexactyl\Contracts\Repository\UserRepositoryInterface;
use Jexactyl\Repositories\Eloquent\DatabaseHostRepository;
use Jexactyl\Contracts\Repository\ApiKeyRepositoryInterface;
use Jexactyl\Contracts\Repository\ServerRepositoryInterface;
use Jexactyl\Repositories\Eloquent\ServerVariableRepository;
use Jexactyl\Contracts\Repository\SessionRepositoryInterface;
use Jexactyl\Contracts\Repository\SubuserRepositoryInterface;
use Jexactyl\Contracts\Repository\DatabaseRepositoryInterface;
use Jexactyl\Contracts\Repository\LocationRepositoryInterface;
use Jexactyl\Contracts\Repository\ScheduleRepositoryInterface;
use Jexactyl\Contracts\Repository\SettingsRepositoryInterface;
use Jexactyl\Contracts\Repository\AllocationRepositoryInterface;
use Jexactyl\Contracts\Repository\EggVariableRepositoryInterface;
use Jexactyl\Contracts\Repository\DatabaseHostRepositoryInterface;
use Jexactyl\Contracts\Repository\ServerVariableRepositoryInterface;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register all of the repository bindings.
     */
    public function register()
    {
        // Eloquent Repositories
        $this->app->bind(AllocationRepositoryInterface::class, AllocationRepository::class);
        $this->app->bind(ApiKeyRepositoryInterface::class, ApiKeyRepository::class);
        $this->app->bind(DatabaseRepositoryInterface::class, DatabaseRepository::class);
        $this->app->bind(DatabaseHostRepositoryInterface::class, DatabaseHostRepository::class);
        $this->app->bind(EggRepositoryInterface::class, EggRepository::class);
        $this->app->bind(EggVariableRepositoryInterface::class, EggVariableRepository::class);
        $this->app->bind(LocationRepositoryInterface::class, LocationRepository::class);
        $this->app->bind(NestRepositoryInterface::class, NestRepository::class);
        $this->app->bind(NodeRepositoryInterface::class, NodeRepository::class);
        $this->app->bind(ScheduleRepositoryInterface::class, ScheduleRepository::class);
        $this->app->bind(ServerRepositoryInterface::class, ServerRepository::class);
        $this->app->bind(ServerVariableRepositoryInterface::class, ServerVariableRepository::class);
        $this->app->bind(SessionRepositoryInterface::class, SessionRepository::class);
        $this->app->bind(SettingsRepositoryInterface::class, SettingsRepository::class);
        $this->app->bind(SubuserRepositoryInterface::class, SubuserRepository::class);
        $this->app->bind(TaskRepositoryInterface::class, TaskRepository::class);
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
    }
}
