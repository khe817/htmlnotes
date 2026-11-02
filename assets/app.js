import * as appShared from "./app-shared.js";
import { BlockUI } from "./block-ui/block-ui.js";
import { setupTrix } from "./trix/trix.config.js";

/**
* Preloader overlay while page loads.
*/
window.onbeforeunload = () => BlockUI.showReloadOverlay();

// UI and Event Handling
const sidebarToggleBtn  = appShared.sidebarToggleBtn
const searchInput       = appShared.searchInput;
const addNoteBtn        = appShared.addNoteBtn;
const noteTitleInput    = appShared.noteTitleInput;
const noteTagsInput     = appShared.noteTagsInput;
const deleteNoteBtn     = appShared.deleteNoteBtn;
const exportNoteBtn     = appShared.exportNoteBtn;

// on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    setupTrix();
    await setupEventListeners();
    await appShared.refreshNotesList(true);
    await appShared.initOpenNoteForAddFromWindowHash();
    await appShared.initOpenNoteForEditFromWindowHash();
    setUpAutoSave(60000); // every 60 seconds
    BlockUI.fadeOutReloadOverlay();
});

async function setupEventListeners() {
    addNoteBtn.addEventListener('click', appShared.openEditorForAdd);
    sidebarToggleBtn.addEventListener('click', appShared.toggleSidebar);
    // save note when note editor is unfocused
    document.addEventListener('trix-blur',  async () => await appShared.saveNote());
    noteTitleInput.addEventListener('blur', async () => await appShared.saveNote());
    noteTagsInput.addEventListener('blur',  async () => await appShared.saveNote());
    deleteNoteBtn.addEventListener('click', async () => await appShared.deleteNote());
    searchInput.addEventListener('keydown', async (event) => await appShared.searchNotes(event));
    exportNoteBtn.addEventListener('click',       () => appShared.exportNote());
    appShared.initImportNoteOnClickListener();
    appShared.initSearchNotesOnFilterButtonClickListener();
    appShared.initGetNoteOnNoteItemSelectListener();
    appShared.initPinNoteOnNoteItemSelectListener();
    appShared.initUnpinNoteOnNoteItemSelectListener();
    appShared.initTrixContentUpdateListener();
}

async function setUpAutoSave(saveInterval) {
    setInterval(async () => {
        await appShared.saveNote();
    }, saveInterval);
};
