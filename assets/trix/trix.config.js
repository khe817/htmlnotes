/**
 * Trix editor modifications.
 */

import { Note } from "../note.js";

export function setupTrix() {
    const editors = document.querySelectorAll("trix-editor");
    editors.forEach(editor => {
        // If it already has an editor property, it's already initialized
        if (editor.editor) {
            handleTrixBeforeInitialization(editor);
            handleTrixInitialization(editor);
        }
    });

    // fall back
    document.addEventListener("trix-before-initialize", () => {
        handleTrixBeforeInitialization();
    });
    document.addEventListener("trix-initialize", (event) => {
        const { target } = event;
        const trixEditor = target;
        handleTrixInitialization(trixEditor);
    });
}

// add custom configs
function handleTrixBeforeInitialization() {
    Trix.config.attachments.preview.caption = { name: false, size: false };
    highlightTextToolConfig();
    codeTextToolConfig();
}

// add custom initializers
function handleTrixInitialization(trixEditor) {
    addHighlightButton(trixEditor);
    addCodeTextButton(trixEditor);
    addLinkToNoteButton(trixEditor);
    removeFileAttachmentTool();
}


function removeFileAttachmentTool() {
    const file_tools = document.querySelector(".trix-button-group--file-tools");
    file_tools.remove();

    document.addEventListener("trix-attachment-add", function (event) {
        event.attachment.remove();
    });
    document.addEventListener("trix-file-accept", function (e) {
        e.preventDefault();
    });
}

// custom highlight button config
function highlightTextToolConfig() {
    Trix.config.textAttributes.highlight = {
        tagName: "mark",
        inheritable: true,
        parser(element) {
            const style = window.getComputedStyle(element);
            return style.backgroundColor === 'mark' && style.color == 'MarkText';
        },
    }
}

function codeTextToolConfig() {
    Trix.config.textAttributes.codeText = {
        tagName: "code",
        //style: { fontSize: "1.1em" },
        inheritable: true,
        parser(element) {
            const style = window.getComputedStyle(element);
            return style.fontStyle === 'monospace';
        },
    }
}

function addHighlightButton(trixEditor) {
    // Find the text tools section inside the toolbar
    const buttonGroup = trixEditor.toolbarElement.querySelector("[data-trix-button-group=text-tools]");

    // Define the HTML for custom highlight button
    const buttonHTML = `
<button type="button"
        class="trix-button trix-button--icon-highlight"
        data-trix-attribute="highlight"
        data-trix-key="h"
        title="Highlight"
        tabindex="-1">H</button>
`;

    // Insert the button into the DOM
    buttonGroup.insertAdjacentHTML('beforeend', buttonHTML);
}

function addCodeTextButton(trixEditor) {
    // Find the text tools section inside the toolbar
    const buttonGroup = trixEditor.toolbarElement.querySelector("[data-trix-button-group=text-tools]");

    // Define the HTML for custom code button
    const buttonHTML = `
<button type="button"
        class="trix-button trix-button--icon-codeText"
        data-trix-attribute="codeText"
        title="Code Text"
        data-trix-key="q"
        tabindex="-1">C</button>
`;

    // Insert the button into the DOM
    buttonGroup.insertAdjacentHTML('beforeend', buttonHTML);
}

function addLinkToNoteButton(trixEditor) {
    // toolbar elements ( src/trix/config/toolbar.js )
    const buttonGroup = trixEditor.toolbarElement.querySelector('[data-trix-button-group=text-tools]');
    const trixDialogs = trixEditor.toolbarElement.getElementsByClassName('trix-dialogs')[0];

    // add a buttom to toolbar
    const Button = `
<button id="link-to-note-btn"
    type="button"
    class="trix-button trix-button--icon-linkToNote"
    data-trix-attribute="linkToNote"
    data-trix-action="link-to-note"
    title="Link To Note"
    tabindex="-1">
        Link Note
</button>`;
    buttonGroup.insertAdjacentHTML('beforeend', Button);

    // add a dialog HTML to toolbar
    const linkToNoteDialogHTML = `
<div class="trix-dialog trix-dialog--link-to-note"
    data-trix-dialog="link-to-note"
    data-trix-dialog-attribute="linkToNote">
    <div class="trix-dialog__link-fields">
        <input type="search" minlength="2" required
            name="linkToNote"
            class="trix-input trix-input--dialog"
            placeholder="Enter a note title…"
            aria-label="URL"
            required=""
            data-trix-input="">
        <div class="trix-button-group">
            <input type="button"
                class="trix-button trix-button--dialog"
                value="Link to Note"
                data-trix-action="x-add-link-to-note"
                data-trix-method="setAttribute">
        </div>
    </div>
</div>
            `;
    trixDialogs.insertAdjacentHTML('beforeend', linkToNoteDialogHTML);

    // pre-fill note title input with selected text
    const noteTitleInput = trixDialogs.querySelector('.trix-dialog--link-to-note .trix-input');
    document.querySelector('#link-to-note-btn').addEventListener('click', (event) => {
        const range = trixEditor.editor.getSelectedRange();
        const selectedText = trixEditor.editor.getDocument().getStringAtRange(range);
        noteTitleInput.value = selectedText;
    });

    // insert link to note on enter
    document.addEventListener('trix-action-invoke', async (event) => {
        if (event.actionName !== "x-add-link-to-note") return;
        if (!noteTitleInput.checkValidity()) return;

        const note = await Note.getByTitle(noteTitleInput.value);
        if (!note) {
            alert('Note does not exist by title.');
            trixEditor.editor.selectionManager.unlock();
            return;
        }

        const linkToNoteHTML = `<a href="/htmlnotes/notes/${note.id}.html">${note.title}</a>`;
        trixEditor.editor.insertHTML(linkToNoteHTML);
        trixEditor.editor.selectionManager.unlock();
    });
}
