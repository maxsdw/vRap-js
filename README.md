vRap-js
=======

## Basic Usage
***

vRap.js is an object oriented Front-End framework to easily construct Rich Internet Apps with JavaScript. Using a MVC architecture approach, vRap-js provides a convenient way to give structure to your projects, it exposes an API that let you manage client-side data and synchronize that data with a persistence model, as well as create, extend and manage classes and objects with a bit of effort.

### Attach the vrap-js.min.js file to the project HTML

        <script src="js/vrap-js-1.0.0.min.js"></script>

### Create an application instance

The first step to start using vRap.js is creating an instance of your application, this will define a unique namespace, where all the classes, objects, models, controllers and views for this particular app will be stored.

In order to create a new app instance we must call the method **newApp()**, passing a configuration object as argument:

        vRap.Actions.newApp({
            appName: <app name>
        });

This will generate a namespace for the new application, to retrieve it use this:

        vRap.Apps.<app name>;

### Define a new class

Once the application enviroment has been created, you can start defining your clasess like this:

        vRap.Actions.define(<namespace>, <properties>);

There are three vRap.js primitive classes:

        Base.primitives.Model
        Base.primitives.View
        Base.primitives.Controller

They all extend from one base class:

        Base.primitives.Foundation 
        
Any new class you create should extend from one of the three primitive classes, according to its purpose; for example if you are building a class that renders a data grid in the viewport, the class should extend from the "View" primitive class, so let's define a class using the name "DataGrid":

        vRap.Actions.newApp({
            appName: 'DemoApp'
        });
        
        vRap.Actions.define('DemoApp.views.DataGrid', {
        	extend: 'Base.primitives.View'
        });
        
Notice the convention used to define the namespace for our classes:

        <app name>.<category>.<class name> // For the class name always use UpperCamelCase
        
When defining a class you can set private, public and static attributes; let's take the same example above, but now setting some attributes:

        vRap.Actions.define('DemoApp.views.DataGrid', {
        	extend: 'Base.primitives.View',
        	privateProperties: {
        	        propertyOne: 'This is private'
        	},
        	privateMethods: {
        	        methodOne: function() {
        	                return 'This is private';
        	        }
        	},
        	publicProperties: {
        	        propertyTwo: 'This is public'
        	},
        	publicMethods: {
        	        methodTwo: function() {
        	                return 'This is public';
        	        }
        	},
        	staticProperties: {
        	        propertyThree: 'This is static'
        	},
        	staticMethods: {
        	        methodThree: function() {
        	                return 'This is static';
        	        }
        	}
        });
        
It is a requirement that all new classes include a "init()" method, it will run automatically each time a new object is instantiated:

        vRap.Actions.define('DemoApp.views.DataGrid', {
        	extend: 'Base.primitives.View',
        	publicMethods: {
        	        init: function() {
        	                ...
        	        }
        	}
        });
        
        
### GET and SET public properties
        
You are able to get or set public properties inside public and private methods by simple using a reference to the object scope:

        vRap.Actions.define('DemoApp.views.DataGrid', {
        	extend: 'Base.primitives.View',
        	publicProperties: {
        	        propertyTwo: 'This is public'
        	},
        	publicMethods: {
        	        methodTwo: function() {
        	                return this.propertyTwo;
        	        }
        	}
        });
        
### GET and SET private properties from private methods
        
In order to get or set private properties inside private methods, you can use the "privateProperties" parameter:

        vRap.Actions.define('DemoApp.views.DataGrid', {
        	extend: 'Base.primitives.View',
        	privateProperties: {
        	        propertyOne: 'This is private'
        	},
        	privateMethods: {
        	        methodOne: function( privateProperties ) {
        	                return privateProperties.propertyOne;
        	        }
        	}
        });
        
### GET and SET private properties from public methods

Private properties can't be accessed directly from our public methods, for that you need to use special getters and setters like this:

        vRap.Actions.define('DemoApp.views.DataGrid', {
        	extend: 'Base.primitives.View',
        	privateProperties: {
        	        propertyOne: 'This is private'
        	},
        	publicMethods: {
        	        methodTwo: function() {
        	                currentValue = this.propGet('propertyOne');
        	                newValue = this.propSet('propertyOne', 'Property new value');
        	                return currentValue + ' was changed to ' +  newValue;
        	        }
        	}
        });

### Run private methods

If you want to run private methods, use the "runMethod()" function:

        this.runMethod(<method name>, <argument 1>, <argument 2>, ...);

Let's see it in context:

        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                privateMethods: {
                        methodOne: function( privateProperties, source ) {
                                return 'This was ran by a ' + source + ' method'; // This was ran by a public method
                        }
                },
                publicMethods: {
                        methodTwo: function() {
                                this.runMethod( 'methodOne', 'public' );
                        }
                }
        });

### Instantiate a new object

Once you defined a class it's time to start using it, for that you must instantiate a new object, you can create as many object as you wish from the same class:

        vRap.Actions.create(<class namespace>, <object alias>, <properties>, <callback>); // For the object alias always use lowerCamelCase
        
Let's continue where we left:

        vRap.Actions.create( 'DemoApp.views.DataGrid', 'demoGrid', {
                objProperty: 'This property belongs only to this object',
                propertyTwo: 'This is overwriting the initial value of the property'
        });
        
As soon as the new object is created, the "init()" function is fired automatically. Now you will be able to run any public method previously defined, like this:

        vRap.Query.getObj('demoGrid').methodTwo();

Private properties or methods should not be called or modified from outside the object, but you can  force that behaviour by using the special getters and setters explained above:

        var demoGrid = vRap.Query.getObj('demoGrid');
        demoGrid.propGet('propertyOne');
        demoGrid.propSet( 'propertyOne', 'Property new value' );
        demoGrid.runMethod( 'methodOne', 'public' );

### Adding a callback function

If you define a callback function when creating a new object, that function will be passed as a parameter inside the init() method, you can also get the callback function using "this.getCallback()".

        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                publicMethods: {
                        init: function( callback ) {
                                if ( callback ) {
                                        callback();
                                }
                        }
                }
        });
        
        vRap.Actions.create( 'DemoApp.views.DataGrid', 'demoGrid', { }, function() {
                console.log('Callback function was executed');
        });
        
### Removing a previously created object

You can remove any instance by using the "destroy" method like this:

        vRap.Actions.destroy('demoGrid');
        
Or remove all the instances created from the same class, like this:

        vRap.Actions.destroyByClass('DemoApp.views.DataGrid');
        
## MVC Application
***

Model, view and controller are three basic components you can use to construct an application, working as separate units, they don't need to know each other, but they are able to communicate themselves in order to provide an expected behavior.

### Defining a model

The model is a client-side representation of a set of records, for example a table in a database. We can operate the data freely before sent it to the persistence. Let's create a new model that holds the data for registered users.

        vRap.Actions.define('DemoApp.models.Users', {
                extend: 'Base.primitives.Model',
                publicMethods: {
                        init: function( callback ) {
                                console.log(this.data); // Prints the data object attached to this model
                        }
                }
        });
        
        vRap.Actions.create( 'DemoApp.models.Users', 'usersModel', {
                data: [
                        {
                                'id': '534534',
                                'name': 'John Doe',
                                'alias': 'johndoe',
                                'email': 'john_doe@maxsdw.com',
                                'age': 34
                        },
                        {
                                'id': '534535',
                                'name': 'Felix Hash',
                                'alias': 'felixhash',
                                'email': 'felix_hash@maxsdw.com',
                                'age': 28
                        }
                ]
        });
        
You can pass the data directly to the new model using the "data" property as above, but that is not very common, normally you'll need to sync the data with a server using a RESTful API. Inside a regular CRUD persistence schema, we should set an API URL instead of passing hardcoded data to the object. When you perform CRUD actions, vRap automatically makes an AJAX call with a specific HTTP method according to the case:

        vRap.Actions.define('DemoApp.models.Users', {
                extend: 'Base.primitives.Model',
                url: 'api/users',
                publicMethods: {
                        init: function() {
                        }
                }
        });
        
        vRap.Actions.create( 'DemoApp.models.Users', 'usersModel', { } );
        
        
        
Following the same example, in order to fill the model you can now fetch the data from the server using this:

        var usersModel = vRap.Query.getObj('usersModel');
        usersModel.getData(); // HTTP Method: GET


In a similar way you can add new records, for instance, if you want to add a new user to the model created above, you can do it like this:

        usersModel.sendRecord({
                'name': 'Alex Tail',
                'alias': 'alextail',
                'email': 'alex_tail@maxsdw.com',
                'age': 41
        }); // HTTP Method: POST
        
The server response must include the created record with an "id" value, then the model data object will be updated using the "id" property as primary key.

Updating an existing record is very similar to adding a new one, except that this time the record object must include the "id" property along with the rest of modified fields, let's say you changed the user name of one of the users previously created, so the update action should look like this:

        usersModel.sendRecord({
                'id': '534536',
                'alias': 'alexrules'
        }); // HTTP Method: PUT

And finally, if you want to delete an existing record, this is how you can do it:

        usersModel.deleteRecord('534536'); // HTTP Method: DELETE
        
For these two last cases (update and delete), vRap will use the following URL for the HTTP request:

        api/users/534536

Having the "id" as part of the URL for PUT and DELETE methods is considered a good practice, but if you require to pass the "id" as a parameter inside payload instead of having it in the URL, set the "forceParamId" option as "true" when defining the model:

        vRap.Actions.define('DemoApp.models.Users', {
                extend: 'Base.primitives.Model',
                url: 'api/users',
                forceParamId: true,
                publicMethods: {
                        init: function() {
                        }
                }
        });

If you need to specify a different URL per action, vRap includes an option to do that with a bit of effort:

        vRap.Actions.define('DemoApp.models.Users', {
                extend: 'Base.primitives.Model',
                api: {
                        create: 'api/create_user',
                        read: 'api/get_users',
                        update: 'api/update_user',
                        delete: 'api/delete_user'
                },
                publicMethods: {
                        init: function() {
                        }
                }
        });
        
        var usersModel = vRap.Actions.create( 'DemoApp.models.Users', 'usersModel', { } );
        
        usersModel.getData(); // Will perform a GET request to "api/get_users"

You can also define functions for "success" or "error" events when sending or retrieving data from the server:

        usersModel.getData({
                success: function( response ) {
                        console.log( response );
                },
                error: function( response ) {
                        console.log( response );
                }
        });
        
        usersModel.sendRecord({
                'id': '534536',
                'alias': 'alexrules'
        }, {
                success: function( response ) {
                        console.log( response );
                },
                error: function( response ) {
                        console.log( response );
                }
        });

        
### Defining a view

The view is the visible part of the application, it involves all the user interface components necessary to interact with the data and complete a particular task.

In the last step we created a model for registered users, so now, if we want to do something with that information, we need to display it in some way, fo example inside a table, maybe we also need to let the user to create new records by clicking a button, for all that we need to create a view:

        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                domEl: $('#usersModule'),
                publicMethods: {
                        init: function( callback ) {
                                console.log( this.model.data ); // Prints the data object from the associated model
                        },
                        refresh: function() {
                        }
                }
        });
        
        vRap.Actions.create( 'DemoApp.views.DataGrid', 'dataGrid', {
                model: 'usersModel' // The model must be instantiated before using it in a view
        });
        
You should set a DOM element as the view wrapper, so all the event handlers will be attached only to elements inside that specific node, it also works as the reference to start rendering your widget. To define the view wrapper use the "domEl" property as showed above; if nothing is defined, this property will be set to "$('body')" by default.

In order to create an event handler for a specific user interaction, vRap provides a way to do it easily using the "events" property, like this:

        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                domEl: $('#usersModule'),
                events: {
                        'click button#createUser': 'addUser'
                },
                publicMethods: {
                        init: function( callback ) {
                                ...
                        },
                        addUser: function( event ) {
                                ...
                        },
                        refresh: function() {
                        }
                }
        });

What we are telling to the system here is that every time the user clicks on a button with an id equal to "createUser", it must run the "addUser" method.

Also notice that a method named as **"refresh"** must be defined whenever you create a view, this method will be fired every time the associated model is modified. This is very useful if we want to automatically refresh the view on data changes (data-binding).

In the next example we'll render a table using the data in the model previously defined. This is how the **"index.html"** file should look like:

        <html>
                <head>
                        <meta charset="utf-8">
                        <title>Grid Demo</title>
                        
                        <script src="js/libs/jquery-2.1.1.min.js"></script>
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
                                        <button id="createUser">Add New User</button>
                                </div>
                        </div>
                        
                        <script id="rowTemplate" type="text/template">
                                <div class="grid-row">
                                        <div class="row-name">${name}</div>
                                        <div class="row-alias">${alias}</div>
                                        <div class="row-email">${email}</div>
                                        <div class="row-age">${age}</div>
                                </div>
                        </script>
                </body>
        <html>

Now, we have to define our view inside **"view.js"** file:

        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                domEl: $('#usersModule'),
                events: {
                        'click button#createUser': 'addUser'
                },
                publicMethods: {
                        init: function( callback ) {
                                this.gridBody = this.domEl.find('.grid-body');
                                this.renderBody();
                        },
                        renderBody: function() {
                                var self = this;
                                self.gridBody.empty();
                                $.each( self.model.data, function( index, item ) {
                                        var row = vRap.template( '#rowTemplate', item );
                                        self.gridBody.append( row );
                                });
                        },
                        addUser: function( event ) {
                                this.form = this.domEl.find('form');
                        },
                        refresh: function() {
                                this.renderBody();
                        }
                }
        });
        
        $( document ).ready(function() {
                vRap.Actions.create( 'DemoApp.views.DataGrid', 'dataGrid', {
                        model: 'usersModel'
                });
        });

Notice that inside **"refresh"** method we set an instruction to run "renderBody()", in this way we ensure that every time the model is modified, the table is updated with the new data.

In the previous example we used the vRap templating feature, but feel free to use any JS template plugin you prefer. vRap templates work like this:

        vRap.template( <script id>, <data object> );
        
Up to this point, nothing happens when clicking the button to create new users, in the next step you will learn how to add a new record to the model using a controller.

### Defining a controller

Views and models exist as separate units, but they must to be able to communicate with each other some how. The controller is a logical component that works as bridge between views and models, it holds a set of behaviors that interact with the data, which respond to events triggered inside a view.

Notice that controllers must not include any DOM manipulation instructions, like adding, removing or modifying visual elements, these belong only to the view; a controller may consist on behaviors to retrieve, validate, transform, operate and synchronize data, it also can contains instructions to instantiate new views, models or controllers from particular events.

This is how you can define a controller:

        vRap.Actions.define('DemoApp.controllers.Users', {
                extend: 'Base.primitives.Controller',
                publicMethods: {
                        init: function( callback ) {
                        }
                }
        });

We must link the controller to the view using the "controllers" property, like this:

        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                domEl: $('#usersModule'),
                controllers: {
                        'userController' // Object alias
                },
                publicMethods: {
                        init: function( callback ) {
                        },
                        refresh: function() {
                        }
                }
        });
        
Before start using the controller, you need to create an instance of it, but first ensure that all the associated models and views were previously instantiated, then procede:
        
        vRap.Actions.create( 'DemoApp.controllers.UsersController', 'userController', { } );

Inside the view, you can call any method of the controller:

        this.controller.<controller alias>.<method>;
        
Also inside controllers you can get associated models and views directly, using this:

        this.model.<model alias>
        this.view.<view alias>
        
Let's see and example of the controller in context:

        // Declaring Classes

        vRap.Actions.define('DemoApp.controllers.UsersController', {
                extend: 'Base.primitives.Controller',
                models: {
                        'DemoApp.models.Users': {
                                alias: 'usersModel'
                        }
                },
                views: {
                        'DemoApp.views.DataGrid': {
                                alias: 'dataGrid',
                                model: 'usersModel'
                        }
                },
                publicMethods: {
                        init: function( callback ) {
                                if ( callback ) {
                                        callback();
                                }
                        },
                        saveUser: function() {
                                var form, 
                                    formData = {};
                                form = this.view.dataGrid.form;
                                form.serializeArray().map(function( item ) {
                                        formData[ item.name ] = item.value;
                                });
                                if ( formData.age > 18 ) {
                                        this.model.usersModel.sendRecord( formData, {
                                                success: function( response ) {
                                                        form.reset();
                                                },
                                                error: function( response ) {
                                                        vRap.Msg.alert( 'Error', response );
                                                }
                                        });
                                } else {
                                        vRap.Msg.alert( 'Validation Message', 'Sorry, you are under legal age to procede' );
                                }
                        }
                }
        });
        
        vRap.Actions.define('DemoApp.models.Users', {
                extend: 'Base.primitives.Model',
                url: 'api/users',
                publicMethods: {
                        init: function() {
                                this.getData(); // Fetch the data from the persistence once the model is instantiated
                        }
                }
        });
        
        vRap.Actions.define('DemoApp.views.DataGrid', {
                extend: 'Base.primitives.View',
                domEl: $('#usersModule'),
                controllers: {
                        'userController'
                },
                events: {
                        'click button#createUser': 'addUser'
                },
                publicMethods: {
                        init: function() {
                                this.gridBody = this.domEl.find('.grid-body');
                                this.renderBody();
                        },
                        renderBody: function() {
                                var self = this;
                                self.gridBody.empty();
                                $.each( self.model.data, function( index, item ) {
                                        var row = vRap.template( '#rowTemplate', item );
                                        self.gridBody.append( row );
                                });
                        },
                        addUser: function( event ) {
                                this.form = this.domEl.find('form');
                                this.controller.userController.saveUser();
                        },
                        refresh: function() {
                                this.renderBody();
                        }
                }
        });
        
        // Controller initialization
        
        $( document ).ready(function() {
                vRap.Actions.create( 'DemoApp.controllers.UsersController', 'userController', { }, function() {
                        $('button#createUser').trigger('click');
                });
        });
        
As you saw in the previous example, when using controllers, it is not necessary to manually instantiate models and views one by one before starting the controller, instead you can just tell which models and views need to be created, and right after the controller is instantiated but before it starts, it will automatically create instances for the declared classes in the order specified by you inside the properties "models" and "views", the correct syntax to use this feature is this:

        models: {
                <class namespace>: <properties object>
        },
        views: {
                <class namespace>: <properties object>
        }
        
## Native Methods
***

### Actions

Method | Description | Usage
------------ | ------------- | -------------
newApp | Create a new application instance and set it as the active app | vRap.Actions.newApp( \<properties\> )
switchApp | Change the active app | vRap.Actions.switchApp( \<app name\> )
define | Define/Declare a new class | vRap.Actions.define( \<namespace\>, \<properties\> );
create | Create a new instance from a specific class | vRap.Actions.create( \<class namespace\>, \<object alias\>, \<properties\>, \<callback\> )
destroy | Destroy a previosly created instance | vRap.Actions.destroy( \<object alias\>, \<callback\> )
destroyByClass | Destroy all instances from a particular class | vRap.Actions.destroyByClass( \<class namespace\>, \<callback\> )
setXPathFromNode | creates a XPath expression from a DOM node | vRap.Query.setXPathFromNode( \DOM node\>, \<root node\> )

### Query

Method | Description | Usage
------------ | ------------- | -------------
getApp | Returns an application instance previously generated with newApp() | vRap.Query.getApp( \<app name\> )
getClass | Returns a specific class by its namespace | vRap.Query.getClass( \<namespace\> )
getObj | Returns a specific object instance by its alias | vRap.Query.getObj( \<alias\> )
getObjsByClass | Returns all the objects instantiated from a particular class | vRap.Query.getObjsByClass( \<class name\> )
getEvents | Returns the events associated to a specific HTML element | vRap.Query.getEvents( \<HTML Element\> )
getNodeFromXPath | Returns a DOM node from a XPath expression | vRap.Query.getNodeFromXPath( \<XPath\>, \<root node\> )

### Object instances

Method | Description | Usage
------------ | ------------- | -------------
propGet | Get the value of a private property | propGet( \<property name\> )
propSet | Change the value of a private property | propSet( \<property name\>, \<new value\> )
runMethod | Run a private method | runMethod( \<method name\> )
getCallback | Get the callback function if there is one | getCallback()
init | The method that runs just after the instance is created | init()

### Model

Method | Description | Usage
------------ | ------------- | -------------
getData | Fetch the data | getData( \<callback object\> )
sendRecord | Send a record | sendRecord( \<data object\>, \<callback object\> )
deleteRecord | Delete a record | deleteRecord( \<record id\>, \<callback object\> )

### View

Method | Description | Usage
------------ | ------------- | -------------
refresh | The method that runs everytime the associated model changes | refresh()

### Generators

Method | Description | Usage
------------ | ------------- | -------------
genIdNumber | Returns a consecutive number to be used as unique ID | vRap.Generators.genIdNumber()

### Others

Method | Description | Usage
------------ | ------------- | -------------
alert | Displays an alert dialog | vRap.Msg.alert( \<title\>, \<message\> )
template | Retrives an HTML template and fills it with data | vRap.template( \<script id\>, \<data object\> );

## Native Properties
***

### Classes

Property | Description | Type
------------ | ------------- | -------------
extend | Set from which class to extend | String
privateProperties | Set class private properties | Object
privateMethods | Set class private methods | Object
publicProperties | Set class public properties | Object
publicMethods | Set class public methods | Object
staticProperties | Set class static properties | Object
staticMethods | Set class static methods | Object

### Model

Property | Description | Type
------------ | ------------- | -------------
data | Insert data directly to the object | Object
url | Specify a URL to use when performing data synchronization | String
forceParamId | Include the record ID inside data payload when sending it to the server | Boolean
api | Specify a diferent URL for each one of the synchronization methods (create, read, update, delete) | Object

### View

Property | Description | Type
------------ | ------------- | -------------
domEl | Specify the DOM element that wraps the view | jQuery Object
model | Set the model associated to the view using its alias | String
controllers | List the controllers associated to the view | Object
events | Configure event handlers for specific interactions | Object

### Controller

Property | Description | Type
------------ | ------------- | -------------
models | List the models to automatically instantiate before starting the controller | Object
views | List the views to automatically instantiate before starting the controller | Object
