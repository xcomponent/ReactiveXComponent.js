import Guid from "guid";

test("It should create a random guid with the right format", () => {
    let guid = new Guid();
    let regexGuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    let randomGuid = guid.create();
    expect(regexGuid.test(randomGuid)).toBe(true);
});