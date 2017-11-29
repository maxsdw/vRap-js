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
		_ajaxCall: function( action, defaultMethod, dataObj, beforeRefresh, urlTemplate, preventPublish, context ) {
			var self = this,
				apiAction,
				ajaxConf,
				callObject,
				queryParams = '?';

			if ( self.properties.booted ) {
				apiAction = ( self.config.api && self.config.api[ action ] ) ? self.config.api[ action ] : false;

				if ( self.config.sendJSON ) {
					dataObj = JSON.stringify( dataObj );
				}

				if ( self.config.url ) {
					if ( urlTemplate ) {
						for ( var x in urlTemplate ) {
							self.config.parsedUrl = self.config.parsedUrl.replace( '{' + x + '}', urlTemplate[ x ] === null ? '' : urlTemplate[ x ] );
						}
					}

					self.config.parsedUrl = self.config.parsedUrl
						.replace( /{(.*?)}\/|{(.*?)}/g, '' )
						.replace( /([^:]\/)\/+/g, '$1' );

					if ( self.config.forceQueryParams && $.type( self.config.forceQueryParams ) === 'object' ) {
						$.each( self.config.forceQueryParams, function( key, value ) {
							queryParams += ( key + '=' + value );
						});

						self.config.parsedUrl += queryParams;
					}
				}

				if ( self.config.parsedUrl || apiAction ) {
					ajaxConf = {
						url: ( apiAction ) ? apiAction.url : self.config.parsedUrl,
						method: ( apiAction ) ? apiAction.method : ( action === 'sendData' && self.config.sendMethod ) ? self.config.sendMethod : defaultMethod,
						data: ( dataObj ) ? dataObj : null,
						context: context
					};

					if ( self.config.dynamicHeaders ) {
						ajaxConf.headers = self.config.dynamicHeaders[ ajaxConf.method ];
					}

					if ( self.config.ajaxConf.method ) {
						delete self.config.ajaxConf.method;
					}

					$.extend( ajaxConf, self.config.ajaxConf );

					callObject = $.ajax( ajaxConf );
					
					$.when( callObject )
						.done(function( data, textStatus, jqXHR ) {
							self._updateModel( action, ( action === 'read' ) ? data : ( ( dataObj ) ? $.extend( dataObj, data ) : data  ), beforeRefresh, preventPublish, this );
						});

					return callObject;
				} else {
					return self._updateModel( action, dataObj, beforeRefresh, preventPublish );
				}
			} else {
				vRap.Msg.alert( localeText.noApiUrl + ' | ' + self._objectNamespace );
			}
		},
		_updateModel: function( action, data, beforeRefresh, preventPublish, context ) {
			var self = this,
				dataObj,
				deferred = new $.Deferred(),
				insertMethod = 'push';

			dataObj = ( data ) ? data : self.properties.data; 

			if ( action === 'read' ) {
				self.properties.data = dataObj;
			}

			if ( !self.config.preventUpdate ) {
				if ( action === 'create' ) {
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
							self.properties.data.splice( index, 1 );
						}
					});
				}
			}

			if ( beforeRefresh ) {
				$.when( beforeRefresh( data, self ) ).done(function() {
					if ( !preventPublish ) {
						self.publish( 'dataChange', self.properties.data, action, self.properties.alias, context );
					}

					deferred.resolve( self.properties.data );
				});
			} else {
				if ( !preventPublish ) {
					self.publish( 'dataChange', dataObj, action, self.properties.alias, context );
				}

				deferred.resolve( dataObj );
			}

			return deferred.promise;
		},
		getData: function( dataObj, beforeRefresh, urlTemplate, preventPublish, context ) {
			this.config.parsedUrl = this.config.url;

			return this._ajaxCall( 'read', 'GET', dataObj, beforeRefresh, urlTemplate, preventPublish, context );
		},
		sendData: function( dataObj, urlTemplate, preventPublish, context ) {
			this.config.parsedUrl = this.config.url;

			return this._ajaxCall( 'sendData', 'POST', dataObj || this.properties.data, null, urlTemplate, preventPublish, context );
		},
		sendRecord: function( dataObj, urlTemplate, stringify, operationOverride, preventPublish, context ) {
			var self = this,
				operation = {},
				method;

			self.config.parsedUrl = self.config.url;

			if ( dataObj && dataObj.id ) {
				operation = { action: 'update', method: 'PUT' };

				if ( !self.config.forceParamId ) {
					self.config.parsedUrl = self.config.url + '/' + dataObj.id;
				}
			} else {
				operation = { action: 'create', method: 'POST' };
			}

			if ( operationOverride && $.type( operationOverride ) === 'object' ) {
				operation = operationOverride;
			} 

			if ( stringify ) {
				dataObj = JSON.stringify( dataObj );
			}

			return self._ajaxCall( operation.action, operation.method, dataObj, null, urlTemplate, preventPublish, context );
		},
		deleteRecord: function( recordId, urlTemplate, preventPublish, context ) {
			var self = this,
				dataObj = null;

			self.config.parsedUrl = self.config.url;

			if ( recordId ) {
				if ( !self.config.forceParamId ) {
					self.config.parsedUrl = self.config.url + '/' + recordId;
				} else {
					dataObj = {
						id: recordId
					};
				}
			}

			return self._ajaxCall( 'delete', 'DELETE', dataObj, null, urlTemplate, preventPublish, context );
		}
	};
})(), {} );
