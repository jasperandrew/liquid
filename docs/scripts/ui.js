"use strict";

var UI = {
  toggleClass: function toggleClass(el, name) {
    document.querySelector(el).classList.toggle(name);
  }
};