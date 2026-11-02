<?php

namespace HTMLNotes;

use HTMLNotes\NoteTemplate;
use HTMLNotes\Utils;


class Note {

    public string $id;
    public string $title;
    public string $content;
    public string $tags;
    public bool   $pinned;

    public function __construct(string $id, string $title, string $content, string $tags, bool $pinned) {
        $this->id = $id;
        $this->title = $title;
        $this->content = $content;
        $this->tags = $tags;
        $this->pinned = $pinned != null ? $pinned : false;
    }

    public static function getNotesList(string $search = ''): array {
        global $notesDao;
        $notes = [];
        $notes = $notesDao->getAllNotes(false, $search);
        return $notes;
    }

    public static function getRecentNotesList(): array {
        global $notesDao;
        $notes = $notesDao->getAllNotes(true);
        return $notes;
    }

    public static function getAllNoteTags(): array {
        global $notesDao;
        $tags = $notesDao->getAllNoteTags();
        return $tags;
    }

    public static function get(string $id): Note|null {
        global $notesDao;
        $note = NoteTemplate::getNote($id);
        return $note;
    }

    public static function getByTitle(string $title): Note|null {
        global $notesDao;
        $note = $notesDao->getNoteByTitle($title);
        return $note;
    }

    public static function getForDownload(string $id): void {
        NoteTemplate::getNoteForDownload($id);
    }

    public static function pin(string $id, bool $pinned = true): void {
        if (empty($id)) return;
        global $notesDao;
        $notesDao->pinNote($id, $pinned);
        NoteTemplate::writePinToTemplate($id, $pinned);
    }

    public static function create(string $title, string $content, string $tags): Note|null {
        $id = Utils::uuid();
        if (empty($content)) return null;

        $note = new Note($id, $title, $content, $tags, false);
        global $notesDao;
        $notesDao->saveNote($note);
        NoteTemplate::writeWithTemplate($note);
        return $note;
    }

    public static function save(string $id, string $title, string $content, string $tags): void {
        if (empty($title) || empty($content)) return;
        $note = Note::get($id);
        if ($note == null) return;

        $note->title = $title;
        $note->content = $content;
        $note->tags = $tags;
        global $notesDao;
        $notesDao->saveNote($note);
        NoteTemplate::writeWithTemplate($note);
    }

    public static function delete(string $id): void {
        if (empty($id)) return;
        global $notesDao;
        $notesDao->deleteNote($id);
        NoteTemplate::deleteNote($id);
    }

}
