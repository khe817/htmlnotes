import { BlockUI, FlashMsg } from "./block-ui/block-ui.js";
import { Note } from "./note.js";

// UI and Event Handling
export const sidebarToggleBtn  = document.querySelector('#left-sidebar .sidebar-toggle');
export const tagsList          = document.getElementById('tagsList');
export const notesList         = document.getElementById('notesList');
export const searchInput       = document.getElementById('searchInput');
export const addNoteBtn        = document.getElementById('addNoteBtn');
export const filterControls    = document.querySelectorAll('#filterControls button');
export const sidebarEmptyState = document.getElementById('sidebarEmptyState');
export const mainEmptyState    = document.getElementById('mainEmptyState');
export const editorArea        = document.getElementById('editorArea');
export const trixEditor        = document.querySelector('trix-editor');
export const noteIdInput       = document.getElementById('noteId');
export const noteTitleInput    = document.getElementById('noteTitle');
export const noteTagsInput     = document.getElementById('noteTags');
export const deleteNoteBtn     = document.getElementById('deleteNoteBtn');
export const exportNoteBtn     = document.getElementById('exportNoteBtn');
export const importNoteBtn     = document.getElementById('importNoteBtn');
export const importFileInput   = document.getElementById('importFileInput');

export const sleep = miliSeconds => new Promise(resolve => setTimeout(resolve, miliSeconds));

export async function initOpenNoteForAddFromWindowHash() {
    if (window.location.hash !== "#new-note") return;
    BlockUI.showReloadOverlay();
    addNoteBtn.click();
    clearWindowHash();
    BlockUI.fadeOutReloadOverlay();
}

export async function initOpenNoteForEditFromWindowHash() {
    let noteId = window.location.hash.replace(/^#/, "");
    if (noteId == "") return;
    BlockUI.showReloadOverlay();
    await loadNoteToEditor(noteId);
    clearWindowHash();
    BlockUI.fadeOutReloadOverlay();
}

export function initImportNoteOnClickListener() {
    if (!importNoteBtn || !importFileInput) return;
    importNoteBtn.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', async (event) => {
        await openEditorForAdd();
        await importNoteToEditor(event);
    });
}

export function initSearchNotesOnFilterButtonClickListener() {
    filterControls.forEach(button => {
        button.addEventListener('click', async () => {
            BlockUI.showReloadOverlay();
            let recent = false;
            if (button.dataset.filter === 'recent') recent = true;
            await refreshNotesList(recent);
            initGetNoteOnNoteItemSelectListener();
            initPinNoteOnNoteItemSelectListener();
            filterControls.forEach(button => button.classList.remove('active'));
            button.classList.add('active');
            BlockUI.fadeOutReloadOverlay();
        });
    });
}

export function initSearchNotesOnTagItemSelectListener() {
    tagsList.querySelectorAll('.note-list-item > .note-title').forEach(el => {
        el.addEventListener('click', async () => {
            await refreshNotesList(false, el.textContent);
        });
    });
}

export function initGetNoteOnNoteItemSelectListener() {
    notesList.querySelectorAll('.note-list-item > .note-title').forEach(el => {
        el.addEventListener('click', async () => {
            let noteItem = el.closest('.note-list-item');
            await loadNoteToEditor(noteItem.dataset.id);
        });
    });
}

export function initNavigateToNoteOnNoteItemSelectListener() {
    notesList.querySelectorAll('.note-list-item > .note-title').forEach(el => {
        el.addEventListener('click', async () => {
            let noteItem = el.closest('.note-list-item');
            window.location.href = '/htmlnotes/#' + noteItem.dataset.id;
        });
    });
}

export function initPinNoteOnNoteItemSelectListener() {
    notesList.querySelectorAll('.note-list-item .note-pin').forEach(el => {
        el.addEventListener('click', async () => {
            let noteItem = el.closest('.note-list-item');
            await pinNote(noteItem, el);
        });
    });
}

export function initUnpinNoteOnNoteItemSelectListener() {
    notesList.querySelectorAll('.note-list-item .note-pinned').forEach(el => {
        el.addEventListener('click', async () => {
            let noteItem = el.closest('.note-list-item');
            await unpinNote(noteItem, el);
        });
    });
}

/**
 * Rebind all listeners back every time content is changed/reloaded
 */
export function initTrixContentUpdateListener() {
    document.addEventListener("trix-change", () => {
        initGoToNoteOnLinkClickListener(trixEditor);
    });
}

export function initGoToNoteOnLinkClickListener() {
    trixEditor.querySelectorAll('a[href^="/htmlnotes/notes/"]').forEach(link => {
        link.addEventListener('click', async () => {
            await saveNote();
            let noteFileName = link.href.match(/\/([a-zA-Z0-9\-]{36})\.html$/gi);
            let noteId = noteFileName[0].replace('\/', '');
                noteId = noteId.replace('.html', '');
            await loadNoteToEditor(noteId);
        });
    })
}

export async function importNoteToEditor(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(e.target.result, 'text/html');
            noteTitleInput.value = doc.title || file.name.replace('.html', '');
            formatHtmlForPaste(doc);
            trixEditor.value = doc.body.innerHTML;
            await saveNote();
            FlashMsg.success('Note imported successfully!');
        } catch (error) {
            FlashMsg.error(`Error importing note: ${error.message}`);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

export async function loadNoteToEditor(noteId) {
    if (doesShowTrixNotInitWarning()) return;
    BlockUI.showReloadOverlay();
    let note = undefined;
    if (!noteId) {
        note = await Note.get(noteIdInput.value);
    } else {
        note = await Note.get(noteId);
    }
    if (!note) return;

    noteIdInput.value    = note.id;
    noteTitleInput.value = note.title;
    trixEditor.value     = note.content;
    noteTagsInput.value  = note.tags;
    showEditor();
    highlightSelectedNote();
    initGoToNoteOnLinkClickListener();
    BlockUI.fadeOutReloadOverlay();
}

export async function saveNote() {
    if (doesShowTrixNotInitWarning()) return;
    if (!trixEditor.innerHTML || !noteTitleInput.value) return;

    if (!noteIdInput.value) {
        let id = await Note.create(
            noteTitleInput.value,
            trixEditor.innerHTML,
            noteTagsInput.value);
        if (id) noteIdInput.value = id;
    } else {
        await Note.save(
            noteIdInput.value,
            noteTitleInput.value,
            trixEditor.innerHTML,
            noteTagsInput.value);
    }
    await refreshNotesList(isRecentNotesListFilterSelected());
    showEditor();
    FlashMsg.success('Note saved!');
}

export async function deleteNote() {
    if (!window.confirm('Are you sure to delete this note?')) return;

    BlockUI.showReloadOverlay();
    await Note.delete(noteIdInput.value);
    await refreshNotesList(isRecentNotesListFilterSelected());
    clearEditor();
    BlockUI.fadeOutReloadOverlay();
}

export async function pinNote(noteItem, pinEl) {
    BlockUI.showReloadOverlay();
    await Note.pin(noteItem.dataset.id);
    await refreshNotesList(isRecentNotesListFilterSelected());
    BlockUI.fadeOutReloadOverlay();
}

export async function unpinNote(noteItem, pinEl) {
    BlockUI.showReloadOverlay();
    await Note.unpin(noteItem.dataset.id);
    await refreshNotesList(isRecentNotesListFilterSelected());
    BlockUI.fadeOutReloadOverlay();

}

export function exportNote() {
    if (!noteIdInput.value) return false;
    let url = exportNoteBtn.dataset.href;
    exportNoteBtn.href = url.replace('note.id', noteIdInput.value);
    //exportNoteBtn.click();
}

export async function searchNotes(event) {
    if (event.key !== 'Enter') return;
    BlockUI.showReloadOverlay();
    await refreshNotesList(false, searchInput.value);
    filterControls.forEach(button => button.classList.remove('active'));
    BlockUI.fadeOutReloadOverlay();
}

export async function refreshNotesList(getRecent = false, search) {
    let notes = [];
    if (getRecent) {
        notes = await Note.getRecentNotesList();
    } else {
        notes = await Note.getNotesList(search);
    }
    clearNotesList();
    if (notes.length == 0) {
        FlashMsg.message('No notes found.');
        return;
    }

    notes.forEach(note => {
        let noteItem = document.createElement('div');
        noteItem.classList.add('note-list-item');
        noteItem.setAttribute('data-id', note.id);
        noteItem.innerHTML = '<div class="note-title">' + note.title + '</div>';
        if (note.pinned) {
            noteItem.innerHTML += '<span class="note-pinned" title="Unpin note">&#9906;</span>';
        } else {
            noteItem.innerHTML += '<span class="note-pin" title="Pin note to top">&#9906;</span>';
        }
        notesList.appendChild(noteItem);
    });

    showNotesList();
}

export function showNotesList() {
    if (sidebarEmptyState != null) sidebarEmptyState.classList.add('no-display');
    initPinNoteOnNoteItemSelectListener();
    initUnpinNoteOnNoteItemSelectListener();
    if (noteIdInput == null) {
        initNavigateToNoteOnNoteItemSelectListener();
    } else {
        initGetNoteOnNoteItemSelectListener();
        highlightSelectedNote();
    }
}

export function clearNotesList() {
    notesList.innerHTML = '';
    if (sidebarEmptyState != null) sidebarEmptyState.classList.remove('no-display');
}

export async function getAllNoteTags() {
    let tags = await Note.getAllNoteTags();
    tagsList.innerHTML = '';
    if (tags.length == 0) return;

    tags.forEach(tag => {
        let tagItem = document.createElement('div');
        tagItem.classList.add('note-list-item');
        tagItem.innerHTML = '<div class="note-title">' + tag + '</div>';
        tagsList.appendChild(tagItem);
    });
}

export async function openEditorForAdd() {
    showEditor();
    clearEditor();
    doesShowTrixNotInitWarning();
}

export function showEditor() {
    mainEmptyState.style.display = 'none';
    editorArea.style.display = 'flex';
    deleteNoteBtn.style.display = 'block';
    exportNoteBtn.style.display = 'block';
}

export function clearEditor() {
    noteIdInput.value = '';
    noteTitleInput.value = '';
    trixEditor.value = '';
    noteTagsInput.value = '';
    deleteNoteBtn.style.display = 'none';
    exportNoteBtn.style.display = 'none';
    unHighlightAllNotes();
}

export function highlightSelectedNote() {
    unHighlightAllNotes();
    notesList.querySelectorAll('.note-list-item').forEach(item => {
        if (item.dataset.id == noteIdInput.value) item.classList.add('active');
    });
}

export function unHighlightAllNotes() {
    notesList.querySelectorAll('.note-list-item').forEach(item => item.classList.remove('active'));
}

export function isRecentNotesListFilterSelected() {
    let selectedFitlerControl = [...filterControls].find(fc => fc.classList.contains('active'));
    return selectedFitlerControl.dataset.filter === 'recent';
}

export function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

export function clearWindowHash() {
    const url = new URL(window.location.href);
    url.hash = "";
    history.replaceState(null, "", url);
}

export function formatHtmlForPaste(document) {
    // trix strips all line breaks \n, so we compensate with <br>
    document.body.innerHTML = document.body.innerHTML.replace(/\n/g, '<br>');
    // replace all monospace elements with <code>
    let monospaceEls = document.querySelectorAll('[style="font-family:monospace"]');
    monospaceEls.forEach(el => {
        let newEl = document.createElement('code');
        newEl.innerHTML = el.innerHTML;
        el.replaceWith(newEl);
    });
    // replace all highlight elements with <mark>
    let highlightEls = document.querySelectorAll('[style="background:yellow"]');
    highlightEls.forEach(el => {
        let newEl = document.createElement('mark');
        newEl.innerHTML = el.innerHTML;
        el.replaceWith(newEl);
    });
    // replace all spaces with HTML space, do this last
    document.body.innerHTML = document.body.innerHTML.replaceAll(' ', '&nbsp;');
}

export function doesShowTrixNotInitWarning() {
    if (isTrixInitialized()) return false;
    document.getElementById('trix-not-init-warning').classList.remove('no-display');
    return true;
}

export function isTrixInitialized() {
    if (!Trix.config.textAttributes.highlight) return false;
    if (!Trix.config.textAttributes.codeText) return false;
    if (!document.querySelector('.trix-button--icon-highlight')) return false;
    if (!document.querySelector('.trix-button--icon-codeText')) return false;
    if (!document.querySelector('.trix-button--icon-linkToNote')) return false;

    return true;
}
