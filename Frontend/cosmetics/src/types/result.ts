
export interface ResultMessage {
    code: string;
    message: string;
}


export interface Result<T> {
    status: boolean;
    message?: ResultMessage[];
    data: T;
    count?: number;
}
