import { Deserializer } from "../../src/communication/xcomponentMessages";

test("It should keep multiple spaces when deserializing messages", () => {
    let deserializer = new Deserializer();
    let multiSpaceString = "my string with    multiple   spaces";
    let deserializedData = deserializer.deserialize(`Command Topic {\"field\": \"${multiSpaceString}\"}`);
    let stringDataJson = JSON.parse(deserializedData.stringData);

    expect(stringDataJson.field).toBe(multiSpaceString);
});

test("It should keep multiple spaces when deserializing messages without topic", () => {
    let deserializer = new Deserializer();
    let multiSpaceString = "my string with    multiple   spaces";
    let deserializedData = deserializer.deserializeWithoutTopic(`Command {\"field\": \"${multiSpaceString}\"}`);
    let stringDataJson = JSON.parse(deserializedData.stringData);

    expect(stringDataJson.field).toBe(multiSpaceString);
});