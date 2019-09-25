#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    Provides web api parsers and a simple webserver to offer the prepared data.
'''

# # python3.5
# # pass
from __future__ import absolute_import, division, print_function, \
    unicode_literals
# #

__author__ = 'Torben Sickert'
__copyright__ = 'see module docstring'
__credits__ = 'Torben Sickert',
__license__ = 'see module docstring'
__maintainer__ = 'Torben Sickert'
__maintainer_email__ = 'info["~at~"]torben.website'
__status__ = 'stable'
__version__ = '1.0'

# # python3.5 import builtins
import __builtin__ as builtins
from cgi import FieldStorage as CGIFieldStorage
from collections import Iterable
from copy import copy
import inspect
import os
import sys

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 1 * (os.sep + '..')))

# # python3.5 pass
from boostnode import convert_to_string, convert_to_unicode
from boostnode.extension.file import Handler as FileHandler
from boostnode.extension.native import Dictionary, Module
from boostnode.runnable.template import Parser as TemplateParser
from boostnode.paradigm.objectOrientation import Class

# endregion


# region constants

ROOT_PATH = '/'

# endregion


# region functions

# # region template parser

def template_parser__load_template(self):
    '''Load the given template into ram for rendering.'''
    if self.string:
        self.content = self.template
    else:
        file_extension_suffix = '%s%s' % (
            os.extsep, self.DEFAULT_FILE_EXTENSION)
        path = '%s%s%s' % (ROOT_PATH, (
            self.template.path if builtins.isinstance(
                self.template, FileHandler
            ) else self.template), file_extension_suffix)
        if os.path.isfile(path):
            self.file = FileHandler(
                location='%s%s' % (self.template, file_extension_suffix),
                encoding=self.file_encoding)
        else:
            path = path[:-builtins.len(file_extension_suffix)]
            self.file = FileHandler(
                location=self.template, encoding=self.file_encoding)
        with builtins.open(path, 'r') as file:
            self.content = convert_to_unicode(file.read())
    return self
TemplateParser._load_template = template_parser__load_template


def _template_parser_render_handle_cache(self, mapping):
    '''Handles prerendered templates to support caching.'''
    if self.string:
        template_hash = builtins.str(builtins.hash(self.content))
    else:
        template_hash = self.file.path.replace(os.sep, '_')
    if self.full_caching:
        full_cache_dir_path = '%s%s%s' % (
            ROOT_PATH, self.cache.path, template_hash)
        if not os.path.isdir(full_cache_dir_path):
            os.mkdir(full_cache_dir_path)
        full_cache_file_path = '%s/%s.txt' % (
            full_cache_dir_path, builtins.str(builtins.hash(Dictionary(
                content=mapping
            ).get_immutable(
                exclude=self._builtins.keys() +
                self.keys_to_ignore_for_hashing_by_caching))))
        if os.path.isfile(full_cache_file_path):
            with builtins.open(full_cache_file_path, 'r') as file:
                self._output.content = file.read()
            return self
    cache_file_path = '%s%s%s.py' % (
        ROOT_PATH, self.cache.path, template_hash)
    if os.path.isfile(cache_file_path):
        execfile(cache_file_path, mapping)
    else:
        self.rendered_python_code = self._render_content()
        with builtins.open(cache_file_path, 'w') as file:
            file.write(convert_to_string(
                '# -*- coding: utf-8 -*-\n%s' % self.rendered_python_code))
# # python3.5         builtins.exec(self.rendered_python_code, mapping)
        exec self.rendered_python_code in mapping
    if self.full_caching:
        with builtins.open(full_cache_file_path, 'w') as file:
            file.write(self._output.content)


def template_parser_render(
    self, mapping={}, prevent_rendered_python_code=False, **keywords
):
    '''
        Renders the template. Searches for python code snippets and handles \
        correct indenting. Wraps plain text with a print function.
    '''
    if '<%' not in self.content:
        self.output = self.content
        return self
    '''
        NOTE: We have to copy mapping to avoid changing the mutable default \
        value in this function signature.
    '''
    mapping = copy(mapping)
    mapping.update({'__builtins__': self.builtins})
    mapping.update(keywords)
    if self.cache:
        _template_parser_render_handle_cache(self, mapping)
    else:
        self.rendered_python_code = self._render_content()
        self._run_template(
            prevent_rendered_python_code, template_scope=mapping)
    return self
TemplateParser.render = template_parser_render

# # endregion


# # region file handler

@Class.pseudo_property
def file_handler_get_name(self, *arguments, **keywords):
    '''
        Determines the current file name without directory path. Same \
        possible parameters as native python method "os.path.name()".
    '''
    path = self.get_path(output_with_root_prefix=False)
    if builtins.len(path) and path.endswith(os.sep):
        path = path[:-builtins.len(os.sep)]
    return os.path.basename(path)
FileHandler.get_name = file_handler_get_name

# # endregion

# endregion

# region footer

'''
    Preset some variables given by introspection letting the linter know what \
    globale variables are available.
'''
__logger__ = __exception__ = __module_name__ = __file_path__ = \
    __test_mode__ = __test_buffer__ = __test_folder__ = __test_globals__ = \
    __request_arguments__ = None
'''
    Extends this module with some magic environment variables to provide \
    better introspection support. A generic command line interface for some \
    code preprocessing tools is provided by default.
'''
Module.default(name=__name__, frame=inspect.currentframe())

# endregion

# region vim modline

# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:

# endregion
