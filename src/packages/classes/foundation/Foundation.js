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
			var type = $.type( observer ),
				observerIndex;

			if ( type === 'string' ) {
				this.observerList = $.grep(this.observerList, function ( listItem, index ) {
					if ( listItem.key === observer ) {
						return false;
					}

					return true;
				});
			} else if ( type === 'function' ) {
				observerIndex = this.observerList.indexOf( observer, 0 );

				if ( observerIndex >= 0 ) {
					this.observerList.splice( observerIndex, 1 );
				}
			}
		},
		publish: function( eventName, properties, extraParams, alias, context ) {
			$.each( this.observerList, function( index, observer ) {
				var type = $.type( observer );

				if ( type === 'object' ) {
					observer.callback( eventName, properties, extraParams, alias, context );
				} else if ( type === 'function' ) {
					observer( eventName, properties, extraParams, alias, context );
				}
			});
		}
	};
})(), {} );
