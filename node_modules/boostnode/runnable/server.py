#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''Provides server and request handler classes.'''

# # python3.5
# # pass
from __future__ import absolute_import, division, print_function, \
    unicode_literals
# #

'''
    For conventions see "boostnode/__init__.py" on \
    https://github.com/thaibault/boostnode
'''

__author__ = 'Torben Sickert'
__copyright__ = 'see boostnode/__init__.py'
__credits__ = 'Torben Sickert',
__license__ = 'see boostnode/__init__.py'
__maintainer__ = 'Torben Sickert'
__maintainer_email__ = 'info["~at~"]torben.website'
__status__ = 'stable'
__version__ = '1.0'

from base64 import b64encode as base64_encode
from base64 import b64decode as base64_decode
# # python3.5
# # import builtins
import __builtin__ as builtins
import BaseHTTPServer as server
import CGIHTTPServer as cgi_http_server
# #
import cgi
# # python3.5
# # from collections import Iterable as NativeIterable
# # from copy import copy, deepcopy
# # from http import server
# # import imp
import Cookie as cookies
from copy import copy, deepcopy
# #
import gzip
# # python3.5 from http import cookies
pass
import inspect
# # python3.5
# # import _io
# # import io
pass
# #
import json
import logging
import multiprocessing
import os
import posixpath
# # python3.5 import socketserver
pass
import ssl
import re as regularExpression
import signal
import socket
import subprocess
import sys
# # python3.5
# # pass
import SocketServer
import StringIO
# #
import threading
import time
# # python3.5
# # from types import FunctionType as Function
# # from types import ModuleType
# # from urllib.parse import urlparse as parse_url
# # from urllib.parse import parse_qs as parse_url_query
# # from urllib.parse import unquote as unquote_url
import urllib
from urlparse import urlparse as parse_url
from urlparse import parse_qs as parse_url_query
from urlparse import unquote as unquote_url
# #

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

# # python3.5
# # from boostnode import ENCODING
from boostnode import ENCODING, convert_to_string, convert_to_unicode
# #
from boostnode.extension.file import Handler as FileHandler
from boostnode.extension.native import Iterable, Dictionary, Module, Object, \
    InstancePropertyInitializer, String
from boostnode.extension.output import Buffer, Print
from boostnode.extension.output import SET_ATTRIBUTE_MODE as \
    SET_OUTPUT_ATTRIBUTE_MODE
from boostnode.extension.output import RESET_ATTRIBUTE_MODE as \
    RESET_OUTPUT_ATTRIBUTE_MODE
from boostnode.extension.output import COLOR as OUTPUT_COLOR
from boostnode.extension.system import CommandLine, Platform, Runnable
# # python3.5 from boostnode.extension.type import Self
pass
from boostnode.paradigm.aspectOrientation import JointPoint
from boostnode.paradigm.objectOrientation import Class

# endregion

# TODO check branches.


# region classes

# # python3.5
# # pass
class SocketFileObjectWrapper(socket._fileobject):

    '''
        This class wraps the native implementation of the server socket. \
        The main goal is that the first line from given socket have to be \
        taken twice. This curious feature is the only way to get the \
        requested file as early as needed to decide if we are able to \
        spawn a new process for better load balancing.
    '''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
    def __init__(self, *arguments, **keywords):
        '''
            This methods wraps the initializer to make the first read \
            line variable instance bounded.
        '''

        # # # region properties

        '''Indicates and saves the first line read of the socket.'''
        self.first_read_line = False

        # # # endregion

        '''Take this method via introspection.'''
        return builtins.getattr(
            builtins.super(self.__class__, self), inspect.stack()[0][3]
        )(*arguments, **keywords)

        # # endregion

    @JointPoint
    def readline(self, *arguments, **keywords):
        '''Wraps the "readline()" method to get the first line twice.'''
        if self.first_read_line is False:
            try:
                '''Take this method via introspection.'''
                self.first_read_line = builtins.getattr(
                    builtins.super(self.__class__, self),
                    inspect.stack()[0][3]
                )(*arguments, **keywords)
                return self.first_read_line
            except(
                socket.herror, socket.gaierror, socket.timeout,
                socket.error
            ) as exception:
                __logger__.info(
                    'Connection interrupted. %s: %s',
                    exception.__class__.__name__, convert_to_unicode(
                        exception))
                return ''
        elif self.first_read_line is True:
            try:
                '''Take this method via introspection.'''
                return builtins.getattr(
                    builtins.super(self.__class__, self),
                    inspect.stack()[0][3]
                )(*arguments, **keywords)
            except(
                socket.herror, socket.gaierror, socket.timeout,
                socket.error
            ) as exception:
                __logger__.info(
                    'Connection interrupted. %s: %s',
                    exception.__class__.__name__, convert_to_unicode(
                        exception))
                return ''
        result = self.first_read_line
        self.first_read_line = True
        return result

        # endregion

    # endregion
# #


# # python3.5
# # class MultiProcessingHTTPServer(
# #     socketserver.ThreadingMixIn, server.HTTPServer
# # ):
class MultiProcessingHTTPServer(
    SocketServer.ThreadingMixIn, server.HTTPServer, builtins.object
):
# #

    '''The Class implements a partial multiprocessing supported web server.'''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> None:
    def __init__(self, *arguments, **keywords):
# #
        '''
            This initializer wrapper makes sure that the special wrapped file \
            socket is instance bounded.
        '''

        # # # region properties

        '''
            This attribute saves the modified read file socket to apply it in \
            the request handler.
        '''
        self.read_file_socket = None

        # # # endregion

        '''Take this method via introspection.'''
        if not __test_mode__:
            return builtins.getattr(
                builtins.super(self.__class__, self), inspect.stack()[0][3]
            )(*arguments, **keywords)

        # # endregion

        # endregion

    @JointPoint
# # python3.5
# #     def is_same_process_request(
# #         self: Self, request: socket.socket
# #     ) -> builtins.bool:
    def is_same_process_request(self, request):
# #
        '''
            Determines if the given request could be run in its own dedicated \
            process.
        '''
        first_request_line = self.read_file_socket.readline(
            Web.MAXIMUM_FIRST_GET_REQUEST_LINE_IN_CHARS
        ).strip()
# # python3.5
# #         if Iterable(self.web.same_process_request_whitelist).is_in_pattern(
# #             value=first_request_line.decode()
# #         ):
        if Iterable(self.web.same_process_request_whitelist).is_in_pattern(
            value=first_request_line
        ):
# #
            return True
        if self.web.same_process_request_blacklist:
# # python3.5
# #             return not Iterable(
# #                 self.web.same_process_request_blacklist
# #             ).is_in_pattern(value=first_request_line.decode())
            return not Iterable(
                self.web.same_process_request_blacklist
            ).is_in_pattern(value=first_request_line)
# #
        return False

    @JointPoint
# # python3.5
# #     def process_request_no_termination_wrapper(
# #         self: Self, parent_function: Function,
# #         request: socket.socket, arguments: builtins.tuple,
# #         keywords: builtins.dict
# #     ) -> None:
    def process_request_no_termination_wrapper(
        self, parent_function, request, arguments, keywords
    ):
# #
        '''
            Wraps the normal "process_request" method. To manage the process \
            forking stuff.
        '''
        try:
            signal_numbers = Platform.termination_signal_numbers
            for signal_number in signal_numbers:
                signal.signal(signal_number, signal.SIG_IGN)
            parent_function(self, request, *arguments, **keywords)
# # python3.5
# #         except(
# #             builtins.BrokenPipeError, socket.gaierror,
# #             socket.herror, socket.timeout, socket.error
# #         ) as exception:
# #             __logger__.info(
# #                 'Connection interrupted. %s: %s',
# #                 exception.__class__.__name__, builtins.str(exception))
        except(
            socket.herror, socket.gaierror, socket.timeout, socket.error
        ) as exception:
            __logger__.info(
                'Connection interrupted. %s: %s',
                exception.__class__.__name__, convert_to_unicode(
                    exception))
# #

    @JointPoint
# # python3.5
# #     def process_request(
# #         self: Self, request_socket: socket.socket,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> None:
    def process_request(self, request_socket, *arguments, **keywords):
# #
        '''
            This method indicates whether the request is a read only or not. \
            Read only requests will be forked if enough free processors are \
            available.
        '''
        if self.web.block_new_worker:
            return None
# # python3.5
# #         self.read_file_socket = request_socket.makefile('rb', -1)
# #         read_file_socket = self.read_file_socket
# #
# #         @JointPoint
# #         def readline(
# #             *arguments: builtins.object, **keywords: builtins.object
# #         ) -> builtins.bytes:
# #             '''Wraps the native file object method version.'''
# #             self = read_file_socket
# #             if not builtins.hasattr(self, 'first_read_line'):
# #                 self.first_read_line = builtins.getattr(
# #                     io.BufferedReader, inspect.stack()[0][3]
# #                 )(self, *arguments, **keywords)
# #                 return self.first_read_line
# #             elif self.first_read_line is True:
# #                 '''Take this method via introspection.'''
# #                 return builtins.getattr(
# #                     io.BufferedReader, inspect.stack()[0][3]
# #                 )(self, *arguments, **keywords)
# #             result = self.first_read_line
# #             self.first_read_line = True
# #             return result
# #         self.read_file_socket.readline = readline
        '''
            This assignment replace the python's native \
            "socket.socket.makefile('rb', -1)" behavior.
        '''
        self.read_file_socket = SocketFileObjectWrapper(
            request_socket, 'rb', -1)
# #
        '''NOTE: We have to add 1 for the server processes itself.'''
        self.web.number_of_running_processes = \
            builtins.len(multiprocessing.active_children()) + 1
        '''Determine this method name via introspection.'''
        parent_function = builtins.getattr(
            server.HTTPServer, inspect.stack()[0][3])
        '''
            NOTE: "self.is_same_process_request()" has to be called, because \
            we expect to read the request head twice from the buffer.
        '''
        if(not self.is_same_process_request(request_socket) and
           self.web.number_of_running_processes <
           self.web.maximum_number_of_processes):
            self.web.number_of_running_processes += 1
            '''Takes this method via introspection from now on.'''
# # python3.5
# #             multiprocessing.Process(
# #                 target=self.process_request_no_termination_wrapper,
# #                 daemon=True,
# #                 args=(parent_function, request_socket, arguments, keywords)
# #             ).start()
            forked_request_process = multiprocessing.Process(
                target=self.process_request_no_termination_wrapper,
                args=(
                    parent_function, request_socket, arguments, keywords))
            forked_request_process.daemon = True
            forked_request_process.start()
# #
        else:
            try:
# # python3.5
# #                 return parent_function(
# #                     self, request_socket, *arguments, **keywords)
# #             except(
# #                 builtins.BrokenPipeError, socket.gaierror, socket.herror,
# #                 socket.timeout, socket.error
# #             ) as exception:
# #                 __logger__.info(
# #                     'Connection interrupted. %s: %s',
# #                     exception.__class__.__name__, builtins.str(exception))
                return parent_function(
                    self, request_socket, *arguments, **keywords)
            except(
                socket.herror, socket.gaierror, socket.timeout,
                socket.error
            ) as exception:
                __logger__.info(
                    'Connection interrupted. %s: %s',
                    exception.__class__.__name__, convert_to_unicode(
                        exception))
# #

    # endregion


class Web(Class, Runnable):

    '''
        Provides a small platform independent web server designed for easily \
        serve a client-server structure.

        **root**                                - Defines the root directory \
                                                  to be served via web.

        **host_name**                           - Defines the current host \
                                                  name. Necessary for https \
                                                  support.

        **port**                                - The port to listen for \
                                                  incoming requests. If "0" \
                                                  given a free port will be \
                                                  determined automatically.

        **default**                             - Defines a default static \
                                                  file, python module or \
                                                  dynamic executable file.

        **key_file**                            - Key file to support a https \
                                                  connection.

        **stop_order**                          - Standard in command to stop \
                                                  server.

        **encoding**                            - Encoding to use for \
                                                  incoming requests and \
                                                  outgoing data.

        **request_whitelist**                   - A whitelist for requests. \
                                                  All requests which doesn't \
                                                  match to one of these will \
                                                  be answered with an 404 \
                                                  error code.

        **request_blacklist**                   - A blacklist for requests to \
                                                  answer with a 404 error code.

        **same_process_request_whitelist**      - Requests which matches one \
                                                  one of theses patterns \
                                                  should be run in same \
                                                  process as the server \
                                                  itself. This is usually \
                                                  necessary if you plan to \
                                                  write in inter thread \
                                                  shared data.

        **same_process_request_blacklist**      - Requests which matches one \
                                                  one of theses patterns \
                                                  could be run in different \
                                                  processes as the server \
                                                  itself. This is usually \
                                                  possible if you not plan to \
                                                  write in inter thread \
                                                  shared data.

        **static_mime_type_pattern**            - Defines which mime types \
                                                  should be interpreted as \
                                                  static.

        **dynamic_mime_type_pattern**           - Defines which mime types \
                                                  should be interpreted as \
                                                  dynamic.

        **compressible_mime_type_pattern**      - Defines which mime types \
                                                  could be returned in a \
                                                  compressed way.

        **default_file_name_pattern**           - Defines file name pattern \
                                                  which should be returned \
                                                  if no explicit file was \
                                                  requested.

        **default_module_names**                - Defines which module names \
                                                  should be ran if no \
                                                  explicit module was \
                                                  requested.

        **authentication**                      - Enables basic http \
                                                  authentication.

        **authentication_file_name**            - Defines file names for \
                                                  saving login data.

        **authentication_file_content_pattern** - Defines how to parse \
                                                  authentication files.

        **authentication_handler**              - A boolean function which \
                                                  decides by given request \
                                                  string and password if \
                                                  requested user is \
                                                  authenticated.

        **module_loading**                      - Enables or disables running \
                                                  python modules which are \
                                                  requested.

        **maximum_number_of_processes**         - Maximum number of used \
                                                  processor cores to use. if \
                                                  "0" is provided a useful \
                                                  number will be determined.

        **shared_data**                         - Data which will be \
                                                  available in every request \
                                                  handler instance and \
                                                  accessible for every common \
                                                  gateway interface script.

        **request_parameter_delimiter**         - Delimiter to distinguish \
                                                  requested file from given \
                                                  parameter.

        **file_size_stream_threshold_in_byte**  - Threshold which will force \
                                                  the server to stream data.

        **directory_listing**                   - Indicates whether the \
                                                  server generates a \
                                                  directory listing for \
                                                  requested directories.

        **internal_redirects**                  - A mapping of request url \
                                                  patterns to corresponding \
                                                  internal version. Regular \
                                                  expression replacements are \
                                                  supported.

        **external_redirects**                  - A mapping of request url \
                                                  patterns to corresponding \
                                                  external version. Regular \
                                                  expression replacements are \
                                                  supported.

        Examples:

        >>> key_file = FileHandler(
        ...     __test_folder__.path + '_initialize_key_file')
        >>> key_file.content = ''
        >>> Web(key_file=key_file) # doctest: +ELLIPSIS
        Object of "Web" with root path "...", port "0" and stop order ...

        >>> Web(
        ...     key_file=__test_folder__.path
        ... ) # doctest: +IGNORE_EXCEPTION_DETAIL
        Traceback (most recent call last):
        ...
        ServerError: Given public key file path "..." ...
    '''

    # region properties

    COMMAND_LINE_ARGUMENTS = (
        {'arguments': ('-r', '--root'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Defines which path is used as web root (default is '
                     'current working directory).',
             'dest': 'root',
             'metavar': 'PATH'}},
        {'arguments': ('-H', '--host-name'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Defines the host to bind the server to. If an empty '
                     'string (default) is given, the underlying socket will '
                     'listen on all network interfaces. E.g. a binding to the'
                     ' internal loop device "localhost" will only accept local'
                     ' requests. This makes sense if a local proxy server is '
                     'configured.',
             'dest': 'host_name',
             'metavar': 'NAME'}},
        {'arguments': ('-p', '--port'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'choices': builtins.range(2 ** 16),
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Defines the port number to access the web server. If '
                     'zero given a free port will be determined.',
             'dest': 'port',
             'metavar': 'NUMBER'}},
        {'arguments': ('-d', '--default'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines which file or module should be requested"
                            ' if nothing was declared explicitly. It could be '
                            """understood as welcome page (default: "%s").'"""
                            " % __initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'default',
             'metavar': 'PATH'}},
        {'arguments': ('-u', '--key-file-path'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines a key file (*.pem) to enable open ssl "
                            '''encryption (default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'key_file',
             'metavar': 'PATH'}},
        {'arguments': ('-o', '--stop-order'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': '"""Saves a cli-command for shutting down the '
                            'server (default: "%s").""" % '
                            '__initializer_default_value__'},
             'dest': 'stop_order',
             'metavar': 'STRING'}},
        {'arguments': ('-w', '--request-whitelist'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Select request type regular expression patterns which '
                     'are only allowed for being interpreted.',
             'dest': 'request_whitelist',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-b', '--request-blacklist'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Select request type regular expression patterns which '
                     "aren't allowed for being interpreted.",
             'dest': 'request_blacklist',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-K', '--known-big-web-mime-types'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'A whitelist of file mime types which should be '
                     'associated with a typical browser extension. This files '
                     'will be send with their respective mime type no matter '
                     'how big they are.',
             'dest': 'known_big_web_mime_types',
             'metavar': 'MIME_TYPES'}},
        {'arguments': ('-I', '--internal-redirects'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Select a mapping (with "#" as delimiter) to redirect '
                     'url suffixes internal.',
             'dest': 'internal_redirects',
             'metavar': 'REGEX_PATTERN#REPLACEMENT'}},
        {'arguments': ('-A', '--external-redirects'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Select a mapping (with "#" as delimiter) to redirect '
                     'url suffixes external.',
             'dest': 'external_redirects',
             'metavar': 'REGEX_PATTERN#REPLACEMENT'}},
        {'arguments': ('-s', '--static-mime-type-pattern'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'All mime-type patterns which should recognize a "
                            'static file. Those files will be directly sent to'
                            ''' client without any preprocessing (default: '''
                            '"%s").\' % \'", "\'.join('
                            "__initializer_default_value__).replace('%', "
                            "'%%')"},
             'dest': 'static_mime_type_pattern',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-y', '--dynamic-mime-type-pattern'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'All mime-type patterns which should recognize a "
                            'dynamic file. Those files will be interpreted so '
                            'the result can be send back to client (default: '
                            '''"%s").' % '", "'.join('''
                            "__initializer_default_value__).replace('%', "
                            "'%%')"},
             'dest': 'dynamic_mime_type_pattern',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-C', '--compressible-mime-type-pattern'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'All mime-type patterns which should compressed "
                            'before sending through network socket (default: "'
                            '''%s").' % '", "'.join('''
                            "__initializer_default_value__).replace('%', "
                            "'%%')"},
             'dest': 'compressible_mime_type_pattern',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-f', '--default-file-name-pattern'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'All file name patterns which should be run if "
                            'there is one present and no other default file '
                            'pattern/name is given on initialisation (default:'
                            ''' "%s").' % '", "'.join('''
                            "__initializer_default_value__).replace('%', "
                            "'%%')"},
             'dest': 'default_file_name_pattern',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-n', '--default-module-name-pattern'),
         'specification': {
             'action': 'store',
             'nargs': '*',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Same as file name for module name patterns. "
                            'Note that default files have a lower priority as '
                            '''default python modules (default: "%s").' % '''
                            """'", "'.join(__initializer_default_value__)"""
                            ".replace('%', '%%')"},
             'dest': 'default_module_names',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-q', '--file-size-stream-threshold-in-byte'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the minimum number of bytes which "
                            'triggers the server to send an octet-stream '
                            '''header to client (default: "%d").' % '''
                            '__initializer_default_value__'},
             'dest': 'file_size_stream_threshold_in_byte',
             'metavar': 'NUMBER'}},
        {'arguments': ('-a', '--authentication'),
         'specification': {
             'action': 'store_true',
             'default': {'execute': '__initializer_default_value__'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': 'Enables basic http authentication. You can control '
                     'this behavior by providing an authentication file in '
                     'directories you want to save.',
             'dest': 'authentication'}},
        {'arguments': ('-e', '--enable-module-loading'),
         'specification': {
             'action': 'store_true',
             'default': False,
             'required': False,
             'help': 'Enables module loading via get query. Enabling this '
                     'feature can slow down your request performance '
                     'extremely. Note that self module loading via "__main__" '
                     'is possible independently.',
             'dest': 'module_loading'}},
        {'arguments': ('-z', '--disable-directory-listing'),
         'specification': {
             'action': 'store_false',
             'default': True,
             'required': False,
             'help': 'Disables automatic directory listing if a directory is '
                     'requested.',
             'dest': 'directory_listing'}},
        {'arguments': ('-g', '--authentication-file-content-pattern'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the regular expression pattern to define"
                            ' how to parse authentication files (default: '
                            '''"%s").' % __initializer_default_value__.'''
                            "replace('%', '%%')"},
             'dest': 'authentication_file_content_pattern',
             'metavar': 'REGEX_PATTERN'}},
        {'arguments': ('-i', '--authentication-file-name-pattern'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the authentication file name (default: "
                            '''"%s").' % __initializer_default_value__.'''
                            "replace('%', '%%')"},
             'dest': 'authentication_file_name',
             'metavar': 'STRING'}},
        {'arguments': ('-j', '--request-parameter-delimiter'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the request delimiter parameter "
                            '''(default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'request_parameter_delimiter',
             'metavar': 'STRING'}},
        {'arguments': ('-E', '--encoding'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Sets encoding for interpreting binary data like "
                            'post or authentication requests, decoding given '
                            "url\\'s or encoding compressed gzip data for "
                            '''clients (default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'encoding',
             'metavar': 'STRING'}},
        {'arguments': ('-k', '--maximum-number-of-processes'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the maximum number of concurrent running"
                            ' processes. If set to zero a useful value '
                            'depending on detected processor will be '
                            '''determined (default: "%d").' % '''
                            '__initializer_default_value__'},
             'dest': 'maximum_number_of_processes',
             'metavar': 'NUMBER'}})
    '''Holds all command line interface argument informations.'''
    HIGHEST_AVAILABLE_PORT = 2 ** 16 - 1
    '''Saves the highest available port to launch server.'''
    DETERMINE_IP_SOCKET = '8.8.8.8', 80
    '''
        Globally accessible socket to ask for currently useful ip determining.
    '''
    DEFAULT_NUMBER_OF_PROCESSES = 8
    '''
        This is the maximum number of forked processes if nothing better was \
        defined or determined.
    '''
    MAXIMUM_FIRST_GET_REQUEST_LINE_IN_CHARS = 65537
    '''This values describes the longest possible first get request line.'''
    STATUS_PREFIX_CODE_LOGGING_COLOR_MAPPING = {
        2: OUTPUT_COLOR['foreground']['green'],
        3: OUTPUT_COLOR['foreground']['blue'],
        4: OUTPUT_COLOR['foreground']['yellow'],
        5: OUTPUT_COLOR['foreground']['red']
    }
    '''Maps a highlighting color to each http status code prefix.'''
    instances = []
    '''Saves all initializes server instances.'''

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
# #
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> repr(Web()) # doctest: +ELLIPSIS
            'Object of "Web" with root path "...", port "0" and sto..."sto...'
        '''
        return (
            'Object of "{class_name}" with root path "{path}", port "{port}" '
            'and stop order "{stop_order}". Number of running '
            'threads/processes: {number_of_running_threads}/'
            '{number_of_running_processes}.'.format(
                class_name=self.__class__.__name__, path=self.root,
                port=self.port, stop_order=self.stop_order,
                number_of_running_threads=self.number_of_running_threads,
                number_of_running_processes=self.number_of_running_processes))

    # # # endregion

    @JointPoint
# # python3.5
# #     def stop(
# #         self: Self, *arguments: builtins.object, force_stopping=False,
# #         **keywords: builtins.object
# #     ) -> Self:
    def stop(self, *arguments, **keywords):
# #
        '''
            Waits for running workers and shuts the server down.

            Arguments and keywords are forwarded to \
            "boostnode.extension.system.Run.stop()".

            Examples:

            >>> web = Web()

            >>> web.stop() # doctest: +ELLIPSIS
            Object of "Web" with root path "...", port "0" and stop order "...

            >>> web.service = True
            >>> web.stop() # doctest: +ELLIPSIS
            Object of "Web" with root path "...", port "0" and stop order "s...
        '''
# # python3.5
# #         pass
        force_stopping, keywords = Dictionary(keywords).pop_from_keywords(
            name='force_stopping', default_value=False)
# #
        if self.__dict__.get('service'):
            self.block_new_worker = True
            # TODO check new branches.
            number_of_running_workers = self.number_of_running_threads + \
                builtins.len(multiprocessing.active_children())
            if force_stopping:
                if number_of_running_workers:
                    __logger__.info(
                        'Enforcing web server child processes to stop.')
                    for worker in multiprocessing.active_children():
                        os.kill(worker.pid, signal.SIGKILL)
                    return self
            else:
                self._stop_graceful(number_of_running_workers)
            if not __test_mode__:
                '''Terminates the serve forever loop.'''
                self.service.shutdown()
                try:
                    '''
                        Tells client site to stop writing data into the socket.
                    '''
                    self.service.socket.shutdown(socket.SHUT_RDWR)
                except socket.error as exception:
# # python3.5
# #                     __logging__.warning(
# #                         'Connection couldn\'t be released on both sites. '
# #                         '%s: %s', exception.__class__.__name__,
# #                         builtins.str(exception))
                    __logging__.warning(
                        'Connection couldn\'t be released on both sites. '
                        '%s: %s', exception.__class__.__name__,
                        convert_to_unicode(exception))
# #
                '''Tells the kernel to free binded port.'''
                self.service.socket.setsockopt(
                    socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                self.service.socket.close()
        '''Take this method type from abstract class via introspection.'''
        return builtins.getattr(
            builtins.super(self.__class__, self), inspect.stack()[0][3]
        )(*arguments, force_stopping=force_stopping, **keywords)

    # # endregion

    # # region protected

    # # # region runnable implementation

    @JointPoint
# # python3.5     def _run(self: Self) -> Self:
    def _run(self):
        '''
            Entry point for command line call of this program. Starts the \
            server's request handler listing for incoming requests.

            Examples:

            >>> sys_argv_backup = copy(sys.argv)
            >>> sys.argv[1:] = ['--port', '8080']

            >>> Web()._run() # doctest: +ELLIPSIS
            Object of "Web" with root path "...", port "8080" and stop order...

            >>> sys.argv[3:] = [
            ...     '--internal-redirects', 'a#b', 'c#dd',
            ...     '--external-redirects', 'ee#f']
            >>> Web()._run() # doctest: +ELLIPSIS
            Object of "Web" with root path "...", port "8080" and stop order...

            >>> Web.run() # doctest: +ELLIPSIS
            Object of "Web" with root path "...", port "8080" and stop order...

            >>> sys.argv = sys_argv_backup
        '''
        command_line_arguments = CommandLine.argument_parser(
            arguments=self.COMMAND_LINE_ARGUMENTS,
            module_name=__name__, scope={'self': self})
        command_line_arguments.internal_redirects = builtins.tuple(
            builtins.map(
                lambda redirect: redirect.split('#'),
                command_line_arguments.internal_redirects))
        command_line_arguments.external_redirects = builtins.tuple(
            builtins.map(
                lambda redirect: redirect.split('#'),
                command_line_arguments.external_redirects))
        return self._initialize(**self._command_line_arguments_to_dictionary(
            namespace=command_line_arguments))

    @JointPoint(InstancePropertyInitializer)
# # python3.5
# #     def _initialize(
# #         self: Self, root=None, host_name='', port=0, default='',
# #         key_file=None, stop_order='stop', encoding=ENCODING,
# #         request_whitelist=('*:/.*',), request_blacklist=(),
# #         same_process_request_whitelist=(),
# #         same_process_request_blacklist=(),
# #         # NOTE: Tuple for explicit web server file reference validation.
# #         # ('text/.+$', 'image/.+$', 'application/(x-)?javascript$')
# #         static_mime_type_pattern=('.+/.+$',),
# #         dynamic_mime_type_pattern=(
# #             'text/x-(python|sh|bash|shellscript)$',),
# #         compressible_mime_type_pattern=(
# #             'text/.+$', 'application/javascript$'),
# #         default_file_name_pattern=(
# #             'index(?!\.(tpl|js)$)(?:\.[a-zA-Z0-9]{0,4})?$',
# #             '(?:index|__main__|main|initialize)(?!\.tpl$)'
# #             '(?:\.[a-zA-Z0-9]{0,4})?$'
# #         default_module_names=('index', '__main__', 'main', 'initialize'),
# #         authentication=True, authentication_file_name='.htpasswd',
# #         authentication_file_content_pattern=
# #             '(?P<name>.+):(?P<password>.+)',
# #         authentication_handler=None, module_loading=None,
# #         maximum_number_of_processes=0, shared_data=None,
# #         request_parameter_delimiter='\?',
# #         file_size_stream_threshold_in_byte=8388608,  # 8 MB
# #         directory_listing=True, internal_redirects=None,
# #         external_redirects=None,
# #         known_big_web_mime_types=('application/x-shockwave-flash',),
# #         **keywords: builtins.object
# #     ) -> Self:
    def _initialize(
        self, root=None, host_name='', port=0, default='',
        key_file=None, stop_order='stop', encoding=ENCODING,
        request_whitelist=('*:/.*',), request_blacklist=(),
        same_process_request_whitelist=(),
        same_process_request_blacklist=(),
        # NOTE: Tuple for explicit web server file reference validation.
        # ('text/.+$', 'image/.+$', 'application/(x-)?javascript$')
        static_mime_type_pattern=('.+/.+$',),
        dynamic_mime_type_pattern=(
            'text/x-(python|sh|bash|shellscript)$',),
        compressible_mime_type_pattern=(
            'text/.+$', '^application/javascript$'),
        default_file_name_pattern=(
            'index(?!\.(tpl|js)$)(?:\.[a-zA-Z0-9]{0,4})?$',
            '(?:index|__main__|main|initialize)(?!\.tpl$)'
            '(?:\.[a-zA-Z0-9]{0,4})?$'
        ), default_module_names=('index', '__main__', 'main', 'initialize'),
        authentication=True, authentication_file_name='.htpasswd',
        authentication_file_content_pattern=
            '(?P<name>.+):(?P<password>.+)',
        authentication_handler=None, module_loading=None,
        maximum_number_of_processes=0, shared_data=None,
        request_parameter_delimiter='\?',
        file_size_stream_threshold_in_byte=8388608,  # 8 MB
        directory_listing=True, internal_redirects=None,
        external_redirects=None,
        known_big_web_mime_types=('application/x-shockwave-flash',),
        **keywords
    ):
# #
        '''
            Sets root path of web server and all properties. Although the \
            server thread will be started.
        '''
        self.__class__.instances.append(self)

        # # # region properties

        if self.internal_redirects is None:
            self.internal_redirects = ()
        if self.external_redirects is None:
            self.external_redirects = ()
        '''Indicates if new worker are currently allowed to spawn.'''
        self.block_new_worker = False
        '''Saves server runtime properties.'''
        self.root = FileHandler(location=self.root)
        self.thread_buffer = Buffer(queue=True)
        '''Saves the number of running threads.'''
        self.number_of_running_threads = 0
        '''Saves the server thread service.'''
        self.service = None
        '''
            Saves the number of running process forked by this server instance.
        '''
        self.number_of_running_processes = 0
        if Platform.operating_system == 'windows':
            self.maximum_number_of_processes = 1
        elif not self.maximum_number_of_processes:
            try:
                self.maximum_number_of_processes = \
                    2 * multiprocessing.cpu_count()
            except builtins.NotImplementedError:
                self.maximum_number_of_processes = \
                    self.DEFAULT_NUMBER_OF_PROCESSES
        '''
            Saves informations how to define authentications in protected \
            directories.
        '''
        if self.key_file:
            self.key_file = FileHandler(location=self.key_file)
            if not self.key_file.is_file():
                raise __exception__(
                    'Given public key file path "%s" doesn\'t points to a '
                    'file.', self.key_file._path)

        # # # endregions

        return self._start_server_thread()

        # # endregion

    @JointPoint
# # python3.5
# #     def _stop_graceful(
# #         self: Self, number_of_running_workers: builtins.int
# #     ) -> Self:
    def _stop_graceful(self, number_of_running_workers):
# #
        '''Waits until all child processes and threads have been terminated.'''
        shown_number = 0
        while number_of_running_workers > 0:
            if(number_of_running_workers !=
               self.number_of_running_threads +
               builtins.len(multiprocessing.active_children())):
                number_of_running_workers = \
                    self.number_of_running_threads + \
                    builtins.len(multiprocessing.active_children())
            if(shown_number != number_of_running_workers and
               number_of_running_workers > 0):
                __logger__.info(
                    'Waiting for %d running workers (%d threads and '
                    '%d processes).', number_of_running_workers,
                    self.number_of_running_threads,
                    builtins.len(multiprocessing.active_children()))
                shown_number = number_of_running_workers
            time.sleep(2)
        __logger__.info('Shutting down web server.')
        self.__class__.instances.remove(self)
        return self

    @JointPoint
# # python3.5     def _start_server_thread(self: Self) -> Self:
    def _start_server_thread(self):
        '''
            Starts the server's request handler instance and listens for \
            shutting-down-command.
        '''
        if self.port:
            self._start_with_static_port()
        else:
            self._start_with_dynamic_port()
        self._log_server_status()
        if not __test_mode__ and self.stop_order:
            self.wait_for_order()
        return self

    @JointPoint
# # python3.5     def _log_server_status(self: Self) -> Self:
    def _log_server_status(self):
        '''Prints some information about the way the server was started.'''
        determine_ip_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        ip = socket.gethostbyname(socket.gethostname())
        if self.host_name == '':
            try:
                determine_ip_socket.connect(self.DETERMINE_IP_SOCKET)
# # python3.5
# #             except(
# #                 builtins.BrokenPipeError, socket.gaierror, socket.herror,
# #                 socket.timeout, socket.error
# #             ) as exception:
            except(
                socket.herror, socket.gaierror, socket.timeout,
                socket.error
            ):
# #
                pass
            else:
                ip = determine_ip_socket.getsockname()[0]
            finally:
                try:
                    determine_ip_socket.shutdown(socket.SHUT_RDWR)
                except socket.error:
                    pass
                determine_ip_socket.close()
        __logger__.info(
            'Web server is starting%s, listens at port "%d" and webroot is '
            '"%s". Currently reachable ip is "%s". Maximum parallel processes '
            'is limited to %d.', (
                ' a secure connection with public key "%s" ' %
                self.key_file._path
            ) if self.key_file else '', self.port, self.root._path,
            ip, self.maximum_number_of_processes)
        return self

    @JointPoint
# # python3.5     def _start_with_dynamic_port(self: Self) -> Self:
    def _start_with_dynamic_port(self):
        '''Searches for the highest free port for listing.'''
        ports = [
            80, 8080, 8008, 8090, 8280, 8887, 9080, 16080, 3128, 4567,
            5000, 4711, 443, 5001, 5104, 5800, 8243, 8888]
        if self.key_file:
            ports = [443] + ports
        ports += builtins.list(builtins.set(
            builtins.range(self.HIGHEST_AVAILABLE_PORT)
        ).difference(ports))
        if not __test_mode__:
            for port in ports:
                try:
                    self._initialize_server_thread(port)
                except socket.error:
                    if port == self.HIGHEST_AVAILABLE_PORT:
# # python3.5
# #                         raise __exception__(
# #                             'No port is available to run the web-server '
# #                             'with given rights.'
# #                         ) from None
                        raise __exception__(
                            'No port is available to run the web-server '
                            'with given rights.')
# #
                else:
                    self.port = port
                    return self
        return self

    @JointPoint
# # python3.5     def _start_with_static_port(self: Self) -> Self:
    def _start_with_static_port(self):
        '''Starts the server listing on the given port, if it is free.'''
        if not __test_mode__:
            try:
                self._initialize_server_thread(port=self.port)
            except socket.error:
# # python3.5
# #                 raise __exception__(
# #                     "Port %d isn't available to run the web-server with "
# #                     'given rights.', self.port
# #                 ) from None
                raise __exception__(
                    "Port %d isn't available to run the web-server with "
                    'given rights.', self.port)
# #
        return self

    @JointPoint
# # python3.5
# #     def _serve_service_forever_exception_catcher(self: Self) -> Self:
    def _serve_service_forever_exception_catcher(self):
# #
        '''
            This method wraps the python's native server "serve_forever()" \
            method to handle incoming exceptions in a separat thread.
        '''
        try:
            return self.service.serve_forever()
# # python3.5
# #         except builtins.ValueError as exception:
# #             __logger__.warning(
# #                 '%s: %s', exception.__class__.__name__,
# #                 builtins.str(exception))
        except socket.error as exception:
            __logger__.warning(
                '%s: %s', exception.__class__.__name__,
                convert_to_unicode(exception))
# #
        return self

    @JointPoint
# # python3.5
# #     def _initialize_server_thread(
# #         self: Self, port: builtins.int
# #     ) -> Self:
    def _initialize_server_thread(self, port):
# #
        '''Initializes a new request-handler and starts its own thread.'''
        self.service = MultiProcessingHTTPServer(
            (self.host_name, port), CGIHTTPRequestHandler)
        if self.key_file:
            self.service.socket = ssl.wrap_socket(
                self.service.socket, certfile=self.key_file._path,
                server_side=True)
        self.service.web = self
# # python3.5
# #         threading.Thread(
# #             target=self._serve_service_forever_exception_catcher,
# #             daemon=True
# #         ).start()
        server_thread = threading.Thread(
            target=self._serve_service_forever_exception_catcher)
        server_thread.daemon = True
        server_thread.start()
# #
        return self

    # # endregion

    # endregion


# # python3.5
# # class CGIHTTPRequestHandler(server.CGIHTTPRequestHandler):
class CGIHTTPRequestHandler(
    cgi_http_server.CGIHTTPRequestHandler, builtins.object
):
# #

    '''
        A small request-handler dealing with incoming file requests. It can \
        directly send static files back to client or run dynamic scripts and \
        give the output back to client.
    '''

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5
# #     def __init__(
# #         self, request_socket: socket.socket,
# #         request_address: builtins.tuple,
# #         server: MultiProcessingHTTPServer, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> None:
# #         '''
# #             This method calls is parent. It's necessary to make some class
# #             properties instance properties.
# #         '''
    def __init__(
        self, request_socket, request_address, server, *arguments,
        **keywords
    ):
# #
        '''
            Initializes all used properties and calls the super method.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server
            ... ) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''

        # # # region properties

        '''Saves current server instance.'''
        self.server = server
        '''Properties defined by incoming request.'''
        self.host = ''
        self.uri = ''
        self.external_uri = ''
        self.parameter = ''
        self.get = {}
        self.data = {}
        self.cookie = {}
        self.type = ''
        self.external_type = ''
        self.data_type = ''
        '''Saves the last started worker thread instance.'''
        self.last_running_worker = None
        '''
            Consists the explicit requested file name (like python's native \
            "self.file") coming from client.
        '''
        self.requested_file_name = ''
        '''References the corresponding file handler to requested file name.'''
        self.requested_file = None
        '''
            Defines whether the handler has decided to run a python module or \
            an external script.
        '''
        self.load_module = False
        '''
            Defines arguments given to a requested file which is running by \
            the server.
        '''
        self.request_arguments = []
        '''Indicates if an answer is expected from the requested file.'''
        self.respond = False
        self.response_sent = self.headers_ended = self.content_type_sent = \
            self.content_length_sent = False
# # python3.5
# #         '''Saves the error message format.'''
# #         self.error_message_format = (
# #             '<!doctype html>\n'
# #             '<html lang="en">\n'
# #             '    <head>\n'
# #             '        <meta charset="{charset}">\n'
# #             '        <meta name="robots" content="noindex, follow" />\n'
# #             '        <meta name="viewport" content="width=device-width, '
# #             'initial-scale=1.0" />\n'
# #             '        <title>Error response</title>\n'
# #             '    </head>\n'
# #             '    <body>\n'
# #             '        <h1>Error response</h1>\n'
# #             '        <p>\n'
# #             '            Error code '
# #             '<span style="color: red">%(code)d</span>.\n'
# #             '        </p>\n'
# #             '        <p>Message:</p>\n'
# #             '        <pre>%(message)s.</pre>\n'
# #             '        <p>Error code explanation: %(code)s</p>\n'
# #             '        <p>%(explain)s.</p>\n'
# #             '    </body>\n'
# #             '</html>').format(charset=self.server.web.encoding.replace(
# #                 '_', '-'))
        '''
            Saves the error message format. NOTE: Has to be a native \
            string to avoid encoding errors in python's native underlying \
            request handler logic.
        '''
        self.error_message_format = convert_to_string(
            '<!doctype html>\n'
            '<html lang="en">\n'
            '    <head>\n'
            '        <meta charset="{charset}">\n'
            '        <meta name="robots" content="noindex, follow" />\n'
            '        <meta name="viewport" content="width=device-width, '
            'initial-scale=1.0" />\n'
            '        <title>Error response</title>\n'
            '    </head>\n'
            '    <body>\n'
            '        <h1>Error response</h1>\n'
            '        <p>\n'
            '            Error code '
            '<span style="color: red">%(code)d</span>.\n'
            '        </p>\n'
            '        <p>Message:</p>\n'
            '        <pre>%(message)s.</pre>\n'
            '        <p>Error code explanation: %(code)s</p>\n'
            '        <p>%(explain)s.</p>\n'
            '    </body>\n'
            '</html>').format(charset=self.server.web.encoding.replace(
                '_', '-'))
# #
        '''Saves the error content type header.'''
# # python3.5
# #         self.error_content_type = 'text/html; charset=%s' % \
# #             self.server.web.encoding.replace('_', '-')
        self.error_content_type = convert_to_string(
            'text/html; charset=%s' % self.server.web.encoding.replace(
                '_', '-'))
# #
        '''
            Saves the self describing server version string. This string is \
            included in every response.
        '''
        self.server_version = '{program} {version} {status}'.format(
            program=String(__module_name__).camel_case_capitalize.content,
            version=__version__, status=__status__)
        '''Saves gziped encoded output.'''
        self._encoded_output = None
        '''
            Points to location which is authoritative to be reachable from \
            requested destination.
        '''
        self._authentication_location = None

        # # # endregion

        if not __test_mode__:
            '''Take this method via introspection.'''
            return builtins.getattr(
                builtins.super(self.__class__, self), inspect.stack()[0][3]
            )(request_socket, request_address, server, *arguments, **keywords)

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Invokes if this object should describe itself by a string.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> repr(CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server
            ... )) # doctest: +SKIP
            'Object of "CGIHTTPRequestHandler" with request uri "" and para...'
        '''
        return 'Object of "{class_name}" with request uri "{url}" and '\
               'parameter "{parameter}".'.format(
                   class_name=self.__class__.__name__, url=self.uri,
                   parameter=self.parameter)

    # # # endregion

    # # # region event

    @JointPoint
# # python3.5     def do_GET(self: Self) -> Self:
    def do_GET(self):
        '''
            Is triggered if an incoming get request is detected. Decides if \
            request is valid and static or dynamic. It also through an \
            exception and sends an http-error if request isn't valid.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/" and param...

            >>> handler.path = ''
            >>> handler.server.web.directory_listing = False
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.server.web.authentication = True
            >>> handler.server.web.authentication_handler = (
            ...     lambda login_data, request_handler: (False, None))
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('key: value'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('key', 'value')
            >>> # #
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String(
            ...             'Authorization: Basic ' +
            ...             base64_encode('hans:hans')
            ...         ), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header(
            ...         'Authorization',
            ...         'Basic ' + base64_encode(b'hans:hans').decode(
            ...             handler.server.web.encoding))
            >>> # #
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('authorization: value'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('authorization', 'value')
            >>> # #
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> handler.path = '/not_existing_file'
            >>> handler.server.web.request_whitelist = '*:/not_existing_file',
            >>> handler.server.web.authentication_handler = (
            ...     lambda login_data, request_handler: (True, None))
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/not_existin...

            >>> file = FileHandler(__test_folder__.path + 'do_GET')
            >>> file.content = ''
            >>> handler.path = '/' + file.name
            >>> handler.server.web.request_whitelist = '*:/%s' % file.name,
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/do_GET" ...

            >>> handler.path = 'not_in_whitlist'
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "not_in_whitl...

            >>> handler.server.web.request_whitelist = '*:/%s' % file.name,
            >>> handler.path = '/do_GET'
            >>> handler.server.web.external_redirects = (('GET:.*', ''),)
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/do_GET" ...

            >>> handler.server.web.request_whitelist = '*:/%s' % file.name,
            >>> handler.path = '/do_GET'
            >>> handler.server.web.external_redirects = (('POST:.*', ''),)
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/do_GET" ...

            >>> handler.server.web.external_redirects = (
            ...     ('*:(.+)', '/\\\\1/'),)
            >>> handler.path = '/do_GET'
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/do_GET" ...

            >>> handler.server.web.internal_redirects = (
            ...     ('*:(.+)', '-:\\\\1/'),)
            >>> handler.path = '/do_GET'
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/do_GET/" ...

            >>> handler.path = __test_folder__.path
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/..." ...

            >>> handler.server.web.internal_redirects = (
            ...     ('*:(.+)', 'PUT:\\\\1/'),)
            >>> handler.path = '/do_GET'
            >>> handler.do_GET() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/do_GET/" ...
        '''
        self.external_type = self.type = self.type if self.type else 'get'
        self.create_environment_variables()
        authentication = self._is_authenticated()
        if authentication[0]:
            valid_request = self._is_valid_request()
            if valid_request:
                if self._handle_redirect():
                    return self
                if self.path:
                    if self._is_valid_reference():
                        return self._set_dynamic_or_static_get(
                            file_name=self.path)
                elif self._default_get():
                    return self
            return self._send_no_file_error(valid_request)
        return self._send_no_authorization_error(output=authentication[1])

    @JointPoint
# # python3.5     def do_POST(self: Self) -> Self:
    def do_POST(self):
        '''
            Is triggered if a post request is coming.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.do_POST() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/" and param...
        '''
        return self._do_data_request(type=inspect.stack()[0][3])

    @JointPoint
# # python3.5     def do_PATCH(self: Self) -> Self:
    def do_PATCH(self):
        '''
            Is triggered if a patch request is coming.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.do_PATCH() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/" and param...
        '''
        return self._do_data_request(type=inspect.stack()[0][3])

    @JointPoint
# # python3.5     def do_DELETE(self: Self) -> Self:
    def do_DELETE(self):
        '''
            Is triggered if a delete request is coming.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.do_DELETE() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/" and param...
        '''
        return self._do_data_request(type=inspect.stack()[0][3])

    @JointPoint
# # python3.5     def do_PUT(self: Self) -> Self:
    def do_PUT(self):
        '''
            Is triggered if a put request is coming.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.do_PUT() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/" and param...
        '''
        return self._do_data_request(type=inspect.stack()[0][3])

    @JointPoint
# # python3.5     def do_HEAD(self: Self) -> Self:
    def do_HEAD(self):
        '''
            Is triggered if a head request is coming.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.do_HEAD() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "/" and param...
        '''
        self.type = inspect.stack()[0][3][builtins.len('do_'):].lower()
        return self.do_GET()

    # # # endregion

    @JointPoint
# # python3.5
# #     def parse_url(self: Self, url=None, strict=False) -> builtins.tuple:
    def parse_url(self, url=None, strict=False):
# #
        '''
            This method provides an easy way to split a http request string \
            into its components.

            **url**    - URL to parse.

            **strict** - Determines whether to parse url with no error \
                         tolerance. Incorrect parameters will be omitted.

            Returns a tuple containing of the parse object and a dictionary \
            containing get parameter.

            >>> sys_argv_backup = copy(sys.argv)
            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.request_parameter_delimiter = '?'
            >>> sys.argv = sys.argv[:1]

            >>> handler.parse_url()
            (None, {})

            >>> sys.argv[1:] = ['hans']
            >>> handler.parse_url() # doctest: +ELLIPSIS
            (ParseResult(...'hans'...), {})

            >>> sys.argv[1:] = ['?hans=peter']
            >>> handler.parse_url() # doctest: +ELLIPSIS
            (ParseResult(..., {'hans': 'peter'})

            >>> sys.argv[1:] = ['?hans=peter&s']
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> handler.parse_url(strict=True) # doctest: +ELLIPSIS
            (ParseResult(...'hans=peter&s'...})
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '... "?hans=peter&s" is not a valid get query string.\\n'

            >>> sys.argv = sys_argv_backup
        '''
        if url is None and builtins.len(sys.argv) > 1:
            url = sys.argv[1]
        if url:
# # python3.5
# #             url = regularExpression.compile(
# #                 self.server.web.request_parameter_delimiter
# #             ).sub('?', url, 1)
# #             parse_result = parse_url(url)
            url = regularExpression.compile(
                self.server.web.request_parameter_delimiter
            ).sub('?', convert_to_unicode(url), 1)
            parse_result = parse_url(convert_to_string(url))
# #
            get = {}
            if parse_result.query:
                try:
# # python3.5
# #                     get = parse_url_query(
# #                         qs=parse_result.query, keep_blank_values=True,
# #                         strict_parsing=strict,
# #                         encoding=self.server.web.encoding,
# #                         errors='replace')
                    get = parse_url_query(
                        qs=parse_result.query, keep_blank_values=True,
                        strict_parsing=strict)
# #
                except builtins.ValueError:
                    __logger__.info(
                        '"%s" is not a valid get query string.', url)
            for key, value in get.items():
# # python3.5
# #                 get[key] = value[0]
                get[convert_to_unicode(key)] = convert_to_unicode(
                    value[0])
# #
            return parse_result, get
        return None, {}

    @JointPoint
# # python3.5
# #     def send_response(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> Self:
    def send_response(self, *arguments, **keywords):
# #
        '''
            Send the given response code to client if no response code was \
            sent yet.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server
            ... ).send_response() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
        if not (self.response_sent or __test_mode__):
            if builtins.len(arguments) > 1 and builtins.isinstance(
                arguments[1], builtins.str
            ):
                arguments = builtins.list(arguments)
                arguments[1] = arguments[1].replace('\n', '\\n')
                arguments = builtins.tuple(arguments)
            self.response_sent = True
            '''Take this method via introspection.'''
            builtins.getattr(
                builtins.super(self.__class__, self), inspect.stack()[0][3]
            )(*arguments, **keywords)
        return self

    @JointPoint
# # python3.5
# #     def send_error(
# #         self: Self, code: builtins.int, message: builtins.str,
# #         *arguments: builtins.object, **keywords: builtins.object
# #     ) -> Self:
    def send_error(self, code, message, *arguments, **keywords):
# #
        '''
            Send the given error to client if no response code was sent yet.

            **code** - Error code to send.
        '''
        if not (self.response_sent or __test_mode__):
            self.content_type_sent = self.content_length_sent = True
            self.send_response(code)
# # python3.5             pass
            message = convert_to_string(message)
            '''Take this method via introspection.'''
            builtins.getattr(
                builtins.super(self.__class__, self), inspect.stack()[0][3]
            )(code, message, *arguments, **keywords)
        return self

    @JointPoint
# # python3.5
# #     def list_directory(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> Self:
    def list_directory(self, *arguments, **keywords):
# #
        '''
            Generates a simple html web page listing requested directory \
            content.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> handler.requested_file = FileHandler()

            >>> handler.list_directory() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and param...
        '''
        path_backup = self.path
        self.path = self.requested_file.path[builtins.len(
            self.server.web.root.path
        ) - builtins.len(os.sep):]
        '''Take this method via introspection.'''
        if not __test_mode__:
            file_handler = builtins.getattr(
                builtins.super(self.__class__, self), inspect.stack()[0][3]
            )(self.requested_file._path, *arguments, **keywords)
            self._send_output(output=file_handler)
        self.path = path_backup
        return self

    @JointPoint
# # python3.5
# #     def end_headers(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> Self:
    def end_headers(self, *arguments, **keywords):
# #
        '''Finishes all sent headers by a trailing new empty line.'''
        if not (self.headers_ended or __test_mode__):
            self.headers_ended = True
            '''Take this method via introspection.'''
            builtins.getattr(
                builtins.super(self.__class__, self), inspect.stack()[0][3]
            )(*arguments, **keywords)
        return self

    @JointPoint
# # python3.5
# #     def send_static_file_cache_header(
# #         self: Self, timestamp=time.time(), response_code=200,
# #         cache_control_header='public, max-age=0', expire_time_in_seconds=0
# #     ) -> Self:
    def send_static_file_cache_header(
        self, timestamp=time.time(), response_code=200,
        cache_control_header='public, max-age=0', expire_time_in_seconds=0
    ):
# #
        '''
            Response a static file-request header.

            **timestamp**              - Timestamp to use as last modified \
                                         time.

            **response_code**          - Response code to send if not sent yet.

            **cache_control_header**   - Cache control header string.

            **expire_time_in_seconds** - Additional time to current timestamp \
                                         for expires header.
        '''
        if not __test_mode__:
            self.send_response(response_code).send_header(
                'Cache-Control', cache_control_header)
            self.send_header('Last-Modified', self.date_time_string(timestamp))
            self.send_header('Expires', self.date_time_string(
                timestamp + expire_time_in_seconds))
        return self

    @JointPoint
# # python3.5
# #     def get_cookie(
# #         self: Self, name=None
# #     ) -> (builtins.str, cookies.SimpleCookie, builtins.type(None)):
    def get_cookie(self, name=None):
# #
        '''
            Retrieves a http cookie.

            **name** - If provided only the matching value will be returned \
                       instead of the whole cookie object.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('hans: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('hans', 'hans')
            >>> # #

            >>> handler.get_cookie() # doctest: +ELLIPSIS

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('Cookie: hans=hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('Cookie', 'hans=hans')
            >>> # #

            >>> handler.get_cookie() # doctest: +ELLIPSIS
            <SimpleCookie: hans='hans'>

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('Cookie: ha/ns=hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('Cookie', 'ha/ns=hans')
            >>> # #

            >>> handler.get_cookie() # doctest: +ELLIPSIS
            <SimpleCookie: hans='hans'>

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...WARNING... - Invalid cookie detected "ha/ns=hans". ...'

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('Cookie: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('Cookie', 'hans')
            >>> # #

            >>> handler.get_cookie() # doctest: +ELLIPSIS
            <SimpleCookie: >

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            ''

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('Cookie: hans='), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('Cookie', 'hans=')
            >>> # #

            >>> handler.get_cookie() # doctest: +ELLIPSIS
            <SimpleCookie: hans=''>

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            ''

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('Cookie: h/a//ns////=ha/ns'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('Cookie', 'h/a//ns////=ha/ns')
            >>> # #

            >>> handler.get_cookie() # doctest: +ELLIPSIS
            <SimpleCookie: hans='ha/ns'>

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...WARNING... - Invalid cookie detected ...'
        '''
# # python3.5         if 'cookie' in self.headers:
        if self.headers.get('cookie'):
            cookie = cookies.SimpleCookie()
# # python3.5
# #             cookie_content = self.headers.get('cookie')
            cookie_content = convert_to_unicode(self.headers.get('cookie'))
# #
            while True:
                try:
# # python3.5
# #                     cookie.load(cookie_content)
                    cookie.load(convert_to_string(cookie_content))
# #
                except cookies.CookieError as exception:
                    new_cookie_content = regularExpression.compile(
                        '([^=]*)/+([^=]*=[^;]*(?:;|$))'
                    ).sub('\\1\\2', cookie_content)
                    if cookie_content == new_cookie_content:
# # python3.5
# #                         __logger__.critical(
# #                             'Invalid cookie detected "%s". %s: %s',
# #                             cookie_content,
# #                             exception.__class__.__name__,
# #                             builtins.str(exception))
                        __logger__.critical(
                            'Invalid cookie detected "%s". %s: %s',
                            cookie_content, exception.__class__.__name__,
                            convert_to_unicode(exception))
# #
                        return None
                    else:
# # python3.5
# #                         __logger__.warning(
# #                             'Invalid cookie detected "%s". %s: %s. Trying '
# #                             '"%s".', cookie_content,
# #                             exception.__class__.__name__,
# #                             builtins.str(exception), new_cookie_content)
                        __logger__.warning(
                            'Invalid cookie detected "%s". %s: %s. '
                            'Trying "%s" .', cookie_content,
                            exception.__class__.__name__,
                            convert_to_unicode(exception),
                            new_cookie_content)
# #
                        cookie_content = new_cookie_content
                else:
                    break
# # python3.5
# #             return cookie[
# #                 name
# #             ].value if name and name in cookie else cookie
            return convert_to_unicode(
                cookie[name].value
            ) if name and name in cookie else cookie
# #
        return None

    @JointPoint
# # python3.5
# #     def send_cookie(
# #         self: Self,
# #         cookie: (cookies.SimpleCookie, builtins.str, builtins.dict),
# #         header='Set-Cookie', maximum_age_in_seconds=60 * 60 * 24 * 7,
# #         version=1, domain='', secure=False, httponly=False, comment='',
# #         path='/', response_code=200
# #     ) -> Self:
    def send_cookie(
        self, cookie, header='Set-Cookie',
        maximum_age_in_seconds=60 * 60 * 24 * 7, version=1, domain='',
        secure=False, httponly=False, comment='', path='/',
        response_code=200
    ):
# #
        '''
            Sends a http cookie.

            **cookie**                 - Cookie object, dictionary or string.

            **header**                 - HTTP Header to use.

            **maximum_age_in_seconds** - Maximum age of given cookie. Default \
                                         is 7 days.

            **version**                - Given cookie version.

            **domain**                 - The domain the cookie should bounded \
                                         to.

            **secure**                 - Indicates whether only secure \
                                         connections should be associated \
                                         with given cookie.

            **httponly**               - Disables JavaScript access to given \
                                         cookie.

            **comment**                - A comment provided for given cookie.

            **path**                   - Web path the cookie should bounded to.

            **response_code**          - Response code to send if not sent yet.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)

            >>> handler.send_cookie('') # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.send_cookie('key=value;a=1') # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.send_cookie({}) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> if sys.version_info.major < 3:
            ...     handler.send_cookie(
            ...         {str('key'): str('value'), str('a'): 1}
            ...     ) # doctest: +ELLIPSIS
            ... else:
            ...     handler.send_cookie({'key': 'value', 'a': 1})
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> cookie = cookies.SimpleCookie()
            >>> if sys.version_info.major < 3:
            ...     cookie[str('key')] = str('value')
            ...     cookie[str('a')] = 1
            ... else:
            ...     cookie['key'] = 'value'
            ...     cookie['a'] = 1
            >>> handler.send_cookie(cookie) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
        if not builtins.isinstance(cookie, cookies.SimpleCookie):
            cookie_object = cookies.SimpleCookie()
# # python3.5
# #             if builtins.isinstance(cookie, builtins.str):
            if builtins.isinstance(cookie, (
                builtins.unicode, builtins.str
            )):
# #
                cookie_object.load(cookie_object)
            else:
                for key, value in cookie.items():
# # python3.5                     cookie_object[key] = value
                    cookie_object[convert_to_string(key)] = value
            cookie = cookie_object
        expires = self.date_time_string(time.time() + maximum_age_in_seconds)
        cookie = regularExpression.compile('^[^:]+: *').sub(
            '', cookie.output()
        ) + (
            ';version="%s";expires=%s;Max-Age=%d;Path=%s;comment=%s;'
            'domain=%s%s%s' % (
                builtins.str(version), expires, maximum_age_in_seconds, path,
                comment, domain, ';secure' if secure else '',
                ';httponly' if httponly else ''))
        if not __test_mode__:
            self.send_response(response_code).send_header(header, cookie)
        return self

    @JointPoint
# # python3.5
# #     def send_content_type_header(
# #         self: Self, mime_type='text/html', encoding=None,
# #         response_code=200
# #     ) -> Self:
    def send_content_type_header(
        self, mime_type='text/html', encoding=None, response_code=200
    ):
# #
        '''
            Sends a content type header to client if not sent yet.

            **mime_type**     - Mime type to send to client.

            **encoding**      - Encoding description to send to client.

            **response_code** - HTTP Response code to send.

            Additional arguments and keywords will be forwarded to \
            "self.send_header()" method.
        '''
        if not (self.content_type_sent or __test_mode__):
            self.content_type_sent = True
            self.send_response(response_code)
            charset = ''
            # TODO check new branch
            if encoding is None:
                charset = '; charset=%s' % self.server.web.encoding.replace(
                    '_', '-')
# # python3.5
# #             elif builtins.isinstance(encoding, builtins.str):
            elif builtins.isinstance(encoding, (
                builtins.unicode, builtins.str
            )):
# #
                charset = '; charset=%s' % encoding.replace('_', '-')
            self.send_header('Content-Type', '%s%s' % (mime_type, charset))
        return self

    @JointPoint
# # python3.5
# #     def send_content_length_header(
# #         self: Self, size: builtins.int, dynamic_output='',
# #         response_code=200
# #     ) -> Self:
    def send_content_length_header(
        self, size, dynamic_output='', response_code=200
    ):
# #
        '''
            Sends the content length header to client if not sent yet.

            **size**           - Content length to send.

            **dynamic_output** - Indicates whether output should be forced to \
                                 compressed because it is simply a computed \
                                 string.

            **response_code**  - HTTP Response code to send.
        '''
        if not (self.content_length_sent or __test_mode__):
            self.content_length_sent = True
            self.send_response(response_code)
            threshold = self.server.web.file_size_stream_threshold_in_byte
# # python3.5
# #             if(size < threshold and
# #                'accept-encoding' in self.headers and
# #                gzip.__name__ in self.headers.get('accept-encoding').split(
# #                    ','
# #                ) and (dynamic_output or Iterable(
# #                    self.server.web.compressible_mime_type_pattern
# #                ).is_in_pattern(value=self.requested_file.mime_type))):
            if(size < threshold and
               self.headers.get('accept-encoding', False) and
               gzip.__name__ in builtins.map(
                   lambda name: convert_to_unicode(name), self.headers.get(
                       'accept-encoding'
                   ).split(',')
               ) and (dynamic_output or Iterable(
                   self.server.web.compressible_mime_type_pattern
               ).is_in_pattern(value=self.requested_file.mime_type))):
# #
                self.send_header('Content-Encoding', gzip.__name__)
                if dynamic_output:
                    self._encoded_output = self._gzip(content=dynamic_output)
                else:
                    self._encoded_output = self._gzip(
                        content=self.requested_file.get_content(mode='rb'))
                self.send_header('Content-Length', builtins.len(
                    self._encoded_output))
            else:
                self.send_header('Content-Length', size)
        return self

    @JointPoint
# # python3.5
# #     def log_message(
# #         self: Self, format: builtins.str,
# #         message_or_error_code: (builtins.int, builtins.str),
# #         response_code_or_message: (builtins.str, builtins.int),
# #         message_end=None
# #     ) -> Self:
    def log_message(
        self, format, message_or_error_code, response_code_or_message,
        message_end=None
    ):
# #
        '''
            Wrapper method for all logging output coming through the server \
            thread.

            **format**                   - Logging format. Allowed \
                                           placeholder are: "client_ip", \
                                           "client_port", \
                                           "request_description", \
                                           "response_code", "forwarded_ip", \
                                           "forwarded_host", \
                                           "forwarded_server", \
                                           "forwarded_server" and \
                                           "server_port".

            **message_or_error_code**    - Logging message or resulting HTTP \
                                           code.

            **response_code_or_message** - Resulting HTTP code or response \
                                           message.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.client_address = '192.168.0.1', 80

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> handler.log_message('', 404, '') # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...404...'

            >>> handler.server.web.__class__.instances = [handler.server.web]
            >>> handler.log_message('', 404, '') # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.log_message('', '', 404) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('key: value'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('key', 'value')
            >>> # #
            >>> handler.log_message('', '', 404) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(String(
            ...         'x-forwarded-for: 192.168.0.1\\n'
            ...         'x-forwarded-host: 192.168.0.1\\n'
            ...         'x-forwarded-server: 192.168.0.1'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header(
            ...         'x-forwarded-for', '192.168.0.1')
            ...     handler.headers.add_header(
            ...         'x-forwarded-host', '192.168.0.1')
            ...     handler.headers.add_header(
            ...         'x-forwarded-server', '192.168.0.1')
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> handler.log_message('', '', 404) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...192.168.0.1:80  -> ...404... - forwarded for: 192.168.0.1 - ...
        '''
        format = (
            '{client_ip}:{client_port} {request_description} -> '
            '%s{response_code}%s')
        forwarded_ip = forwarded_host = forwarded_server = None
        if 'headers' in self.__dict__:
# # python3.5
# #             forwarded_ip = self.headers.get('x-forwarded-for')
# #             forwarded_host = self.headers.get('x-forwarded-host')
# #             forwarded_server = self.headers.get('x-forwarded-server')
            forwarded_ip = self.headers.get('x-forwarded-for')
            forwarded_host = self.headers.get('x-forwarded-host')
            forwarded_server = self.headers.get('x-forwarded-server')
# #
            '''
                NOTE: We habe to save the scope here to forwarded it into the \
                function since it will be determined by introspection.
            '''
            scope = builtins.locals()
            for header_name in builtins.filter(
                lambda header_name: scope[header_name], (
                    'forwarded_ip', 'forwarded_host', 'forwarded_server'
                )
            ):
                scope[header_name] = convert_to_unicode(scope[header_name])
                format += ' - forwarded for: {%s}' % header_name
        if builtins.len(self.server.web.__class__.instances) > 1:
            format += ' (server port: {server_port})'
        request_description = message_or_error_code
        response_code = response_code_or_message
        if builtins.isinstance(message_or_error_code, builtins.int):
            request_description = response_code_or_message
            response_code = message_or_error_code
# # python3.5
# #         if builtins.isinstance(request_description, builtins.bytes):
# #             # TODO check branch
# #             request_description = '...bytes...'
        if builtins.isinstance(request_description, builtins.str):
            try:
                request_description = convert_to_unicode(
                    request_description)
            except builtins.UnicodeDecodeError:
                request_description = '...bytes...'
# #
        color_wrapper = self._determine_logging_color(response_code)
        __logger__.info((format % color_wrapper).format(
            client_ip=self.client_address[0],
            client_port=self.client_address[1],
            request_description=request_description,
            response_code=response_code, forwarded_ip=forwarded_ip,
            forwarded_host=forwarded_host, forwarded_server=forwarded_server,
            server_port=self.server.web.port))
        return self

    @JointPoint
# # python3.5
# #     def setup(
# #         self: Self, *arguments: builtins.object,
# #         **keywords: builtins.object
# #     ) -> None:
    def setup(self, *arguments, **keywords):
# #
        '''
            This method wraps the python's native request handler to provide \
            our wrapped file socket buffer.
        '''
        '''Take this method via introspection.'''
        result = builtins.getattr(
            builtins.super(self.__class__, self), inspect.stack()[0][3]
        )(*arguments, **keywords)
        self.rfile = self.server.web.service.read_file_socket
        return result

    @JointPoint
# # python3.5
# #     def create_environment_variables(self: Self) -> builtins.str:
    def create_environment_variables(self):
# #
        '''Creates all request specified environment-variables.'''
# # python3.5
# #         self._determine_host().uri = self.external_uri = self.path
        self._determine_host().uri = self.external_uri = \
            convert_to_unicode(self.path)
# #
        self._handle_redirect(external=False)
# # python3.5
# #         match = regularExpression.compile(
# #             '[^/]*/+(?P<path>.*?)(?:{delimiter}(?P<parameter>.*))?'.format(
# #                 delimiter=self.server.web.request_parameter_delimiter)
# #         ).fullmatch(self.uri)
        match = regularExpression.compile(
            '[^/]*/+(?P<path>.*?)'
            '(?:{delimiter}(?P<parameter>.*))?$'.format(
                delimiter=self.server.web.request_parameter_delimiter)
        ).match(self.uri)
# #
        self.path = ''
        if match:
# # python3.5
# #             self.path = posixpath.normpath(unquote_url(match.group(
# #                 'path')))
            self.path = convert_to_unicode(posixpath.normpath(unquote_url(
                convert_to_string(match.group('path')))))
# #
            if self.path == '.':
                self.path = ''
            self.parameter = match.group('parameter')
        self.requested_file = FileHandler(
            location=self.server.web.root.path + self.path)
        self._authentication_location = self.server.web.root
        if self.requested_file:
            self._authentication_location = self.requested_file
            if self.requested_file.is_file():
                self._authentication_location = self.requested_file.directory
        cookie_handler = self.get_cookie()
        if cookie_handler is not None:
            for key, morsel in cookie_handler.items():
                self.cookie[key] = morsel.value
        self.get = self.parse_url(self.uri)[1]
# #
        return self.path

    # # endregion

    # # region protected

    # # # region boolean

    @JointPoint
# # python3.5     def _is_authenticated(self: Self) -> builtins.tuple:
    def _is_authenticated(self):
        '''
            Determines whether current request is authenticated via a tuple. \
            First item determines if authentication has success and \
            second item determines html content to send if authentication \
            fails and "None" if nothing should be sent automatically.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler._authentication_location = __test_folder__
            >>> handler._is_authenticated()
            (True, None)

            >>> file = FileHandler(
            ...     __test_folder__.path + '_is_authenticated',
            ...     make_directory=True)
            >>> handler.path = '/' + file.name
            >>> handler.create_environment_variables()
            '_is_authenticated'
            >>> handler._is_authenticated()
            (True, None)

            >>> FileHandler(file.path + '.htpasswd').content = 'login:password'
            >>> handler.path = '/' + file.name
            >>> handler.create_environment_variables()
            '_is_authenticated'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('key: value'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('key', 'value')
            >>> # #
            >>> handler._is_authenticated()
            (False, None)

            >>> handler.server.web.authentication_file_name = ''
            >>> handler._is_authenticated()
            (True, None)

            >>> handler.server.web.authentication = False
            >>> handler._is_authenticated()
            (True, None)
        '''
        if self.server.web.authentication:
            while self.server.web.authentication_file_name:
                file_path = (
                    self._authentication_location.path +
                    self.server.web.authentication_file_name)
                authentication_file = FileHandler(location=file_path)
                if authentication_file:
                    return (
# # python3.5
# #                         self.headers.get('authorization') ==
# #                         'Basic %s' % self._get_login_data(
# #                             authentication_file
# #                         ), None)
                        convert_to_unicode(self.headers.get(
                            'authorization'
                        )) == 'Basic %s' % self._get_login_data(
                            authentication_file
                        ), None)
# #
                if self._authentication_location == self.server.web.root:
                    break
                self._authentication_location = \
                    self._authentication_location.directory
# # python3.5
# #             login_data_match = regularExpression.compile(
# #                 '(?P<name>[^:]+):(?P<password>.+)$'
# #             ).match(base64_decode(
# #                 self.headers.get('authorization', '')[builtins.len(
# #                     'Basic '
# #                 ):]
# #             ).decode(self.server.web.encoding))
            login_data_match = regularExpression.compile(
                '(?P<name>[^:]+):(?P<password>.+)$'
            ).match(base64_decode(self.headers.get(
                'authorization', ''
            )[builtins.len('Basic '):]))
# #
            login_data = None
            if login_data_match:
                login_data = {
                    'name': login_data_match.group('name'),
                    'password': login_data_match.group('password')}
            if self.server.web.authentication_handler is not None:
                return self.server.web.authentication_handler(login_data, self)
        return True, None

    @JointPoint
# # python3.5     def _is_valid_reference(self: Self) -> builtins.bool:
    def _is_valid_reference(self):
        '''
            Checks whether the requested is one of a python module-, static- \
            or dynamic file request. Returns "True" if so and "False" \
            otherwise.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)

            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + '_is_valid_reference')
            >>> handler.path = handler.requested_file.name
            >>> handler._is_valid_reference()
            False

            >>> handler.requested_file.make_directory()
            True
            >>> handler._is_valid_reference()
            True

            >>> handler.requested_file = FileHandler(
            ...     handler.requested_file.path +
            ...     handler.server.web.authentication_file_name)
            >>> handler.requested_file.content = 'hans:hans'
            >>> handler._is_valid_reference()
            False

            >>> handler.requested_file = None
            >>> handler.server.web.module_loading = True
            >>> handler.path = 'doctest'
            >>> handler._is_valid_reference()
            True
        '''
        if((self.server.web.module_loading is True or
            self.server.web.module_loading == self.path) and (
            (self.path == '__main__' and __name__ != '__main__') or
            Module.get_file_path(context_path=self.path))
           ):
            self.load_module = True
            return True
        elif self.requested_file:
            if self._is_valid_requested_file():
                return True
        return False

    @JointPoint
# # python3.5     def _is_valid_requested_file(self: Self) -> builtins.bool:
    def _is_valid_requested_file(self):
        '''Determines if the current requested file points to a valid file.'''
        patterns = self.server.web.dynamic_mime_type_pattern + \
            self.server.web.static_mime_type_pattern
        return (
            self.requested_file.is_file() and self.requested_file.name !=
            self.server.web.authentication_file_name and Iterable(
                patterns
            ).is_in_pattern(
                value=self.requested_file.mime_type
            ) is not False or self.server.web.directory_listing and
            self.requested_file.is_directory())

    @JointPoint
# # python3.5     def _is_dynamic(self: Self) -> builtins.bool:
    def _is_dynamic(self):
        '''
            Determines if the current request points to a dynamic executable \
            file or is a static type which should be send back unmodified.
        '''
        return builtins.bool(self.load_module or Iterable(
            self.server.web.dynamic_mime_type_pattern
        ).is_in_pattern(value=self.requested_file.mime_type))

    # # # endregion

    @JointPoint
# # python3.5
# #     def _determine_logging_color(
# #         self: Self, response_code: builtins.int
# #     ) -> builtins.tuple:
    def _determine_logging_color(self, response_code):
# #
        '''
            Determines a start and stop console escape sequence to mark given \
            http status code with a suitable color.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)

            >>> handler._determine_logging_color(100)
            ('', '')

            >>> handler._determine_logging_color(200) == (
            ...     '\\x1b[32m', '\\x1b[0m')
            True

            >>> handler._determine_logging_color(300) == (
            ...     '\\x1b[34m', '\x1b[0m')
            True

            >>> handler._determine_logging_color(400) == (
            ...     '\\x1b[33m', '\x1b[0m')
            True

            >>> handler._determine_logging_color(500) == (
            ...     '\\x1b[31m', '\\x1b[0m')
            True
        '''
        longest_match = 0
        color_wrapper = '', ''
        for status_code_prefix, output_color in (
            self.server.web.STATUS_PREFIX_CODE_LOGGING_COLOR_MAPPING.items()
        ):
            if longest_match < builtins.len(builtins.str(
                status_code_prefix
            )) and builtins.str(response_code).startswith(builtins.str(
                status_code_prefix
            )):
                color_wrapper = (
                    SET_OUTPUT_ATTRIBUTE_MODE % output_color,
                    SET_OUTPUT_ATTRIBUTE_MODE % RESET_OUTPUT_ATTRIBUTE_MODE)
                longest_match = builtins.len(builtins.str(status_code_prefix))
        return color_wrapper

    @JointPoint
# # python3.5
# #     def _do_data_request(self: Self, type: builtins.str) -> Self:
    def _do_data_request(self, type):
# #
        '''Is triggered if a special request is coming.'''
        self.type = type[builtins.len('do_'):].lower()
# # python3.5
# #         self.data_type, post_data = cgi.parse_header(
# #             self.headers.get_content_type())
        self.data_type, post_data = cgi.parse_header(
            self.headers.gettype())
# #
        content_length = builtins.int(self.headers.get('content-length', 0))
        if not __test_mode__:
            if self.data_type == 'application/x-www-form-urlencoded':
# # python3.5
# #                 self.data = parse_url_query(self.rfile.read(
# #                     content_length
# #                 ).decode(self.server.web.encoding))
                self.data = cgi.parse_qs(
                    self.rfile.read(content_length),
                    keep_blank_values=True)
# #
                for name, value in builtins.filter(
                    lambda item: Object(content=item[1]).is_binary(),
                    self.data.items()
                ):
                    self.data[name] = {'content': value}
            elif self.data_type == 'multipart/form-data':
                self.data = self._determine_data()
            else:
                '''NOTE: We could only ready data once from buffer.'''
                content = self.rfile.read(content_length)
                if self.data_type in ['application/json', 'text/plain']:
                    try:
# # python3.5
# #                         self.data = json.loads(content).decode(
# #                             self.server.web.encoding)
                        self.data = json.loads(
                            content, encoding=self.server.web.encoding)
# #
                    except builtins.ValueError:
                        self.data = {
                            'type': self.data_type, 'content': content}
                else:
                    self.data = {'type': self.data_type, 'content': content}
# # python3.5
# #             pass
            if builtins.isinstance(self.data, builtins.dict):
                self.data = Dictionary(self.data).convert(
                    key_wrapper=lambda key, value: convert_to_unicode(
                        key
                    ) if builtins.isinstance(key, builtins.str) else key,
                    value_wrapper=lambda key, value: convert_to_unicode(
                        value
                    ) if builtins.isinstance(key, builtins.str) else value
                ).content
            else:
                for key, value in builtins.enumerate(self.data):
                    self.data[key] = Dictionary(value).convert(
                        key_wrapper=lambda key, value: convert_to_unicode(
                            key
                        ) if builtins.isinstance(
                            key, builtins.str
                        ) else key, value_wrapper=lambda key, value: \
                        convert_to_unicode(
                            value
                        ) if builtins.isinstance(
                            key, builtins.str
                        ) else value
                    ).content
# #
        return self.do_GET()

    @JointPoint
# # python3.5
# #     def _get_login_data(
# #         self: Self, authentication_file: FileHandler
# #     ) -> builtins.str:
    def _get_login_data(self, authentication_file):
# #
        '''Determines needed login data for current request.'''
        __logger__.info(
            'Use authentication file "%s".', authentication_file._path)
# # python3.5
# #         match = regularExpression.compile(
# #             self.server.web.authentication_file_content_pattern
# #         ).fullmatch(authentication_file.content.strip())
# #         return base64_encode(('%s:%s' % (
# #             match.group('name'), match.group('password')
# #         )).encode(self.server.web.encoding)).decode(
# #             self.server.web.encoding)
        match = regularExpression.compile(
            '(?:%s)$' % self.server.web.authentication_file_content_pattern
        ).match(authentication_file.content.strip())
        return base64_encode(
            '%s:%s' % (match.group('name'), match.group('password')))
# #

    @JointPoint
# # python3.5     def _determine_data(self: Self) -> builtins.dict:
    def _determine_data(self):
        '''
            Determines the post values given by an html form. File uploads \
            are includes as bytes.
        '''
# # python3.5
# #         form = cgi.FieldStorage(
# #             fp=self.rfile, headers=self.headers, keep_blank_values=True,
# #             strict_parsing=True,
# #             environ=self._determine_environment_variables(),
# #             encoding=self.server.web.encoding)
        form = cgi.FieldStorage(
            fp=self.rfile, headers=self.headers, keep_blank_values=True,
            strict_parsing=True,
            environ=self._determine_environment_variables())
# #
        data = {}
        for name in form:
            data[name] = []
            if builtins.hasattr(form[name], 'file') and form[name].filename:
                data[name].append(form[name])
            elif builtins.isinstance(form[name], builtins.list):
                for value in form[name]:
                    if builtins.hasattr(value, 'file') and value.filename:
                        data[name].append(value)
                    else:
                        data[name].append(value.value)
            else:
                data[name].append(form[name].value)
        return data

    @JointPoint
# # python3.5
# #     def _determine_environment_variables(self: Self) -> os._Environ:
    def _determine_environment_variables(self):
# #
        '''
            Determines all needed environment variables needed to determine \
            given post data with cgi module.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('content-type: text/plain'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('content-type', 'text/plain')
            >>> # #
            >>> handler.command = ''

            >>> dict(
            ...     handler._determine_environment_variables()
            ... ) # doctest: +ELLIPSIS
            {'...': '...'}

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(String(
            ...         'accept: text/plain\\nContent-Type: text/plain'
            ...     ), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('accept', 'text/plain')
            >>> # #
            >>> dict(
            ...     handler._determine_environment_variables()
            ... ) # doctest: +ELLIPSIS
            {'...': '...'}

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(String(
            ...         'cookie: hans=peter'
            ...     ), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('cookie', 'hans=peter')
            >>> # #
            >>> dict(
            ...     handler._determine_environment_variables()
            ... ) # doctest: +ELLIPSIS
            {'...': '...'}
        '''
        accept = []
        if 'accept' in self.headers:
            for line in self.headers['accept'].split('\n'):
                accept += line.split(',')
        variables = deepcopy(os.environ)
# # python3.5
# #         variables.update({
# #             'HTTP_ACCEPT': ','.join(accept),
# #             'REQUEST_METHOD': self.command,
# #             'CONTENT_TYPE': self.headers.get_content_type(),
# #             'QUERY_STRING': self.parameter,
# #             'REMOTE_HOST': self.host,
# #             'CONTENT_LENGTH': self.headers.get('content-length', '0'),
# #             'HTTP_USER_AGENT': convert_to_unicode(self.headers.get(
# #                 'user-agent', '')),
# #             'HTTP_COOKIE': convert_to_unicode(self.headers.get(
# #                 'cookie', '')),
# #             'HTTP_REFERER':  convert_to_unicode(self.headers.get(
# #                 'referer', ''))
# #     })
        variables.update({
            'HTTP_ACCEPT': ','.join(accept),
            'REQUEST_METHOD': self.command,
            'CONTENT_TYPE': convert_to_unicode(self.headers.get(
                'content-type', 'text/plain')),
            'QUERY_STRING': self.parameter,
            'REMOTE_HOST': self.host,
            'CONTENT_LENGTH': convert_to_unicode(self.headers.get(
                'content-length', 0)),
            'HTTP_USER_AGENT': convert_to_unicode(self.headers.get(
                'user-agent', '')),
            'HTTP_COOKIE': convert_to_unicode(self.headers.get(
                'cookie', '')),
            'HTTP_REFERER':  convert_to_unicode(self.headers.get(
                'referer', ''))
        })
# #
        for variable_name in variables:
# # python3.5
# #             if variable_name.replace('_', '-').lower() in self.headers:
# #                 variables[variable_name] = self.headers.get(
# #                     variable_name.replace('_', '-').lower())
# #         cookie_content = ', '.join(builtins.filter(
# #             None, self.headers.get_all('cookie', [])))
# #         if cookie_content:
# #             variables['HTTP_COOKIE'] = cookie_content
            if self.headers.get(
                variable_name.replace('_', '-').lower(), False
            ):
                variables[variable_name] = convert_to_unicode(
                    self.headers.get(variable_name.replace(
                        '_', '-').lower()))
# #
        return variables

    @JointPoint
# # python3.5
# #     def _send_no_authorization_error(self: Self, output=None) -> Self:
    def _send_no_authorization_error(self, output=None):
# #
        '''This method is called if authentication failed.'''
        self.send_response(401)
        message = 'You request a protected location'
# # python3.5
# #         if 'authorization' in self.headers:
        if self.headers.get('authorization', False):
# #
            message = 'Requested authentication failed'
        if not __test_mode__:
            self.send_header(
                'WWW-Authenticate', 'Basic realm=\"%s\"' % message)
            self.send_header(
                'Content-Type',
                'text/html; charset=%s' % self.server.web.encoding)
        self.end_headers()
        return self._send_output(output)

    @JointPoint
# # python3.5
# #     def _send_no_file_error(
# #         self: Self, valid_request=True, debug=False
# #     ) -> Self:
    def _send_no_file_error(self, valid_request=True, debug=False):
# #
        '''
            Generates a http-404-error if no useful file was found for \
            responding.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)

            >>> handler.path = '/'
            >>> handler.requested_file = __test_folder__
            >>> handler._send_no_file_error(debug=True) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.server.web.module_loading = ''
            >>> handler._send_no_file_error(debug=True) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.server.web.module_loading = True
            >>> handler._send_no_file_error(debug=True) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.path = ''
            >>> handler._send_no_file_error(debug=True) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + '_send_no_file_error')
            >>> handler.requested_file.content = ''
            >>> handler._send_no_file_error(
            ...     False, debug=True
            ... ) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
        error_message = 'Requested file not found'
        if __logger__.isEnabledFor(logging.DEBUG) or sys.flags.debug or debug:
            error_message = (
                'Eather none of the following default module names "%s" nor '
                'none of the following default file name pattern "%s" found' %
                ('", "'.join(self.server.web.default_module_names),
                 '", "'.join(self.server.web.default_file_name_pattern)))
            if builtins.isinstance(
                self.server.web.module_loading, builtins.str
            ):
                error_message = (
                    'Eather default module name "%s" nor none of the following'
                    ' default file name pattern "%s" found' % (
                        self.server.web.module_loading, '", "'.join(
                            self.server.web.default_file_name_pattern)))
            elif not self.server.web.module_loading:
                error_message = (
                    'None of the following default file name pattern "%s" '
                    'found' % '", "'.join(
                        self.server.web.default_file_name_pattern))
            if self.path:
                error_message = ('No accessible file "%s" found' % FileHandler(
                    location=self.server.web.root.path + self.path
                )._path)
            if not valid_request:
                error_message = (
                    "Given request isn't valid. Check your white- and "
                    'blacklists')
            if self.requested_file.is_file():
                error_message += \
                    '. Detected mime-type "%s"' % self.requested_file.mime_type
        self.send_error(404, regularExpression.compile('\n+').sub(
            '\n', error_message))
        return self

    @JointPoint
# # python3.5     def _is_valid_request(self: Self) -> builtins.bool:
    def _is_valid_request(self):
        '''Checks if given request fulfills all restrictions.'''
        return self._request_in_pattern_list(
            self.server.web.request_whitelist
        ) and not self._request_in_pattern_list(
            self.server.web.request_blacklist)

    @JointPoint
# # python3.5
# #     def _request_in_pattern_list(
# #         self: Self, pattern_list: NativeIterable
# #     ) -> builtins.bool:
    def _request_in_pattern_list(self, pattern_list):
# #
        '''Checks if current request matches on of the given pattern.'''
# # python3.5
# #         patterns = regularExpression.compile(
# #             '(?P<type>.+?):(?P<uri>.*)')
        patterns = regularExpression.compile(
            '^(?P<type>.+?):(?P<uri>.*)$')
# #
        type_uppercase = self.external_type.upper()
        for pattern in pattern_list:
# # python3.5             match = patterns.fullmatch(pattern)
            match = patterns.match(pattern)
            types = match.group('type').split('|')
# # python3.5
# #             if(type_uppercase in types or
# #                '*' in types
# #                ) and regularExpression.compile(match.group(
# #                    'uri'
# #                )).fullmatch(self.external_uri) is not None:
            if(type_uppercase in types or
               '*' in types
               ) and regularExpression.compile('(?:%s)$' % match.group(
                   'uri'
               )).match(self.external_uri) is not None:
# #
                return True
        return False

    @JointPoint
# # python3.5     def _determine_host(self: Self) -> Self:
    def _determine_host(self):
        '''
            Determines the full host name with port included (if it's not \
            "80").

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.server.web.host_name = 'test'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(String(
            ...         'test: hans'
            ...     ), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.server.web.port = 80
            >>> handler._determine_host() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> handler.host
            'test'

            >>> handler.server.web.port = 8080
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(String(
            ...         'accept: text/plain'
            ...     ), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('accept', 'text/plain')
            >>> # #
            >>> handler._determine_host() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> handler.host
            'test:8080'

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('x-forwarded-host: hans\\nHost: hans'),
            ...         seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('x-forwarded-host', 'hans')
            ...     handler.headers.add_header('host', 'hans')
            >>> # #
            >>> handler._determine_host() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> handler.host
            'hans'

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('Host: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('host', 'hans')
            >>> # #
            >>> handler._determine_host() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> handler.host
            'hans'
        '''
        self.host = self.server.web.host_name
        if self.server.web.port != 80:
            self.host += ':%d' % self.server.web.port
# # python3.5
# #         if 'x-forwarded-host' in self.headers:
# #             self.host = self.headers.get('x-forwarded-host')
# #         elif 'host' in self.headers:
# #             self.host = self.headers.get('host')
        if self.headers.get('x-forwarded-host', False):
            self.host = convert_to_unicode(self.headers.get(
                'x-forwarded-host'))
        elif self.headers.get('host', False):
            self.host = convert_to_unicode(self.headers.get('host'))
# #
        return self

    @JointPoint
# # python3.5
# #     def _handle_redirect(self: Self, external=True) -> builtins.bool:
    def _handle_redirect(self, external=True):
# #
        '''
            Deals with specified redirects. External Redirects will send an \
            http redirection code.
        '''
# # python3.5
# #         patterns = regularExpression.compile(
# #             '(?P<type>.+?):(?P<uri>.*)')
        patterns = regularExpression.compile(
            '(?P<type>.+?):(?P<uri>.*)$')
# #
        type_uppercase = self.type.upper()
        redirects = self.server.web.internal_redirects
        if external:
            redirects = self.server.web.external_redirects
        for source, target in redirects:
# # python3.5             source_match = patterns.fullmatch(source)
            source_match = patterns.match(source)
            types = source_match.group('type').split('|')
# # python3.5
# #             pattern = regularExpression.compile(source_match.group('uri'))
# #             if(type_uppercase in types or
# #                '*' in types
# #                ) and pattern.fullmatch(
# #                    self.external_uri) is not None:
            pattern = regularExpression.compile(
                '(?:%s)$' % source_match.group('uri'))
            if(type_uppercase in types or
               '*' in types
               ) and pattern.match(self.external_uri) is not None:
# #
                self._handle_matched_redirect(
                    pattern, patterns, target, external)
                return True
        return False

    @JointPoint
# # python3.5
# #     def _handle_matched_redirect(
# #         self: Self, pattern: builtins.type(regularExpression.compile('')),
# #         patterns: builtins.type(regularExpression.compile('')),
# #         target: builtins.str, external: builtins.bool
# #     ) -> Self:
    def _handle_matched_redirect(
        self, pattern, patterns, target, external
    ):
# #
        '''Performs an internal or external redirect.'''
        if external:
            if not __test_mode__:
                self.external_uri = pattern.sub(target, self.external_uri)
                self.send_response(301).send_header(
                    'Location', self.external_uri)
                self.end_headers()
        else:
            target_match = patterns.match(target)
            if target_match.group('type') != '-':
                self.type = target_match.group('type')
            for request in target_match.group('uri').split('#'):
                self.uri = pattern.sub(
                    request, self.external_uri
                ).format(host_name=regularExpression.compile(':[0-9]+$').sub(
                    '', self.host))
                if FileHandler(location=self.uri):
                    break
        return self

    @JointPoint
# # python3.5
# #     def _set_dynamic_or_static_get(
# #         self: Self, file_name: builtins.str
# #     ) -> Self:
    def _set_dynamic_or_static_get(self, file_name):
# #
        '''
            Makes a dynamic or static respond depending on incoming request.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler.load_module = True
            >>> handler._set_dynamic_or_static_get('test') # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
        self.requested_file_name = file_name
        if self._is_dynamic():
            return self._dynamic_get()
        return self._static_get()

    @JointPoint
# # python3.5     def _default_get(self: Self) -> builtins.bool:
    def _default_get(self):
        '''
            Handles every request which doesn't takes a file or python module \
            with.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('cookie: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('cookie', 'hans')
            >>> # #

            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + 'index.py')
            >>> handler.requested_file.content = ''
            >>> handler._default_get()
            True

            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('cookie: hans=peter'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('cookie', 'hans=peter')
            >>> # #

            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + 'index.py')
            >>> handler.requested_file.content = ''
            >>> handler._default_get()
            True

            >>> handler.server.web.directory_listing = False
            >>> handler.requested_file.remove_file()
            True
            >>> handler._default_get()
            False

            >>> handler.server.web.module_loading = True
            >>> handler.server.web.default = 'doctest'
            >>> handler._default_get()
            True

            >>> handler.server.web.default = ''
            >>> handler.server.web.default_module_names = 'doctest',
            >>> handler.data['__no_respond__'] = True
            >>> handler.respond = False
            >>> handler._default_get()
            True
        '''
        if self.server.web.default:
            self._handle_given_default_get()
            return True
        if(self.server.web.module_loading and
           self._is_default_module_requested()):
            return True
        for pattern in self.server.web.default_file_name_pattern:
# # python3.5
# #             for file in builtins.filter(
# #                 lambda file: regularExpression.compile(
# #                     '(?:%s)$' % pattern
# #                 ).fullmatch(file.name), self.server.web.root.list()
# #             ):
            for file in builtins.filter(
                lambda file: regularExpression.compile(
                    '(?:%s)$' % pattern
                ).match(file.name), self.server.web.root.list()
            ):
# #
                self.requested_file = file
                self._set_dynamic_or_static_get(file_name=file.name)
                return True
        if self.server.web.directory_listing:
            self._static_get()
            return True
        return False

    @JointPoint
# # python3.5
# #     def _is_default_module_requested(self: Self) -> builtins.bool:
    def _is_default_module_requested(self):
# #
        '''
            Handle a default module request if possible.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler._is_default_module_requested()
            False

            >>> handler.server.web = Web(
            ...     __test_folder__, module_loading='doctest')
            >>> handler._is_default_module_requested()
            True
        '''
        if self.server.web.module_loading:
# # python3.5
# #             if builtins.isinstance(
# #                 self.server.web.module_loading, builtins.str
# #             ) and self._handle_default_modules_get(
# #                 self.server.web.module_loading
# #             ):
            if builtins.isinstance(
                self.server.web.module_loading, builtins.unicode
            ) and self._handle_default_modules_get(
                self.server.web.module_loading
            ):
# #
                return True
            for module_name in self.server.web.default_module_names:
                if self._handle_default_modules_get(module_name):
                    return True
        return False

    @JointPoint
# # python3.5
# #     def _handle_default_modules_get(
# #         self: Self, module_name: builtins.str
# #     ) -> (Self, builtins.bool):
    def _handle_default_modules_get(self, module_name):
# #
        '''
            Handles requests which wants the current defaults modules \
            (initially called module) run for a server thread.

            Examples:

            >>> test_globals_backup = __test_globals__['__name__']

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('test: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('test', 'hans')
            >>> # #

            >>> handler._handle_default_modules_get('not_existing')
            False

            >>> handler._handle_default_modules_get('__main__')
            False

            >>> __test_globals__['__name__'] = __module_name__
            >>> handler._handle_default_modules_get(
            ...     '__main__'
            ... ) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and param...

            >>> __test_globals__['__name__'] = test_globals_backup
        '''
        if module_name == '__main__':
            if __name__ != '__main__':
                self.load_module = True
                return self._set_dynamic_or_static_get(file_name=module_name)
        elif Module.get_file_path(context_path=module_name):
            self.load_module = True
            return self._set_dynamic_or_static_get(file_name=module_name)
        return False

    @JointPoint
# # python3.5     def _handle_given_default_get(self: Self) -> Self:
    def _handle_given_default_get(self):
        '''
            Handles request with no explicit file or module to run.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.path = '/'
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String('cookie: hans'), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header('cookie', 'hans')
            >>> # #

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> handler._handle_given_default_get() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...Determine "" as default file...'

            >>> handler.server.web.module_loading = True
            >>> handler.server.web.default = 'doctest'
            >>> handler._handle_given_default_get() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...Determine "doctest" as default module...'
        '''
        if((self.server.web.module_loading is True or
            self.server.web.module_loading == self.server.web.default) and
           Module.get_file_path(context_path=self.server.web.default)):
            self.load_module = True
            __logger__.info(
                'Determine "%s" as default module.', self.server.web.default)
        self.requested_file = FileHandler(
            location=self.server.web.root.path + self.server.web.default)
        if self.requested_file:
            __logger__.info(
                'Determine "%s" as default file.', self.server.web.default)
        return self._set_dynamic_or_static_get(
            file_name=self.server.web.default)

    @JointPoint
# # python3.5     def _static_get(self: Self) -> Self:
    def _static_get(self):
        '''
            Handles a static file-request.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + '_static_get')
            >>> handler.requested_file.content = ''
            >>> # # python2.7
            >>> if sys.version_info.major < 3:
            ...     handler.headers = handler.MessageClass(
            ...         String(
            ...             'if-modified-since: %s' % handler.date_time_string(
            ...                 int(handler.requested_file.timestamp))
            ...         ), seekable=False)
            ... else:
            ...     handler.headers = handler.MessageClass()
            ...     handler.headers.add_header(
            ...         'if-modified-since', handler.date_time_string(
            ...             int(handler.requested_file.timestamp)))
            >>> # #

            >>> handler._static_get() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
        if not __test_mode__ and self.requested_file.is_directory():
            if self.data_type == 'multipart/form-data':
                self._save_uploaded_files()
            '''
                If a directory was requested and no trailing slash where \
                given a 301 redirect will be returned to same request with \
                trailing slash.
            '''
            if not regularExpression.compile(
                '/(%s.*)?$' % self.server.web.request_parameter_delimiter
            ).search(self.external_uri):
                self.send_response(301).send_header(
                    'Location', regularExpression.compile(
                        '((%s.*)?)$' %
                        self.server.web.request_parameter_delimiter
                    ).sub('/\\1', self.external_uri))
                return self.end_headers()
            return self.list_directory()
        try:
            file_handler = builtins.open(self.requested_file._path, mode='rb')
        except builtins.IOError:
            self._send_no_file_error()
            return self
# # python3.5
# #         if(self.headers.get('if-modified-since') ==
# #            self.date_time_string(
# #                builtins.int(self.requested_file.timestamp))):
        if(self.headers.get('if-modified-since') ==
           self.date_time_string(
               builtins.int(self.requested_file.timestamp))):
# #
            return self._send_not_modified_header()
        return self._send_static_file(output=file_handler)

    @JointPoint
# # python3.5     def _save_uploaded_files(self: Self) -> Self:
    def _save_uploaded_files(self):
        '''
            Uploaded data to a directory are saved automatically by this \
            method.
        '''
        for items in self.data.values():
            for item in items:
# # python3.5
# #                 if(builtins.len(item) == 4 and
# #                    'content' in item and 'name' in item and
# #                    'disposition' in item and 'disposition' in item and
# #                    'encoding' in item):
# #                     FileHandler(
# #                         self.requested_file.path + item['name'],
# #                         encoding=item['encoding']
# #                     ).set_content(content=item['content'], mode='w+b')
                if(builtins.len(item) == 3 and
                   'content' in item and 'name' in item and
                   'disposition' in item):
                    FileHandler(
                        self.requested_file.path + item['name']
                    ).set_content(content=item['content'], mode='w+b')
# #
        return self

    @JointPoint
# # python3.5
# #     def _send_static_file(
# #         self: Self, output: (builtins.str, _io.BufferedReader)
# #     ) -> Self:
    def _send_static_file(self, output):
# #
        '''
            Sends given output to client.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + '_static_get')
            >>> handler.requested_file.content = ''
            >>> handler.server.web.file_size_stream_threshold_in_byte = 0

            >>> handler._send_static_file('') # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
        threshold = self.server.web.file_size_stream_threshold_in_byte
        mime_type = self.requested_file.get_mime_type(web=True)
        if(self.requested_file.size < threshold or
           mime_type in self.server.web.known_big_web_mime_types):
# # python3.5
# #             self.send_content_type_header(
# #                 mime_type=mime_type, encoding=builtins.isinstance(
# #                     output, builtins.str))
            self.send_content_type_header(
                mime_type=mime_type, encoding=builtins.isinstance(
                    output, builtins.unicode))
# #
        else:
            self.send_content_type_header(
                mime_type='application/octet-stream', encoding=False)
            if not __test_mode__:
                self.send_header('Content-Transfer-Encoding', 'binary')
        self.send_static_file_cache_header(
            timestamp=self.requested_file.timestamp)
        self.send_content_length_header(
            size=builtins.int(self.requested_file.size))
        self.end_headers()
        return self._send_output(output)

    @JointPoint
# # python3.5     def _send_not_modified_header(self: Self) -> Self:
    def _send_not_modified_header(self):
        '''Sends a header to client indicating cached file hasn't changed.'''
        self.send_content_type_header(
            mime_type=self.requested_file.mime_type, response_code=304
        ).send_static_file_cache_header(
            timestamp=self.requested_file.timestamp
        ).send_content_length_header(
            size=builtins.int(self.requested_file.size))
        self.end_headers()
        return self

    @JointPoint
# # python3.5
# #     def _send_output(
# #         self: Self, output: (builtins.str, _io.BufferedReader)
# #     ) -> Self:
    def _send_output(self, output):
# #
        '''Sends the final given output to client.'''
        if not (
            output is None or __test_mode__ or self.type == 'head'
        ):
            if self._encoded_output:
                self.wfile.write(self._encoded_output)
# # python3.5
# #             elif builtins.isinstance(output, builtins.bytes):
            elif builtins.isinstance(output, builtins.str):
# #
                self.wfile.write(output)
# # python3.5             elif builtins.isinstance(output, builtins.str):
            elif builtins.isinstance(output, builtins.unicode):
                self.wfile.write(output.encode(self.server.web.encoding))
            else:
                self.copyfile(output, self.wfile)
                output.close()
        return self

    @JointPoint
# # python3.5
# #     def _gzip(
# #         self: Self, content: (builtins.str, builtins.bytes)
# #     ) -> builtins.bytes:
    def _gzip(self, content):
# #
        '''
            Compresses the given content and returns the encoded result.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)

            >>> isinstance(handler._gzip(''), bytes)
            True

            >>> isinstance(handler._gzip(bytes()), bytes)
            True
        '''
# # python3.5         output = io.BytesIO()
        output = StringIO.StringIO()
        gzip_file_handler = gzip.GzipFile(
            fileobj=output, mode='w', compresslevel=5)
        if builtins.isinstance(content, builtins.bytes):
            gzip_file_handler.write(content)
        else:
            gzip_file_handler.write(content.encode(
                encoding=self.server.web.encoding))
        gzip_file_handler.close()
        return output.getvalue()

    @JointPoint
# # python3.5     def _dynamic_get(self: Self) -> Self:
    def _dynamic_get(self):
        '''
            Handles a dynamic file or python module request. It initializes \
            the given script-file or python module environment whether to \
            decide running it in its own thread or not. If no respond is \
            expected from client it could be run without its own thread \
            environment.
        '''
# # python3.5
# #         self.request_arguments = (
# #             ('header', builtins.str(self.headers)), ('type', self.type),
# #             ('handler', self),
# #             ('requestedFileName', self.requested_file_name),
# #             ('host', self.host), ('uri', self.uri), ('get', self.get),
# #             ('externalURI', self.external_uri), ('data', self.data),
# #             ('cookie', self.cookie), ('externalType', self.external_type),
# #             ('sharedData', self.server.web.shared_data))
        self.request_arguments = (
            ('header', convert_to_unicode(self.headers)),
            ('type', self.type), ('handler', self),
            ('requestedFileName', self.requested_file_name),
            ('host', self.host), ('uri', self.uri), ('get', self.get),
            ('externalURI', self.external_uri), ('data', self.data),
            ('cookie', self.cookie), ('externalType', self.external_type),
            ('sharedData', self.server.web.shared_data))
# #
        if '__no_respond__' not in self.data:
            self.respond = True
            return self._run_request()
        self.__class__.last_running_worker = threading.Thread(
            target=self._run_request)
        self.__class__.last_running_worker.start()
        return self

    @JointPoint
# # python3.5     def _run_request(self: Self) -> Self:
    def _run_request(self):
        '''
            Decides to run the given script as python-module or standalone \
            script-file.
        '''
        if self.load_module:
            return self._run_requested_module()
        return self._run_requested_file()

    @JointPoint
# # python3.5     def _run_requested_file(self: Self, debug=False) -> Self:
    def _run_requested_file(self, debug=False):
        '''
            Runs a given external process in a subprocess. Output and errors \
            are piped to requested client.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)
            >>> handler.requested_file = FileHandler(
            ...     __test_folder__.path + '_run_requested_file')
            >>> handler.requested_file.content = ''
            >>> handler.request_arguments = ('hans', 'peter'),

            >>> handler.respond = False
            >>> handler._run_requested_file() # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...

            >>> handler.request_arguments = ('hans', 'peter'),
            >>> handler._run_requested_file(True) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
        '''
# # python3.5
# #         self.request_arguments = builtins.list(builtins.map(
# #             lambda element: builtins.str(
# #                 element[1]
# #             ), self.request_arguments))
        self.request_arguments = builtins.list(builtins.map(
            lambda element: convert_to_unicode(element[1]),
            self.request_arguments))
# #
        self.request_arguments[0] = self.server.web.root.path + \
            self.request_arguments[0][1]
        __logger__.debug('Execute file "%s".', self.request_arguments[0])
        self.server.web.number_of_running_threads += 1
        try:
            output, errors = subprocess.Popen(
                self.request_arguments, stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            ).communicate()
        except builtins.OSError as exception:
            output = ''
# # python3.5
# #             errors = '%s: %s' % (
# #                 exception.__class__.__name__, builtins.str(exception))
            errors = '%s: %s' % (
                exception.__class__.__name__, convert_to_unicode(
                    exception))
# #
        self.server.web.number_of_running_threads -= 1
        size = builtins.len(output)
# # python3.5
# #         if not builtins.isinstance(errors, builtins.str):
        if not builtins.isinstance(errors, builtins.unicode):
# #
            errors = errors.decode(
                encoding=self.server.web.encoding, errors='strict')
        if self.respond:
            if errors:
                program_description = ''
                if(sys.flags.debug or __logger__.isEnabledFor(logging.DEBUG) or
                   debug):
                    program_description = ' "%s"' % self.request_arguments[0]
                self.send_error(
                    500, 'Internal server error with cgi program%s: "%s"' % (
                        program_description,
                        regularExpression.compile('\n+').sub('\n', errors)))
            else:
                '''Check if given output contains a header.'''
                header_match = regularExpression.compile(
                    '[A-Z0-9]+/([0-9]+\.)+[0-9]+ [0-9]{3} [a-zA-Z ]+\n'
                    '([^:]+: .+\n)+\n.+'
                ).match(output.decode(encoding=self.server.web.encoding))
                if not header_match:
                    self.send_content_type_header().send_content_length_header(
                        size, dynamic_output=output
                    ).end_headers()
                self._send_output(output)
        if errors:
            __logger__.critical(
                'Error in common gateway interface program "%s": %s',
                self.request_arguments[0], errors)
        return self

    @JointPoint
# # python3.5     def _run_requested_module(self: Self) -> Self:
    def _run_requested_module(self):
        '''
            Imports and runs a given python module. Errors and output are \
            piped to requested client.
        '''
        self.request_arguments = builtins.dict(self.request_arguments)
        '''Redirect output buffer.'''
        print_default_buffer_backup = Print.default_buffer
        Print.default_buffer = self.server.web.thread_buffer
# # python3.5         sys_path_backup = sys.path.copy()
        sys_path_backup = copy(sys.path)
        sys.path = [self.server.web.root.path] + sys.path
        self.server.web.number_of_running_threads += 1
        requested_module = builtins.__import__(
            self.request_arguments['requestedFileName'])
        '''Extend requested scope with request dependent globals.'''
        requested_module.__request_arguments__ = self.request_arguments
        sys.path = sys_path_backup
        __logger__.debug('Run module "%s".', requested_module)
        return self._handle_module_running(
            requested_module, print_default_buffer_backup, sys_path_backup)

    @JointPoint
# # python3.5
# #     def _handle_module_running(
# #         self: Self, requested_module: ModuleType,
# #         print_default_buffer_backup: builtins.object,
# #         sys_path_backup: NativeIterable
# #     ) -> Self:
    def _handle_module_running(
        self, requested_module, print_default_buffer_backup,
        sys_path_backup
    ):
# #
        '''Handles exceptions raising in requested modules.'''
        try:
            if not __test_mode__:
                Module.determine_caller(
                    callable_objects=Module.get_defined_callables(
                        object=requested_module)
                )[1]()
        except builtins.BaseException as exception:
            self._handle_module_exception(requested_module, exception)
        else:
            if self.respond:
                self.send_content_type_header().send_content_length_header(
                    size=builtins.len(self.server.web.thread_buffer.content),
                    dynamic_output=self.server.web.thread_buffer.content
                ).end_headers()
        finally:
            self.server.web.number_of_running_threads -= 1
            if self.respond:
                self._send_output(
                    output=self.server.web.thread_buffer.clear())
            Print.default_buffer = print_default_buffer_backup
        return self

    @JointPoint
# # python3.5
# #     def _handle_module_exception(
# #         self: Self, requested_module: ModuleType,
# #         exception: builtins.BaseException, debug=False
# #     ) -> Self:
    def _handle_module_exception(
        self, requested_module, exception, debug=False
    ):
# #
        '''
            This method handles each exception raised by running a module \
            which was requested by client.

            Examples:

            >>> server = MultiProcessingHTTPServer()
            >>> server.web = Web(__test_folder__)
            >>> handler = CGIHTTPRequestHandler(
            ...     socket.socket(socket.AF_INET, socket.SOCK_STREAM),
            ...     ('127.0.0.1', 12345), server)

            >>> try:
            ...     raise OSError('hans')
            ... except OSError as exception:
            ...     handler._handle_module_exception(
            ...         __import__('doctest'), exception, True)
            Traceback (most recent call last):
            ...
            OSError: hans

            >>> handler.respond = True
            >>> try:
            ...     raise OSError('hans')
            ... except BaseException as exception:
            ...     handler._handle_module_exception(
            ...         __import__('doctest'), exception, True)
            Traceback (most recent call last):
            ...
            OSError: hans

            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '...'
            >>> try:
            ...     raise OSError('hans')
            ... except BaseException as exception:
            ...     handler._handle_module_exception(
            ...         __import__('doctest'), exception
            ...     ) # doctest: +ELLIPSIS
            Object of "CGIHTTPRequestHandler" with request uri "" and parame...
            >>> __test_buffer__.clear() # doctest: +ELLIPSIS
            '... - ...CRITICAL... - Error in module "doctest" OSError: hans...'
        '''
        if self.respond:
            if(sys.flags.debug or __logger__.isEnabledFor(logging.DEBUG) or
               debug):
# # python3.5
# #                 self.send_error(
# #                     500, '%s: %s\n\nRequest informations:\n\n%s' % (
# #                         exception.__class__.__name__,
# #                         regularExpression.compile('\n+').sub(
# #                             '\n', builtins.str(exception)
# #                         ), json.dumps(
# #                             self.request_arguments, skipkeys=True,
# #                             ensure_ascii=False, check_circular=True,
# #                             allow_nan=True, indent=4,
# #                             separators=(',', ': '), sort_keys=True,
# #                             default=lambda object: '__not_serializable__'))
# #                 )
                self.send_error(
                    500, '%s: %s\n\nRequest informations:\n\n%s' % (
                        exception.__class__.__name__,
                        regularExpression.compile('\n+').sub(
                            '\n', convert_to_unicode(exception)
                        ), json.dumps(
                            self.request_arguments, skipkeys=True,
                            ensure_ascii=False, check_circular=True,
                            allow_nan=True, indent=4,
                            separators=(',', ': '), sort_keys=True,
                            default=lambda object: '__not_serializable__')))
# #
            else:
                self.send_error(500, 'Internal server error')
        if sys.flags.debug or __logger__.isEnabledFor(logging.DEBUG) or debug:
            raise
        else:
# # python3.5
# #             __logger__.critical(
# #                 'Error in module "%s" %s: %s\n\nRequest informations:\n\n'
# #                 '%s', requested_module.__name__,
# #                 exception.__class__.__name__, builtins.str(exception),
# #                 json.dumps(
# #                     self.request_arguments, skipkeys=True,
# #                     ensure_ascii=False, check_circular=True,
# #                     allow_nan=True, indent=4, separators=(',', ': '),
# #                     sort_keys=True,
# #                     default=lambda object: '__not_serializable__'))
            # TODO do it on every error handler and in html response.
            __logger__.critical(
                'Error in module "%s" %s: %s\n\nRequest informations:\n\n'
                '%s', requested_module.__name__,
                exception.__class__.__name__, convert_to_unicode(
                    exception
                ), json.dumps(
                    self.request_arguments, skipkeys=True,
                    ensure_ascii=False, check_circular=True,
                    allow_nan=True, indent=4, separators=(',', ': '),
                    sort_keys=True,
                    default=lambda object: '__not_serializable__'))
# #
        return self

    # # endregion

    # endregion

# endregion

# region footer

'''
    Preset some variables given by introspection letting the linter know what \
    globale variables are available.
'''
__logger__ = __exception__ = __module_name__ = __file_path__ = \
    __test_mode__ = __test_buffer__ = __test_folder__ = __test_globals__ = None
'''
    Extends this module with some magic environment variables to provide \
    better introspection support. A generic command line interface for some \
    code preprocessing tools is provided by default.
'''
Module.default(
    name=__name__, frame=inspect.currentframe(), default_caller=Web.__name__)

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
