{{-- Pterodactyl CHINA - Panel --}}
{{-- Simplified Chinese Translation Copyright (c) 2018 - 2022 ValiantShishu <vlssu@vlssu.com> --}}

{{-- This software is licensed under the terms of the MIT license. --}}
{{-- https://opensource.org/licenses/MIT --}}
@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'theme'])

@section('title')
    Jexactyl 主题
@endsection

@section('content-header')
    <h1>Jexactyl 主题<small>配置 Jexactyl 的主题。</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">管理</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
    @yield('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <form action="{{ route('admin.jexactyl.theme') }}" method="POST">
                <div class="box box-info
                ">
                    <div class="box-header with-border">
                        <h3 class="box-title">选择系统主题 <small>选择 Jexactyl 的主题。</small></h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-4">
                                <label class="control-label">Enabled</label>
                                <div>
                                    <select name="theme:current" class="form-control">
                                        <option @if ($current == 'default') selected @endif value="default">默认主题</option>
                                        <option @if ($current == 'dark') selected @endif value="dark">深色主题</option>
                                        <option @if ($current == 'light') selected @endif value="light">亮色主题</option>
                                    </select>
                                    <p class="text-muted"><small>确定 Jexactyl 的 UI 的主题。</small></p>
                                </div>
                            </div>
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
@endsection
