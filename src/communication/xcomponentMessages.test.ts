import { Deserializer } from './xcomponentMessages';

test('It should keep multiple spaces when deserializing messages', () => {
    let deserializer = new Deserializer();
    let multiSpaceString = 'my string with    multiple   spaces';
    let deserializedData = deserializer.deserialize(`Command Topic {\"field\": \"${multiSpaceString}\"}`);
    let stringDataJson = JSON.parse(deserializedData.stringData);

    expect(stringDataJson.field).toBe(multiSpaceString);
});

test('It should keep multiple spaces when deserializing messages without topic', () => {
    let deserializer = new Deserializer();
    let multiSpaceString = 'my string with    multiple   spaces';
    let deserializedData = deserializer.deserializeWithoutTopic(`Command {\"field\": \"${multiSpaceString}\"}`);
    let stringDataJson = JSON.parse(deserializedData.stringData);

    expect(stringDataJson.field).toBe(multiSpaceString);
});

test('It decodes server messages correctly', () => {
    let deserializer = new Deserializer();

    let message =
        'H4sIAAAAAAAEAMVVXU+DMBR9N/E/NH0HNvZiFthiUKPJNh82I68InVShJbSO7d9bikAL0xk39YXknvt17unNxZlu0wRsUM4wJS4cmgMIEAlphMmzC9/42riA08n5mTPD5FVgyzBGaQBEEmHjLYtcGHOejS2rKAqzGJk0f7bswWBo+fNZFQubYHw42MCE8YCECALMvAQjwi8zvIxpIcitg4RJR81Fg0mQIhfeoiShjzRPIihYAyB5o8ijaUaJqMYk2sc/SZehvreivlcmMGDpsCAn8QbVcSCG4WgehDEm6C66yWnqQhtWcG0bQwgSEVxZCgOJrqiKibpQ5WDtIeFYndkqIboo0/Sppe7qU+M9fUomLQ9hNRqpWij43hnlPP0xYUe40jtsZKsspU3ZSKQWKFrlAWGYi11mmv9joHJpcJolqI0DOGprf9lQ0b2S+UDPmtP1Rtm7Lh3pBKj8rnYZWkiV/eaRzFYT84Gh/P7pBYXcXAY76TiG9h5azoLy/lDdAm1QVULzi/Ltk//SJtjahMZpV8E+3NHuanqg5OgHJf9zu66E8ygVTr/U31XrL5daQ3vHtz6c+vFVz2wFNv/UyTvq1DYQiwcAAA==';
    let decodedMessage = deserializer.decodeServerMessage(message);

    expect(decodedMessage).toContain('<LinkingSchema');
    expect(decodedMessage).toContain('</LinkingSchema>');
});
