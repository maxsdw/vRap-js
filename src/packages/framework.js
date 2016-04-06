/* @preserve vRap.js JavaScript Framework v1.0.0 | Based on jQuery 2+ | https://github.com/maxsdw/vRap-js | (c) 2014, Jonathan Mauricio Sánchez Sanabria | Released under the MIT license */

/**
 * Release Date: 2-12-2015
 */

// vRap Framework

(function(){
	var framework = {
		Apps: {},
		Classes: {},
		Properties: {
			activeApp: null,
			idCounter: 0
		},
		Query: {
			getApp: function( appName ) {
				var appObj = vRap.Apps[ appName ];

				if ( appObj ) {
					return appObj;
				} else {
					vRap.Msg.alert( vRap.Locale.alertMessages.noApp );
					
					return false;
				}
			},

			getClass: function( namespace ) {
				var subnames = namespace.split('.'),
					route = vRap.Classes;

				$.each( subnames, function( index, item ) {
					route = route[ item ];
				});

				if ( route ) {
					return route;
				} else {
					vRap.Msg.alert( vRap.Locale.alertMessages.noNamespace + ' | ' + namespace );

					return false;
				}
			},

			getObj: function( objNamespace ) {
				var app,
					route,
					splitNamespace;

				app = this.getApp( vRap.Properties.activeApp );
				route = app.objManager;

				splitNamespace = objNamespace.split('.');

				$.each( splitNamespace, function( index, item ) {
					if ( route ) {
						route = route[ item ];
					} else {
						vRap.Msg.alert( vRap.Locale.alertMessages.noObject + ' | ' + objNamespace );

						return false;
					}
				});

				return route;
			},

			getObjsByClass: function( classNamespace ) {
				var app,
					iterator,
					objectsArray = [];

				app = this.getApp( vRap.Properties.activeApp );

				iterator = function( route ) {
					$.each( route, function( key, value ) {
						if ( !value._classNamespace ) {
							iterator( value );
						} else {
							if ( value._classNamespace === classNamespace ) {
								objectsArray.push( value );
							}
						}
					});
				};

				iterator( app.objManager );

				return objectsArray;
			},

			getEvents: function( domEl ) {
				return $._data( domEl, "events" );
			}
		},
		Generators: {
			genIdNumber: function() {
				vRap.Properties.idCounter += 1;
				return vRap.Properties.idCounter;
			}
		},
		Actions: {
			newApp: function( properties ) {
				var deferred = new $.Deferred();

				if ( $.type( properties.appName ) !== 'string' ) {
					properties.appName = String( properties.appName );
				}

				vRap.Apps[ properties.appName ] = {
					objManager: {},
					references: {
						controllers: {},
						usedAlias: []
					},
					reactCmpts: {},
					localeObj: {}
				};

				vRap.Properties.activeApp = properties.appName;

				deferred.resolve();

				return vRap.Apps[ properties.appName ];
			},

			switchApp: function( appName ) {
				var appObj = vRap.Apps[ appName ];

				if ( appObj ) {
					vRap.Properties.activeApp = appName;
				} else {
					vRap.Msg.alert( vRap.Locale.alertMessages.noApp + ' | ' + appName );
					return false;
				}
			},

			define: function( namespace, API, statics ) {
				var parentClass,
					childClass,
					subnames = namespace.split('.'),
					route = vRap.Classes,
					objectKey;

				if ( API.extend ) {
					parentClass = vRap.Query.getClass( API.extend );

					API._extend = API.extend;

					delete API.extend;
				}
				
				$.each( subnames, function( index, item ) {
					if ( index < ( subnames.length - 1 ) ) {
						if ( !route[ item ] ) {
							route[ item ] = {};
						}
					} else {
						route[ item ] = function( properties ) {
							var scope = this;

							// Calling the superClass constructor
							if ( parentClass ) {
								parentClass.call( scope );
							}

							// Setting default properties
							scope.observerList = [];
							scope.linked = {};
							scope.properties = { booted: false, initialized: false };
							scope.properties = $.extend( scope.properties, {} );

							// Setting class name
							scope._classNamespace = namespace;

							// Adding API properties
							$.each( API, function( key, value ) {
								if ( !$.isFunction( API[ key ] ) ) {
									if ( key === 'properties' ) {
										$.extend( scope.properties,  API[ key ] );
									} else {
										scope[ key ] = value;
									}
								}
							});

							for ( objectKey in properties ) {
								if ( $.type( properties[ objectKey ] ) === 'function' ) {
									scope[ objectKey ] = properties[ objectKey ];
								} else {
									scope.properties[ objectKey ] = properties[ objectKey ];
								}
							}
						};
					}

					route = route[ item ];
				});

				childClass = route;

				// Extending from ancestor
				if ( parentClass ) {
					childClass.prototype = Object.create( parentClass.prototype );
					childClass.prototype.constructor = childClass;
				}

				// Adding methods
				$.each( API, function( key, value ) {
					if ( $.isFunction( API[ key ] ) ) {
						childClass.prototype[ key ] = value;
					}
				});

				// Adding statics
				if ( !$.isEmptyObject( statics ) ) {
					$.each( statics, function( key, value ) {
						childClass[ key ] = value;
					});
				}
			},

			create: function( classNamespace , objNamespace, properties ) {
				var self = this,
					app,
					deferred = new $.Deferred(),
					classContructor,
					subnames,
					route;

				if ( $.type( classNamespace ) === 'object' && classNamespace.instances || classNamespace.interfaces ) {
					$.when( self._classIterator( classNamespace ) ).done(function() {
						deferred.resolve();
					});
				} else {
					classContructor = vRap.Query.getClass( classNamespace );

					if ( classContructor ) {
						app = vRap.Query.getApp( vRap.Properties.activeApp );

						if ( app ) {
							subnames = objNamespace.split('.');
							route = app.objManager;

							$.each( subnames, function( index, item ) {
								if ( index < ( subnames.length - 1 ) ) {
									if ( !route[ item ] ) {
										route[ item ] = {};
									}
								} else {
									route[ item ] = new classContructor( properties );
								}

								route = route[ item ];
							});

							route._objectNamespace = objNamespace;
							route.properties.id = 'vRap_' + objNamespace.toLowerCase().replace( /\./g, '_' ) + '_' + vRap.Generators.genIdNumber();

							if ( route.properties.alias ) {
								if ( app.references.usedAlias.indexOf( route.properties.alias ) < 0) {
									app.references.usedAlias.push( route.properties.alias );
								} else {
									vRap.Msg.alert( vRap.Locale.alertMessages.duplicatedAlias + ' | Object: ' + objNamespace + ' | Alias: ' + route.properties.alias );
								}
							}

							$.when( route._boot() ).done(function() {
								route.properties.booted = true;

								if ( route.init ) {
									$.when( route.init() ).done(function( response ) {
										route.properties.initialized = true;

										deferred.resolve( route, response );
									});
								} else {
									vRap.Msg.alert( vRap.Locale.alertMessages.noInit+ ' | ' + objNamespace );
								}
							});
						}
					}
				}

				return deferred.promise();
			},

			destroy: function( objNamespace ) {
				var deferred = new $.Deferred(),
					app,
					object,
					splitNamespace,
					iterator,
					i = 0;

				app = vRap.Query.getApp( vRap.Properties.activeApp );
				object = vRap.Query.getObj( objNamespace );
				splitNamespace = objNamespace.split('.');

				iterator = function( route, subname ) {
					if ( route[ subname ]._objectNamespace &&  route[ subname ]._objectNamespace === objNamespace ) {
						route[ subname ] = null;

						delete route[ subname ];

						deferred.resolve();
					} else {
						iterator( route[ subname ], splitNamespace[ i += 1 ] );
					}
				};

				if ( object ) {
					if ( object.properties.domEl ) {
						if ( object.reactElements && Object.keys( object.reactElements ).length > 0 ) {
							ReactDOM.unmountComponentAtNode( object.properties.domEl[ 0 ] );
						}
						
						object.properties.domEl.remove();
					}

					iterator( app.objManager, splitNamespace[ i ] );
				} else {
					deferred.resolve();
				}

				return deferred.promise();
			},

			destroyByClass: function( classNamespace ) {
				$.each( vRap.Query.getObjsByClass( classNamespace ), function( index, item ) {
					vRap.destroy( item._objectNamespace );
				});
			},

			addCustomListener: function( properties ) {
				var objDomEl = vRap.Query.getObj( properties.component ).domEl;

				objDomEl.off( properties.eventType );
				objDomEl.on( properties.eventType, properties.method );
			},

			_classIterator: function( objConfig ) {
				var self = this,
					deferred = new $.Deferred(),
					iterator,
					iCounter = 0,
					instancesDone = false,
					insterfacesDone = false,
					deferredArray = [];

				iterator = function( objsArray, type ) {
					var item;

					if ( objsArray && objsArray.length > 0 && objsArray.length > iCounter ) {
						item = objsArray[ iCounter ];

						if ( objConfig.async ) {
							$.each( objConfig.instances, function( index, item ) {
								deferredArray.push( vRap.Actions.create( item.class, item.namespace, item.properties ) );

								iCounter += 1;
							});

							$.when.apply( $, deferredArray ).done(function() {
								iterator( objsArray, type );
							});
						} else {
							$.when( vRap.Actions.create( item.class, item.namespace, item.properties ) ).done(function() {
								iCounter += 1;

								iterator( objsArray, type );
							});
						}
					} else {
						if ( type === 'instances' ) {
							instancesDone = true;
						} else if ( type === 'interfaces' ) {
							insterfacesDone = true;
						}

						if ( !insterfacesDone ) {
							iCounter = 0;

							iterator( objConfig.interfaces, 'interfaces' );
						} else {
							deferred.resolve();
						}
					}
				};

				iterator( objConfig.instances, 'instances' );

				return deferred.promise();
			}
		},
		Msg: {
			alert: function( message ) {
				console.log( '%c ' + message, 'color: red' );
			},
		}
	};

	if ( !window.vRap ) {
		window.vRap = framework;
	}
})();