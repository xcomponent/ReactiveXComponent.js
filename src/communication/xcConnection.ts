import {SessionFactory, Session} from "communication/xcSession";
import Parser from "Parser";
import Configuration from "configuration/xcConfiguration";


class Connection {

    private apis : {[xcApiFileName : string] : Configuration};

    constructor() {
        this.apis = {};
    }

    getXcApiList(serverUrl : string, getXcApiListListener : (apis : Array<Object>) => void) {
        let session = SessionFactory(serverUrl, null, null);
        session
            .webSocket
            .onopen = function (e : Event) {
                session
                    .privateSubscriber
                    .getXcApiList(function (apis) {
                        getXcApiListListener(apis);
                        session.close();
                    });
            };
    };

    createSession(xcApiFileName : string, serverUrl : string, sessionListener : (error : any, session : Session) => void) {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName : string, serverUrl : string, sessionData : string, sessionListener : (error : any, session : Session) => void) {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    };

    private init(xcApiFileName : string, serverUrl : string, sessionData : string, sessionListener : (error : any, session : Session) => void) {
        let session = SessionFactory(serverUrl, null, sessionData);
        let thisConnection = this;
        let getXcApiRequest = function (xcApiFileName, sessionListener) {
            if (thisConnection.apis[xcApiFileName] === undefined) {
                session
                    .privateSubscriber
                    .getXcApi(xcApiFileName, function (xcApi : string) {
                        let parser = new Parser();
                        let configuration = new Configuration(parser);
                        configuration.init(xcApi);
                        thisConnection.apis[xcApiFileName] = configuration;
                        session.configuration = configuration;
                        session.replyPublisher.configuration = configuration;
                        sessionListener(null, session);
                    });
            } else {
                let configuration = thisConnection.apis[xcApiFileName];
                session.configuration = configuration;
                session.replyPublisher.configuration = configuration;
                sessionListener(null, session);
            }
        };
        session.init(sessionListener, getXcApiRequest, xcApiFileName);
    };

}

export default Connection;