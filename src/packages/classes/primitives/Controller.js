/**
 * This file is part of vRap.JS JavaScript Framework v1.0.0
 *
 * Copyright 2015, Jonathan Mauricio Sánchez Sanabria
 * Released under the MIT license
 */

vRap.Actions.define( 'Base.primitives.Controller', (function() {
	var localeText;

	localeText = vRap.Locale.alertMessages;

	return {
		extend: 'Base.primitives.Foundation',
		properties: {
			type: 'controller'
		},
		_boot: function() {
			var self = this,
				deferred = new $.Deferred();

			if ( self.properties.alias ) {
				self.linked = { model: {}, view: {} };

				self._setModels().then(function() {
					self._setViews().then(function() {
						self._setListeners().done(function() {
							var app = vRap.Query.getApp( vRap.Properties.activeApp );

							app.references.controllers[ self.properties.alias ] = self;

							deferred.resolve();
						});
					});
				});
			} else {
				vRap.Msg.alert( localeText.noAlias + ' | ' + self._objectNamespace );

				deferred.reject();
			}

			return deferred.promise();
		},
		_setModels: function() {
			var self = this,
				deferred = new $.Deferred();

			$.when( self._classIterator( self.config.models, 'model' ) ).done(function() {
				deferred.resolve();
			});

			return deferred.promise();
		},
		_setViews: function() {
			var self = this,
				deferred = new $.Deferred(),
				completedInstances = 0;

			$.when( self._classIterator( self.config.views, 'view' ) ).done(function() {
				deferred.resolve();
			});

			return deferred.promise();
		},
		_setListeners: function() {
			var self = this,
				deferred = new $.Deferred(),
				listerners = 0;

			if ( self.config.listeners && !$.isEmptyObject( self.config.listeners ) ) {
				$.each( self.config.listeners, function( key, method ) {
					$.each( self.linked.view, function( index, item ) {
						item.subscribe(function( eventName, properties ) {
							if ( eventName === key ) {
								self[ method ]( eventName, properties );
							}
						});
					});

					listerners += 1;

					if ( Object.keys( self.config.listeners ).length === listerners ) {
						deferred.resolve();
					}
				});
			} else {
				deferred.resolve();
			}

			return deferred.promise();
		},
		_classIterator: function( definitionObj, linkedTo ){
			var self = this,
				deferred = new $.Deferred(),
				completedInstances = 0;

			if ( definitionObj && !$.isEmptyObject( definitionObj ) ) {
				if ( $.type( definitionObj ) === 'array' ) {
					$.each( definitionObj, function( index, item ) {
						var object = vRap.Query.getObj( item );

						if ( object ) {
							if ( object.properties.alias ) {
								self.linked[ linkedTo ][ object.properties.alias ] = object;
							} else {
								vRap.Msg.alert( localeText.noAlias + ' | ' + object._objectNamespace );
							}   
						}
					});

					deferred.resolve();
				} else {
					$.each( definitionObj, function( key, configObj ) {
						var namespace  = $.extend( {}, configObj ).namespace;

						delete configObj.namespace;

						if ( configObj.domEl ) {
							configObj.domEl = $( configObj.domEl.selector );
						}

						$.when( vRap.Actions.create( key, namespace, configObj ) ).done(function( object ) {
							completedInstances += 1;

							if ( configObj.alias ) {
								self.linked[ linkedTo ][ configObj.alias ] = object;

								if ( Object.keys( definitionObj ).length === completedInstances ) {
									deferred.resolve();
								}
							} else {
								vRap.Msg.alert( localeText.noAlias + ' | ' + object._objectNamespace );
							}
						});
					});
				}
			} else {
				deferred.resolve();
			}

			return deferred.promise();
		},
		processViews: function() {
			var self = this;

			self._setViews();
		},
		showViews: function() {
			var self = this;

			_.each( self.linked.view, function( view ) {
				view.show();
			});
		},
		hideViews: function() {
			var self = this;

			_.each( self.linked.view, function( view ) {
				view.hide();
			});
		}
	};
})(), {} );