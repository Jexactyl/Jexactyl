@extends('layouts.admin')

@section('title')
    List Tickets
@endsection

@section('content-header')
    <h1>Tickets<small>View all of the tickets on the system.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Tickets</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <form action="{{ route('admin.tickets.index') }}" method="POST">
            <div class="box @if($enabled == 'true') box-success @else box-danger @endif">
                <div class="box-header with-border">
                    <i class="fa fa-ticket"></i> <h3 class="box-title">Ticket System <small>Toggle whether tickets can be used.</small></h3>
                </div>
                <div class="box-body">
                    <div class="row">
                        <div class="form-group col-md-4">
                            <label class="control-label">Allow ticket creation?</label>
                            <div>
                                <select name="enabled" class="form-control">
                                    <option @if ($enabled == 'false') selected @endif value="false">Disabled</option>
                                    <option @if ($enabled == 'true') selected @endif value="true">Enabled</option>
                                </select>
                                <p class="text-muted"><small>Determines whether people can create tickets via the client UI.</small></p>
                            </div>
                        </div>
                        <div class="form-group col-md-4">
                                <label class="control-label">Maximum ticket amount</label>
                                <div>
                                    <input type="text" class="form-control" name="max" value="{{ $max }}" />
                                    <p class="text-muted"><small>Set the maximum amount of tickets a user can create.</small></p>
                                </div>
                            </div>
                    </div>
                    {!! csrf_field() !!}
                    <button type="submit" name="_method" value="POST" class="btn btn-default pull-right">Save Changes</button>
                </div>
            </div>
        </form>
        <div class="box box-primary">
            <div class="box-header with-border">
                <h3 class="box-title">Ticket List</h3>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover">
                    <tbody>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Client Email</th>
                            <th>Title</th>
                            <th>Created At</th>
                            <th></th>
                        </tr>
                        @foreach ($tickets as $ticket)
                            <tr data-ticket="{{ $ticket->id }}">
                                <td><a href="{{ route('admin.tickets.view', $ticket->id) }}">{{ $ticket->id }}</a></td>
                                <td><a href="{{ route('admin.users.view', $ticket->client_id) }}">{{ $ticket->user->email ?? 'N/A' }}</a></td>
                                <td style="
                                    white-space: nowrap;
                                    overflow: hidden;
                                    text-overflow: ellipsis;
                                    max-width: 32ch;
                                "><code title="{{ $ticket->title }}">{{ $ticket->title }}</code></td>
                                <td>{{ $ticket->created_at->diffForHumans() }}</td>
                                <td class="text-center">
                                    @if($ticket->status == 'pending')
                                        <span class="label label-warning">Pending</span>
                                    @elseif($ticket->status == 'in-progress')
                                        <span class="label label-primary">In Progress</span>
                                    @elseif($ticket->status == 'unresolved')
                                        <span class="label label-danger">Unresolved</span>
                                    @else
                                        <span class="label label-success">Resolved</span>
                                    @endif
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>
@endsection
