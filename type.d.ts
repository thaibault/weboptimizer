import { Encoding, Mapping, PlainObject, ProcedureFunction, SecondParameter } from 'clientnode/type';
import { JSDOM } from 'jsdom';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { DefinePlugin as WebpackDefinePlugin, Configuration as BaseWebpackConfiguration, Entry as WebpackEntry, IgnorePlugin as WebpackIgnorePlugin, Module as WebpackModule, ModuleOptions as WebpackModuleOptions, WebpackOptionsNormalized } from 'webpack';
import { CommonOptions as WorkboxCommonOptions, GenerateSWOptions as WorkboxGenerateSWOptions, InjectManifestOptions as WorkboxInjectManifestOptions } from 'workbox-webpack-plugin';
export interface Browser {
    debug: boolean;
    domContentLoaded: boolean;
    DOM: typeof JSDOM | null;
    initialized: boolean;
    instance: JSDOM | null;
    window: null | Window;
    windowLoaded: boolean;
}
export interface InitializedBrowser extends Browser {
    DOM: typeof JSDOM;
    instance: JSDOM;
    window: Window;
}
export declare type PackageConfiguration = {
    name: string;
    version: string;
};
export declare type PackageDescriptor = {
    configuration: PackageConfiguration;
    filePath: string;
};
export declare type Replacements = Mapping<SecondParameter<String['replace']>>;
export declare type Resolvable = {
    [TYPE in '__evaluate__' | '__execute__' | string]: any | Resolvable | string;
};
export declare type ExternalAliases = Mapping<Mapping<Function | string>>;
export declare type ExternalInjection = string | ((parameter: {
    context: string;
    request: string;
}, callback: ProcedureFunction) => void) | RegExp | Array<ExternalInjection>;
export declare type GivenInjection = Function | string | Array<string> | Mapping<string | Array<string>>;
export declare type NormalizedGivenInjection = Mapping<Array<string>>;
export declare type GivenInjectionConfiguration = {
    autoExclude: Array<string>;
    entry: GivenInjection;
    external: GivenInjection;
};
export declare type InjectionConfiguration = {
    autoExclude: Array<string>;
    chunks: PlainObject;
    entry: {
        given: GivenInjection;
        normalized: NormalizedGivenInjection;
    };
    external: {
        aliases: ExternalAliases;
        implicit: {
            pattern: {
                exclude: Array<RegExp | string>;
                include: Array<RegExp | string>;
            };
        };
        modules: ExternalInjection;
    };
    externalAliases: Mapping;
    ignorePattern: Array<WebpackIgnorePlugin['options']> | WebpackIgnorePlugin['options'];
    implicitExternalExcludePattern: Array<RegExp | string>;
    implicitExternalIncludePattern: Array<RegExp | string>;
};
export declare type AssetPathConfiguration = {
    base: string;
    cascadingStyleSheet: string;
    data: string;
    font: string;
    image: string;
    javaScript: string;
    template: string;
};
export declare type PathConfiguration = {
    apiDocumentation: string;
    base: string;
    configuration: {
        javaScript: string;
        json: string;
        typeScript: string;
    };
    context: string;
    ignore: Array<string>;
    source: {
        asset: AssetPathConfiguration;
        base: string;
    };
    target: {
        asset: AssetPathConfiguration;
        base: string;
        manifest: string;
        public: string;
    };
    tidyUp: Array<string>;
    tidyUpOnClear: Array<string>;
};
export declare type BuildConfigurationItem = {
    extension: string;
    outputExtension: string;
    filePathPattern: string;
};
export declare type BuildConfiguration = Mapping<BuildConfigurationItem>;
export declare const SubConfigurationTypes: readonly ["debug", "document", "test", "test:browser"];
export declare const TaskTypes: readonly ["build", "serve", "debug", "document", "test", "test:browser"];
export declare type BooleanExpression = boolean | null | string;
export declare type AdditionalLoaderConfiguration = {
    exclude?: BooleanExpression;
    include?: BooleanExpression;
    test: string;
    use: any;
};
export declare type AdditionalLoaderConfigurations = {
    post: Array<AdditionalLoaderConfiguration>;
    pre: Array<AdditionalLoaderConfiguration>;
};
export declare type AdditionalLoader = {
    post: Array<string>;
    pre: Array<string>;
};
export declare type WebpackLoader = {
    loader: string;
    options?: PlainObject;
};
export declare type ResourceLoaderConfiguration = WebpackLoader & {
    exclude: BooleanExpression;
    include: BooleanExpression;
    loader: Array<string>;
    regularExpression: string;
};
export declare type LoaderConfiguration = ResourceLoaderConfiguration & {
    additional: AdditionalLoaderConfigurations;
};
export declare type WebpackLoaderConfiguration = {
    exclude: WebpackLoaderIndicator;
    include: WebpackLoaderIndicator;
    test: RegExp;
    use: Array<WebpackLoader> | WebpackLoader;
};
export declare type WebpackLoaderIndicator = Array<WebpackLoaderIndicator> | Function | string;
export declare type Command = {
    arguments: Array<string>;
    command: string;
    indicator?: string;
};
export declare type CommandLineArguments = {
    build: Command;
    document: Array<Command> | Command;
    lint: Array<Command> | Command;
    serve: Array<Command> | Command;
    test: Array<Command> | Command;
    'test:browser': Array<Command> | Command;
    'check:types': Array<Command> | Command;
};
export declare type NodeEnvironment = Mapping<boolean | string> & {
    '#': string;
};
export declare type PluginConfiguration = {
    name: {
        initializer: string;
        module: string;
    };
    parameter: Array<any>;
};
export declare type DefaultConfiguration = {
    contextType: string;
    debug: boolean;
    document: PlainObject;
    encoding: Encoding;
    givenCommandLineArguments: Array<string>;
    library: boolean;
    nodeEnvironment: NodeEnvironment;
    path: Resolvable;
    plugins: Array<PluginConfiguration>;
    test: PlainObject;
    'test:browser': PlainObject;
};
export declare type ExportFormat = 'amd' | 'amd-require' | 'assign' | 'global' | 'jsonp' | 'var' | 'this' | 'commonjs' | 'commonjs2' | 'umd';
export declare type HTMLConfiguration = {
    filename: string;
    template: {
        filePath: string;
        options?: PlainObject;
        postCompileOptions: PlainObject;
        request: string | string;
        use: Array<WebpackLoader> | WebpackLoader;
    };
};
export declare type MetaConfiguration = {
    default: DefaultConfiguration;
    debug: Resolvable;
    library: Resolvable;
};
export declare type ResolvedBuildConfigurationItem = {
    filePaths: Array<string>;
    extension: string;
    outputExtension: string;
    filePathPattern: string;
};
export declare type Extensions = {
    file: {
        external: Array<string>;
        internal: Array<string>;
    };
};
export declare type SpecificExtensions = {
    file: Array<string>;
};
export declare type InPlaceAssetConfiguration = {
    body?: Array<RegExp | string> | RegExp | string;
    head?: Array<RegExp | string> | RegExp | string;
};
export declare type InPlaceConfiguration = {
    cascadingStyleSheet: InPlaceAssetConfiguration;
    externalLibrary: {
        normal: boolean;
        dynamic: boolean;
    };
    javaScript: InPlaceAssetConfiguration;
    otherMaximumFileSizeLimitInByte: number;
};
export declare type ResolvedConfiguration = {
    assetPattern: Mapping<{
        excludeFilePathRegularExpression: string;
        includeFilePathRegularExpression: string;
        pattern: string;
    }>;
    buildContext: {
        definitions: WebpackDefinePlugin['definitions'];
        types: BuildConfiguration;
    };
    cache?: {
        main?: WebpackOptionsNormalized['cache'];
        unsafe?: WebpackModuleOptions['unsafeCache'];
    };
    commandLine: CommandLineArguments;
    contextType: string;
    debug: boolean;
    development: {
        server: WebpackOptionsNormalized['devServer'] & {
            host: string;
            https: boolean;
            liveReload: boolean;
            port: number;
        };
        tool: WebpackOptionsNormalized['devtool'];
    };
    document: PlainObject;
    encoding: Encoding;
    exportFormat: {
        external: ExportFormat;
        globalObject: string;
        self: ExportFormat;
    };
    extensions: Extensions;
    favicon: Mapping<any> & {
        logo: string;
    };
    files: {
        additionalPaths: Array<string>;
        compose: {
            cascadingStyleSheet: string;
            image: string;
            javaScript: string;
        };
        defaultHTML: HTMLConfiguration;
        html: Array<HTMLConfiguration>;
    };
    givenCommandLineArguments: Array<string>;
    hashAlgorithm: string;
    injection: InjectionConfiguration;
    inPlace: InPlaceConfiguration;
    library: boolean;
    libraryName: string;
    loader: {
        aliases: Mapping;
        directoryNames: Array<string>;
        extensions: {
            file: Array<string>;
        };
        resolveSymlinks: boolean;
    };
    module: {
        additional: AdditionalLoaderConfigurations;
        aliases: Mapping;
        cascadingStyleSheet: ResourceLoaderConfiguration;
        directoryNames: Array<string>;
        enforceDeduplication: boolean;
        html: LoaderConfiguration;
        locations: {
            directoryPaths: Array<string>;
            filePaths: Array<string>;
        };
        optimizer: {
            babelMinify?: {
                bundle?: {
                    plugin?: PlainObject;
                    transform?: PlainObject;
                };
                module?: PlainObject;
            };
            cssnano: PlainObject;
            data: ResourceLoaderConfiguration;
            font: {
                eot: ResourceLoaderConfiguration;
                svg: ResourceLoaderConfiguration;
                ttf: ResourceLoaderConfiguration;
                woff: ResourceLoaderConfiguration;
            };
            htmlMinifier?: PlainObject;
            image: {
                content: PlainObject;
                exclude: string;
                loader: Array<string>;
            };
            minimize: boolean;
            minimizer: Array<PlainObject>;
        };
        preprocessor: {
            cascadingStyleSheet: WebpackLoader & {
                additional: {
                    plugins: AdditionalLoader;
                    post: Array<string>;
                    pre: Array<string>;
                };
                postcssPresetEnv: PlainObject;
            };
            ejs: LoaderConfiguration;
            html: LoaderConfiguration;
            javaScript: LoaderConfiguration;
            json: {
                exclude: string;
                loader: string;
            };
        };
        provide: Mapping | null;
        replacements: {
            context: Array<[string, string]>;
            normal: Replacements;
        };
        resolveSymlinks: boolean;
        skipParseRegularExpressions: WebpackModuleOptions['noParse'];
        style: WebpackLoader;
    };
    name: string;
    needed: Mapping<boolean>;
    nodeENV: false | null | string;
    nodeEnvironment: NodeEnvironment;
    offline: {
        common: WorkboxCommonOptions;
        injectionManifest: WorkboxInjectManifestOptions;
        serviceWorker: WorkboxGenerateSWOptions;
        use: 'injectionManifest' | 'serviceWorker';
    };
    package: {
        aliasPropertyNames: Array<string>;
        main: {
            fileNames: Array<string>;
            propertyNames: Array<string>;
        };
    };
    path: PathConfiguration;
    performanceHints: {
        hints: false | string;
    };
    plugins: Array<PluginConfiguration>;
    showConfiguration: boolean;
    stylelint: PlainObject;
    targetTechnology: {
        boilerplate: string;
        payload: string;
    };
    test: PlainObject;
    'test:browser': PlainObject;
    webpack: WebpackConfiguration;
};
export declare type ResolvedBuildConfiguration = Array<ResolvedBuildConfigurationItem>;
export declare type WebpackConfiguration = BaseWebpackConfiguration & {
    entry: WebpackEntry;
    module: WebpackModule;
    output: PlainObject;
    replaceWebOptimizer: WebpackConfiguration;
};
export declare type WebpackBaseAssets = {
    outputName: string;
    plugin: HtmlWebpackPlugin;
};
export declare type WebpackAssets = WebpackBaseAssets & {
    bodyTags: HtmlWebpackPlugin.HtmlTagObject[];
    headTags: HtmlWebpackPlugin.HtmlTagObject[];
    outputName: string;
    publicPath: string;
    plugin: HtmlWebpackPlugin;
};
export declare type HTMLWebpackPluginAssetTagGroupsData = {
    bodyTags: HtmlWebpackPlugin.HtmlTagObject[];
    headTags: HtmlWebpackPlugin.HtmlTagObject[];
    outputName: string;
    plugin: HtmlWebpackPlugin;
};
export declare type HTMLWebpackPluginBeforeEmitData = {
    html: string;
    outputName: string;
    plugin: HtmlWebpackPlugin;
};
