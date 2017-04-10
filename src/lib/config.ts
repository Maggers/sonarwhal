/**
 * @fileoverview Loads the configuration file
 * @author Anton Molleda (based on ESLint code: https://github.com/eslint/eslint/blob/master/lib/config/config-file.js)
 */

/* eslint no-use-before-define: 0 */

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

import * as d from 'debug';
const debug = d('sonar:config-file');

import * as path from 'path';

import * as shell from 'shelljs';

import { loadJSFile, loadJSONFile} from './util/file-loader';
import { IConfig } from './interfaces'; //eslint-disable-line no-unused-vars

// ------------------------------------------------------------------------------
// Private
// ------------------------------------------------------------------------------

const CONFIG_FILES = [
    '.sonarrc',
    '.sonarrc.js',
    '.sonarrc.json',
    'package.json'
];

/** Loads a configuration from a package.json file. */
const loadPackageJSONConfigFile = (filePath: string): IConfig => {

    debug(`Loading package.json config file: ${filePath}`);

    try {
        return loadJSONFile(filePath).sonarConfig || null;
    } catch (e) {
        debug(`Error reading package.json file: ${filePath}`);
        e.message = `Cannot read config file: ${filePath}\nError: ${e.message}`;
        throw e;
    }

};

/**
 * Loads a configuration file regardless of the source. Inspects the file path
 * to determine the correctly way to load the config file.
 */
const loadConfigFile = (filePath: string): IConfig => {

    let config;

    switch (path.extname(filePath)) {
        case '':
        case '.json':
            if (path.basename(filePath) === 'package.json') {
                config = loadPackageJSONConfigFile(filePath);
            } else {
                config = loadJSONFile(filePath);
            }
            break;

        case '.js':
            config = loadJSFile(filePath);
            break;

        default:
            config = {};
    }

    return config;

};

/** Loads a configuration file from the given file path. */
export const load = (filePath: string): IConfig => {

    const resolvedPath = path.resolve(process.cwd(), filePath);
    const config = loadConfigFile(resolvedPath);

    if (!config) {
        throw new Error(`Couldn't find any valid configuration`);
    }

    /*
     * If an `extends` property is defined, it represents a configuration file to use as
     * a "parent". Load the referenced file and merge the configuration recursively.
     */
    // if (configOptions.extends) {
    //     configOptions = applyExtends(configOptions, filePath, dirname);
    // }

    // if (configOptions.env && applyEnvironments) {
    //     // Merge in environment-specific globals and parserOptions.
    //     configOptions = ConfigOps.applyEnvironments(configOptions);
    // }

    return config;
};

/**
 * Retrieves the configuration filename for a given directory. It loops over all
 * of the valid configuration filenames in order to find the first one that exists.
 */
export const getFilenameForDirectory = (directory: string): string | null => {

    for (let i = 0, len = CONFIG_FILES.length; i < len; i++) {
        const filename = path.join(directory, CONFIG_FILES[i]);

        if (shell.test('-f', filename)) {
            return filename;
        }
    }

    return null;

};