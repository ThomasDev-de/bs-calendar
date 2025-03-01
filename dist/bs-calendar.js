// noinspection JSUnresolvedReference,JSValidateTypes

/**
 * @fileOverview A jQuery plugin to create and manage a Bootstrap-based calendar with rich configuration options.
 *               This plugin provides functionalities for dynamic calendar creation, updating views,
 *               handling user interactions, and more. It is designed to be flexible, allowing customization
 *               through defined default settings or options provided at runtime.
 *
 * @author Thomas Kirsch
 * @version 1.0.0
 * @license MIT
 * @requires "jQuery" ^3
 * @requires "Bootstrap" ^v4 | ^v5
 *
 * @description
 * This file defines a jQuery plugin `bsCalendar` that can be used to instantiate and manage a Bootstrap-based calendar
 * with various views such as day, week, month, and year. The plugin allows for customization via options and methods,
 * enabling the implementation of advanced functionalities like setting appointments, clearing schedules, updating views,
 * and much more.
 *
 * Features:
 * - Configurable default settings, including locale, start date, start week day, view types, and translations.
 * - Methods for interaction, such as clearing elements, setting dates, and dynamically updating calendar options.
 * - Support for fetching appointments and populating the calendar dynamically.
 * - Fully responsive design adhering to Bootstrap's standards.
 *
 * Usage:
 * Initialize the calendar:
 * ```JavaScript
 * $('#calendar').bsCalendar({ startView: 'week', locale: 'de-DE' });
 * ```
 * Call a method:
 * ```JavaScript
 * $('#calendar').bsCalendar('refresh');
 * ```
 *
 * See the individual method and function documentation in this file for more details.
 *
 * @file bs-calendar.js
 * @date 2025-02-21
 * @global jQuery
 */

(function ($) {
    $.bsCalendar = {
        setDefaults: function (options) {
            this.DEFAULTS = $.extend(true, {}, this.DEFAULTS, options || {});
        },
        getDefaults: function () {
            return this.DEFAULTS;
        },
        DEFAULTS: {
            locale: 'en-EN',
            startWeekOnSunday: true,
            rounded: 5, // 1-5
            search: true,
            startDate: new Date(),
            startView: 'month', // day, week, month, year
            defaultColor: 'var(--bs-danger)',
            views: ['year', 'month', 'week', 'day'],
            translations: {
                day: 'Day',
                week: 'Week',
                month: 'Month',
                year: 'Year',
                today: 'Today',
                appointment: 'Appointment',
                search: 'Search',
                searchNoResult: 'No results found'
            },
            icons: {
                day: 'bi bi-calendar-day',
                week: 'bi bi-calendar-week',
                month: 'bi bi-calendar-month',
                year: 'bi bi-calendar4',
                add: 'bi bi-plus-lg',
                search: 'bi bi-search',
                prev: 'bi bi-chevron-left',
                next: 'bi bi-chevron-right',
                link: 'bi bi-box-arrow-up-right',
                appointment: 'bi bi-clock',
                appointmentAllDay: 'bi bi-circle-fill',
                timeSlot: 'bi bi-caret-right-fill',
            },
            url: null,
            queryParams: null,
            sidebarAddons: null,
            debug: false,
            formatInfoWindow: formatInfoWindow,
            formatDuration: formatDuration,
        }
    };

    const viewContainerClass = 'wc-calendar-view-container';

    /**
     * jQuery plugin that initializes and manages a Bootstrap-based calendar.
     * Provides functionality for creating, updating, and interacting with a dynamic calendar widget.
     *
     * @function
     * @name $.fn.bsCalendar
     * @param {Object|undefined|string} optionsOrMethod - Configuration options for the calendar.
     * @param {Object|undefined|string} params - Configuration options for the calendar.
     * @returns {jQuery} An instance of jQuery that allows for method chaining.
     */
    $.fn.bsCalendar = function (optionsOrMethod, params) {
        if ($(this).length > 1) {
            return $(this).each(function (i, e) {
                return $(e).bsCalendar(optionsOrMethod, params);
            });
        }

        const optionsGiven = typeof optionsOrMethod === 'object';
        const methodGiven = typeof optionsOrMethod === 'string';

        const wrapper = $(this);
        if (!wrapper.data('initBsCalendar')) {
            let settings = $.bsCalendar.getDefaults();

            if (wrapper.data() || optionsGiven) {
                settings = $.extend(true, {}, settings, wrapper.data(), optionsOrMethod || {});
            }

            setSettings(wrapper, settings);
            init(wrapper).then(() => {
                // do nothing
            });
        }

        if (methodGiven) {
            const inSearchMode = getSearchMode(wrapper);
            switch (optionsOrMethod) {
                case 'refresh':
                    methodRefresh(wrapper, params);
                    break;
                case 'clear':
                    if (!inSearchMode) {
                        methodClear(wrapper);
                    }
                    break;
                case 'updateOptions':
                    methodUpdateOptions(wrapper, params);
                    break;
                case 'destroy':
                    destroy(wrapper);
                    break;
                case 'setDate':
                    if (!inSearchMode) {
                        methodSetDate(wrapper, params);
                    }
                    break;
                case 'setToday':
                    if (!inSearchMode) {
                        setToday(wrapper, params);
                    }
                    break;
            }
        }

        return wrapper;
    }

    /**
     * Sets today's date in the specified wrapper and optionally updates the view.
     * If a new view is passed and differs from the current view, it will switch to the new view.
     * It Also triggers the fetching of appointments and updates the view accordingly.
     *
     * @param {jQuery} $wrapper - The wrapper object containing the calendar or context-related elements.
     * @param {string} [view] - The optional view to set (e.g., 'day', 'week', 'month').
     *                          Should be included in the available views defined in settings.
     * @return {void} - Does not return a value.
     */
    function setToday($wrapper, view) {
        const settings = getSettings($wrapper);
        if (view && settings.views.includes(view)) {
            const viewBefore = getView($wrapper);
            if (viewBefore !== view) {
                setView($wrapper, view);
            }
        }
        const date = new Date();
        setDate($wrapper, date);
        buildByView($wrapper);
    }

    /**
     * Sets the date and optionally updates the view based on the provided object.
     * This method is responsible for managing date and view changes within the given wrapper.
     *
     * @param {jQuery} $wrapper - The wrapper element where settings are applied.
     * @param {string|Date|Object} object - The date or object containing date and view details.
     *        If a string, it is converted to a Date object. If a Date instance, it is directly used.
     *        If an object, it may contain:
     *        - `date` (string|Date): Represents the target date to set.
     *        - `view` (string): Represents the target view to set, validated against available views in settings.
     * @return {void} This method does not return a value.
     */
    function methodSetDate($wrapper, object) {
        const settings = getSettings($wrapper);
        let date = null;
        if (typeof object === "string") {
            date = new Date(object);
        } else if (object instanceof Date) {
            date = object;
        } else if (typeof object === "object") {
            if (object.hasOwnProperty('date')) {
                if (typeof object.date === "string") {
                    date = new Date(object.date);
                } else if (object.date instanceof Date) {
                    date = object.date;
                }
            }
            if (object.hasOwnProperty('view') && settings.views.includes(object.view)) {
                const viewBefore = getView($wrapper);
                if (viewBefore !== object.view) {
                    setView($wrapper, object.view);
                }
            }
        }


        if (date) {
            setDate($wrapper, date);
        }

        buildByView($wrapper);
    }

    /**
     * Clears all appointment-related elements within the specified
     * wrapper and resets its appointment list.
     *
     * @param {jQuery} $wrapper The jQuery object representing the wrapper containing elements to be cleared.
     * @return {void} This method does not return any value.
     */
    function methodClear($wrapper, removeAppointments = true) {
        $wrapper.find('[data-appointment]').remove();
        $wrapper.find('.popover').remove();
        if (removeAppointments) {
            setAppointments($wrapper, []);
        }
    }

    /**
     * Destroys and cleans up the specified wrapper element by removing associated data and content.
     *
     * @param {jQuery} $wrapper - The jQuery-wrapped DOM element to be cleaned up and reset.
     * @return {void} Does not return a value.
     */
    function destroy($wrapper) {
        $wrapper.removeData('initBsCalendar');
        $wrapper.removeData('settings');
        $wrapper.removeData('view');
        $wrapper.removeData('date');
        $wrapper.removeData('appointments');
        $wrapper.removeData('searchMode');
        $wrapper.empty();
    }

    /**
     * Updates the settings of a given wrapper element with the provided options.
     *
     * @param {jQuery} $wrapper - The jQuery-wrapped DOM element to which settings are applied.
     * @param {Object} options - An object containing new configuration options to update the settings.
     * @return {void} This method does not return a value.
     */
    function methodUpdateOptions($wrapper, options) {
        if (typeof options === 'object') {
            const settingsBefore = getSettings($wrapper);
            const newSettings = $.extend(true, {}, $.bsCalendar.getDefaults(), $wrapper.data(), settingsBefore, options || {});
            destroy($wrapper);
            setSettings($wrapper, newSettings);
            init($wrapper).then(() => {
                // do nothing
            });
        }
    }

    /**
     * Updates and applies settings for a given wrapper element based on the provided parameters.
     *
     * @param {jQuery} $wrapper - The DOM element representing the wrapper where settings are applied.
     * @param {Object} object - The configuration object with optional keys to update settings.
     * @param {string} [object.url] - The URL to update and fetch appointment data from.
     * @param {string} [object.view] - The view name to set if it exists in the available views.
     * @param {Function} [object.queryParams] - A callback function to define or modify query parameters.
     *
     * @return {void} Does not return a value.
     */
    function methodRefresh($wrapper, object) {
        // Retrieve the current settings for the given wrapper.
        const settings = getSettings($wrapper);
        // Flag to track if settings need to be updated.
        let changeSettings = false;
        let rebuildView = false;
        // Check if 'params' is an object.
        if (typeof object === 'object') {
            // If 'params' contains 'url', update the 'url' in settings.
            if (object.hasOwnProperty('url')) {
                settings.url = object.url;
                // Mark that settings have been changed.
                changeSettings = true;
            }

            if (object.hasOwnProperty('view') && settings.views.includes(object.view)) {
                setView($wrapper, object.view);

                rebuildView = true;
                changeSettings = true;
            }

            if (object.hasOwnProperty('queryParams') && typeof object.queryParams === 'function') {
                // If 'params' contains 'queryParams' and it is a function, update it in settings.
                settings.queryParams = object.queryParams;
                // Mark that settings have been changed.
                changeSettings = true;
            }
        }
        if (changeSettings) {
            // Save the updated settings if any changes were made.
            setSettings($wrapper, settings);
        }
        if (rebuildView) {
            buildByView($wrapper);
        }
        // Trigger the process to fetch updated appointment data.
        fetchAppointments($wrapper);
    }

    /**
     * Formats a duration object into a human-readable string.
     *
     * @param {Object} duration - The duration object containing time components.
     * @return {string} A formatted string representing the duration in the format of "Xd Xh Xm Xs".
     * If all components are zero, returns "0s".
     */
    function formatDuration(duration) {
        const parts = [];

        if (duration.days > 0) {
            parts.push(`${duration.days}d`);
        }
        if (duration.hours > 0) {
            parts.push(`${duration.hours}h`);
        }
        if (duration.minutes > 0) {
            parts.push(`${duration.minutes}m`);
        }
        if (duration.seconds > 0) {
            parts.push(`${duration.seconds}s`);
        }

        return parts.length > 0 ? parts.join(' ') : '0s';
    }

    /**
     * Formats an HTML string for an information window based on the given appointment data.
     *
     * @param {Object} appointment - The appointment object containing details to format the information window.
     * @return {string} An HTML string representing the formatted information window for the appointment.
     */
    function formatInfoWindow(appointment) {
        const description = appointment.hasOwnProperty('description') ? '<p>' + appointment.description + '</p>' : '';
        const color = appointment.hasOwnProperty('color') ? `<i class="bi bi-circle-fill me-2" style="color: ${appointment.color}"></i>` : '';
        const link = appointment.hasOwnProperty('link') ? `<a href="${appointment.link}" target="_blank" class="btn btn-primary btn-sm mt-3">open</a>` : '';
        const start = new Date(appointment.start);
        const end = new Date(appointment.end);
        const startFormatted = start.toLocaleString('de-DE', {dateStyle: 'short', timeStyle: 'short'});
        const endFormatted = end.toLocaleString('de-DE', {dateStyle: 'short', timeStyle: 'short'});
        const isAllDay = appointment.hasOwnProperty('allDay') && appointment.allDay;
        const duration = isAllDay ? '' : $.bsCalendar.getDefaults().formatDuration(appointment.duration);
        const startEnd = [
            `<span>Start: ${startFormatted}</span>`,
            `<span>End: ${endFormatted}</span>`,
            `<span>Duration: ${duration}</span>`,
        ];
        const period = isAllDay ?
            `<span class="badge bg-info">all day</span>` :
            startEnd.join('');
        return [
            `<div class="d-flex flex-column">`,
            `<h4>${color}${appointment.title}</h4>`,
            description,
            period,
            link,
            `</div>`
        ].join('');
    }

    function log(message, ...params) {
        if (window.console && window.console.log) {
            window.console.log('bsCalendar LOG: ' + message, ...params);
        }
    }

    /**
     * Triggers a specified event on a given wrapper element with optional parameters.
     *
     * @param {jQuery} $wrapper The jQuery wrapper element on which the event will be triggered.
     * @param {string} event The name of the event to be triggered.
     * @param {...any} params Additional parameters to pass to the event when triggered.
     * @return {void} Does not return a value.
     */
    function trigger($wrapper, event, ...params) {
        const settings = getSettings($wrapper);
        const p = params && params.length > 0 ? params : [];

        if (settings.debug) {
            if (p.length > 0) {
                log('Triggering event:', event, 'with params:', ...p);
            } else {
                log('Triggering event:', event, 'without params');
            }

        }

        if (event !== 'all') {
            // "all"-Event direkt auslösen
            $wrapper.trigger('all.bs.calendar', event, ...p);

            // Spezifisches Event direkt auslösen
            $wrapper.trigger(`${event}.bs.calendar`, ...p);
        }
    }


    /**
     * Initializes the given wrapper element by setting up required data, structures, and event handlers.
     *
     * @param {jQuery} $wrapper - The wrapper element to initialize.
     * @return {Promise<Object>} A promise that resolves with the initialized wrapper or rejects with an error.
     */
    function init($wrapper) {
        return new Promise((resolve, reject) => {
            try {
                const settings = getSettings($wrapper);
                if (!settings.hasOwnProperty('views') || settings.views.length === 0) {
                    settings.views = ['day', 'week', 'month', 'year'];
                    setSettings($wrapper, settings);
                }
                if (!settings.hasOwnProperty('startView') || !settings.startView) {
                    settings.startView = 'month';
                    setSettings($wrapper, settings);
                }
                if (!settings.views.includes(settings.startView)) {
                    settings.startView = settings.views[0];
                    setSettings($wrapper, settings);
                }
                setView($wrapper, settings.startView);
                setDate($wrapper, settings.startDate);
                setSearchMode($wrapper, false);
                buildFramework($wrapper);
                handleEvents($wrapper);

                buildMonthSmallView($wrapper, getDate($wrapper), $('.wc-calendar-month-small'));
                buildByView($wrapper);

                $wrapper.data('initBsCalendar', true);
                if (settings.debug) {
                    log('bsCalendar initialized');
                }
                trigger($wrapper, 'init');

                resolve($wrapper);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Sets the appointments after sorting and calculating their durations,
     * then stores them in the given wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery wrapper element where the appointment data will be stored.
     * @param {Array<Object>} appointments - An array of appointment objects to be processed and stored.
     * @return {void} Does not return a value.
     */
    function setAppointments($wrapper, appointments) {
        if (appointments && Array.isArray(appointments) && appointments.length > 0) {

            appointments = sortAppointmentByStart(appointments);
            appointments = splitMultiDayAppointments(appointments);
            calculateAppointmentDurations($wrapper, appointments);
        } else {
            appointments = [];
        }

        $wrapper.data('appointments', appointments);
    }

    /**
     * Sorts a list of appointments by their start time in ascending order.
     *
     * @param {Array<Object>} appointments - An array of appointment objects where each object contains a 'start' property representing the starting time of the appointment.
     * @return {Array<Object>} The sorted array of appointment objects in ascending order of their start times.
     */
    function sortAppointmentByStart(appointments) {
        appointments.sort((a, b) => {
            // All-Day-Termine zuerst
            if (a.allDay && !b.allDay) {
                return -1; // a vor b
            }
            if (!a.allDay && b.allDay) {
                return 1; // b vor a
            }

            // Innerhalb gleicher Kategorie nach Startdatum sortieren
            return new Date(a.start) - new Date(b.start);
        });

        return appointments;
    }

    /**
     * Retrieves the list of appointments associated with the provided wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery wrapper element containing the appointment data.
     * @return {Array<Object>} The appointment data stored in the wrapper element, or undefined if no data is found.
     */
    function getAppointments($wrapper) {
        return $wrapper.data('appointments');
    }

    /**
     * Splits multi-day appointments into individual days, assigning additional metadata to each appointment.
     * Each appointment will include a list of all dates it spans and a flag indicating if it is a single-day appointment.
     *
     * @param {Array} appointments - An array of appointment objects. Each appointment object must have `start` and `end` properties in ISO date format.
     * @return {Array} - The modified array of appointment objects with the added `isSingleDay` boolean and `displayDates` array properties.
     */
    function splitMultiDayAppointments(appointments) {
        appointments.forEach(appointment => {
            const start = new Date(appointment.start);
            const end = new Date(appointment.end);

            // Array, das alle Tage zwischen Start und Ende enthält
            const displayDates = [];
            let tempDate = new Date(start); // Basis (Startdatum)

            // Sorge dafür, dass tempDate nur den Datumsteil berücksichtigt (ohne Uhrzeit)
            tempDate.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            while (tempDate <= end) {
                // Datum zum Array hinzufügen (ohne Zeitzonenfehler, Lokale Zeit)
                displayDates.push(
                    `${tempDate.getFullYear()}-${(tempDate.getMonth() + 1)
                        .toString()
                        .padStart(2, '0')}-${tempDate.getDate()
                        .toString()
                        .padStart(2, '0')}`
                );

                // TempDate auf den nächsten Tag erhöhen
                tempDate.setDate(tempDate.getDate() + 1);
            }

            // Zusätzliche Daten zuweisen
            appointment.isSingleDay = displayDates.length === 1;
            appointment.displayDates = displayDates;
        });

        return appointments; // Das Array der erweiterten Termine zurückgeben
    }

    /**
     * Builds a dynamic framework for a calendar application within the specified wrapper element.
     * This method initializes and structures the user interface by adding navigation components,
     * buttons, and view containers.
     *
     * @param {jQuery} $wrapper The DOM element (wrapped in a jQuery object) where the framework will be built.
     * @return {void} Does not return a value; modifies the provided wrapper element directly.
     */
    function buildFramework($wrapper) {

        const settings = getSettings($wrapper);
        // Clear the wrapper first
        $wrapper.empty();

        const innerWrapper = $('<div>', {
            class: 'd-flex flex-column align-items-stretch h-100 w-100'
        }).appendTo($wrapper);

        const topNav = $('<div>', {
            class: 'd-flex sticky-top align-items-center px-0 justify-content-end mb-3 wc-calendar-top-nav  bg-body-tertiary rounded-' + settings.rounded
        }).appendTo(innerWrapper);

        $('<button>', {
            class: `btn rounded-${settings.rounded} border-3 border`,
            html: `<i class="${settings.icons.add} fs-5"></i>`,
            'data-add-appointment': true
        }).appendTo(topNav);

        $('<div>', {
            class: 'spinner-border me-auto mr-auto mx-3 text-secondary wc-calendar-spinner',
            css: {
                display: 'none'
            },
            role: 'status',
            html: '<span class="visually-hidden">Loading...</span>'
        }).appendTo(topNav);

        $('<div>', {
            class: 'me-auto mr-auto',
        }).appendTo(topNav);


        $('<div>', {
            class: 'd-flex ms-2 align-items-center justify-content-center wc-nav-view-wrapper flex-nowrap text-nowrap',
            html: [
                '<small class="wc-nav-view-name mr-3 me-3"></small>',
                `<a data-prev href="#"><i class="${settings.icons.prev}"></i></a>`,
                `<a class="mx-2" data-next href="#"><i class="${settings.icons.next}"></i></a>`,
            ].join('')
        }).appendTo(topNav);

        if (settings.search) {

            const uniqueId = 'collapse_' + Math.random().toString(36).substr(2, 9);
            $('<a>', {
                class: `btn rounded-${settings.rounded} border-3 border js-btn-search`,
                html: `<i class="${settings.icons.search}"></i>`,
                'data-bs-toggle': 'collapse',
                'data-toggle': 'collapse',
                'aria-expanded': 'false',
                'aria-controls': uniqueId,
                'href': '#' + uniqueId,
            }).appendTo(topNav);

            const collapse = $('<div>', {
                id: uniqueId,
                class: 'collapse'
            }).insertAfter(topNav);

            const collapseInner = $('<div>', {
                class: 'd-flex align-items-center justify-content-center pb-3 js-search-input-wrapper',
            }).appendTo(collapse);

            $('<input>', {
                type: 'search',
                css: {
                    maxWidth: '400px',
                },
                class: 'form-control rounded-' + settings.rounded + ' border-3 border',
                placeholder: settings.translations.search || 'search',
                'data-search-input': true
            }).appendTo(collapseInner);
        }

        $('<button>', {
            class: `btn rounded-${settings.rounded} border-3 ms-2 border`,
            html: settings.translations.today,
            'data-today': true
        }).appendTo(topNav);

        // If only one view is desired, give no selection
        if (settings.views.length > 1) {
            const dropDownView = $('<div>', {
                class: 'dropdown wc-select-calendar-view ms-2',
                html: [
                    `<a class="btn rounded-${settings.rounded} border border-3 dropdown-toggle" href="#" role="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false">`,
                    '</a>',
                    '<ul class="dropdown-menu">',
                    '</ul>',
                ].join('')
            }).appendTo(topNav);


            settings.views.forEach(view => {
                $('<li>', {
                    html: `<a class="dropdown-item" data-view="${view}" href="#"><i class="${settings.icons[view]} me-2 mr-2"></i> ${settings.translations[view]}</a>`
                }).appendTo(dropDownView.find('ul'));
            });
        }

        const container = $('<div>', {
            class: 'd-flex flex-fill wc-calendar-container'
        }).appendTo(innerWrapper);

        const leftBar = $('<div>', {
            class: 'wc-calendar-left-nav d-xl-flex d-none flex-column me-4 mr-4',
            html: [
                '<div class="pb-3">',
                '<div class="d-flex justify-content-between">',
                '<small class="wc-nav-view-small-name me-3 mr-3"></small>',
                '<div>',
                `<a data-prev href="#"><i class="${settings.icons.prev}"></i></a>`,
                `<a class="ml-2 ms-2" data-next href="#"><i class="${settings.icons.next}"></i></a>`,
                '</div>',
                '</div>',
                '</div>',
                '<div class="wc-calendar-month-small"></div>'
            ].join('')
        }).appendTo(container);

        if (settings.sidebarAddons) {
            $(settings.sidebarAddons).appendTo(leftBar);
        }

        $('<div>', {
            class: `container-fluid ${viewContainerClass} border-1 rounded-${settings.rounded} flex-fill border overflow-hidden  d-flex flex-column align-items-stretch`
        }).appendTo(container);

    }

    /**
     * Updates the elements displaying the current date information based on the provided wrapper's settings, date, and view.
     *
     * @param {jQuery} $wrapper The wrapper object containing settings, date, and view for obtaining and formatting the current date.
     * @return {void} Does not return a value, directly updates the text content of the targeted elements with formatted date information.
     */
    function setCurrentDateName($wrapper) {
        const settings = getSettings($wrapper);
        const date = getDate($wrapper);
        const view = getView($wrapper);
        const el = $('.wc-nav-view-name');
        const elSmall = $('.wc-nav-view-small-name');
        const dayName = date.toLocaleDateString(settings.locale, {day: 'numeric'});
        const weekdayName = date.toLocaleDateString(settings.locale, {weekday: 'long'});
        const monthName = date.toLocaleDateString(settings.locale, {month: 'long'});
        const yearName = date.toLocaleDateString(settings.locale, {year: 'numeric'});
        const calendarWeek = getCalendarWeek(date);
        switch (view) {
            case 'day':
                el.text(weekdayName + ', ' + dayName + ' ' + monthName + ' ' + yearName);
                break;
            case 'week':
                el.text('KW ' + calendarWeek + ' / ' + monthName + ' ' + yearName);
                break;
            case 'month':
                el.text(monthName + ' ' + yearName);
                break;
            case 'year':
                el.text(yearName);
                break;
        }
        elSmall.text(monthName + ' ' + yearName);

    }

    /**
     * Navigates back in time based on the current view type (month, year, week, or day).
     *
     * @param {jQuery} $wrapper - The wrapper object containing the current view and date context.
     * @return {void} The function performs navigation and updates the date in the wrapper object.
     */
    function navigateBack($wrapper) {
        const view = getView($wrapper);
        const date = getDate($wrapper);
        const newDate = new Date(date);
        switch (view) {
            case 'month':
                newDate.setMonth(newDate.getMonth() - 1); // Einen Monat subtrahieren

                // Überprüfen, ob der Tag im neuen Monat existiert
                if (newDate.getDate() !== date.getDate()) {
                    // Falls nicht, auf den ersten Tag des neuen Monats setzen
                    newDate.setDate(1);
                }
                break;
            case 'year':
                newDate.setFullYear(newDate.getFullYear() - 1);
                newDate.setDate(1);
                break;
            case 'week':
                newDate.setDate(newDate.getDate() - 7);
                break;
            case 'day':
                newDate.setDate(newDate.getDate() - 1);
                break;
        }
        setDate($wrapper, newDate);
        buildByView($wrapper);
    }

    /**
     * Navigates forward in the calendar based on the current view (e.g. day, week, month, year).
     * Updates the date and rebuilds the view accordingly.
     *
     * @param {jQuery} $wrapper - The wrapper element that contains the calendar state and view information.
     * @return {void} - This function does not return a value. It updates the calendar state directly.
     */
    function navigateForward($wrapper) {
        const view = getView($wrapper);
        const date = getDate($wrapper);
        const newDate = new Date(date);
        switch (view) {
            case 'month':
                newDate.setMonth(newDate.getMonth() + 1); // Einen Monat subtrahieren

                // Überprüfen, ob der Tag im neuen Monat existiert
                if (newDate.getDate() !== date.getDate()) {
                    // Falls nicht, auf den ersten Tag des neuen Monats setzen
                    newDate.setDate(1);
                }
                break;
            case 'year':
                newDate.setFullYear(newDate.getFullYear() + 1);
                newDate.setDate(1);
                break;
            case 'week':
                newDate.setDate(newDate.getDate() + 7);
                break;
            case 'day':
                newDate.setDate(newDate.getDate() + 1);
                break;

        }
        setDate($wrapper, newDate);
        buildByView($wrapper);
    }

    function toggleSearchMode($wrapper, status, manual = false) {
        // return;
        const a = $wrapper.find('.js-btn-search');
        const input = getSearchElement($wrapper)
        const collapse = $wrapper.find(a.attr('href'));
        const navElements = $('[class*="wc-nav-view-"]');
        const settings = getSettings($wrapper);
        const selectView = getSelectViewElement($wrapper);
        const todayButton = getTodayButtonElement($wrapper);
        const addButton = getAddButtonElement($wrapper);
        const selectViewElementDropDownItems = selectView.find('.dropdown-item');
        if (status) {
            setSearchMode($wrapper, true);
            a.addClass('btn-primary');
            if (manual) {
                collapse.collapse('show');
            }
            buildByView($wrapper);
            selectView.addClass('opacity-50')
            todayButton.addClass('opacity-50')
            navElements.addClass('opacity-50');
            addButton.addClass('opacity-50');
            input.focus();
        } else {
            setSearchMode($wrapper, false);
            a.removeClass('btn-primary');
            input.val(null);
            if (manual) {
                collapse.collapse('hide');
            }
            selectView.removeClass('opacity-50')
            todayButton.removeClass('opacity-50');
            navElements.removeClass('opacity-50');
            addButton.removeClass('opacity-50');
            input.appendTo('.js-search-input-wrapper');
        }

        // navElements.toggle('disabled');
        navElements.prop('disabled', status);
        selectViewElementDropDownItems.toggleClass('disabled', status);
    }

    function setSearchMode($wrapper, status) {
        $wrapper.data('searchMode', status);
    }

    function getSearchMode($wrapper) {

        return $wrapper.data('searchMode');
    }

    function inSearchMode($wrapper) {
        return $wrapper.data('searchMode') || false;
    }

    /**
     * Attaches event listeners to a given wrapper element to handle user interactions with the calendar interface.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the main wrapper element of the calendar.
     *
     * @return {void} This function does not return a value.
     */
    function handleEvents($wrapper) {
        let searchTimeout;
        $wrapper
            .on('show.bs.collapse', '.collapse', function (e) {
                toggleSearchMode($wrapper, true);
            })
            .on('hide.bs.collapse', '.collapse', function (e) {
                toggleSearchMode($wrapper, false);
                buildByView($wrapper)
            })
            .on('keyup input', '[data-search-input]', function (e) {
                e.preventDefault();
                const input = $(this);
                input.appendTo('.js-search-input-wrapper');
                input.focus();
                // only when I am in search mode
                if (getSearchMode($wrapper)) {
                    // delete previous timeouts
                    if (searchTimeout) {
                        clearTimeout(searchTimeout);
                    }
                    // Set delay
                    searchTimeout = setTimeout(() => {
                        buildByView($wrapper);
                    }, 400)
                } else {
                    clearTimeout(searchTimeout);
                }
            })
            .on('click', '[data-add-appointment]', function (e) {
                e.preventDefault();
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    e.stopPropagation();
                } else {
                    const view = getView($wrapper);
                    const period = getStartAndEndDateByView($wrapper);
                    const data = {
                        date: period.date,
                        view: {
                            type: view,
                            start: period.start,
                            end: period.end
                        }
                    };
                    trigger($wrapper, 'add', [data]);
                }
            })
            .on('click', '[data-today]', function (e) {
                e.preventDefault();
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    e.stopPropagation();
                } else {
                    setToday($wrapper);
                }

            })
            .on('click touchend', '[data-appointment]', function (e) {
                const clickedOnDate = $(e.target).is('[data-date]');
                const clickedOnMonth = $(e.target).is('[data-month]');
                const clickedOnToday = $(e.target).is('[data-today]');
                const clickedOnAncor = $(e.target).is('a[href]') || $(e.target).closest('a[href]').length > 0;
                // check whether the goal is a [data date] or a link with [href]
                if (clickedOnToday || clickedOnDate || clickedOnMonth || clickedOnAncor) {
                    // stop the execution of the parent event
                    e.stopPropagation();
                    return;
                }

                e.preventDefault();
                const element = $(e.currentTarget);
                element.popover('hide');
                element.removeClass('text-bg-light');

                const settings = getSettings($wrapper);
                const appointment = element.data('appointment');
                trigger($wrapper, 'edit', [appointment, element]);
            })
            .on('click', '[data-date]', function (e) {
                e.preventDefault();
                const settings = getSettings($wrapper);
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    toggleSearchMode($wrapper, false, true);
                }
                if (settings.views.includes('day')) {
                    const date = new Date($(e.currentTarget).attr('data-date'));
                    setView($wrapper, 'day');
                    setDate($wrapper, date);
                    buildByView($wrapper);
                }
            })
            .on('click', '[data-month]', function (e) {
                e.preventDefault();
                const settings = getSettings($wrapper);
                if (settings.views.includes('month')) {
                    const date = new Date($(e.currentTarget).attr('data-month'));
                    setView($wrapper, 'month');
                    setDate($wrapper, date);
                    buildByView($wrapper);
                }
            })
            .on('click', '[data-prev]', function (e) {
                e.preventDefault();
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    e.stopPropagation();
                } else {
                    navigateBack($wrapper);
                }
            })
            .on('click', '[data-next]', function (e) {
                e.preventDefault();
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    e.stopPropagation();
                } else {
                    navigateForward($wrapper);
                }
            })
            .on('click', '.wc-select-calendar-view [data-view]', function (e) {
                e.preventDefault();
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    e.stopPropagation();
                } else {
                    setView($wrapper, $(e.currentTarget).data('view'));
                    buildByView($wrapper);
                }
            })
    }

    function getSelectViewElement($wrapper) {
        return $wrapper.find('.wc-select-calendar-view');
    }

    function getTodayButtonElement($wrapper) {
        return $wrapper.find('[data-today]');
    }

    function getAddButtonElement($wrapper) {
        return $wrapper.find('[data-add-appointment]');
    }

    function isValueEmpty(value) {
        if (value === null || value === undefined) {
            return true; // Null or undefined
        }
        if (Array.isArray(value)) {
            return value.length === 0; // Empty array
        }
        if (typeof value === 'string') {
            return value.trim().length === 0; // Empty string (including only spaces)
        }
        return false; // All other values are considered non-empty (including numbers)
    }

    /**
     * Updates the dropdown view by modifying the active item in the dropdown menu
     * based on the view currently set in the wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element containing the dropdown and view information.
     * @return {void} This function does not return any value.
     */
    function updateDropdownView($wrapper) {
        const dropdown = getSelectViewElement($wrapper);
        const view = getView($wrapper);
        dropdown.find('.dropdown-item.active').removeClass('active');
        dropdown.find(`[data-view="${view}"]`).addClass('active');
        const activeItem = dropdown.find(`[data-view="${view}"]`);

        dropdown.find('.dropdown-toggle').html(activeItem.html());
    }


    /**
     * Retrieves the 'view' data attribute from the given wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element.
     * @return {*} The value of the 'view' data attribute associated with the wrapper element.
     */
    function getView($wrapper) {
        return $wrapper.data('view');
    }

    function getLastView($wrapper) {
        return $wrapper.data('lastView');
    }

    function setLastView($wrapper, view) {
        $wrapper.data('lastView', view);
        console.log('------------------- last view: ' + view);
    }

    /**
     * Sets the view type for a given wrapper element.
     * The view can be one of 'day', 'week', 'month', or 'year'. If an invalid view
     * is provided, it defaults to 'month'.
     *
     * @param {jQuery} $wrapper - The wrapper element whose view type is being set.
     * @param {string} view - The desired view type. Must be 'day', 'week', 'month', or 'year'.
     * @return {void}
     */
    function setView($wrapper, view) {
        const settings = getSettings($wrapper);
        const lastView = getLastView($wrapper);
        const currentView = getView($wrapper);

        if (view !== 'search' && !['day', 'week', 'month', 'year'].includes(view)) {
            if (settings.debug) {
                console.error(
                    'Invalid view type provided. Defaulting to month view.',
                    'Provided view:', view
                );
            }
            view = 'month';
        }

        if (currentView !== view) {
            setLastView($wrapper, currentView);
        }

        if (settings.debug) {
            log('Set view to:', view);
        }
        $wrapper.data('view', view);
    }

    /**
     * Retrieves the 'date' value from the provided wrapper's data.
     *
     * @param {jQuery} $wrapper - The object containing the data method to fetch the 'date' value.
     * @return {Date} The value associated with the 'date' key in the wrapper's data.
     */
    function getDate($wrapper) {
        return $wrapper.data('date');

    }

    /**
     * Sets a date value in the specified wrapper element's data attributes.
     *
     * @param {jQuery} $wrapper - The jQuery wrapper object for the element.
     * @param {string|Date} date - The date value to be set in the data attribute. Can be a string or Date object.
     * @return {void} Does not return a value.
     */
    function setDate($wrapper, date) {
        const settings = getSettings($wrapper);
        if (settings.debug) {
            log('Set date to:', date);
        }
        $wrapper.data('date', date);
    }

    /**
     * Retrieves the settings data from the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The wrapper element whose settings data is to be fetched.
     * @return {*} The settings data retrieved from the wrapper element.
     */
    function getSettings($wrapper) {
        return $wrapper.data('settings');

    }

    /**
     * Updates the settings for the specified wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element.
     * @param {Object} settings - An object containing the new settings to be applied to the wrapper.
     * @return {void} Does not return a value.
     */
    function setSettings($wrapper, settings) {
        if (settings.debug) {
            log('Set settings to:', settings);
        }
        $wrapper.data('settings', settings);
    }

    /**
     * Retrieves the view container element within the given wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element.
     * @return {jQuery} A jQuery object representing the view container element.
     */
    function getViewContainer($wrapper) {
        return $wrapper.find('.' + viewContainerClass);
    }

    /**
     * Builds the user interface based on the current view type associated with the given wrapper element.
     *
     * @param {jQuery} $wrapper The jQuery wrapper element containing the view and container information for rendering.
     *
     * @return {void} This function does not return a value. It updates the DOM elements associated with the wrapper.
     */
    function buildByView($wrapper) {
        const settings = getSettings($wrapper);
        const view = getView($wrapper);
        if (settings.debug) {
            log('Call buildByView with view:', view);
        }

        if (getSearchMode($wrapper)) {
            buildSearchView($wrapper);
        } else {
            switch (view) {
                case 'month':
                    buildMonthView($wrapper);
                    break;
                case 'week':
                    buildWeekView($wrapper);
                    break;
                case 'year':
                    buildYearView($wrapper);
                    break;
                case 'day':
                    buildDayView($wrapper);
                    break;
                default:
                    break;
            }

            updateDropdownView($wrapper);
            setCurrentDateName($wrapper);
            buildMonthSmallView($wrapper, getDate($wrapper), $('.wc-calendar-month-small'));
            trigger($wrapper, 'view', [view]);
        }

        $wrapper.find('.popover').remove();
        fetchAppointments($wrapper);
    }

    /**
     * Fetches and processes appointments for a given wrapper element. The function retrieves
     * appointment data based on the selected view, date range, and additional search criteria, and
     * then renders the appointments within the wrapper. It supports URL callbacks or string-based
     * AJAX requests for data retrieval.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element where appointments will be fetched and displayed.
     * @return {void} - This function does not return a value. It updates the DOM of the provided wrapper with the fetched appointments.
     */
    function fetchAppointments($wrapper) {
        methodClear($wrapper);

        const settings = getSettings($wrapper);
        let skipLoading = false;

        if (settings.debug) {
            log('Call fetchAppointments');
        }


        let requestData;
        const inSearchMode = getSearchMode($wrapper);
        // Daten für den Ajax-Request zusammenstellen
        if (!inSearchMode) {
            // Get the latest date and view
            const view = getView($wrapper);
            // calculate the start and end date based on the view
            const period = getStartAndEndDateByView($wrapper);
            requestData = {
                fromDate: period.start, // Startdatum im ISO-Format
                toDate: period.end,    // Enddatum im ISO-Format
                view: view, // 'day', 'week', 'month', 'year'
            };
        } else {
            const searchElement = getSearchElement($wrapper);
            const search = searchElement?.val() ?? null;
            skipLoading = isValueEmpty(search);
            requestData = {
                search: search // ?string
            };
        }


        if (typeof settings.queryParams === 'function') {
            const queryParams = settings.queryParams(requestData);
            for (const key in queryParams) {
                requestData[key] = queryParams[key];
            }
        }

        if (skipLoading) {
            if (settings.debug) {
                log('Skip loading appointments because search is empty');
            }

            setAppointments($wrapper, []);
            renderAppointments($wrapper);
            return;
        }

        trigger($wrapper, 'beforeLoad', [requestData]);

        if (typeof settings.url === 'function') {
            showLoader($wrapper);
            const appointments = settings.url(requestData) || [];
            if (settings.debug) {
                log('Call appointments by function:', appointments);
            }
            setAppointments($wrapper, appointments);
            renderAppointments($wrapper);
        } else if (typeof settings.url === 'string') {
            showLoader($wrapper);

            // Prüfen, ob bereits ein laufender Request existiert, und diesen ggf. abbrechen
            const existingRequest = $wrapper.data('currentRequest');
            if (existingRequest) {
                existingRequest.abort();
            }

            if (settings.debug) {
                log('Call appointments by URL:', settings.url);
            }

            // Neue Anfrage starten und im Wrapper speichern
            const newRequest = $.ajax({
                url: settings.url, // Server-Endpoint
                method: 'GET',
                contentType: 'application/json',
                data: JSON.stringify(requestData), // Daten als JSON senden
                success: function (response) {
                    setAppointments($wrapper, response || []);
                    renderAppointments($wrapper);
                },
                error: function (xhr, status, error) {
                    if (status !== 'abort') {
                        if (settings.debug) {
                            log('Error when retrieving the dates:', status, error);
                        }
                        hideLoader($wrapper);
                    }
                },
                complete: function () {
                    // remove the stored request after completing the request
                    $wrapper.removeData('currentRequest');
                }
            });

            $wrapper.data('currentRequest', newRequest); // Save Request
        }
    }

    /**
     * Determines if the given background color is dark based on its RGB or hexadecimal value.
     * Uses the YiQ calculation formula to determine brightness and darkness thresholds.
     *
     * @param {string} color A string representing the background color in either hex format (e.g., "#RRGGBB") or RGB(A) format (e.g., "rgb(255, 255, 255)").
     * @return {boolean} Returns true if the background color is considered dark, otherwise returns false.
     * @throws {Error} Throws an error if the color format is not supported.
     */
    function isDarkBackgroundColor(color) {
        let r, g, b;

        if (color.startsWith('#')) {
            // Hex-color code
            r = parseInt(color.slice(1, 3), 16);
            g = parseInt(color.slice(3, 5), 16);
            b = parseInt(color.slice(5, 7), 16);
        } else if (color.startsWith('rgb')) {
            // RGB or RGBA color codes
            const rgbValues = color.match(/\d+/g); // extract numbers from the character chain
            r = parseInt(rgbValues[0]);
            g = parseInt(rgbValues[1]);
            b = parseInt(rgbValues[2]);
        } else {
            throw new Error('Unsupported color format');
        }

        // YiQ calculation for determination whether the color is dark
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return yiq > 128; // return true when the color is dark
    }

    /**
     * Checks if two appointments overlap based on their start and end times.
     *
     * @param {Object} appointment1 The first appointment object with `start` and `end` properties as date strings.
     * @param {Object} appointment2 The second appointment object with `start` and `end` properties as date strings.
     * @return {boolean} Returns true if the two appointments overlap; otherwise, false.
     */
    function checkAppointmentOverlap(appointment1, appointment2) {
        return (
            new Date(appointment1.start) < new Date(appointment2.end) &&
            new Date(appointment1.end) > new Date(appointment2.start)
        );
    }

    /**
     * Assigns appointments to columns ensuring no overlapping appointments exist in the same column.
     *
     * @param {Array} appointments - An array of appointment objects to be assigned to columns.
     * @return {Array} - An array of columns where each column is an array of appointments that do not overlap.
     */
    function assignColumnsToAppointments(appointments) {
        // Array, in dem jede Spalte mit Terminen gespeichert wird
        const columns = [];

        // Iteriere durch alle Termine
        appointments.forEach(appointment => {
            let placedInColumn = false;

            // Gehe jede Spalte durch und prüfe, ob der Termin dort hinzugefügt werden kann
            for (let i = 0; i < columns.length; i++) {
                const column = columns[i];

                // Verwende eine separate Funktion, um die Logik zur Überprüfung auszulagern
                if (fitsColumn(column, appointment)) {
                    column.push(appointment); // Termin zu dieser Spalte hinzufügen
                    placedInColumn = true;
                    break;
                }
            }

            // Falls der Termin in keine Spalte passt, erstelle eine neue Spalte
            if (!placedInColumn) {
                columns.push([appointment]);
            }
        });

        return columns;
    }


    /**
     * Checks if the given appointment can fit in the specified column
     * without overlapping with any other appointments already in the column.
     *
     * @param {Array} column - An array of existing appointments in the column.
     * @param {Object} appointment - The appointment to check for potential overlap.
     * @return {boolean} Returns true if the appointment fits in the column without overlap, otherwise false.
     */
    function fitsColumn(column, appointment) {
        return column.every(colAppointment => !checkAppointmentOverlap(appointment, colAppointment));
    }

    /**
     * Constructs and organizes appointments for each day of the week based on the provided appointments' data.
     *
     * @param {jQuery} $wrapper - The wrapper element containing the week view DOM structure.
     * @param {Array<Object>} appointments - An array of appointment objects, each containing relevant scheduling details such as start times and display dates.
     * @return {void} This method does not return a value. It modifies the DOM structure to display appointments organized by weekdays.
     */
    function buildAppointmentsForWeek($wrapper, appointments) {
        const container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);

        const appointmentsByWeekday = [[], [], [], [], [], [], []]; // Array für jeden Wochentag (Sonntag bis Samstag)

        // Sortiere die Termine nach dem Wochentag
        appointments.forEach(appointment => {
            appointment.displayDates.forEach(startString => {
                const appointmentDate = new Date(startString);
                const weekday = appointmentDate.getDay(); // Liefert den Wochentag (0 = Sonntag, 6 = Samstag)
                appointmentsByWeekday[weekday].push(appointment);
            })
        });

        // console.log(appointmentsByWeekday);

        for (let weekday = 0; weekday < 7; weekday++) {
            const dates = appointmentsByWeekday[weekday] || [];
            const $dayWrapper = container.find('[data-week-day="' + weekday + '"] .wc-day-view-time-slots');
            const margin = settings.startWeekOnSunday && weekday === 0 || !settings.startWeekOnSunday && weekday === 1;
            buildAppointmentsForDay($wrapper, $dayWrapper, dates, margin ? 1 : 1);
        }
    }

    /**
     * Builds and displays a set of appointments for the specified day within a container.
     *
     * @param {jQuery} $wrapper - The wrapper element containing the calendar.
     * @param {jQuery} $container - The container element where appointments should be rendered.
     * @param {Array} appointments - An array of appointment objects, each containing details such as start, end, title, and color.
     * @param {number} [marginLeft=1] - The left margin offset in pixels.
     * @return {void} This function does not return a value. It renders appointments into the provided container.
     */
    function buildAppointmentsForDay($wrapper, $container, appointments, marginLeft = 1) {
        const settings = getSettings($wrapper);
        const columns = assignColumnsToAppointments(appointments);

        const gap = 1; // distance between the appointments in pixels

        // Calculate width including consideration of the space (relatively in %)
        const containerWidth = $container.width();
        const containerHeight = $container.height();

        const appointmentWidthPercent = ((containerWidth - marginLeft) / columns.length - gap) / containerWidth * 100;

        // go through each column and position the appointments
        columns.forEach((column, columnIndex) => {
            column.forEach((appointment) => {
                const start = new Date(appointment.start);
                const end = new Date(appointment.end);

                const startHour = start.getHours();
                const startMinute = start.getMinutes();
                const endHour = end.getHours();
                const endMinute = end.getMinutes();

                const hourContainer = $container.find(`[data-day-hour="${startHour}"]`);
                const hourPositionTop = hourContainer.position().top;
                const minuteOffset = (startMinute / 60) * 34; // Offset in Pixel-Höhe
                const topPositionInPixels = hourPositionTop + minuteOffset;

                const durationInHours = endHour + endMinute / 60 - (startHour + startMinute / 60);
                const appointmentHeightInPixels = durationInHours * 34;

                // convert `top position` and` AppointmentHeight` in percent
                const topPositionPercent = (topPositionInPixels / containerHeight) * 100;
                const appointmentHeightPercent = (appointmentHeightInPixels / containerHeight) * 100;

                // Calculate the `Left` position relatively in % including the space
                const appointmentLeftInPixels = marginLeft + (columnIndex * (appointmentWidthPercent * containerWidth / 100 + gap));
                const appointmentLeftPercent = (appointmentLeftInPixels / containerWidth) * 100;

                let durationString = end.toTimeString().slice(0, 5);
                if (typeof settings.formatDuration === "function") {
                    durationString += " (" + settings.formatDuration(appointment.duration) + ")";
                }

                const backgroundColor = appointment.color || settings.defaultColor;

                // Set the appointment elements
                const appointmentElement = $('<small>', {
                    'data-appointment': true,
                    class: 'position-absolute text-nowrap text-truncate shadow px-2 btn-sm overflow-hidden',
                    css: {
                        backgroundColor: backgroundColor,
                        top: `${topPositionPercent}%`,
                        height: `${appointmentHeightPercent}%`,
                        left: `${appointmentLeftPercent}%`,
                        width: `${appointmentWidthPercent}%`,
                    },
                    html: `<div class="">${start.toTimeString().slice(0, 5)} ${durationString} - ${appointment.title || 'Ohne Titel'}</div>`,
                }).appendTo($container);

                appointmentElement.data('appointment', appointment);
                setColorByBackgroundColor(appointmentElement, settings.defaultColor);
                setPopoverForAppointment($wrapper, appointmentElement);
            });
        });
    }

    /**
     * Sets the text color of an element based on its background color to ensure proper contrast.
     * If the background color is dark, the text color is set to white (#ffffff).
     * If the background color is light, the text color is set to black (#000000).
     *
     * @param {jQuery} $el - The jQuery element whose text color is to be adjusted.
     * @param {string} defaultColor - The default background color to use if the element does not have a defined background color.
     * @return {void} No return value, the method modifies the element's style directly.
     */
    function setColorByBackgroundColor($el, defaultColor) {
        const backgroundColor = $el.css('background-color') || defaultColor;
        $el.css('color', !isDarkBackgroundColor(backgroundColor) ? '#ffffff' : '#000000');
    }

    /**
     * Compares two Date objects to determine if they represent the same calendar date.
     *
     * @param {Date} date1 - The first date to compare.
     * @param {Date} date2 - The second date to compare.
     * @return {boolean} Returns true if the two dates have the same year, month, and day; otherwise, false.
     */
    function isSameDate(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    /**
     * Builds and displays the list of appointments in the search result container.
     *
     * @param {jQuery} $wrapper - The jQuery DOM element wrapper containing the context where appointments will be created.
     * @param {Array<Object>} appointments - An array of appointment objects containing the details needed for rendering.
     * @return {void} This function does not return a value.
     */
    function buildAppointmentsForSearch($wrapper, appointments) {
        const $container = getViewContainer($wrapper).find('.wc-search-result-container');
        const settings = getSettings($wrapper);
        const input = getSearchElement($wrapper);
        const search = input.val().trim();
        if (isValueEmpty(search)) {
            $container.html('<div class="d-flex p-5 align-items-center justify-content-center"></div>');
            input.appendTo($container.find('.d-flex'));
            input.focus();
            return;
        }

        if (!appointments.length) {
            $container.html('<div class="d-flex p-5 align-items-center justify-content-center">' + settings.translations.searchNoResult + '</div>');
            return;
        }

        $container
            .css('font-size', '.9rem').addClass('py-4');

        const itemsPerPage = 10; // Anzahl der Termine pro Seite
        const totalItems = appointments.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        /**
         * Function: render the dates of the current page
         */
        function renderPage(page = 1) {
            // Berechne Start und Ende
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

            // Alte Inhalte leeren
            $container.empty();

            // Pagination erneut anhängen (falls gelöscht wurde)
            if (appointments.length > itemsPerPage) {
                renderPagination(page);
            }

            // Container für Termine hinzufügen
            const $appointmentContainer = $('<div>', {class: 'list-group list-group-flush mb-3'}).appendTo($container);

            // Termine für diese Seite generieren
            const pageAppointments = appointments.slice(startIndex, endIndex);
            // Pagination erneut anhängen (falls gelöscht wurde)
            // if (appointments.length > itemsPerPage) {
            //     renderPagination(page);
            // }
            pageAppointments.forEach((appointment) => {
                const borderLeftColor = appointment.color || settings.defaultColor;
                const firstCollStyle = [
                    `border-left-color:${borderLeftColor}`,
                    `border-left-width:5px`,
                    `border-left-style:dotted`,
                    `cursor:pointer`,
                    `font-size:1.75rem`,
                    `width: 60px`
                ].join(';');

                const link = appointment.link ? `<a class="btn btn-link p-0 mx-3 btn-sm " href="${appointment.link}" target="_blank"><i class="${settings.icons.link}"></i></a>` : '';
                const html = [
                    `<div class="day fw-bold text-center" style="${firstCollStyle}" data-date="${formatDateToDateString(new Date(appointment.start))}">`,
                    `${new Date(appointment.start).getDate()}`,
                    `</div>`,
                    `<div class="text-muted" style="width: 150px;">`,
                    `${new Date(appointment.start).toLocaleDateString(settings.locale, {
                        month: 'short',
                        year: 'numeric',
                        weekday: 'short'
                    })}`,
                    `</div>`,
                    `<div class="title-container flex-fill text-nowrap">`,
                    `${appointment.title}` + link,
                    `</div>`
                ].join('');


                const appointmentElement = $('<div>', {
                    'data-appointment': true,
                    class: 'list-group-item d-flex align-items-center g-3 py-1 overflow-hidden',
                    html: html,
                    css: {
                        borderLeftColor: borderLeftColor,
                    },
                }).appendTo($appointmentContainer);

                // Popover hinzufügen
                appointmentElement.data('appointment', appointment);
                setPopoverForAppointment($wrapper, appointmentElement);
            });

            // Pagination erneut anhängen (falls gelöscht wurde)
            if (appointments.length > itemsPerPage) {
                renderPagination(page);
            }
        }

        /**
         * Funktion: Erstelle Pagination unten im Container
         */
        function renderPagination(activePage) {
            // Vorhandene Pagination entfernen
            const $pagination = $('<nav>', {'aria-label': 'Page navigation'});
            const $paginationList = $('<ul>', {class: 'pagination mb-0'}).appendTo($pagination);

            // Berechnung des Textes "1-10 / X appointments"
            const startIndex = (activePage - 1) * itemsPerPage + 1; // Erster Termin auf der Seite (1-basiert)
            const endIndex = Math.min(activePage * itemsPerPage, totalItems); // Letzter Termin auf der Seite
            const statusText = `${startIndex}-${endIndex} / ${totalItems}`;

            // Text vor der Pagination anzeigen
            const $statusText = $('<div>', {
                class: 'text-muted me-auto', // Stil für den Text
                text: statusText,
            });

            // Pagination List generieren
            for (let i = 1; i <= totalPages; i++) {
                const $pageItem = $('<li>', {class: 'page-item'});
                if (i === activePage) {
                    $pageItem.addClass('active'); // Aktive Seite markieren
                }

                const $pageLink = $('<a>', {
                    class: 'page-link',
                    href: '#' + i,
                    text: i
                });

                $pageLink.appendTo($pageItem);
                $pageItem.appendTo($paginationList);
            }

            $paginationList.on('click', 'a.page-link', function (e) {
                e.preventDefault();
                const $clickedLink = $(this);
                const page = $clickedLink.attr('href').replace('#', '');

                // Entferne die alte Active-Klasse
                $paginationList.find('.active').removeClass('active');

                // Setze die neue Active-Klasse
                $clickedLink.parent().addClass('active');

                // Render die neue Seite
                renderPage(Number(page));
            });

            const $paginationWrapper = $('<div>', {
                class: 'd-flex align-items-center justify-content-center'
            }).appendTo($container);
            // Beides in den Container einfügen (Text + Pagination)
            $statusText.appendTo($paginationWrapper);
            $pagination.appendTo($paginationWrapper);
            // $container.append($statusText); // Text einfügen
            // $container.append($pagination); // Pagination hinzufügen
        }

        // Zeige die erste Seite standardmäßig an
        renderPage(1, totalPages);
    }

    /**
     * Generates and appends appointment elements for a given month based on the provided data.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element for the calendar view.
     * @param {Array<Object>} appointments - A list of appointment objects. Each object should include `displayDates`, `start`, `allDay`, `title`, and optionally `color`.
     * @return {void} This function does not return a value; it updates the DOM by injecting appointment elements.
     */
    function buildAppointmentsForMonth($wrapper, appointments) {
        const $container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);
        if (settings.debug) {
            log('Call buildAppointmentsForMonth with appointments:', appointments);
        }

        appointments.forEach(appointment => {
            const multipleStartDates = appointment.displayDates.length > 1;
            appointment.displayDates.forEach(startString => {
                const fakeStart = new Date(startString);
                const start = new Date(appointment.start);
                const sameDate = isSameDate(fakeStart, start);
                const isNotStartOnThisDay = multipleStartDates && !sameDate;
                const isStartOnThisDay = multipleStartDates && sameDate;
                // if (!isNotStartOnThisDay) {
                //     console.warn('Appointment start date does not match the start date of the appointment:', startDate, startString);
                // }
                const startTime = start.toLocaleTimeString(settings.locale, {hour: '2-digit', minute: '2-digit'});
                const dayContainer = $container.find(`[data-month-date="${startString}"]`);
                let iconClass = settings.icons.appointment;
                if (appointment.allDay) {
                    iconClass = settings.icons.appointmentAllDay;
                }
                const timeToShow = appointment.allDay ? '' : `<small class="me-1 mr-1">${startTime}</small>`;
                const appointmentElement = $('<small>', {
                    'data-appointment': true,
                    css: {
                        fontSize: '12px',
                        lineHeight: '16px'
                    },
                    class: 'px-1 w-100 overflow-hidden',
                    html: [
                        `<div class=" d-flex align-items-center flex-nowrap">`,
                        `<i class="${iconClass} me-1 mr-1" style="color: ${appointment.color || settings.defaultColor}; font-size: 12px"></i>`,
                        timeToShow,
                        `<strong class="text-nowrap">${appointment.title}</strong>`,
                        `</div>`
                    ].join('')
                }).appendTo(dayContainer);

                appointmentElement.data('appointment', appointment);
                setPopoverForAppointment($wrapper, appointmentElement);
            })
        })
    }

    /**
     * Configures a popover for a given appointment element to show additional information on hover.
     *
     * @param {jQuery} $wrapper - The container element within which the popover should exist.
     * @param {jQuery} $appointmentElement - The jQuery element representing the appointment for which the popover is to be configured.
     * @return {void} This method does not return any value.
     */
    function setPopoverForAppointment($wrapper, $appointmentElement) {
        // return;
        const settings = getSettings($wrapper);
        if (typeof settings.formatInfoWindow === "function") {
            $appointmentElement.css('cursor', 'pointer');
            const appointment = $appointmentElement.data('appointment');
            const delayShow = 400;
            const delayHide = 400;
            const activeClass = 'text-bg-light';
            // Initialisiere das Popover
            $appointmentElement
                .popover({
                    animation: false,
                    sanitize: false,
                    trigger: 'manual', // Steuerung über das manuelle Öffnen und Schließen
                    html: true,
                    content: settings.formatInfoWindow(appointment),
                    container: $wrapper,
                })
                .on('mouseenter touchstart', function () {
                    // Close all other open popovers
                    $('[data-appointment]')
                        .not($(this))
                        .popover('hide')
                        .removeClass(activeClass);

                    // Delay before displaying
                    const _this = this;
                    $(_this).data('timeout', setTimeout(() => {
                        $(_this).popover('show');
                        $(_this).addClass(activeClass);

                        // Hole den Popover-Content
                        const popover = $('.popover');

                        // keep the popover open as long as the mouse is on it
                        popover.on('mouseenter', function () {
                            clearTimeout($(_this).data('timeout'));
                        });

                        // close popover when mouse leaves him
                        popover.on('mouseleave touchend', function () {
                            $(_this).data('timeout', setTimeout(() => {
                                $(_this).popover('hide');
                                $(_this).removeClass(activeClass);
                            }, delayHide)); // Delay when closing
                        });
                    }, delayShow)); // Delay when displaying
                })
                .on('mouseleave touchend', function () {
                    // remove the delay for displaying
                    clearTimeout($(this).data('timeout'));

                    // Delay before closing
                    const _this = this;
                    $(_this).data('timeout', setTimeout(() => {
                        $(_this).popover('hide');
                        $(_this).removeClass(activeClass);
                    }, delayHide));
                });
        }
    }

    /**
     * Calculates the duration for a list of appointments and appends the calculated duration
     * to each appointment object. Durations include days, hours, minutes, and seconds.
     *
     * @param {jQuery} $wrapper - A wrapper object containing relevant settings.
     * @param {Array} appointments - Array of appointment objects containing `start`, `end`,
     * and `allDay` properties. Each object will be updated with a `duration` property.
     * @return {void} - This function does not return a value; it modifies the appointment array in place.
     */
    function calculateAppointmentDurations($wrapper, appointments) {
        const settings = getSettings($wrapper);

        appointments.forEach(appointment => {
            const start = new Date(appointment.start);
            const end = new Date(appointment.end);

            const diffMillis = end - start; // Zeitdifferenz in Millisekunden

            if (appointment.allDay) {
                // Ganztägiger Termin: Ganze Tage berechnen
                const days = Math.ceil(diffMillis / (1000 * 60 * 60 * 24)); // Millisekunden -> Tage

                appointment.duration = {
                    days: days,
                    hours: 0,
                    minutes: 0,
                    seconds: 0
                };
            } else {
                // Rechnen der genauen Zeitdifferenz
                const totalSeconds = Math.floor(diffMillis / 1000);

                const days = Math.floor(totalSeconds / (24 * 3600)); // Ganze Tage
                const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600); // Ganze Stunden
                const minutes = Math.floor((totalSeconds % 3600) / 60); // Restliche Minuten
                const seconds = totalSeconds % 60; // Restliche Sekunden

                appointment.duration = {
                    days: days,
                    hours: hours,
                    minutes: minutes,
                    seconds: seconds
                };
            }
        });

        if (settings.debug) {
            log('Calculated durations:', appointments);
        }
    }

    /**
     * Builds and renders appointment elements for the current view inside the specified wrapper.
     *
     * @param {jQuery} $wrapper The jQuery element representing the wrapper in which appointments will be rendered.
     * @return {void} This function does not return a value.
     */
    function buildAppointmentsForView($wrapper) {
        methodClear($wrapper, false);

        const settings = getSettings($wrapper);
        const appointments = getAppointments($wrapper);
        const isSearchMode = getSearchMode($wrapper);

        if (isSearchMode) {
            if (settings.debug) {
                log('Call renderData in search mode');
            }
            buildAppointmentsForSearch($wrapper, appointments);
        } else {
            const view = getView($wrapper);
            const container = getViewContainer($wrapper);
            if (settings.debug) {
                log('Call renderData with view:', view);
            }

            switch (view) {
                case 'day':
                    const overContainer = container.find('.wc-day-view-time-slots');
                    buildAppointmentsForDay($wrapper, overContainer, appointments);
                    break;
                case 'week':
                    buildAppointmentsForWeek($wrapper, appointments);
                    break;
                case 'month':
                    buildAppointmentsForMonth($wrapper, appointments);
                    break;
                case 'year':
                    break;
            }
        }

    }

    /**
     * Renders the appointments by building the view and hiding the loader.
     *
     * @param {jQuery} $wrapper - The wrapper element where the appointments will be rendered.
     * @return {void} This method does not return a value.
     */
    function renderAppointments($wrapper) {
        buildAppointmentsForView($wrapper);
        hideLoader($wrapper);
    }

    /**
     * Displays a loading spinner inside a given wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element that contains the loading spinner.
     * @return {void} This method does not return a value.
     */
    function showLoader($wrapper) {
        const spinner = $wrapper.find('.wc-calendar-spinner');
        spinner.show();
    }

    /**
     * Hides the loading spinner within the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element that contains the loading spinner.
     * @return {void} This function does not return a value.
     */
    function hideLoader($wrapper) {
        const spinner = $wrapper.find('.wc-calendar-spinner');
        spinner.hide();
    }

    /**
     * Calculates the start and end dates based on the provided view type and a given date context.
     *
     * @param {jQuery} $wrapper - A wrapper element or object providing context for obtaining
     *                            settings, date, and view type.
     * @return {Object} An object containing the following properties:
     *                  - `date`: The original date in ISO string format (yyyy-mm-dd).
     *                  - `start`: The calculated start date in ISO string format (yyyy-mm-dd) based on the view.
     *                  - `end`: The calculated end date in ISO string format (yyyy-mm-dd) based on the view.
     */
    function getStartAndEndDateByView($wrapper) {
        const settings = getSettings($wrapper);
        const date = getDate($wrapper);
        const view = getView($wrapper);
        const startDate = new Date(date);
        const endDate = new Date(date);

        switch (view) {
            case 'day':
                // Start and end remain within a day
                break;

            case 'week':
                // start date: Monday of the current week
                const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ...
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate deviation from Monday
                startDate.setDate(startDate.getDate() + diffToMonday);

                // end date: Sunday of the same week
                endDate.setDate(startDate.getDate() + 6);
                break;

            case 'month':
                // start date: 1st day of the month
                startDate.setDate(1);

                // end date: last day of the month
                endDate.setMonth(startDate.getMonth() + 1); // change to the next month
                endDate.setDate(0); // Goes back one day: the last day of the previous month (current month)
                break;

            case 'year':
            case 'search':
                // start date: January 1 of the current year
                startDate.setMonth(0); // January
                startDate.setDate(1);  // 1 day

                // end date: December 31 of the current year
                endDate.setMonth(11); // December
                endDate.setDate(31);  // last day
                break;

            default:
                if (settings.debug) {
                    console.error('Unknown view:', view);
                }
                break;
        }

        return {
            date: formatDateToDateString(date),
            start: formatDateToDateString(startDate),
            end: formatDateToDateString(endDate)
        };
    }

    /**
     * Converts a string or JavaScript Date object into a string formatted as an SQL date (YYYY-MM-DD).
     *
     * @param {string|Date} date - The input date, either as a string or as a Date object.
     * @return {string} A string representation of the date in the SQL date format (YYYY-MM-DD).
     */
    function formatDateToDateString(date) {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Retrieves the element within the specified wrapper that has the `data-search` attribute.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element to search within.
     * @return {jQuery} The jQuery object containing the matched element, or null if no match is found.
     */
    function getSearchElement($wrapper) {
        return $wrapper.find('[data-search-input]') || null;
    }

    /**
     * Returns the shortened names of the weekdays based on the locale,
     * adapted to the start day of the week.
     *
     * This function retrieves the short names of the weekdays (e.g., "Sun", "Mon", etc.)
     * for the specified locale and rearranges the order of the days depending on
     * whether the week starts on Sunday or Monday.
     *
     * @param {string} locale - The locale like 'en-US' or 'de-DE', used to format names.
     * @param {boolean} startWeekOnSunday - Indicates whether the week should start with Sunday.
     * @returns {string[]} - An array of the short weekday names, e.g., ['Sun', 'Mon', 'Tue', ...].
     */
    function getShortWeekDayNames(locale, startWeekOnSunday) {
        // Create an Intl.DateTimeFormat instance for the provided locale to format weekdays.
        // The 'short' option generates abbreviated weekday names (e.g., 'Mon', 'Tue').
        const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

        // Generate an array of all weekdays (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
        // Use Date.UTC to ensure consistent results in all environments (ignoring local time zones).
        const weekDays = [...Array(7).keys()].map(day =>
            // Add 1 to the day index to represent the day of the month.
            // Example: '2023-01-01' for Sunday, '2023-01-02' for Monday, and so on.
            formatter.format(new Date(Date.UTC(2023, 0, day + 1)))
        );

        // If the week should start on Sunday, return the weekdays as-is.
        // Otherwise, reorder the array to start from Monday:
        // - day 1 (Monday) to day 6 (Saturday) remain first (`weekDays.slice(1)`),
        // - day 0 (Sunday) is moved to the end (`weekDays[0]`).
        return startWeekOnSunday ? weekDays : weekDays.slice(1).concat(weekDays[0]);
    }

    /**
     * Builds the search view by creating and appending the necessary DOM elements
     * to the wrapper's container. It initializes the container, configures its
     * structure, and attaches the search result container.
     *
     * @param {jQuery} $wrapper - The jQuery wrapped DOM element acting as the main wrapper for the search view.
     * @return {void} This function does not return a value.
     */
    function buildSearchView($wrapper) {
        const container = getViewContainer($wrapper);
        // Empty the container and generate new structure
        container.empty();
        $('<div>', {
            class: 'wc-search-result-container list-group list-group-flush overflow-auto',
        }).appendTo(container);
    }

    /**
     * Builds and renders a monthly calendar view based on the settings and date associated with the provided wrapper element.
     *
     * @param {jQuery} $wrapper - The wrapper element that contains the calendar settings, current date, and configurations.
     *
     * @return {void} - The function does not return any value; it dynamically manipulates the DOM to render the calendar view.
     */
    function buildMonthView($wrapper) {
        const container = getViewContainer($wrapper);
        // container.css({
        //     paddingBottom: '24px',
        //     paddingRight: '24px',
        // });
        const settings = getSettings($wrapper);
        const date = getDate($wrapper);

        const {locale, startWeekOnSunday} = settings;

        // calculation of the calendar data
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // start with the right day of the week (possibility: Sunday or Monday)
        let calendarStart = new Date(firstDayOfMonth);
        while (calendarStart.getDay() !== (startWeekOnSunday ? 0 : 1)) {
            calendarStart.setDate(calendarStart.getDate() - 1);
        }

        // end with the right day of the week (Saturday or Sunday)
        let calendarEnd = new Date(lastDayOfMonth);
        while (calendarEnd.getDay() !== (startWeekOnSunday ? 6 : 0)) {
            calendarEnd.setDate(calendarEnd.getDate() + 1);
        }

        // Empty the container and generate new structure
        container.empty();

        // Create the weekday line
        const weekdaysRow = $('<div>', {
            class: 'row d-flex flex-nowrap wc-calendar-weekdays fw-bold',
            css: {
                fontSize: '12px',
                lineHeight: '24px'
            }
        }).append(
            $('<div>', {
                class: 'col px-1 d-flex align-items-center justify-content-center',
                style: 'width: 24px',
                css: {
                    width: '24px',
                    maxWidth: '24px',
                    minWidth: '24px',
                    fontSize: '12px',
                },
                html: '<small></small>',
            })
        );

        // dynamic weekly names based on local and flag
        const weekDays = getShortWeekDayNames(locale, startWeekOnSunday);
        weekDays.forEach(day => {
            weekdaysRow.append(
                $('<div>', {
                    class: 'text-center col px-1 flex-fill',
                    html: `<small>${day}</small>`,
                })
            );
        });

        container.append(weekdaysRow);

        // represent days
        let currentDate = new Date(calendarStart);
        while (currentDate <= calendarEnd) {
            const weekRow = $('<div>', {
                class: 'row d-flex flex-nowrap flex-fill wc-calendar-content',
            });

            // calculate calendar week
            const calendarWeek = getCalendarWeek(currentDate);
            weekRow.append(
                $('<div>', {
                    class: 'col px-1 d-flex align-items-start py-2 fw-bold justify-content-center',
                    css: {
                        fontSize: '12px',
                        width: '24px',
                        maxWidth: '24px',
                        minWidth: '24px',
                    },
                    html: `<small>${calendarWeek}</small>`,

                })
            );

            // draw days of the week (Mon-Sun or SO-SA)
            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const dayClass = isToday ? 'rounded-circle text-bg-primary' : '';
                const dayWrapper = $('<div>', {
                    'data-month-date': formatDateToDateString(currentDate),
                    class: `col px-1 border flex-fill d-flex flex-column align-items-center justify-content-start ${
                        isOtherMonth ? 'text-muted' : ''
                    } ${isToday ? '' : ''}`,
                    css: {
                        maxHeight: '100%',
                        overflowY: 'auto',
                    }
                }).appendTo(weekRow);

                $('<small>', {
                    'data-date': formatDateToDateString(currentDate),
                    css: {
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        fontSize: '12px',
                    },
                    class: `${dayClass} text-center`,
                    text: currentDate.getDate(),
                }).appendTo(dayWrapper);

                // next day
                currentDate.setDate(currentDate.getDate() + 1);
            }

            container.append(weekRow);
        }
    }

    /**
     * Builds a small-view calendar for a specific month and appends it to the provided container.
     *
     * @param {jQuery} $wrapper The wrapper element containing configuration and state for the calendar.
     * @param {Date} forDate The date object indicating the target month for which the small-view calendar will be constructed.
     * @param {jQuery} $container The jQuery container element where the small-view calendar will be rendered.
     * @return {void} This function does not return a value,
     * it directly updates the DOM by appending the constructed calendar to the container.
     */
    function buildMonthSmallView($wrapper, forDate, $container) {
        // Get container for miniature view

        const settings = getSettings($wrapper);
        const date = forDate; // Aktuelles Datum
        const activeDate = getDate($wrapper);

        // calculation of the monthly data
        const year = date.getFullYear();
        const month = date.getMonth();

        // 1st day and last day of the month
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Start on Monday before the start of the month
        let calendarStart = new Date(firstDayOfMonth);
        while (calendarStart.getDay() !== 1) {
            calendarStart.setDate(calendarStart.getDate() - 1);
        }

        // end with the Sunday after the end of the month
        let calendarEnd = new Date(lastDayOfMonth);
        while (calendarEnd.getDay() !== 0) {
            calendarEnd.setDate(calendarEnd.getDate() + 1);
        }

        // Empty the container and prepare a miniature calendar
        $container.empty();
        $container.addClass('table-responsive');

        const table = $('<table>', {
            class: 'wc-mini-calendar',
            css: {
                fontSize: '10px',
                borderSpacing: '0',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                textAlign: 'center',
                verticalAlign: 'middle',
                lineHeight: '1.5',
                padding: '0',
                margin: '0',
                backgroundColor: 'transparent',
                border: '0',
            },
        }).appendTo($container);

        // Create header for weekdays
        const thead = $('<thead>').appendTo(table);
        const weekdaysRow = $('<tr>', {
            class: '',
            css: {
                height: '24px'
            }
        }).appendTo(thead);

        // First column (CW)
        $('<th>', {class: '', css: {width: '15px'}, text: ''}).appendTo(weekdaysRow);

        // Add weekly days (Mon, Tue, Wed, ...)
        const weekDays = getShortWeekDayNames(settings.locale, settings.startWeekOnSunday);
        weekDays.forEach(day => {
            $('<th>', {class: '', text: day}).appendTo(weekdaysRow);
        });

        // create the content of the calendar
        const tbody = $('<tbody>').appendTo(table);
        let currentDate = new Date(calendarStart);

        while (currentDate <= calendarEnd) {
            const weekRow = $('<tr>', {
                css: {
                    fontSize: '10px',
                }
            }).appendTo(tbody);

            // calculate calendar week
            const calendarWeek = getCalendarWeek(currentDate);
            $('<td>', {
                css: {
                    width: '10px',
                    fontSize: '10px'
                },
                class: 'border-end pe-1 text-end text-secondary fw-bold',
                text: calendarWeek,
            }).appendTo(weekRow); // insert cw into the first column of the line

            // days of the week (Mon-Sun) add
            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const isSelected = currentDate.toDateString() === activeDate.toDateString();

                let dayClass = 'rounded-circle';
                if (isToday) {
                    dayClass += '  text-bg-primary ';
                }

                if (isOtherMonth) {
                    dayClass += ' text-muted opacity-50';
                }

                if (isSelected && !isToday) {
                    dayClass += ' border border-warning';
                }

                $('<td>', {
                    'data-date': formatDateToDateString(currentDate),
                    css: {
                        cursor: 'pointer',
                        fontSize: '10px',
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                    }, // uniform square for centering
                    html: `<div class="${dayClass} w-100 h-100 d-flex justify-content-center align-items-center">${currentDate.getDate()}</div>`,
                }).appendTo(weekRow);

                // jump to the next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    /**
     * Constructs and initializes the day view content within the provided wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element where the day view will be built.
     * @return {void} This function does not return a value.
     */
    function buildDayView($wrapper) {
        const container = getViewContainer($wrapper).empty();
        const date = getDate($wrapper);
        buildDayViewContent($wrapper, date, container);
    }

    /**
     * Calculates the calendar week number for a given date according to the ISO 8601 standard.
     * ISO 8601 defines the first week of the year as the week with the first Thursday.
     * Weeks start on Monday, and the week containing January 4th is considered the first calendar week.
     *
     * @param {Date} date - The date for which the calendar week number should be calculated.
     * @return {number} The ISO 8601 calendar week number for the provided date.
     */
    function getCalendarWeek(date) {
        // copy of the input date and weekday calculation
        const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNr = (target.getUTCDay() + 6) % 7; // Montag = 0, Sonntag = 6
        target.setUTCDate(target.getUTCDate() - dayNr + 3); // Auf den Donnerstag der aktuellen Woche schieben

        // The first Thursday of the year
        const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
        const firstDayOfWeek = firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7);

        // Calculate number weeks between the first Thursday and the current Thursday
        return Math.floor(1 + (target - new Date(Date.UTC(target.getUTCFullYear(), 0, firstDayOfWeek))) / (7 * 24 * 60 * 60 * 1000));
    }


    /**
     * Constructs and appends a week view into the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element where the week view will be created.
     * @return {void} This method does not return any value.
     */
    function buildWeekView($wrapper) {
        // get the main container for the view
        const $viewContainer = getViewContainer($wrapper);
        // empty container (remove the old content)
        $viewContainer.empty();

        const $container = $('<div>', {
            class: 'position-relative px-5'
        }).appendTo($viewContainer);

        // Get the latest date for the view
        const date = getDate($wrapper);

        // Call settings from the wrapper
        const settings = getSettings($wrapper);

        // Calculation of the first day of the week based on startWeekOnSunday
        const {startWeekOnSunday} = settings;
        const currentDay = date.getDay(); // weekday (0 = Sunday, 1 = Monday, ...)
        const startOfWeek = new Date(date);
        const startOffset = startWeekOnSunday ? currentDay : (currentDay === 0 ? 6 : currentDay - 1);
        startOfWeek.setDate(date.getDate() - startOffset);

        // calculation of the last day of the week
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        // Create weekly view as a flexible layout
        const weekContainer = $('<div>', {
            class: 'wc-week-view d-flex flex-nowrap',
            css: {paddingLeft: '40px'}
        }).appendTo($container);

        // iteration over the days of the week (from starting day to end day)
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + day); // calculate the next day

            // Create day container
            const dayContainer = $('<div>', {
                'data-week-day': currentDate.getDay(),
                class: 'wc-day-week-view flex-grow-1 flex-fill border-end position-relative',
            }).appendTo(weekContainer);


            // labels are only displayed in the first container (the 1st column)
            const showLabels = day === 0;

            buildDayViewContent($wrapper, currentDate, dayContainer, true, showLabels);
        }
    }

    function buildHeaderForDay($wrapper, date) {
        const settings = getSettings($wrapper);
        const day =  date.toLocaleDateString(settings.locale, {day: 'numeric'})
        const shortMonth = date.toLocaleDateString(settings.locale, {month: 'short'})
        const longMonth = date.toLocaleDateString(settings.locale, {month: 'long'});
        const shortWeekday = date.toLocaleDateString(settings.locale, {weekday: 'short'});
        const longWeekday = date.toLocaleDateString(settings.locale, {weekday: 'long'});
        return  [
            `<div class="p-2">`,
            `<div class="d-none d-xl-flex flex-wrap justify-content-center align-items-center">`,
            `<strong>${longWeekday}</strong>`,
            `<small class="mx-1"></small>`,
            `<strong class="text-nowrap">${day}. ${longMonth}</strong>`,
            `</div>`,
            `<div class="d-flex d-xl-none flex-wrap flex-column justify-content-center align-items-center">`,
            `<strong>${shortWeekday}</strong>`,
            `<small class="text-nowrap">${day} ${shortMonth}</small>`,
            `</div>`,
            `</div>`,
        ].join('');
    }
    /**
     * Build a daily overview with hourly labels and horizontal lines for each line.
     *
     * @param {jQuery} $wrapper - The wrapper element for the calendar.
     * @param {Date} date - The current date.
     * @param {jQuery} $container - The target element in which the content is inserted.
     * @param {boolean} forWeekView
     * @param {boolean} showLabels
     */
    function buildDayViewContent($wrapper, date, $container, forWeekView = false, showLabels = true) {
        // Call settings from the wrapper
        const settings = getSettings($wrapper);
        const isToday = date.toDateString() === new Date().toDateString();
     
        if (!forWeekView) {
            $container = $('<div>', {
                class: 'position-relative px-5'
            }).appendTo($container);
            $container = $('<div>', {
                css: {paddingLeft: '40px'}
            }).appendTo($container);
        }

        $container.attr('data-weekday');
        const longHeader = date.toLocaleDateString(settings.locale, {weekday: 'long', day: 'numeric', month: 'long'});
        const shortHeader = date.toLocaleDateString(settings.locale, {weekday: 'short', day: 'numeric', month: 'short'});

        const headline = $('<div>', {
            class: 'wc-day-header mb-2',
            html: buildHeaderForDay($wrapper, date)
        }).appendTo($container);

        if (isToday) {
            headline.addClass('text-primary');
        }

        if (forWeekView) {
            headline.attr('data-date', formatDateToDateString(date)).css('cursor', 'pointer');
        }

        $('<div>', {
            'data-all-day': true,
            class: 'd-flex flex-column flex-fill',
        }).appendTo($container);

        // Container for time slots
        const timeSlots = $('<div>', {
            class: 'wc-day-view-time-slots d-flex flex-column position-relative  py-2'
        }).appendTo($container);

        // present hours (from 0 to 23) with a horizontal line
        for (let hour = 0; hour <= 24; hour++) {
            // line container for the hour
            // Add heading about the daily view
            const row = $('<div>', {
                'data-day-hour': hour,
                css: {
                    height: '34px',
                },
                class: 'd-flex align-items-center border-top position-relative'
            }).appendTo(timeSlots);

            if (showLabels) {
                // hourly label (e.g. 08:00)
                $('<div>', {
                    class: 'wc-time-label ps-2 position-absolute top-0 translate-middle',
                    css: {
                        left: '-34px'
                    },
                    html: `${hour.toString().padStart(2, '0')}:00 <i class="${settings.icons.timeSlot}"></i>`
                }).appendTo(row);
            }
        }
    }

    /**
     * Constructs the year view UI within the specified wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element where the year view will be appended.
     * @return {void} This function does not return a value.
     */
    function buildYearView($wrapper) {
        const container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);
        const date = getDate($wrapper);
        const year = date.getFullYear();

        // empty the container beforehand
        container.empty();

        // Flex layout for all 12 monthly calendars
        const grid = $('<div>', {
            class: 'd-flex flex-wrap p-3', // Flexbox for inline representation
            css: {
                gap: '10px', // distance between calendars
            },
        }).appendTo(container);

        // render a small calendar for each month
        for (let month = 0; month < 12; month++) {
            // Create a wrapper for every monthly calendar
            const monthWrapper = $('<div>', {
                class: 'd-flex shadow p-3 flex-column rounded-' + settings.rounded + ' align-items-center wc-year-month-container', // Col-Layout für Titel und Kalender
                css: {
                    width: '200px', // fixed width for every calendar
                    margin: '5px', // distance on the edge
                },
            }).appendTo(grid);

            // monthly name and year as the title (e.g. "January 2023")
            const monthName = new Intl.DateTimeFormat(settings.locale, {month: 'long'}).format(
                new Date(year, month)
            );
            $('<div>', {
                'data-month': `${year}-${String(month + 1).padStart(2, '0')}-01`,
                class: 'text-center fw-bold',
                text: `${monthName} ${year}`,
                css: {
                    cursor: 'pointer',
                    marginBottom: '10px',
                },
            }).appendTo(monthWrapper);

            const monthContainer = $('<div>').appendTo(monthWrapper)

            // Insert small monthly calendars
            const tempDate = new Date(year, month, 1); // start date of the current month
            buildMonthSmallView($wrapper, tempDate, monthContainer);
        }
    }
}(jQuery))
