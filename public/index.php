<?php

if (!function_exists('request_parse_body')) {
    function request_parse_body(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $input = file_get_contents('php://input');
        $post = [];
        $files = [];

        if (str_contains($contentType, 'application/json')) {
            $data = json_decode($input, true);
            if (is_array($data)) {
                $post = $data;
            }
        } elseif (str_contains($contentType, 'application/x-www-form-urlencoded')) {
            parse_str($input, $post);
        } elseif (str_contains($contentType, 'multipart/form-data')) {
            preg_match('/boundary=(.*)$/is', $contentType, $matches);
            if (isset($matches[1])) {
                $boundary = $matches[1];
                $blocks = preg_split("/-+" . preg_quote($boundary, '/') . "/s", $input);
                foreach ($blocks as $block) {
                    if (empty($block) || str_contains($block, '--')) {
                        continue;
                    }
                    $parts = preg_split("/\r\n\r\n|\n\n/s", ltrim($block), 2);
                    if (count($parts) < 2) {
                        continue;
                    }
                    $headers = $parts[0];
                    $body = rtrim($parts[1], "\r\n");

                    if (preg_match('/name="([^"]*)"/is', $headers, $nameMatch)) {
                        $name = $nameMatch[1];
                        if (preg_match('/filename="([^"]*)"/is', $headers, $fileMatch)) {
                            $filename = $fileMatch[1];
                            preg_match('/Content-Type:\s*([^\s]*)/is', $headers, $typeMatch);
                            $mimeType = $typeMatch[1] ?? 'application/octet-stream';
                            
                            $tmpPath = tempnam(sys_get_temp_dir(), 'php_upload_');
                            file_put_contents($tmpPath, $body);

                            $files[$name] = [
                                'name' => $filename,
                                'type' => $mimeType,
                                'tmp_name' => $tmpPath,
                                'error' => UPLOAD_ERR_OK,
                                'size' => strlen($body),
                            ];
                        } else {
                            $post[$name] = $body;
                        }
                    }
                }
            }
        }

        return [$post ?: $_POST, $files ?: $_FILES];
    }
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Clean URL support: automatically detect the subdirectory and override SCRIPT_NAME
// when accessed via clean URL rewrite (not containing /public/ in the request path).
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$pos = strpos($scriptName, '/public/index.php');
if ($pos !== false) {
    $subDir = substr($scriptName, 0, $pos);
    $requestUri = $_SERVER['REQUEST_URI'] ?? '';
    
    // If request does not go through the physical /public/ directory path
    if (!str_contains($requestUri, $subDir . '/public/')) {
        $_SERVER['SCRIPT_NAME'] = $subDir . '/index.php';
        $_SERVER['PHP_SELF']    = $subDir . '/index.php';
    }
}



// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
