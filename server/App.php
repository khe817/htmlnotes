<?php

namespace HTMLNotes;

use HTMLNotes\Note;
use Steampixel\Route;

class App {

    public static function getNotesList(): string {
        $search = '';
        if (!empty($_GET['search'])) $search = $_GET['search'];
        return Utils::jsonResponse(Note::getNotesList($search));
    }

    public static function getRecentNotesList(): string {
        return Utils::jsonResponse(Note::getRecentNotesList());
    }

    public static function getAllNoteTags(): string {
        return Utils::jsonResponse(Note::getAllNoteTags());
    }

    public static function noteExistsByTitle(string $title): bool {
        $note = Note::getByTitle($title);
        return $note != null;
    }

    public static function getNoteByTitle(string $title): string|null {
        $note = Note::getByTitle($title);
        if ($note == null) return null;
        return Utils::jsonResponse($note);
    }

    public static function getNote(string $id): string|null {
        $note = Note::get($id);
        return Utils::jsonResponse($note);
    }

    public static function getNoteForDownload(string $id): void {
        Note::getForDownload($id);
    }

    public static function pinNote(string $id): void {
        Note::pin($id);
    }

    public static function unpinNote(string $id): void {
        Note::pin($id, false);
    }

    public static function createNote(string $title, string $content, string $tags): string {
        $note = Note::create($title, $content, $tags);
        return $note->id;
    }

    public static function saveNote(string $id, string $title, string $content, string $tags): void {
        Note::save($id, $title, $content, $tags);
    }

    public static function deleteNote(string $id): void {
        Note::delete($id);
    }

    public static function listAllRoutes(): void {
        $routes = Route::getAll();
        foreach ($routes as $route) {
            echo $route['expression'] . ' (' . $route['method'] . ")\n";
        }
    }

}
