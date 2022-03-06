export declare function track(target: any, key: any): void;
export declare function trigger(target: any, key: any): void;
export declare function effect(cb: any, options?: any): {
    (): any;
    options: any;
    deps: any[];
    fn: any;
} | undefined;
export declare function addAsyncJob(job: any): Promise<void> | undefined;
export declare function flushJob(): Promise<void> | undefined;
