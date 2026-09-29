<?php
// HTTP 206 Partial Content (Byte-Range Streaming) for large .m4a podcast files
// Allows instant online playback & seeking without downloading the entire file.

$fileParam = isset($_GET['file']) ? basename($_GET['file']) : '';
if (!$fileParam || !preg_match('/^[a-zA-Z0-9_-]+\.m4a$/', $fileParam)) {
    http_response_code(404);
    exit;
}

$filePath = realpath(__DIR__ . '/../podcasts/' . $fileParam);
$podcastsDir = realpath(__DIR__ . '/../podcasts');

if (!$filePath || !$podcastsDir || strpos($filePath, $podcastsDir) !== 0 || !is_file($filePath)) {
    http_response_code(404);
    exit;
}

$size = filesize($filePath);
$start = 0;
$end = $size - 1;

header('Content-Type: audio/mp4');
header('Accept-Ranges: bytes');
header('Cache-Control: public, max-age=86400');

if ($_SERVER['REQUEST_METHOD'] === 'HEAD') {
    header("Content-Length: $size");
    exit;
}

if (isset($_SERVER['HTTP_RANGE'])) {
    if (preg_match('/bytes=(\d*)-(\d*)/i', $_SERVER['HTTP_RANGE'], $matches)) {
        if ($matches[1] !== '') {
            $start = intval($matches[1]);
        }
        if ($matches[2] !== '') {
            $end = intval($matches[2]);
        }
        if ($start > $end || $start >= $size) {
            http_response_code(416);
            header("Content-Range: bytes */$size");
            exit;
        }
        http_response_code(206);
        header("Content-Range: bytes $start-$end/$size");
    }
}

$length = $end - $start + 1;
header("Content-Length: $length");

$fp = fopen($filePath, 'rb');
fseek($fp, $start);
$bufferSize = 65536; // 64KB chunks
$bytesRemaining = $length;

while (!feof($fp) && $bytesRemaining > 0 && !connection_aborted()) {
    $readLen = min($bufferSize, $bytesRemaining);
    $data = fread($fp, $readLen);
    if ($data === false) break;
    echo $data;
    flush();
    $bytesRemaining -= strlen($data);
}

fclose($fp);
