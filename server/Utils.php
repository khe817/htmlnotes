<?php

namespace HTMLNotes;

use Throwable;

class Utils {

    /**
     * @return string: e.g. "4fbc7520-2df1-432d-9488-dc71e06bf181"
     */
    public static function uuid(): string {
        // Generate 16 bytes (128 bits) of random data
        $data = random_bytes(16);

        // Set version to 0100 (UUIDv4)
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);

        // Set variant to 10xx
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

        // Format as 8-4-4-4-12 hex string
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * @return string: Only the first portion of a string. e.g. "This is abbreviated ..."
     */
    public static function abbreviate(string $string, int $length) {
        $abbreviatedStr  = substr($string, 0, $length);
        $abbreviatedStr  = strip_tags($abbreviatedStr);
        $abbreviatedStr .= '...';
        return $abbreviatedStr;
    }

    /**
     * Get full file path of a note.
     */
    public static function noteFilePath(string $id): string {
        return BASEDIR . '/notes/' . $id . NOTE_FILE_EXT;
    }

    public static function noteTemplateFilePath(): string {
        return BASEDIR . '/' . NOTE_TEMPLATE;
    }

    public static function jsonResponse(object|array $object): string {
        $response = json_encode($object, JSON_INVALID_UTF8_SUBSTITUTE | JSON_THROW_ON_ERROR);
        return $response;
    }

    public static function log(Throwable $e): void {
        $logMessage = sprintf(
            "[%s] Exception: %s in %s on line %d\nStack Trace:\n%s\n",
            date('Y-m-d H:i:s'),
            $e->getMessage(),
            $e->getFile(),
            $e->getLine(),
            $e->getTraceAsString()
        );
        error_log($logMessage, 3, ERROR_LOG_FILE);
    }

}
