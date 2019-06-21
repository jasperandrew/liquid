"use strict";

var UI = {
  toggleClass: function toggleClass(el, name) {
    document.querySelector(el).classList.toggle(name);
  },
  addClass: function addClass(el, name) {
    document.querySelector(el).classList.add(name);
  },
  removeClass: function removeClass(el, name) {
    document.querySelector(el).classList.remove(name);
  },
  toggleSidebar: function toggleSidebar(src) {
    var elem = document.querySelector('#side').classList;
    elem.toggle('hidden');
  }
};