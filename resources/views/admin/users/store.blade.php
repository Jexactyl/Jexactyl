{{-- Pterodactyl CHINA - Panel --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')
@include('partials/admin.users.nav', ['activeTab' => 'storefront', 'user' => $user])

@section('title')
    店面详细信息： {{ $user->username }}
@endsection

@section('content-header')
    <h1>{{ $user->name_first }} {{ $user->name_last}}<small>{{ $user->username }}</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li><a href="{{ route('admin.users') }}">用户</a></li>
        <li class="{{ route('admin.users.view', ['user' => $user]) }}">{{ $user->username }}</li>
        <li class="active">店面</li>
    </ol>
@endsection

@section('content')
    @yield('users::nav')
    <div class="row">
            <div class="col-xs-12">
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">用户资源</h3>
                    </div>
                    <form action="{{ route('admin.users.store', $user->id) }}" method="POST">
                        <div class="box-body">
                            <div class="row">
                                <div class="form-group col-md-4">
                                    <label for="store_balance" class="control-label">总余额</label>
                                    <input type="text" id="store_balance" value="{{ $user->store_balance }}" name="store_balance" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_cpu" class="control-label">可用的 CPU 总量</label>
                                    <input type="text" id="store_cpu" value="{{ $user->store_cpu }}" name="store_cpu" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_memory" class="control-label">可用的内存 (RAM) 总量</label>
                                    <input type="text" id="store_memory" value="{{ $user->store_memory }}" name="store_memory" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_disk" class="control-label">可用的存储空间总量</label>
                                    <input type="text" id="store_disk" value="{{ $user->store_disk }}" name="store_disk" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_slots" class="control-label">可用的服务器实例</label>
                                    <input type="text" id="store_slots" value="{{ $user->store_slots }}" name="store_slots" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_ports" class="control-label">可用端口总数</label>
                                    <input type="text" id="store_ports" value="{{ $user->store_ports }}" name="store_ports" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_backups" class="control-label">可用备份总数</label>
                                    <input type="text" id="store_backups" value="{{ $user->store_backups }}" name="store_backups" class="form-control form-autocomplete-stop">
                                </div>
                                <div class="form-group col-md-4">
                                    <label for="store_databases" class="control-label">可用数据库总数</label>
                                    <input type="text" id="store_databases" value="{{ $user->store_databases }}" name="store_databases" class="form-control form-autocomplete-stop">
                                </div>
                            </div>
                        </div>
                        <div class="box-footer">
                            {!! csrf_field() !!}
                            <button type="submit" name="_method" value="PATCH" class="btn btn-sm btn-primary pull-right">保存更改</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
@endsection
