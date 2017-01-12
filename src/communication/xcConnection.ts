import {SessionFactory, Session} from "communication/xcSession";
import {ApiConfiguration} from "configuration/apiConfiguration";
import {DefaultApiConfigurationParser} from "configuration/apiConfigurationParser";

class Connection {

    private apis : {
        [xcApiFileName : string]: ApiConfiguration
    };

    constructor() {
        this.apis = {};
    }

    getXcApiList(serverUrl : string, getXcApiListListener : (apis : Array < Object >) => void) : void {
        let session = SessionFactory(serverUrl, null, null);
        session.webSocket.onopen = function (e : Event) {
            session
                .privateSubscriber
                .getXcApiList(function (apis) {
                    getXcApiListListener(apis);
                    session.close();
                });
        };
    };

    createSession(xcApiFileName : string, serverUrl : string, sessionListener : (error : any, session : Session) => void) : void {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName : string, serverUrl : string, sessionData : string, sessionListener : (error : any, session : Session) => void) : void {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    };

    private init(xcApiFileName : string, serverUrl : string, sessionData : string, sessionListener : (error : any, session : Session) => void) : void {
        let session = SessionFactory(serverUrl, null, sessionData);
        let getXcApiRequest = function (xcApiFileName, sessionListener) {
            session
                .privateSubscriber
                .getXcApi(xcApiFileName, function (xcApi) {
                    const parser = new DefaultApiConfigurationParser();
                    const configurationPromise = parser.parse(xcApi);
                    configurationPromise.then(configuration => {
                        session.configuration = configuration;
                        session.replyPublisher.configuration = configuration;
                        sessionListener(null, session);
                    }).catch(e => sessionListener(e, null));
                });
        };
        session.init(sessionListener, getXcApiRequest, xcApiFileName);
    }
}

export default Connection;