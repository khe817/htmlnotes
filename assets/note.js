import { Ajax } from "./ajax.js";
import { FlashMsg } from "./block-ui/block-ui.js";

/**
 * Handles note REST requests/responses with server.
 */
export const Note = {

    baseUrl: "/htmlnotes",

    restUrl: function (path) {
        return this.baseUrl + path;
    },

    getNotesList: async function($search) {
        let url = this.restUrl('/note/list');
        let queryStr = '';
        if ($search) queryStr += '?search=' + $search;

        try {
            const notes = await Ajax.getJson(url + queryStr);
            return notes;
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
        }
    },

    getRecentNotesList: async function () {
        let url = this.restUrl('/note/list/recent');

        try {
            const notes = await Ajax.getJson(url);
            return notes;
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
        }
    },

    getAllNoteTags: async function () {
        let url = this.restUrl('/note/tag/list');

        try {
            const tags = await Ajax.getJson(url);
            return tags;
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
        }
    },

    noteExistsByTitle: async function(title) {
        if (!title) return false;
        let url = this.restUrl('/note/exists');
        let queryStr = '?title=' + title.trim();

        try {
            const exists = await Ajax.get(url + queryStr);
            return Boolean(exists);
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
            throw e;
        }
    },

    getByTitle: async function (title) {
        if (!title) return undefined;
        let url = this.restUrl('/note/title/' + encodeURIComponent(title.trim()));

        try {
            const note = await Ajax.getJson(url);
            return note;
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
        }
    },

    get: async function(id) {
        if (!id) return undefined;
        let url = this.restUrl('/note/' + id);

        try {
            const note = await Ajax.getJson(url);
            return note;
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
        }
    },

    pin: async function (id) {
        if (!id) return;
        let url = this.restUrl('/note/' + id + '/pin');

        try {
            await Ajax.post(url);
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
            throw e;
        }
    },

    unpin: async function (id) {
        if (!id) return;
        let url = this.restUrl('/note/' + id + '/unpin');

        try {
            await Ajax.post(url);
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
            throw e;
        }
    },

    create: async function(title, content, tags) {
        let noteExists = await this.noteExistsByTitle(title);
        if (noteExists) {
            FlashMsg.error('Note title already exists.');
            console.error('Note title already eixsts: ', title);
            return undefined;
        }

        let url = this.restUrl('/note/create');
        let data = {
            "title" : title,
            "content" : content,
            "tags" : tags
        }

        try {
            const id = await Ajax.postJson(url, data, false);
            return id;
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
            throw e;
        }
    },

    save: async function(id, title, content, tags) {
        let url = this.restUrl('/note/'+ id);
        let data = {
            "title": title,
            "content": content,
            "tags": tags
        }

        try {
            await Ajax.postJson(url, data, false);
        } catch (e) {
            FlashMsg.error(e.message);
            console.error(e);
            throw e;
        }
    },

    delete: async function(id) {
        if (!id) return;
        let url = this.restUrl('/note/' + id);

        try {
            await Ajax.delete(url);
        } catch(e) {
            FlashMsg.error(e.message);
            console.error(e);
            throw e;
        }
    }

}
