<?php

namespace HTMLNotes;

use Exception;
use HTMLNotes\Note;
use PDO;

define('QUERY_CREATE_NOTES_TABLE', 'CREATE TABLE IF NOT EXISTS notes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id    INTEGER      NOT NULL UNIQUE,
    title      VARCHAR(255) NOT NULL UNIQUE,
    content    TEXT         NOT NULL,
    tags       VARCHAR(255) DEFAULT NULL, /* separated by commas */
    pinned     BOOLEAN      NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)');

define('QUERY_SEARCH_ALL_NOTES', 'SELECT * FROM notes
    WHERE 1=1 ');
define('QUERY_SEARCH_CLAUSE', 'AND (title LIKE :search
        OR content LIKE :search
        OR tags LIKE :search) ');
define('QUERY_ORDER_BY_TITLE', ' ORDER BY pinned DESC, title');
define('QUERY_ORDER_BY_UPDATED_AT', ' ORDER BY pinned DESC, updated_at DESC LIMIT 50');

define('QUERY_GET_NOTE_BY_TITLE', 'SELECT * FROM notes
    WHERE title = :title');

define('QUERY_GET_ALL_NOTE_TAGS', 'SELECT DISTINCT tags FROM notes');

define('QUERY_PIN_NOTE', 'UPDATE notes SET pinned = :pinned WHERE note_id = :noteId');

define('QUERY_SAVE_NOTE', 'INSERT INTO notes
    (note_id, title, content, tags)
    VALUES (:noteId, :title, :content, :tags)
    ON CONFLICT(note_id)
        DO UPDATE SET
        title = :title,
        content = :content,
        tags = :tags,
        updated_at = CURRENT_TIMESTAMP');
define('QUERY_DELETE_NOTE', 'DELETE FROM notes WHERE note_id = :noteId');

/**
 * Notes Data Access Object
 */
class NotesDao {

    public PDO $pdo;

    private function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public static function init(): NotesDao {
        try {
            // Create or open the database file on local disk
            $pdo = new PDO(NOTES_DATABASE);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            NotesDao::initNotesDbSchema($pdo);
            return new NotesDao($pdo);
        } catch (Exception $e) {
            throw $e;
        }
    }

    public function getNoteByTitle(string $title): Note|null {
        $query = QUERY_GET_NOTE_BY_TITLE;
        $stmt = $this->pdo->prepare($query);
        $params = [ ':title' => $title];
        $stmt->execute($params);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$result) return null;

        return new Note($result['note_id'],
                        $result['title'],
                        $result['content'],
                        $result['tags'],
                        $result['pinned']);
    }

    public function getAllNotes(bool $recent = false, string $search = ''): array {
        $query = QUERY_SEARCH_ALL_NOTES;
        if (!empty($search)) $query .= QUERY_SEARCH_CLAUSE;
        if ($recent) $query .= QUERY_ORDER_BY_UPDATED_AT;
        else $query .= QUERY_ORDER_BY_TITLE;

        $stmt = $this->pdo->prepare($query);
        $params = [];
        if (!empty($search)) {
            $params[':search'] = '%' . $search . '%';
        }
        $stmt->execute($params);

        $results = $stmt->fetchAll();
        $notes = [];
        foreach ($results as $result) {
            $notes[] = new Note($result['note_id'],
                                $result['title'],
                                Utils::abbreviate($result['content'], 64),
                                $result['tags'],
                                $result['pinned']);
        }
        return $notes;
    }

    public function getAllNoteTags(): array {
        $query = QUERY_GET_ALL_NOTE_TAGS;
        $stmt = $this->pdo->prepare($query);
        $params = [];
        $stmt->execute($params);

        $results = $stmt->fetchAll();
        $tag_names = [];
        foreach ($results as $result) {
            // split by commas, and trim whitespace
            $tags = array_map('trim', explode(',', $result['tags']));
            foreach ($tags as $tag) {
                $tag_names[$tag] = true;
            }
        }
        unset($tag_names['']);
        return array_keys($tag_names);
    }

    public function pinNote(string $id, bool $pinned = true): void {
        $stmt = $this->pdo->prepare(QUERY_PIN_NOTE);
        $stmt->execute([
            ':noteId'  => $id,
            ':pinned'  => $pinned ? 1 : 0
        ]);
    }

    public function saveNote(Note $note): void {
        $stmt = $this->pdo->prepare(QUERY_SAVE_NOTE);
        $stmt->execute([
            ':noteId'  => $note->id,
            ':title'   => $note->title,
            ':content' => $note->content,
            ':tags'    => $note->tags
        ]);
    }

    public function deleteNote(string $id): void {
        $stmt = $this->pdo->prepare(QUERY_DELETE_NOTE);
        $stmt->execute([
            ':noteId'  => $id
        ]);
    }

    private static function initNotesDbSchema(PDO $pdo): void {
        // Create notes table if not exist.
        $pdo->exec(QUERY_CREATE_NOTES_TABLE);
    }

}