/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/


define(["guid"], function (Guid) {

    describe("Test guid module", function () {

        var guid;

        beforeEach(function () {
            guid = new Guid();
        });


        describe("Test create method", function () {
            it("should create a random guid with the right format", function () {
                var regexGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                var randomGuid = guid.create();
                expect(regexGuid.test(randomGuid)).toBe(true);
            });
        });

    });

});


