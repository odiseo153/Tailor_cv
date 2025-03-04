import { HandlerResult } from "./HandlerResult";

export interface BaseHandler<T> {
    create(data: T): Promise<HandlerResult>;
    update(id: string, data: Partial<T>): Promise<HandlerResult>;
    delete(id: string): Promise<HandlerResult>;
}


