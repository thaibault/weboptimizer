import { Browser, InitializedBrowser } from './type';
export declare const browser: Browser;
/**
 * Provides a generic browser api in node or web contexts.
 * @param replaceWindow - Indicates whether a potential existing window object
 * should be replaced or not.
 * @returns Determined environment.
 */
export declare const getInitializedBrowser: (replaceWindow?: boolean) => Promise<InitializedBrowser>;
export default getInitializedBrowser;
