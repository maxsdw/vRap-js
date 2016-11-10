/**
 * This file is part of vRap.JS JavaScript Framework v1.0.4
 *
 * Copyright 2015, Jonathan Mauricio Sánchez Sanabria
 * Released under the MIT license
 */

vRap.Actions.define( 'Base.primitives.Interface', (function() {
	return {
		extend: 'Base.primitives.Foundation',
		properties: {
			type: 'interface'
		},
		observerList: [],
		controller: {},
		_boot: function() {
			var self = this,
				deferred = new $.Deferred();

			self.controller = vRap.Query.getApp( vRap.Properties.activeApp ).references.controllers;

			deferred.resolve();
		},
		hideViews: function( controllers ) {
			var self = this,
				ctrlList;

			ctrlList = controllers || self.config.controllers;

			if ( ctrlList ) {
				ctrlList.forEach(function( controller ) {
					if ( self.controller[ controller ] ) {
						self.controller[ controller ].hideViews();
					}
				});
			}
		}
	};
})(), {} );