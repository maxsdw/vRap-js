/**
 * This file is part of vRap.JS JavaScript Framework v1.0.4
 *
 * Copyright 2015, Jonathan Mauricio Sánchez Sanabria
 * Released under the MIT license
 */

vRap.Actions.define( 'Base.primitives.Foundation', (function() {
	return {
		_boot: function() {
			var deferred = new $.Deferred();

			return deferred.resolve();
		},
		subscribe: function( observer ) {
			this.observerList.push( observer );
		},
		unsubscribe: function( observer ) {
			var observerIndex = this.observerList.indexOf( observer, 0 );

			if ( observerIndex >= 0 ) {
				this.observerList.splice( observerIndex, 1 );
			}
		},
		publish: function( eventName, properties, extraParams ) {
			$.each( this.observerList, function( index, observer ) {
				observer( eventName, properties, extraParams );
			});
		}
	};
})(), {} );