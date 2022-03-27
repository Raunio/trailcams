import { InvalidParameterException } from 'src/exception/invalid.parameter.exception';

export class MimetypesUtil {
    private static readonly EXTENSIONS = {
        'image/png': '.png',
        'image/jpg': '.jpg',
        'image/jpeg': '.jpeg',
    };

    static getExtension(mimetype: string) {
        try {
            return MimetypesUtil.EXTENSIONS[mimetype];
        } catch (ex) {
            throw new InvalidParameterException(
                `Mimetype '${mimetype}' does not have a mapped extension!`,
            );
        }
    }
}
