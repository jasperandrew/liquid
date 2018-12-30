"use strict";

var UI = {
  toggleClass: function toggleClass(el, name) {
    document.querySelector(el).classList.toggle(name);
  },
  addClass: function addClass(el, name) {
    document.querySelector(el).classList.add(name);
  },
  toggleNav: function toggleNav(src) {
    var scrn = document.querySelector('div.screen').classList;

    if (scrn.contains('hidden')) {
      scrn.toggle('hidden');
      window.setTimeout(function () {
        scrn.toggle('open');
      }, 10);
      document.querySelector('nav').classList.add('open');
    } else if (src !== 'nav') {
      scrn.toggle('open');
      window.setTimeout(function () {
        scrn.toggle('hidden');
      }, 300);
      document.querySelector('nav').classList.remove('open');
    }
  }
};