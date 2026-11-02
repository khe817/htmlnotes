import * as appShared from "./app-shared.js";
import { BlockUI } from "./block-ui/block-ui.js";

/**
* Preloader overlay while page loads.
*/
window.onbeforeunload = () => BlockUI.showReloadOverlay();

// UI and Event Handling
const sidebarToggleBtn  = appShared.sidebarToggleBtn;
const searchInput       = appShared.searchInput;

// on page load
document.addEventListener('DOMContentLoaded', async () => {
    await appShared.refreshNotesList();
    await appShared.getAllNoteTags();
    await setupEventListeners();
    BlockUI.fadeOutReloadOverlay();
});

async function setupEventListeners() {
    sidebarToggleBtn.addEventListener('click', appShared.toggleSidebar);
    searchInput.addEventListener('keydown', async (event) => await appShared.searchNotes(event));
    appShared.initSearchNotesOnFilterButtonClickListener();
    appShared.initSearchNotesOnTagItemSelectListener();
    appShared.initNavigateToNoteOnNoteItemSelectListener();
    appShared.initPinNoteOnNoteItemSelectListener();
    appShared.initUnpinNoteOnNoteItemSelectListener();
}



