/**
 * This file is part of vRap.JS JavaScript Framework v1.0.0
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
        reactElements: {},
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

                insertionNode = ( self.properties.insertTo ) ? $( self.properties.insertTo.selector ) : $('body');

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

                $.when( self._setTemplate(), self._setReactComponents, self._setModel(), self._setEvents() ).done(function() {
                    deferred.resolve();
                });
            }

    		return deferred.promise();
    	},
        _setTemplate:function() {
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
        _setReactComponents: function() {
            var self = this,
                appObj = vRap.Query.getApp( vRap.Properties.activeApp ),
                deferred = new $.Deferred();

            if ( self.config.components && $.type( self.config.components ) === 'array' ) {
                $.each( self.config.components, function( index, item ) {
                    self.reactElements[ item.reactClass ] = React.createElement( appObj.reactCmpts[ item.reactClass ], $.extend( item.objProps, { locale: appObj.localeObj } ), item.children );
                });
            }

            deferred.resolve();
        },
    	_setModel: function() {
    		var self = this,
    			deferred = new $.Deferred();

            if ( self.properties.model && $.type( self.properties.model ) === 'string' ) {
                self.linked.model = vRap.Query.getObj( self.properties.model );

                if ( self.linked.model ) {
                    self.linked.model.subscribe(function( eventName, properties ) {
                        if ( eventName === 'dataChange' ) {
                            if ( self.refresh ) {
                                self.refresh( properties );
                            }
                        }
                    });

                    delete self.properties.model;
                }
            }

    		deferred.resolve();
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
        emit: function( eventName, properties ) {
            var self = this;

            self.publish( eventName, properties );
        }
    };
})(), {} );