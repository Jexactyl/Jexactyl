@section('jexactyl::nav')
    <div class="row">
        <div class="col-xs-12">
            <div class="nav-tabs-custom">
                <ul class="nav nav-tabs">
                    <li @if($activeTab === 'index')class="active"@endif><a href="{{ route('admin.jexactyl.index') }}">主页</a></li>
                    <li @if($activeTab === 'store')class="active"@endif><a href="{{ route('admin.jexactyl.store') }}">商店</a></li>
                    <li @if($activeTab === 'registration')class="active"@endif><a href="{{ route('admin.jexactyl.registration') }}">用户注册</a></li>
                    <li @if($activeTab === 'renewal')class="active"@endif><a href="{{ route('admin.jexactyl.renewal') }}">服务器续订</a></li>
                    <li @if($activeTab === 'referrals')class="active"@endif><a href="{{ route('admin.jexactyl.referrals') }}">推广</a></li>
                </ul>
            </div>
        </div>
    </div>
@endsection
