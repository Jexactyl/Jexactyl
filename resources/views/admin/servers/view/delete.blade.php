{{-- Pterodactyl CHINA - Panel --}}
{{-- Copyright (c) 2015 - 2017 Dane Everitt <dane@daneeveritt.com> --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')

@section('title')
    服务器实例 — {{ $server->name }}: 删除
@endsection

@section('content-header')
    <h1>{{ $server->name }}<small>将此服务器从面板上删除.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.servers') }}">服务器实例</a></li>
        <li><a href="{{ route('admin.servers.view', $server->id) }}">{{ $server->name }}</a></li>
        <li class="active">删除</li>
    </ol>
@endsection

@section('content')
@include('admin.servers.partials.navigation')
<div class="row">
    <form id="deleteform" action="{{ route('admin.servers.view.delete', $server->id) }}" method="POST">
        <div class="col-md-6">
            <div class="box box-warning">
                <div class="box-header with-border">
                    <h3 class="box-title">安全删除服务器实例</h3>
                </div>
                <div class="box-body">
                    <p>此操作将尝试从面板和守护程序中删除服务器实例数据。</p>
                    <div class="checkbox checkbox-primary no-margin-bottom">
                        <input id="pReturnResourcesSafe" name="return_resources" type="checkbox" value="1" />
                        <label for="pReturnResourcesSafe">在服务器实例删除时将资源返还给用户？</label>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <button id="deletebtn" class="btn btn-warning">安全地删除该服务器</button>
                </div>
            </div>
        </div>
    </form>
    <form id="forcedeleteform" action="{{ route('admin.servers.view.delete', $server->id) }}" method="POST">
        <div class="col-md-6">
            <div class="box box-danger">
                <div class="box-header with-border">
                    <h3 class="box-title">强制删除服务器实例</h3>
                </div>
                <div class="box-body">
                    <p>此操作将尝试从面板和守护程序中删除服务器。如果守护进程没有响应，或报告错误，删除操作将继续。</p>
                    <div class="checkbox checkbox-primary no-margin-bottom">
                        <input id="pReturnResources" name="return_resources" type="checkbox" value="1" />
                        <label for="pReturnResources">在服务器实例删除时将资源返还给用户？</label>
                    </div>
                </div>
                <div class="box-footer">
                    {!! csrf_field() !!}
                    <input type="hidden" name="force_delete" value="1" />
                    <button id="forcedeletebtn"" class="btn btn-danger">强制删除服务器实例</button>
                </div>
            </div>
        </div>
    </form>
</div>
@endsection

@section('footer-scripts')
    @parent
    <script>
    $('#deletebtn').click(function (event) {
        event.preventDefault();
        swal({
            title: '删除服务器实例',
            text: '您确定要删除此服务器吗？ 没有回头路，所有数据将立即被删除。',
            showCancelButton: true,
            confirmButtonText: '删除',
            confirmButtonColor: 'orange',
            closeOnConfirm: false
        }, function () {
            $('#deleteform').submit()
        });
    });

    $('#forcedeletebtn').click(function (event) {
        event.preventDefault();
        swal({
            title: '删除服务器实例',
            text: '您确定要删除此服务器吗？ 没有回头路，所有数据将立即被删除。',
            showCancelButton: true,
            confirmButtonText: '删除',
            confirmButtonColor: 'red',
            closeOnConfirm: false
        }, function () {
            $('#forcedeleteform').submit()
        });
    });
    </script>
@endsection
