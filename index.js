export default class Router { // this could be integrated with stateful dead
    /*
    Router offers basic shared functions for all routers. Methods for updating  history state and updating the hash url. Array of subscriptions
    that affect the url is passed in. The PubSub module is passed in. setHash and decodeHash functions are passed in bc they will be diff
    for each app. views are passed in so that the resolutions of their promises can be tracked and acted upon (ie router decodes only after 
    all views are ready)
    */
    init(routerOptions){
        
        if ( routerOptions === undefined || typeof routerOptions !== 'object' ){
            throw 'router.init method requires a config object as parameter 1'
        }
        if ( typeof routerOptions.encode !== 'function' || typeof routerOptions.decode !== 'function' || !Array.isArray(routerOptions.views) || typeof routerOptions.PS !== 'object' ){
            throw 'routerOptions object needs encode, decode, views, and PS properties. encode and decode must be functions; views is an array of views from the app; PS needs to be the PubSub setter.'
        }
        this.stateObj = {};
        this.hashState = routerOptions.encode;
        this.decodeHash = routerOptions.decode;
        this.viewPromises = routerOptions.views.map(each => each.isReady); // view.isReady is a promised resolved true after the view is rendered
        this.PS = routerOptions.PS;
        
        Promise.all(this.viewPromises).then(() => {
            
            this.decodeHash();
        });
        this.PS.setSubs(routerOptions.subscriptions.map(each => { // subscriptions that matter for router are made to trigger hashChange method when published
            var arr = [each, (msg,data) => {
                this.hashChange.call(this,msg,data);
            }];
            
            return arr;
        }));
    }
    hashChange(msg,data){
        this.setStateObj(msg,data);
        this.hashState();
        this.replaceState();
    }
    setStateObj(msg, data){
        this.stateObj[msg] = data;
        
    }
    replaceState(){    
        window.history.replaceState(this.stateObj,'',this.hashString)
    }

}