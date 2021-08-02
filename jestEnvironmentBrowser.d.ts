/**
 * Implements the default browser environment to run script context in.
 */
export declare class BrowserEnvironment {
    /**
     * @returns Nothing.
     */
    setup(): Promise<void>;
    /**
     * @returns Nothing.
     */
    teardown(): void;
    /**
     * @returns Null.
     */
    runScript(): null;
}
export default BrowserEnvironment;
