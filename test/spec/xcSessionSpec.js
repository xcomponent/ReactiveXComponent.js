
define(["communication/xcSession", "communication/xcWebSocketPublisher"], function (xcSession, Publisher) {

    describe("Test xcSession module", function () {

        var session = new xcSession.Session();

        describe("Test createPublisher method", function() {

            it("should return a new instance of Publisher", function () {
                var publisher = session.createPublisher();
                expect(publisher instanceof Publisher).toBe(true);
            });
        
        });

    });

});
