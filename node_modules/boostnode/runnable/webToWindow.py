#!/usr/bin/env python2.7
# -*- coding: utf-8 -*-

# region header

'''
    Provides a web-browser-based technology to show web-pages as desktop \
    window.
'''

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
__maintainer__ = 'Torben Sickert'
__maintainer_email__ = 'info["~at~"]torben.website'
__status__ = 'stable'
__version__ = '1.0'

# # python3.5 import builtins
import __builtin__ as builtins
import inspect
import os
import re as regularExpression
import sys
import threading
# # python3.5 import types
pass
import webbrowser

try:
    '''Note: Web cache is stored in "~/.cache/webkitgtk/applications/"'''
    import gtk
    import webkit
except builtins.ImportError:
    gtk = None
    webkit = builtins.type('WebView', (builtins.object,), {
        'WebView': None, 'WebFrame': None})
try:
    import PyQt4.QtCore
    import PyQt4.QtWebKit
    import PyQt4.QtGui
except builtins.ImportError:
    qt = None
else:
    qt = True

'''Make boostnode packages and modules importable via relative paths.'''
sys.path.append(os.path.abspath(sys.path[0] + 2 * (os.sep + '..')))

from boostnode.extension.native import Dictionary, Module, \
    InstancePropertyInitializer
from boostnode.extension.system import CommandLine, Runnable
# # python3.5 from boostnode.extension.type import Self, SelfClass
pass
from boostnode.paradigm.aspectOrientation import JointPoint
from boostnode.paradigm.objectOrientation import Class

# endregion


# region classes

class Browser(Class, Runnable):

    '''
        Provides a webkit browser without any browser typical visual \
        properties. Its only a very simple window for showing web pages. The \
        main goal is to make a web-interface look and behave like a real \
        desktop application.

        **_url**                 - URL to open in webview.

        **width_in_pixel**       - Width of opening browser window.

        **height_in_pixel**      - Height of opening browser window.

        **fullscreen**           - Indicates whether windows should start in \
                                   fullscreen mode.

        **no_window_decoration** - If set to "True" no windows decoration \
                                   will be provided.

        **default_gui_toolkit**  - Toolkit to use if more than one is \
                                   available.

        **no_progress_bar**      - If set to "True" progress bar for loading \
                                   web pages will be omitted.

        **default_title**        - Default window title to show in window \
                                   decoration.

        **stop_order**           - Standard in command to close window.

        Examples:

        >>> Browser(
        ...     _url='https://www.google.com/', width_in_pixel=300,
        ...     height_in_pixel=100
        ... ) # doctest: +ELLIPSIS
        Object of "Browser" with url "https://www.google.com/" in 300 pi...
    '''

    # region properties

    COMMAND_LINE_ARGUMENTS = (
        {'arguments': ('_url',),
         'specification': {
             'action': 'store',
             # 'required': False,
             'help': 'Select an url to request and interpret with the '
                     'web browser.',
             # 'dest': '_url',
             'metavar': 'URL'}},
        {'arguments': ('-w', '--width'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'choices': builtins.range(1, 50000),
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the width of the given window in pixel "
                            '''(default: "%d").' % '''
                            '__initializer_default_value__'},
             'dest': 'width_in_pixel',
             'metavar': 'NUMBER_OF_PIXELS'}},
        {'arguments': ('-y', '--height'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'choices': builtins.range(1, 50000),
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines the height of the given window in pixel "
                            '''(default: "%d").' % '''
                            '__initializer_default_value__'},
             'dest': 'height_in_pixel',
             'metavar': 'NUMBER_OF_PIXELS'}},
        {'arguments': ('-f', '--fullscreen'),
         'specification': {
             'action': 'store_true',
             'default': {'execute': '__initializer_default_value__'},
             'help': 'If set window will be started in fullscreen.',
             'dest': 'fullscreen'}},
        {'arguments': ('-n', '--no-window-decoration'),
         'specification': {
             'action': 'store_true',
             'default': {'execute': '__initializer_default_value__'},
             'help': 'If set no window decoration (e.g. title bar) will be '
                     'shown.',
             'dest': 'no_window_decoration'}},
        {'arguments': ('-g', '--default-gui-toolkit'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': builtins.str,
             'choices': {'execute': 'self.available_gui_toolkits'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines default toolkit (one of \"%s\"). Others "
                            'will only run as fallback (default: "%s").\' % '
                            "('\", \"'.join(self.available_gui_toolkits), "
                            "__initializer_default_value__.replace('%', '%%')"
                            ", )"},
             'dest': 'default_gui_toolkit',
             'metavar': 'GUI_TOOLKIT'}},
        {'arguments': ('-b', '--no-progress-bar'),
         'specification': {
             'action': 'store_true',
             'default': {'execute': '__initializer_default_value__'},
             'help': 'If set no progress bar for showing website rendering '
                     'state is shown.',
             'dest': 'no_progress_bar'}},
        {'arguments': ('-d', '--default-title'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Defines which string should be shown in window "
                            'decoration if no site with title node was loaded '
                            '''(default: "%s").' % '''
                            "__initializer_default_value__.replace('%', "
                            "'%%')"},
             'dest': 'default_title',
             'metavar': 'TITLE'}},
        {'arguments': ('-s', '--stop-order'),
         'specification': {
             'action': 'store',
             'default': {'execute': '__initializer_default_value__'},
             'type': {'execute': 'type(__initializer_default_value__)'},
             'required': {'execute': '__initializer_default_value__ is None'},
             'help': {
                 'execute': "'Saves a cli-command for shutting down the server"
                            ''' (default: "%s").' % '''
                            '__initializer_default_value__'},
             'dest': 'stop_order',
             'metavar': 'STRING'}})
    '''Holds all command line interface argument informations.'''
    instances = []
    '''Saves all initialized instances of this class.'''

    # endregion

    # region static methods

    # # region public

    # # # region getter

    @JointPoint(builtins.classmethod)
    @Class.pseudo_property
# # python3.5
# #     def get_available_gui_toolkits(cls: SelfClass) -> builtins.tuple:
    def get_available_gui_toolkits(cls):
# #
        '''
            Determines available gui toolkits.

            Examples:

            >>> __test_globals__['qt'] = __test_globals__['gtk'] = None

            >>> Browser('google.de').available_gui_toolkits
            ('default',)
        '''
        toolkits = []
        for toolkit in builtins.globals():
            if(builtins.globals()[toolkit] is not None and
               '_initialize_%s_browser' % toolkit in cls.__dict__):
                toolkits.append(toolkit)
        toolkits.append('default')
        return builtins.tuple(toolkits)

    # # # endregion

    # # endregion

    # endregion

    # region dynamic methods

    # # region public

    # # # region special

    @JointPoint
# # python3.5     def __repr__(self: Self) -> builtins.str:
    def __repr__(self):
        '''
            Invokes if this object should describe itself by a string. \
            Returns the computed self describing string.

            Examples:

            >>> repr(Browser(
            ...     _url='https://www.google.de/', width_in_pixel=300,
            ...     height_in_pixel=100
            ... )) # doctest: +ELLIPSIS
            'Object of "Browser" with url "https://www.google... x 100 pixel...'
        '''
        return (
            'Object of "{class_name}" with url "{url}" in {width} pixel x '
            '{height} pixel, stop order "{stop_order}" and gui toolkit '
            '"{gui_toolkit}".'.format(
                class_name=self.__class__.__name__, url=self._url,
                width=self.width_in_pixel, height=self.height_in_pixel,
                stop_order=self.stop_order, gui_toolkit=self.gui_toolkit))

    # # # endregion

    # # # region getter

    @JointPoint(Class.pseudo_property)
# # python3.5     def get_gui_toolkit(self: Self) -> builtins.str:
    def get_gui_toolkit(self):
        '''
            Determines available gui toolkit.

            Examples:

            >>> __test_globals__['qt'] = __test_globals__['gtk'] = None

            >>> Browser('google.de').gui_toolkit
            'default'

            >>> Browser(
            ...     'google.de', default_gui_toolkit='gtk'
            ... ).gui_toolkit
            'default'

            >>> __test_globals__['gtk'] = builtins.object()
            >>> Browser(
            ...     'google.de', default_gui_toolkit='qt'
            ... ).gui_toolkit
            'gtk'

            >>> __test_globals__['qt'] = builtins.object()
            >>> Browser(
            ...     'google.de', default_gui_toolkit='qt'
            ... ).gui_toolkit
            'qt'

            >>> Browser('google.de').gui_toolkit
            'qt'

            >>> __test_globals__['gtk'] = None
            >>> Browser(
            ...     'google.de', default_gui_toolkit='gtk'
            ... ).gui_toolkit
            'qt'
        '''
        if self.default_gui_toolkit in self.available_gui_toolkits:
            return self.default_gui_toolkit
        return self.available_gui_toolkits[0]

    # # # endregion

    # # # region setter

    @JointPoint
# # python3.5     def set_url(self: Self, url: builtins.str) -> builtins.str:
    def set_url(self, url):
        '''
            Setter for current url.

            **url** - URL to set.
        '''
# # python3.5
# #         if regularExpression.compile('[a-zA-Z]+://.*').fullmatch(url):
        if regularExpression.compile('[a-zA-Z]+://.*$').match(url):
# #
            self._url = url
        else:
            self._url = 'http://' + url
        return self._url

    # # # endregion

    @JointPoint
# # python3.5
# #     def stop(
# #         self: Self, *arguments: builtins.object, reason='',
# #         **keywords: builtins.object
# #     ) -> Self:
    def stop(self, *arguments, **keywords):
# #
        '''
            Closes all created web views. Note that in case of using the \
            default installed browser fall-back this instance couldn't be \
            destroyed.

            Examples:

            >>> Browser('google.de').stop() # doctest: +ELLIPSIS
            Object of "Browser" with url "http://google.de" in 800 pixel...
        '''
# # python3.5
# #         pass
        reason, keywords = Dictionary(content=keywords).pop_from_keywords(
            name='reason', default_value='')
# #
        if self.__dict__.get('window') is not None:
            if self.gui_toolkit == 'qt':
                self.window.closeAllWindows()
                if not (builtins.len(arguments) or reason):
                    reason = 'clicking qt close button'
            elif self.gui_toolkit == 'gtk':
                self._gtk_close = True
                if builtins.len(arguments) and builtins.isinstance(
                    arguments[0], gtk.Window
                ):
                    reason = 'clicking gtk close button'
                else:
                    '''
                        NOTE: We got a close trigger from another thread as \
                        where the main gtk loop is present. We have to wait \
                        until gtk has finished it's closing procedures.
                    '''
                    self._close_gtk_windows_lock.acquire()
            __logger__.info('All "%s" windows closed.', self.gui_toolkit)
        '''Take this method type by the abstract class via introspection.'''
        return builtins.getattr(
            builtins.super(self.__class__, self), inspect.stack()[0][3]
        )(*arguments, reason=reason, **keywords)

    # # endregion

    # # region protected

    # # # region runnable implementation

    @JointPoint
# # python3.5     def _run(self: Self) -> Self:
    def _run(self):
        '''
            Entry point for command line call of this program. Initializes \
            all window and webkit components.

            Examples:

            >>> from copy import copy
            >>> sys_argv_backup = copy(sys.argv)

            >>> sys.argv[1:] = ['google.de']
            >>> Browser.run() # doctest: +ELLIPSIS
            Object of "Browser" with url "https://google.de" in 800 pixel...

            >>> sys.argv = sys_argv_backup
        '''
        return self._initialize(**self._command_line_arguments_to_dictionary(
            namespace=CommandLine.argument_parser(
                module_name=__name__, scope={'self': self},
                arguments=self.COMMAND_LINE_ARGUMENTS)))

    @JointPoint(InstancePropertyInitializer)
# # python3.5
# #     def _initialize(
# #         self: Self, _url: builtins.str, width_in_pixel=800,
# #         height_in_pixel=600, fullscreen=False, no_window_decoration=False,
# #         default_gui_toolkit='qt', no_progress_bar=False,
# #         default_title='No gui loaded.', stop_order='stop',
# #         **keywords: builtins.object
# #     ) -> Self:
    def _initialize(
            self, _url, width_in_pixel=800, height_in_pixel=600,
            fullscreen=False, no_window_decoration=False,
            default_gui_toolkit='qt', no_progress_bar=False,
            default_title='No gui loaded.', stop_order='stop', **keywords):
# #
        '''
            Initializes a web view or tries to open a default browser if no \
            gui suitable gui toolkit is available.
        '''
        self.__class__.instances.append(self)

        # # # region properties

        '''Dynamic runtime objects for constructing a simple web window.'''
        self.window = self.scroller = self.vbox = self.progress_bar = \
            self.browser = None
        '''Trigger setter for right url formatting.'''
        self.url = self._url
        '''
            If setted "True" window will be closed on next gtk main iteration.
        '''
        self._gtk_close = False
        __logger__.info(
            'Start web gui with gui toolkit "%s".', self.gui_toolkit)
        if not __test_mode__:
            '''
                This lock object handles to wait until all gtk windows are \
                closed before the program terminates.
            '''
            self._close_gtk_windows_lock = threading.Lock()
            self._close_gtk_windows_lock.acquire()

        # # # endregion

# # python3.5
# #             browser_thread = threading.Thread(
# #                 target=builtins.getattr(
# #                     self, '_initialize_%s_browser' % self.gui_toolkit),
# #                 daemon=True
# #             ).start()
            browser_thread = threading.Thread(target=builtins.getattr(
                self, '_initialize_%s_browser' % self.gui_toolkit))
            browser_thread.daemon = True
            browser_thread.start()
# #
            if self.stop_order:
                self.wait_for_order()
        return self

    # # # endregion

    # # # region native web view components

    @JointPoint
# # python3.5     def _initialize_default_browser(self: Self) -> Self:
    def _initialize_default_browser(self):
        '''Starts the default browser with currently stored url.'''
        self.browser = webbrowser
        self.browser.open(self._url)
        return self

    @JointPoint
# # python3.5     def _initialize_qt_browser(self: Self) -> Self:
    def _initialize_qt_browser(self):
        '''Starts the qt webkit webview thread.'''
        self.window = PyQt4.QtGui.QApplication(sys.argv)
        self.browser = PyQt4.QtWebKit.QWebView()
        if self.no_window_decoration:
            self.browser.setWindowFlags(PyQt4.QtCore.Qt.CustomizeWindowHint)
        if self.fullscreen:
            self.browser.showFullScreen()
        self.browser.load(PyQt4.QtCore.QUrl(self._url))
        self.browser.show()
        self.browser.setWindowTitle(self.default_title)
        self.browser.titleChanged.connect(self._on_qt_title_changed)
        self.browser.resize(self.width_in_pixel, self.height_in_pixel)
        self._initialize_qt_progress_bar().window.lastWindowClosed.connect(
            self.trigger_stop)
        self.window.exec_()
        return self

    @JointPoint
# # python3.5     def _initialize_qt_progress_bar(self: Self) -> Self:
    def _initialize_qt_progress_bar(self):
        '''
            Initializes the progress bar for qt on bottom of the window for \
            showing current state of website rendering.
        '''
        if not self.no_progress_bar:
            self.progress_bar = PyQt4.QtGui.QProgressBar()
            self.progress_bar.setMinimum(1)
            self.progress_bar.setMaximum(100)
            self.progress_bar.setTextVisible(False)
            self.progress_bar.setVisible(False)

            main_layout = PyQt4.QtGui.QGridLayout()
            main_layout.addWidget(self.progress_bar)
            main_layout.setAlignment(PyQt4.QtCore.Qt.AlignBottom)
            main_layout.setMargin(0)

            self.browser.setLayout(main_layout)
            self.browser.loadStarted.connect(self._on_qt_load_started)
            self.browser.loadProgress.connect(
                self._on_qt_load_progress_changed)
            self.browser.loadFinished.connect(self._on_qt_load_finished)
        return self

    @JointPoint
# # python3.5     def _initialize_gtk_browser(self: Self) -> Self:
    def _initialize_gtk_browser(self):
        '''Sets various event-handlers for browser and window objects.'''
        self.window = gtk.Window()
        self.vbox = gtk.VBox()
        self.scroller = gtk.ScrolledWindow()
        self.browser = webkit.WebView()
        self.browser.connect('title-changed', self._on_gtk_title_changed)
        self.vbox.pack_start(self.scroller)
        self._initialize_gtk_progress_bar().scroller.add(self.browser)
        self.browser.open(self._url)
        self.window.connect('delete_event', self.trigger_stop)
        self.window.add(self.vbox)
        self.window.set_title(self.default_title)
        self.window.resize(
            width=self.width_in_pixel, height=self.height_in_pixel)
        if self.fullscreen:
            self.window.fullscreen()
        if self.no_window_decoration:
            self.window.set_decorated(False)
        self.window.show_all()
        gtk.idle_add(self._check_for_gtk_closing_flag)
        # Alternative more low-level implementation.
        # while True:
        #     gtk.main_iteration(block=False)
        #     if gtk.events_pending() and self._gtk_close:
        #         break
        gtk.main()
        return self

    @JointPoint
# # python3.5     def _initialize_gtk_progress_bar(self: Self) -> Self:
    def _initialize_gtk_progress_bar(self):
        '''
            Initializes the progress bar for gtk on bottom of the window for \
            showing current state of website rendering.
        '''
        self.progress_bar = gtk.ProgressBar()
        self.browser.connect(
            'load-progress-changed', self._on_gtk_load_progress_changed)
        self.browser.connect('load-started', self._on_gtk_load_started)
        self.browser.connect('load-finished', self._on_gtk_load_finished)
        if not self.no_progress_bar:
            self.vbox.pack_start(self.progress_bar, False)
        return self

    @JointPoint
# # python3.5     def _check_for_gtk_closing_flag(self: Self) -> builtins.bool:
    def _check_for_gtk_closing_flag(self):
        '''
            Checks if gtk should be closed after the last gtk main iteration. \
            If we return a "False" this method will not be triggered in \
            future time.

            Examples:

            >>> Browser('google.de')._check_for_gtk_closing_flag()
            True
        '''
        if self._gtk_close:
            gtk.main_quit()
            self._close_gtk_windows_lock.release()
        return not self._gtk_close

    # # # # region event

    # # # # # region webkit event

    @JointPoint
# # python3.5
# #     def _on_qt_title_changed(self: Self, title: builtins.str) -> Self:
    def _on_qt_title_changed(self, title):
# #
        '''
            Triggers if the current title (normally defined in the web page's \
            markup).
        '''
        self.browser.setWindowTitle(title)
        return self

    @JointPoint
# # python3.5
# #     def _on_gtk_title_changed(
# #         self: Self, webview: webkit.WebView, frame: webkit.WebFrame,
# #         title: builtins.str
# #     ) -> Self:
    def _on_gtk_title_changed(self, webview, frame, title):
# #
        '''
            Triggers if the current title (normally defined in the web page's \
            markup).
        '''
        self.window.set_title(title)
        return self

    @JointPoint
# # python3.5     def _on_qt_load_started(self: Self) -> Self:
    def _on_qt_load_started(self):
        '''Triggers if browser starts to load a new web page.'''
        self.progress_bar.text = ''
        self.progress_bar.setVisible(True)
        return self

    @JointPoint
# # python3.5
# #     def _on_gtk_load_started(
# #         self: Self, webview: webkit.WebView, frame: webkit.WebFrame
# #     ) -> Self:
    def _on_gtk_load_started(self, webview, frame):
# #
        '''Triggers if browser starts to load a new web page.'''
        self.progress_bar.set_fraction(0 / 100.0)
        self.progress_bar.set_visible(True)
        return self

    @JointPoint
# # python3.5
# #     def _on_qt_load_progress_changed(
# #         self: Self, status: builtins.int
# #     ) -> Self:
    def _on_qt_load_progress_changed(self, status):
# #
        '''Triggers if the current web page load process was changed.'''
        self.progress_bar.setValue(status)
        return self

    @JointPoint
# # python3.5
# #     def _on_gtk_load_progress_changed(
# #         self: Self, webview: webkit.WebView, amount: builtins.int
# #     ) -> Self:
    def _on_gtk_load_progress_changed(self, webview, amount):
# #
        '''Triggers if the current web page load process was changed.'''
        self.progress_bar.set_fraction(amount / 100.0)
        return self

    @JointPoint
# # python3.5
# #     def _on_qt_load_finished(
# #         self: Self, successful: builtins.bool
# #     ) -> Self:
    def _on_qt_load_finished(self, successful):
# #
        '''Triggers if a page load process has finished.'''
        self.progress_bar.setVisible(False)
        return self

    @JointPoint
# # python3.5
# #     def _on_gtk_load_finished(
# #         self: Self, webview: webkit.WebView, frame: webkit.WebFrame
# #     ) -> Self:
    def _on_gtk_load_finished(self, webview, frame):
# #
        '''Triggers if a page load process has finished.'''
        self.progress_bar.set_fraction(100.0 / 100.0)
        self.progress_bar.set_visible(False)
        return self

    # # # # endregion

    # # # # endregion

    # # # endregion

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
    name=__name__, frame=inspect.currentframe(),
    default_caller=Browser.__name__)

# endregion

# region vim modline
# vim: set tabstop=4 shiftwidth=4 expandtab:
# vim: foldmethod=marker foldmarker=region,endregion:
# endregion
