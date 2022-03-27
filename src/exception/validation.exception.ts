export class ValidationException extends Error {
    constructor(message: string, errors?: Error[]) {
        let msg: string = message;
        if (errors) {
            for (const er of errors) {
                msg += '\n';

                if (er.name) {
                    msg += `${er.name} `;
                }
                if (er.message) {
                    msg += er.message;
                }
            }
        }

        super(msg);
    }
}
