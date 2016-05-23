/*
define(["Connection"], function (Connection) {

    var url = "wss://localhost:443";

    var connection, session;
    var data = "HOLA";

    beforeEach(function () {
        session = jasmine.createSpyObj('session', ['url', 'readyState', 'send', 'addEventListener']);
        session.url = url;
        session.readyState = 1;
        session.addEventListener.and.callFake(function (event, callback) {
            callback();
        });
        connection = new Connection.Init(session);
    });


    describe("Test Connection module", function () {

        it("Test getters", function () {
            expect(connection.getSession()).not.toBe(null);
        });

        it("Test callback functions", function() {
            expect(session.onopen).toEqual(jasmine.any(Function));
            expect(session.onclose).toEqual(jasmine.any(Function));
            expect(session.onerror).toEqual(jasmine.any(Function));
        });

        it("Test send", function () {
            connection.send(data);
            expect(session.send).toHaveBeenCalledTimes(1);
            expect(session.send).toHaveBeenCalledWith(data);
        });

        it("Test send after a time out", function (done) {
            session.readyState = 0;
            setTimeout(function () {
                connection.send(data);
                expect(session.send).toHaveBeenCalledTimes(1);
                expect(session.send).toHaveBeenCalledWith(data);
                done();
            }, 500);
        }, 1000);
        

    });

});
*/

