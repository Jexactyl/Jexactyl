<?php

return [
    /*
     * Enable or disable the alert module.
     */
    'enabled' => env('ALERT_ENABLED', false),
    
    /*
     * Choose the type of alert that should be shown.
     * 
     * Available types: success, info, warning, danger
     */
    'type' => env('ALERT_TYPE', 'info'),

    /*
     * Define the position that the alert should show
     * up on in the Client UI.
     * 
     * Available types: top-center, bottom-right
     */
    'position' => env('ALERT_POSITION', 'top-center'),

    /*
     * Type a message which the alert will display.
     */
    'content' => env('ALERT_CONTENT', 'This is a Jexactyl Alert.'),

    /*
     * This sets the UUID of the alert. You should not edit this
     * unless you know what you are doing, the system can set this
     * variable on its own accord.
     */
    'uuid' => env('ALERT_UUID', ''),
];
