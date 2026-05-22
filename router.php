<?php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$root = __DIR__;

// Deliver real files directly, e.g. /vendor/... or /dist/...
$file = realpath($root . $uri);
if ($file && str_starts_with($file, $root) && is_file($file)) {
    return false;
}

// Redirect root to /demo/
if ($uri === '/' || $uri === '') {
    require $root . '/demo/index.html';
    return true;
}

// Optional: Make demo files accessible without /demo
$demoFile = realpath($root . '/demo' . $uri);
if ($demoFile && str_starts_with($demoFile, $root . '/demo') && is_file($demoFile)) {
    return false;
}

// Fallback
http_response_code(404);
echo 'Not found';