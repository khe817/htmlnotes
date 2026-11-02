
/**
 * Ajax GET/POST helper.
 * Usage:
 * Ajax.post(formElement.action, formElement.serialize()).then(response => {
 *     console.log(response);
 * })
 * .catch(error => {
 *     flashAjaxCallErrorMsg({ responseText: error.message }, 'Add Error');
 * });
 */
export const Ajax = {

    //csrfHeader: 'X-CSRF-TOKEN',
    //csrf: '', // should be initialized on page load

    get: async function (url = '') {
        const headers = new Headers();
        headers.append('Accept', 'text/html');
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) throw new Error(await response.text());
        return await response.text();
    },

    getJson: async function (url = '') {
        const headers = new Headers();
        headers.append('Accept', 'application/json');
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) throw new Error(await response.text());
        const responseText = await response.text();
        return JSON.parse(responseText?.trim() || null);
    },

    post: async function (url = '', data = '') {
        const headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        //headers.append(this.csrfHeader, this.csrf);

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: data,
            credentials: 'same-origin'
        });

        if (!response.ok) throw new Error(await response.text());
        return await response.text();
    },

    postJson: async function (url = '', data = {}|[], consumeJson = true) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        //headers.append(this.csrfHeader, this.csrf);

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data),
            credentials: 'same-origin'
        });

        if (!response.ok) throw new Error(await response.text());
        if (consumeJson) return await response.json();
        else return await response.text();
    },

    delete: async function(url= '') {
        const headers = new Headers();
        //headers.append(this.csrfHeader, this.csrf);

        const response = await fetch(url, {
            method: 'DELETE',
            headers: headers,
            credentials: 'same-origin'
        });

        if (!response.ok) throw new Error(await response.text());
    }

};
