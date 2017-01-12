import SessionFactory from "communication/xcSession";
import { ApiConfiguration } from "configuration/apiConfiguration";
import { DefaultApiConfigurationParser } from "configuration/apiConfigurationParser";

let Connection = function () {
};


Connection.prototype.getXcApiList = function (serverUrl, getXcApiListListener) {
    let session = SessionFactory.create(serverUrl, null, null);
    session.webSocket.addEventListener("open", function (e) {
        session.privateSubscriber.getXcApiList(function (apis) {
            getXcApiListListener(apis);
            session.close();
        });
    });
};


Connection.prototype.createSession = function (xcApiFileName, serverUrl, sessionListener) {
    this.init(xcApiFileName, serverUrl, null, sessionListener);
};


Connection.prototype.createAuthenticatedSession = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
    this.init(xcApiFileName, serverUrl, sessionData, sessionListener);
};


Connection.prototype.init = function (xcApiFileName, serverUrl, sessionData, sessionListener) {
    let session = SessionFactory.create(serverUrl, null, sessionData);
    let getXcApiRequest = function (xcApiFileName, sessionListener) {
        session.privateSubscriber.getXcApi(xcApiFileName, function (xcApi) {
            const parser = new DefaultApiConfigurationParser();
            const configurationPromise = parser.parse(xcApi);
            configurationPromise.then(configuration => {
                session.configuration = configuration;
                session.replyPublisher.configuration = configuration;
                sessionListener(null, session);
            })
            .catch(e => sessionListener(e, null));
        });
    };
    session.init(sessionListener, getXcApiRequest, xcApiFileName);
};


export default Connection;