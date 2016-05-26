
define(["communication/xcConnection"], function (Connection) {

    var connection = new Connection();

    describe("Test Connection module", function () {

        it("Test constructor", function() {
            expect(connection.createSession).toEqual(jasmine.any(Function));
        });

    });

});


