import SessionFactory from "communication/xcSession";
import Parser from "Parser";
import Configuration from "configuration/xcConfiguration";

class Connection {

    private apis : any;

    constructor() {
        this.apis = {};
    }

    getXcApiList(serverUrl, getXcApiListListener) {
        let session = SessionFactory.create(serverUrl, null, null);
        session
            .webSocket
            .setEventListener('onopen', function (e) {
                session
                    .privateSubscriber
                    .getXcApiList(function (apis) {
                        getXcApiListListener(apis);
                        session.close();
                    });
            });
    };

    createSession(xcApiFileName, serverUrl, sessionListener) {
        this.init(xcApiFileName, serverUrl, null, sessionListener);
    };

    createAuthenticatedSession(xcApiFileName, serverUrl, sessionData, sessionListener) {
        this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
    };

    private init(xcApiFileName, serverUrl, sessionData, sessionListener) {
        let session = SessionFactory.create(serverUrl, null, sessionData);
        let thisObject = this;
        let getXcApiRequest = function (xcApiFileName, sessionListener) {
            if (thisObject.apis[xcApiFileName] === undefined) {
                session
                    .privateSubscriber
                    .getXcApi(xcApiFileName, function (xcApi) {
                        let parser = new Parser();
                        let configuration = new Configuration(parser);
                        configuration.init(xcApi);
                        thisObject.apis[xcApiFileName] = configuration;
                        session.configuration = configuration;
                        session.replyPublisher.configuration = configuration;
                        sessionListener(null, session);
                    });
            } else {
                let configuration = thisObject.apis[xcApiFileName];
                session.configuration = configuration;
                session.replyPublisher.configuration = configuration;
                sessionListener(null, session);
            }
        };
        session.init(sessionListener, getXcApiRequest, xcApiFileName);
    };

}

export default Connection;