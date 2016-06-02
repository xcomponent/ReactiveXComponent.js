
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
                connection.createSession(serverUrl, sessionListener);
            });

            it("should call the sessionListener with the created session as argument", function (done) {
                var serverUrl = "wss://serverUrl";
                var server = new MockServer(serverUrl)
                var sessionListener = function (error, session) {
                    expect(error).toBe(null);
                    expect(session).not.toBe(null);
                    done();
                };
                connection.createSession(serverUrl, sessionListener);
            });
        });



    });

});