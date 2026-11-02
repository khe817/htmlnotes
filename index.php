<?php

// --- Define a global basepath ---
define('BASEPATH', '/htmlnotes');
define('BASEDIR', __DIR__);
define('NOTES_DATABASE', 'sqlite:' . BASEDIR . '/notes.sqlite');
define('ERROR_LOG_FILE', BASEDIR . '/web.log');
define('NOTE_FILE_EXT', '.html');
define('NOTE_TEMPLATE', 'server/note_template.html');
define('UUID_REGEX', '([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})');

include_once 'server/error_handler.php';
include_once 'server/App.php';
include_once 'server/Note.php';
include_once 'server/NotesDao.php';
include_once 'server/NoteTemplate.php';
include_once 'server/Route.php';
include_once 'server/Utils.php';

use HTMLNotes\App;
use HTMLNotes\NotesDao;
use Steampixel\Route;
use HTMLNotes\Utils;


try {
    // --- Initialize database ---
    $notesDao = NotesDao::init();

    // --- Add routes ---
    // get notes list
    Route::add('/note/list', function () {
        return App::getNotesList();
    }, 'get');
    // get recent notes list
    Route::add('/note/list/recent', function () {
        return App::getRecentNotesList();
    }, 'get');
    // get all note tags
    Route::add('/note/tag/list', function () {
        return App::getAllNoteTags();
    }, 'get');
    // check if note title exists
    Route::add('/note/exists', function () {
        return App::noteExistsByTitle($_GET['title']);
    }, 'get');
    // get a note by title
    Route::add('/note/title/(.+)', function ($title) {
        return App::getNoteByTitle($title);
    }, 'get');
    // get a note
    Route::add('/note/' . UUID_REGEX, function ($id) {
        return App::getNote($id);
    }, 'get');
    // get a note for download
    Route::add('/note/' . UUID_REGEX . '/download', function ($id) {
        App::getNoteForDownload($id);
    }, 'get');

    // pin existing note
    Route::add('/note/' . UUID_REGEX . '/pin', function ($id) {
        return App::pinNote($id);
    }, 'post');
    // unpin existing note
    Route::add('/note/' . UUID_REGEX . '/unpin', function ($id) {
        return App::unpinNote($id);
    }, 'post');

    // create new note
    Route::add('/note/create', function () {
        $_POST = json_decode(file_get_contents('php://input'), true);
        return App::createNote($_POST['title'], $_POST['content'], $_POST['tags']);
    }, 'post');
    // save existing note
    Route::add('/note/' . UUID_REGEX, function ($id) {
        $_POST = json_decode(file_get_contents('php://input'), true);
        return App::saveNote($id, $_POST['title'], $_POST['content'], $_POST['tags']);
    }, 'post');
    // delete existing note
    Route::add('/note/' . UUID_REGEX, function ($id) {
        return App::deleteNote($id);
    }, 'delete');

    // --- List all routes ---
    Route::add('/routes', function () {
        return App::listAllRoutes();
    });

    // --- Run the router ---
    Route::run(BASEPATH);

} catch (Throwable $e) {
    Utils::log($e);
    http_response_code(500);
}
