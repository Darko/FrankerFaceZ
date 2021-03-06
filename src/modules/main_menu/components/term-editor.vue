<template lang="html">
	<div class="ffz--term">
		<div class="tw-align-items-center tw-flex tw-flex-nowrap tw-flex-row tw-full-width">
			<div v-if="! is_valid" class="tw-tooltip-wrapper tw-mg-r-05">
				<figure class="tw-c-text-error ffz-i-attention" />
				<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-left">
					{{ t('setting.terms.warn-invalid', 'This highlight term is invalid.') }}
				</div>
			</div>
			<div v-if="! is_safe" class="tw-tooltip-wrapper tw-mg-r-05">
				<figure class="tw-c-text-hint ffz-i-attention" />
				<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-left">
					{{ t('setting.terms.warn-complex', 'This highlight term is potentially too complex. It may cause client lag.') }}
				</div>
			</div>
			<div class="tw-flex-grow-1">
				<h4 v-if="! editing" class="ffz-monospace">
					<pre>{{ term.v }}</pre>
				</h4>
				<input
					v-else
					v-model="edit_data.v"
					:placeholder="adding ? t('setting.terms.add-placeholder', 'Add a new term') : edit_data.v"
					type="text"
					class="tw-block tw-full-width tw-border-radius-medium tw-font-size-6 tw-full-width tw-input tw-pd-x-1 tw-pd-y-05"
					autocapitalize="off"
					autocorrect="off"
				>
			</div>
			<div v-if="colored" class="tw-flex-shrink-0 tw-mg-l-05">
				<color-picker v-if="editing" v-model="edit_data.c" :nullable="true" :show-input="false" :open-up="true" />
				<div v-else-if="term.c" class="ffz-color-preview">
					<figure :style="`background-color: ${term.c}`">
						&nbsp;
					</figure>
				</div>
			</div>
			<div class="tw-flex-shrink-0 tw-mg-x-05">
				<span v-if="! editing">{{ term_type }}</span>
				<select
					v-else
					v-model="edit_data.t"
					class="tw-block tw-border-radius-medium tw-font-size-6 tw-select tw-pd-l-1 tw-pd-r-3 tw-pd-y-05 ffz-min-width-unset"
				>
					<option value="text">{{ t('setting.terms.type.text', 'Text') }}</option>
					<option value="glob">{{ t('setting.terms.type.glob', 'Glob') }}</option>
					<option value="regex">{{ t('setting.terms.type.regex-word', 'Regex (Word)') }}</option>
					<option value="raw">{{ t('setting.terms.type.regex', 'Regex') }}</option>
				</select>
			</div>
			<div v-if="adding" class="tw-flex-shrink-0">
				<button class="tw-button" @click="save">
					<span class="tw-button__text">
						{{ t('setting.terms.add-term', 'Add') }}
					</span>
				</button>
			</div>
			<div v-else-if="editing" class="tw-flex-shrink-0">
				<button class="tw-button tw-button--text tw-tooltip-wrapper" @click="save">
					<span class="tw-button__text ffz-i-floppy" />
					<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-right">
						{{ t('setting.save', 'Save') }}
					</div>
				</button>
				<button class="tw-button tw-button--text tw-tooltip-wrapper" @click="cancel">
					<span class="tw-button__text ffz-i-cancel" />
					<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-right">
						{{ t('setting.cancel', 'Cancel') }}
					</div>
				</button>
			</div>
			<div v-else-if="deleting" class="tw-flex-shrink-0">
				<button class="tw-button tw-button--text tw-tooltip-wrapper" @click="$emit('remove', term)">
					<span class="tw-button__text ffz-i-trash" />
					<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-right">
						{{ t('setting.delete', 'Delete') }}
					</div>
				</button>
				<button class="tw-button tw-button--text tw-tooltip-wrapper" @click="deleting = false">
					<span class="tw-button__text ffz-i-cancel" />
					<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-right">
						{{ t('setting.cancel', 'Cancel') }}
					</div>
				</button>
			</div>
			<div v-else class="tw-flex-shrink-0">
				<button class="tw-button tw-button--text tw-tooltip-wrapper" @click="edit">
					<span class="tw-button__text ffz-i-cog" />
					<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-right">
						{{ t('setting.edit', 'Edit') }}
					</div>
				</button>
				<button class="tw-button tw-button--text tw-tooltip-wrapper" @click="deleting = true">
					<span class="tw-button__text ffz-i-trash" />
					<div class="tw-tooltip tw-tooltip--down tw-tooltip--align-right">
						{{ t('setting.delete', 'Delete') }}
					</div>
				</button>
			</div>
		</div>
	</div>
</template>

<script>

import safety from 'safe-regex';

import {deep_copy, glob_to_regex, escape_regex} from 'utilities/object';

export default {
	props: {
		term: Object,
		colored: {
			type: Boolean,
			default: false
		},
		adding: {
			type: Boolean,
			default: false
		}
	},

	data() {
		if ( this.adding )
			return {
				deleting: false,
				editing: true,
				edit_data: deep_copy(this.term)
			};

		return {
			deleting: false,
			editing: false,
			edit_data: null
		}
	},

	computed: {
		is_valid() {
			const data = this.editing ? this.edit_data : this.term,
				t = data.t;

			let v = data.v;

			if ( t === 'text' )
				v = escape_regex(v);

			else if ( t === 'glob' )
				v = glob_to_regex(v);

			try {
				new RegExp(v);
				return true;
			} catch(err) {
				return false;
			}
		},

		is_safe() {
			const data = this.editing ? this.edit_data : this.term,
				t = data.t;

			let v = data.v;

			if ( t === 'text' )
				v = escape_regex(v);

			else if ( t === 'glob' )
				v = glob_to_regex(v);

			return safety(v);
		},

		term_type() {
			const t = this.term && this.term.t;
			if ( t === 'text' )
				return this.t('setting.terms.type.text', 'Text');

			else if ( t === 'raw' )
				return this.t('setting.terms.type.raw', 'Regex');

			else if ( t === 'glob' )
				return this.t('setting.terms.type.glob', 'Glob');

			else if ( t === 'regex' )
				return this.t('setting.terms.type.regex-word', 'Regex (Word)');

			return this.t('setting.unknown', 'Unknown Value');
		}
	},

	methods: {
		edit() {
			this.editing = true;
			this.edit_data = deep_copy(this.term);
		},

		cancel() {
			if ( this.adding ) {
				this.edit_data = deep_copy(this.term);

			} else {
				this.editing = false;
				this.edit_data = null;
			}
		},

		save() {
			this.$emit('save', this.edit_data);
			this.cancel();
		}
	}
}

</script>