'use strict';

// ============================================================================
// CSS Tweaks for Twitch Twilight
// ============================================================================

import Module from 'utilities/module';
import {ManagedStyle} from 'utilities/dom';
import {has} from 'utilities/object';


const CLASSES = {
	'side-nav': '.side-nav',
	'side-rec-channels': '.side-nav .recommended-channels',
	'side-rec-friends': '.side-nav .recommended-friends',
	'side-friends': '.side-nav .online-friends',
	'side-closed-friends': '.side-nav--collapsed .online-friends',
	'side-closed-rec-channels': '.side-nav--collapsed .recommended-channels',

	'prime-offers': '.top-nav__prime',

	'player-ext': '.player .extension-taskbar,.player .extension-container',
	'player-ext-hover': '.player:not([data-controls="true"]) .extension-container',

	'player-event-bar': '.channel-page .live-event-banner-ui__header',
	'player-rerun-bar': '.channel-page div.tw-c-text-overlay:not([data-a-target="hosting-ui-header"])',

	'pinned-cheer': '.pinned-cheer,.pinned-cheer-v2',
	'whispers': '.whispers',

	'dir-live-ind': '.live-channel-card:not([data-a-target*="host"]) .stream-type-indicator.stream-type-indicator--live,.stream-thumbnail__card .stream-type-indicator.stream-type-indicator--live',
	'profile-hover': '.preview-card .tw-relative:hover .ffz-channel-avatar',
};


export default class CSSTweaks extends Module {
	constructor(...args) {
		super(...args);

		this.should_enable = true;

		this.inject('settings');
		this.inject('site.chat');
		this.inject('site.theme');

		this.style = new ManagedStyle;
		this.chunks = {};
		this.chunks_loaded = false;


		// Layout

		/*this.settings.add('layout.portrait', {
			default: false,
			ui: {
				path: 'Appearance > Layout >> Channel',
				title: 'Enable Portrait Mode',
				description: 'In Portrait Mode, chat will be displayed beneath the player when the window is taller than it is wide.',
				component: 'setting-check-box'
			},
			changed: val => this.toggle('portrait', val)
		});*/

		this.settings.add('layout.side-nav.show', {
			default: true,
			ui: {
				sort: -1,
				path: 'Appearance > Layout >> Side Navigation',
				title: 'Display Side Navigation',

				component: 'setting-check-box'
			},
			changed: val => this.toggleHide('side-nav', !val)
		});

		this.settings.add('layout.side-nav.show-rec-channels', {
			default: 1,
			ui: {
				path: 'Appearance > Layout >> Side Navigation',
				title: 'Display Recommended Channels',
				component: 'setting-select-box',
				data: [
					{value: 0, title: 'Never'},
					{value: 1, title: 'Always'},
					{value: 2, title: 'When Side Navigation is Open'}
				]
			},
			changed: val => {
				this.toggleHide('side-rec-channels', val === 0);
				this.toggleHide('side-closed-rec-channels', val === 2);
			}
		});

		this.settings.add('layout.side-nav.show-friends', {
			default: 1,
			ui: {
				path: 'Appearance > Layout >> Side Navigation',
				title: 'Display Online Friends',
				component: 'setting-select-box',
				data: [
					{value: 0, title: 'Never'},
					{value: 1, title: 'Always'},
					{value: 2, title: 'When Side Navigation is Open'}
				]
			},
			changed: val => {
				this.toggleHide('side-friends', val === 0);
				this.toggleHide('side-closed-friends', val === 2);
			}
		});

		this.settings.add('layout.side-nav.show-rec-friends', {
			default: true,
			ui: {
				path: 'Appearance > Layout >> Side Navigation',
				title: 'Display Recommended Friends',
				component: 'setting-check-box'
			},
			changed: val => this.toggleHide('side-rec-friends', !val)
		});

		this.settings.add('layout.swap-sidebars', {
			default: false,
			ui: {
				path: 'Appearance > Layout >> Side Navigation',
				title: 'Swap Sidebars',
				description: 'Swap navigation and chat to the opposite sides of the window.',

				component: 'setting-check-box'
			},
			changed: val => this.toggle('swap-sidebars', val)
		});

		this.settings.add('layout.minimal-navigation', {
			requires: ['layout.theatre-navigation'],
			default: false,
			process(ctx, val) {
				return ctx.get('layout.theatre-navigation') ?
					true : val;
			},
			ui: {
				path: 'Appearance > Layout >> Top Navigation',
				title: 'Minimize Navigation',
				description: "Slide the site navigation bar up out of view when it isn't in use.",

				component: 'setting-check-box'
			},
			changed: val => this.toggle('minimal-navigation', val)
		});

		this.settings.add('layout.theatre-navigation', {
			requires: ['context.ui.theatreModeEnabled'],
			default: false,
			process(ctx, val) {
				return ctx.get('context.ui.theatreModeEnabled') ? val : false
			},
			ui: {
				path: 'Appearance > Layout >> Top Navigation',
				title: 'Show the minimized navigation bar when in theatre mode.',
				component: 'setting-check-box'
			},
			changed: val => this.toggle('theatre-nav', val)
		})

		this.settings.add('layout.prime-offers', {
			default: true,
			ui: {
				path: 'Appearance > Layout >> Top Navigation',
				title: 'Show Twitch Prime offers.',
				component: 'setting-check-box'
			},
			changed: val => this.toggleHide('prime-offers', !val)
		});


		// Chat

		this.settings.add('whispers.show', {
			default: true,
			ui: {
				path: 'Chat > Whispers >> General',
				title: 'Display Whispers',
				component: 'setting-check-box'
			},
			changed: val => this.toggleHide('whispers', !val)
		});

		this.settings.add('chat.bits.show', {
			default: true,
			ui: {
				order: -1,
				path: 'Chat > Bits and Cheering >> Appearance',
				title: 'Display Bits',
				description: 'Display UI associated with bits. Note: This will not hide cheering in chat messages.',
				component: 'setting-check-box'
			},
			changed: val => this.toggle('hide-bits', !val)
		});
	}

	onEnable() {
		this.toggle('swap-sidebars', this.settings.get('layout.swap-sidebars'));
		this.toggle('minimal-navigation', this.settings.get('layout.minimal-navigation'));
		this.toggle('theatre-nav', this.settings.get('layout.theatre-navigation'));
		//this.toggle('portrait', this.settings.get('layout.portrait'));

		this.toggleHide('side-nav', !this.settings.get('layout.side-nav.show'));
		this.toggleHide('side-rec-friends', !this.settings.get('layout.side-nav.show-rec-friends'));
		this.toggleHide('prime-offers', !this.settings.get('layout.prime-offers'));

		const recs = this.settings.get('layout.side-nav.show-rec-channels');
		this.toggleHide('side-rec-channels', recs === 0);
		this.toggleHide('side-closed-rec-channels', recs === 2);

		const friends = this.settings.get('layout.side-nav.show-friends');
		this.toggleHide('side-friends', friends === 0);
		this.toggleHide('side-closed-friends', friends === 2);

		this.toggleHide('whispers', !this.settings.get('whispers.show'));
	}


	toggleHide(key, val) {
		const k = `hide--${key}`;
		if ( ! val ) {
			this.style.delete(k);
			return;
		}

		if ( ! has(CLASSES, key) )
			throw new Error(`cannot find class for "${key}"`);

		this.style.set(k, `${CLASSES[key]} { display: none !important }`);
	}


	async toggle(key, val) {
		if ( ! val ) {
			this.style.delete(key);
			return;
		}

		if ( ! this.chunks_loaded )
			await this.populate();

		if ( ! has(this.chunks, key) )
			throw new Error(`cannot find chunk "${key}"`);

		this.style.set(key, this.chunks[key]);
	}


	set(key, val) { return this.style.set(key, val) }
	delete(key) { return this.style.delete(key) }

	setVariable(key, val, scope = 'body') {
		this.style.set(`var--${key}`, `${scope} { --ffz-${key}: ${val}; }`);
	}

	deleteVariable(key) { this.style.delete(`var--${key}`) }


	populate() {
		if ( this.chunks_loaded )
			return;

		return new Promise(async r => {
			const raw = (await import(/* webpackChunkName: "site-css-tweaks" */ './styles.js')).default;
			for(const key of raw.keys()) {
				const k = key.slice(2, key.length - (key.endsWith('.scss') ? 5 : 4));
				this.chunks[k] = raw(key);
			}

			this.chunks_loaded = true;
			r();
		})
	}
}