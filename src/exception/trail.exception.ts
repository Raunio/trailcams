import { HttpException } from '@nestjs/common';

/**
 * Extends HttpExcption and provides status code and messages for client handling.
 * All exceptions that extend TrailException are handled in @TrailExceptionFilter
 */
export class TrailException extends HttpException {
    protected innerException: Error;

    /**
     * Constructs a new TrailException instance
     * @param message Message for logging and response body. Will be omitted from the response if @param businessStatus is provided
     * @param httpStatus Http status code
     * @param businessStatus Optional business status for client side handling
     * @param businessMessage Optional business message that should be used to describe business status
     */
    constructor(
        message: string | Record<any, string>,
        httpStatus: number,
        private readonly businessStatus?: string,
        private readonly businessMessage = message,
    ) {
        super(message, httpStatus);
    }

    getBusinessStatus() {
        return this.businessStatus;
    }

    getBusinessMessage() {
        return this.businessMessage;
    }

    getInnerException() {
        return this.innerException;
    }
}
