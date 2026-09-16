// #!/usr/bin/env babel-node
// -*- coding: utf-8 -*-
/** @module helper */
'use strict';

/* !
    region header
    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stands under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import { copy, escapeRegularExpressions, extend, importFilesystemAPI, isAnyMatching, isDirectorySync, isFileSync, isPlainObject, Logger, represent, walkDirectoryRecursivelySync } from 'clientnode';
import { existsSync, readFileSync } from 'fs';
import { basename, dirname, extname, join, normalize, resolve, sep, relative } from 'path';
// endregion
await importFilesystemAPI();
// region constants
export const KNOWN_FILE_EXTENSIONS = ['js', 'ts', 'json', 'css', 'eot', 'gif', 'html', 'ico', 'jpg', 'png', 'ejs', 'svg', 'ttf', 'woff', '.woff2'];
export const KNOWN_PATHS_TO_IGNORE = ['.cache', '.claude', '.git', '.github', '.idea', '.yarn'];
export const log = new Logger({
  name: 'weboptimizer.helper'
});
// endregion
// region functions
// region boolean
/**
 * Determines whether given file path is within given list of file locations.
 * @param filePath - Path to file to check.
 * @param locationsToCheck - Locations to take into account.
 * @returns Value "true" if given file path is within one of given locations or
 * "false" otherwise.
 */
export const isFilePathInLocation = (filePath, locationsToCheck) => {
  for (const pathToCheck of locationsToCheck) if (resolve(filePath).startsWith(resolve(pathToCheck))) return true;
  return false;
};
// endregion
// region string
/**
 * Strips loader information form given module request including loader prefix
 * and query parameter.
 * @param moduleID - Module request to strip.
 * @returns Given module id stripped.
 */
export const stripLoader = moduleID => {
  const moduleIDWithoutLoader = moduleID.substring(moduleID.lastIndexOf('!') + 1).replace(/\.webpack\[.+\/.+\]$/, '');
  return moduleIDWithoutLoader.includes('?') ? moduleIDWithoutLoader.substring(0, moduleIDWithoutLoader.indexOf('?')) : moduleIDWithoutLoader;
};
// endregion
// region array
/**
 * Converts given list of path to a normalized list with unique values.
 * @param paths - File paths.
 * @returns The given file path list with normalized unique values.
 */
export const normalizePaths = paths => Array.from(new Set(paths.map(givenPath => {
  givenPath = normalize(givenPath);
  if (givenPath.endsWith('/')) return givenPath.substring(0, givenPath.length - 1);
  return givenPath;
})));
// endregion
// region file handler
/**
 * Applies file path/name placeholder replacements with given bundle associated
 * information.
 * @param template - File path to process placeholder in.
 * @param scope - Scope to use for processing.
 * @returns Processed file path.
 */
export const renderFilePathTemplate = (template, scope = {}) => {
  scope = {
    '[chunkhash]': '.__dummy__',
    '[contenthash]': '.__dummy__',
    '[fullhash]': '.__dummy__',
    '[id]': '.__dummy__',
    '[name]': '.__dummy__',
    ...scope
  };
  let filePath = template;
  for (const [placeholderName, value] of Object.entries(scope)) filePath = filePath.replace(new RegExp(escapeRegularExpressions(placeholderName), 'g'), String(value));
  return filePath;
};
/**
 * Converts given request to a resolved request with given context embedded.
 * @param request - Request to determine.
 * @param context - Context of given request to resolve relative to.
 * @param referencePath - Path to resolve local modules relative to.
 * @param aliases - Mapping of aliases to take into account.
 * @param moduleReplacements - Mapping of replacements to take into account.
 * @param relativeModuleLocations - List of relative directory paths to search
 * for modules in.
 * @returns A new resolved request.
 */
export const applyContext = (request, context = './', referencePath = './', aliases = {}, moduleReplacements = {}, relativeModuleLocations = ['node_modules']) => {
  referencePath = resolve(referencePath);
  if (request.startsWith('./') && resolve(context) !== referencePath) {
    request = resolve(context, request);
    for (const modulePath of relativeModuleLocations) {
      const pathPrefix = resolve(referencePath, modulePath);
      if (request.startsWith(pathPrefix)) {
        request = request.substring(pathPrefix.length);
        if (request.startsWith('/')) request = request.substring(1);
        return applyModuleReplacements(applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
      }
    }
    if (request.startsWith(referencePath)) {
      request = request.substring(referencePath.length);
      if (request.startsWith('/')) request = request.substring(1);
      return applyModuleReplacements(applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
    }
  }
  return request;
};
/**
 * Check if given request points to an external dependency not maintained by
 * current package context.
 * @param request - Request to determine.
 * @param context - Context of current project.
 * @param requestContext - Context of given request to resolve relative to.
 * @param normalizedGivenInjection - Mapping of chunk names to modules which
 * should be injected.
 * @param relativeExternalModuleLocations - Array of paths where external
 * modules take place.
 * @param aliases - Mapping of aliases to take into account.
 * @param moduleReplacements - Mapping of replacements to take into account.
 * @param extensions - List of file and module extensions to take into account.
 * @param referencePath - Path to resolve local modules relative to.
 * @param pathsToIgnore - Paths which marks location to ignore.
 * @param relativeModuleLocations - List of relative file path to search for
 * modules in.
 * @param packageEntryFileNames - List of package entry file names to search
 * for. The magic name "__package__" will search for an appreciate entry in a
 * "package.json" file.
 * @param packageMainPropertyNames - List of package file main property names
 * to search for package representing entry module definitions.
 * @param packageAliasPropertyNames - List of package file alias property names
 * to search for package specific module aliases.
 * @param includePattern - Array of regular expressions to explicitly mark as
 * external dependency.
 * @param excludePattern - Array of regular expressions to explicitly mark as
 * internal dependency.
 * @param inPlaceNormalLibrary - Indicates whether normal libraries should be
 * external or not.
 * @param inPlaceSpecialImports - Indicates whether requests with integrated
 * loader configurations should be marked as external or not.
 * @param encoding - Encoding for file names to use during file traversing.
 * @returns A new resolved request indicating whether given request is an
 * external one.
 */
export const determineExternalRequest = (request, context = './', requestContext = './', normalizedGivenInjection = {}, relativeExternalModuleLocations = ['node_modules'], aliases = {}, moduleReplacements = {}, extensions = {
  file: {
    alias: {
      '.js': ['.js', '.ts', '.tsx', '.jsx']
    },
    external: ['.compiled.js', '.js', '.json'],
    internal: KNOWN_FILE_EXTENSIONS.map(suffix => `.${suffix}`)
  }
}, referencePath = './', pathsToIgnore = KNOWN_PATHS_TO_IGNORE, relativeModuleLocations = ['node_modules'], packageEntryFileNames = ['index', 'main'], packageMainPropertyNames = ['main', 'module'], packageAliasPropertyNames = [], includePattern = [], excludePattern = [], inPlaceNormalLibrary = false, inPlaceSpecialImports = true, encoding = 'utf-8') => {
  context = resolve(context);
  requestContext = resolve(requestContext);
  referencePath = resolve(referencePath);
  // NOTE: We apply alias on externals additionally.
  const resolvedRequest = applyModuleReplacements(applyAliases(request.substring(request.lastIndexOf('!') + 1), aliases), moduleReplacements);
  if (resolvedRequest === false || isAnyMatching(resolvedRequest, excludePattern)) return null;
  /*
      NOTE: Aliases and module replacements doesn't have to be forwarded
      since we pass an already resolved request.
  */
  const filePath = determineModuleFilePath(resolvedRequest, {}, {}, {
    file: extensions.file.external.concat(extensions.file.internal)
  }, context, requestContext, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
  /*
      NOTE: We mark dependencies as external if there file couldn't be
      resolved or are specified to be external explicitly.
  */
  if (!(filePath || inPlaceNormalLibrary) || isAnyMatching(resolvedRequest, includePattern)) return applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleLocations) || null;
  for (const chunk of Object.values(normalizedGivenInjection)) for (const moduleID of chunk) if (determineModuleFilePath(moduleID, aliases, moduleReplacements, {
    file: extensions.file.internal
  }, context, requestContext, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding) === filePath) return null;
  const parts = context.split('/');
  const externalModuleLocations = [];
  while (parts.length > 0) {
    for (const relativePath of relativeExternalModuleLocations) externalModuleLocations.push(join('/', parts.join('/'), relativePath));
    parts.splice(-1, 1);
  }
  /*
      NOTE: We mark dependencies as external if they do not contain a loader
      in their request and aren't part of the current main package or have a
      file extension other than JavaScript aware.
  */
  if (!inPlaceNormalLibrary && (extensions.file.external.length === 0 || filePath && extensions.file.external.includes(extname(filePath)) || !filePath && extensions.file.external.includes('')) && !(inPlaceSpecialImports && request.includes('!')) && (!filePath && inPlaceSpecialImports || filePath && (!filePath.startsWith(context) || isFilePathInLocation(filePath, externalModuleLocations)))) return applyContext(resolvedRequest, requestContext, referencePath, aliases, moduleReplacements, relativeModuleLocations) || null;
  return null;
};
/**
 * Determines asset type of given file.
 * @param filePath - Path to file to analyze.
 * @param buildConfiguration - Meta information for available asset types.
 * @param paths - List of paths to search if given path doesn't reference a
 * file directly.
 * @returns Determined file type or "null" of given file couldn't be
 * determined.
 */
export const determineAssetType = (filePath, buildConfiguration, paths) => {
  let result = null;
  for (const type in buildConfiguration) if (extname(filePath) === `.${buildConfiguration[type].extension}`) {
    result = type;
    break;
  }
  if (!result) for (const type of [paths.source, paths.target]) for (const [assetType, assetConfiguration] of Object.entries(type.asset)) if (assetType !== 'base' && assetConfiguration && filePath.startsWith(assetConfiguration)) return assetType;
  return result;
};
/**
 * Adds a property with a stored array of all matching file paths, which
 * matches each build configuration in given entry path and converts given
 * build configuration into a sorted array were JavaScript files takes
 * precedence.
 * @param configuration - Given build configurations.
 * @param entryPath - Path to analyze nested structure.
 * @param pathsToIgnore - Paths which marks location to ignore.
 * @param mainFileBasenames - File basenames to sort into the front.
 * @returns Converted build configuration.
 */
export const resolveBuildConfigurationFilePaths = (configuration, entryPath = './', pathsToIgnore = KNOWN_PATHS_TO_IGNORE, mainFileBasenames = ['index', 'main']) => {
  const buildConfiguration = [];
  for (const value of Object.values(configuration)) {
    const newItem = extend(true, {
      filePaths: []
    }, value);
    for (const file of walkDirectoryRecursivelySync(entryPath, file => {
      if (isFilePathInLocation(file.path, pathsToIgnore)) return false;
    })) if (file.stats?.isFile() && file.path.endsWith(`.${newItem.extension}`) && !(newItem.ignoredExtension && file.path.endsWith(`.${newItem.ignoredExtension}`)) && !new RegExp(newItem.filePathPattern).test(file.path)) newItem.filePaths.push(file.path);
    newItem.filePaths.sort((firstFilePath, secondFilePath) => {
      if (mainFileBasenames.includes(basename(firstFilePath, extname(firstFilePath)))) {
        if (mainFileBasenames.includes(basename(secondFilePath, extname(secondFilePath)))) return 0;
      } else if (mainFileBasenames.includes(basename(secondFilePath, extname(secondFilePath)))) return 1;
      return 0;
    });
    buildConfiguration.push(newItem);
  }
  return buildConfiguration.sort((first, second) => {
    if (first.outputExtension !== second.outputExtension) {
      if (first.outputExtension === 'js') return -1;
      if (second.outputExtension === 'js') return 1;
      return first.outputExtension < second.outputExtension ? -1 : 1;
    }
    return 0;
  });
};
/**
 * Determines all file and directory paths related to given internal modules as
 * array.
 * @param givenInjection - List of module ids or module file paths.
 * @param aliases - Mapping of aliases to take into account.
 * @param moduleReplacements - Mapping of module replacements to take into
 * account.
 * @param extensions - List of file and module extensions to take into account.
 * @param context - File path to resolve relative to.
 * @param referencePath - Path to search for local modules.
 * @param pathsToIgnore - Paths which marks location to ignore.
 * @param relativeModuleLocations - List of relative file path to search for
 * modules in.
 * @param packageEntryFileNames - List of package entry file names to search
 * for. The magic name "__package__" will search for an appreciate entry in a
 * "package.json" file.
 * @param packageMainPropertyNames - List of package file main property names
 * to search for package representing entry module definitions.
 * @param packageAliasPropertyNames - List of package file alias property names
 * to search for package specific module aliases.
 * @param encoding - File name encoding to use during file traversing.
 * @returns Object with a file path and directory path key mapping to
 * corresponding list of paths.
 */
export const determineModuleLocations = (givenInjection, aliases = {}, moduleReplacements = {}, extensions = {
  file: KNOWN_FILE_EXTENSIONS.map(suffix => `.${suffix}`)
}, context = './', referencePath = '', pathsToIgnore = KNOWN_PATHS_TO_IGNORE, relativeModuleLocations = ['node_modules'], packageEntryFileNames = ['__package__', '', 'index', 'main'], packageMainPropertyNames = ['main', 'module'], packageAliasPropertyNames = [], encoding = 'utf-8') => {
  const filePaths = [];
  const directoryPaths = [];
  const normalizedGivenInjection = resolveModulesInFolders(normalizeGivenInjection(givenInjection), aliases, moduleReplacements, context, referencePath, pathsToIgnore);
  for (const chunk of Object.values(normalizedGivenInjection)) for (const moduleID of chunk) {
    const filePath = determineModuleFilePath(moduleID, aliases, moduleReplacements, extensions, context, referencePath, pathsToIgnore, relativeModuleLocations, packageEntryFileNames, packageMainPropertyNames, packageAliasPropertyNames, encoding);
    if (filePath) {
      filePaths.push(filePath);
      const directoryPath = dirname(filePath);
      if (!directoryPaths.includes(directoryPath)) directoryPaths.push(directoryPath);
    }
  }
  return {
    filePaths,
    directoryPaths
  };
};
/**
 * Determines a list of concrete file paths for given module id pointing to a
 * folder which isn't a package.
 * @param normalizedGivenInjection - Injection data structure of modules with
 * folder references to resolve.
 * @param aliases - Mapping of aliases to take into account.
 * @param moduleReplacements - Mapping of replacements to take into account.
 * @param context - File path to determine relative to.
 * @param referencePath - Path to resolve local modules relative to.
 * @param pathsToIgnore - Paths which marks location to ignore.
 * @returns Given injections with resolved folder pointing modules.
 */
export const resolveModulesInFolders = (normalizedGivenInjection, aliases = {}, moduleReplacements = {}, context = './', referencePath = '', pathsToIgnore = KNOWN_PATHS_TO_IGNORE) => {
  if (referencePath.startsWith('/')) referencePath = relative(context, referencePath);
  const result = copy(normalizedGivenInjection);
  for (const chunk of Object.values(result)) {
    let index = 0;
    for (const moduleID of copy(chunk)) {
      const resolvedModuleID = applyModuleReplacements(applyAliases(stripLoader(moduleID), aliases), moduleReplacements);
      if (resolvedModuleID === false) {
        chunk.splice(index, 1);
        continue;
      }
      const resolvedPath = resolve(referencePath, resolvedModuleID);
      if (isDirectorySync(resolvedPath)) {
        chunk.splice(index, 1);
        for (const file of walkDirectoryRecursivelySync(resolvedPath, file => {
          if (isFilePathInLocation(file.path, pathsToIgnore)) return false;
        })) if (file.stats?.isFile()) chunk.push('./' + relative(context, resolve(resolvedPath, file.path)));
      } else if (resolvedModuleID.startsWith('./') && !resolvedModuleID.startsWith(`./${relative(context, referencePath)}`)) chunk[index] = `./${relative(context, resolvedPath)}`;
      index += 1;
    }
  }
  return result;
};
/**
 * Every injection definition type can be represented as plain object (mapping
 * from chunk name to array of module ids). This method converts each
 * representation into the normalized plain object notation.
 * @param givenInjection - Given entry injection to normalize.
 * @returns Normalized representation of given entry injection.
 */
export const normalizeGivenInjection = givenInjection => {
  let result = {};
  if (Array.isArray(givenInjection)) result = {
    index: givenInjection
  };else if (typeof givenInjection === 'string') result = {
    index: [givenInjection]
  };else if (isPlainObject(givenInjection)) {
    let hasContent = false;
    const chunkNamesToDelete = [];
    for (const [chunkName, chunk] of Object.entries(givenInjection)) if (Array.isArray(chunk)) {
      if (chunk.length > 0) {
        hasContent = true;
        result[chunkName] = chunk;
      } else chunkNamesToDelete.push(chunkName);
    } else {
      hasContent = true;
      result[chunkName] = [chunk];
    }
    if (hasContent) for (const chunkName of chunkNamesToDelete) delete result[chunkName];else result = {
      index: []
    };
  }
  return result;
};
/**
 * Determines all concrete file paths for given injection which are marked with
 * the "__auto__" indicator.
 * @param givenInjection - Given entry and external injection to take into
 * account.
 * @param buildConfigurations - Resolved build configuration.
 * @param aliases - Mapping of aliases to take into account.
 * @param moduleReplacements - Mapping of replacements to take into account.
 * @param extensions - List of file and module extensions to take into account.
 * @param context - File path to use as starting point.
 * @param referencePath - Reference path from where local files should be
 * resolved.
 * @param pathsToIgnore - Paths which marks location to ignore.
 * @returns Given injection with resolved marked indicators.
 */
export const resolveAutoInjection = (givenInjection, buildConfigurations, aliases = {}, moduleReplacements = {}, extensions = {
  file: {
    alias: {
      '.js': ['.js', '.ts', '.tsx', '.jsx']
    },
    external: ['compiled.js', '.js', '.json'],
    internal: KNOWN_FILE_EXTENSIONS.map(suffix => `.${suffix}`)
  }
}, context = './', referencePath = '', pathsToIgnore = KNOWN_PATHS_TO_IGNORE) => {
  const injection = copy(givenInjection);
  const moduleFilePathsToExclude = determineModuleLocations(givenInjection.autoExclude.paths, aliases, moduleReplacements, {
    file: extensions.file.internal
  }, context, referencePath, pathsToIgnore).filePaths;
  for (const name of ['entry', 'external']) {
    const injectionType = injection[name];
    if (isPlainObject(injectionType)) {
      for (let [chunkName, chunk] of Object.entries(injectionType)) if (chunk === '__auto__') {
        chunk = injectionType[chunkName] = [];
        const modules = getAutoInjection(buildConfigurations, moduleFilePathsToExclude, givenInjection.autoExclude.pattern, referencePath);
        for (const subChunk of Object.values(modules)) chunk.push(subChunk);
        /*
            Reverse array to let JavaScript and main files be the
            last ones to export them rather.
        */
        chunk.reverse();
      }
    } else if (injectionType === '__auto__') injection[name] = getAutoInjection(buildConfigurations, moduleFilePathsToExclude, givenInjection.autoExclude.pattern, referencePath);
  }
  return injection;
};
/**
 * Determines all module file paths.
 * @param buildConfigurations - Resolved build configuration.
 * @param moduleFilePathsToExclude - A list of modules file paths to exclude
 * (specified by path or id).
 * @param moduleFilePathPatternToExclude - A list of modules file paths pattern
 * to exclude (specified by path or id).
 * @param context - File path to use as starting point.
 * @returns All determined module file paths.
 */
export const getAutoInjection = (buildConfigurations, moduleFilePathsToExclude, moduleFilePathPatternToExclude, context) => {
  const result = {};
  const injectedModuleIDs = {};
  for (const buildConfiguration of buildConfigurations) {
    if (!Object.prototype.hasOwnProperty.call(injectedModuleIDs, buildConfiguration.outputExtension)) injectedModuleIDs[buildConfiguration.outputExtension] = [];
    for (const moduleFilePath of buildConfiguration.filePaths) if (!(moduleFilePathsToExclude.includes(moduleFilePath) || isAnyMatching(moduleFilePath.substring(context.length), moduleFilePathPatternToExclude))) {
      const relativeModuleFilePath = `./${relative(context, moduleFilePath)}`;
      const directoryPath = dirname(relativeModuleFilePath);
      const baseName = basename(relativeModuleFilePath, `.${buildConfiguration.extension}`);
      let moduleID = baseName;
      if (directoryPath !== '.') moduleID = join(directoryPath, baseName);

      /*
          Ensure that each output type has only one source
          representation.
      */
      if (!injectedModuleIDs[buildConfiguration.outputExtension].includes(moduleID)) {
        /*
            Ensure that same module ids and different output types
            can be distinguished by their extension
            (JavaScript-Modules remains without extension since
            they will be handled first because the build
            configurations are expected to be sorted in this
            context).
        */
        if (Object.prototype.hasOwnProperty.call(result, moduleID)) result[relativeModuleFilePath] = relativeModuleFilePath;else result[moduleID] = relativeModuleFilePath;
        injectedModuleIDs[buildConfiguration.outputExtension].push(moduleID);
      }
    }
  }
  return result;
};
/**
 * Determines a resolved module file path in given package path.
 * @param packagePath - Path to package to resolve in.
 * @param packageMainPropertyNames - List of package file main property names
 * to search for package representing entry module definitions.
 * @param packageAliasPropertyNames - List of package file alias property names
 * to search for package specific module aliases.
 * @param encoding - Encoding to use for file names during file traversing.
 * @returns Path if found and / or additional package aliases to consider.
 */
export const determineModuleFilePathInPackage = (packagePath, packageMainPropertyNames = ['main'], packageAliasPropertyNames = [], encoding = 'utf-8') => {
  const result = {
    fileName: null,
    packageAliases: null
  };
  if (isDirectorySync(packagePath)) {
    const pathToPackageJSON = resolve(packagePath, 'package.json');
    if (isFileSync(pathToPackageJSON)) {
      let localConfiguration = {};
      try {
        localConfiguration = JSON.parse(readFileSync(pathToPackageJSON, {
          encoding
        }));
      } catch (error) {
        log.warn(`Package configuration file "${pathToPackageJSON}"`, `could not parsed: ${represent(error)}`);
      }
      for (const propertyName of packageMainPropertyNames) if (Object.prototype.hasOwnProperty.call(localConfiguration, propertyName) && typeof localConfiguration[propertyName] === 'string' && localConfiguration[propertyName]) {
        result.fileName = localConfiguration[propertyName];
        break;
      }
      for (const propertyName of packageAliasPropertyNames) if (Object.prototype.hasOwnProperty.call(localConfiguration, propertyName) && isPlainObject(localConfiguration[propertyName])) {
        result.packageAliases = localConfiguration[propertyName];
        break;
      }
    }
  }
  return result;
};
/**
 * Determines a concrete file path for given module id.
 * @param moduleID - Module id to determine.
 * @param aliases - Mapping of aliases to take into account.
 * @param moduleReplacements - Mapping of replacements to take into account.
 * @param extensions - List of file and module extensions to take into account.
 * @param context - File path to determine relative to.
 * @param referencePath - Path to resolve local modules relative to.
 * @param pathsToIgnore - Paths which marks location to ignore.
 * @param relativeModuleLocations - List of relative file path to search for
 * modules in.
 * @param packageEntryFileNames - List of package entry file names to search
 * for. The magic name "__package__" will search for an appreciate entry in a
 * "package.json" file.
 * @param packageMainPropertyNames - List of package file main property names
 * to search for package representing entry module definitions.
 * @param packageAliasPropertyNames - List of package file alias property names
 * to search for package specific module aliases.
 * @param encoding - Encoding to use for file names during file traversing.
 * @returns File path or given module id if determinations has failed or wasn't
 * necessary.
 */
export const determineModuleFilePath = (moduleID, aliases = {}, moduleReplacements = {}, extensions = {
  file: KNOWN_FILE_EXTENSIONS.map(suffix => `.${suffix}`)
}, context = './', referencePath = '', pathsToIgnore = KNOWN_PATHS_TO_IGNORE, relativeModuleLocations = ['node_modules'], packageEntryFileNames = ['index'], packageMainPropertyNames = ['main'], packageAliasPropertyNames = [], encoding = 'utf-8') => {
  if (!moduleID) return null;
  moduleID = applyModuleReplacements(applyAliases(stripLoader(moduleID), aliases), moduleReplacements);
  if (!moduleID) return null;
  let moduleFilePath = moduleID;
  if (moduleFilePath.startsWith('./')) moduleFilePath = join(referencePath, moduleFilePath);
  const moduleLocations = [referencePath].concat(relativeModuleLocations.map(filePath => resolve(context, filePath)));
  const parts = context.split('/');
  parts.splice(-1, 1);
  while (parts.length > 0) {
    for (const relativePath of relativeModuleLocations) moduleLocations.push(join('/', parts.join('/'), relativePath));
    parts.splice(-1, 1);
  }
  for (const moduleLocation of [referencePath].concat(moduleLocations)) for (let fileName of ['', '__package__'].concat(packageEntryFileNames)) for (const fileExtension of [''].concat(extensions.file)) {
    let currentModuleFilePath;
    if (moduleFilePath.startsWith('/')) currentModuleFilePath = resolve(moduleFilePath);else currentModuleFilePath = resolve(moduleLocation, moduleFilePath);
    let packageAliases = {};
    if (fileName === '__package__') {
      const result = determineModuleFilePathInPackage(currentModuleFilePath, packageMainPropertyNames, packageAliasPropertyNames, encoding);
      if (result.fileName) fileName = result.fileName;
      if (result.packageAliases) packageAliases = result.packageAliases;
      if (fileName === '__package__') continue;
    }
    const resolvedFileName = applyModuleReplacements(applyAliases(fileName, packageAliases), moduleReplacements);
    if (resolvedFileName === false) continue;
    if (resolvedFileName) currentModuleFilePath = resolve(currentModuleFilePath, `${resolvedFileName}${fileExtension}`);else currentModuleFilePath += `${resolvedFileName}${fileExtension}`;
    if (isFilePathInLocation(currentModuleFilePath, pathsToIgnore)) continue;
    if (isFileSync(currentModuleFilePath)) return currentModuleFilePath;
  }
  return null;
};
// endregion
/**
 * Determines a concrete file path for given module id.
 * @param moduleID - Module id to determine.
 * @param aliases - Mapping of aliases to take into account.
 * @returns The alias applied given module id.
 */
export const applyAliases = (moduleID, aliases) => {
  for (const [name, alias] of Object.entries(aliases)) if (name.endsWith('$')) {
    if (moduleID === name.substring(0, name.length - 1)) moduleID = alias;
  } else if (typeof moduleID === 'string') moduleID = moduleID.replace(name, alias);
  return moduleID;
};
/**
 * Determines a concrete file path for given module id.
 * @param moduleID - Module id to determine.
 * @param replacements - Mapping of regular expressions to their corresponding
 * replacements.
 * @returns The replacement applied given module id.
 */
export const applyModuleReplacements = (moduleID, replacements) => {
  if (moduleID === false) return moduleID;
  for (const [search, replacement] of Object.entries(replacements)) moduleID = moduleID.replace(new RegExp(search), replacement);
  return moduleID;
};
/**
 * Determines the nearest package configuration file from given file path.
 * @param start - Reference location to search from.
 * @param fileName - Package configuration file name.
 * @returns Determined file path.
 */
export const findPackageDescriptorFilePath = (start, fileName = 'package.json') => {
  if (typeof start === 'string') {
    if (!start.endsWith(sep)) start += sep;
    start = start.split(sep);
  }
  if (!start.length) return null;
  start.pop();
  const result = resolve(start.join(sep), fileName);
  try {
    if (existsSync(result)) return result;
  } catch {
    // Continue regardless of an error.
  }
  return findPackageDescriptorFilePath(start, fileName);
};
/**
 * Determines the nearest package configuration from given module file path.
 * @param modulePath - Module path to take as reference location (leaf in
 * tree).
 * @param fileName - Package configuration file name.
 * @returns A object containing found parsed configuration and their
 * corresponding file path.
 */
export const getClosestPackageDescriptor = async (modulePath, fileName = 'package.json') => {
  const filePath = findPackageDescriptorFilePath(modulePath, fileName);
  if (!filePath) return null;

  /*
      NOTE: In native ecma script module contexts JSON imports are wrapped
      into a module namespace object providing its content as "default"
      export whereas commonjs interoperability provides it directly.
  */
  const importedModule = await import(filePath, {
    with: {
      type: 'json'
    }
  });
  const configuration = importedModule.default ?? importedModule;
  /*
      If the package.json does not have a name property, try again from
      one level higher.
  */
  if (!configuration.name) return await getClosestPackageDescriptor(resolve(dirname(filePath), '..'), fileName);
  if (!configuration.version) configuration.version = 'not set';
  return {
    configuration,
    filePath
  };
};
// endregion
