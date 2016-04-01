vRap-js
=======

## Usage
***

vRap.js is an object oriented Front-End framework to easily construct Rich Internet Apps with JavaScript. Using a MVC architecture approach, vRap-js provides a convenient way to give structure to your projects, it exposes an API that let you manage client-side data and synchronize that data with a persistence model, as well as create, extend and manage classes and objects with no effort. You can mix vRap.js with any other framework or library you prefer.

### Attach the vrap-js.min.js file to the project HTML

        <script src="js/vrap-js-1.0.0.min.js"></script>

### Create an application instance

The first step to start using vRap.js is creating an instance of your application, this will define a unique namespace, where all objects for this particular app will be stored.

In order to create a new app instance we must call the method **newApp()**, passing a configuration object as argument:

        vRap.Actions.newApp({
            appName: <app name>
        });

This will generate a namespace for the new application, to retrieve it use this:

        vRap.Apps.<app name>;

### Define a new class

Once the application enviroment has been created, you can start defining your clasess like this:

        vRap.Actions.define( <namespace>, <atributes>, <statics> );

There are four vRap.js primitive classes:

        Base.primitives.Model
        Base.primitives.View
        Base.primitives.Controller
        Base.primitives.Interface

They all extend from one base class:

        Base.primitives.Foundation 
        
Any new class you create should extend from one of the four primitive classes, according to its purpose; for example if you are building a class that renders a data grid in the viewport, the class should extend from the "View" primitive class, so let's define a class using the name "DataGrid":

        vRap.Actions.newApp({
            appName: 'DemoApp'
        });
        
        vRap.Actions.define( 'DemoApp.views.DataGrid', (function(){
            return {
                extend: 'Base.primitives.View'
            };
        })(), {} );
        
Notice the convention used to define the namespace for our classes:

        <app name>.<category>.<class name> // For the class name always use UpperCamelCase
        
If the class you need to create doesn't fit to any of the four primitive categories, you can extend it from "Base.primitives.Foundation" directly, for example, let's say you need to define a class for a communication protocol, so, proceed like this:

        vRap.Actions.define( 'DemoApp.protocols.DataExchange', (function(){
            return {
                extend: 'Base.primitives.Foundation'
            };
        })(), {} );
        
As you can see above, you must define a class by applying a module pattern, this is considered a good practice because enable us to easily set private attributes as well as to expose a public API, let's take the same example above, but now setting some attributes (Custom properties should be included inside "properties" attribute):

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                // Private Attributes
                var privateProp,
                    privateMethod;
                    
                privateProp = 'This is private';
                privateMethod = function() {
                        return privateProp;
                };
                
                // Public API
                return {
                        extend: 'Base.primitives.View',
                        properties: {
                                publicProp: 'This is public'
                        },
                        publicMethod: function() {
                                console.log( this.properties.publicProp ) // It prints "This is public"
                                console.log( privateMethod() ) // It prints "This is private"
                        }
                };
        })(), {} );

It is a requirement that all new classes include a "init()" method, it will run automatically each time a new object is instantiated:

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        init: function() {
                                ...
                        }
                };
        })(), {} );

You can also add static attributes to the class in this way:

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        init: function() {
                                ...
                        }
                };
        })(), { staticProp: 'This is static' } );
        
There is a list of reserved words; please don't use the following words as the name of any method when defining your classes, unless you want to overwrite one of the class native methods:

* subscribe
* unsubscribe
* publish
* getData
* sendData
* sendRecord
* deleteRecord
* emit

### Instantiate a new object

Once you defined a class it's time to start using it, for that you must instantiate a new object, you can create as many object as you wish from the same class:

        vRap.Actions.create( <class namespace>, <object namespace>, <attributes> ); // For the object namespace always use lowerCamelCase

When creating a new object, you can add new public attributes or modify already existent attributes of the class, new or modified attributes will belong only to this specific object, let's continue where we left:

        vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {
                gridStyle: 'This property belongs only to this object, not to the class', // Attributes identified as properties will be stored inside "properties".
                renderUser: function() { ... } // Methods in the other hand will be included directly in the object root.
        });
        
*Note:* When instantiating a new object, all the properties you pass as an argument within the create function, will be stored inside
\<object\>.properties, in that order, all native configuration ( config: {} ), must be specified when defining the class and not when creating the object.

In order to generate a well arranged objects tree, when defining the object namespace is recommended to write before the name, the primitive category to which it belongs, for instance, in our previous example, "usersGrid" object is extended from "Base.primitives.View", so we write the namespace as "views.usersGrid".

When a new object is created you can assign it an unique alias, the alias will be used to identify the object under certain circunstances, this property is initially optional, but it is mandatory in some cases that will be explained later.

        vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {
                alias: 'usersGrid'
        });
        
As soon as the new object is created, the "init()" function is fired automatically. Now you will be able to run any public method previously defined or get any public property:

        var userGrid = vRap.Query.getObj('views.usersGrid');

        userGrid.publicMethod();
        userGrid.renderUser();
        userGrid.properties.gridStyle;
        userGrid.properties.alias;
        
### Observer (Publish/Subscribe) Pattern

You can subscribe one or more observers to a particular instance (subject), so any time a specific event in that instance is triggered, all the subscribers are notified, all objects in vRap are enable for this pattern.

To subscribe an observer proceed like this:

        subject.subscribe( <observer> );

For example, let's subscribe a new observer to "usersGrid" instance:

        var subject,
            observer;
        
        subject = vRap.Query.getObj('views.usersGrid');
        observer = function( eventName, properties ) {
                console.log( eventName + ': ' + properties.message );
        };
        
        subject.subscribe( observer );
        
Observers can be notified at any time by using the "publish" method:

        subject.publish( 'testEvent', { message: 'The observer was notified!' } ); // It prints this in the console: "testEvent: The observer was notified!"
        
You can also unsubscribe previously added observers:

        subject.unsubscribe( observer );

### Using callback functions

It is possible to run a callback function when creating a new object, for that porpuse you can use jQuery Deferred objects, like this:

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        init: function() {
                                var deferred = new $.Deferred();
                                
                                ...
                                
                                return deferred.resolve('Widget was initialized');
                        }
                };
        })(), {} );
        
        $.when( vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {}) ).done(function( object, message ) {
                console.log( message ); // It prints "Widget was initialized"
        });

*Note:* The callback function will always return the created object as first parameter.
        
### Removing a previously created object

You can remove any instance by using the "destroy" method like this:

        vRap.Actions.destroy('views.usersGrid');
        
Or remove all the instances created from the same class, like this:

        vRap.Actions.destroyByClass('DemoApp.views.DataGrid');
        
## MVC Application
***

Model, view and controller are three basic components you can use to construct an application, they work as separate units but are able to communicate themselves in order to provide an expected behavior. A view can be aware of the existence of a specific model but it doesn't know about controllers, a model doesn't know about views nor controllers and a controller knows about views an models.

### Defining a model

The model is a client-side representation of a set of records, for example a table in a database. We can operate the data freely before sent it to the persistence. Let's create a new model that holds the data for registered users.

        vRap.Actions.define( 'DemoApp.models.Users', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        init: function() {
                                console.log( this.properties.data ); // Prints the data object attached to this model
                        }
                };
        })(), {} );
        
        vRap.Actions.create( 'DemoApp.models.Users', 'models.users', {
                data: [
                        {
                                'id': '534534',
                                'name': 'John Doe',
                                'nickname': 'johndoe',
                                'email': 'john_doe@maxsdw.com',
                                'age': 34
                        },
                        {
                                'id': '534535',
                                'name': 'Felix Hash',
                                'nickname': 'felixhash',
                                'email': 'felix_hash@maxsdw.com',
                                'age': 28
                        }
                ]
        });
        
You can pass the data directly to the new model using the "data" property as above, but that is not very common, normally you'll need to sync the data with a server using a RESTful API. Inside a regular CRUD persistence schema, we should set an API URL instead of passing hardcoded data to the object. When you perform CRUD actions, vRap automatically makes an AJAX call with a specific HTTP method according to the case:

        vRap.Actions.define( 'DemoApp.models.Users', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/users'
                        },
                        init: function() {
                        }
                };
        })(), {} );
        
        vRap.Actions.create( 'DemoApp.models.Users', 'models.users', {} );
        
Following the same example, in order to fill the model you can now fetch the data from the server using this:

        var usersModel = vRap.Query.getObj('models.users');
        usersModel.getData(); // HTTP Method: GET


In a similar way you can add new records, for instance, if you want to add a new user to the model created above, you can do it like this:

        usersModel.sendRecord({
                'name': 'Alex Tail',
                'nickname': 'alextail',
                'email': 'alex_tail@maxsdw.com',
                'age': 41
        }); // HTTP Method: POST
        
By default the new record is added at end of the array in the client-side data, but you can force it to be included at the beginning, by setting to TRUE "prependRecord" property, like this:

        vRap.Actions.define( 'DemoApp.models.Users', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/users',
                                prependRecord: true
                        },
                        init: function() {
                        }
                };
        })(), {} );
        
The server response must include the created record with an "id" value, then the model data object will be updated using the "id" property as primary key.

Updating an existing record is very similar to adding a new one, except that this time the record object must include the "id" property along with the rest of modified fields, let's say you changed the nickname of one of the users previously created, so the update action should look like this:

        usersModel.sendRecord({
                'id': '534536',
                'nickname': 'alexrules'
        }); // HTTP Method: PUT

And finally, if you want to delete an existing record, this is how you can do it:

        usersModel.deleteRecord('534536'); // HTTP Method: DELETE
        
For these two last cases (update and delete), vRap will use the following URL for the HTTP request:

        api/users/534536

Having the "id" as part of the URL for PUT and DELETE methods is considered a good practice, but if you require to pass the "id" as a parameter inside payload instead of having it in the URL, set the "forceParamId" option as "true" when defining the model:

        vRap.Actions.define( 'DemoApp.models.Users', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/users',
                                forceParamId: true
                        },
                        init: function() {
                        }
                };
        })(), {} );
        
When creating, updating or deleting records, is not necessary to modify directly the model data object; it will be automatically updated when the CRUD method finishes its execution.

If you need to specify a different URL and METHOD per action, vRap includes an option to do that with no effort:

        vRap.Actions.define( 'DemoApp.models.Users', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config:{
                                forceParamId: true,
                                api: {
                                        create: { url: 'api/create_user', method: 'POST' },
                                        read: { url: 'api/get_users', method: 'GET' },
                                        update: { url: 'api/update_user', method: 'POST' },
                                        delete: { url: 'api/delete_user', method: 'POST' }
                                }
                        },
                        init: function() {
                        }
                }
        })(), {} );
        
        var usersModel = vRap.Actions.create( 'DemoApp.models.Users', 'models.users', {} );
        
        usersModel.getData(); // Will perform a GET request to "api/get_users"

CRUD methods are deferred objects, so you can define functions for "success" or "error" events when sending or retrieving data from the server:

        $.when( usersModel.getData() )
                .done(function( data, textStatus, jqXHR ) {
                        ...
                })
                .fail(function( jqXHR, textStatus, errorThrown ) {
                        ...
                })
        
        $.when( usersModel.sendRecord( { 'id': '534536', 'alias': 'alexrules' } ) )
                .done(function( data, textStatus, jqXHR ) {
                        ...
                })
                .fail(function( jqXHR, textStatus, errorThrown ) {
                        ...
                })
                
You can also use models without a CRUD schema; suppose you want to create a model to deal with profile data from current loged user, like this:

        vRap.Actions.define( 'DemoApp.models.ActiveUser', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/active_user'
                        },
                        init: function() {
                        }
                }
        })(), {} );
        
        var activeUser = vRap.Actions.create( 'DemoApp.models.ActiveUser', 'models.activeUser', {} );
        
        activeUser.getData();
        
**getData()** Will perform a GET request to "api/active_user", with the following response object:

        {
                'name': 'Maufracio Santrain',
                'email: 'maufracio@vrap.com',
                'birth_data: '11-25-1984',
                'phone': '5632-3242-1123',
                'location': 'fraciosland'
        }
        
Let's imagine we already have a view connected to this model, with a form that allows the user to modify any of those fields, once the information in the form is updated, the new data must be sent to the server, we have two options in this scenario:

#### Send the complete data object

Send to the server the complete data object, including all modified fields; unlike in CRUD schema, in this case you should first perform all necessary adjustments directly to the model data, like this:

        activeUser.properties.data.email = 'mausantrain@vrap.com';
        activeUser.properties.data.location = 'guayabaland';
        
Then just run **sendData()** method, with no arguments.

        activeUser.sendData();

#### Send modified fields only

Send to the server the fields that were modified by the user and nothing else, in this case please abstain from modifying the model data directly, instead just run this, and vRap will deal with all model data updates:

        activeUser.sendData({
                'email': 'mausantrain@vrap.com';
                'location': 'guayabaland'
        });
        
In both options explained above, the system will perform a POST request to "api/active_user", by default vRap send the data as form data, but you can force the model to send it as a JSON string, by setting to TRUE "sendJSON" parameter:

        vRap.Actions.define( 'DemoApp.models.ActiveUser', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/active_user',
                                sendJSON: true
                        },
                        init: function() {
                        }
                }
        })(), {} );

Finally, in models you are able to setup jQuery.ajax() extra settings, use "ajaxConf" to properly configure your call. "method" setting inside "ajaxConf" will be ignored, if you want to change the default method for "sendData()", please use the property "sendMethod".

        vRap.Actions.define( 'DemoApp.models.ActiveUser', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/active_user',
                                sendMethod: 'POST',
                                ajaxConf: {
                                        dataType: 'xml',
                                        contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
                                }
                        },
                        init: function() {
                        }
                }
        })(), {} );

*Note:* You can perform CRUD and sendData operations with local data as well, in that case any AJAX call will be executed, but the model data will be updated. 

### Defining a view

The view is the visible part of the application, it involves all the user interface components necessary to interact with the data and complete a particular task.

In the last step we created a model for registered users, now if we want to do something with that information, we need to display it in some way, fo example inside a table, maybe we also need to let the user to create new records by clicking a button, for all that we need to create a view:

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        init: function() {
                                console.log( this.linked.model.properties.data ); // Prints the data object from the associated model
                        },
                        refresh: function() {
                        }
                };
        })(), {} );
        
        vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {
                model: 'models.users', // The model must be instantiated before using it in a view
                domEl: $('#usersModule')
        });
        
You can set a DOM element as the view wrapper, so all the event handlers will be attached only to elements inside that specific node, it also works as the reference to start rendering your widget. To define the view wrapper use the "domEl" property as showed above (domEl selector must be different for each view); this property is optional, if you don't specify a "domEl", vRap will automatically create it inside the document body, however, you can specify a different insertion node, using the "insertTo" property, like this:

        vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {
                model: 'models.users', // The model must be instantiated before using it in a view
                insertTo: $('#widgetsWrapper')
        });
        
It also possible to set one or more css clasess to attach to the object's domEl, by using the "style" property like this:

        vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {
                model: 'models.users', // The model must be instantiated before using it in a view
                insertTo: $('#widgetsWrapper'),
                style: 'grid-border'
        });

In order to create an event handler for a specific user interaction, vRap provides a way to do it easily using the "events" property, like this:

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        config: {
                                events: {
                                        'click button#add': 'addRecord'
                                }
                        },
                        init: function( callback ) {
                                ...
                        },
                        addRecord: function( element, methodName, event ) {
                                ...
                        },
                        refresh: function() {
                        }
                };
        })(), {} );

What we are telling to the system here is that every time the user clicks on a button with an id equal to "add", it must run the "addRecord" method.

Also notice that a method named as **"refresh"** (Optional) can be defined inside the view, this method will be fired every time one of the default model actions is triggered in the associated model:

* getData()
* sendData()
* sendRecord()
* deleteRecord()

This is very useful if we want to automatically refresh/update the UI on data changes, but if you are going to implement vRap.js with some other reactive/data-binding library like React or jsObservable, it wont' be neccesary to use our built-in **"refresh"** method, as those libraries already come with a logic to generate the DOM modifications on state changes.

In the next example we'll render a table using the data in the model previously defined. This is how the **"index.html"** file should look like:

        <html>
                <head>
                        <meta charset="utf-8">
                        <title>Grid Demo</title>
                        
                        <script src="js/libs/jquery-2.1.1.min.js"></script>
                        <script src="js/libs/jsviews.min.js"></script>
                        <script src="js/libs/vrap-js-1.0.0.min.js"></script>
                        <script src="js/view.js"></script>
                </head>
                <body>
                        <div id="usersModule">
                                <div id="gridWrapper">
                                        <div class="grid-header>
                                                <div class="header-name">>Name</div>
                                                <div class="header-alias">Alias</div>
                                                <div class="header-email">E-mail</div>
                                                <div class="header-age">Age</div>
                                        </div>
                                        <div class="grid-body"></div>
                                </div>
                                <div id="formWrapper">
                                        <form>
                                                <label>Name:<input type="text" name="name" required /></label><br>
                                                <label>Alias:<input type="text" name="alias" required /></label><br>
                                                <label>E-mail:<input type="text" name="email" required /></label><br>
                                                <label>Age:<input type="text" name="age" required /></label>
                                        </form>
                                </div>
                                <div id="buttonsWrapper">
                                        <button id="add">Add New User</button>
                                </div>
                        </div>
                        
                        <script id="gridBodyTmpl" type="text/x-jsrender">
                                {{for users}}
                                        <div class="grid-row">
                                                {{props #data}}
                                                      <div class="cell-{{:key}}">{{:prop}}</div>
                                                {{/props}}
                                        </div>
                                {{/for}}
                        </script>
                </body>
        <html>

Now, we have to define our view inside **"view.js"** file:

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        config: {
                                events: {
                                        'click button#add': 'addRecord'
                                }
                        },
                        init: function() {
                                this.gridBody = this.properties.domEl.find('.grid-body');
                                this.renderBody();
                        },
                        renderBody: function() {
                                var self = this,
                                    template;
                                    
                                template = $.templates("#gridBodyTmpl");
                                    
                                self.gridBody.empty();
                                self.gridBody.html( template.render( { users: self.linked.model.properties.data } ) );
                        },
                        addRecord: function( element ) {
                                this.form = this.properties.domEl.find('form');
                        },
                        refresh: function() {
                                this.renderBody();
                        }
                };
        })(), {} );
        
        $( document ).ready(function() {
                vRap.Actions.create( 'DemoApp.views.DataGrid', 'views.usersGrid', {
                        model: 'models.users',
                        domEl: $('#usersModule')
                });
        });

Notice that inside **"refresh"** method we set an instruction to run "renderBody()", in this way we ensure that every time the model is modified, the table is updated with the new data. You can apply any data-binding technique you consider appropiate, like "JsObservable".

In the previous example we used jsRender templating library, but feel free to use any JS template engine you prefer. If you are defining templates in separeted HTML files, you can load HTML content from a especific .html file easily to the view by passing the file URL inside the "template" configuration property, then you can access the template within the object by running "properties.template":

        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        config: {
                                template: 'views/datagrid/tmpl.GridBody.html',
                                events: {
                                        'click button#add': 'addRecord'
                                }
                        },
                        init: function() {
                                this.renderBody();
                        },
                        renderBody: function() {
                                var self = this,
                                    template;
                                    
                                template = $.templates( self.properties.template );
                                    
                                self.gridBody.empty();
                                self.gridBody.html( template.render( { users: self.linked.model.properties.data } ) );
                        },
                        addRecord: function( element ) {
                                this.form = this.properties.domEl.find('form');
                        },
                        refresh: function() {
                                this.renderBody();
                        }
                };
        })(), {} );


*Note:* Up to this point, nothing happens when clicking the button to create new users, in the next step you will learn how to add a new record to the model using a controller.

### Defining a controller

The controller is a logical component that works as bridge between views and models, it holds a set of behaviors that interact with the data, which respond to events triggered inside a view.

Notice that controllers must not include any DOM manipulation instructions, like adding, removing or modifying visual elements, these belong only to the view; a controller may consist on behaviors to validate, transform and operate data, it also can emit events set inside an interface in order to perform specific interactions with other modules.

This is how you can define a controller:

        vRap.Actions.define( 'DemoApp.controllers.Users', (function() {
                return {
                        extend: 'Base.primitives.Controller',
                        config: {
                                models: {
                                        <class namespace>: <properties>
                                },
                                views: {
                                        <class namespace>: <properties>
                                },
                                listeners: {
                                        <event name>: <method name>
                                }
                        },
                        init: function() {
                        }
                };
        })(), {} );

When defining a controller, you need to set which models and views will be associated to it, right after the controller is instantiated but before it starts, it will automatically create instances for the declared classes in the order specified by you inside the properties "models" and "views" ( Those classes must be defined separately ). The join of one or more views and models to a controller represents a module; following the high cohesion principle, you should associate views and models that are strongly related, they all must have the same purpose, in that order, a module holds the code for a single widget or functionality.

All models and views associated to a controller must be assigned with an alias:

        models: {
                'DemoApp.models.Users': {
                        namespace: 'models.users',
                        alias: 'usersModel'
                }
        },
        
Inside controllers you can interact with associated models and views directly, using this:

        this.linked.model.<model alias>
        this.linked.view.<view alias>
        
If you are going to link a view or a model that have been previously instantiated, yo can reference them inside an array by using the object namespace, like this:

        config: {
                models: [ 'models.users' ],
                views: [ 'views.usersGrid' ],
                listeners: {
                        <event name>: <method name>
                }
        },
        
Inside views or models, avoid adding direct references to the controller, for instance, if a specific event in a view needs to start a method in the controller, the view should emit a generic event instead of calling the controller method directly. Inside the view, you can emit an event like this:

        this.emit('addBtnClicked');
        
Then in the controller you must set a listener for that specific event, providing the method that should be started:

        listeners: {
                'addBtnClicked': 'saveUser'
        },

To start using the controller, you must create an instance of it, all controllers must be provided with an alias:

        vRap.Actions.create( 'DemoApp.controllers.UsersController', 'controllers.users', { alias: 'usersController' } );
        
In the next example we'll create a module for the users administration grid:

        // Declaring Classes
        
        vRap.Actions.define( 'DemoApp.controllers.UsersController', (function() {
                return {
                        extend: 'Base.primitives.Controller',
                        config: {
                                models: {
                                        'DemoApp.models.Users': {
                                                namespace: 'models.users',
                                                alias: 'usersModel'
                                        }
                                },
                                views: {
                                        'DemoApp.views.DataGrid': {
                                                namespace: 'views.usersGrid',
                                                alias: 'usersGrid',
                                                model: 'models.users',
                                                domEl: $('#usersModule')
                                        }
                                },
                                listeners: {
                                        'addBtnClicked': 'saveUser'
                                }
                        },
                        init: function() {
                                var deferred = new $.Deferred();
                                
                                return deferred.resolve( this.linked.view.usersGrid.properties.gridBody );
                        },
                        saveUser: function() {
                                var form, 
                                    formData = {};
                                    
                                form = this.linked.view.usersGrid.properties.form;
                                form.serializeArray().map(function( item ) {
                                        formData[ item.name ] = item.value;
                                });
                                
                                if ( formData.age > 18 ) {
                                        $.when( this.linked.model.usersModel.sendRecord( formData ) )
                                                .done(function( data, textStatus, jqXHR ) {
                                                        form.reset();
                                                })
                                                .fail(function( jqXHR, textStatus, errorThrown ) {
                                                        vRap.Msg.alert( textStatus, errorThrown );
                                                });
                                } else {
                                        vRap.Msg.alert( 'Validation Message', 'Sorry, you are under legal age to procede' );
                                }
                        }
                };
        })(), {} );
        
        vRap.Actions.define( 'DemoApp.models.Users', (function() {
                return {
                        extend: 'Base.primitives.Model',
                        config: {
                                url: 'api/users'
                        },
                        init: function() {
                                this.getData(); // Fetch the data from the persistence once the model is instantiated
                        }
                };
        })(), {} );
        
        vRap.Actions.define( 'DemoApp.views.DataGrid', (function() {
                return {
                        extend: 'Base.primitives.View',
                        config: {
                                events: {
                                        'click button#add': 'addRecord'
                                }
                        },
                        init: function() {
                                this.properties.gridBody = this.properties.domEl.find('.grid-body');
                                this.renderBody();
                        },
                        renderBody: function() {
                                var self = this,
                                    template;
                                    
                                template = $.templates("#gridBodyTmpl");
                                    
                                self.properties.gridBody.empty();
                                self.properties.gridBody.html( template.render( { users: self.linked.model.properties.data } ) );
                        },
                        addRecord: function( element ) {
                                this.properties.form = this.properties.domEl.find('form');
                                this.emit('addBtnClicked');
                        },
                        refresh: function() {
                                this.renderBody();
                        }
                };
        })(), {} );
        
        // Module initialization
        
        $( document ).ready(function() {
                $.when( vRap.Actions.create( 'DemoApp.controllers.UsersController', 'controllers.users', { alias: 'usersController' } ) )
                        .done(function( object, gridBody ) {
                                gridBody.find('button#add').trigger('click');
                        });
        });

### Defining an interface

In order to preserve loose coupling and single responsibility, inside a specific module, avoid adding direct references to objects from a different one, instead you can define a class that work as interface, an interface in vRap.js is in some way similar to a controller, the difference is that the controllers works as bridge between models and views attached to it (single module), and the interface in the other hand can communicate separeted modules.

In vRap.js you can orchestrate components by using interfaces, let's say we need that when a user clicks on a button defined inside the view of a module "A", it triggers an action to initialize module "B, what we should do is subscribing an observer to the controller in the module "A", all subscription logic should be set in the interface, when the subscribed event is published, the observer will run the required action.

You can access any controller inside an interface, like this:

        this.controller.<controller alias>
        
Here is an example of interfaces usage:

        // Declaring Classes for Module A
        
        vRap.Actions.define( 'DemoApp.views.Menu', (function() {
                return {
                        extend: 'Base.primitives.View',
                        config: {
                                events: {
                                        'click button#showList': 'onShowList',
                                        'click button#hideList': 'onHideList'
                                }
                        },
                        init: function() {
                                ...
                        },
                        onShowList: function( element ) {
                                this.emit('showListBtnClicked'); // Emits a generic event
                        },
                        onHideList: function( element ) {
                                this.emit('hideListBtnClicked'); // Emits a generic event
                        },
                        refresh: function() {
                                ...
                        }
                };
        })(), {} );
        
        vRap.Actions.define( 'DemoApp.controllers.ModuleA', (function() {
                return {
                        extend: 'Base.primitives.Controller',
                        config: {
                                views: {
                                        'DemoApp.views.Menu': {
                                                namespace: 'views.appMenu',
                                                alias: 'appMenu',
                                                domEl: $('#menuWrapper')
                                        }
                                },
                                listeners: {
                                        'showListBtnClicked': 'showList',
                                        'hideListBtnClicked': 'hideList'
                                },
                        },
                        init: function() {
                                var deferred = new $.Deferred();
                                
                                deferred.resolve();
                        },
                        showList: function() {
                                this.publish('initList') // Publishes the event "initElement", all the subscribers will be notified
                        },
                        hideList: function() {
                                this.publish('hideElement') // Publishes the event "hideElement", all the subscribers will be notified
                        }
                };
        })(), {} );
        
        // Declaring Classes for Module B
        
        vRap.Actions.define( 'DemoApp.views.DataList', (function() {
                return {
                        extend: 'Base.primitives.View',
                        init: function() {
                                this.properties.domEl.html('<h1>The list was created!</h1>');
                        },
                        hide: function() {
                                this.properties.domEl.addClass('hidden');
                        },
                        refresh: function() {
                                ...
                        }
                };
        })(), {} );
        
        vRap.Actions.define( 'DemoApp.controllers.ModuleB', (function() {
                return {
                        extend: 'Base.primitives.Controller',
                        config: {
                                views: {
                                        'DemoApp.views.DataList': {
                                                namespace: 'views.usersList',
                                                alias: 'usersList',
                                                domEl: $('#listWrapper')
                                        }
                                }
                        },
                        init: function() {
                        },
                        onHideList: function() {
                                this.view.usersList.hide();
                        }
                };
        })(), {} );
        
        // Defining the interface
        
        vRap.Actions.define( 'DemoApp.interfaces.MainInterface', (function() {
                return {
                        extend: 'Base.primitives.Interface',
                        init: function() {
                                var self = this,
                                    deferred = new $.Deferred(),
                                    moduleA = this.controller.moduleA;
                                
                                // Subscriptions
                                
                                moduleA.subscribe(function( eventName ) {
                                        if ( eventName === 'initElement' ) {
                                                self.initList();
                                        } else if ( eventName === 'hideElement' ) {
                                                self.hideList();
                                        }
                                });
                                
                                deferred.resolve();
                        },
                        initList: function() {
                              vRap.Actions.create( 'DemoApp.controllers.ModuleB', 'controllers.moduleB', { alias: moduleB } );
                        },
                        hideList: function() {
                              this.controller.moduleB.onHideList();
                        }
                };
        })(), {} );
        
        // Running the Application
        
        $( document ).ready(function() {
                $.when( vRap.Actions.create( 'DemoApp.controllers.ModuleA', 'controllers.moduleA', { alias: 'moduleA' } ) ).done(function() {
                        $.when( vRap.Actions.create( 'DemoApp.interfaces.MainInterface', 'interfaces.mainInterface', {} ) ).done(function() {
                                $('button#showList').trigger('click');
                        });
                });
        });
        
### Instantiating various modules

Normally an application will be composed by several modules, some times you will need to instantiate many of those modules consecutively in a same action. Instead of creating the instances one by one, you can just pass a configuration object with this structure as an argument:

        $.when( vRap.Actions.create({
                instances: [
                        { class: 'DemoApp.controllers.ModuleA', namespace: 'controllers.moduleA', properties: { alias: 'moduleA' } },
                        { class: 'DemoApp.controllers.ModuleB', namespace: 'controllers.moduleB', properties: { alias: 'moduleB' } },
                        { class: 'DemoApp.controllers.ModuleC', namespace: 'controllers.moduleC', properties: { alias: 'moduleC' } }
                ],
                interfaces: [
                        { class: 'DemoApp.interfaces.MainInterface', namespace: 'interfaces.mainInterface' }
                ]
        }) ).done(function() {
                $('button#showList').trigger('click');
        });

By default, the instantiation process is synchronous, so the instances will be created in the order specified by you inside the configuration object, after all the instances have been created, the interfaces will be instantiated, and at the end of the whole process, the callback function is fired. If you want to instantiate the modules asynchronous, you need to add *"async: true"* property.

## Native Methods
***

### Actions

Method | Description | Usage
------------ | ------------- | -------------
newApp | Create a new application instance and set it as the active app | vRap.Actions.newApp( \<properties\> )
switchApp | Change the active app | vRap.Actions.switchApp( \<app name\> )
define | Define/Declare a new class | vRap.Actions.define( \<namespace\>, \<properties\>, \<statics\> );
create | Create a new instance from a specific class | vRap.Actions.create( \<class namespace\>, \<object alias\>, \<properties\> ) or vRap.Actions.create( \<multi-modules object\> )
destroy | Destroy a previosly created instance | vRap.Actions.destroy( \<object alias\> )
destroyByClass | Destroy all instances from a particular class | vRap.Actions.destroyByClass( \<class namespace\> )

### Query

Method | Description | Usage
------------ | ------------- | -------------
getApp | Returns an application instance previously generated with newApp() | vRap.Query.getApp( \<app name\> )
getClass | Returns a specific class by its namespace | vRap.Query.getClass( \<namespace\> )
getObj | Returns a specific object instance by its alias | vRap.Query.getObj( \<alias\> )
getObjsByClass | Returns all the objects instantiated from a particular class | vRap.Query.getObjsByClass( \<class name\> )
getEvents | Returns the events associated to a specific HTML element | vRap.Query.getEvents( \<HTML Element\> )

### All vRap Objects

Method | Description | Usage
------------ | ------------- | -------------
init | The method that runs just after the instance is created | init()
subscribe | Subscribe an observer to the instance | subscribe( \<event\>, \<observer\> )
unsubscribe | Unsubscribe an observer from the instance | unsubscribe( \<event\> )
publish | Trigger a specific event previously subscribed | publish( \<event\>, \<arguments\> )

### Model

Method | Description | Usage
------------ | ------------- | -------------
sendData | Send data to the server | sendData( \<data object\> )
getData | Fetch the data | getData( \<callback object\> )
sendRecord | Send a record | sendRecord( \<data object\>, \<callback object\> )
deleteRecord | Delete a record | deleteRecord( \<record id\>, \<callback object\> )

### View

Method | Description | Usage
------------ | ------------- | -------------
refresh | The method that runs everytime the associated model changes | refresh()
emit | Emits a specific event to be listened by a controller | refresh()

### Generators

Method | Description | Usage
------------ | ------------- | -------------
genIdNumber | Returns a consecutive number to be used as unique ID | vRap.Generators.genIdNumber()

### Others

Method | Description | Usage
------------ | ------------- | -------------
alert | Displays an alert dialog | vRap.Msg.alert( \<title\>, \<message\> )

## Native Properties
***

### Classes and Objects

Property | Description | Type
------------ | ------------- | -------------
extend | Set from which class to extend | String
alias | Set a name to the object to identify it at some circumstances | String

### Model

Property | Description | Type
------------ | ------------- | -------------
data | Insert data directly to the object | Object
config.url | Specify a URL to use when performing data synchronization | String
config.forceParamId | Include the record ID inside data payload when sending it to the server | Boolean
config.sendJSON | Force data to be sent as a JSON string | Boolean
config.ajaxConf | Receives an object with jQuer.ajax() extra settings | Object
config.api | Specify a diferent URL for each one of the synchronization methods (create, read, update, delete) | Object
config.prependRecord | Force the new record to be included at the beginning of the array inside client-side data | Boolean

### View

Property | Description | Type
------------ | ------------- | -------------
domEl | Specify the DOM element that wraps the view | jQuery Object
insertTo | Specify the DOM element where to insert the view wrapper when domEl wasn't defined | jQuery Object
model | Set the model associated to the view using its alias | String
style | Set one or more css clasess to attach to the object's domEl | String
config.events | Configure event handlers for specific interactions | Object

### Controller

Property | Description | Type
------------ | ------------- | -------------
config.models | List the models to automatically instantiate before starting the controller | Object
config.views | List the views to automatically instantiate before starting the controller | Object
config.listeners | List all the events that the controller must listen from the associated views | Object
