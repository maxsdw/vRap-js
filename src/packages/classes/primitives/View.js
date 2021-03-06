/**
 * This file is part of vRap.JS JavaScript Framework v1.0.4
 *
 * Copyright 2015, Jonathan Mauricio Sánchez Sanabria
 * Released under the MIT license
 */

vRap.Actions.define( 'Base.primitives.View', (function() {
	var localeText;

	localeText = vRap.Locale.alertMessages;

	return {
		extend: 'Base.primitives.Foundation',
		properties: {
			type: 'view'
		},
		_boot: function() {
			var self = this,
				deferred = new $.Deferred(),
				domEl,
				insertionNode;

			domEl = self.properties.domEl;

			if ( domEl ) {
				if ( !( domEl instanceof jQuery ) || domEl.length === 0 ) {
					vRap.Msg.alert( localeText.badDomEl + ' | ' + self._objectNamespace );

					deferred.reject();
				}
			} else {
				domEl = self.properties.domEl = $('<div id="' + self.properties.id + '"></div>');

				insertionNode = ( self.properties.insertTo ) ? self.properties.insertTo : $('body');

				if ( insertionNode instanceof jQuery && insertionNode.length > 0 ) {
					insertionNode.append( domEl );   
				} else {
					vRap.Msg.alert( localeText.badInsertEl + ' | ' + self._objectNamespace );

					deferred.reject();
				}
			}

			if ( deferred.state() !== 'rejected' ) {
				if ( self.properties.style ) {
					domEl.attr( 'class', self.properties.style );
				}

				$.when( self._setTemplate(), self._setReactComponents(), self._setModel(), self._setEvents() ).done(function() {
					deferred.resolve();
				});
			}

			if ( self.properties.hidden ) {
				domEl.addClass('hide');
			}

			return deferred.promise();
		},
		_setTemplate: function() {
			var self = this,
				deferred = new $.Deferred();

			if ( self.config.template ) {
				$.get( self.config.template, function( data ) {
					self.properties.template = $( data ).html();

					deferred.resolve();
				});
			} else {
				deferred.resolve();
			}

			return deferred.promise();
		},
		_setReactComponents: function( components ) {
			var self = this,
				appObj = vRap.Query.getApp( vRap.Properties.activeApp ),
				deferred = new $.Deferred(),
				componentsArray;

			componentsArray = components || self.config.components;

			if ( componentsArray && $.type( componentsArray ) === 'array' ) {
				self.reactElements = self.reactElements || {};
				self.reactInstances = self.reactElements || {};

				$.each( componentsArray, function( index, item ) {
					self.reactElements[ item.reactClass ] = React.createElement( appObj.reactCmpts[ item.reactClass ], $.extend( item.objProps, { locale: ( self.config.locale ) ? appObj.localeObj[ self.config.locale ] : {}, viewNamespace: self._objectNamespace } ), item.children );
				});
			}

			deferred.resolve();
		},
		_setModel: function() {
			var self = this,
				deferred = new $.Deferred(),
				propType,
				models = [];

			self.linked.model = self.linked.model || {};

			if ( self.properties.model ) {
				propType = $.type( self.properties.model );

				if ( propType === 'string' ) {
					models.push( self.properties.model );
				} else if ( propType === 'array' ) {
					models = self.properties.model;
				}

				$.each( models, function( index, model ) {
					var splitNamespace,
						modelName;

					splitNamespace = model.split('.');
					modelName = splitNamespace[ splitNamespace.length - 1 ];

					self.linked.model[ modelName ] = vRap.Query.getObj( model );

					if ( self.linked.model[ modelName ] ) {
						self.linked.model[ modelName ].subscribe( { key: self._objectNamespace, callback: self._observer.bind( self ) } );

						delete self.properties.model;
					}
				});
			}

			deferred.resolve();
		},
		_unsubscribeModel: function() {
			var self = this,
				deferred = new $.Deferred();

			$.each( self.linked.model, function( index, model ) {
				model.unsubscribe( self._objectNamespace );
			});

			deferred.resolve();
		},
		_observer: function( eventName, properties, action, alias, context ) {
			if ( eventName === 'dataChange' ) {
				if ( this.refresh ) {
					this.refresh( properties, action, alias, context );
				}
			}
		},
		_setEvents: function() {
			var self = this,
				deferred = new $.Deferred();

			if ( self.config.events && !$.isEmptyObject( self.config.events ) ) {
				$.each( self.config.events, function( key, methodName ) {
					var eventName,
						selector;

					eventName = key.substr( 0, key.indexOf(' ') );
					selector = key.substr( key.indexOf(' ') + 1 );

					self.properties.domEl.on( eventName, selector, function( e ) {
						self[  methodName ]( $( this ), methodName, e );
					});
				});
			}

			deferred.resolve();
		},
		processComponents: function( components ) {
			var self = this,
				deferred= new $.Deferred();

			$.when( self._setReactComponents( components ) ).done(function() {
				deferred.resolve();
			});

			return deferred.promise();
		},
		hide: function() {
			this.properties.domEl.addClass('hide');
		},
		show: function() {
			this.properties.domEl.removeClass('hide');
		},
		emit: function( eventName, properties ) {
			var self = this;
			
			setTimeout(function() {
				self.publish( eventName, properties );
			}, 0);
		}
	};
})(), {} );
