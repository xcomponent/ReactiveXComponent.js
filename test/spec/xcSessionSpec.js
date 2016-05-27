
define(["communication/xcSession", "communication/xcWebSocketPublisher"], function (xcSession, Publisher) {

    describe("Test xcSession module", function () {

        var session = new xcSession.Session();

        it("Test constructor : should instanciate session object", function () {
            expect(session.init).toEqual(jasmine.any(Function));
            expect(session.createPublisher).toEqual(jasmine.any(Function));
        });

        it("Test createPublisher method : should return an instance of Publisher", function () {
            var publisher = session.createPublisher();
            expect(publisher instanceof Publisher).toBe(true);
        });

    });

});
