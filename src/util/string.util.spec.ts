import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';
import { StringUtil } from './string.util';

describe('StringUtil', () => {
    it('should throw InvalidParameterException when parameter length is invalid', () => {
        expect(() => StringUtil.randomString(undefined)).toThrow(
            InvalidParameterException,
        );
        expect(() => StringUtil.randomString(-1)).toThrow(
            InvalidParameterException,
        );
        expect(() => StringUtil.randomString(13)).toThrow(
            InvalidParameterException,
        );
    });
    it('should return random string sequence equal to provided parameter length', () => {
        const randomString5 = StringUtil.randomString(5);
        expect(randomString5).not.toBeUndefined();
        expect(randomString5.length).toEqual(5);

        const randomString12 = StringUtil.randomString(12);
        expect(randomString12).not.toBeUndefined();
        expect(randomString12.length).toEqual(12);
    });
});
