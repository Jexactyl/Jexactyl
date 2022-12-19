@extends('layouts.admin')

@section('title')
    List Tickets
@endsection

@section('content-header')
    <h1>Tickets<small>View all of the tickets on the system.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Ticekts</li>
    </ol>
@endsection

@section('content')
<div class="row">
    <div class="col-xs-12">
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
                                <td><a href="{{ route('admin.tickets.index', $ticket->id) }}">{{ $ticket->id }}</a></td>
                                <td><a href="{{ route('admin.users.view', $ticket->client_id) }}">{{ $ticket->user->email }}</a></td>
                                <td><code title="{{ $ticket->title }}">{{ $ticket->title }}</code></td>
                                <td>{{ $ticket->created_at->diffForHumans() }}</td>
                                <td class="text-center">
                                    @if($ticket->status == 'pending')
                                        <span class="label bg-black">Pending</span>
                                    @elseif($ticket->status == 'in-progress')
                                        <span class="label label-warning">In Progress</span>
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
