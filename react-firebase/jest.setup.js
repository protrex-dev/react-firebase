import MutationObserver from '@sheerun/mutationobserver-shim';

window.MutationObserver = MutationObserver;

global.globalThis = require('globalthis')();
