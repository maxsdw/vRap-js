/**
 * This file is part of vRap.JS JavaScript Framework v1.0.4
 *
 * Copyright 2015, Jonathan Mauricio Sánchez Sanabria
 * Released under the MIT license
 */

vRap.Actions.define( 'Base.primitives.Model', (function() {
	var localeText;

	localeText = vRap.Locale.alertMessages;

	return {
		extend: 'Base.primitives.Foundation',
		properties: {
			type: 'model'
		},
		_boot: function() {
			var self = this,
				deferred = new $.Deferred();

			if ( self.properties.data || self.config.url || self.config.api && !$.isEmptyObject( self.config.api ) ) {
				if ( self.config.url && $.type( self.config.url ) === 'function' ) {
					self.config.url = self.config.url();
				}

				deferred.resolve();
			} else {
				vRap.Msg.alert( localeText.noApiOrData + ' | ' + self._objectNamespace );
			}

			return deferred.promise();
		},
		_ajaxCall: function( action, defaultMethod, dataObj, beforeRefresh ) {
			var self = this,
				apiAction,
				ajaxConf,
				callObject;

			if ( self.properties.booted ) {
				apiAction = ( self.config.api && self.config.api[ action ] ) ? self.config.api[ action ] : false;

				if ( self.config.sendJSON ) {
					dataObj = JSON.stringify( dataObj );
				}

				if ( self.config.url || apiAction ) {
					ajaxConf = {
						url: ( apiAction ) ? apiAction.url : self.config.url,
						method: ( apiAction ) ? apiAction.method : ( action === 'sendData' && self.config.sendMethod ) ? self.config.sendMethod : defaultMethod,
						data: ( dataObj ) ? dataObj : null 
					};

					if ( self.config.ajaxConf.method ) {
						delete self.config.ajaxConf.method;
					}

					$.extend( ajaxConf, self.config.ajaxConf );

					callObject = $.ajax( ajaxConf );
					
					$.when( callObject )
						.done(function( data, textStatus, jqXHR ) {
							self._updateModel( action, ( action === 'read' ) ? data : ( ( dataObj ) ? $.extend( dataObj, data ) : data  ), beforeRefresh);
						});

					return callObject;
				} else {
					return self._updateModel( action, dataObj, beforeRefresh );
				}
			} else {
				vRap.Msg.alert( localeText.noApiUrl + ' | ' + self._objectNamespace );
			}
		},
		_updateModel: function( action, data, beforeRefresh ) {
			var self = this,
				dataObj,
				deferred = new $.Deferred(),
				insertMethod = 'push';

			dataObj = ( data ) ? data : self.properties.data; 

			if ( action === 'read' ) {
				self.properties.data = dataObj;
			} else if ( action === 'create' ) {
				if ( $.type( self.properties.data ) === 'array' ) {
					if ( self.config.prependRecord ) {
						insertMethod = 'unshift';
					}

					self.properties.data[ insertMethod ]( dataObj );
				}
			} else if ( action === 'update' ) {
				$.each( self.properties.data, function( index, item ) {
					if ( item.id === data.id ) {
						$.extend( self.properties.data[ index ], data );
					}
				});
			} else if ( action === 'delete' ) {
				$.each( self.properties.data, function( index, item ) {
					if ( item.id === data.id ) {
						elf.properties.data.splice( index, 1 );
					}
				});
			}

			if ( beforeRefresh ) {
				$.when( beforeRefresh( data ) ).done(function() {
					self.publish( 'dataChange', self.properties.data );

					deferred.resolve( self.properties.data );
				});
			} else {
				self.publish( 'dataChange', dataObj );

				deferred.resolve( dataObj );
			}

			return deferred;
		},
		getData: function( dataObj, beforeRefresh ) {
			var self = this;

			return self._ajaxCall( 'read', 'GET', dataObj, beforeRefresh );
		},
		sendData: function( dataObj ) {
			var self = this;

			return self._ajaxCall( 'sendData', 'POST', dataObj || self.properties.data );
		},
		sendRecord: function( dataObj ) {
			var self = this,
				action,
				method;

			if ( dataObj && dataObj.id ) {
				action = 'update';
				method = 'PUT';

				if ( !self.config.forceParamId ) {
					self.config.url = self.config.url + '/' + dataObj.id;

					delete dataObj.id;
				}
			} else {
				action = 'create';
				method = 'POST';
			}

			return self._ajaxCall( action, method, dataObj );
		},
		deleteRecord: function( recordId ) {
			var self = this,
				dataObj = null;

			if ( !self.config.forceParamId ) {
				self.config.url = self.config.url + '/' + recordId;
			} else {
				dataObj = {
					id: recordId
				};
			}

			return self._ajaxCall( 'delete', 'DELETE', dataObj );
		}
	};
})(), {} );