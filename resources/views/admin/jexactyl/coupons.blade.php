@extends('layouts.admin')
@include('partials/admin.jexactyl.nav', ['activeTab' => 'coupons'])

@section('title')
    Coupons
@endsection

@section('content-header')
    <h1>Coupons<small>Create and manage coupons.</small></h1>
    <ol class="breadcrumb">
        <li><a href="{{ route('admin.index') }}">Admin</a></li>
        <li class="active">Jexactyl</li>
    </ol>
@endsection

@section('content')
    @yield('jexactyl::nav')
    <form action="{{ route('admin.jexactyl.coupons') }}" method="POST">
        <div class="row">
            <div class="col-xs-12">
                <div class="box @if($enabled) box-success @else box-danger @endif">
                    <div class="box-header with-border">
                        <i class="fa fa-cash"></i>
                        <h3 class="box-title">Coupon System</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-3">
                                <label for="enabled" class="control-label">Status</label>
                                <select name="enabled" id="enabled" class="form-control">
                                    <option value="1" @if($enabled) selected @endif>Enabled</option>
                                    <option value="0" @if(!$enabled) selected @endif>Disabled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="PATCH" class="btn btn-default pull-right">Save</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
    <form action="{{ route('admin.jexactyl.coupons.store') }}" method="POST">
        <div class="row">
            <div class="col-xs-12">
                <div class="box">
                    <div class="box-header">
                        <h3 class="box-title">Create Coupon</h3>
                    </div>
                    <div class="box-body">
                        <div class="row">
                            <div class="form-group col-md-3">
                                <label for="code">Code</label>
                                <input type="text" name="code" id="code" class="form-control"/>
                                <small>A unique code for the coupon.</small>
                            </div>
                            <div class="form-group col-md-3">
                                <label for="credits">Credits</label>
                                <input type="number" name="credits" id="credits" class="form-control"/>
                                <small>The amount of credits to give when redeemed.</small>
                            </div>
                            <div class="form-group col-md-3">
                                <label for="expires">Expires In</label>
                                <input type="number" name="expires" id="expires" class="form-control" value="12"/>
                                <small>The amount of time in hours until the coupon expires. Leave blank for never.</small>
                            </div>
                            <div class="form-group col-md-3">
                                <label for="uses">Max Uses</label>
                                <input type="number" name="uses" id="uses" class="form-control" value="1"/>
                                <small>The maximum amount of times this coupon can be used.</small>
                            </div>
                        </div>
                    </div>
                    <div class="box-footer">
                        {!! csrf_field() !!}
                        <button type="submit" name="_method" value="POST" class="btn btn-default pull-right">Create</button>
                    </div>
                </div>
            </div>
        </div>
    </form>
    <div class="row">
        <div class="col-xs-12">
            <div class="box">
                <div class="box-header">
                    <h3 class="box-title">Coupons</h3>
                </div>
                <div class="box-body table-responsive no-padding">
                    <table class="table table-hover">
                        <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Code</th>
                            <th>Credits</th>
                            <th>Uses Remaining</th>
                            <th>Expires At</th>
                            <th>Expired</th>
                        </tr>
                        @foreach($coupons as $coupon)
                            <tr>
                                <td>{{ $coupon->id }}</td>
                                <td>{{ $coupon->code }}</td>
                                <td>{{ $coupon->cr_amount }}</td>
                                <td>{{ $coupon->uses }}</td>
                                <td>{{ $coupon->expires }}</td>
                                <td>@if($coupon->expired) Yes @else No @endif</td>
                            </tr>
                        @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection
