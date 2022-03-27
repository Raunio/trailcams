export abstract class ServiceRequest<T> {
    constructor(init?: Partial<T>) {
        Object.assign(this, init);
    }
}
