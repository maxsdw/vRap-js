/* @preserve vRap.js JavaScript Framework v1.0.0 | Based on jQuery 2.1.1 | https://github.com/maxsdw/vRap-js | (c) 2014, Jonathan Mauricio Sánchez Sanabria | Released under the MIT license */

/**
 * Release Date: 25-08-2014
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
					vRap.Msg.alert( 'No app instance', 'vRap could not find the App instance, create it using the method vRap.newApp()' );
					return false;
				}
			},

			getClass: function( namespace ) {
	        	var subnames = namespace.split('.'),
	        		route = vRap.Classes;
	        	try {
				    $.each( subnames, function( index, item ) {
		        		route = route[ item ];
		        	});
		        	return route;
				}
				catch ( err ) {
					vRap.Msg.alert( 'No namespace', 'Bad namespace specification or namespace doesn\'t exist' );
				    return;
				}
	        },

			getObj: function( alias ) {
				var app,
					instanceFound = false;
				app = this.getApp( vRap.Properties.activeApp );
				$.each( app.objManager, function( name, value ) {
					var instance = app.objManager[ name ][ alias ];
					if ( instance ) {
						instanceFound = instance;
					}
				});
				return instanceFound;
			},

			getObjsByClass: function( className ) {
				var app,
					grouper = false;
				app = this.getApp( vRap.Properties.activeApp );
				$.each( app.objManager, function( name, value ) {
					if ( name === className ) {
						grouper = app.objManager[ name ];
					}
				});
				return grouper;
			},

			getStore: function( identifier ) {
				var app,
					instanceFound = false;
				app = this.getApp( vRap.Properties.activeApp );
				if ( app.objManager.Store ) {
					$.each( app.objManager.Store, function( name, object ) {
						if ( object.storeId === identifier || name === identifier ) {
							instanceFound = object;
						}
					});
				}
				return instanceFound;
			},

	        getEvents: function( domEl ) {
		    	return $._data( domEl, "events" );
		    },

		    getNodeFromXpath: function( xPath, root ) {
		        var nodesArr = xPath.split('/'),
		            node = root;
		        $.each( nodesArr, function( index, item ) {
		            var childType,
		                childIndex;
		            if ( index > 0 ) {
		                childType = item.split('[')[ 0 ];
		                childIndex = item.match(/[^[\]]+(?=])/g)[ 0 ];
		                node = $( node.children( childType )[ childIndex - 1 ] );
		            }
		        });
		        return node;
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
	        	if ( $.type( properties.appName ) !== 'string' ) {
	        		properties.appName = String( properties.appName );
	        	}
	        	vRap.Apps[ properties.appName ] = {
	        		objManager: {}
	        	};
	        	vRap.Properties.activeApp = properties.appName;
	        	return properties.appName;
	        },

	        switchApp: function( appName ) {
				var appObj = vRap.Apps[ appName ];
				if ( appObj ) {
					vRap.Properties.activeApp = appName;
				} else {
					vRap.Msg.alert( 'No app instance', 'vRap could not find any App named as "' + appName + '", create it using the method vRap.newApp()' );
					return false;
				}
			},

        	define: function( namespace, classBody ) {
	        	var parentClass,
		        	childClass,
	        		subnames = namespace.split('.'),
	        		route = vRap.Classes;
	        	if ( classBody.extend ) {
	    			parentClass = vRap.Query.getClass( classBody.extend );
	    		}
	        	$.each( subnames, function( index, item ) {
	        		if ( index < ( subnames.length - 1 ) ) {
	        			if ( route[ item ] === undefined ) {
	        				route[ item ] = {};
	        			}
	        		} else {
	        			route[ item ] = function( properties, callback ) {
	        				var privateProperties = classBody.privateProperties,
	        					callback = callback,
	        					className;

	        				// Calling the superClass constructor
	        				if ( parentClass ) {
				    			parentClass.call( this );
				    		}

				    		// Declaring private methods
				    		function privateMethods() {
				    			return classBody.privateMethods;
				    		};

				    		// Privileged methods definition
	        				this.propGet = function( name ) {
	        					return privateProperties[ name ];
	        				};
	        				this.propSet = function( name, value ) {
	        					privateProperties[ name ] = value;
	        					return privateProperties[ name ];
	        				};
	        				this.runMethod = function( name ) {
	        					var methodArgumens = $.makeArray( arguments ).slice( 1 );
	        					methodArgumens.unshift( privateProperties );
	        					return privateMethods()[ name ].apply( this, methodArgumens );
	        				};
	        				this.getCallback = function( name, value ) {
	        					return callback;
	        				};

	        				// Setting general properties
	        				if ( subnames[ 0 ] === 'Base' && subnames[ 1 ] !== 'primitives' ) {
	        					className = item.toLowerCase();
	        					this.className = item;
	        					this.type = className;
	        					this.id = 'vRap_' + className + '_' + vRap.Generators.genIdNumber();
	        				}

	        				// Extending properties
	        				$.extend( this, classBody.publicProperties );
	        				$.extend( this, properties );
	        			};
	        		}
	        		route = route[ item ];
	        	});
	        	childClass = route;
	        	if ( parentClass ) {
	    			childClass.prototype = Object.create( parentClass.prototype );
	    			childClass.prototype.constructor = childClass;
	    		}
	    		if ( classBody.publicMethods ) {
	    			$.each( classBody.publicMethods, function( name, value ) {
		        		childClass.prototype[ name ] = value;
		        	});
	    		}
	        	if ( classBody.staticProperties || classBody.staticMethods ) {
	        		$.each( $.extend( classBody.staticProperties, classBody.staticMethods ), function( name, value ) {
		        		childClass[ name ] = value;
		        	});
	        	}
	        },

	        create: function( classNamespace , alias, properties, callback ) {
	        	var classContructor,
	        		app,
	        		splitNamespace,
	        		group,
	        		instance;
	        	classContructor = vRap.Query.getClass( classNamespace );
	        	if ( classContructor ) {
	        		app = vRap.Query.getApp( vRap.Properties.activeApp );
	        		prevInstance = vRap.Query.getObj( alias );
	        		if ( app ) {
	        			if ( !prevInstance ) {
	        				splitNamespace = classNamespace.split('.');
	        				lastSplitItem = splitNamespace[ splitNamespace.length - 1 ];
		        			group = app.objManager[ lastSplitItem ];
		        			if ( !group ) {
		        				group = app.objManager[ lastSplitItem ] = {};
		        			}
		        			instance = group[ alias ] = new classContructor( properties, callback );
		        			instance.alias = alias;
		        			if ( instance.init ) {
		        				instance.init();
		        			} else {
		        				vRap.Msg.alert( 'No init method', 'The object constructor for "' + alias + '" does not contain an init() method.' );
		        			}
	        			} else {
	        				vRap.Msg.alert( 'Duplicated object', 'An object with the alias "' + alias + '" already exists' );
	        			}
	        		} else {
	        			vRap.Msg.alert( 'No active app', 'There is no active App' );
	        		}
	        	} else {
	        		vRap.Msg.alert( 'Class doesn\'t exist', 'The class "' + classNamespace + '" doesn\'t exist.' );
	        	}
			},

			destroy: function( alias, callback ) {
				var $this = this,
					app = vRap.Query.getApp( vRap.Properties.activeApp ),
					object = vRap.Query.getObj( alias ),
					store = vRap.Query.getStore( alias ),
					domEl;
				if ( object ) {
					delete app.objManager[ object.className ][ alias ];
					domEl = object.domEl;
					if ( domEl.length > 0 ) {
						domEl.fadeOut(function() {
							domEl.remove();
							domEl.trigger('destroy');
						});
					}
					if ( object.items ) {
						if ( $.isArray( object.items ) ) {
							$.each( object.items, function( index, item ) {
								$this.destroy( item.alias );
							});
						}
					}
				} else if ( store ) {
					delete app.objManager.Store[ store.alias ];
				}
				if ( callback ) {
					callback();
				}
			},

			destroyByType: function( className ) {
				var $this = this;
				$.each( vRap.Query.getObjsByClass( className ), function( index, item ) {
					$this.destroy( item.alias );
				});
			},

			addCustomListener: function( properties ) {
				var objDomEl = vRap.Query.getObj( properties.component ).domEl;
				objDomEl.off( properties.eventType );
				objDomEl.on( properties.eventType, properties.method );
			},

			capitalizeFirstChar: function( string ) {
				return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
			},

			clearTextSelection: function() {
				if ( window.getSelection ) {
					if ( window.getSelection().empty ) {
						window.getSelection().empty();
					} else if ( window.getSelection().removeAllRanges ) {
						window.getSelection().removeAllRanges();
					}
				} else if ( document.selection ) {
					document.selection.empty();
				}
			}
        },
	    Msg: {
	    	alert: function( title, message ) {
	    		console.log( title, message );
		    },
	    }
	}
	if ( !window.vRap ) {
		window.vRap = framework;
	}
})();