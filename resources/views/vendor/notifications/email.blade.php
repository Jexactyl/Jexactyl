<!DOCTYPE html>
<html>

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <style type="text/css" rel="stylesheet" media="all">
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Media Queries */
        @media only screen and (max-width: 500px) {
            .button {
                width: 100% !important;
            }
            .email-body_inner {
                width: 100% !important;
            }
        }
    </style>
</head>

<?php

$style = [
    /* Layout ------------------------------ */

    'body' => 'margin: 0; padding: 0; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);',
    'email-wrapper' => 'width: 100%; margin: 0; padding: 0; background: transparent;',

    /* Masthead ----------------------- */

    'email-masthead' => 'padding: 40px 0 30px; text-align: center;',
    'email-masthead_name' => 'font-size: 28px; font-weight: 700; color: #ffffff; text-decoration: none; text-shadow: 0 2px 4px rgba(0,0,0,0.1); letter-spacing: -0.5px;',

    'email-body' => 'width: 100%; margin: 0; padding: 0; background-color: #ffffff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);',
    'email-body_inner' => 'width: auto; max-width: 600px; margin: 0 auto; padding: 0;',
    'email-body_cell' => 'padding: 50px 40px;',

    'email-footer' => 'width: auto; max-width: 600px; margin: 0 auto; padding: 0; text-align: center;',
    'email-footer_cell' => 'color: rgba(255,255,255,0.8); padding: 30px 20px; text-align: center;',

    /* Body ------------------------------ */

    'body_action' => 'width: 100%; margin: 35px auto; padding: 0; text-align: center;',
    'body_sub' => 'margin-top: 30px; padding-top: 30px; border-top: 2px solid #f0f0f0;',

    /* Type ------------------------------ */

    'anchor' => 'color: #667eea; font-weight: 500;',
    'header-1' => 'margin-top: 0; margin-bottom: 20px; color: #1a1a1a; font-size: 28px; font-weight: 700; text-align: left; line-height: 1.3;',
    'paragraph' => 'margin-top: 0; margin-bottom: 16px; color: #4a5568; font-size: 16px; line-height: 1.6;',
    'paragraph-sub' => 'margin-top: 0; color: #718096; font-size: 13px; line-height: 1.5;',
    'paragraph-center' => 'text-align: center;',

    /* Buttons ------------------------------ */

    'button' => 'display: inline-block; width: auto; min-width: 200px; padding: 16px 32px;
                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                 border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600;
                 line-height: 1.5; text-align: center; text-decoration: none;
                 -webkit-text-size-adjust: none; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                 transition: all 0.3s ease;',

    'button--green' => 'background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);',
    'button--red' => 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);',
    'button--blue' => 'background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);',
];
?>

<?php $fontFamily = 'font-family: Arial, \'Helvetica Neue\', Helvetica, sans-serif;'; ?>

<body style="{{ $style['body'] }}">
    <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
            <td style="{{ $style['email-wrapper'] }}" align="center">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="{{ $style['email-masthead'] }}">
                            <a style="{{ $fontFamily }} {{ $style['email-masthead_name'] }}" href="{{ url('/') }}" target="_blank">
                                {{ config('app.name') }}
                            </a>
                        </td>
                    </tr>

                    <!-- Email Body -->
                    <tr>
                        <td style="{{ $style['email-body'] }}" width="100%">
                            <table style="{{ $style['email-body_inner'] }}" align="center" width="600" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="{{ $fontFamily }} {{ $style['email-body_cell'] }}">
                                        <!-- Greeting -->
                                        <h1 style="{{ $style['header-1'] }}">
                                            @if (! empty($greeting))
                                                {{ $greeting }}
                                            @else
                                                @if ($level == 'error')
                                                    Whoops!
                                                @else
                                                    Hello!
                                                @endif
                                            @endif
                                        </h1>

                                        <!-- Intro -->
                                        @foreach ($introLines as $line)
                                            <p style="{{ $style['paragraph'] }}">
                                                {{ $line }}
                                            </p>
                                        @endforeach

                                        <!-- Action Button -->
                                        @if (isset($actionText))
                                            <table style="{{ $style['body_action'] }}" align="center" width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td align="center">
                                                        <?php
                                                            switch ($level) {
                                                                case 'success':
                                                                    $actionColor = 'button--green';
                                                                    break;
                                                                case 'error':
                                                                    $actionColor = 'button--red';
                                                                    break;
                                                                default:
                                                                    $actionColor = 'button--blue';
                                                            }
                                                        ?>

                                                        <a href="{{ $actionUrl }}"
                                                            style="{{ $fontFamily }} {{ $style['button'] }} {{ $style[$actionColor] }}"
                                                            class="button"
                                                            target="_blank">
                                                            {{ $actionText }}
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>
                                        @endif

                                        <!-- Outro -->
                                        @foreach ($outroLines as $line)
                                            <p style="{{ $style['paragraph'] }}">
                                                {{ $line }}
                                            </p>
                                        @endforeach

                                        <!-- Salutation -->
                                        <p style="{{ $style['paragraph'] }}">
                                            Regards,<br>{{ config('app.name') }}
                                        </p>

                                        <!-- Sub Copy -->
                                        @if (isset($actionText))
                                            <table style="{{ $style['body_sub'] }}">
                                                <tr>
                                                    <td style="{{ $fontFamily }}">
                                                        <p style="{{ $style['paragraph-sub'] }}">
                                                            If you’re having trouble clicking the "{{ $actionText }}" button,
                                                            copy and paste the URL below into your web browser:
                                                        </p>

                                                        <p style="{{ $style['paragraph-sub'] }}">
                                                            <a style="{{ $style['anchor'] }}" href="{{ $actionUrl }}" target="_blank">
                                                                {{ $actionUrl }}
                                                            </a>
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td>
                            <table style="{{ $style['email-footer'] }}" align="center" width="600" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="{{ $fontFamily }} {{ $style['email-footer_cell'] }}">
                                        <p style="{{ $style['paragraph-sub'] }}">
                                            &copy; {{ date('Y') }}
                                            <a style="color: #ffffff; font-weight: 600; text-decoration: none;" href="{{ url('/') }}" target="_blank">{{ config('app.name') }}</a>
                                            <br>
                                            <span style="opacity: 0.8;">All rights reserved.</span>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
