
define(["communication/xcSession", "communication/xcWebSocketPublisher", "communication/xcWebSocketSubscriber", "mock-socket"], function (xcSession, Publisher, Subscriber, MockSocket) {

    describe("Test xcSession module", function () {


        describe("Test createPublisher method", function() {
            var session;
            beforeEach(function () {
                session = new xcSession.Session();
            });

            it("should return a new instance of Publisher", function () {
                var publisher = session.createPublisher();
                expect(publisher instanceof Publisher).toBe(true);
            });
        
        });

        describe("Test createSubscriber method", function () {
            var session;
            beforeEach(function () {
                var serverUrl = "wss:\\serverUrl";
                var mockWebSocket = new MockWebSocket(serverUrl);
                session = new xcSession.Session(serverUrl, mockWebSocket, null);
            });
            it("should return a new instance of Subscriber", function () {
                var subscriber = session.createSubscriber();
                expect(subscriber instanceof Subscriber).toBe(true);
            });
        });
    });

});
