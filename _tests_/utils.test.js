const falk = require('../dist/index.js');

test('it should expose fieldtypes', async () => {
    expect(falk.fieldType.STRING).toStrictEqual('string');
    expect(falk.fieldType.NUMBER).toStrictEqual('number');
    expect(falk.fieldType.BOOLEAN).toStrictEqual('boolean');
});