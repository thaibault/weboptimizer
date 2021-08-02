import { Encoding, Mapping } from 'clientnode/type';
import { BuildConfiguration, Extensions, GivenInjection, GivenInjectionConfiguration, NormalizedGivenInjection, PathConfiguration, PackageDescriptor, Replacements, ResolvedBuildConfiguration, SpecificExtensions } from './type';
export declare const KNOWN_FILE_EXTENSIONS: Array<string>;
/**
 * Provides a class of static methods with generic use cases.
 */
export declare class Helper {
    /**
     * Determines whether given file path is within given list of file
     * locations.
     * @param filePath - Path to file to check.
     * @param locationsToCheck - Locations to take into account.
     * @returns Value "true" if given file path is within one of given
     * locations or "false" otherwise.
     */
    static isFilePathInLocation(filePath: string, locationsToCheck: Array<string>): boolean;
    /**
     * Strips loader informations form given module request including loader
     * prefix and query parameter.
     * @param moduleID - Module request to strip.
     * @returns Given module id stripped.
     */
    static stripLoader(moduleID: string): string;
    /**
     * Converts given list of path to a normalized list with unique values.
     * @param paths - File paths.
     * @returns The given file path list with normalized unique values.
     */
    static normalizePaths(paths: Array<string>): Array<string>;
    /**
     * Applies file path/name placeholder replacements with given bundle
     * associated informations.
     * @param template - File path to process placeholder in.
     * @param scope - Scope to use for processing.
     * @returns Processed file path.
     */
    static renderFilePathTemplate(template: string, scope?: Mapping<number | string>): string;
    /**
     * Converts given request to a resolved request with given context
     * embedded.
     * @param request - Request to determine.
     * @param context - Context of given request to resolve relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param relativeModuleLocations - List of relative directory paths to
     * search for modules in.
     * @returns A new resolved request.
     */
    static applyContext(request: string, context?: string, referencePath?: string, aliases?: Mapping, moduleReplacements?: Replacements, relativeModuleLocations?: Array<string>): false | string;
    /**
     * Check if given request points to an external dependency not maintained
     * by current package context.
     *
     * @param request - Request to determine.
     * @param context - Context of current project.
     * @param requestContext - Context of given request to resolve relative to.
     * @param normalizedGivenInjection - Mapping of chunk names to modules
     * which should be injected.
     * @param relativeExternalModuleLocations - Array of paths where external
     * modules take place.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param includePattern - Array of regular expressions to explicitly mark
     * as external dependency.
     * @param excludePattern - Array of regular expressions to explicitly mark
     * as internal dependency.
     * @param inPlaceNormalLibrary - Indicates whether normal libraries should
     * be external or not.
     * @param inPlaceDynamicLibrary - Indicates whether requests with
     * integrated loader configurations should be marked as external or not.
     * @param encoding - Encoding for file names to use during file traversing.
     *
     * @returns A new resolved request indicating whether given request is an
     * external one.
     */
    static determineExternalRequest(request: string, context?: string, requestContext?: string, normalizedGivenInjection?: NormalizedGivenInjection, relativeExternalModuleLocations?: Array<string>, aliases?: Mapping, moduleReplacements?: Replacements, extensions?: Extensions, referencePath?: string, pathsToIgnore?: Array<string>, relativeModuleLocations?: Array<string>, packageEntryFileNames?: Array<string>, packageMainPropertyNames?: Array<string>, packageAliasPropertyNames?: Array<string>, includePattern?: Array<string | RegExp>, excludePattern?: Array<string | RegExp>, inPlaceNormalLibrary?: boolean, inPlaceDynamicLibrary?: boolean, encoding?: Encoding): null | string;
    /**
     * Determines asset type of given file.
     * @param filePath - Path to file to analyse.
     * @param buildConfiguration - Meta informations for available asset
     * types.
     * @param paths - List of paths to search if given path doesn't reference
     * a file directly.
     * @returns Determined file type or "null" of given file couldn't be
     * determined.
     */
    static determineAssetType(filePath: string, buildConfiguration: BuildConfiguration, paths: PathConfiguration): null | string;
    /**
     * Adds a property with a stored array of all matching file paths, which
     * matches each build configuration in given entry path and converts given
     * build configuration into a sorted array were javaScript files takes
     * precedence.
     * @param configuration - Given build configurations.
     * @param entryPath - Path to analyse nested structure.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param mainFileBasenames - File basenames to sort into the front.
     * @returns Converted build configuration.
     */
    static resolveBuildConfigurationFilePaths(configuration: BuildConfiguration, entryPath?: string, pathsToIgnore?: Array<string>, mainFileBasenames?: Array<string>): ResolvedBuildConfiguration;
    /**
     * Determines all file and directory paths related to given internal
     * modules as array.
     * @param givenInjection - List of module ids or module file paths.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of module replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to resolve relative to.
     * @param referencePath - Path to search for local modules.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - File name encoding to use during file traversing.
     * @returns Object with a file path and directory path key mapping to
     * corresponding list of paths.
     */
    static determineModuleLocations(givenInjection: GivenInjection, aliases?: Mapping, moduleReplacements?: Replacements, extensions?: SpecificExtensions, context?: string, referencePath?: string, pathsToIgnore?: Array<string>, relativeModuleLocations?: Array<string>, packageEntryFileNames?: Array<string>, packageMainPropertyNames?: Array<string>, packageAliasPropertyNames?: Array<string>, encoding?: Encoding): {
        directoryPaths: Array<string>;
        filePaths: Array<string>;
    };
    /**
     * Determines a list of concrete file paths for given module id pointing to
     * a folder which isn't a package.
     * @param normalizedGivenInjection - Injection data structure of modules
     * with folder references to resolve.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injections with resolved folder pointing modules.
     */
    static resolveModulesInFolders(normalizedGivenInjection: NormalizedGivenInjection, aliases?: Mapping, moduleReplacements?: Replacements, context?: string, referencePath?: string, pathsToIgnore?: Array<string>): NormalizedGivenInjection;
    /**
     * Every injection definition type can be represented as plain object
     * (mapping from chunk name to array of module ids). This method converts
     * each representation into the normalized plain object notation.
     * @param givenInjection - Given entry injection to normalize.
     * @returns Normalized representation of given entry injection.
     */
    static normalizeGivenInjection(givenInjection: GivenInjection): NormalizedGivenInjection;
    /**
     * Determines all concrete file paths for given injection which are marked
     * with the "__auto__" indicator.
     * @param givenInjection - Given entry and external injection to take
     * into account.
     * @param buildConfigurations - Resolved build configuration.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to use as starting point.
     * @param referencePath - Reference path from where local files should be
     * resolved.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @returns Given injection with resolved marked indicators.
     */
    static resolveAutoInjection<T extends GivenInjectionConfiguration>(givenInjection: T, buildConfigurations: ResolvedBuildConfiguration, aliases?: Mapping, moduleReplacements?: Replacements, extensions?: Extensions, context?: string, referencePath?: string, pathsToIgnore?: Array<string>): T;
    /**
     * Determines all module file paths.
     * @param buildConfigurations - Resolved build configuration.
     * @param moduleFilePathsToExclude - A list of modules file paths to
     * exclude (specified by path or id) or a mapping from chunk names to
     * module ids.
     * @param context - File path to use as starting point.
     * @returns All determined module file paths.
     */
    static getAutoInjection(buildConfigurations: ResolvedBuildConfiguration, moduleFilePathsToExclude: Array<string>, context: string): Mapping;
    /**
     * Determines a resolved module file path in given package path.
     * @param packagePath - Path to package to resolve in.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     * @returns Path if found and / or additional package aliases to consider.
     */
    static determineModuleFilePathInPackage(packagePath: string, packageMainPropertyNames?: Array<string>, packageAliasPropertyNames?: Array<string>, encoding?: Encoding): {
        fileName: null | string;
        packageAliases: Mapping | null;
    };
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @param moduleReplacements - Mapping of replacements to take into
     * account.
     * @param extensions - List of file and module extensions to take into
     * account.
     * @param context - File path to determine relative to.
     * @param referencePath - Path to resolve local modules relative to.
     * @param pathsToIgnore - Paths which marks location to ignore.
     * @param relativeModuleLocations - List of relative file path to search
     * for modules in.
     * @param packageEntryFileNames - List of package entry file names to
     * search for. The magic name "__package__" will search for an appreciate
     * entry in a "package.json" file.
     * @param packageMainPropertyNames - List of package file main property
     * names to search for package representing entry module definitions.
     * @param packageAliasPropertyNames - List of package file alias property
     * names to search for package specific module aliases.
     * @param encoding - Encoding to use for file names during file traversing.
     * @returns File path or given module id if determinations has failed or
     * wasn't necessary.
     */
    static determineModuleFilePath(moduleID: false | string, aliases?: Mapping, moduleReplacements?: Replacements, extensions?: SpecificExtensions, context?: string, referencePath?: string, pathsToIgnore?: Array<string>, relativeModuleLocations?: Array<string>, packageEntryFileNames?: Array<string>, packageMainPropertyNames?: Array<string>, packageAliasPropertyNames?: Array<string>, encoding?: Encoding): null | string;
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param aliases - Mapping of aliases to take into account.
     * @returns The alias applied given module id.
     */
    static applyAliases(moduleID: string, aliases: Mapping): string;
    /**
     * Determines a concrete file path for given module id.
     * @param moduleID - Module id to determine.
     * @param replacements - Mapping of regular expressions to their
     * corresponding replacements.
     * @returns The replacement applied given module id.
     */
    static applyModuleReplacements(moduleID: false | string, replacements: Replacements): false | string;
    /**
     * Determines the nearest package configuration file from given file path.
     * @param start - Reference location to search from.
     * @param fileName - Package configuration file name.
     * @returns Determined file path.
     */
    static findPackageDescriptorFilePath(start: Array<string> | string, fileName?: string): null | string;
    /**
     * Determines the nearest package configuration from given module file
     * path.
     * @param modulePath - Module path to take as reference location (leaf in
     * tree).
     * @param fileName - Package configuration file name.
     * @returns A object containing found parsed configuration an their
     * corresponding file path.
     */
    static getClosestPackageDescriptor(modulePath: string, fileName?: string): null | PackageDescriptor;
}
export default Helper;
