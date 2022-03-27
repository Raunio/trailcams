import { validateOrReject } from 'class-validator';
import { ValidationException } from 'src/exception/validation.exception';

export class ValidatorUtil {
    /**
     * Uses class-validator and its decorators to validate given object. Throws ValidationException if validation fails.
     * @param obj Object to be validated
     */
    static async validate(obj: object) {
        if (!obj) {
            throw new ValidationException('Object is undefined');
        }

        try {
            await validateOrReject(obj);
        } catch (errors) {
            throw new ValidationException('Object validation failed', errors);
        }
    }
}
