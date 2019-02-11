export default class Router { // this could be integrated with stateful dead
    init(subscriptions, PS, setHashFn, decodeHashFn, views){
        
        
        this.stateObj = {};
        this.hashState = setHashFn;
        this.decodeHash = decodeHashFn;
        this.viewPromises = views.map(each => each.isReady);
        
        Promise.all(this.viewPromises).then(() => {
            
            this.decodeHash();
        });
        PS.setSubs(subscriptions.map(each => {
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