const UI = {
    toggleClass(el, name) {
        document.querySelector(el).classList.toggle(name);
    },

    addClass(el, name) {
        document.querySelector(el).classList.add(name);
    },

    removeClass(el, name) {
        document.querySelector(el).classList.remove(name);
    },

    toggleSidebar(src) {
        let elem = document.querySelector('#side').classList;
        elem.toggle('hidden');
    }
}
