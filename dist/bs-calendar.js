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
 * @date 2025-03-11
 * @global jQuery
 */

(function ($) {
    'use strict';
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
            search: {
                limit: 10,
                offset: 0
            },
            startDate: new Date(),
            startView: 'month', // day, week, month, year
            defaultColor: 'primary',
            views: ['year', 'month', 'week', 'day'],
            translations: {
                day: 'Day',
                week: 'Week',
                month: 'Month',
                year: 'Year',
                today: 'Today',
                appointment: 'Appointment',
                search: 'Type and press Enter',
                searchNoResult: 'No appointment found'
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
                appointmentAllDay: 'bi bi-brightness-high',
                timeSlot: 'bi bi-caret-right-fill',
            },
            url: null,
            queryParams: null,
            topbarAddons: null,
            sidebarAddons: null,
            debug: false,
            formatter: {
                day: formatterDay,
                week: formatterDay,
                month: formatterMonth,
                window: formatInfoWindow,
                duration: formatDuration,
            }
        }
    };

    const viewContainerClass = 'wc-calendar-view-container';

    const infoWindowModalId = '#wcCalendarInfoWindowModal';

    const topNavClass = 'wc-calendar-top-nav';
    const topSearchClass = 'wc-calendar-top-search-nav';

    const hourSlotHeight = 30;

    const translateMiddleCss = [
        'transform: translate(-50%,-50%)'
    ];

    const start0Css = [
        'left: 0'
    ];
    const start25Css = [
        'left: 25%'
    ];
    const start50Css = [
        'left: 50%'
    ];
    const start75Css = [
        'left: 75%'
    ];
    const start100Css = [
        'left: 100%'
    ];

    const top0Css = [
        'top: 0'
    ];
    const top25Css = [
        'top: 25%'
    ];
    const top50Css = [
        'top: 50%'
    ];
    const top75Css = [
        'top: 75%'
    ];
    const top100Css = [
        'top: 100%'
    ];

    function getBorderRadiusCss(number) {
        let rounded = '0';
        switch (number) {
            case 1:
                rounded = '0.25rem';
                break;
            case 2:
                rounded = '0.5rem';
                break;
            case 3:
                rounded = '0.75rem';
                break;
            case 4:
                rounded = '1rem';
                break;
            case 5:
                rounded = '2rem';
                break;
        }
        return `border-radius: ${rounded} !important`;
    }

    /**
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
                onResize(wrapper);
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

    function formatterDay(appointment, view) {
        return appointment.title;
    }

    function formatterMonth(appointment) {
        const startTime = new Date(appointment.start).toLocaleTimeString(appointment.extras.locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
        const timeToShow = appointment.allDay ? '' : `<small class="me-1 mr-1">${startTime}</small>`;
        const icon = `<i class="${appointment.extras.icon} me-1 mr-1"></i>`;
        const styles = [
            'font-size: 12px',
            'line-height: 18px'
        ].join(';')
        return [
            `<div class=" d-flex align-items-center flex-nowrap" style="${styles}">`,
            icon,
            timeToShow,
            `<span class="text-nowrap d-inline-block w-100 text-truncate">${appointment.title}</span>`,
            `</div>`
        ].join('')
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
            setAppointments($wrapper, []).then(cleanedAppointments => {
                // empty
            });
        }
    }

    /**
     * Destroys and cleans up the specified wrapper element by removing associated data and content.
     *
     * @param {jQuery} $wrapper - The jQuery-wrapped DOM element to be cleaned up and reset.
     * @return {void} Does not return a value.
     */
    function destroy($wrapper) {
        $(infoWindowModalId).modal('hide');
        $wrapper.removeData('initBsCalendar');
        $wrapper.removeData('settings');
        $wrapper.removeData('view');
        $wrapper.removeData('date');
        $wrapper.removeData('appointments');
        $wrapper.removeData('searchMode');
        $wrapper.removeData('searchPagination');
        $wrapper.removeData('currentRequest');

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

        buildByView($wrapper);
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
    async function formatInfoWindow(appointment, locale) {
        return new Promise((resolve, reject) => {
            try {
                // Zeiten und Anzeigedaten extrahieren
                const times = [];
                const displayDates = appointment.extras.displayDates;
                const startDate = formatDateByLocale(displayDates[0].date);
                const endDate = formatDateByLocale(displayDates[displayDates.length - 1].date);
                const isSameDate = startDate === endDate;

                let showDate = isSameDate ? startDate : `${startDate} - ${endDate}`;
                let showTime = showDate;

                if (!appointment.allDay) {
                    let startTime = appointment.extras.displayDates[0].times.start.substring(0, 5);
                    let endTime = appointment.extras.displayDates[displayDates.length - 1].times.end.substring(0, 5);
                    if (isSameDate) {
                        showTime = `${startDate} ${startTime} - ${endTime}`;
                    } else {
                        showTime = `${startDate} ${startTime}<br>${endDate} ${endTime}`;
                    }
                }

                // Link generieren, wenn vorhanden
                const roundedCss = getBorderRadiusCss(5);
                const link = appointment.link
                    ? `<a class="btn btn-primary  px-5" style="${roundedCss}" href="${appointment.link}" target="_blank" rel="noopener noreferrer">Link</a>`
                    : '';

                // Standortinformationen verarbeiten
                let location = "";
                if (appointment.location) {
                    if (Array.isArray(appointment.location)) {
                        location = appointment.location.join('<br>');
                    }
                    if (typeof appointment.location === 'string') {
                        location = appointment.location;
                    }
                    if (location !== "") {
                        location = `<p>${location}</p>`;
                    }
                }

                // Ergebnis zusammenbauen und Promise auflösen
                const result = [
                    `<h3>${appointment.title}</h3>`,
                    `<p>${showTime} (${appointment.extras.duration.formatted})</p>`,
                    location,
                    `<p>${appointment.description || "Keine Beschreibung verfügbar."}</p>`,
                    link
                ].join('');

                resolve(result);
            } catch (error) {
                reject(`Error in formatter.window: ${error.message}`);
            }
        });
    }

    /**
     * Formatiert ein Datum anhand einer gegebenen Locale.
     *
     * @param {Date} date - Das zu formatierende Datum.
     * @param {string} locale - Die zu verwendende Locale, z.B. 'de-DE' für Deutsch oder 'en-US' für Englisch (Standard: 'en-EN').
     * @returns {string} Das formatierte Datum.
     */
    function formatDateByLocale(date, locale) {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        // Formatierungsoptionen
        const options = {weekday: 'long', month: 'long', day: 'numeric'};
        return new Intl.DateTimeFormat(locale, options).format(date);
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
                $wrapper.addClass('position-relative');
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
                let searchObject = settings.search
                && settings.search.hasOwnProperty('limit')
                && settings.search.hasOwnProperty('offset') ?
                    {limit: settings.search.limit, offset: settings.search.offset} : null;
                setSearchPagination($wrapper, searchObject);
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
     * Extracts and returns the time in HH:mm format from a given datetime object or string.
     * If the time is midnight (00:00), it returns null.
     *
     * @param {Date|string} date - The datetime value, which can be a Date object or a date string.
     * @return {string|null} The formatted time in HH:mm format or null if the time is midnight.
     */
    function getTimeFromDatetime(date) {
        if (typeof date === 'string') {
            date = new Date(date);
        }

        // Prüfen, ob das Datum ungültig ist
        if (isNaN(date)) {
            console.error("Ungültiges Datum in getTimeFromDatetime:", date);
            return null; // Ungültiges Datum
        }

        // Immer Zeitanteile zurückgeben, unabhängig von Werten (z. B. 00:00:00)
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    function normalizeDateTime(dateTime) {
        if (typeof dateTime === "string") {
            return dateTime.replace(" ", "T");
        }
        return dateTime; // Falls der Wert kein String ist, gib ihn direkt zurück.
    }

    /**
     * Processes and sets the given appointments within the wrapper element. This involves validating,
     * sorting, adding extra details, and storing the processed appointments in the wrapper's data attribute.
     *
     * @param {jQuery} $wrapper - The wrapper element where the appointments will be set.
     * @param {Array} appointments - An array of appointment objects to be processed and stored.
     *                                Each object should minimally contain appointment-specific details.
     * @return {Promise<Array>} A Promise that resolves with the processed list of appointments if successful,
     *                          or rejects with an error if an issue occurs during the sorting or processing.
     */
    async function setAppointments($wrapper, appointments) {
        const settings = getSettings($wrapper);

        // Return a Promise to manage asynchronous operations
        return new Promise((resolve, reject) => {
            // Check if the appointments array is valid, contains appointments, and is not empty
            const hasAppointmentsAsArray = appointments && Array.isArray(appointments) && appointments.length > 0;
            if (!hasAppointmentsAsArray) {
                // If no valid appointments are provided, initialize an empty appointments array
                appointments = [];

                // Store the empty appointments list in the wrapper's data attribute
                $wrapper.data('appointments', appointments);

                // Resolve the Promise with an empty list of appointments
                resolve(appointments);
                return resolve([]);
            }
            const view = getView($wrapper);
            if (view === 'year') {
                const processedAppointments = appointments
                    .filter(appointment => {
                        // Prüfen, ob `date` vorhanden ist und gültig ist
                        const isValidDate = appointment.hasOwnProperty('date') && !isNaN(Date.parse(appointment.date));
                        // Prüfen, ob `total` vorhanden ist und größer als 0 ist
                        const isValidTotal = appointment.hasOwnProperty('total') && parseInt(appointment.total) > 0;
                        // Nur dann übernehmen, wenn beide Prüfungen erfolgreich sind
                        return isValidDate && isValidTotal;
                    })
                    .map(appointment => {
                        // Den Wert von `total` auf Integer setzen (falls erforderlich)
                        appointment.total = parseInt(appointment.total);
                        return appointment;
                    });
                setAppointmentExtras($wrapper, processedAppointments);
                $wrapper.data('appointments', processedAppointments);
                return resolve(processedAppointments);
            }

            // Check if the appointments array is valid, contains appointments, and is not empty
            cleanAppointments($wrapper, appointments);

            // Determine if the system is in search mode to adjust sorting behavior
            const inSearchMode = getSearchMode($wrapper);

            // Sort the appointments based on their start time
            // If not in search mode, use ascending order
            sortAppointmentByStart(appointments, !inSearchMode)
                .then(sortedAppointments => {
                    // Calculate additional details for appointments (e.g., duration, custom flags)
                    setAppointmentExtras($wrapper, appointments);

                    // Store the processed appointments inside the wrapper's data attribute
                    $wrapper.data('appointments', appointments);

                    // Resolve the Promise successfully with the processed appointments
                    resolve(appointments);
                })
                .catch(error => {
                    if (settings.debug) {
                        // Log errors during the sorting or processing of appointments
                        console.error("Error processing appointments:", error);
                    }

                    // Reject the Promise if an error occurs
                    reject(error);
                });

        });
    }

    function getBootstrapVersion() {
        let bootstrapVersion;

        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
            if (typeof bootstrap.Modal.getOrCreateInstance === 'function') {
                bootstrapVersion = 5; // Bootstrap 5
            } else {
                bootstrapVersion = 4; // Bootstrap 4
            }
        } else {
            bootstrapVersion = 5; // Bootstrap nicht geladen
        }
        return bootstrapVersion;
    }

    /**
     * Get colors (background and text) based on a given color or fallback color, built with jQuery.
     *
     * @param {string} color - The primary color as a direct HEX, RGB, RGBA value or a CSS class.
     * @param {string} fallbackColor - The fallback color or class if the primary color is invalid.
     * @returns {object} - An object containing the colors: backgroundColor, backgroundImage, and text color.
     */
    function getColors(color, fallbackColor) {
        function isDirectColorValid(inputColor) {
            if (!inputColor || typeof inputColor !== "string") return false;

            const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
            const rgbPattern = /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:,\s*(0|0?\.\d+|1))?\s*\)$/;

            return hexPattern.test(inputColor) || rgbPattern.test(inputColor);
        }

        function getComputedStyles(inputClassNames) {
            const bsV = getBootstrapVersion();
            // Prüfen und Klassen entsprechend anpassen
            const classList = inputClassNames.split(" ").map(className => {
                if (className.includes("opacity") || className.includes("gradient")) {
                    // Falls opacity oder gradient enthalten ist
                    return className.startsWith("bg-") ? className : `bg-${className}`;
                } else {

                    console.log("bsV in getComputedStyles:", bsV);
                    // Für andere Klassen
                    switch (bsV) {
                        case 5:
                            return className.startsWith("bg-")
                                ? className.replace("bg-", "text-bg-") // bg- zu text-bg- ändern
                                : `text-bg-${className}`; // text-bg- hinzufügen
                        case 4:
                            if (className.startsWith("bg-")) {
                                return className;
                            } else {
                                return "bg-" + className;
                            }
                    }
                    return className.startsWith("bg-") && bsV === 5
                        ? className.replace("bg-", "text-bg-") // bg- zu text-bg- ändern
                        : `text-bg-${className}`; // text-bg- hinzufügen
                }
            });

            // console.log("Verarbeitete Klassenliste:", classList);

            // Temporäres Element erstellen
            const tempElement = document.createElement("div");
            tempElement.style.display = "none";
            tempElement.style.position = "absolute";
            document.body.appendChild(tempElement);

            // Iteration über die Klassen und Zuweisung an das Element
            classList.forEach(className => {
                tempElement.classList.add(className);
            });

            // Mithilfe von getComputedStyle berechnete Stile abrufen
            const computedStyles = window.getComputedStyle(tempElement);

            // Hintergrundfarbe verarbeiten
            const backgroundColor = computedStyles.backgroundColor || "rgba(0, 0, 0, 0)";
            // Hintergrundbild (z. B. für Gradient)
            const backgroundImage = computedStyles.backgroundImage || "none";
            // Textfarbe (z. B. abhängig von der Hintergrundfarbe)
            const color = bsV > 4 ? (computedStyles.color || "#000000") : (isDarkColor(backgroundColor) ? "#ffffff" : "#000000");
            // Deckkraft (falls relevant)
            const opacity = computedStyles.opacity || "1";

            // document.body.removeChild(tempElement); // Temporäres Element entfernen

            // Hintergrundfarbe anpassen, falls Deckkraft vorhanden ist
            let adjustedBackgroundColor = backgroundColor;
            if (backgroundColor.startsWith("rgb") && parseFloat(opacity) < 1) {
                const matchRgb = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (matchRgb) {
                    const [_, r, g, b] = matchRgb;
                    adjustedBackgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                }
            }

            // Ergebnis zurückgeben
            const result = {
                backgroundColor: adjustedBackgroundColor,
                backgroundImage: backgroundImage,
                color: color,
                classList: classList,
                origin: inputClassNames,
            };

            // console.log("Finales Ergebnis:", result);
            return result;
        }

        function isDarkColor(color) {
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

        function computeColor(inputColor) {
            if (isDirectColorValid(inputColor)) {
                const isDark = isDarkColor(inputColor);
                return {
                    backgroundColor: inputColor, // Direkte Hintergrundfarbe
                    backgroundImage: "none", // Standardmäßig kein Bild
                    color: isDark ? "#FFFFFF" : "#000000", // Textfarbe basierend auf Hintergrund
                };
            } else if (inputColor) {
                return getComputedStyles(inputColor); // Klassen berücksichtigen
            }

            return null; // Ungültiger Input
        }

        const primaryResult = computeColor(color); // Berechne Primärfarbe
        const fallbackResult = primaryResult || computeColor(fallbackColor); // Fallback berücksichtigen

        const defaultValues = {
            backgroundColor: "#000000", // Schwarzer Hintergrund, falls nichts passt
            backgroundImage: "none", // Kein Hintergrundbild standardmäßig
            color: "#FFFFFF", // Standard-Textfarbe bei dunklem Hintergrund
        };

        const result = {...defaultValues, ...fallbackResult};

        return {
            origin: color, // Eingabe für Debug-Zwecke
            ...result,
        };
    }

    /**
     * Cleans and normalizes a list of appointments by applying validation and formatting based on the provided wrapper settings.
     *
     * @param {Object} $wrapper - The wrapper object containing configuration and settings used for cleaning appointments.
     * @param {Array} appointments - A list of appointment objects to be cleaned and normalized.
     * @return {void} - This method does not return a value but modifies the appointments array in place.
     */
    function cleanAppointments($wrapper, appointments) {
        const settings = getSettings($wrapper); // get settings from the wrapper
        appointments.forEach(appointment => {

            // Ensure start and end times are properly normalized
            appointment.start = normalizeDateTime(appointment.start.trim());
            appointment.end = normalizeDateTime(appointment.end.trim());

            if (appointment.allDay) {
                // Clean up start and end times when the appointment is all-day
                const startDate = new Date(appointment.start);
                const endDate = new Date(appointment.end);

                // Set the beginning and end of the whole day
                appointment.start = new Date(
                    startDate.getFullYear(),
                    startDate.getMonth(),
                    startDate.getDate(),
                    0, 0, 0 // midnight
                ).toISOString();

                appointment.end = new Date(
                    endDate.getFullYear(),
                    endDate.getMonth(),
                    endDate.getDate(),
                    23, 59, 59 // end of the day
                ).toISOString();
            }
        });
    }

    /**
     * Sorts a list of appointments by their start time in ascending order.
     *
     * @param {Array<Object>} appointments - An array of appointment objects where each object contains a 'start' property representing the starting time of the appointment.
     * @return {Array<Object>} The sorted array of appointment objects in ascending order of their start times.
     */
    async function sortAppointmentByStart(appointments, sortAllDay = true) {
        if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
            return [];
        }
        return new Promise((resolve, reject) => {
            try {
                // Sortiere die Termine
                appointments.sort((a, b) => {
                    if (sortAllDay) {
                        // All-Day-Termine zuerst
                        if (a.allDay && !b.allDay) {
                            return -1; // a vor b
                        }
                        if (!a.allDay && b.allDay) {
                            return 1; // b vor a
                        }
                    }

                    // Innerhalb gleicher Kategorie nach Startdatum sortieren
                    return new Date(a.start) - new Date(b.start);
                });

                resolve(appointments); // Gib das sortierte Array zurück
            } catch (error) {
                reject(error); // Falls ein Fehler auftritt, verwirf das Promise
            }
        });
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

        const roundedCss = getBorderRadiusCss(settings.rounded);
        const topNav = $('<div>', {
            class: `d-flex sticky-top align-items-center px-0 justify-content-end mb-3 ${topNavClass} bg-body`,
            style: roundedCss
        }).appendTo(innerWrapper);

        if (settings.topbarAddons && $(settings.topbarAddons).length > 0) {
            $(settings.topbarAddons).insertAfter(topNav);
        }

        const topSearchNav = $('<div>', {
            class: `d-none sticky-top align-items-center px-0 justify-content-center mb-3 ${topSearchClass} bg-body`,
            style: roundedCss
        });

        $('<button>', {
            class: `btn border`,
            html: `<i class="${settings.icons.add}"></i>`,
            style: roundedCss,
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
            class: 'd-flex ms-2 ml-2 align-items-center justify-content-center wc-nav-view-wrapper flex-nowrap text-nowrap',
            html: [
                '<small class="wc-nav-view-name mr-3 me-3"></small>',
                `<a data-prev href="#"><i class="${settings.icons.prev}"></i></a>`,
                `<a class="mx-2" data-next href="#"><i class="${settings.icons.next}"></i></a>`,
            ].join('')
        }).appendTo(topNav);

        if (settings.search) {
            topSearchNav.insertAfter(topNav);
            // add a search button to topnav
            const showSearchbar = $('<button>', {
                class: `btn border js-btn-search`,
                html: `<i class="${settings.icons.search}"></i>`,
                style: roundedCss,
            }).appendTo(topNav);
            showSearchbar.on('click', function () {
                toggleSearchBar($wrapper, true);
                // toggleSearchMode($wrapper, true);
            });

            // add the search input to top search bar
            const inputCss = 'max-width: 400px; ' + roundedCss;
            $('<input>', {
                type: 'search',
                style: inputCss,
                class: 'form-control border',
                placeholder: settings.translations.search || 'search',
                'data-search-input': true
            }).appendTo(topSearchNav);

            // add a close button
            const btnCloseSearch = $('<button>', {
                class: `btn p-2 ms-2 ml-2 js-btn-close-search`,
                html: `<i class="bi bi-x-lg mx-2"></i>`,
                style: roundedCss,
                "aria-label": "Close"
            }).appendTo(topSearchNav);

            btnCloseSearch.on('click', function () {
                toggleSearchBar($wrapper, false);
                if (getSearchMode($wrapper)) {
                    toggleSearchMode($wrapper, false, true);
                }
            })
        }

        $('<button>', {
            class: `btn ms-2 ml-2 border`,
            html: settings.translations.today,
            style: roundedCss,
            'data-today': true
        }).appendTo(topNav);

        // If only one view is desired, give no selection
        if (settings.views.length > 1) {
            const dropDownView = $('<div>', {
                class: 'dropdown wc-select-calendar-view ms-2 ml-2',
                html: [
                    `<a class="btn border dropdown-toggle" style="${roundedCss}" href="#" role="button" data-toggle="dropdown" data-bs-toggle="dropdown" aria-expanded="false">`,
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

        const sidebar = $('<div>', {
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

        if (settings.sidebarAddons && $(settings.sidebarAddons).length > 0) {
            $(settings.sidebarAddons).appendTo(sidebar);
        }

        $('<div>', {
            class: `container-fluid ${viewContainerClass} pb-5 border-1 flex-fill border overflow-hidden  d-flex flex-column align-items-stretch`,
            style: roundedCss,
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

    /**
     * Toggles the visibility of the search bar within the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the container element that holds the search bar and navigation elements.
     * @param {boolean} status - A boolean indicating whether to show or hide the search bar.
     * If true, the search bar will be displayed and focused; if false, it will be hidden and cleared.
     * @return {void} This method does not return a value.
     */
    function toggleSearchBar($wrapper, status) {
        const input = getSearchElement($wrapper);
        const topNav = $wrapper.find('.' + topNavClass);
        const topSearchNav = $wrapper.find('.' + topSearchClass);
        if (status) {
            topNav.removeClass('d-flex').addClass('d-none');
            topSearchNav.removeClass('d-none').addClass('d-flex');
            input.focus();
        } else {
            input.val(null);
            topNav.removeClass('d-none').addClass('d-flex');
            topSearchNav.removeClass('d-flex').addClass('d-none');
        }
    }

    function toggleSearchMode($wrapper, status, rebuildView = true) {
        const settings = getSettings($wrapper);
        // toggleSearchBar($wrapper, status);
        setSearchMode($wrapper, status);

        if (status) {
            buildByView($wrapper);
        } else {
            const search = {
                limit: settings.search.limit,
                offset: settings.search.offset
            };

            setSearchPagination($wrapper, search);

            if (rebuildView) {
                buildByView($wrapper)
            }

        }
    }

    function resetSearchPagination($wrapper) {
        const settings = getSettings($wrapper);
        const search = {limit: settings.search.limit, offset: settings.search.offset};
        setSearchPagination($wrapper, search);
    }

    function setSearchPagination($wrapper, object) {
        const pagination = isValueEmpty(object) ? null : object;
        $wrapper.data('searchPagination', pagination);
    }

    function getSearchPagination($wrapper) {
        return $wrapper.data('searchPagination');
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
        let resizeTimer;

        $(window).on('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                onResize($wrapper); // call up your function here
            }, 100); // Delay of 100 milliseconds
        });
        $('body')
            .on('click', infoWindowModalId + ' [data-edit]', function (e) {
                e.preventDefault();
                const appointment = $(infoWindowModalId).data('appointment');
                let extras = null;
                if (appointment.extras) {
                    extras = appointment.extras;
                    delete appointment.extras;
                }

                $(infoWindowModalId).modal('hide')
                trigger($wrapper, 'edit', [appointment, extras]);
            })
            .on('click', infoWindowModalId + ' [data-remove]', function () {
                e.preventDefault();
                const appointment = $(infoWindowModalId).data('appointment');
                let extras = null;
                if (appointment.extras) {
                    extras = appointment.extras;
                    delete appointment.extras;
                }

                $(infoWindowModalId).modal('hide')
                trigger($wrapper, 'delete', [appointment, extras]);
            })
            .on('click', function (e) {
                const $target = $(e.target);
                const isInsideModal = $target.closest(infoWindowModalId).length > 0; // checks for modal or child elements
                const isTargetElement = $target.closest('[data-appointment]').length > 0; // checks for the target element with appointment data

                // the modal only closes if the click was neither in the modal nor a target element
                if (!isInsideModal && !isTargetElement && $(infoWindowModalId).length) {
                    $(infoWindowModalId).modal('hide');
                }
            })
            .on('hidden.bs.modal', infoWindowModalId, function () {
                // removes the modal completely after it has been closed
                if ($(infoWindowModalId).length) {
                    $(infoWindowModalId).remove();
                }
            });

        $wrapper
            .on('click', '.wc-search-pagination [data-page]', function (e) {
                // A page in the search navigation was clicked
                e.preventDefault();
                // determine the requested page
                const $clickedLink = $(e.currentTarget);
                const newPage = parseInt($clickedLink.attr('data-page'));
                // update the pagination cries
                const searchPagination = getSearchPagination($wrapper);
                searchPagination.offset = (newPage - 1) * searchPagination.limit;
                const search = {limit: searchPagination.limit, offset: searchPagination.offset};
                setSearchPagination($wrapper, search);
                // delete the navigation buttons because they are rebuilt
                $wrapper.find('.wc-search-pagination').remove();
                // get the appointments
                fetchAppointments($wrapper);
            })
            .on('keyup', '[data-search-input]', function (e) {
                e.preventDefault();

                const input = $(e.currentTarget);
                const isEmpty = isValueEmpty(input.val()); // Check if the input is empty
                let inSearchMode = getSearchMode($wrapper);
                if (!inSearchMode && !isEmpty) {
                    setSearchMode($wrapper, true, false);
                    inSearchMode = true;
                }

                // If input is empty, stop here and optionally disable search mode
                if (isEmpty) {
                    toggleSearchMode($wrapper, false, true); // End search mode if necessary
                    return;
                }

                // Trigger search immediately if Enter key is pressed or input field gets updated
                const isEnterKey = e.type === 'keyup' && (e.key === 'Enter' || e.which === 13 || e.keyCode === 13);

                if (isEnterKey) {
                    triggerSearch($wrapper);
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
                showInfoWindow($wrapper, element);
            })
            .on('click', '[data-date]', function (e) {
                e.preventDefault();
                const settings = getSettings($wrapper);
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    toggleSearchMode($wrapper, false, false);
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

    // Benutzerdefinierte Suchfunktion (z. B. API-Aufruf oder Filter anwenden)
    function triggerSearch($wrapper) {
        const settings = getSettings($wrapper); // Einstellungen holen
        resetSearchPagination($wrapper);
        buildByView($wrapper); // Ansicht aktualisieren
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
        if (typeof date === 'string') {
            date = new Date(date);
        }
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
            onResize($wrapper);
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
        // Clear previous data or states related to the wrapper
        methodClear($wrapper);

        // Retrieve settings specific to this wrapper
        const settings = getSettings($wrapper);
        let skipLoading = false;

        // Log debug information if debugging is enabled in settings
        if (settings.debug) {
            log('Call fetchAppointments');
        }

        // Declare variable for request data
        let requestData;
        // Determine whether the function is in search mode
        const inSearchMode = getSearchMode($wrapper);

        // Prepare data for the AJAX request
        if (!inSearchMode) {
            // Retrieve the current view type (e.g., day, week, month, year)
            const view = getView($wrapper);
            // Calculate the start and end date range based on the view
            const period = getStartAndEndDateByView($wrapper);
            if (view === 'year') {
                // If the view is yearly, prepare request data specific to the year
                requestData = {
                    year: new Date(period.date).getFullYear(),
                    view: view // 'year'
                };
            } else {
                // For daily, weekly, or monthly views, use the start and end dates
                requestData = {
                    fromDate: period.start, // Start date in ISO format
                    toDate: period.end,    // End date in ISO format
                    view: view, // 'day', 'week', 'month'
                };
            }
        } else {
            // In search mode, retrieve the search element and its value
            const searchElement = getSearchElement($wrapper);
            const search = searchElement?.val() ?? null;
            // Check if the search value is empty to decide if loading should be skipped
            skipLoading = isValueEmpty(search);
            requestData = {
                ...getSearchPagination($wrapper), // Include pagination data
                search: search // The search string, if provided
            };
        }

        // If queryParams is a function in settings, enrich the request data dynamically
        if (typeof settings.queryParams === 'function') {
            const queryParams = settings.queryParams(requestData);
            for (const key in queryParams) {
                // Add or overwrite requestData fields with queryParams
                requestData[key] = queryParams[key];
            }
        }

        // If there is nothing to search (skipLoading is true), handle this case
        if (skipLoading) {
            if (settings.debug) {
                log('Skip loading appointments because search is empty');
            }
            // Update the appointments list with an empty array and re-build the default view
            setAppointments($wrapper, []).then(cleanedAppointments => {
                buildAppointmentsForView($wrapper);
            });
            return; // Exit the function
        }

        // Trigger a custom "beforeLoad" event before loading appointments
        trigger($wrapper, 'beforeLoad', [requestData]);

        // Display the loading indicator for the wrapper
        const callFunction = typeof settings.url === 'function';
        const callAjax = typeof settings.url === 'string';
        if (callFunction || callAjax) {
            showBSCalendarLoader($wrapper);
        }

        // Check if the URL for fetching appointments is a function
        if (callFunction) {
            if (settings.debug) {
                log('Call appointments by function with query:', requestData);
            }
            // Call the function-based URL and handle the result as a promise
            settings.url(requestData)
                .then(appointments => {
                    // Log the fetched result if debugging is enabled
                    if (settings.debug) {
                        log('result:', appointments);
                    }
                    if (inSearchMode) {
                        // In search mode, process the rows and build the search-related views
                        setAppointments($wrapper, appointments.rows).then(cleanedAppointments => {
                            buildAppointmentsForSearch($wrapper, cleanedAppointments, appointments.total);
                        });
                    } else {
                        // In normal mode, process appointments and build the main view
                        setAppointments($wrapper, appointments).then(cleanedAppointments => {
                            buildAppointmentsForView($wrapper);
                        });
                    }
                })
                .catch(error => {
                    // Hide the loader and log the error if debugging is enabled
                    hideBSCalendarLoader($wrapper);
                    if (settings.debug) {
                        log('Error fetching appointments:', error);
                    }
                })
                .finally(() => {
                    // Always hide the loader, regardless of success or error
                    hideBSCalendarLoader($wrapper);
                });

        } else if (callAjax) {
            // If the URL is a string, manage the current request

            // Check if there's an ongoing request associated with the wrapper, and abort it
            const existingRequest = $wrapper.data('currentRequest');

            if (existingRequest) {
                existingRequest.abort(); // Cancel the previous AJAX request
                $wrapper.data('currentRequest', null)
            }

            // Log the URL being called for debugging
            if (settings.debug) {
                log('Call appointments by URL:', settings.url);
            }

            // Send a new AJAX GET request with the prepared request data
            const newRequest = $.ajax({
                url: settings.url,
                method: 'GET',
                contentType: 'application/json', // Specify JSON content type
                data: requestData, // Convert request data to JSON string
                success: function (response) {
                    if (inSearchMode) {
                        // In search mode, handle the response rows and build the search views
                        setAppointments($wrapper, response.rows).then(cleanedAppointments => {
                            buildAppointmentsForSearch($wrapper, cleanedAppointments, response.total);
                        });
                    } else {
                        // In normal mode, handle the response and build the default view
                        setAppointments($wrapper, response).then(cleanedAppointments => {
                            buildAppointmentsForView($wrapper);
                        });
                    }
                },
                error: function (xhr, status, error) {
                    // Handle errors unless they were caused by request cancellation (abort)
                    if (status !== 'abort') {
                        if (settings.debug) {
                            log('Error when retrieving the dates:', status, error);
                        }
                    }
                },
                complete: function () {
                    // Always remove the current request and hide the loader after the request ends
                    $wrapper.removeData('currentRequest');
                    hideBSCalendarLoader($wrapper);
                }
            });

            // Save the newly initiated request in the wrapper's data for management
            $wrapper.data('currentRequest', newRequest);
        }
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


    function groupOverlappingAppointments($wrapper, appointments) {
        const groupedByWeekdays = {};
        const view = getView($wrapper);


        // 1. Termine nach Wochentag gruppieren
        appointments.forEach((appointment) => {
            appointment.extras.displayDates.forEach((obj) => {
                // Ignoriere Termine, die in der Wochenansicht nicht sichtbar sind
                if (view === 'week' && !obj.visibleInWeek) {
                    return;
                }

                // Benutze explizite Konstruktion von Datum und Zeit:
                const slotStart = new Date(`${obj.date}T${obj.times.start}`);
                const slotEnd = new Date(`${obj.date}T${obj.times.end}`);

                // Wochentag korrekt berechnen
                const weekday = slotStart.getDay();

                // Initialisiere Tagesstruktur, falls noch nicht vorhanden
                if (!groupedByWeekdays[weekday]) {
                    groupedByWeekdays[weekday] = {appointments: [], columns: [], fullWidth: []};
                }

                groupedByWeekdays[weekday].appointments.push({
                    start: slotStart,
                    end: slotEnd,
                    appointment
                });
            });
        });

        // 2. Spalten und FullWidth erstellen
        Object.keys(groupedByWeekdays).forEach((day) => {
            const {appointments, columns, fullWidth} = groupedByWeekdays[day];

            // Sortiere die Termine nach Startzeit
            appointments.sort((a, b) => a.start - b.start);

            appointments.forEach((appointment) => {
                let placedInColumn = false;

                // Versuche, den Termin in vorhandene Spalten einzusortieren
                for (let column of columns) {
                    if (doesNotOverlap(column, appointment)) {
                        column.push(appointment);
                        placedInColumn = true;
                        break;
                    }
                }

                // Falls keine passende Spalte gefunden wurde, prüfe FullWidth
                if (!placedInColumn) {
                    const hasOverlap = appointments.some((otherAppointment) =>
                        otherAppointment !== appointment &&
                        !(appointment.start >= otherAppointment.end || appointment.end <= otherAppointment.start)
                    );

                    // `fullWidth`: Nur wenn kein Überschneiden und keine Spalten notwendig sind
                    if (!hasOverlap && columns.length === 0) {
                        fullWidth.push(appointment);
                    } else {
                        // Andernfalls neue Spalte anlegen
                        columns.push([appointment]);
                    }
                }
            });
        });

        return groupedByWeekdays;
    }


// Hilfsfunktion: Prüfen, ob ein Termin in eine Spalte passt
    function doesNotOverlap(column, newAppointment) {
        for (const appointment of column) {
            if (!(newAppointment.start >= appointment.end || newAppointment.end <= appointment.start)) {
                return false; // Überschneidung
            }
        }
        return true; // Keine Überschneidung
    }

    /**
     * Builds and displays a set of appointments for the specified day within a container.
     *
     * @param {jQuery} $wrapper - The wrapper element containing the calendar.
     * @param {jQuery} $container - The container element where appointments should be rendered.
     * @param {Array} appointments - An array of appointment objects, each containing details such as start, end, title, and color.
     * @return {void} This function does not return a value. It renders appointments into the provided container.
     */
    function drawAppointmentsForDayOrWeek($wrapper, $container, appointments) {
        const settings = getSettings($wrapper);
        const view = getView($wrapper);
        const $viewContainer = getViewContainer($wrapper);
        const allDays = appointments.filter(appointment => appointment.allDay === true);
        const notAllDays = appointments.filter(appointment => appointment.allDay !== true);

        // go through each allDays
        allDays.forEach(appointment => {
            appointment.extras.displayDates.forEach((obj) => {
                const fakeStart = new Date(obj.date);
                const allDayWrapper = $viewContainer.find('[data-all-day="' + fakeStart.getDay() + '"]');
                if (allDayWrapper.length) {
                    allDayWrapper.addClass('pb-3');
                    const appointmentElement = $('<div>', {
                        'data-appointment': true,
                        html: appointment.title,
                        class: `badge mx-1 mb-1 flex-fill`,
                    }).appendTo(allDayWrapper);
                    appointmentElement.data('appointment', appointment);
                    setAppointmentStyles(appointmentElement, appointment.extras.colors);
                }
            });
        });

        const groupedAppointments = groupOverlappingAppointments($wrapper, notAllDays);

        const columnGap = 2; // Abstand zwischen den Spalten in Pixeln

        Object.entries(groupedAppointments).forEach(([weekday, {columns, fullWidth}]) => {
            const $weekDayContainer = $viewContainer.find(`[data-week-day="${weekday}"]`);

            /** 1. Rendern der gruppierten Termine in Spalten **/
            const totalColumns = columns.length; // Anzahl der Spalten berechnen

            columns.forEach((column, columnIndex) => {
                column.forEach((slotData) => {
                    const appointment = slotData.appointment;

                    // Prüfen ob slotData.start und slotData.end gültige Daten sind
                    const startDate = new Date(slotData.start);
                    const endDate = new Date(slotData.end);

                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn(`Ungültiges Datum in Appointment: ${appointment?.title || 'unknown'}`);
                        return; // Überspringe das fehlerhafte Datum
                    }


                    const noOverlapWithNextColumns = columns
                        .slice(columnIndex + 1)
                        .every(nextColumn =>
                            nextColumn.every(slot =>
                                endDate <= new Date(slot.start) || startDate >= new Date(slot.end)
                            )
                        );

                    const totalGap = (totalColumns - 1) * columnGap;
                    let appointmentWidthPercent;

                    if (noOverlapWithNextColumns) {
                        const remainingColumns = totalColumns - columnIndex;
                        const remainingGap = (remainingColumns - 1) * columnGap;
                        appointmentWidthPercent = 100 - ((columnIndex * (100 / totalColumns)) + (remainingGap * 100 / $weekDayContainer.width()));
                    } else {
                        appointmentWidthPercent = totalColumns > 1
                            ? (100 - (totalGap * 100 / $weekDayContainer.width())) / totalColumns
                            : 100;
                    }

                    const appointmentLeftPercent = totalColumns > 1
                        ? (columnIndex * (100 / totalColumns))
                        : 0;

                    const position = calculateSlotPosition(
                        startDate.toISOString(),
                        endDate.toISOString()
                    );

                    // Rendern des Termins
                    const appointmentElement = $('<div>', {
                        'data-appointment': true,
                        class: 'position-absolute text-nowrap text-truncate px-2 btn-sm overflow-hidden rounded',
                        css: {
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            left: `${appointmentLeftPercent}%`,
                            width: `${appointmentWidthPercent}%`,
                        },
                        html: settings.formatter.day(appointment, view),
                    }).appendTo($weekDayContainer);

                    appointmentElement.data('appointment', appointment);
                    // console.log('set colors for day or week', appointment.extras.colors, appointment);
                    setAppointmentStyles(appointmentElement, appointment.extras.colors);
                });
            });

            /** 2. Rendern der isolierten Full-Width-Termine **/
            fullWidth.forEach((slotData) => {
                const appointment = slotData.appointment;

                // Termine, die die ganze Breite einnehmen
                const appointmentWidthPercent = 100; // Volle Breite
                const appointmentLeftPercent = 0; // Kein Abstand von links

                // Standardwert für position
                let position = {
                    top: 0,
                    height: 0
                };

                // Gültigkeitsprüfung für die Daten
                if (
                    slotData.start instanceof Date &&
                    !isNaN(slotData.start) &&
                    slotData.end instanceof Date &&
                    !isNaN(slotData.end)
                ) {
                    position = calculateSlotPosition(
                        slotData.start.toISOString(),
                        slotData.end.toISOString()
                    );
                } else {
                    console.error("Invalid date detected:", slotData.start, slotData.end, appointment);
                }

                // Rendern des Full-Width-Termins
                const appointmentElement = $('<small>', {
                    'data-appointment': true,
                    class: 'position-absolute text-nowrap text-truncate px-2 btn-sm overflow-hidden rounded',
                    css: {
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        left: `${appointmentLeftPercent}%`,
                        width: `${appointmentWidthPercent}%`,
                    },
                    text: settings.formatter.day(appointment, view),
                }).appendTo($weekDayContainer);

                // Meta-Daten und Styling hinzufügen
                appointmentElement.data('appointment', appointment);
                setAppointmentStyles(appointmentElement, appointment.extras.colors);
            });
        });
    }

    /**
     * Sets the text color of an element based on its background color to ensure proper contrast.
     * If the background color is dark, the text color is set to white (#ffffff).
     * If the background color is light, the text color is set to black (#000000).
     *
     * @param {jQuery} $el - The jQuery element whose text color is to be adjusted.
     * @param {object} colors - The default background color to use if the element does not have a defined background color.
     * @return {void} No return value, the method modifies the element's style directly.
     */
    function setAppointmentStyles($el, colors) {

        $el.css({
            backgroundColor: colors.backgroundColor,
            color: colors.color,
            backgroundImage: colors.backgroundImage,
        });
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
    function buildAppointmentsForSearch($wrapper, appointments, total) {
        const $container = getViewContainer($wrapper).find('.wc-search-result-container');
        const settings = getSettings($wrapper);

        if (settings.debug) {
            log('Call buildAppointmentsForSearch with appointments:', appointments, total);
        }

        const input = getSearchElement($wrapper);
        const search = input.val().trim();

        // Wenn kein Suchbegriff vorhanden ist
        if (isValueEmpty(search)) {
            $container.html('<div class="d-flex p-5 align-items-center justify-content-center"></div>');
            input.appendTo($container.find('.d-flex'));
            input.focus();
            return;
        }

        // Wenn keine Suchergebnisse vorhanden sind
        if (!appointments.length) {
            $container.html('<div class="d-flex p-5 align-items-center justify-content-center">' + settings.translations.searchNoResult + '</div>');
            return;
        }

        $container.css('font-size', '.9rem').addClass('py-4');

        const searchPagination = getSearchPagination($wrapper);
        const page = Math.floor(searchPagination.offset / searchPagination.limit) + 1;
        const itemsPerPage = searchPagination.limit;
        const totalPages = Math.ceil(total / itemsPerPage);

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, total);
        const visibleAppointments = appointments.slice(0, endIndex - startIndex);

        $container.empty();

        // Pagination oben hinzufügen
        buildSearchPagination($container, page, totalPages, itemsPerPage, total);

        // Terminliste
        const $appointmentContainer = $('<div>', {class: 'list-group list-group-flush mb-3'}).appendTo($container);

        visibleAppointments.forEach((appointment) => {
            const borderLeftColor = appointment.color || settings.defaultColor;
            const firstCollStyle = [
                `border-left-color:${borderLeftColor}`,
                `border-left-width:5px`,
                `border-left-style:dotted`,
                `cursor:pointer`,
                `font-size:1.75rem`,
                `width: 60px`,
            ].join(';');

            const link = appointment.link
                ? `<a class="btn btn-link p-0 mx-3 btn-sm " href="${appointment.link}" target="_blank"><i class="${settings.icons.link}"></i></a>`
                : '';

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
                `</div>`,
            ].join('');

            const appointmentElement = $('<div>', {
                'data-appointment': true,
                class: 'list-group-item d-flex align-items-center g-3 py-1 overflow-hidden',
                html: html,
                css: {
                    cursor: 'pointer',
                    borderLeftColor: borderLeftColor,
                },
            }).appendTo($appointmentContainer);

            appointmentElement.data('appointment', appointment);
        });

        // Pagination unten hinzufügen
        buildSearchPagination($container, page, totalPages, itemsPerPage, total);
    }

    function buildSearchPagination($container, currentPage, totalPages, itemsPerPage, total) {

        if (totalPages <= 1) {
            return;
        }

        const $paginationWrapper = $('<div>', {
            class: 'd-flex align-items-center justify-content-between my-1 wc-search-pagination',
        }).appendTo($container);

        // Anzeige der Suchergebnisse (Start - Ende | Gesamt)
        const startIndexDisplay = (currentPage - 1) * itemsPerPage + 1;
        const endIndexDisplay = Math.min(currentPage * itemsPerPage, total);
        const statusText = `${startIndexDisplay}-${endIndexDisplay} | ${total}`;

        $('<div>', {
            class: 'alert alert-secondary me-4 mr-4 py-2 px-4',
            text: statusText,
        }).appendTo($paginationWrapper);

        const $pagination = $('<nav>', {'aria-label': 'Page navigation'}).appendTo($paginationWrapper);
        const $paginationList = $('<ul>', {class: 'pagination mb-0'}).appendTo($pagination);

        // Maximalanzahl von Seiten links und rechts der aktuellen Seite
        const maxAdjacentPages = 2;

        // Hilfsfunktion: Seiten hinzufügen
        const addPage = (page) => {
            const $pageItem = $('<li>', {class: 'page-item'});
            if (page === currentPage) {
                $pageItem.addClass('active');
            }
            const $pageLink = $('<a>', {
                'data-page': page,
                class: 'page-link',
                href: '#' + page,
                text: page,
            });
            $pageLink.appendTo($pageItem);
            $pageItem.appendTo($paginationList);
        };

        // Hilfsfunktion: Trunkierung (`...`)
        const addEllipsis = () => {
            $('<li>', {
                class: 'page-item disabled',
            }).append(
                $('<span>', {class: 'page-link', text: '...'})
            ).appendTo($paginationList);
        };

        // 1. Erste Seite immer anzeigen
        if (currentPage > maxAdjacentPages + 1) {
            addPage(1); // Erste Seite
            if (currentPage > maxAdjacentPages + 2) {
                addEllipsis(); // Trunkierung
            }
        }

        // 2. Links von der aktuellen Seite
        for (let i = Math.max(1, currentPage - maxAdjacentPages); i < currentPage; i++) {
            addPage(i);
        }

        // 3. Aktuelle Seite
        addPage(currentPage);

        // 4. Rechts von der aktuellen Seite
        for (let i = currentPage + 1; i <= Math.min(totalPages, currentPage + maxAdjacentPages); i++) {
            addPage(i);
        }

        // 5. Letzte Seite immer anzeigen
        if (currentPage < totalPages - maxAdjacentPages) {
            if (currentPage < totalPages - maxAdjacentPages - 1) {
                addEllipsis(); // Trunkierung
            }
            addPage(totalPages); // Letzte Seite
        }
    }

    /**
     * Generates and appends appointment elements for a given month based on the provided data.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element for the calendar view.
     * @param {Array<Object>} appointments - A list of appointment objects. Each object should include `displayDates`, `start`, `allDay`, `title`, and optionally `color`.
     * @return {void} This function does not return a value; it updates the DOM by injecting appointment elements.
     */
    function drawAppointmentsForMonth($wrapper, appointments) {
        const $container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);
        if (settings.debug) {
            log('Call buildAppointmentsForMonth with appointments:', appointments);
        }

        appointments.forEach(appointment => {
            const multipleStartDates = appointment.extras.displayDates.length > 1;
            appointment.extras.displayDates.forEach(obj => {
                // if (!obj.visibleInMonth) {
                //     return;
                // }
                const startString = obj.date

                const dayContainer = $container.find(`[data-month-date="${startString}"]`);

                const appointmentElement = $('<small>', {
                    'data-appointment': true,
                    class: 'px-1 w-100 overflow-hidden mb-1 rounded',
                    html: settings.formatter.month(appointment)
                }).appendTo(dayContainer);

                appointmentElement.data('appointment', appointment);
                setAppointmentStyles(appointmentElement, appointment.extras.colors);
            })
        })
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
    function setAppointmentExtras($wrapper, appointments) {
        const settings = getSettings($wrapper);
        const view = getView($wrapper);

        if (view === 'year') {
            appointments.forEach(appointment => {
                const extras = {
                    colors: getColors(appointment.color || settings.defaultColor, settings.defaultColor)
                };
                appointment.extras = extras;
            });
            return;
        } else {
            appointments.forEach(appointment => {
                const start = new Date(appointment.start);
                const end = new Date(appointment.end);
                const isAllDay = appointment.allDay;

                const extras = {
                    locale: settings.locale,
                    icon: !isAllDay ? settings.icons.appointment : settings.icons.appointmentAllDay,
                    colors: getColors(appointment.color, settings.defaultColor),
                    start: {
                        date: formatDateToDateString(appointment.start),
                        time: isAllDay ? '00:00:00' : getTimeFromDatetime(appointment.start)
                    },
                    end: {
                        date: formatDateToDateString(appointment.end),
                        time: isAllDay ? '23:59:59' : getTimeFromDatetime(appointment.end)
                    },
                    duration: {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0
                    },
                    displayDates: [],
                    inADay: false,
                };

                let tempDate = new Date(start);
                let tempEnd = new Date(end);
                tempDate.setHours(0, 0, 0, 0);
                tempEnd.setHours(0, 0, 0, 0);

                // Berechne Monatsgrenzen
                const now = new Date(); // Falls der angezeigte Monat/vorherige/nächste Monat gebraucht wird, aktiviere Dynamik
                const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                // Erweiterung für volle Wochenanzeige im Monat
                const firstDayOffset = settings.startWeekOnSunday ? 0 : 1; // Sonntag oder Montag
                const monthStart = new Date(firstOfMonth);
                monthStart.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() - firstDayOffset + 7) % 7)); // Erster Tag der angezeigten Woche
                const monthEnd = new Date(lastOfMonth);
                monthEnd.setDate(lastOfMonth.getDate() + (6 - (lastOfMonth.getDay() - firstDayOffset + 7) % 7)); // Letzter Tag der letzten Woche

                while (tempDate <= tempEnd) {
                    const dateIsStart = isSameDate(tempDate, start);
                    const dateIsEnd = isSameDate(tempDate, end);

                    const dateDetails = {
                        date: formatDateToDateString(tempDate),
                        day: tempDate.getDay(),
                        times: {
                            start: null,
                            end: null
                        },
                        visibleInWeek: false,
                        visibleInMonth: false // Neuer Wert
                    };

                    if (isAllDay) {
                        dateDetails.times.start = null;
                        dateDetails.times.end = null;
                    } else {
                        if (dateIsStart) {
                            dateDetails.times.start = getTimeFromDatetime(start);
                            dateDetails.times.end = end > new Date(tempDate).setHours(23, 59, 59, 999)
                                ? '23:59'
                                : getTimeFromDatetime(end);
                        } else if (dateIsEnd) {
                            dateDetails.times.start = '00:00';
                            dateDetails.times.end = getTimeFromDatetime(end);
                        } else {
                            dateDetails.times.start = '00:00';
                            dateDetails.times.end = '23:59';
                        }
                    }

                    // Prüfung: Liegt tempDate innerhalb der erweiterten Monatsanzeige?
                    if (tempDate >= monthStart && tempDate <= monthEnd) {
                        dateDetails.visibleInMonth = true;
                    }

                    // Prüfung für Wochenanzeige ist bereits implementiert
                    const weekRangeStart = new Date(tempDate);
                    const weekRangeEnd = new Date(tempDate);

                    if (settings.startWeekOnSunday) {
                        weekRangeStart.setDate(weekRangeStart.getDate() - weekRangeStart.getDay());
                    } else {
                        const dayOffset = (weekRangeStart.getDay() === 0 ? 7 : weekRangeStart.getDay()) - 1;
                        weekRangeStart.setDate(weekRangeStart.getDate() - dayOffset);
                    }
                    weekRangeStart.setHours(0, 0, 0, 0);
                    weekRangeEnd.setTime(weekRangeStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);

                    if (tempDate >= weekRangeStart && tempDate <= weekRangeEnd) {
                        dateDetails.visibleInWeek = true;
                    }

                    extras.displayDates.push(dateDetails);
                    tempDate.setDate(tempDate.getDate() + 1);
                }

                // Prüfe, ob der Termin vollständig an einem Tag bleibt
                extras.inADay = extras.displayDates.length === 1;

                // Berechnung der Gesamtdauer des Termins
                const diffMillis = end - start;

                // Überprüfe, ob es sich um einen ganztägigen Termin handelt
                if (appointment.allDay) {
                    // Nur die Kalendertage berücksichtigen, unabhängig von der Uhrzeit
                    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

                    // Differenz in Tagen berechnen
                    const diffDaysMillis = endDate - startDate;
                    extras.duration.days = Math.floor(diffDaysMillis / (24 * 3600 * 1000)) + 1; // +1 inkludiert den letzten Tag
                    extras.duration.hours = 0;
                    extras.duration.minutes = 0;
                    extras.duration.seconds = 0;
                } else {
                    // Normale Berechnung für stundenbasierte Termine
                    const totalSeconds = Math.floor(diffMillis / 1000);
                    extras.duration.days = Math.floor(totalSeconds / (24 * 3600));
                    extras.duration.hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
                    extras.duration.minutes = Math.floor((totalSeconds % 3600) / 60);
                    extras.duration.seconds = totalSeconds % 60;
                }

                // Formatierte Dauer, wenn gewünscht
                extras.duration.formatted = settings.formatter.duration(extras.duration);


                extras.inADay = extras.displayDates.length === 1;
                appointment.extras = extras;
            });
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

        if (false && isSearchMode) {
            if (settings.debug) {
                log('Call renderData in search mode');
            }
            buildAppointmentsForSearch($wrapper, appointments.rows, appointments.total);
        } else {
            const view = getView($wrapper);
            const container = getViewContainer($wrapper);
            if (settings.debug) {
                log('Call renderData with view:', view);
            }

            switch (view) {
                case 'day':
                    const overContainer = container.find('.wc-day-view-time-slots');
                    drawAppointmentsForDayOrWeek($wrapper, overContainer, appointments);
                    break;
                case 'week':
                    drawAppointmentsForDayOrWeek($wrapper, container, appointments);
                    break;
                case 'month':
                    drawAppointmentsForMonth($wrapper, appointments);
                    break;
                case 'year':
                    drawAppointmentsForYear($wrapper, appointments);
                    break;
            }
            container.find('[data-appointment]').css('cursor', 'pointer');
        }
    }

    function drawAppointmentsForYear($wrapper, appointments) {
        const $container = getViewContainer($wrapper);
        appointments.forEach(appointment => {
            const badge = $container.find(`[data-date="${appointment.date}"] .js-badge`);
            setAppointmentStyles(badge, appointment.extras.colors);
            badge.text(appointment.total);
        })
    }


    /**
     * Displays a loading spinner inside a given wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element that contains the loading spinner.
     * @return {void} This method does not return a value.
     */
    function showBSCalendarLoader($wrapper) {
        const spinner = $wrapper.find('.wc-calendar-spinner');
        spinner.show();

        const combinedCss = [
            ...start0Css,
            ...top0Css
        ].join(';');


        $('<div>', {
            class: 'wc-calendar-overlay opacity-25 position-absolute w-100 h-100 d-flex justify-content-center align-items-center',
            style: combinedCss,
            html: '<div class="spinner-grow" role="status"  style="width: 7rem; height: 7rem;"><span class="visually-hidden">Loading...</span></div>'
        }).appendTo($wrapper);
    }

    /**
     * Hides the loading spinner within the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element that contains the loading spinner.
     * @return {void} This function does not return a value.
     */
    function hideBSCalendarLoader($wrapper) {
        const spinner = $wrapper.find('.wc-calendar-spinner');
        $wrapper.find('.wc-calendar-overlay').remove();
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
                // Start date: Monday of the current week
                const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, ...
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Calculate deviation from Monday
                startDate.setDate(startDate.getDate() + diffToMonday);

                // End date: Sunday of the same week
                endDate.setDate(startDate.getDate() + 6);
                break;

            case 'month':
                // Start date: 1st day of the month
                startDate.setDate(1);

                // Adjust the start date to the beginning of the displayed week
                const startDayOfWeek = startDate.getDay();
                if (settings.startWeekOnSunday) {
                    // Sonntag als Wochenstart
                    startDate.setDate(startDate.getDate() - startDayOfWeek);
                } else {
                    // Montag als Wochenstart
                    const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
                    startDate.setDate(startDate.getDate() - offset);
                }

                // End date: last day of the month
                endDate.setMonth(endDate.getMonth() + 1); // Jump to the next month
                endDate.setDate(0); // Move back one day to get the last day of the current month

                // Adjust the end date to the end of the displayed week
                const endDayOfWeek = endDate.getDay();
                if (settings.startWeekOnSunday) {
                    // Sonntag als Wochenstart
                    const offset = 6 - endDayOfWeek;
                    endDate.setDate(endDate.getDate() + offset);
                } else {
                    // Montag als Wochenstart
                    const offset = endDayOfWeek === 0 ? -1 : 7 - endDayOfWeek;
                    endDate.setDate(endDate.getDate() + offset);
                }
                break;

            case 'year':
            case 'search':
                // Start date: January 1 of the current year
                startDate.setMonth(0); // January
                startDate.setDate(1);  // 1st day

                // End date: December 31 of the current year
                endDate.setMonth(11); // December
                endDate.setDate(31);  // Last day
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
        const formatter = new Intl.DateTimeFormat(locale, {weekday: 'short'});

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
        const settings = getSettings($wrapper);
        const date = getDate($wrapper);

        const {locale, startWeekOnSunday} = settings;

        // Berechnung der Start- und Enddaten des Kalenders
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        let calendarStart = new Date(firstDayOfMonth);
        while (calendarStart.getDay() !== (startWeekOnSunday ? 0 : 1)) {
            calendarStart.setDate(calendarStart.getDate() - 1);
        }

        let calendarEnd = new Date(lastDayOfMonth);
        while (calendarEnd.getDay() !== (startWeekOnSunday ? 6 : 0)) {
            calendarEnd.setDate(calendarEnd.getDate() + 1);
        }

        // Container leeren und neue Struktur generieren
        container.empty();

        // Dynamische Wochentagsnamen basierend auf der Lokalisierung und Startwochentag
        const weekDays = getShortWeekDayNames(locale, startWeekOnSunday);

        // Tage rendern
        let currentDate = new Date(calendarStart);
        let isFirstRow = true; // Prüft, ob es die erste Zeile ist

        while (currentDate <= calendarEnd) {
            const weekRow = $('<div>', {
                class: 'row border-top d-flex flex-nowrap flex-fill wc-calendar-content',
            });

            // Kalenderwoche berechnen und hinzufügen
            const calendarWeek = getCalendarWeek(currentDate);
            const paddingTop = isFirstRow ? '1.75rem' : '.75rem';
            weekRow.append(
                $('<div>', {
                    class: `col px-1 d-flex align-items-start pt-${paddingTop} fw-bold justify-content-center bg-body-tertiary`,
                    css: {
                        paddingTop: paddingTop,
                        fontSize: '12px',
                        width: '24px',
                        maxWidth: '24px',
                        minWidth: '24px',
                    },
                    html: `<small>${calendarWeek}</small>`,
                })
            );

            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                let dayCss = [
                    'border-radius: 50%',
                    'width: 24px',
                    'height: 24px',
                    'line-height: 24px',
                    'font-size: 12px'
                ];
                if (isToday) {
                    const dayColors = getColors(settings.defaultColor);
                    dayCss.push(`background-color: ${dayColors.backgroundColor}`);
                    dayCss.push(`color: ${dayColors.color}`);
                }

                // const dayClass = isToday ? 'rounded-circle text-bg-primary' : '';
                // Berechne Border-Klassen basierend auf der Position der Zelle
                const isLastRow = currentDate.getTime() === calendarEnd.getTime(); // Prüft genau, ob wir beim letzten Datum des Kalenders sind

                const isLastColumn = i === 6;
                let borderClasses = [];
                if (isLastRow) {
                    borderClasses.push('border-bottom');
                }
                borderClasses.push('border-start border-left');
                if (isLastColumn) {
                    borderClasses.push('border-end border-right');
                }

                // Wenn es die erste Zeile ist, Wochentagsnamen hinzufügen
                const dayWrapper = $('<div>', {
                    'data-month-date': formatDateToDateString(currentDate),
                    class: `col ${borderClasses.join(' ')} px-1 flex-fill d-flex flex-column align-items-center justify-content-start ${
                        isOtherMonth ? 'text-muted' : ''
                    } ${isToday ? '' : ''}`,
                    css: {
                        maxHeight: '100%',
                        overflowY: 'auto',
                    },
                }).appendTo(weekRow);

                // Wochentagsnamen in der ersten Zeile hinzufügen
                if (isFirstRow) {
                    $('<small>', {
                        class: 'text-center text-uppercase fw-bold pt-1',
                        css: {
                            lineHeight: '16px',
                            fontSize: '10px',
                        },
                        text: weekDays[i], // Holt den entsprechenden Wochentagsnamen
                    }).appendTo(dayWrapper);
                }

                // Tageszahl hinzufügen
                $('<small>', {
                    'data-date': formatDateToDateString(currentDate),
                    class: `text-center my-1`,
                    style: dayCss.join(';'),
                    text: currentDate.getDate(),
                }).appendTo(dayWrapper);

                // Zum nächsten Tag wechseln
                currentDate.setDate(currentDate.getDate() + 1);
            }

            isFirstRow = false; // Nur für die erste Zeile Wochentagsnamen hinzufügen
            // onResize($wrapper); // Höhe & Breite anpassen
            container.append(weekRow);
        }
    }

    /**
     * Adjusts the height of calendar day elements to maintain a square aspect ratio
     * within a container, dynamically setting the container's overall height
     * based on the number of rows required.
     *
     * @param {jQuery} $wrapper - A jQuery-wrapped element that acts as the wrapper
     *                            for the calendar view, used to determine the view context.
     * @return {void} This function does not return anything.
     */
    function onResize($wrapper) {
        const view = getView($wrapper);
        const calendarContainer = getViewContainer($wrapper);
        if (view === 'month') {

            const dayElements = calendarContainer.find('[data-month-date]');

            // calculate the height of a day
            let squareHeight = 0;
            dayElements.each(function () {
                const width = $(this).outerWidth(); // width of the element
                $(this).css('height', `${width}px`); // set height
                squareHeight = width; // save the height for the later calculation
            });

            // set dynamic container height
            const rowCount = Math.ceil(dayElements.length / 7); // Anzahl der Zeilen
            const totalHeight = rowCount * squareHeight; // Gesamthöhe berechnen
            calendarContainer.css('height', `${totalHeight}px`);
        } else {
            calendarContainer.css('height', '');
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
    function buildMonthSmallView($wrapper, forDate, $container, forYearView = false) {
        // Get container for miniature view

        const settings = getSettings($wrapper);
        const date = forDate; // Aktuelles Datum
        const activeDate = getDate($wrapper);

        const cellSize = forYearView ? 36 : 24;
        const fontSize = forYearView ? 12 : 10;
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
        $container.addClass('table-responsive overflow-visible');

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
                height: `${cellSize}px`
            }
        }).appendTo(thead);

        // First column (CW)
        $('<th>', {class: '', css: {width: '15px'}, text: ''}).appendTo(weekdaysRow);

        // Add weekly days (Mon, Tue, Wed, ...)
        const weekDays = getShortWeekDayNames(settings.locale, settings.startWeekOnSunday);
        weekDays.forEach(day => {
            $('<th>', {class: '', text: day, css: {width: `${cellSize}px`}}).appendTo(weekdaysRow);
        });

        // create the content of the calendar
        const tbody = $('<tbody>').appendTo(table);
        let currentDate = new Date(calendarStart);

        while (currentDate <= calendarEnd) {
            const weekRow = $('<tr>', {
                css: {
                    fontSize: `${fontSize}px`,
                }
            }).appendTo(tbody);

            // calculate calendar week
            const calendarWeek = getCalendarWeek(currentDate);
            $('<td>', {
                css: {
                    width: `${fontSize}px`,
                    fontSize: `${fontSize}px`
                },
                class: 'px-1 text-center bg-body-tertiary',
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

                let badge = '';
                if (forYearView) {
                    const combinedCss = [
                        ...translateMiddleCss,
                        ...start50Css,
                        ...top100Css,
                    ].join(';');

                    badge = `<span class="js-badge badge rounded-pill position-absolute" style="${combinedCss}"></span>`;
                }

                const tdContent = [`<div class="${dayClass} w-100 h-100 d-flex justify-content-center flex-column align-items-center">`,
                    `<span>${currentDate.getDate()}</span>`,
                    badge,
                    `</div>`
                ].join('')

                $('<td>', {
                    'data-date': formatDateToDateString(currentDate),
                    class: `position-relative`,
                    css: {
                        cursor: 'pointer',
                        fontSize: `${fontSize}px`,
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        lineHeight: `${cellSize / 2}px`,
                        verticalAlign: 'middle',
                        textAlign: 'center',
                    },
                    html: tdContent,
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
        const $container = getViewContainer($wrapper).empty();
        const date = getDate($wrapper);
        const headline = $('<div>', {
            class: 'wc-day-header mb-2 ms-5 ml-5',
            css: {
                paddingLeft: '40px'
            },
            html: buildHeaderForDay($wrapper, date, false)
        }).appendTo($container);
        headline.attr('data-date', formatDateToDateString(date)).css('cursor', 'pointer');
        const allDayContainer = $('<div>', {
            'data-all-day': date.getDay(),
            class: 'mx-5',
            css: {
                paddingLeft: '40px'
            }
        }).appendTo($container);
        buildDayViewContent($wrapper, date, $container);
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

        //////// All Day Wrapper
        const wrappAllDay = $('<div>', {
            class: 'd-flex flex-nowrap flex-fill w-100',
            css: {
                paddingLeft: '40px'
            },
        }).appendTo($container);

        for (let day = 0; day < 7; day++) {
            const col = $('<div>', {
                class: 'flex-grow-1 d-flex flex-column jusify-content-center align-items-center flex-fill position-relative overflow-hidden',
                css: {
                    width: (100 / 7) + '%' // Fixe Breite für 7 Spalten
                }

            }).appendTo(wrappAllDay);
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + day); // calculate the next day
            const headline = $('<div>', {
                class: 'wc-day-header mb-2',
                html: buildHeaderForDay($wrapper, currentDate, false)
            }).appendTo(col);
            headline.attr('data-date', formatDateToDateString(currentDate)).css('cursor', 'pointer');
            const allDayContainer = $('<div>', {
                'data-all-day': currentDate.getDay(),
                class: 'd-flex flex-column align-items-stretch flex-fill w-100',
            }).appendTo(col);
        }
        ////////

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
                class: 'wc-day-week-view flex-grow-1 flex-fill border-end border-right position-relative',
                css: {
                    width: (100 / 7) + '%' // Fixe Breite für 7 Spalten
                }
            }).appendTo(weekContainer);


            // labels are only displayed in the first container (the 1st column)
            const showLabels = day === 0;

            buildDayViewContent($wrapper, currentDate, dayContainer, true, showLabels);
        }
    }

    function buildHeaderForDay($wrapper, date, forWeekView = false) {
        const settings = getSettings($wrapper);
        const day = date.toLocaleDateString(settings.locale, {day: 'numeric'})
        const shortMonth = date.toLocaleDateString(settings.locale, {month: 'short'})
        const longMonth = date.toLocaleDateString(settings.locale, {month: 'long'});
        const shortWeekday = date.toLocaleDateString(settings.locale, {weekday: 'short'});
        const longWeekday = date.toLocaleDateString(settings.locale, {weekday: 'long'});
        const justify = forWeekView ? 'center' : 'start';
        const isToday = date.toDateString() === new Date().toDateString();
        const todayColor = isToday ? 'text-primary' : '';
        const todayClass = isToday ? 'text-bg-primary rounded-circle' : '';
        const circleCss = [
            'width: 44px',
            'height: 44px',
            'line-height: 44px',
        ].join(';');

        return [
            `<div class="d-flex flex-column justify-content-center  w-100 p-2 align-items-${justify} ${todayColor}">`,
            `<div class="d-flex justify-content-center" style="width: 44px"><small>${shortWeekday}</small></div>`,
            `<span style="${circleCss}" class="h4 m-0 text-center ${todayClass}">${day}</span>`,
            `</div>`
        ].join('')

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
                class: 'position-relative px-5',
            }).appendTo($container);

            $container = $('<div>', {
                css: {paddingLeft: '40px'}
            }).appendTo($container);
        }

        $container.attr('data-weekday');
        $container.css('boxSizing', 'border-box');

        const longHeader = date.toLocaleDateString(settings.locale, {weekday: 'long', day: 'numeric', month: 'long'});
        const shortHeader = date.toLocaleDateString(settings.locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        $('<div>', {
            'data-all-day': true,
            class: 'd-flex flex-column flex-fill',
        }).appendTo($container);

        // Container for time slots
        const timeSlots = $('<div>', {
            "data-week-day": date.getDay(),
            class: 'wc-day-view-time-slots d-flex flex-column position-relative'
        }).appendTo($container);

        // present hours (from 0 to 23) with a horizontal line
        for (let hour = 0; hour <= 24; hour++) {
            const isLast = hour === 24;
            // line container for the hour
            // Add heading about the daily view
            const height = isLast ? 0 : hourSlotHeight;
            const marginBottom = isLast ? hourSlotHeight : 0;
            const css = isLast ? {} : {
                boxSizing: 'border-box',
                height: height + 'px',
                cursor: 'copy',
            };
            const row = $('<div>', {
                'data-day-hour': hour,
                css: css,
                class: 'd-flex align-items-center border-top position-relative'
            }).appendTo(timeSlots);
            row.on('click', function () {
                const formatted = formatDateToDateString(date) + ' ' +
                    String(hour).padStart(2, '0') + ':' +
                    '00' + ':' +
                    '00';

                const newDate = new Date(formatted);
                const untilDate = new Date(newDate);
                untilDate.setMinutes(untilDate.getMinutes() + 30);

                const period = getStartAndEndDateByView($wrapper);
                const data = {
                    date: formatDateToDateString(newDate),
                    view: {
                        type: getView($wrapper),
                        start: formatDateToDateString(newDate),
                        end: formatDateToDateString(untilDate)
                    }
                };
                trigger($wrapper, 'add', [data]);
            })

            if (showLabels) {
                const combinedCss = [
                    ...translateMiddleCss,
                    ...top0Css,
                    'left: -34px'
                ].join(';');

                // hourly label (e.g. 08:00)
                $('<div>', {
                    class: 'wc-time-label ps-2 pl-2 position-absolute',
                    style: combinedCss,
                    html: `${hour.toString().padStart(2, '0')}:00 <i class="${settings.icons.timeSlot}"></i>`
                }).appendTo(row);
            }
        }

        if (isToday) {
            addCurrentTimeIndicator($wrapper, timeSlots)
        }

    }

    function addCurrentTimeIndicator($wrapper, $container) {
        const now = new Date();
        // Erstelle eine Linie, die die aktuelle Zeit anzeigt
        const currentTimeIndicator = $('<div>', {
            class: 'current-time-indicator position-absolute bg-danger',
            css: {
                boxSizing: 'border-box',
                height: '1px',
                width: '100%',
                zIndex: 10,
                top: calculateSlotPosition(now).top,
            }
        }).appendTo($container);

        const combinedCss = [
            ...translateMiddleCss,
            ...start0Css,
            ...top0Css
        ].join(';');

        $(`<small class="position-absolute badge bg-danger js-current-time" style="${combinedCss}">` + getMinutesAndSeconds($wrapper, now) + '</small>').appendTo(currentTimeIndicator);

        const combinedCss2 = [
            ...translateMiddleCss,
            ...start100Css,
            ...top50Css,
            'width: 10px',
            'height: 10px',
        ].join(';');

        $(`<div class="position-absolute rounded-circle bg-danger" style="${combinedCss2}"></div>`).appendTo(currentTimeIndicator);

        // Funktion, die die Position basierend auf der aktuellen Zeit berechnet


        // Aktualisierte Position werden alle Minute berechnet
        const intervalId = setInterval(() => {
            if ($wrapper.find('.current-time-indicator').length === 0) {
                // Wenn das Element nicht mehr existiert, lösche das Intervall
                clearInterval(intervalId);
                return;
            }
            const now = new Date();
            currentTimeIndicator.css('top', calculateSlotPosition(now).top);
            currentTimeIndicator.find('.js-current-time').text(getMinutesAndSeconds($wrapper, now));
        }, 60 * 1000);

        // Setze initial die Position direkt
        currentTimeIndicator.css('top', calculateSlotPosition(now).top);
    }

    /**
     * Calculates the position and height of a time slot based on the provided start and end times.
     *
     * @param {Date|string} startDate - The start date and time of the slot. Can be a Date object or a string representation of a date.
     * @param {Date|string} [endDate] - The optional end date and time of the slot. Can be a Date object or a string representation of a date.
     * @return {Object} An object containing the calculated top position and height of the time slot.
     * @return {number} return.top - The top position calculated based on the start time.
     * @return {number} return.height - The height of the slot calculated based on duration. Defaults to 0 if endDate is not provided.
     */
    function calculateSlotPosition(startDate, endDate) {
        if (typeof startDate === 'string') {
            startDate = new Date(startDate);
        }
        if (typeof endDate === 'string') {
            endDate = new Date(endDate);
        }
        const startHours = startDate.getHours();
        const startMinutes = startDate.getMinutes();

        // Berechnung der Top-Position basierend auf der Startzeit
        const top = startHours * hourSlotHeight + (startMinutes / 60) * hourSlotHeight + 4;

        let height = 0; // Standardwert, falls endDate nicht übergeben wird

        if (endDate) {
            const endHours = endDate.getHours();
            const endMinutes = endDate.getMinutes();

            // Berechnung der Gesamtdauer zwischen Start- und Endzeit in Minuten
            const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

            // Berechnung der Höhe basierend auf der Dauer in Minuten
            height = (durationMinutes / 60) * hourSlotHeight;
        }

        return {top: top - 4, height: height};
    }

    function getMinutesAndSeconds($wrapper, date) {
        const settings = getSettings($wrapper);
        return date.toLocaleTimeString(settings.locale, {hour: '2-digit', minute: '2-digit'});
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

        const roundedCss = getBorderRadiusCss(settings.rounded);
        // render a small calendar for each month
        for (let month = 0; month < 12; month++) {
            // Create a wrapper for every monthly calendar
            const css = [
                roundedCss,
                'margin: 5px'
            ]
            const monthWrapper = $('<div>', {
                class: 'd-flex p-2 flex-column align-items-start wc-year-month-container', // Col-Layout für Titel und Kalender
                style: css.join(';'),
            }).appendTo(grid);

            // monthly name and year as the title (e.g. "January 2023")
            const monthName = new Intl.DateTimeFormat(settings.locale, {month: 'long'}).format(
                new Date(year, month)
            );
            $('<div>', {
                'data-month': `${year}-${String(month + 1).padStart(2, '0')}-01`,
                class: 'w-bold',
                // text: `${monthName} ${year}`,
                text: `${monthName}`,
                css: {
                    cursor: 'pointer',
                    marginBottom: '10px',
                },
            }).appendTo(monthWrapper);

            const monthContainer = $('<div>').appendTo(monthWrapper)

            // Insert small monthly calendars
            const tempDate = new Date(year, month, 1); // start date of the current month
            buildMonthSmallView($wrapper, tempDate, monthContainer, true);
        }
    }

    /**
     * Displays a Bootstrap modal containing information about a specific appointment.
     *
     * The function dynamically creates a modal if it does not already exist, or updates its content
     * if it does. It positions the modal relative to the provided `targetElement` based on the
     * available space within the viewport to ensure optimal visibility. The modal includes the title,
     * description, start, and end times of the appointment. Buttons for additional actions
     * (e.g., close, edit, delete) are also included in the modal's header.
     *
     * @param {jQuery} targetElement - A jQuery-wrapped DOM element that contains the `data-appointment` attribute
     *                                  with the appointment data to display in the modal.
     */
    function showInfoWindow($wrapper, targetElement) {
        const settings = getSettings($wrapper);
        // Extract the `appointment` data from the clicked target element (provided as a data attribute).
        const appointment = targetElement.data('appointment');

        // Set a reference to the modal element using its ID.
        let $modal = $(infoWindowModalId);

        // Create the HTML content for the modal body, displaying the appointment details.
        settings.formatter.window(appointment, settings.locale).then(html => {
// Check if the modal already exists on the page.
            const modalExists = $modal.length > 0;
            if (!modalExists) {
                const roundedCss = getBorderRadiusCss(settings.rounded);
                // If the modal does not exist, create the modal's HTML structure and append it to the body.
                const modalHtml = [
                    `<div class="modal fade" id="${infoWindowModalId.substring(1)}" tabindex="-1" data-backdrop="false" data-bs-backdrop="false" style="pointer-events: none;">`,
                    `<div class="modal-dialog modal-fullscreen-sm-down position-absolute" style="pointer-events: auto; ">`,
                    `<div class="modal-content border border-1 shadow" style="${roundedCss}">`,
                    `<div class="modal-body d-flex flex-column align-items-stretch pb-4 px-4" style="">`,
                    `<div class="d-flex justify-content-end align-items-center">`,
                    `<button type="button" data-remove data-dismiss="modal" data-bs-dismiss="modal" class="btn"><i class="bi bi-trash3"></i> </button>`,
                    `<button type="button" data-edit class="btn"><i class="bi bi-pen"></i> </button>`,
                    `<button type="button" data-dismiss="modal" class="btn"><i class="bi bi-x-lg"></i> </button>`,
                    `</div>`,
                    `<div class="modal-appointment-content flex-fill overflow-y-auto" style="">`,
                    html,
                    `</div>`,
                    `</div>`,
                    `</div>`,
                    `</div>`,
                    `</div>`,
                ].join('');

                // Append the newly created modal to the body of the document.
                $('body').append(modalHtml);

                // Re-select the modal to get the updated reference.
                $modal = $(infoWindowModalId);

                // Initialize the modal with specific settings.
                $modal.modal({
                    backdrop: false,
                    keyboard: true
                });
            } else {
                // If the modal already exists, simply update its content with the new appointment details.
                $modal.find('.modal-appointment-content').html(html);
            }

            // Attach the `appointment` data to the modal for potential future usage.
            $modal.data('appointment', appointment);

            // Get relevant dimensions and positioning of the modal and target element.
            const $modalDialog = $modal.find('.modal-dialog');
            const $target = $(targetElement);
            const targetOffset = $target.offset(); // Target element's position.
            const targetWidth = $target.outerWidth(); // Width of the target element.
            const targetHeight = $target.outerHeight(); // Height of the target element.

            // Delay the positioning logic until the modal's dimensions are fully calculated.
            setTimeout(() => {
                const modalWidth = $modalDialog.outerWidth(); // Modal's width.
                const modalHeight = $modalDialog.outerHeight(); // Modal's height.
                const minSpaceFromEdge = 60; // Minimum allowed space from the viewport's edge.

                // Get the dimensions of the viewport and the scroll offsets.
                const viewportWidth = $(window).width();
                const viewportHeight = $(window).height();
                const scrollTop = $(window).scrollTop();
                const scrollLeft = $(window).scrollLeft();

                // Calculate the available space around the target element.
                const spaceAbove = targetOffset.top - scrollTop; // Space above the target.
                const spaceBelow = viewportHeight - (targetOffset.top - scrollTop + targetHeight); // Space below the target.
                const spaceLeft = targetOffset.left - scrollLeft; // Space to the left of the target.
                const spaceRight = viewportWidth - (targetOffset.left - scrollLeft + targetWidth); // Space to the right of the target.

                // Determine the best positioning for the modal based on the available space.
                let position = 'bottom';
                if (spaceAbove >= Math.max(spaceBelow, spaceLeft, spaceRight)) {
                    position = 'top'; // More space available above.
                } else if (spaceBelow >= Math.max(spaceAbove, spaceLeft, spaceRight)) {
                    position = 'bottom'; // More space available below.
                } else if (spaceLeft >= Math.max(spaceAbove, spaceBelow, spaceRight)) {
                    position = 'left'; // More space available to the left.
                } else if (spaceRight >= Math.max(spaceAbove, spaceBelow, spaceLeft)) {
                    position = 'right'; // More space available to the right.
                }

                // Initialize the top and left positions for the modal based on the determined position.
                let top = 0;
                let left = 0;
                switch (position) {
                    case 'top':
                        top = targetOffset.top - scrollTop - modalHeight - 10;
                        left = targetOffset.left - scrollLeft + (targetWidth / 2) - (modalWidth / 2);
                        break;
                    case 'bottom':
                        top = targetOffset.top - scrollTop + targetHeight + 10;
                        left = targetOffset.left - scrollLeft + (targetWidth / 2) - (modalWidth / 2);
                        break;
                    case 'left':
                        top = targetOffset.top - scrollTop + (targetHeight / 2) - (modalHeight / 2);
                        left = targetOffset.left - scrollLeft - modalWidth - 10;
                        break;
                    case 'right':
                        top = targetOffset.top - scrollTop + (targetHeight / 2) - (modalHeight / 2);
                        left = targetOffset.left - scrollLeft + targetWidth + 10;
                        break;
                }

                // Ensure the modal does not exceed the visible viewport boundaries.
                if (top < minSpaceFromEdge) {
                    top = minSpaceFromEdge;
                }
                if (left < minSpaceFromEdge) {
                    left = minSpaceFromEdge;
                }
                if (top + modalHeight > viewportHeight - minSpaceFromEdge) {
                    top = viewportHeight - modalHeight - minSpaceFromEdge;
                }
                if (left + modalWidth > viewportWidth - minSpaceFromEdge) {
                    left = viewportWidth - modalWidth - minSpaceFromEdge;
                }
                if (viewportWidth <= 768) {
                    top = 0;
                    left = 0;
                }

                // Position the modal based on its existence:
                if (modalExists) {
                    $modalDialog.animate({
                        top: `${top}px`,
                        left: `${left}px`
                    });
                } else {
                    $modalDialog.css({
                        top: `${top}px`,
                        left: `${left}px`
                    });
                }
            }, 0);

            // Display the modal.
            $modal.modal('show');
        });
    }
}(jQuery))
