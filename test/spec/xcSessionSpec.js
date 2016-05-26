
define(["communication/xcSession", "communication/xcWebSocketPublisher"], function (xcSession, Publisher) {

    describe("Test xcSession module", function () {

        var session = new xcSession.Session();

        it("Test constructor", function () {
            expect(session.init).toEqual(jasmine.any(Function));
            expect(session.createPublisher).toEqual(jasmine.any(Function));
        });

        it("Test createPublisher method", function () {
            var publisher = session.createPublisher();
            expect(publisher instanceof Publisher).toBe(true);
        });

    });

});
