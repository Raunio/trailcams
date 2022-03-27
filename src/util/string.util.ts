import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';

export class StringUtil {
    /**
     * Returns a pseudo random sequence of characters with a length equal to provided parameter 'length'.
     * @param length Length of the string to be generated. Must be above zero and less than or equal to twelve.
     * @returns The generated string
     */
    static randomString(length: number): string {
        if (!length || length < 1) {
            throw new InvalidParameterException(
                `Parameter 'length' is mandatory and must be above zero`,
            );
        }
        if (length > 12) {
            throw new InvalidParameterException(
                `Parameter 'length' must not exceed 12`,
            );
        }
        return (Math.random() + 1).toString(36).substring(12 - length, 12);
    }
}
