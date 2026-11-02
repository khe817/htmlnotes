<?php

namespace HTMLNotes;

use Dom\HTMLDocument;
use ErrorException;
use Exception;
use HTMLNotes\Note;
use HTMLNotes\Utils;

define('NOTE_TEMPLATE_ID',      '{{note.id}}');
define('NOTE_TEMPLATE_TITLE',   '{{note.title}}');
define('NOTE_TEMPLATE_CONTENT', '{{note.content}}');
define('NOTE_TEMPLATE_TAGS',    '{{note.tags}}');
define('NOTE_TEMPLATE_PINNED',  '{{note.pinned}}');

/**
 * Class to deal with physical .html notes on disk.
 */
class NoteTemplate {

    public static function writeWithTemplate(Note $note): void {
        $noteContent = file_get_contents(Utils::noteTemplateFilePath());
        $noteContent = str_replace(NOTE_TEMPLATE_ID,      $note->id,      $noteContent);
        $noteContent = str_replace(NOTE_TEMPLATE_TITLE,   $note->title,   $noteContent);
        $noteContent = str_replace(NOTE_TEMPLATE_CONTENT, $note->content, $noteContent);
        $noteContent = str_replace(NOTE_TEMPLATE_TAGS,    $note->tags,    $noteContent);
        file_put_contents(Utils::noteFilePath($note->id), $noteContent);
    }

    public static function writePinToTemplate(string $id, bool $pinned): void {
        $document = NoteTemplate::getNoteHtmlDoc($id);
        $content = $document->getElementById($id);
        $content->setAttribute('data-is-pinned', $pinned ? '1' : '0');
        file_put_contents(Utils::noteFilePath($id), $document->saveHTML());
    }

    public static function getNote(string $id): Note|null {
        $document = NoteTemplate::getNoteHtmlDoc($id);
        if ($document == null) return null;

        $content = $document->getElementById($id);
        $title   = $document->querySelector('title');
        $tags    = $document->querySelector('#note-tags-' . $id);
        $pinned  = $content->getAttribute('data-is-pinned');
        $note = new Note($id,
                         $title->innerHTML,
                         $content->innerHTML,
                         $tags->innerHTML,
                         $pinned != null ? $pinned : false);
        return $note;
    }

    public static function getNoteForDownload(string $id): void {
        $document = NoteTemplate::getNoteHtmlDoc($id);
        $title = $document->querySelector('title');
        $htmlString = $document->saveHTML();

        // set the appropriate headers to force the file download
        header('Content-Type: text/html; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $title->innerHTML . '.html"');
        header('Content-Length: ' . strlen($htmlString));
        header('Connection: close');

        echo $htmlString;
    }

    public static function deleteNote(string $id): void {
        $filename = Utils::noteFilePath($id);
        if (!file_exists($filename)) return;
        if (!unlink($filename)) throw new Exception('Unable to delete note.');
    }

    private static function getNoteHtmlDoc(string $id): HTMLDocument|null {
        try {
            $htmlContent = file_get_contents(Utils::noteFilePath($id));
            $document = HTMLDocument::createFromString(
                $htmlContent,
                LIBXML_HTML_NOIMPLIED | LIBXML_NOERROR
            );
            return $document;
        } catch (ErrorException | Exception $e) {
            Utils::log($e);
            return null;
        }
    }

}

