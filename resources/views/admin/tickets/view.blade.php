@extends('layouts.admin')

@section('title')
    View ticket {{ $ticket->id }}
@endsection

@section('content-header')
    <h1>Ticket #{{ $ticket->id }}<small>Reply or change the status of this ticket.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li><a href="{{ route('admin.tickets.index') }}">Tickets</a></li>
        <li class="active">View Ticket {{ $ticket->id }}</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
        <div class="alert
            @if($ticket->status == 'pending')
                alert-warning
            @elseif($ticket->status == 'in-progress')
                bg-primary
            @elseif($ticket->status == 'unresolved')
                alert-danger
            @else
                alert-success
            @endif
        ">
            This ticket is currently marked as <code>{{ $ticket->status }}</code>
        </div>
    </div>
</div>
<div class="row">
        <div class="col-xs-12">
            <div class="box box-success">
                <div class="box-header with-border">
                    <form id="deleteform" action="{{ route('admin.tickets.delete', $ticket->id) }}" method="POST">
                        <div class="pull-left">
                            {!! csrf_field() !!}
                            <button class="btn btn-danger">Delete Ticket</button>
                        </div>
                    </form>
                    <form id="statusform" action="{{ route('admin.tickets.status', $ticket->id) }}" method="POST">
                        {!! csrf_field() !!}
                        <div class="pull-right">
                            <button id="unresolvedButton" class="btn btn-danger" name="status" value="unresolved">Mark as Unresolved</button>
                            <button id="pendingButton" class="btn btn-warning" style="margin-left: 8px;" name="status" value="pending">Mark as Pending</button>
                            <button id="resolvedButton" class="btn btn-success" style="margin-left: 8px;" name="status" value="resolved">Mark as Resolved</button>
                            <button id="inProgressButton" class="btn btn-info" style="margin-left: 8px;" name="status" value="in-progress">Mark as In Progress</button>
                        </div>
                    </form>
                 </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                            <tr>
                                <th>Author</th>
                                <th>Content</th>
                                <th></th>
                                <th></th>
                                <th>Sent At</th>
                            </tr>
                            @foreach ($messages as $message)
                                <tr>
                                <td><a href="{{ route('admin.users.view', $ticket->user->id) }}">{{ $ticket->user->email }}</a> @if($ticket->user->root_admin)<i class="fa fa-star text-yellow"></i>@endif</td>
                                    <td class="truncate">{{ $message->content }}</td>
                                    <td></td>
                                    <td></td>
                                    <td>{{ $message->created_at->diffForHumans() }} ({{ $message->created_at }})</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
