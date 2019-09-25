// @flow
// #!/usr/bin/env node
// -*- coding: utf-8 -*-
/** @module website-utilities */
'use strict'
/* !
    region header
    [Project page](https://torben.website/websiteUtilities)

    Copyright Torben Sickert (info["~at~"]torben.website) 16.12.2012

    License
    -------

    This library written by Torben Sickert stand under a creative commons
    naming 3.0 unported license.
    See https://creativecommons.org/licenses/by/3.0/deed.de
    endregion
*/
// region imports
import {$ as binding} from 'clientnode'
import type {$DomNode} from 'clientnode'
import Language from 'internationalisation'
import 'jQuery-scrollTo'
import {Spinner} from 'spin.js'
export const $:any = binding
// endregion
// region types
export type AnalyticsCode = {
    initial:string;
    sectionSwitch:string;
    event:string;
}
// endregion
// region plugins/classes
/**
 * This plugin holds all needed methods to extend a whole website.###
 * @property static:_name - Defines this class name to allow retrieving them
 * after name mangling.
 *
 * @property $domNodes - Saves a set of references to all needed dom nodes.
 * @property currentMediaQueryMode - Saves current media query status depending
 * on available space in current browser window.
 * @property currentSectionName - Saves current section hash name.
 * @property languageHandler - Reference to the language switcher instance.
 * @property startUpAnimationIsComplete - Indicates whether start up animations
 * has finished.
 * @property viewportIsOnTop - Indicates whether current viewport is on top.
 * @property windowLoadingSpinner - The window loading spinner instance.
 *
 * @property _analyticsCode - Saves analytics code snippets to use for
 * referenced situations.
 * @property _analyticsCode.initial {string} - Initial string to use for
 * analyses on.
 * @property _analyticsCode.sectionSwitch {string} - Code to execute on each
 * section switch. Current page is available via "{1}" string formatting.
 * @property _analyticsCod.event {string} - Code to execute on each fired
 * event.
 * @property _options - Options extended by the options given to the
 * initializer method.
 * @property _parentOptions - Saves default options to extend by options given
 * to the initializer method.
 * @property _parentOptions.domNodeSelectorPrefix {string} - Selector prefix
 * for all nodes to take into account.
 * @property _parantOptions.onViewportMovesToTop {Function} - Callback to
 * trigger when viewport arrives at top.
 * @property _parantOptions.onViewportMovesAwayFromTop {Function} - Callback to
 * trigger when viewport moves away from top.
 * @property _parentOptions.onChangeToLargeMode {Function} - Callback to
 * trigger if media query mode changes to large mode.
 * @property _parentOptions.onChangeToMediumMode {Function} - Callback to
 * trigger if media query mode changes to medium mode.
 * @property _parentOptions.onChangeToSmallMode {Function} - Callback to
 * trigger if media query mode changes to small mode.
 * @property _parentOptions.onChangeToExtraSmallMode {Function} - Callback to
 * trigger if media query mode changes to extra small mode.
 * @property _parentOptions.onChangeMediaQueryMode {Function} - Callback to
 * trigger if media query mode changes.
 * @property _parentOptions.onSwitchSection {Function} - Callback to trigger if
 * current section switches.
 * @property _parentOptions.onStartUpAnimationComplete {Function} - Callback to
 * trigger if all start up animations has finished.
 * @property _parentOptions.knownScrollEventNames {string} - Saves all known
 * scroll events in a space separated string.
 * @property _parentOption.switchToManualScrollingIndicator {Function} -
 * Indicator function to stop currently running scroll animations to let the
 * user get control of current scrolling behavior. Given callback gets an event
 * object. If the function returns "true" current animated scrolls will be
 * stopped.
 * @property _parentOptions.additionalPageLoadingTimeInMilliseconds {Number} -
 * Additional time to wait until page will be indicated as loaded.
 * @property _parentOptions.trackingCode - Analytic tracking code to collect
 * user behavior data.
 * @property _parentOptions.mediaQueryClassNameIndicator
 * {Array.Array.<string>} - Mapping of media query class indicator names to
 * internal event names.
 * @property _parentOptions.domNode {Object.<string, string>} - Mapping of
 * dom node descriptions to their corresponding selectors.
 * @property _parentOptions.domNode.mediaQueryIndicator {string} - Selector
 * for indicator dom node to use to trigger current media query mode.
 * @property _parentOptions.domNode.top {string} - Selector to indicate that
 * viewport is currently on top.
 * @property _parentOptions.domNode.scrollToTopButton {string} - Selector for
 * starting an animated scroll to top.
 * @property _parentOption.domNode.startUpAnimationClassPrefix {string} -
 * Class name selector prefix for all dom nodes to appear during start up
 * animations.
 * @property _parentOptions.domNode.windowLoadingCover {string} - Selector
 * to the full window loading cover dom node.
 * @property _parentOptions.domNode.windowLoadingSpinner {string} - Selector
 * to the window loading spinner (on top of the window loading cover).
 * @property _parentOption.startUpShowAnimation {Object} - Options for startup
 * show in animation.
 * @property _parentOption.startUpHide {Object} - Options for initially hiding
 * dom nodes showing on startup later.
 * @property _parentOptions.windowLoadingCoverHideAnimation {Object} - Options
 * for startup loading cover hide animation.
 * @property _parentOptions.startUpAnimationElementDelayInMiliseconds {number}
 * - Delay between two startup animated dom nodes in order.
 * @property _parentOptions.windowLoadingSpinner {Object} - Options for the
 * window loading cover spinner.
 * @property _parentOptions.activateLanguageSupport {boolean} - Indicates
 * whether language support should be used or not.
 * @property _parentOptions.language {Object} - Options for client side
 * internationalisation handler.
 * @property _parentOptions.scrollTop {Object} - Options for automated scroll
 * top animation.
 * @property _parentOptions.domain {string} - Sets current domain name. If
 * "auto" is given it will be determined automatically.
 */
export class Website extends $.Tools.class {
    static _name:string = 'Website'

    $domNodes:$DomNode
    currentMediaQueryMode:string
    currentSectionName:string
    languageHandler:?Language
    startUpAnimationIsComplete:boolean
    viewportIsOnTop:boolean
    windowLoadingSpinner:?Spinner

    _analyticsCode:AnalyticsCode
    _parentOptions:Object
    // region public methods
    // / region special
    /**
     * Initializes the interactive web application.
     * @param options - An options object.
     * @param parentOptions - A default options object.
     * @param startUpAnimationIsComplete - If set to "true", no start up
     * animation will be performed.
     * @param currentSectionName - Initial section name to use.
     * @param viewportIsOnTop - Indicates whether viewport is on top initially.
     * @param currentMediaQueryMode - Initial media query mode to use (until
     * first window resize event could trigger a change).
     * @param languageHandler - Language handler instance to use.
     * @param analyticsCode - Analytic code snippet to use.
     * @returns Returns the current instance.
     */
    initialize(
        options:Object = {}, parentOptions:Object = {
            activateLanguageSupport: true,
            additionalPageLoadingTimeInMilliseconds: 0,
            domain: 'auto',
            domNode: {
                mediaQueryIndicator: '<div class="media-query-indicator">',
                top: 'header',
                scrollToTopButton: 'a[href="#top"]',
                startUpAnimationClassPrefix:
                    '.website-start-up-animation-number-',
                windowLoadingCover: '.website-utilities-window-loading-cover',
                windowLoadingSpinner:
                    '.website-utilities-window-loading-cover > div'
            },
            domNodeSelectorPrefix: 'body.{1}',
            knownScrollEventNames:
                'scroll mousedown wheel DOMMouseScroll mousewheel keyup ' +
                'touchmove',
            language: {},
            mediaQueryClassNameIndicator: [
                ['extraSmall', 'xs'], ['small', 'sm'], ['medium', 'md'],
                ['large', 'lg']
            ],
            onViewportMovesToTop: Website.noop,
            onViewportMovesAwayFromTop: Website.noop,
            onChangeToLargeMode: Website.noop,
            onChangeToMediumMode: Website.noop,
            onChangeToSmallMode: Website.noop,
            onChangeToExtraSmallMode: Website.noop,
            onChangeMediaQueryMode: Website.noop,
            onSwitchSection: Website.noop,
            onStartUpAnimationComplete: Website.noop,
            startUpAnimationElementDelayInMiliseconds: 100,
            startUpShowAnimation: [{opacity: 1}, {}],
            startUpHide: {opacity: 0},
            switchToManualScrollingIndicator: (event:Object):boolean => (
                event.which > 0 || event.type === 'mousedown' ||
                event.type === 'mousewheel' || event.type === 'touchmove'),
            scrollToTop: {
                inLinearTime: false,
                options: {duration: 'normal'},
                button: {
                    slideDistanceInPixel: 30,
                    showAnimation: {duration: 'normal'},
                    hideAnimation: {duration: 'normal'}
                }
            },
            trackingCode: null,
            windowLoadingCoverHideAnimation: [{opacity: 0}, {}],
            windowLoadingSpinner: {
                animation: 'spinner-line-fade-quick',
                className: 'spinner',
                color: '#000',
                // Corner roundness (0..1)
                corners: 1,
                // 1: clockwise, -1: counterclockwise
                direction: 1,
                // CSS color or array of colors
                fadeColor: 'transparent',
                // Left position relative to parent in px
                left: 'auto',
                // The length of each line
                length: 23,
                // The number of lines to draw
                lines: 9,
                position: 'absolute',
                // The radius of the inner circle
                radius: 40,
                // The rotation offset
                rotate: 0,
                // Scales overall size of the spinner
                scale: 1,
                shadow: false,
                // Rounds per second
                speed: 1.1,
                // Top position relative to parent in px
                top: 'auto',
                // The line thickness
                width: 11,
                // The z-index (defaults to 2000000000)
                zIndex: 2e9
            },
            windowLoadedTimeoutAfterDocumentLoadedInMilliseconds: 2000
        }, startUpAnimationIsComplete:boolean = false,
        currentSectionName:?string = null,
        viewportIsOnTop:boolean = false,
        currentMediaQueryMode:string = '',
        languageHandler:?Language = null,
        analyticsCode:AnalyticsCode = {
            initial: `
                (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=` +
                    'i[r]||function(){' +
                '(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*' +
                    'new window.Date();' +
                'a=s.createElement(o),m=s.getElementsByTagName(o)[0];' +
                    'a.async=1;a.src=g;' +
                'm.parentNode.insertBefore(a,m)})(' +
                `window,document,'script','//www.google-analytics.com/` +
                    `analytics.js','ga');` +
                `window.ga('create', '{1}', '{2}');
                window.ga('set', 'anonymizeIp', true);
                window.ga('send', 'pageview', {page: '{3}'});
            `,
            sectionSwitch: `window.ga('send', 'pageview', {page: '{1}'});`,
            event: `window.ga(
                'send', 'event', eventCategory, eventAction, eventLabel,
                eventValue, eventData);
            `
        }
    ):Promise<Website> {
        this._parentOptions = parentOptions
        this.startUpAnimationIsComplete = startUpAnimationIsComplete
        this.viewportIsOnTop = viewportIsOnTop
        this.currentMediaQueryMode = currentMediaQueryMode
        this.languageHandler = languageHandler
        this._analyticsCode = analyticsCode
        if (currentSectionName)
            this.currentSectionName = currentSectionName
        else if ('location' in $.global && $.global.location.hash)
            this.currentSectionName = $.global.location.hash.substring(
                '#'.length)
        else
            this.currenSectionName = 'home'
        // Wrap event methods with debounceing handler.
        // IgnoreTypeCheck
        this._onViewportMovesToTop = this.constructor.debounce(
            this._onViewportMovesToTop.bind(this))
        // IgnoreTypeCheck
        this._onViewportMovesAwayFromTop = this.constructor.debounce(
            this._onViewportMovesAwayFromTop.bind(this))
        this._options = this.constructor.extend(
            true, {}, this._parentOptions, this._options)
        super.initialize(options)
        this.$domNodes = this.grabDomNode(this._options.domNode)
        this.disableScrolling()
        return new Promise((resolve:Function):void => {
            this._options.windowLoadingCoverHideAnimation[1].always = (
            ):void => {
                this._handleStartUpEffects()
                resolve(this)
            }
            if (this.$domNodes.windowLoadingSpinner.length) {
                this.windowLoadingSpinner = new Spinner(
                    this._options.windowLoadingSpinner)
                this.windowLoadingSpinner.spin(
                    this.$domNodes.windowLoadingSpinner[0])
            }
            this._bindScrollEvents().$domNodes.parent.show()
            if ('window' in this.$domNodes) {
                const onLoaded:Function = ():void => {
                    if (!this.windowLoaded) {
                        this.windowLoaded = true
                        this._removeLoadingCover()
                    }
                }
                $(():Promise<boolean> => this.constructor.timeout(
                    onLoaded, this._options
                        .windowLoadedTimeoutAfterDocumentLoadedInMilliseconds))
                this.on(this.$domNodes.window, 'load', onLoaded)
            }
            this._addNavigationEvents()._addMediaQueryChangeEvents(
            )._triggerWindowResizeEvents()._handleAnalyticsInitialisation()
            if (!this._options.language.logging)
                this._options.language.logging = this._options.logging
            if (this._options.activateLanguageSupport && !this.languageHandler)
                $.Language(this._options.language).then((
                    languageHandler:Language
                ):void => {
                    this.languageHandler = languageHandler
                })
        })
    }
    // endregion
    /**
     * Scrolls to top of page. Runs the given function after viewport arrives.
     * @param onAfter - Callback to call after effect has finished.
     * @returns Returns the current instance.
     */
    scrollToTop(onAfter:Function = Website.noop):Website {
        if (!('document' in $.global))
            return this
        this._options.scrollToTop.options.onAfter = onAfter
        /*
            NOTE: This is a workaround to avoid a bug in "jQuery.scrollTo()"
            expecting this property exists.
        */
        Object.defineProperty($.global.document, 'body', {value: $('body')[0]})
        if (this._options.scrollToTop.inLinearTime) {
            const distanceToTopInPixel:number =
                this.$domNodes.window.scrollTop()
            // Scroll four times faster as we have distance to top.
            this._options.scrollToTop.options.duration =
                distanceToTopInPixel / 4
            this.$domNodes.window.scrollTo(
                {top: `-=${distanceToTopInPixel}`, left: '+=0'},
                this._options.scrollToTop.options)
        } else
            this.$domNodes.window.scrollTo(
                {top: 0, left: 0}, this._options.scrollToTop.options)
        return this
    }
    /**
     * This method disables scrolling on the given web view.
     * @returns Returns the current instance.
     */
    disableScrolling():Website {
        this.$domNodes.parent.addClass('disable-scrolling').on(
            'touchmove', (event:Object):void => event.preventDefault())
        return this
    }
    /**
     * This method disables scrolling on the given web view.
     * @returns Returns the current instance.
     */
    enableScrolling():Website {
        this.off(this.$domNodes.parent.removeClass(
            'disable-scrolling', 'touchmove'))
        return this
    }
    /**
     * Triggers an analytics event. All given arguments are forwarded to
     * configured analytics event code to defined their environment variables.
     * @param parameter - All parameter will be forwarded to the analytics
     * code.
     * @returns Returns the current instance.
     */
    triggerAnalyticsEvent(...parameter:Array<any>):Website {
        if (
            this._options.trackingCode && 'location' in $.global &&
            $.global.location.hostname !== 'localhost'
        ) {
            this.debug(
                'Run analytics code: "#{this._analyticsCode.event}" with ' +
                'arguments:')
            this.debug(parameter)
            try {
                (new Function(
                    'eventCategory', 'eventAction', 'eventLabel', 'eventData',
                    'eventValue', this._analyticsCode.event
                )).call(this, ...parameter)
            } catch (exception) {
                this.warn(
                    'Problem in google analytics event code snippet: {1}',
                    exception)
            }
        }
        return this
    }
    // endregion
    // region protected methods
    // / region event
    /**
     * This method triggers if the viewport moves to top.
     * @returns Returns the current instance.
     */
    _onViewportMovesToTop():Website {
        if (this.$domNodes.scrollToTopButton.css('visibility') === 'hidden')
            this.$domNodes.scrollToTopButton.css('opacity', 0)
        else {
            this._options.scrollToTop.button.hideAnimation.always = (
            ):$DomNode => this.$domNodes.scrollToTopButton.css({
                bottom:
                `-=${this._options.scrollToTop.button.slideDistanceInPixel}`,
                display: 'none'
            })
            this.$domNodes.scrollToTopButton.finish().animate({
                bottom: '+=' +
                    this._options.scrollToTop.button.slideDistanceInPixel,
                opacity: 0
            }, this._options.scrollToTop.button.hideAnimation)
        }
        return this
    }
    /**
     * This method triggers if the viewport moves away from top.
     * @returns Returns the current instance.
     */
    _onViewportMovesAwayFromTop():Website {
        if (this.$domNodes.scrollToTopButton.css('visibility') === 'hidden')
            this.$domNodes.scrollToTopButton.css('opacity', 1)
        else
            this.$domNodes.scrollToTopButton.finish().css({
                bottom: '+=' +
                    this._options.scrollToTop.button.slideDistanceInPixel,
                display: 'block',
                opacity: 0
            }).animate({
                bottom: '-=' +
                    this._options.scrollToTop.button.slideDistanceInPixel,
                queue: false,
                opacity: 1
            }, this._options.scrollToTop.button.showAnimation)
        return this
    }
    /* eslint-disable no-unused-vars */
    /**
     * This method triggers if the responsive design switches to another mode.
     * @param oldMode - Saves the previous mode.
     * @param newMode - Saves the new mode.
     * @returns Returns the current instance.
     */
    _onChangeMediaQueryMode(oldMode:string, newMode:string):Website {
        return this
    }
    /**
     * This method triggers if the responsive design switches to large mode.
     * @param oldMode - Saves the previous mode.
     * @param newMode - Saves the new mode.
     * @returns Returns the current instance.
     */
    _onChangeToLargeMode(oldMode:string, newMode:string):Website {
        return this
    }
    /**
     * This method triggers if the responsive design switches to medium mode.
     * @param oldMode - Saves the previous mode.
     * @param newMode - Saves the new mode.
     * @returns Returns the current instance.
     */
    _onChangeToMediumMode(oldMode:string, newMode:string):Website {
        return this
    }
    /**
     * This method triggers if the responsive design switches to small mode.
     * @param oldMode - Saves the previous mode.
     * @param newMode - Saves the new mode.
     * @returns Returns the current instance.
     */
    _onChangeToSmallMode(oldMode:string, newMode:string):Website {
        return this
    }
    /**
     * This method triggers if the responsive design switches to extra small
     * mode.
     * @param oldMode - Saves the previous mode.
     * @param newMode - Saves the new mode.
     * @returns Returns the current instance.
     */
    _onChangeToExtraSmallMode(oldMode:string, newMode:string):Website {
        return this
    }
    /* eslint-enable no-unused-vars */
    /**
     * This method triggers if we change the current section.
     * @param sectionName - Contains the new section name.
     * @returns Returns the current instance.
     */
    _onSwitchSection(sectionName:string):Website {
        if (
            this._options.trackingCode &&
            this._options.trackingCode !== '__none__' &&
            'location' in $.global &&
            $.global.location.hostname !== 'localhost' &&
            this.currentSectionName !== sectionName
        ) {
            this.currentSectionName = sectionName
            this.debug(
                `Run analytics code: "${this._analyticsCode.sectionSwitch}"`,
                this.currentSectionName)
            try {
                (new Function(this.constructor.stringFormat(
                    this._analyticsCode.sectionSwitch, this.currentSectionName
                )))()
            } catch (exception) {
                this.warn(
                    'Problem in analytics section switch code snippet: {1}',
                    exception)
            }
        }
        return this
    }
    /**
     * This method is complete if last startup animation was initialized.
     * @returns Returns the current instance.
     */
    _onStartUpAnimationComplete():Website {
        this.startUpAnimationIsComplete = true
        return this
    }
    // endregion
    // / region helper
    /**
     * This method adds triggers for responsive design switches.
     * @returns Returns the current instance.
     */
    _addMediaQueryChangeEvents():Website {
        this.on(
            this.$domNodes.window, 'resize',
            this._triggerWindowResizeEvents.bind(this))
        return this
    }
    /**
     * This method triggers if the responsive design switches its mode.
     * @param parameter - All arguments will be appended to the event handler
     * callbacks.
     * @returns Returns the current instance.
     */
    _triggerWindowResizeEvents(...parameter:Array<any>):Website {
        for (
            const classNameMapping:string of
            this._options.mediaQueryClassNameIndicator
        ) {
            this.$domNodes.mediaQueryIndicator.prependTo(
                this.$domNodes.parent
            ).addClass(`hidden-${classNameMapping[1]}`)
            if (
                this.$domNodes.mediaQueryIndicator.is(':hidden') &&
                classNameMapping[0] !== this.currentMediaQueryMode
            ) {
                this.fireEvent(
                    'changeMediaQueryMode', false, this,
                    this.currentMediaQueryMode, classNameMapping[0],
                    ...parameter)
                this.fireEvent(
                    this.constructor.stringFormat(
                        `changeTo{1}Mode`, this.constructor.stringCapitalize(
                            classNameMapping[0])),
                    false, this, this.currentMediaQueryMode,
                    classNameMapping[0], ...parameter)
                this.currentMediaQueryMode = classNameMapping[0]
            }
            this.$domNodes.mediaQueryIndicator.removeClass(
                `hidden-${classNameMapping[1]}`)
        }
        return this
    }
    /**
     * This method triggers if view port arrives at special areas.
     * @param parameter - All arguments will be appended to the event handler
     * callbacks.
     * @returns Returns the current instance.
     */
    _bindScrollEvents(...parameter:Array<any>):Website {
        // Stop automatic scrolling if the user wants to scroll manually.
        if (!('window' in this.$domNodes))
            return this
        const $scrollTarget:$DomNode = $('body, html').add(
            this.$domNodes.window)
        $scrollTarget.on(this._options.knownScrollEventNames, (
            event:Object
        ):void => {
            if (this._options.switchToManualScrollingIndicator(event))
                $scrollTarget.stop(true)
        })
        this.on(this.$domNodes.window, 'scroll', ():void => {
            if (this.$domNodes.window.scrollTop()) {
                if (this.viewportIsOnTop) {
                    this.viewportIsOnTop = false
                    this.fireEvent(
                        'viewportMovesAwayFromTop', false, this, ...parameter)
                }
            } else if (!this.viewportIsOnTop) {
                this.viewportIsOnTop = true
                this.fireEvent('viewportMovesToTop', false, this, ...parameter)
            }
        })
        if (this.$domNodes.window.scrollTop()) {
            this.viewportIsOnTop = false
            this.fireEvent(
                'viewportMovesAwayFromTop', false, this, ...parameter)
        } else {
            this.viewportIsOnTop = true
            this.fireEvent('viewportMovesToTop', false, this, ...parameter)
        }
        return this
    }
    /**
     * This method triggers after window is loaded.
     * @returns Returns the current instance.
     */
    async _removeLoadingCover():Promise<Website> {
        await this.constructor.timeout(
            this._options.additionalPageLoadingTimeInMilliseconds)
        // Hide startup animation dom nodes to show them step by step.
        $(this.constructor.stringFormat(
            '[class^="{1}"], [class*=" {1}"]',
            this.sliceDomNodeSelectorPrefix(
                this._options.domNode.startUpAnimationClassPrefix
            ).substr(1)
        )).css(this._options.startUpHide)
        if (this.$domNodes.windowLoadingCover.length)
            this.enableScrolling().$domNodes.windowLoadingCover.animate(
                ...this._options.windowLoadingCoverHideAnimation)
        else
            this._options.windowLoadingCoverHideAnimation[1].always()
        return this
    }
    /**
     * This method handles the given start up effect step.
     * @param elementNumber - The current start up step.
     * @returns Returns the current instance.
     */
    async _handleStartUpEffects(elementNumber:number = 1):Promise<Website> {
        // Stop and delete spinner instance.
        this.$domNodes.windowLoadingCover.hide()
        if (this.windowLoadingSpinner)
            this.windowLoadingSpinner.stop()
        if ($(this.constructor.stringFormat(
            '[class^="{1}"], [class*=" {1}"]',
            this.sliceDomNodeSelectorPrefix(
                this._options.domNode.startUpAnimationClassPrefix
            ).substr(1)
        )).length) {
            await this.constructor.timeout(
                this._options.startUpAnimationElementDelayInMiliseconds)
            let lastElementTriggered:boolean = false
            this._options.startUpShowAnimation[1].always = ():void => {
                if (lastElementTriggered)
                    this.fireEvent('startUpAnimationComplete')
            }
            const $domNode:$DomNode = $(
                this._options.domNode.startUpAnimationClassPrefix +
                    elementNumber)
            $domNode.animate(...this._options.startUpShowAnimation)
            if ($(this._options.domNode.startUpAnimationClassPrefix + (
                elementNumber + 1
            )).length)
                await this._handleStartUpEffects(elementNumber + 1)
            else
                lastElementTriggered = true
        } else
            this.fireEvent('startUpAnimationComplete')
        return this
    }
    /**
     * This method adds triggers to switch section.
     * @returns Returns the current instance.
     */
    _addNavigationEvents():Website {
        if ('addEventListener' in $.global)
            $.global.addEventListener('hashchange', ():void => {
                if (this.startUpAnimationIsComplete)
                    this.fireEvent(
                        'switchSection', false, this, location.hash.substring(
                            '#'.length))
            }, false)
        return this._handleScrollToTopButton()
    }
    /**
     * Adds trigger to scroll top buttons.
     * @returns Returns the current instance.
     */
    _handleScrollToTopButton():Website {
        this.on(this.$domNodes.scrollToTopButton, 'click', (
            event:Object
        ):void => {
            event.preventDefault()
            this.scrollToTop()
        })
        return this
    }
    /**
     * Executes the page tracking code.
     * @returns Returns the current instance.
     */
    _handleAnalyticsInitialisation():Website {
        if (
            this._options.trackingCode &&
            this._options.trackingCode !== '__none__' &&
            'location' in $.global &&
            $.global.location.hostname !== 'localhost'
        ) {
            this.debug(
                `Run analytics code: "${this._analyticsCode.initial}"`,
                this._options.trackingCode, this._options.domain,
                this.currentSectionName)
            try {
                (new Function(this.constructor.stringFormat(
                    this._analyticsCode.initial, this._options.trackingCode,
                    this._options.domain, this.currentSectionName
                )))()
            } catch (exception) {
                this.warn(
                    'Problem in analytics initial code snippet: {1}',
                    exception)
            }
            this.on(this.$domNodes.parent.find('a, button'), 'click', (
                event:Object
            ):void => {
                const $domNode:$DomNode = $(event.target)
                this.triggerAnalyticsEvent(
                    this.currentSectionName, 'click', $domNode.text(),
                    event.data || {}, $domNode.attr(
                        'website-analytics-value'
                    ) || 1)
            })
        }
        return this
    }
    // / endregion
    // endregion
}
export default Website
// endregion
$.Website = (...parameter:Array<any>):any => $.Tools().controller(
    Website, parameter)
$.Website.class = Website
// region vim modline
// vim: set tabstop=4 shiftwidth=4 expandtab:
// vim: foldmethod=marker foldmarker=region,endregion:
// endregion
