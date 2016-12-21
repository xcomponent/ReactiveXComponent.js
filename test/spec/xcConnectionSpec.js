
define(["mock-socket", "communication/xcConnection"], function (MockSocket, Connection) {


    describe("Test xcConnection module", function () {

        var connection;

        beforeEach(function () {
            window.WebSocket = MockWebSocket;
            connection = new Connection();
        });

        describe("Test createSession method", function() {
            it("given an unknown server url, should call the session listener with an error argument", function (done) {
                var serverUrl = "wss://wrongServerUrl";
                var messageError = "Error on " + serverUrl + ".";

                var sessionListener = function (error, session) {
                    expect(error).toEqual(messageError);
                    expect(session).toBe(null);
                    done();
                };
                connection.createSession("xcApiFileName", serverUrl, sessionListener)
            });

            it("should call the sessionListener with the created session as argument", function (done) {
                var serverUrl = "wss://serverUrl";
                var mockServer = new MockServer(serverUrl);
                var xcApiFileName = "api.xcApi";
                var sessionListener = function (error, session) {
                    expect(error).toBe(null);
                    expect(session).not.toBe(null);
                    done();
                };
                connection.createSession(xcApiFileName, serverUrl, sessionListener);
                mockServer.on('connection', function(server) {
                    server.on('message', function(message) {
                        var content = 'H4sIAAAAAAAAAwXB2w0AEBAEwFbWl2Y0IW4jQmziPNo3k6TuGK0Tj/ESVRs6yzkuHRnGIqPB92qzhg8yp62UMAAAAA==';
                        var data = {ApiFound: true, ApiName: xcApiFileName, Content: content};
                        server.send("getXcApi " + JSON.stringify(data));
                    });
                });
            });
        });



    });

});