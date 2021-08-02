import { Encoding, Mapping } from 'clientnode/type';
import { Options, TemplateFunction } from 'ejs';
import { Extensions, Replacements } from './type';
export declare type CompilerOptions = Options & {
    encoding: Encoding;
    isString?: boolean;
};
export declare type CompileFunction = (template: string, options?: Partial<CompilerOptions>, compileSteps?: number) => TemplateFunction;
export declare type LoaderConfiguration = Mapping<unknown> & {
    compiler: CompilerOptions;
    compileSteps: number;
    compress: {
        html: Mapping<unknown>;
        javaScript: Mapping<unknown>;
    };
    context: string;
    extensions: Extensions;
    locals?: Mapping<unknown>;
    module: {
        aliases: Mapping<string>;
        replacements: Replacements;
    };
};
/**
 * Main transformation function.
 * @param this - Loader context.
 * @param source - Input string to transform.
 * @returns Transformed string.
 */
export default function (this: any, source: string): string;
