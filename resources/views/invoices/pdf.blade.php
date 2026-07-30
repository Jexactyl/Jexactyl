<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <style>
        body {
            font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
            color: #2F3133;
            font-size: 12px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        .header-table td {
            vertical-align: top;
            padding-bottom: 20px;
        }
        .brand {
            font-size: 18px;
            font-weight: bold;
            color: #2F3133;
        }
        .muted {
            color: #74787E;
        }
        .text-right {
            text-align: right;
        }
        .section-title {
            color: #2F3133;
            font-size: 13px;
            font-weight: bold;
            margin: 20px 0 8px 0;
            border-bottom: 1px solid #EDEFF2;
            padding-bottom: 4px;
        }
        .details-table td {
            padding: 3px 0;
        }
        .line-items {
            margin-top: 8px;
        }
        .line-items th {
            text-align: left;
            background-color: #F2F4F6;
            padding: 8px;
            font-size: 11px;
            color: #74787E;
            border-bottom: 1px solid #EDEFF2;
        }
        .line-items th.text-right {
            text-align: right;
        }
        .line-items td {
            padding: 8px;
            border-bottom: 1px solid #EDEFF2;
        }
        .total-row td {
            padding: 10px 8px;
            font-weight: bold;
            font-size: 14px;
            border-top: 2px solid #2F3133;
            border-bottom: none;
        }
        .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #EDEFF2;
            color: #AEAEAE;
            font-size: 10px;
            text-align: center;
        }
    </style>
</head>
<body>
    <table class="header-table">
        <tr>
            <td width="50%">
                <div class="brand">{{ config('app.name') }}</div>
            </td>
            <td width="50%" class="text-right">
                <div><strong>Invoice {{ $snapshot['invoice_number'] }}</strong></div>
                <div class="muted">Issued: {{ \Illuminate\Support\Carbon::parse($snapshot['issued_at'])->format('M j, Y') }}</div>
            </td>
        </tr>
    </table>

    <table>
        <tr>
            <td width="50%">
                <div class="section-title">Billed To</div>
                <table class="details-table">
                    <tr><td>{{ $snapshot['billed_to']['username'] }}</td></tr>
                    <tr><td class="muted">{{ $snapshot['billed_to']['email'] }}</td></tr>
                </table>
            </td>
            <td width="50%">
                <div class="section-title">Order</div>
                <table class="details-table">
                    <tr><td class="muted">Order ID</td><td class="text-right">#{{ $snapshot['order_id'] }}</td></tr>
                    <tr><td class="muted">Type</td><td class="text-right">{{ ucfirst($snapshot['order_type']) }}</td></tr>
                    @if ($snapshot['expires_at'])
                        <tr>
                            <td class="muted">Service Expires</td>
                            <td class="text-right">{{ \Illuminate\Support\Carbon::parse($snapshot['expires_at'])->format('M j, Y') }}</td>
                        </tr>
                    @endif
                </table>
            </td>
        </tr>
    </table>

    @if ($snapshot['server'] || $snapshot['node'] || $snapshot['egg'])
        <div class="section-title">Deployment</div>
        <table class="details-table">
            @if ($snapshot['server'])
                <tr><td class="muted" width="30%">Server</td><td>{{ $snapshot['server']['name'] }}</td></tr>
            @endif
            @if ($snapshot['node'])
                <tr><td class="muted">Node</td><td>{{ $snapshot['node']['name'] }} ({{ $snapshot['node']['fqdn'] }})</td></tr>
            @endif
            @if ($snapshot['egg'])
                <tr><td class="muted">Software</td><td>{{ $snapshot['egg']['name'] }}</td></tr>
            @endif
            @if ($snapshot['product'])
                <tr>
                    <td class="muted">Resources</td>
                    <td>
                        {{ $snapshot['product']['cpu_limit'] }}% CPU,
                        {{ number_format($snapshot['product']['memory_limit'] / 1024, 1) }} GiB Memory,
                        {{ number_format($snapshot['product']['disk_limit'] / 1024, 1) }} GiB Disk
                    </td>
                </tr>
            @endif
        </table>
    @endif

    <div class="section-title">Charges</div>
    <table class="line-items">
        <thead>
            <tr>
                <th>Description</th>
                <th class="text-right">Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($snapshot['line_items'] as $item)
                <tr>
                    <td>{{ $item['description'] }}</td>
                    <td class="text-right">{{ $snapshot['currency']['symbol'] }}{{ number_format($item['amount'], 2) }}</td>
                </tr>
            @endforeach
            <tr class="total-row">
                <td>Total</td>
                <td class="text-right">{{ $snapshot['currency']['symbol'] }}{{ number_format($snapshot['total'], 2) }} {{ strtoupper($snapshot['currency']['code']) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="footer">
        Generated by {{ config('app.name') }} &middot; {{ url('/') }}
    </div>
</body>
</html>
