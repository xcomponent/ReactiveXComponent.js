
define(["mock-socket", "communication/xcConnection"], function (MockSocket, Connection) {


    describe("Test xcConnection module", function () {

        var connection;

        beforeEach(function () {
            connection = new Connection();
        });

        describe("Test createSession method", function() {
            it("Connect to a not existing serverUrl and execute sessionListener callback with error argument", function (done) {
                var serverUrl = "wss://wrongServerUrl";
                var messageError = "Error on " + serverUrl + ".";

                var sessionListener = function (error, session) {
                    expect(error).toMatch(messageError);
                    expect(session).toBe(null);
                    done();
                };
                connection.createSession(serverUrl, sessionListener, MockWebSocket);
            });

            it("Connect to a mocket server and execute sessionListener callback with session argument", function (done) {
                var serverUrl = "wss://serverUrl";
                var server = new MockServer(serverUrl)
                var sessionListener = function (error, session) {
                    expect(error).toBe(null);
                    expect(session).not.toBe(null);
                    done();
                };
                connection.createSession(serverUrl, sessionListener, MockWebSocket);
            });
        });



    });

});