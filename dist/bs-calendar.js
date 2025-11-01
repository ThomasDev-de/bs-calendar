// noinspection JSUnresolvedReference,JSValidateTypes

/**
 * @fileOverview A jQuery plugin to create and manage a Bootstrap-based calendar with rich configuration options.
 *               This plugin provides functionalities for dynamic calendar creation, updating views,
 *               handling user interactions, and more. It is designed to be flexible, allowing customization
 *               through defined default settings or options provided at runtime.
 *
 * @author Thomas Kirsch
 * @version 2.0.2
 * @date 2025-11-01
 * @license MIT
 * @requires "jQuery" ^3
 * @requires "Bootstrap" ^v5
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
 * @date 2025-07-07
 *
 */

(function ($) {
        'use strict';
        /**
         * bsCalendar is a jQuery plugin that provides functionality to create,
         * customize, and manage a calendar user interface. This plugin can be used
         * to select dates, navigate across months, and perform other calendar-related
         * tasks seamlessly.
         *
         * Key features may include:
         * - Support for custom date ranges and formats.
         * - Navigation for months and years.
         * - Event handling for user interactions like date selection.
         * - Flexible customization options for styling and behavior.
         *
         * Methods and properties of the plugin allow developers to interact with
         * the calendar dynamically and tailor it based on specific application
         * requirements.
         */
        $.bsCalendar = {
            version: '1.2.7',
            setDefaults: function (options) {
                this.DEFAULTS = $.extend(true, {}, this.DEFAULTS, options || {});
            },
            getDefaults: function () {
                return this.DEFAULTS;
            },
            DEFAULTS: {
                locale: 'en-GB', // language and country
                title: null,
                startWeekOnSunday: true,
                navigateOnWheel: true,
                rounded: 5, // 1-5
                search: {
                    limit: 10,
                    offset: 0
                },
                startDate: new Date(),
                startView: 'month', // day, week, month, year
                defaultColor: 'primary',
                views: ['year', 'month', 'week', 'day'],
                holidays: null,
                showAddButton: true,
                translations: {
                    search: 'Type and press Enter',
                    searchNoResult: 'No appointment found'
                },
                icons: {
                    day: 'bi bi-calendar-day',
                    week: 'bi bi-kanban',
                    month: 'bi bi-calendar-month',
                    year: 'bi bi-calendar4',
                    add: 'bi bi-plus-lg',
                    menu: 'bi bi-list',
                    search: 'bi bi-search',
                    prev: 'bi bi-chevron-left',
                    next: 'bi bi-chevron-right',
                    link: 'bi bi-box-arrow-up-right',
                    appointment: 'bi bi-clock',
                    appointmentAllDay: 'bi bi-brightness-high'
                },
                url: null,
                queryParams: null,
                topbarAddons: null,
                sidebarAddons: null,
                formatter: {
                    day: formatterDay,
                    week: formatterWeek,
                    allDay: formatterAllDay,
                    month: formatterMonth,
                    search: formatterSearch,
                    holiday: formatterHoliday,
                    window: formatInfoWindow,
                    duration: formatDuration,
                },
                hourSlots: {
                    height: 30, // one hour in px
                    start: 0, // starting hour as integer
                    end: 24 // ending hour as integer
                },
                onAll: null,
                onInit: null,
                onAdd: null,
                onEdit: null,
                onDelete: null,
                onView: null,
                onBeforeLoad: null,
                onAfterLoad: null,
                onShowInfoWindow: null,
                onHideInfoWindow: null,
                onNavigateForward: null,
                onNavigateBack: null,
                storeState: false,
                debug: true
            },
            utils: {
                openHolidayApi: {
                    /**
                     * Fetches subdivision data from an external API based on a given language ISO code.
                     *
                     * @param {string} countryIsoCode - The ISO code of the country.
                     * @param {string} languageIsoCode - The ISO code of the language for which subdivisions are requested.
                     * @return {Promise<Object>} A promise that resolves to the JSON response containing subdivision data.
                     * @throws {Error} If the API request fails or the response is not successful.
                     */
                    async getSubdivisions(countryIsoCode, languageIsoCode) {
                        // Check required parameters
                        if (!countryIsoCode) {
                            throw new Error("The parameter 'countryIsoCode' is required and cannot be null or undefined.");
                        }
                        if (!languageIsoCode) {
                            throw new Error("The parameter 'languageIsoCode' is required and cannot be null or undefined.");
                        }

                        // Ensure language is always in uppercase
                        const params = {
                            countryIsoCode: countryIsoCode.toUpperCase(),
                            languageIsoCode: languageIsoCode.toUpperCase()
                        };

                        // Build query string
                        const queryString = Object.keys(params)
                            .map(key => `${key}=${encodeURIComponent(params[key])}`)
                            .join('&');

                        // Build URL
                        const url = `https://openholidaysapi.org/Subdivisions?${queryString}`;

                        // Execute the API request
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                            },
                        });

                        // Process and return the response
                        if (!response.ok) {
                            throw new Error(`Errors when receiving the Subdivisions: ${response.statusText}`);
                        }

                        return await response.json();
                    },
                    /**
                     * Fetches the list of languages based on the specified ISO 639-1 language code.
                     *
                     * @param {string} languageIsoCode - The ISO 639-1 code of the language to filter the request. The code is automatically converted to uppercase.
                     * @return {Promise<Object>} A promise that resolves to the response containing the list of languages as an object.
                     * @throws {Error} Throws an error if the API request fails or the response is not valid.
                     */
                    async getLanguages(languageIsoCode) {
                        // Check required parameter
                        if (!languageIsoCode) {
                            throw new Error("The parameter 'languageIsoCode' is required and cannot be null or undefined.");
                        }

                        // Ensure language is always in uppercase
                        const params = {
                            languageIsoCode: languageIsoCode.toUpperCase()
                        };

                        // Build query string
                        const queryString = Object.keys(params)
                            .map(key => `${key}=${encodeURIComponent(params[key])}`)
                            .join('&');

                        // Build URL
                        const url = `https://openholidaysapi.org/Languages?${queryString}`;

                        // Execute the API request
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                            },
                        });

                        // Process and return the response
                        if (!response.ok) {
                            throw new Error(`Errors when receiving the Languages: ${response.statusText}`);
                        }

                        return await response.json();
                    },
                    /**
                     * Retrieves a list of countries based on the specified language ISO code.
                     *
                     * @param {string} languageIsoCode - The ISO code of the desired language (e.g. 'EN', 'FR').
                     * It must be a valid language code and will be automatically converted to uppercase.
                     * @return {Promise<Object>} A promise that resolves to an object containing the list of
                     * countries in the specified language, or rejects with an error if the API request fails.
                     */
                    async getCountries(languageIsoCode) {
                        // Check required parameter
                        if (!languageIsoCode) {
                            throw new Error("The parameter 'languageIsoCode' is required and cannot be null or undefined.");
                        }

                        // Ensure language is always in uppercase
                        const params = {
                            languageIsoCode: languageIsoCode.toUpperCase()
                        };

                        // Build query string
                        const queryString = Object.keys(params)
                            .map(key => `${key}=${encodeURIComponent(params[key])}`)
                            .join('&');

                        // Build URL
                        const url = `https://openholidaysapi.org/Countries?${queryString}`;

                        // Execute the API request
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                            },
                        });

                        // Process and return the response
                        if (!response.ok) {
                            throw new Error(`Errors when receiving the Countries: ${response.statusText}`);
                        }

                        return await response.json();
                    },
                    /**
                     * Fetches school holiday information for a given country and optional federal state within a specified date range.
                     *
                     * @param {string} country - The ISO country code in uppercase (e.g. "US", "DE").
                     * @param {string} [federalState] - The two-letter code of the federal state in uppercase (optional).
                     * @param {string} validFrom - The start date for the query in YYYY-MM-DD format.
                     * @param {string} validTo - The end date for the query in YYYY-MM-DD format.
                     * @return {Promise<Array<{startDate: string, endDate: string, title: string}>>} A promise resolving to an array of holiday objects. Each object contains `startDate`, `endDate`, and `title`.
                     * @throws {Error} If the API request fails or returns a non-OK status.
                     */
                    async getSchoolHolidays(country, federalState, validFrom, validTo) {
                        // Check required parameters
                        if (!country) {
                            throw new Error("The parameter 'country' is required and cannot be null or undefined.");
                        }
                        if (!validFrom) {
                            throw new Error("The parameter 'validFrom' is required and cannot be null or undefined.");
                        }
                        if (!validTo) {
                            throw new Error("The parameter 'validTo' is required and cannot be null or undefined.");
                        }

                        // Ensure the country is always in uppercase
                        let countryIsoCode = country.toUpperCase();
                        let params = {
                            countryIsoCode: countryIsoCode,
                            validFrom: validFrom,
                            validTo: validTo
                        };

                        // Add subdivisionCode only if federalState is provided and valid
                        if (federalState) {
                            let subdivisionCode = federalState.toUpperCase();
                            if (subdivisionCode.length === 2) {
                                params.subdivisionCode = `${countryIsoCode}-${subdivisionCode}`;
                            }
                        }

                        // Build query string
                        const queryString = Object.keys(params)
                            .map(key => `${key}=${encodeURIComponent(params[key])}`)
                            .join('&');

                        // Build URL
                        const url = `https://openholidaysapi.org/SchoolHolidays?${queryString}`;

                        // Execute the API request
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                            },
                        });

                        // Process and return the response
                        if (!response.ok) {
                            throw new Error(`Errors when receiving the holidays: ${response.statusText}`);
                        }

                        return await response.json();
                    },
                    /**
                     * Fetches the public holidays for a specified country and within a provided date range.
                     *
                     * @param {string} country - The ISO 3166-1 alpha-2 country code (e.g. "US", "DE").
                     * Must be in uppercase.
                     * @param {string} language - The ISO 639-1 language code (e.g. "EN", "DE").
                     * Must be in uppercase.
                     * @param {string} validFrom - The start date of the holiday range in YYYY-MM-DD format.
                     * @param {string} validTo - The end date of the holiday range in YYYY-MM-DD format.
                     * @param {string|null} [federalState=null] - The state's ISO 3166-2 subdivision code for more specific filtering, if applicable.
                     *
                     * @return {Promise<Array<{startDate: string, endDate: string, title: string}>>} A promise that resolves to an array of holiday objects, each containing the start date, end date, and title of the holiday.
                     * @throws {Error} If the API call fails or returns a non-OK status.
                     */
                    async getPublicHolidays(country, federalState = null, language, validFrom, validTo) {
                        // Check required parameters
                        if (!country) {
                            throw new Error("The parameter 'country' is required and cannot be null or undefined.");
                        }
                        if (!language) {
                            throw new Error("The parameter 'language' is required and cannot be null or undefined.");
                        }
                        if (!validFrom) {
                            throw new Error("The parameter 'validFrom' is required and cannot be null or undefined.");
                        }
                        if (!validTo) {
                            throw new Error("The parameter 'validTo' is required and cannot be null or undefined.");
                        }

                        // Ensure language and country are in uppercase
                        const countryIsoCode = country.toUpperCase();
                        const languageIsoCode = language.toUpperCase();

                        // Prepare parameters
                        const params = {
                            countryIsoCode,
                            languageIsoCode,
                            validFrom,
                            validTo
                        };

                        // Add subdivisionCode only if federalState is provided
                        if (federalState) {
                            params.subdivisionCode = `${countryIsoCode}-${federalState.toUpperCase()}`;
                        }

                        // Build query string
                        const queryString = Object.keys(params)
                            .map(key => `${key}=${encodeURIComponent(params[key])}`)
                            .join('&');

                        // Final URL
                        const url = `https://openholidaysapi.org/PublicHolidays?${queryString}`;

                        // Execute the API request
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                            },
                        });

                        // Process and return the response
                        if (!response.ok) {
                            throw new Error(`Errors when calling up the holidays: ${response.statusText}`);
                        }
                        return await response.json();
                    }
                },
                /**
                 * Formats a given Date object or date string into a time string.
                 *
                 * @param {Date|string} date - The date object or a valid date string to format. If a string is provided, it will be parsed into a Date object.
                 * @param {boolean} [withSeconds=true] - Indicates whether the formatted string should include seconds or not.
                 * @return {string|null} The formatted time string in "HH:mm:ss" or "HH:mm" format, or null if the provided date is invalid.
                 */
                formatTime: (date, withSeconds = true) => {
                    if (typeof date === 'string') {
                        date = new Date(date);
                    }

                    // Überprüfen, ob das Datum ungültig ist
                    if (isNaN(date.getTime())) {
                        console.error("Invalid date in formatTime:", date);
                        return null; // Ungültiges Datum
                    }

                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    const seconds = date.getSeconds().toString().padStart(2, '0');

                    if (!withSeconds) {
                        return `${hours}:${minutes}`;
                    }

                    return `${hours}:${minutes}:${seconds}`;
                },

                /**
                 * Calculates the calendar week number for a given date according to the ISO 8601 standard.
                 * ISO 8601 defines the first week of the year as the week with the first Thursday.
                 * Weeks start on Monday, and the week containing January 4th is considered the first calendar week.
                 *
                 * @param {Date} date - The date for which the calendar week number should be calculated.
                 * @return {number} The ISO 8601 calendar week number for the provided date.
                 */
                getCalendarWeek: (date) => {
                    // copy of the input date and weekday calculation
                    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                    const dayNr = (target.getUTCDay() + 6) % 7; // Montag = 0, Sonntag = 6
                    target.setUTCDate(target.getUTCDate() - dayNr + 3); // Auf den Donnerstag der aktuellen Woche schieben

                    // The first Thursday of the year
                    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
                    const firstDayOfWeek = firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7);

                    // Calculate number weeks between the first Thursday and the current Thursday
                    return Math.floor(1 + (target - new Date(Date.UTC(target.getUTCFullYear(), 0, firstDayOfWeek))) / (7 * 24 * 60 * 60 * 1000));
                },
                /**
                 * Returns the shortened names of the weekdays based on the locale,
                 * adapted to the start day of the week.
                 *
                 * This function retrieves the short names of the weekdays (e.g. "Sun", "Mon", etc.)
                 * for the specified locale and rearranges the order of the days depending on
                 * whether the week starts on Sunday or Monday.
                 *
                 * @param {string} locale - The locale like 'en-US' or 'de-DE', used to format names.
                 * @param {boolean} startWeekOnSunday - Indicates whether the week should start with Sunday.
                 * @returns {string[]} - An array of the short weekday names, e.g. ['Sun', 'Mon', 'Tue', ...].
                 */
                getShortWeekDayNames: (locale, startWeekOnSunday) => {
                    // Create an Intl.DateTimeFormat instance for the provided locale to format weekdays.
                    // The 'short' option generates abbreviated weekday names (e.g. 'Mon', 'Tue').
                    const formatter = new Intl.DateTimeFormat(locale, {weekday: 'short'});

                    // Generate an array of all weekdays (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
                    // Use Date.UTC to ensure consistent results in all environments (ignoring local time zones).
                    const weekDays = [...Array(7).keys()].map(day =>
                        // Add 1 to the day index to represent the day of the month.
                        // Example: '2023-01-01' for Sunday, '2023-01-02' for Monday, and so on.
                        formatter.format(new Date(Date.UTC(2023, 0, day + 1)))
                    );

                    // If the week should start on Sunday, return the weekdays as is.
                    // Otherwise, reorder the array to start from Monday:
                    // - day 1 (Monday) to day 6 (Saturday) remain first (`weekDays.slice(1)`),
                    // - day 0 (Sunday) is moved to the end (`weekDays[0]`).
                    return startWeekOnSunday ? weekDays : weekDays.slice(1).concat(weekDays[0]);
                },
                /**
                 * Converts a string or JavaScript Date object into a string formatted as an SQL date (YYYY-MM-DD).
                 *
                 * @param {string|Date} date - The input date, either as a string or as a Date object.
                 * @return {string} A string representation of the date in the SQL date format (YYYY-MM-DD).
                 */
                formatDateToDateString: (date) => {
                    const dateObj = typeof date === 'string' ? new Date(date) : date;
                    const year = dateObj.getFullYear();
                    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const day = String(dateObj.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                },
                /**
                 * Compares two Date objects to determine if they represent the same calendar date.
                 *
                 * @param {Date} date1 - The first date to compare.
                 * @param {Date} date2 - The second date to compare.
                 * @return {boolean} Returns true if the two dates have the same year, month, and day; otherwise, false.
                 */
                datesAreEqual: (date1, date2) => {
                    return (
                        date1.getFullYear() === date2.getFullYear() &&
                        date1.getMonth() === date2.getMonth() &&
                        date1.getDate() === date2.getDate()
                    );
                },
                /**
                 * An object that maps CSS color names to their corresponding hexadecimal color codes.
                 *
                 * The keys in this object are the standard CSS color names (case-insensitive), and the values
                 * are their respective hexadecimal color codes.
                 * Some color names include both American and
                 * British English synonyms, providing equivalent hexadecimal values for those variants.
                 *
                 * This object can be used for converting color names to hex codes, validating color names, or
                 * referencing standard colors in styling and graphical applications.
                 *
                 * Note: Both American and British English synonyms (e.g. "gray" and "gray") are included
                 * where applicable, and they map to identical hexadecimal values.
                 */
                colorNameToHex: {
                    aliceblue: "#f0f8ff",
                    antiquewhite: "#faebd7",
                    aqua: "#00ffff",
                    aquamarine: "#7fffd4",
                    azure: "#f0ffff",
                    beige: "#f5f5dc",
                    bisque: "#ffe4c4",
                    black: "#000000",
                    blanchedalmond: "#ffebcd",
                    blue: "#0000ff",
                    blueviolet: "#8a2be2",
                    brown: "#a52a2a",
                    burlywood: "#deb887",
                    cadetblue: "#5f9ea0",
                    chartreuse: "#7fff00",
                    chocolate: "#d2691e",
                    coral: "#ff7f50",
                    cornflowerblue: "#6495ed",
                    cornsilk: "#fff8dc",
                    crimson: "#dc143c",
                    cyan: "#00ffff",
                    darkblue: "#00008b",
                    darkcyan: "#008b8b",
                    darkgoldenrod: "#b8860b",
                    darkgray: "#a9a9a9",
                    darkgreen: "#006400",
                    darkgrey: "#a9a9a9", // British English synonym
                    darkkhaki: "#bdb76b",
                    darkmagenta: "#8b008b",
                    darkolivegreen: "#556b2f",
                    darkorange: "#ff8c00",
                    darkorchid: "#9932cc",
                    darkred: "#8b0000",
                    darksalmon: "#e9967a",
                    darkseagreen: "#8fbc8f",
                    darkslateblue: "#483d8b",
                    darkslategray: "#2f4f4f",
                    darkslategrey: "#2f4f4f", // British English synonym
                    darkturquoise: "#00ced1",
                    darkviolet: "#9400d3",
                    deeppink: "#ff1493",
                    deepskyblue: "#00bfff",
                    dimgray: "#696969",
                    dimgrey: "#696969", // British English synonym
                    dodgerblue: "#1e90ff",
                    firebrick: "#b22222",
                    floralwhite: "#fffaf0",
                    forestgreen: "#228b22",
                    fuchsia: "#ff00ff",
                    gainsboro: "#dcdcdc",
                    ghostwhite: "#f8f8ff",
                    gold: "#ffd700",
                    goldenrod: "#daa520",
                    gray: "#808080",
                    green: "#008000",
                    greenyellow: "#adff2f",
                    grey: "#808080", // British English synonym
                    honeydew: "#f0fff0",
                    hotpink: "#ff69b4",
                    indianred: "#cd5c5c",
                    indigo: "#4b0082",
                    ivory: "#fffff0",
                    khaki: "#f0e68c",
                    lavender: "#e6e6fa",
                    lavenderblush: "#fff0f5",
                    lawngreen: "#7cfc00",
                    lemonchiffon: "#fffacd",
                    lightblue: "#add8e6",
                    lightcoral: "#f08080",
                    lightcyan: "#e0ffff",
                    lightgoldenrodyellow: "#fafad2",
                    lightgray: "#d3d3d3",
                    lightgreen: "#90ee90",
                    lightgrey: "#d3d3d3", // British English synonym
                    lightpink: "#ffb6c1",
                    lightsalmon: "#ffa07a",
                    lightseagreen: "#20b2aa",
                    lightskyblue: "#87cefa",
                    lightslategray: "#778899",
                    lightslategrey: "#778899", // British English synonym
                    lightsteelblue: "#b0c4de",
                    lightyellow: "#ffffe0",
                    lime: "#00ff00",
                    limegreen: "#32cd32",
                    linen: "#faf0e6",
                    magenta: "#ff00ff",
                    maroon: "#800000",
                    mediumaquamarine: "#66cdaa",
                    mediumblue: "#0000cd",
                    mediumorchid: "#ba55d3",
                    mediumpurple: "#9370db",
                    mediumseagreen: "#3cb371",
                    mediumslateblue: "#7b68ee",
                    mediumspringgreen: "#00fa9a",
                    mediumturquoise: "#48d1cc",
                    mediumvioletred: "#c71585",
                    midnightblue: "#191970",
                    mintcream: "#f5fffa",
                    mistyrose: "#ffe4e1",
                    moccasin: "#ffe4b5",
                    navajowhite: "#ffdead",
                    navy: "#000080",
                    oldlace: "#fdf5e6",
                    olive: "#808000",
                    olivedrab: "#6b8e23",
                    orange: "#ffa500",
                    orangered: "#ff4500",
                    orchid: "#da70d6",
                    palegoldenrod: "#eee8aa",
                    palegreen: "#98fb98",
                    paleturquoise: "#afeeee",
                    palevioletred: "#db7093",
                    papayawhip: "#ffefd5",
                    peachpuff: "#ffdab9",
                    peru: "#cd853f",
                    pink: "#ffc0cb",
                    plum: "#dda0dd",
                    powderblue: "#b0e0e6",
                    purple: "#800080",
                    rebeccapurple: "#663399",
                    red: "#ff0000",
                    rosybrown: "#bc8f8f",
                    royalblue: "#4169e1",
                    saddlebrown: "#8b4513",
                    salmon: "#fa8072",
                    sandybrown: "#f4a460",
                    seagreen: "#2e8b57",
                    seashell: "#fff5ee",
                    sienna: "#a0522d",
                    silver: "#c0c0c0",
                    skyblue: "#87ceeb",
                    slateblue: "#6a5acd",
                    slategray: "#708090",
                    slategrey: "#708090", // British English synonym
                    snow: "#fffafa",
                    springgreen: "#00ff7f",
                    steelblue: "#4682b4",
                    tan: "#d2b48c",
                    teal: "#008080",
                    thistle: "#d8bfd8",
                    tomato: "#ff6347",
                    turquoise: "#40e0d0",
                    violet: "#ee82ee",
                    wheat: "#f5deb3",
                    white: "#ffffff",
                    whitesmoke: "#f5f5f5",
                    yellow: "#ffff00",
                    yellowgreen: "#9acd32"
                },
                /**
                 * Computes the color properties based on the input color.
                 *
                 * @param {string} inputColor - The input color, which can be in various formats (e.g., named color, hex, or invalid string).
                 * @return {Object|null} Returns an object with computed background and text color properties if the input is valid, or null if the input is invalid.
                 *                       The returned object contains:
                 *                       - `backgroundColor`: The resolved background color in a valid format (e.g., Hex).
                 *                       - `backgroundImage`: Set to "none" by default.
                 *                       - `color`: The computed text color depending on the background color (black or white).
                 */
                computeColor: (inputColor) => {
                    if ($.bsCalendar.utils.isDirectColorValid(inputColor)) {
                        // dissolve the color into a valid format (e.g., hex)
                        const resolvedColor = $.bsCalendar.utils.resolveColor(inputColor);
                        const isDark = $.bsCalendar.utils.isDarkColor(resolvedColor);
                        return {
                            backgroundColor: resolvedColor, // background color
                            backgroundImage: "none", // By default, no picture
                            color: isDark ? "#FFFFFF" : "#000000", // text color based on background color
                        };
                    } else if (inputColor) {
                        return $.bsCalendar.utils.getComputedStyles(inputColor);
                    }

                    return null; // invalid input
                },
                /**
                 * Computes and returns the styles (background color, background image, text color, etc.)
                 * for a series of class names by temporarily applying them to a DOM element and extracting
                 * their computed styles.
                 *
                 * @param {string} inputClassNames - A space-separated string of class names to compute styles for.
                 * @return {Object} An object containing the computed styles:
                 * - `backgroundColor` {string}: The computed background color with respect to opacity adjustments.
                 * - `backgroundImage` {string}: The computed background image property.
                 * - `color` {string}: The computed text color.
                 * - `classList` {string[]} An array of class names applied to the computation.
                 * - `origin` {string}: The original input class names string.
                 */
                getComputedStyles: (inputClassNames) => {
                    // Vereinfachte Implementierung: nur Bootstrap 5+ wird unterstützt.
                    const classList = inputClassNames.split(" ").map(className => {
                        if (className.includes("opacity") || className.includes("gradient")) {
                            return className.startsWith("bg-") ? className : `bg-${className}`;
                        } else {
                            // Für Bootstrap 5 verwenden wir die text-bg-*-Utilities für textuelle Hintergründe.
                            return className.startsWith("bg-") ?
                                className.replace("bg-", "text-bg-") :
                                `text-bg-${className}`;
                        }
                    });

                    const tempElement = document.createElement("div");
                    tempElement.style.display = "none";
                    tempElement.style.position = "absolute";
                    document.body.appendChild(tempElement);

                    classList.forEach(className => {
                        tempElement.classList.add(className);
                    });

                    const computedStyles = window.getComputedStyle(tempElement);

                    const backgroundColor = computedStyles.backgroundColor || "rgba(0, 0, 0, 0)";
                    const backgroundImage = computedStyles.backgroundImage || "none";
                    // Bei Bootstrap 5 kann die Textfarbe direkt aus den berechneten Styles genommen werden.
                    const color = computedStyles.color || "#000000";
                    const opacity = computedStyles.opacity || "1";

                    document.body.removeChild(tempElement);

                    let adjustedBackgroundColor = backgroundColor;
                    if (backgroundColor.startsWith("rgb") && parseFloat(opacity) < 1) {
                        const matchRgb = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (matchRgb) {
                            const r = matchRgb[1];
                            const g = matchRgb[2];
                            const b = matchRgb[3];
                            adjustedBackgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
                        }
                    }

                    return {
                        backgroundColor: adjustedBackgroundColor,
                        backgroundImage: backgroundImage,
                        color: color,
                        classList: classList,
                        origin: inputClassNames,
                    };
                },
                /**
                 * Validates if the provided color input is a valid direct color representation.
                 * The method checks if the input is in valid HEX format, RGB(A) format*/
                isDirectColorValid: (inputColor) => {
                    if (!inputColor || typeof inputColor !== "string") {
                        return false;
                    }

                    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
                    const rgbPattern = /^rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})(?:,\s*(0|0?\.\d+|1))?\s*\)$/;

                    // check whether input is a valid hex/RGB value or a defined color name
                    return hexPattern.test(inputColor) || rgbPattern.test(inputColor) || inputColor.toLowerCase() in $.bsCalendar.utils.colorNameToHex;
                },
                /**
                 * Resolves the input color by converting color names to their hexadecimal representation
                 * if applicable. If the input is not a recognized color name, it returns the input as is.
                 *
                 * @param {string} inputColor - The color input, which can be a recognized color name or a direct color value.
                 * @return {string} The resolved color in hexadecimal format if the input is a recognized color name, otherwise the input color itself.
                 */
                resolveColor: (inputColor) => {
                    // check whether it is a color name that has to be converted into hex
                    if (inputColor.toLowerCase() in $.bsCalendar.utils.colorNameToHex) {
                        return $.bsCalendar.utils.colorNameToHex[inputColor.toLowerCase()];
                    }
                    return inputColor; // If no color name, return the input directly
                },
                /**
                 * Determines whether the given color is considered dark based on its luminance.
                 *
                 * @param {string} color - The color to evaluate.
                 * This can be a hex color code (e.g. "#000", "#000000"),
                 * RGB(A) format (e.g. "rgb(0, 0, 0)" or "rgba(0, 0, 0, 1)"), or a valid color name that can be resolved.
                 * @return {boolean} Returns true if the color is dark, false otherwise.
                 */
                isDarkColor: (color) => {
                    // dissolve hex-color if it is a color name
                    color = $.bsCalendar.utils.resolveColor(color);

                    let r, g, b;

                    if (color.startsWith("#")) {
                        if (color.length === 4) {
                            // Expand 3-digit hex to 6-digit version
                            color = "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
                        }

                        // Hex-color code (6 digits)
                        r = parseInt(color.slice(1, 3), 16);
                        g = parseInt(color.slice(3, 5), 16);
                        b = parseInt(color.slice(5, 7), 16);
                    } else if (color.startsWith("rgb")) {
                        // RGB or RGBA color codes
                        const rgbValues = color.match(/\d+/g); // extract numbers from the character chain
                        r = parseInt(rgbValues[0]);
                        g = parseInt(rgbValues[1]);
                        b = parseInt(rgbValues[2]);
                    } else {
                        throw new Error("Unsupported color format");
                    }

                    // YiQ calculation for determination whether the color is dark
                    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
                    return yiq <= 128; // return true when the color is dark
                },
                /**
                 * Get colors (background and text) based on a given color or fallback color, built with jQuery.
                 *
                 * @param {string} color - The primary color as a direct HEX, RGB, RGBA value or a CSS class.
                 * @param {string | null} fallbackColor - The fallback color or class if the primary color is invalid.
                 * @returns {object} - An object containing the colors: backgroundColor, backgroundImage, and text color.
                 */
                getColors: (color, fallbackColor = null) => {
                    const primaryResult = $.bsCalendar.utils.computeColor(color);
                    const fallbackResult = primaryResult || $.bsCalendar.utils.computeColor(fallbackColor);

                    const defaultValues = {
                        backgroundColor: "#000000", // black background, if nothing fits
                        backgroundImage: "none", // No background image by default
                        color: "#FFFFFF", // standard text color with a dark background
                    };

                    const result = {...defaultValues, ...fallbackResult};

                    return {
                        origin: color, // input for debug purposes
                        ...result,
                    };
                },
                /**
                 * Converts a date-time string with a space separator into ISO 8601 format
                 * by replacing the space character with 'T'. If the input is not a string,
                 * it is returned as-is.
                 *
                 * @param {string|*} dateTime - The date-time value to normalize. If it's a string,
                 *                              it replaces the space with 'T'. For other types,
                 *                              the original value is returned.
                 * @return {string|*} - The normalized date-time string or the input if it is not a string.
                 */
                normalizeDateTime: (dateTime) => {
                    if (typeof dateTime === "string") {
                        return dateTime.replace(" ", "T");
                    }
                    return dateTime; // If the value is not a string, give it back directly.
                },
                /**
                 * Formats a given date object or date string into a localized string based on a specified locale.
                 *
                 * @param {Date|string} date - The date to be formatted. Can be a Date object or a date string.
                 * @param {string} locale - The locale identifier (e.g. "en-US", "fr-FR") used for formatting the date.
                 * @returns {string} The formatted date string localized according to the specified locale.
                 */
                formatDateByLocale: (date, locale) => {
                    if (typeof date === 'string') {
                        date = new Date(date);
                    }
                    // formatting options
                    const options = {weekday: 'long', month: 'long', day: 'numeric'};
                    return new Intl.DateTimeFormat(locale, options).format(date);
                },
                generateRandomString(length = 8, prefix = 'bs_calendar_id_') {
                    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    let result = '';
                    for (let i = 0; i < length; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    return prefix + result;
                },
                getStandardizedUnits: (locale) => {
                    const units = ['today', 'day', 'week', 'month', 'year']; // Eingabewerte
                    const result = {};

                    // Definierte gültige Einheiten für Intl.RelativeTimeFormat
                    const validRelativeTimeFormatUnits = ['day', 'week', 'month', 'year'];

                    units.forEach(unit => {
                        let localizedUnit;

                        // Statische Übersetzungen für fehlerhafte oder bekannte schwierige Locales
                        if (locale === 'ar') {
                            const arabicTranslations = {
                                today: "اليوم", // heute
                                day: "يوم",
                                week: "أسبوع",
                                month: "شهر",
                                year: "سنة"
                            };
                            localizedUnit = arabicTranslations[unit];
                        } else if (locale === 'he') {
                            const hebrewTranslations = {
                                today: "היום", // heute
                                day: "יום",
                                week: "שבוע",
                                month: "חודש",
                                year: "שנה"
                            };
                            localizedUnit = hebrewTranslations[unit];
                        } else if (locale === 'zh') {
                            const chineseTranslations = {
                                today: "今天", // heute
                                day: "天",
                                week: "周",
                                month: "月",
                                year: "年"
                            };
                            localizedUnit = chineseTranslations[unit];
                        } else {
                            // Dynamische Verarbeitung für alle anderen Locales
                            try {
                                if (unit === 'today') {
                                    // Feste Übersetzung für "heute"
                                    localizedUnit = new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(0, 'day');
                                } else if (validRelativeTimeFormatUnits.includes(unit)) {
                                    const formatter = new Intl.RelativeTimeFormat(locale, {numeric: 'always'});
                                    const formatted = formatter.format(1, unit);

                                    localizedUnit = formatted
                                        .replace(/^\D*\d+\s?/, '') // Entfernt Präfixe/Zahlen (z. B. "in 1 ")
                                        .replace(/後|后$/, '')     // Entfernt "später" für Japanisch/Chinesisch
                                        .replace(/\s후$/, '')     // Entfernt "후" für Koreanisch
                                        .replace(/^ในอีก\s?/, '') // Entfernt "in" für Thailändisch
                                        .trim();
                                } else {
                                    // Fallback für ungültige Einheiten
                                    console.error(`${unit} ist keine gültige Einheit für Intl.RelativeTimeFormat.`);
                                }
                            } catch (error) {
                                console.error(`Fehler für ${unit} mit Locale ${locale}:`, error.message);
                                localizedUnit = unit; // Rückfall zur Einheit
                            }
                        }

                        // Ergebnis speichern
                        result[unit] = localizedUnit || unit; // Fallback zur Einheit
                    });

                    return result;
                },
                getLanguageAndCountry: (locale) => {
                    const parts = locale.split('-'); // separate the string based on the bind screed
                    let language = parts[0].toUpperCase(); // The first part is the language, always present
                    let country = parts[1] ? parts[1].toUpperCase() : language; // The second part is the country, if available; Otherwise language as a fallback
                    return {language: language, country: country}; // return as an object (language and country)
                },
                isValueEmpty: (value) => {
                    if (value === null || value === undefined) {
                        return true; // zero or undefined
                    }
                    if (Array.isArray(value)) {
                        return value.length === 0; // empty array
                    }
                    if (typeof value === 'string') {
                        return value.trim().length === 0; // empty string
                    }
                    if (typeof value === 'object') {
                        // check whether it is an empty object (and no array/no value with prototype)
                        return Object.keys(value).length === 0 && value.constructor === Object;
                    }
                    return false; // Alle anderen Werte sind nicht leer
                },
                /**
                 * Formats and beautifies the appointment timespan based on the provided settings and locale.
                 *
                 * @param {Object} extras - An object containing additional data required for formatting.
                 * @param {string} extras.locale - The locale to be used for date formatting.
                 * @param {Array} extras.displayDates - An array of date and time information for the appointment.
                 * @param {boolean} extras.allDay - Indicates whether the appointment is an all-day event.
                 * @param {Object} extras.duration - The duration object containing a formatted string representation of the duration.
                 * @param {boolean} withDuration - Determines whether the formatted duration should be appended to the result.
                 *
                 * @return {string} A string representing the beautified appointment timespan, optionally including the duration.
                 */
                getAppointmentTimespanBeautify(extras, withDuration = true) {
                    const locale = extras.locale;
                    // extract times and ads
                    const displayDates = extras.displayDates;
                    const startDate = $.bsCalendar.utils.formatDateByLocale(displayDates[0].date, locale);
                    const endDate = $.bsCalendar.utils.formatDateByLocale(displayDates[displayDates.length - 1].date, locale);
                    const isSameDate = startDate === endDate;

                    let showTime = isSameDate ? startDate : `${startDate} - ${endDate}`;

                    if (!extras.allDay) {
                        let startTime = extras.displayDates[0].times.start.substring(0, 5);
                        let endTime = extras.displayDates[displayDates.length - 1].times.end.substring(0, 5);
                        if (isSameDate) {
                            showTime = `${startDate} ${startTime} - ${endTime}`;
                        } else {
                            showTime = `${startDate} ${startTime}<br>${endDate} ${endTime}`;
                        }
                    }

                    return !withDuration ? showTime : `${showTime}  (${extras.duration.formatted})`;
                }
            }
        };

        const calendarElements = {
            containerView: 'wc-calendar-view-container',
            infoModal: '#wcCalendarInfoWindowModal',
            topNav: 'wc-calendar-top-nav',
            sideNav: 'wc-calendar-left-nav',
            topSearchNav: 'wc-calendar-top-search-nav',
        };

        const namespace = '.bs.calendar';

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

                if (wrapper.data() || optionsOrMethod) {
                    normalizeSettings(settings);
                    settings = $.extend(true, {}, settings, wrapper.data(), optionsOrMethod || {});
                }

                settings.translations = $.extend(true, {}, settings.translations, $.bsCalendar.utils.getStandardizedUnits(settings.locale) || {});


                setSettings(wrapper, settings);

                if (settings.storeState) {
                    const view = getFromLocalStorage(wrapper, 'view');
                    if (!$.bsCalendar.utils.isValueEmpty(view)) {
                        settings.startView = view;
                        setSettings(wrapper, settings);
                    }
                }

                init(wrapper).then(() => {
                    onResize(wrapper, true);
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

        function normalizeSettings(settings) {

            // clamp helper
            const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
            const possibleViews = ['day', 'week', 'month', 'year'];

            // Normalize `views` immediately after merging settings to avoid duplicates
            // coming from defaults, data-attributes or passed options.
            if (settings.hasOwnProperty('views')) {
                // Accept comma separated string as well (defensive)
                if (typeof settings.views === 'string') {
                    settings.views = settings.views.split(',').map(v => v.trim()).filter(Boolean);
                }
                if (Array.isArray(settings.views)) {
                    // Keep original order while removing duplicates
                    const seen = new Set();
                    settings.views = settings.views.filter(v => {
                        if (seen.has(v)) return false;
                        seen.add(v);
                        return true;
                    });

                    // Filter out any invalid views (only allow a defined set)
                    const possibleViews = ['day', 'week', 'month', 'year'];
                    settings.views = settings.views.filter(v => possibleViews.includes(v));

                    // If nothing left after filtering, fallback to sensible default
                    if (settings.views.length === 0) {
                        settings.views = ['day', 'week', 'month', 'year'];
                    }
                } else {
                    // Fallback to sensible default when views is invalid
                    settings.views = ['day', 'week', 'month', 'year'];
                }
            }

            // Validate `rounded` -> must be an integer between 0 and 5
            if (settings.hasOwnProperty('rounded')) {
                // Try to coerce to number
                const parsed = Number(settings.rounded);

                // If parsed is not a finite integer, fallback to default (5)
                if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
                    settings.rounded = 3;
                } else {
                    settings.rounded = clamp(parsed, 0, 5);
                }
            }

            if (settings.hasOwnProperty('hourSlots') && typeof settings.hourSlots === 'object') {
                // parse integers defensiv (keine NaN)
                settings.hourSlots.start = Number.isFinite(Number(settings.hourSlots.start)) ? parseInt(settings.hourSlots.start, 10) : NaN;
                settings.hourSlots.end = Number.isFinite(Number(settings.hourSlots.end)) ? parseInt(settings.hourSlots.end, 10) : NaN;
                settings.hourSlots.height = Number.isFinite(Number(settings.hourSlots.height)) ? parseInt(settings.hourSlots.height, 10) : NaN;

                // Fallbacks für nicht-numerische Werte
                if (Number.isNaN(settings.hourSlots.start)) settings.hourSlots.start = 0;
                if (Number.isNaN(settings.hourSlots.end)) settings.hourSlots.end = 24;
                if (Number.isNaN(settings.hourSlots.height)) settings.hourSlots.height = 30;

                // Hours must be integers in [0,24]
                settings.hourSlots.start = Math.floor(settings.hourSlots.start);
                settings.hourSlots.end = Math.floor(settings.hourSlots.end);

                settings.hourSlots.start = clamp(settings.hourSlots.start, 0, 24);
                settings.hourSlots.end = clamp(settings.hourSlots.end, 0, 24);

                // height mindestens 1 (oder deine default 30)
                settings.hourSlots.height = Math.max(Math.floor(settings.hourSlots.height), 1);

                // Ensure at least 1 hour difference and start < end
                // Wenn start >= end, versuche zu korrigieren: setze end = start + 1 (falls möglich), sonst setze start = end -1
                if (settings.hourSlots.start >= settings.hourSlots.end) {
                    if (settings.hourSlots.start < 24) {
                        settings.hourSlots.end = settings.hourSlots.start + 1;
                    } else {
                        // start == 24 -> setze start auf 23 und end auf 24
                        settings.hourSlots.start = 23;
                        settings.hourSlots.end = 24;
                    }
                }

                // Falls nach Korrekturen die Differenz < 1 (defensive), erzwinge 1 Stunde
                if ((settings.hourSlots.end - settings.hourSlots.start) < 1) {
                    if (settings.hourSlots.start <= 23) {
                        settings.hourSlots.end = settings.hourSlots.start + 1;
                    } else {
                        settings.hourSlots.start = settings.hourSlots.end - 1;
                    }
                }

                // finaler Clamp (sicherheitshalber)
                settings.hourSlots.start = clamp(settings.hourSlots.start, 0, 23);
                settings.hourSlots.end = clamp(settings.hourSlots.end, 1, 24);
            }
        }

        /**
         * Formats the day of the appointment by including its title wrapped in a specific HTML structure.
         *
         * @param {Object} appointment - An object representing the appointment.
         * @param {Object} [extras] - Additional data or configuration for formatting, not currently used in this method.
         * @return {string} A formatted string representing the appointment's title enclosed in a styled HTML structure.
         */
        function formatterDay(appointment, extras) {
            void extras; // Verhindert die Warnung, aber erfüllt keinen Zweck
            return `<small class="px-2">${appointment.title}</small>`;
        }

        /**
         * Formats an all-day appointment into an HTML string representation.
         *
         * @param {Object} appointment - The appointment object containing details about the event.
         * @param {Object} extras - Additional data, including style information such as colors.
         * @param {string} view - the current view.
         * @return {string} An HTML string representing the formatted all-day appointment.
         */
        function formatterAllDay(appointment, extras, view) {
            const style = {
                backgroundColor: extras.colors.backgroundColor,
                backgroundImage: extras.colors.backgroundImage,
                color: extras.colors.color
            };

            const styleString = toStyleString(style);

            const classes = [];
            if (view === 'week') {
                classes.push('w-100');
            }

            return [
                '<div class="badge px-2 ' + classes.join(' ') + '" style="' + styleString + '">',
                appointment.title,
                '</div>'
            ].join('')
        }

        /**
         * Converts a style object into a string representation suitable for inline CSS.
         *
         * @param {Object} styleObj - An object containing style properties as keys and their corresponding values.
         *                              Keys are in camelCase format, and the values can be strings or numbers.
         *                              Undefined or null values will be filtered out.
         * @return {string} A formatted string representing the styles in "key: value"; format, with keys converted to a kebab-case.
         */
        function toStyleString(styleObj) {
            return Object.entries(styleObj)
                .filter(([_, value]) => value !== undefined && value !== null) // Filter out undefined/null
                .map(([key, value]) =>
                    key.replace(/([A-Z])/g, '-$1').toLowerCase() + ': ' + value + ';'
                )
                .join(' ');
        }


        /**
         * Formats a holiday object into a styled HTML string representation suitable for display.
         *
         * @param {Object} holiday - The holiday object containing relevant information.
         * @param {string} view - The current view mode, which determines specific formatting. Possible values are 'month' or other view types.
         * @return {string} A styled HTML string representing the holiday for display.
         */
        function formatterHoliday(holiday, view) {
            const isDayOrWeek = view === 'day' || view === 'week';
            const css = [
                'font-size: 12px',
                'line-height: 12px',
                'width: ' + (isDayOrWeek ? '100%' : 'auto'),
                'text-align: ' + (view === 'day' ? 'left' : 'center'),
            ].join(';');
            let badgeClass = isDayOrWeek ? 'px-2 py-1' : '';
            if (view === 'day') {
                badgeClass += ' d-inline';
            }
            return `<div class="${badgeClass}" style="${css}">${holiday.title}</div>`;
        }

        /**
         * Formats the given appointment as a small HTML string, potentially including additional extras.
         *
         * @param {Object} appointment - The appointment object containing information to be formatted.
         * @param {Object} [extras] - An object containing additional parameters for formatting, if applicable.
         * @return {string} A formatted string representing the appointment, styled as a small HTML element.
         */
        function formatterWeek(appointment, extras) {
            void extras; // Verhindert die Warnung, aber erfüllt keinen Zweck
            return `<small class="px-2" style="font-size: 10px">${appointment.title}</small>`;
        }

        /**
         * Formats the given appointment into a styled HTML string for monthly calendar display.
         *
         * @param {Object} appointment - The appointment to format. Should include `start`, `title`, and `allDay` properties.
         * @param {Object} extras - Additional configuration options such as `locale` for time formatting and `icon` for styling.
         * @return {string} A formatted HTML string representing the appointment.
         */
        function formatterMonth(appointment, extras) {
            const startTime = new Date(appointment.start).toLocaleTimeString(extras.locale, {
                hour: '2-digit',
                minute: '2-digit'
            });
            const timeToShow = appointment.allDay ? '' : `<small class="me-1">${startTime}</small>`;
            const icon = `<i class="${extras.icon} me-1"></i>`;
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
         * Formats an appointment object into a structured HTML string representation.
         *
         * @param {Object} appointment - The appointment object to format. This object should include properties such as `start`, `color`, `link`, and `title`.
         * @param {Object} extras - Additional options to customize the output. This object may contain a `locale` property to format the date string.
         * @return {string} - A string containing the HTML representation of the formatted appointment.
         */
        function formatterSearch(appointment, extras) {
            const firstCollStyle = [
                `border-left-color:${appointment.color}`,
                `border-left-width:5px`,
                `border-left-style:dotted`,
                `cursor:pointer`,
                `font-size:1.75rem`,
                `width: 60px`,
            ].join(';');
            const link = buildLink(appointment.link);
            const day = new Date(appointment.start).getDate();
            const date = new Date(appointment.start).toLocaleDateString(extras.locale, {
                month: 'short',
                year: 'numeric',
                weekday: 'short'
            })

            return [
                `<div class="d-flex align-items-center justify-content-start g-3 py-1">`,
                `<div class="day fw-bold text-center" style="${firstCollStyle}" data-date="${$.bsCalendar.utils.formatDateToDateString(new Date(appointment.start))}">`,
                `${day}`,
                `</div>`,
                `<div class="text-muted" style="width: 150px;">`,
                `${date}`,
                `</div>`,
                `<div class="title-container flex-fill text-nowrap d-flex justify-content-between align-items-center">`,
                `<span>${appointment.title}</span>` + link,
                `</div>`,
                `</div>`,
            ].join('');
        }

        /**
         * Sets today's date in the specified wrapper and optionally updates the view.
         * If a new view is passed and differs from the current view, it will switch to the new view.
         * It Also triggers the fetching of appointments and updates the view accordingly.
         *
         * @param {jQuery} $wrapper - The wrapper object containing the calendar or context-related elements.
         * @param {string} [view] - The optional view to set (e.g. 'day', 'week', 'month').
         *                          Should be included in the available views defined in settings.
         * @return {void} - Does not return a value.
         */
        function setToday($wrapper, view) {
            const settings = getSettings($wrapper);
            let viewChanged= false;
            if (view && settings.views.includes(view)) {
                const viewBefore = getView($wrapper);
                if (viewBefore !== view) {
                    setView($wrapper, view);
                    viewChanged = true;
                }
            }
            const date = new Date();
            setDate($wrapper, date);
            buildByView($wrapper, viewChanged);
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
            let viewChanged= false;
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
                        viewChanged = true;
                    }
                }
            }

            if (date) {
                setDate($wrapper, date);
            }

            buildByView($wrapper, viewChanged);
        }

        /**
         * Clears specific elements within a given wrapper and optionally removes associated appointments.
         *
         * @param {jQuery} $wrapper - The wrapper element where the elements will be cleared.
         * @param {boolean} [removeAppointments=true] - Determines whether the appointments should also be removed.
         * @return {void} This function does not return a value.
         */
        function methodClear($wrapper, removeAppointments = true) {
            $wrapper.find('[data-appointment]').remove();
            $wrapper.find('[data-role="holiday"]').remove();
            $wrapper.find('.tooltip').remove();
            if (removeAppointments) {
                setAppointments($wrapper, []).then(_cleanedAppointments => {
                    void _cleanedAppointments; // Prevents the warning, but serves no purpose
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
            $(calendarElements.infoModal).modal("hide");
            methodClear($wrapper);

            // Remove namespaced event handlers to avoid duplicate bindings on re-init
            // Remove window handlers (resize, etc.) and body handlers registered in handleEvents()
            try {
                $(window).off(namespace);
                $("body").off(namespace);
                $(document).off(namespace);
            } catch (e) {
                // defensive: if off fails for some reason, log in debug mode
                const settings = getSettings($wrapper);
                if (settings && settings.debug) {
                    log("Error while removing namespaced events during destroy:", e);
                }
            }

            // Remove stored data and classes
            $wrapper.removeData("initBsCalendar");
            $wrapper.removeData("settings");
            $wrapper.removeData("view");
            $wrapper.removeData("date");
            $wrapper.removeData("appointments");
            $wrapper.removeData("searchMode");
            $wrapper.removeData("searchPagination");
            $wrapper.removeData("currentRequest");
            $wrapper.removeClass("position-relative bs-calendar overflow-hidden");
            $wrapper.empty();

            // Ensure any info modal DOM node is removed (cleanup)
            if ($(calendarElements.infoModal).length) {
                try {
                    $(calendarElements.infoModal).remove();
                } catch (e) {
                    // ignore
                }
            }
        }

        /**
         * Updates the settings of a given wrapper element with the provided options.
         *
         * @param {jQuery} $wrapper - The jQuery-wrapped DOM element to which settings are applied.
         * @param {Object} options - An object containing new configuration options to update the settings.
         * @returns {void} This method does not return any value.
         */
        function methodUpdateOptions($wrapper, options) {
            if (typeof options === 'object') {
                const settingsBefore = getSettings($wrapper);

                // Retrieve the previous addons
                const addonsBeforeTopbar = settingsBefore.topbarAddons;
                const addonsBeforeSidebar = settingsBefore.sidebarAddons;

                // Check the new addons
                const addonsAfterTopbar = options.topbarAddons || null;
                const addonsAfterSidebar = options.sidebarAddons || null;

                // Create a temporary container for backup if required
                let tmpDiv = null;

                // Check if a backup is necessary
                const needsBackupTopbar = addonsBeforeTopbar && !addonsAfterTopbar;
                const needsBackupSidebar = addonsBeforeSidebar && !addonsAfterSidebar;

                if (needsBackupTopbar || needsBackupSidebar) {
                    tmpDiv = $('<div>', {
                        css: {
                            visibility: 'hidden'
                        }
                    }).insertAfter($wrapper);

                    // Backup `topbarAddons`
                    if (needsBackupTopbar && $wrapper.find(addonsBeforeTopbar).length > 0) {
                        $wrapper.find(addonsBeforeTopbar).appendTo(tmpDiv);
                    }

                    // Backup `sidebarAddons`
                    if (needsBackupSidebar && $wrapper.find(addonsBeforeSidebar).length > 0) {
                        $wrapper.find(addonsBeforeSidebar).appendTo(tmpDiv);
                    }
                }

                // Store the current date and view
                const startDate = getDate($wrapper);
                const startView = getView($wrapper);

                // Destroy the current calendar
                destroy($wrapper);

                // Merge the old settings with the new ones
                const newSettings = $.extend(true, {}, $.bsCalendar.getDefaults(), $wrapper.data(), settingsBefore, options || {});

                if (settingsBefore.debug) {
                    log('Settings before update:', settingsBefore);
                    log('Settings after update:', newSettings);
                }
                // Retain the date and view logic
                if (!options.hasOwnProperty('startDate')) {
                    newSettings.startDate = startDate;
                }
                if (!options.hasOwnProperty('startView')) {
                    newSettings.startView = startView;
                }

                normalizeSettings(newSettings);

                setSettings($wrapper, newSettings);

                // Reinitialize the calendar
                init($wrapper, false, false).then(() => {
                    // If a temporary container was used, reinsert the addons
                    if (tmpDiv) {
                        if (needsBackupTopbar) {
                            tmpDiv.find(addonsBeforeTopbar).appendTo($wrapper);
                        }
                        if (needsBackupSidebar) {
                            tmpDiv.find(addonsBeforeSidebar).appendTo($wrapper);
                        }
                        tmpDiv.remove();
                    }
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
            const viewBefore = getView($wrapper);
            // Flag to track if settings need to be updated.
            let changeSettings = false;
            let changeView = false;
            // Check if 'params' is an object.
            if (typeof object === 'object') {
                // If 'params' contains 'url', update the 'url' in settings.
                if (object.hasOwnProperty('url')) {
                    settings.url = object.url;
                    // Mark that settings have been changed.
                    changeSettings = true;
                }

                if (object.hasOwnProperty('view') && settings.views.includes(object.view) && viewBefore !== object.view) {
                    setView($wrapper, object.view);
                    changeView = true;
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

            buildByView($wrapper, changeView);
        }

        /**
         * Formats a duration object into a human-readable string.
         *
         * @param {Object} duration - The duration object containing time components.
         * @return {string} A formatted string representing the duration in the format of "Xd Xh Xm Xs".
         * If all components are zero, returns "0 s".
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
         * Builds an HTML anchor (`<a>`) tag with specified attributes and styles.
         *
         * @param {string|Object} link - The link information. Can be a string URL or an object with anchor attributes:
         *   - `href` (string): The URL for the link (required in object form).
         *   - `text` (string): The text content for the link. Defaults to "Link".
         *   - `html` (string): Optional HTML content for the link. If provided, overrides the `text`.
         *   - `target` (string): Specifies where to open the linked document. Defaults to "_blank".
         *   - `rel` (string): Specifies the relationship between the current document and the linked document.
         *   Defaults to "noopener noreferrer".
         * @param {string} [style=""] - Optional style string applied to the `style` attribute of the anchor tag.
         * @return {string} An HTML string representing an anchor tag. Returns an empty string if `link` is invalid.
         */
        function buildLink(link) {
            if (!link) {
                return "";  // If no link is specified, return empty.
            }

            // prepare default values
            const defaultText = "Link";
            const defaultTarget = "_blank";
            const defaultRel = "noopener noreferrer";

            if (typeof link === "string") {
                // treatment as a simple string
                return `<a class="btn btn-primary px-5 rounded-pill" href="${link}" target="${defaultTarget}" rel="${defaultRel}">${defaultText}</a>`;
            }

            if (typeof link === "object" && link.href) {
                // treatment as an object with attributes
                const text = link.text || defaultText;
                const target = link.target || defaultTarget;
                const rel = link.rel || defaultRel;

                // When HTML content is defined, this is used
                const content = link.html || text;
                return `<a class="btn btn-primary px-5 rounded-pill" href="${link.href}" target="${target}" rel="${rel}">${content}</a>`;
            }

            // If neither a string nor a correct object is available, return empty.
            return "";
        }


        /**
         * Formats the content for an info window based on the provided appointment data and additional information.
         *
         * @param {object} appointment - The appointment object containing details such as title, description, location, and link.
         * @param {object} extras - Additional data for display, including `displayDates` (array of date objects) and `duration`.
         * @return {Promise<string>} A promise that resolves to the formatted HTML string for the info window or rejects with an error message.
         */
        async function formatInfoWindow(appointment, extras) {
            const locale = extras.locale;
            return new Promise((resolve, reject) => {
                try {
                    const showTime = $.bsCalendar.utils.getAppointmentTimespanBeautify(extras, true);
                    // generate link if available
                    const link = buildLink(appointment.link);

                    // process location information
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

                    const desc = appointment.description ? `<p>${appointment.description}</p>` : "";
                    // assemble the result and dissolve the promise
                    const result = [
                        `<h3>${appointment.title}</h3>`,
                        `<p>${showTime}</p>`,
                        location,
                        `${desc}`,
                        link
                    ].join('');

                    resolve(result);
                } catch (error) {
                    reject(`Error in formatter.window: ${error.message}`);
                }
            });
        }

        /**
         * Logs a message to the browser's console with a custom prefix.
         *
         * @param {string} message - The main message to log.
         * @param {...any} params - Additional optional parameters to include in the log output.
         * @return {void}
         */
        function log(message, ...params) {
            if (window.console && window.console.log) {
                window.console.log('bsCalendar LOG: ' + message, ...params);
            }
        }

        /**
         * Triggers an event on the provided wrapper element and executes corresponding settings functions dynamically.
         *
         * - Always triggers the "all" event, which can be used as a global catch-all for any event.
         * - Dynamically maps specific event names (e.g. "show-info-window") to their corresponding settings handler
         *   (e.g. "onShowInfoWindow") and executes them if they exist.
         *
         * The method automatically transforms event names with dashes (`-`) into CamelCase,
         * ensuring compatibility with handler naming conventions.
         *
         * @param {jQuery} $wrapper - The jQuery wrapper element on which the event is triggered.
         * @param {string} event - The name of the event to trigger (e.g. "edit", "show-info-window").
         * @param {...*} params - Any additional parameters to pass to the handler functions.
         */
        function trigger($wrapper, event, ...params) {
            // Retrieve settings for the wrapper
            const settings = getSettings($wrapper);

            // Debugging: Log event details if debug mode is enabled
            if (settings.debug) {
                if (params.length > 0) {
                    log('Triggering event:', event, 'with params:', ...params);
                } else {
                    log('Triggering event:', event, 'without params');
                }
            }

            // Skip "all" event, as it is handled globally
            if (event !== 'all') {
                // Trigger the "all" event with the current event as data
                $wrapper.trigger(`all${namespace}`, event + namespace, ...params);
                executeFunction(settings.onAll, event + namespace, ...params); // Execute the global "onAll" handler

                // Trigger the specific event directly
                $wrapper.trigger(`${event}${namespace}`, [...params]);

                // Automatically map the event name to a settings handler and execute it
                // Converts event name to CamelCase + add "on" prefix (e.g., "show-info-window" -> "onShowInfoWindow")
                const eventFunctionName = `on${event
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('')}`;

                executeFunction(settings[eventFunctionName], ...params);
            }
        }


        /**
         * Initializes the calendar widget within the provided wrapper element.
         * Configures settings, views, and event handling as necessary.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the container element where the calendar will be initialized.
         * @param {boolean} [initEvents=true] - A flag indicating whether event handlers should be attached during initialization.
         * @param {boolean} [triggerEvent=true] - A flag indicating whether event handlers should be attached during initialization.
         * @return {Promise<jQuery>} A promise that resolves with the initialized wrapper element or rejects with an error encountered during initialization.
         */
        function init($wrapper, initEvents = true, triggerEvent = true) {
            return new Promise((resolve, reject) => {
                try {
                    const settings = getSettings($wrapper);
                    $wrapper.addClass('position-relative bs-calendar overflow-hidden');
                    const wrapperUniqueId = $.bsCalendar.utils.generateRandomString(8);
                    $wrapper.attr('data-bs-calendar-id', wrapperUniqueId);

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
                    let searchObject =
                        settings.search &&
                        settings.search.hasOwnProperty('limit') &&
                        settings.search.hasOwnProperty('offset') ?
                            {limit: settings.search.limit, offset: settings.search.offset} :
                            null;
                    setSearchPagination($wrapper, searchObject);
                    buildFramework($wrapper);
                    if (initEvents) {
                        handleEvents($wrapper);
                    }

                    buildMonthSmallView($wrapper, getDate($wrapper), $('.wc-calendar-month-small'));
                    if(triggerEvent) {
                        trigger($wrapper, 'init');
                    }
                    buildByView($wrapper, triggerEvent);

                    $wrapper.data('initBsCalendar', true);
                    if (settings.debug) {
                        log('bsCalendar initialized');
                    }

                    resolve($wrapper);
                } catch (error) {
                    reject(error);
                }
            });
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
                // Check if the appointment array is valid, contains appointments, and is not empty
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

                // --- DEDUPLICATION: remove exact duplicates (by id if present, otherwise by start|end|title) ---
                try {
                    const seen = new Set();
                    const deduped = [];
                    for (const appt of appointments) {
                        let key = null;
                        if (appt && (appt.id !== undefined && appt.id !== null)) {
                            key = `id:${appt.id}`;
                        } else {
                            // fallback key using important fields
                            key = `k:${(appt.start || '')}|${(appt.end || '')}|${(appt.title || '')}`;
                        }
                        if (!seen.has(key)) {
                            seen.add(key);
                            deduped.push(appt);
                        } else if (settings.debug) {
                            log("Duplicate appointment removed by setAppointments:", appt);
                        }
                    }
                    appointments = deduped;
                } catch (e) {
                    if (settings.debug) {
                        log("Error during appointment deduplication:", e);
                    }
                    // fall through - still continue with original appointments if something fails
                }
                // --- end deduplication ---

                const view = getView($wrapper);
                if (view === 'year') {
                    const processedAppointments = appointments
                        .filter(appointment => {
                            // check whether `date` is available and is valid
                            const isValidDate = appointment.hasOwnProperty('date') && !isNaN(Date.parse(appointment.date));
                            // check whether `total` is present and is larger than 0
                            const isValidTotal = appointment.hasOwnProperty('total') && parseInt(appointment.total) > 0;
                            // only take over if both exams are successful
                            return isValidDate && isValidTotal;
                        })
                        .map(appointment => {
                            // Put the value of `total` on integer (if necessary)
                            appointment.total = parseInt(appointment.total + "");
                            return appointment;
                        });
                    setAppointmentExtras($wrapper, processedAppointments);
                    $wrapper.data('appointments', processedAppointments);
                    return resolve(processedAppointments);
                }

                // Check if the appointment array is valid, contains appointments, and is not empty
                cleanAppointments($wrapper, appointments);

                // Determine if the system is in search mode to adjust sorting behavior
                const inSearchMode = getSearchMode($wrapper);

                // Sort the appointments based on their start time
                // If not in search mode, use ascending order
                sortAppointmentByStart(appointments, !inSearchMode)
                    .then(_sortedAppointments => {
                        void _sortedAppointments;
                        // Calculate additional details for appointments (e.g.  duration, custom flags)
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


        /**
         * Cleans and normalizes a list of appointments by applying validation and formatting based on the provided wrapper settings.
         *
         * @param {Object} $wrapper - The wrapper object containing configuration and settings used for cleaning appointments.
         * @param {Array} appointments - A list of appointment objects to be cleaned and normalized.
         * @return {void} - This method does not return a value but modifies the appointment array in place.
         */
        function cleanAppointments($wrapper, appointments) {
            appointments.forEach(appointment => {

                // Ensure start and end times are properly normalized
                appointment.start = $.bsCalendar.utils.normalizeDateTime(appointment.start.trim());
                appointment.end = $.bsCalendar.utils.normalizeDateTime(appointment.end.trim());

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
         * Sorts a list of appointments by their start date and optionally prioritizes all-day events.
         *
         * @param {Array} appointments - The array of appointment objects to be sorted. Each object should contain `start` (date) and optionally `allDay` (boolean) properties.
         * @param {boolean} [sortAllDay=true] - A flag to indicate whether all-day appointments should be prioritized at the beginning of the list.
         * @return {Promise<Array>} A Promise that resolves to the sorted array of appointments.
         */
        async function sortAppointmentByStart(appointments, sortAllDay = true) {
            if (!appointments || !Array.isArray(appointments) || appointments.length === 0) {
                return [];
            }
            return new Promise((resolve, reject) => {
                try {
                    // sort the dates
                    appointments.sort((a, b) => {
                        if (sortAllDay) {
                            // all-day dates first
                            if (a.allDay && !b.allDay) {
                                return -1;
                            }
                            if (!a.allDay && b.allDay) {
                                return 1;
                            }
                        }

                        // sort within the same category by start date
                        return new Date(a.start) - new Date(b.start);
                    });

                    resolve(appointments); // Give back the sorted array
                } catch (error) {
                    reject(error); // If an error occurs, the promise was rejected
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
            return $wrapper.data('appointments') || [];
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
            // get the settings
            const settings = getSettings($wrapper);
            // Clear the wrapper first
            $wrapper.empty();

            // initial wrapper and put it at a 100% height and width
            const innerWrapper = $('<div>', {
                class: 'd-flex flex-column align-items-stretch h-100 w-100'
            }).appendTo($wrapper);

            const roundedClass = 'rounded-' + settings.rounded;

            // Create the wrapper for the upper navigation
            const topNav = $('<div>', {
                class: `row align-items-center px-0 justify-content-between ${roundedClass} mb-3 ${calendarElements.topNav}`
            }).appendTo(innerWrapper);

            // When an element has been set after the upper navigation, add it after navigation
            if (settings.topbarAddons && $(settings.topbarAddons).length > 0) {
                $(settings.topbarAddons).insertAfter(topNav);
            }

            const leftCol = $('<div>', {class: 'col-auto col-lg-3 d-flex py-2 py-lg-0 flex-nowrap align-items-center flex-fill'}).appendTo(topNav);
            const middleCol = $('<div>', {class: 'col-auto col-lg-3 d-flex py-2 py-lg-0 justify-content-end justify-content-lg-center flex-fill flex-nowrap align-items-center'}).appendTo(topNav);
            const rightCol = $('<div>', {class: 'col-auto col-lg-3 d-flex py-2 py-lg-0 justify-content-end flex-nowrap flex-fill align-items-center'}).appendTo(topNav);

            // Add a button to switch on and off the sidebar.
            $('<button>', {
                class: `btn border me-2 ${roundedClass}`,
                html: `<i class="${settings.icons.menu}"></i>`,
                'data-bs-toggle': 'sidebar'
            }).appendTo(leftCol);

            // If search is activated, add a search container
            if (settings.search) {
                const topSearchNav = $('<div>', {
                    class: `d-none align-items-center px-0 justify-content-center mb-3 ${roundedClass} ${calendarElements.topSearchNav}`,
                }).insertAfter(topNav);

                // add a search button to topNav
                const showSearchbar = $('<button>', {
                    class: `btn border js-btn-search me-2 ${roundedClass}`,
                    html: `<i class="${settings.icons.search}"></i>`
                }).appendTo(leftCol);

                // Add click event to start search mode
                showSearchbar.on('click', function () {
                    toggleSearchBar($wrapper, true);
                });

                // add the search input to the top search bar
                const inputCss = 'max-width: 400px;';
                $('<input>', {
                    type: 'search',
                    style: inputCss,
                    class: `form-control border ${roundedClass}`,
                    placeholder: settings.translations.search || 'search',
                    'data-search-input': true
                }).appendTo(topSearchNav);

                // add a close button
                const btnCloseSearch = $('<button>', {
                    class: `btn p-2 ms-2 js-btn-close-search ${roundedClass}`,
                    html: `<i class="bi bi-x-lg mx-2"></i>`,
                    "aria-label": "Close"
                }).appendTo(topSearchNav);

                // When the close button is clicked, end the search mode
                btnCloseSearch.on('click', function () {
                    toggleSearchBar($wrapper, false);
                    if (getSearchMode($wrapper)) {
                        toggleSearchMode($wrapper, false, true);
                    }
                })
            }

            // add a button to create appointments
            if (settings.showAddButton) {
                $('<button>', {
                    class: `btn border me-2 ${roundedClass}`,
                    html: `<i class="${settings.icons.add}"></i>`,
                    'data-add-appointment': true
                }).appendTo(leftCol);
            }

            // add the title when known
            if (settings.title) {
                $('<div>', {
                    html: settings.title,
                    class: 'mb-0 me-2'
                }).appendTo(middleCol);
            }

            // visual notification that appointments are loaded
            $('<div>', {
                class: 'spinner-border me-auto me-2 text-secondary wc-calendar-spinner',
                css: {
                    display: 'none'
                },
                role: 'status',
                html: '<span class="visually-hidden">Loading...</span>'
            }).appendTo(leftCol);

            // navigation through the calendar depending on the view
            $('<div>', {
                class: 'd-flex ms-2 align-items-center justify-content-center wc-nav-view-wrapper flex-nowrap text-nowrap',
                html: [
                    '<strong class="wc-nav-view-name me-3"></strong>',
                    `<a data-prev href="#"><i class="${settings.icons.prev}"></i></a>`,
                    `<a class="mx-2" data-next href="#"><i class="${settings.icons.next}"></i></a>`,
                ].join('')
            }).appendTo(rightCol);


            // Add a button today to activate the current date in the calendar
            $('<button>', {
                class: `btn ms-2 border ${roundedClass}`,
                html: settings.translations.today,
                'data-today': true
            }).appendTo(rightCol);

            // If only one view is desired, give no selection
            if (settings.views.length > 1) {
                const dropDownView = $('<div>', {
                    class: 'dropdown dropdown-center wc-select-calendar-view ms-2',
                    html: [
                        `<a class="btn dropdown-toggle border ${roundedClass}" data-dropdown-text href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">`,
                        '</a>',
                        '<ul class="dropdown-menu">',
                        '</ul>',
                    ].join('')
                }).appendTo(rightCol);

                if (settings.debug) {
                    log('buidlFramwork', settings.views);
                }
                settings.views.forEach(view => {
                    $('<li>', {
                        html: `<a class="dropdown-item" data-view="${view}" href="#"><i class="${settings.icons[view]} me-2"></i> ${settings.translations[view]}</a>`
                    }).appendTo(dropDownView.find('ul'));
                });
            }

            // The head was completed, creates a container for Sidebar and the view
            const container = $('<div>', {
                class: 'd-flex flex-fill wc-calendar-container'
            }).appendTo(innerWrapper);

            // add the sidebar
            const sidebar = $('<div>', {
                css: {
                    position: 'relative',
                },
                class: 'me-4 ' + calendarElements.sideNav,
                html: [
                    '<div class="pb-3">',
                    '<div class="d-flex justify-content-between align-items-center">',
                    '<span class="wc-nav-view-small-name me-3"></span>',
                    '<div>',
                    `<a data-prev href="#"><i class="${settings.icons.prev}"></i></a>`,
                    `<a class="ms-2" data-next href="#"><i class="${settings.icons.next}"></i></a>`,
                    '</div>',
                    '</div>',
                    '</div>',
                    '<div class="wc-calendar-month-small"></div>'
                ].join('')
            }).appendTo(container);
            sidebar.data('visible', true);

            // If more addons are to be invited, add them to the sidebar
            if (settings.sidebarAddons && $(settings.sidebarAddons).length > 0) {
                $(settings.sidebarAddons).appendTo(sidebar);
            }

            // add the viewer
            $('<div>', {
                class: `container-fluid ${calendarElements.containerView} ${roundedClass} pb-5 border-1 flex-fill border overflow-hidden  d-flex flex-column align-items-stretch`,
            }).appendTo(container);

            // done
        }

        /**
         * Updates the elements displaying the current date information based on the provided wrapper's settings, date, and view.
         *
         * @param {jQuery} $wrapper The wrapper object contains settings, date, and view for getting and formatting the current date.
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
            const calendarWeek = $.bsCalendar.utils.getCalendarWeek(date);

            // ISO week string "YYYY-Www" (unambiguous machine-readable)
            function getIsoWeekString(d) {
                const tmp = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
                tmp.setUTCDate(tmp.getUTCDate() + 4 - (tmp.getUTCDay() || 7));
                const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
                const weekNo = Math.ceil((((tmp - yearStart) / 86400000) + 1) / 7);
                return tmp.getUTCFullYear() + '-W' + String(weekNo).padStart(2, '0');
            }

            // Localized date range for the week (human-friendly)
            function getWeekDateRange(d, locale, startWeekOnSunday) {
                const dt = new Date(d);
                const day = dt.getDay(); // 0..6 (Sun..Sat)
                const startOffset = startWeekOnSunday ? day : (day === 0 ? 6 : day - 1);
                const start = new Date(dt);
                start.setDate(dt.getDate() - startOffset);
                const end = new Date(start);
                end.setDate(start.getDate() + 6);
                const options = {day: 'numeric', month: 'short', year: 'numeric'};
                const startStr = start.toLocaleDateString(locale, options);
                const endStr = end.toLocaleDateString(locale, options);
                return startStr + ' — ' + endStr;
            }

            switch (view) {
                case 'day':
                    el.text(weekdayName + ', ' + dayName + ' ' + monthName + ' ' + yearName);
                    el.removeAttr('data-iso-week');
                    el.attr('title', '');
                    break;
                case 'week': {
                    // Use a short universal week label "W42" (widely recognized) for the visible text,
                    // keep ISO week in a data-attribute, and expose the localized date range in the title/tooltip.
                    const weekNumber = String(calendarWeek);
                    const visibleLabel = `W${weekNumber}`; // compact, language-neutral
                    const iso = getIsoWeekString(date);
                    const range = getWeekDateRange(date, settings.locale, settings.startWeekOnSunday);

                    el.text(visibleLabel + ' · ' + monthName + ' ' + yearName);
                    el.attr('data-iso-week', iso);
                    el.attr('title', range); // browser tooltip shows localized date range
                    break;
                }
                case 'month':
                    el.text(monthName + ' ' + yearName);
                    el.removeAttr('data-iso-week');
                    el.attr('title', '');
                    break;
                case 'year':
                    el.text(yearName);
                    el.removeAttr('data-iso-week');
                    el.attr('title', '');
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
                    newDate.setMonth(newDate.getMonth() - 1); // Subtract a month

                    // check whether the day in the new month exists
                    if (newDate.getDate() !== date.getDate()) {
                        // If not, set on the first day of the new month
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
            trigger($wrapper, 'navigate-back', view, date, newDate);
            buildByView($wrapper, false);
        }

        /**
         * Navigates forward in the calendar based on the current view (e.g., day, week, month, year).
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
                    newDate.setMonth(newDate.getMonth() + 1); // add a month

                    // check whether the day in the new month exists
                    if (newDate.getDate() !== date.getDate()) {
                        // If not, set on the first day of the new month
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
            trigger($wrapper, 'navigate-forward', view, date, newDate);
            buildByView($wrapper, false);
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
            const topNav = $wrapper.find('.' + calendarElements.topNav);
            const topSearchNav = $wrapper.find('.' + calendarElements.topSearchNav);
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

        /**
         * Toggles the search mode for a given wrapper element and updates the view accordingly.
         *
         * @param {jQuery} $wrapper - The wrapper element for which the search mode should be toggled.
         * @param {boolean} status - The desired status of search mode, where `true` enables it and `false` disables it.
         * @param {boolean} [rebuildView=true] - Specifies whether the view should be rebuilt when toggling search mode off.
         * @return {void} This method does not return a value.
         */
        function toggleSearchMode($wrapper, status, rebuildView = true) {
            const settings = getSettings($wrapper);
            setSearchMode($wrapper, status);

            if (status) {
                buildByView($wrapper, false);
            } else {
                const search = {
                    limit: settings.search.limit,
                    offset: settings.search.offset
                };

                setSearchPagination($wrapper, search);

                if (rebuildView) {
                    buildByView($wrapper, true)
                }

            }
        }

        /**
         * Resets the search pagination settings to their default values based on the provided wrapper's configuration.
         *
         * @param {jQuery} $wrapper - The wrapper element containing the settings for search pagination.
         * @return {void} This function does not return a value.
         */
        function resetSearchPagination($wrapper) {
            const settings = getSettings($wrapper);
            const search = {limit: settings.search.limit, offset: settings.search.offset};
            setSearchPagination($wrapper, search);
        }

        /**
         * Sets the search pagination data on the given wrapper element.
         *
         * @param {jQuery} $wrapper - A jQuery element where the pagination data will be stored.
         * @param {Object|null} object - The pagination data to be set. If the object is empty, it will set null.
         * @return {void}
         */
        function setSearchPagination($wrapper, object) {
            const pagination = $.bsCalendar.utils.isValueEmpty(object) ? null : object;
            $wrapper.data('searchPagination', pagination);
        }

        /**
         * Retrieves the search pagination data from the given wrapper element.
         *
         * @param {Object} $wrapper - The jQuery-wrapped DOM element containing the search pagination data.
         * @return {Object|undefined} The search pagination data associated with the wrapper element, or undefined if none is found.
         */
        function getSearchPagination($wrapper) {
            return $wrapper.data('searchPagination');
        }

        /**
         * Sets the search mode status on the specified wrapper element.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the wrapper element.
         * @param {boolean} status - The status indicating whether search mode should be enabled (true) or disabled (false).
         * @return {void}
         */
        function setSearchMode($wrapper, status) {
            $wrapper.data('searchMode', status);
        }

        /**
         * Retrieves the search mode from the provided wrapper element.
         *
         * @param {Object} $wrapper - A jQuery object representing the wrapper element containing the search mode data.
         * @return {bool} The search mode value stored in the data attribute of the wrapper element.
         */
        function getSearchMode($wrapper) {
            return $wrapper.data('searchMode') ?? false;
        }

        /**
         * Toggles the visibility of a sidebar within a specified wrapper element,
         * with optional forced open/close behaviors.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the wrapper element containing the sidebar.
         * @param {boolean} [forceClose=false] - If true, forcibly closes the sidebar regardless of its current state.
         * @param {boolean} [forceOpen=false] - If true, forcibly opens the sidebar regardless of its current state.
         * @return {void} This function does not return a value.
         */
        function handleSidebarVisibility($wrapper, forceClose = false, forceOpen = false) {
            const $sidebar = $wrapper.find('.' + calendarElements.sideNav);
            const isVisible = $sidebar.data('visible'); // Current status of the sidebar

            // calculate target status
            const shouldBeVisible = forceOpen || (!forceClose && !isVisible);

            // Set a position before the animation (only if it is opened)
            if (shouldBeVisible) {
                $sidebar.css({position: 'relative'});
            }

            // execute the animation (depending on Shouldbevisible)
            $sidebar.animate({left: shouldBeVisible ? '0px' : '-400px'}, 300, function () {
                // Set position after the animation when closed
                if (!shouldBeVisible) {
                    $sidebar.css({position: 'absolute'});
                }

                if (getView($wrapper) === 'month') {
                    onResize($wrapper, false);
                }

                // update status
                $sidebar.data('visible', shouldBeVisible);
            });
        }

        /**
         * Attaches event listeners to a given wrapper element to handle user interactions with the calendar interface.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the main wrapper element of the calendar.
         *
         * @return {void} This function does not return a value.
         */
        function handleEvents($wrapper) {
            // Defensive: always remove previously registered handlers using the namespace
            try {
                $(window).off(namespace);
                $("body").off(namespace);
                $(document).off(namespace);
            } catch (e) {
                const settings = getSettings($wrapper);
                if (settings && settings.debug) {
                    log("Error while removing previous event handlers in handleEvents:", e);
                }
            }

            let resizeTimer;
            $(window).off("resize" + namespace);
            $(window).on("resize" + namespace, function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () { onResize($wrapper, true); }, 100);
            });

            $('body')
                .on('click' + namespace, calendarElements.infoModal + ' [data-edit]', function (e) {
                    e.preventDefault();
                    const modal = $(calendarElements.infoModal);
                    const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                    const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                    const appointment = $(calendarElements.infoModal).data('appointment');
                    const returnData = getAppointmentForReturn(appointment);
                    trigger(wrapper, 'edit', returnData.appointment, returnData.extras);
                    $(calendarElements.infoModal).modal('hide');

                })
                .on('click' + namespace, calendarElements.infoModal + ' [data-remove]', function (e) {
                    e.preventDefault();
                    const modal = $(calendarElements.infoModal);
                    const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                    const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                    const appointment = $(calendarElements.infoModal).data('appointment');
                    const returnData = getAppointmentForReturn(appointment);
                    trigger(wrapper, 'delete', returnData.appointment, returnData.extras);
                    $(calendarElements.infoModal).modal('hide');
                })
                .on('click' + namespace, function (e) {
                    const $target = $(e.target);
                    const isInsideModal = $target.closest(calendarElements.infoModal).length > 0; // checks for modal or child elements
                    const isTargetElement = $target.closest('[data-appointment]').length > 0; // checks for the target element with appointment data

                    // the modal only closes if the click was neither in the modal nor a target element
                    if (!isInsideModal && !isTargetElement && $(calendarElements.infoModal).length) {
                        $(calendarElements.infoModal).modal('hide');
                    }
                })
                .on('hide.bs.modal', calendarElements.infoModal, function () {
                    const modal = $(calendarElements.infoModal);
                    const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                    const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                    trigger(wrapper, 'hide-info-window');
                })
                .on('hidden.bs.modal', calendarElements.infoModal, function () {
                    // removes the modal completely after it has been closed
                    if ($(calendarElements.infoModal).length) {
                        $(calendarElements.infoModal).remove();
                    }
                });

            function debounce(func, wrapper, delay) {
                let timer;
                return function (...args) {
                    const context = this;
                    const settings = getSettings(wrapper);
                    if (settings.navigateOnWheel) {
                        $('body').css('overflow', 'hidden');
                    }
                    clearTimeout(timer);
                    timer = setTimeout(function () {
                        $('body').css('overflow', '');
                        func.apply(context, args)
                    }, delay);
                };
            }

            $wrapper
                .off('wheel', '.wc-calendar-view-container')
                .on('wheel', '.wc-calendar-view-container', debounce(function (e) {
                    const settings = getSettings($wrapper);
                    const body = $('body');
                    const isModalOpen =
                        body.hasClass('modal-open');
                    const inViewContainer = $(e.target).closest('.wc-calendar-container').length;


                    if (!settings.navigateOnWheel || !inViewContainer || isModalOpen) {
                        body.css('overflow', '');
                        return; // do nothing if the user is not in the container
                    }
                    e.preventDefault(); // prevent standard scroll
                    e.stopPropagation(); // prevent event bubbling

                    if (e.originalEvent.deltaY > 0) {
                        navigateForward($wrapper); // scroll down
                    } else {
                        navigateBack($wrapper); // scroll up
                    }
                }, $wrapper, 300))
                .off('click' + namespace, '[data-bs-toggle="sidebar"]')
                .on('click' + namespace, '[data-bs-toggle="sidebar"]', function () {
                    handleSidebarVisibility($wrapper);
                })
                .off('click' + namespace, '.wc-search-pagination [data-page]')
                .on('click' + namespace, '.wc-search-pagination [data-page]', function (e) {
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
                .off('keyup' + namespace, '[data-search-input]')
                .on('keyup' + namespace, '[data-search-input]', function (e) {
                    e.preventDefault();

                    const input = $(e.currentTarget);
                    const isEmpty = $.bsCalendar.utils.isValueEmpty(input.val()); // Check if the input is empty
                    let inSearchMode = getSearchMode($wrapper);
                    if (!inSearchMode && !isEmpty) {
                        setSearchMode($wrapper, true);
                    }

                    // If input is empty, stop here and optionally disable search mode
                    if (isEmpty) {
                        toggleSearchMode($wrapper, false, true); // End search mode if necessary
                        return;
                    }

                    // Trigger search immediately if an Enter key is pressed or the input field gets updated
                    const isEnterKey = e.type === 'keyup' && (e.key === 'Enter' || e.which === 13 || e.keyCode === 13);

                    if (isEnterKey) {
                        triggerSearch($wrapper);
                    }

                })
                .off('click' + namespace, '[data-day-hour]')
                .on('click' + namespace, '[data-day-hour]', function (e) {
                    const settings = getSettings($wrapper);
                    const details = $(e.currentTarget).data('details');
                    if (settings.debug) {
                        log('Day hour clicked:', details);
                    }
                    const start = new Date(`${$.bsCalendar.utils.formatDateToDateString(details.date)} ${String(details.hour).padStart(2, '0')}:00:00`);
                    const end = new Date(start);
                    end.setMinutes(end.getMinutes() + 30);

                    const data = {
                        start: {
                            date: $.bsCalendar.utils.formatDateToDateString(start),
                            time: start.toTimeString().slice(0, 5) // nur "HH:mm"
                        },
                        end: {
                            date: $.bsCalendar.utils.formatDateToDateString(end),
                            time: end.toTimeString().slice(0, 5) // nur "HH:mm"
                        },
                        view: getView($wrapper)
                    };

                    trigger($wrapper, 'add', data);
                })
                .off('click' + namespace, '[data-role="day-wrapper"]')
                .on('click' + namespace, '[data-role="day-wrapper"]', function (e) {
                    if (e.target !== e.currentTarget) {
                        return; // Abbrechen, falls ein untergeordnetes Element angeklickt wurde
                    }

                    const dayWrapper = $(e.currentTarget).closest('[data-month-date]');
                    const dateAttribute = dayWrapper.attr('data-month-date'); // Hole das Datum aus dem Attribut

                    const currentTime = new Date(); // Aktuelle Zeit
                    const start = new Date(`${$.bsCalendar.utils.formatDateToDateString(dateAttribute)} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`);
                    const end = new Date(start); // Erstelle eine Kopie des Startzeitpunkts (kann für andere Zwecke genutzt werden)


                    end.setMinutes(end.getMinutes() + 30);

                    const data = {
                        start: {
                            date: $.bsCalendar.utils.formatDateToDateString(start),
                            time: start.toTimeString().slice(0, 5) // nur "HH:mm"
                        },
                        end: {
                            date: $.bsCalendar.utils.formatDateToDateString(end),
                            time: end.toTimeString().slice(0, 5) // nur "HH:mm"
                        },
                        view: getView($wrapper)
                    };

                    trigger($wrapper, 'add', data);
                })
                .off('click' + namespace, '[data-add-appointment]')
                .on('click' + namespace, '[data-add-appointment]', function (e) {
                    e.preventDefault();

                    if (getSearchMode($wrapper)) {
                        e.stopPropagation();
                        return; // If in search mode, cancel directly
                    }

                    const period = getStartAndEndDateByView($wrapper);

                    const data = {
                        start: {
                            date: $.bsCalendar.utils.formatDateToDateString(period.start),
                            time: null
                        },
                        end: {
                            date: $.bsCalendar.utils.formatDateToDateString(period.end),
                            time: null
                        },
                        view: getView($wrapper)
                    };

                    trigger($wrapper, 'add', data);
                })
                .off('click' + namespace, '[data-today]')
                .on('click' + namespace, '[data-today]', function (e) {
                    e.preventDefault();
                    const inSearchMode = getSearchMode($wrapper);
                    if (inSearchMode) {
                        e.stopPropagation();
                    } else {
                        setToday($wrapper);
                    }

                })
                .off(`click${namespace} touchend${namespace}`, '[data-appointment]')
                .on(`click${namespace} touchend${namespace}`, '[data-appointment]', function (e) {
                    const clickedOnDate = $(e.target).is('[data-date]');
                    const clickedOnMonth = $(e.target).is('[data-month]');
                    const clickedOnToday = $(e.target).is('[data-today]');
                    const clickedOnAnchor = $(e.target).is('a[href]') || $(e.target).closest('a[href]').length > 0;
                    // check whether the goal is a [data date] or a link with [href]
                    if (clickedOnToday || clickedOnDate || clickedOnMonth || clickedOnAnchor) {
                        // stop the execution of the parent event
                        e.stopPropagation();
                        return;
                    }

                    e.preventDefault();
                    const element = $(e.currentTarget);
                    showInfoWindow($wrapper, element);
                })
                .off('click' + namespace, '[data-date]')
                .on('click' + namespace, '[data-date]', function (e) {
                    e.preventDefault();
                    const settings = getSettings($wrapper);
                    const viewBefore = getView($wrapper);
                    const inSearchMode = getSearchMode($wrapper);
                    if (inSearchMode) {
                        toggleSearchMode($wrapper, false, false);
                    }
                    if (settings.views.includes('day')) {
                        const date = new Date($(e.currentTarget).attr('data-date'));
                        setView($wrapper, 'day');
                        setDate($wrapper, date);
                        buildByView($wrapper, viewBefore !== 'day');
                    }
                })
                .off('click' + namespace, '[data-month]')
                .on('click' + namespace, '[data-month]', function (e) {
                    e.preventDefault();
                    const settings = getSettings($wrapper);
                    const viewBefore = getView($wrapper);
                    if (settings.views.includes('month')) {
                        const date = new Date($(e.currentTarget).attr('data-month'));
                        setView($wrapper, 'month');
                        setDate($wrapper, date);
                        buildByView($wrapper, viewBefore !== 'month');
                    }
                })
                .off('click' + namespace, '[data-prev]')
                .on('click' + namespace, '[data-prev]', function (e) {
                    e.preventDefault();
                    const inSearchMode = getSearchMode($wrapper);
                    if (inSearchMode) {
                        e.stopPropagation();
                    } else {
                        navigateBack($wrapper);
                    }
                })
                .off('click' + namespace, '[data-next]')
                .on('click' + namespace, '[data-next]', function (e) {
                    e.preventDefault();
                    const inSearchMode = getSearchMode($wrapper);
                    if (inSearchMode) {
                        e.stopPropagation();
                    } else {
                        navigateForward($wrapper);
                    }
                })
                .off('click' + namespace, '.wc-select-calendar-view [data-view]')
                .on('click' + namespace, '.wc-select-calendar-view [data-view]', function (e) {
                    e.preventDefault();
                    const inSearchMode = getSearchMode($wrapper);
                    if (inSearchMode) {
                        e.stopPropagation();
                    } else {
                        const oldView = getView($wrapper);
                        const newView = $(e.currentTarget).attr('data-view');
                        if (oldView !== newView) {
                            setView($wrapper, newView);
                            buildByView($wrapper, true);
                        }
                    }
                })
        }

        /**
         * Removes a specified key-value pair from local storage for the given wrapper element.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the wrapper element. Must have an `id` attribute to properly construct the storage key.
         * @param {string} key - The key of the data to be removed from local storage.
         * @return {void} This function does not return a value.
         */
        function removeFromLocalStorage($wrapper, key) {
            const settings = getSettings($wrapper);
            if (settings.debug) {
                log('Removing data from local storage: ' + key);
            }
            if ($.bsCalendar.utils.isValueEmpty($wrapper.attr('id'))) {
                if (settings.debug) {
                    log('Wrapper element has no id attribute. Cannot remove data from local storage.');
                }
                return;
            }
            const elementId = $wrapper.attr('id');
            const keyComplete = `bsCalendar.${elementId}.${key}`;
            localStorage.removeItem(keyComplete);
        }

        /**
         * Persists a key-value pair to the browser's local storage for a given wrapper element,
         * provided the settings allow it and certain conditions are met.
         *
         * @param {jQuery} $wrapper
         * @param {string} key - The key under which the data should be stored.
         * @param {*} value - The value to store in local storage. Can be an object, boolean, or string.
         * @return {void} This method does not return a value.
         */
        function saveToLocalStorage($wrapper, key, value) {
            const settings = getSettings($wrapper);
            if (settings.debug) {
                log('Saving element data to local storage: ' + key + ' = ' + value);
            }
            if (!settings.storeState) {
                if (settings.debug) {
                    removeFromLocalStorage($wrapper, key);
                    log('Saving is disabled. Please enable it in the settings.');
                }
                return;
            }
            if ($.bsCalendar.utils.isValueEmpty($wrapper.attr('id'))) {
                if (settings.debug) {
                    log('Element has no ID, cannot save data to local storage');
                }
                return;
            }

            const elementId = $wrapper.attr('id');
            const keyComplete = `bsCalendar.${elementId}.${key}`;

            if (value === undefined) {
                if (settings.debug) {
                    log('Value is undefined, cannot save data to local storage');
                }
                return;
            }

            if (value === null) {
                if (settings.debug) {
                    log('Value is null, cannot save data to local storage');
                }
                localStorage.setItem(keyComplete, 'null');
            } else if (typeof value === 'object') {
                if (settings.debug) {
                    log('Saving object to local storage', JSON.stringify(value));
                }
                localStorage.setItem(keyComplete, JSON.stringify(value));
            } else if (typeof value === 'boolean') {
                if (settings.debug) {
                    log('Saving boolean to local storage', value.toString());
                }
                localStorage.setItem(keyComplete, value.toString());
            } else if (typeof value === 'function') {
                if (settings.debug) {
                    log('Functions cannot be stored in localStorage.');
                }
            } else {
                if (settings.debug) {
                    log('Saving string to local storage', value.toString());
                }
                localStorage.setItem(keyComplete, value.toString());
            }
        }

        /**
         * Retrieves data from local storage for the specified key associated with the given wrapper element.
         * The method handles parsing of JSON values, as well as converting specific string values to
         * their corresponding types (e.g., boolean, number).
         *
         * @param {jQuery} $wrapper - The wrapper element whose ID is used as part of the local storage key.
         * @param {string} key - The key used to retrieve the data from local storage.
         * @return {*} The parsed value from local storage if successful, or the original string value if parsing fails.
         * Returns null if the value is 'null'. Returns false if data retrieval is disabled or no valid key exists.
         */
        function getFromLocalStorage($wrapper, key) {
            const settings = getSettings($wrapper);
            if (settings.debug) {
                log('Getting element data from local storage: ' + key);
            }
            if ($.bsCalendar.utils.isValueEmpty($wrapper.attr('id'))) {
                if (settings.debug) {
                    log('Element has no ID, cannot get data from local storage');
                }
                return;
            }
            if (!settings.storeState) {
                if (settings.debug) {
                    removeFromLocalStorage($wrapper, key);
                    log('Getting is disabled. Please enable it in the settings.');
                }
                return;
            }
            const elementId = $wrapper.attr('id');

            // Verwenden des mit Element-ID erweiterten Schlüssels
            const keyComplete = `bsCalendar.${elementId}.${key}`;
            const value = localStorage.getItem(keyComplete);

            try {
                // Versuch, JSON-Werte zu parsen (für Objekte/Arrays)
                if (settings.debug) {
                    log('Parsing value from local storage', value);
                }
                return JSON.parse(value);
            } catch (e) {
                // Prüfe auf spezielle Werte (null oder boolean)
                if (value === 'null') {
                    if (settings.debug) {
                        log('Value is null, returning null', null);
                    }
                    return null;
                }

                if (value === 'true') {
                    if (settings.debug) {
                        log('Value is \'true\', returning true', true);
                    }
                    return true;
                }

                if (value === 'false') {
                    if (settings.debug) {
                        log('Value is \'false\', returning false', false);
                    }
                    return false;
                }

                // Prüfe, ob es sich um eine Zahl handelt
                const isNumber = value => /^-?\d+(\.\d+)?$/.test(value);

                if (isNumber(value)) {
                    if (settings.debug) {
                        log('Value is a number, returning number', Number(value));
                    }
                    return Number(value);
                }

                if (settings.debug) {
                    log('Value is not a valid JSON value, returning string', value);
                }
                // Rückgabe als String, falls nichts anderes passt
                return value;
            }
        }

        /**
         * Triggers the search functionality within the given wrapper element. This includes fetching settings,
         * resetting pagination, and updating the view.
         *
         * @param {jQuery} $wrapper - The wrapper element containing the search context.
         * @return {void} - No return value.
         */
        function triggerSearch($wrapper) {
            resetSearchPagination($wrapper);
            buildByView($wrapper, false);
        }

        /**
         * Retrieves the select view element from the given wrapper.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the wrapper element.
         * @return {jQuery} The jQuery object representing the select view element within the wrapper.
         */
        function getSelectViewElement($wrapper) {
            return $wrapper.find('.wc-select-calendar-view');
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

            dropdown.find('[data-dropdown-text]').html(activeItem.html());
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

        /**
         * Sets the last view data attribute on the provided wrapper element.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the DOM element to set the last view for.
         * @param {string} view - The name of the last view to set.
         * @return {void} This method does not return a value.
         */
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
            saveToLocalStorage($wrapper, 'view', view);
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
         * @return {null|object} The settings data retrieved from the wrapper element.
         */
        function getSettings($wrapper) {
            return $wrapper.data('settings') ?? null;
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
            return $wrapper.find('.' + calendarElements.containerView);
        }

        /**
         * Builds the user interface based on the current view type associated with the given wrapper element.
         *
         * @param {jQuery} $wrapper The jQuery wrapper element containing the view and container information for rendering.
         *
         * @return {void} This function does not return a value. It updates the DOM elements associated with the wrapper.
         */
        function buildByView($wrapper, triggerViewChanged = true) {
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
                if(triggerViewChanged) {
                    trigger($wrapper, 'view', view);
                }
            }

            fetchAppointments($wrapper);
        }

        function executeFunction(functionOrName, ...args) {
            if (functionOrName) {
                // Direct Function Reference
                if (typeof functionOrName === 'function') {
                    return functionOrName(...args);
                }

                // Check Function Name in String Format
                if (typeof functionOrName === 'string') {
                    let func = null;

                    // Step 1: Check the local context
                    try {
                        func = new Function(`return typeof ${functionOrName} === 'function' ? ${functionOrName} : undefined`)();
                    } catch (error) {
                        // Ignore mistakes and move on to the next step
                    }

                    // Step 2: Check in the global 'window' context
                    if (!func && typeof window !== 'undefined' && typeof window[functionOrName] === 'function') {
                        func = window[functionOrName];
                    }

                    // If the function is found, run it
                    if (typeof func === 'function') {
                        return func(...args);
                    }
                }
            }

            // Explicit return if nothing was executed
            return undefined;
        }

        /**
         * Fetches and processes appointments for a given wrapper element. The function retrieves
         * appointment data based on the selected view, date range, and additional search criteria and
         * then renders the appointments within the wrapper. It supports URL callbacks or string-based
         * AJAX requests for data retrieval.
         *
         * @param {jQuery} $wrapper - A jQuery object representing the wrapper element where appointments will be fetched and displayed.
         * @return {void} - This function does not return a value. It updates the DOM of the provided wrapper with the fetched appointments.
         */
        function fetchAppointments($wrapper) {
            // Prevent concurrent fetches for the same wrapper
            if ($wrapper.data('bsCalendarLoading')) {
                const settings = getSettings($wrapper);
                if (settings && settings.debug) {
                    log("fetchAppointments: already loading for wrapper, skipping duplicate call");
                }
                return;
            }
            // mark as loading
            $wrapper.data('bsCalendarLoading', true);

            // Clear previous data or states related to the wrapper
            methodClear($wrapper);

            // Retrieve settings specific to this wrapper
            const settings = getSettings($wrapper);
            let skipLoading = false;

            // Log debug information if debugging is enabled in settings
            if (settings && settings.debug) {
                try {
                    log('fetchAppointments called for wrapper:', $wrapper.attr('data-bs-calendar-id') || $wrapper.attr('id') || $wrapper);
                    // optional stack to see caller:
                    log('Stack:', (new Error()).stack.split('\n').slice(2, 8).join('\n'));
                } catch (e) {
                    // ignore
                }
            }

            // Declare variable for request data
            let requestData;
            // Determine whether the function is in search mode
            const inSearchMode = getSearchMode($wrapper);

            // Prepare data for the AJAX request
            if (!inSearchMode) {
                // Retrieve the current view type (e.g. day, week, month, year)
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
                skipLoading = $.bsCalendar.utils.isValueEmpty(search);
                requestData = {
                    ...getSearchPagination($wrapper), // Include pagination data
                    search: search // The search string, if provided
                };
            }

            // If queryParams is a function in settings, enrich the request data dynamically
            if (typeof settings.queryParams === "function") {
                if (settings.debug) {
                    log("Original requestData before queryParams:", requestData);
                }
                // call user-provided function
                const queryParams = settings.queryParams(requestData);

                // Defensive merge: verhindern, dass basic period-keys aus Versehen überschrieben werden
                const protectedKeys = new Set(["fromDate", "toDate", "year", "view"]);

                if (queryParams && typeof queryParams === "object") {
                    Object.keys(queryParams).forEach(key => {
                        if (protectedKeys.has(key)) {
                            // If debug is enabled, show what would have been overwritten
                            if (settings.debug) {
                                log(`queryParams tried to override protected key "${key}" -> ignored. value:`, queryParams[key]);
                            }
                            return; // skip protected keys
                        }
                        requestData[key] = queryParams[key];
                    });
                } else {
                    if (settings.debug) {
                        log("queryParams did not return an object, skipping merge:", queryParams);
                    }
                }

                if (settings.debug) {
                    log("Merged requestData after queryParams:", requestData);
                }
            }

            // If there is nothing to search (skipLoading is true), handle this case
            if (skipLoading) {
                if (settings.debug) {
                    log('Skip loading appointments because search is empty');
                }
                // Update the appointment list with an empty array and re-build the default view
                setAppointments($wrapper, []).then(_cleanedAppointments => {
                    trigger($wrapper, 'after-load', _cleanedAppointments);
                    void _cleanedAppointments;
                    buildAppointmentsForView($wrapper);
                }).finally(() => {
                    // clear loading flag
                    $wrapper.removeData('bsCalendarLoading');
                });
                return; // Exit the function
            }

            // Trigger a custom "beforeLoad" event before loading appointments
            trigger($wrapper, 'before-load', requestData);

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
                                trigger($wrapper, 'after-load', cleanedAppointments);
                                buildAppointmentsForSearch($wrapper, cleanedAppointments, appointments.total);
                            });
                        } else {
                            // In normal mode, process appointments and build the main view
                            setAppointments($wrapper, appointments).then(_cleanedAppointments => {
                                trigger($wrapper, 'after-load', _cleanedAppointments);
                                void _cleanedAppointments;
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
                        // remove loading flag
                        $wrapper.removeData('bsCalendarLoading');
                    });

            } else if (callAjax) {
                // If the URL is a string, manage the current request

                // Check if there's an ongoing request associated with the wrapper and abort it
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
                                trigger($wrapper, 'after-load', cleanedAppointments);
                                buildAppointmentsForSearch($wrapper, cleanedAppointments, response.total);
                            });
                        } else {
                            // In normal mode, handle the response and build the default view
                            setAppointments($wrapper, response).then(_cleanedAppointments => {
                                trigger($wrapper, 'after-load', _cleanedAppointments);
                                void _cleanedAppointments;
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
                        // remove loading flag
                        $wrapper.removeData('bsCalendarLoading');
                    }
                });

                // Save the newly initiated request in the wrapper's data for management
                $wrapper.data('currentRequest', newRequest);
            } else {
                // No callFunction and no callAjax -> nothing to load, remove loading flag
                $wrapper.removeData('bsCalendarLoading');
            }
        }

        /**
         * Groups overlapping appointments by weekdays, organizing them into columns or marking them as full-width,
         * based on their overlapping properties and visibility conditions for different views.
         *
         * @param {jQuery} $wrapper - The wrapper DOM element or container associated with the view.
         * @param {Array} appointments - An array of appointment objects. Each appointment is expected to include
         *                               scheduling and visibility details, such as date, time, and display properties.
         * @return {object} - An object where each key is a weekday (0-6, corresponding to Sunday-Saturday), and the value
         *                    is an object containing grouped appointments, their assigned columns, and full-width appointments.
         */
        function groupOverlappingAppointments($wrapper, appointments) {
            const groupedByWeekdays = {};
            const view = getView($wrapper);


            // 1. Group appointments after weekdays
            appointments.forEach((appointment) => {
                appointment.extras.displayDates.forEach((obj) => {
                    // Ignore appointments that are not visible in the weekly view
                    if (view === 'week' && !obj.visibleInWeek) {
                        return;
                    }

                    // Use explicit construction of date and time:
                    const slotStart = new Date(`${obj.date}T${obj.times.start}`);
                    const slotEnd = new Date(`${obj.date}T${obj.times.end}`);

                    // calculate the weekday correctly
                    const weekday = slotStart.getDay();

                    // initialize daily structure, if not yet available
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

            // 2. Create columns and Fullwidth
            Object.keys(groupedByWeekdays).forEach((day) => {
                const {appointments, columns, fullWidth} = groupedByWeekdays[day];

                // sort the dates by start time
                appointments.sort((a, b) => a.start - b.start);

                appointments.forEach((appointment) => {
                    let placedInColumn = false;

                    // Try to sort the appointment in existing columns
                    for (let column of columns) {
                        if (doesNotOverlap(column, appointment)) {
                            column.push(appointment);
                            placedInColumn = true;
                            break;
                        }
                    }

                    // If no suitable column has been found, check Fullwidth
                    if (!placedInColumn) {
                        const hasOverlap = appointments.some((otherAppointment) =>
                            otherAppointment !== appointment &&
                            !(appointment.start >= otherAppointment.end || appointment.end <= otherAppointment.start)
                        );

                        // `fullwidth`: only if no overlap and no columns are necessary
                        if (!hasOverlap && columns.length === 0) {
                            fullWidth.push(appointment);
                        } else {
                            // otherwise create a new column
                            columns.push([appointment]);
                        }
                    }
                });
            });

            return groupedByWeekdays;
        }

        /**
         * Determines whether a new appointment does not overlap with existing appointments in a column.
         *
         * @param {Array} column - An array of existing appointments, where each appointment has a `start` and `end` property representing its time range.
         * @param {Object} newAppointment - The new appointment to check, containing `start` and `end` properties representing its time range.
         * @return {boolean} Returns `true` if there is no overlap with any appointment in the column, otherwise `false`.
         */
        function doesNotOverlap(column, newAppointment) {
            for (const appointment of column) {
                if (!(newAppointment.start >= appointment.end || newAppointment.end <= appointment.start)) {
                    return false; // overlap
                }
            }
            return true; // no overlap
        }

        /**
         * Builds and displays a set of appointments for the specified day within a container.
         *
         * @param {jQuery} $wrapper - The wrapper element containing the calendar.
         * @param {Array} appointments - An array of appointment objects, each containing details such as start, end, title, and color.
         * @return {void} This function does not return a value. It renders appointments into the provided container.
         */
        function drawAppointmentsForDayOrWeek($wrapper, appointments) {
            const settings = getSettings($wrapper);
            const view = getView($wrapper);
            const $viewContainer = getViewContainer($wrapper);
            const allDays = appointments.filter(appointment => appointment.allDay === true);
            const notAllDays = appointments.filter(appointment => appointment.allDay !== true);

            if (settings.debug) {
                log('Call drawAppointmentsForDayOrWeek with view:', view);
                log("All-Day Appointments:", allDays);
                log("Not-All-Day Appointments:", notAllDays);
                log("All Appointments:", appointments);
            }

            // go through each allDays
            allDays.forEach(appointment => {
                if (settings.debug) {
                    log(">>>> All-Day Appointment displayDates:", appointment.extras.displayDates);
                }
                appointment.extras.displayDates.forEach((obj) => {
                    const fakeStart = new Date(obj.date);
                    const allDayWrapper = $viewContainer.find('[data-all-day="' + fakeStart.getDay() + '"][data-date-local="' + $.bsCalendar.utils.formatDateToDateString(fakeStart) + '"]');
                    if (allDayWrapper.length) {
                        allDayWrapper.addClass('pb-3');
                        // Copy the original and return the clean appointment with the calculated extras
                        const returnData = getAppointmentForReturn(appointment);

                        const appointmentElement = $('<span>', {
                            'data-appointment': true,
                            html: settings.formatter.allDay(returnData.appointment, returnData.extras, view),
                            class: `mx-1 mb-1 flex-fill`,
                        }).appendTo(allDayWrapper);
                        appointmentElement.data('appointment', appointment);
                    }
                });
            });

            const groupedAppointments = groupOverlappingAppointments($wrapper, notAllDays);

            const columnGap = 2; // distance between the columns in pixels

            Object.entries(groupedAppointments).forEach(([weekday, {columns, fullWidth}]) => {

                /** 1. Renders of the grouped dates in columns **/
                const totalColumns = columns.length; // calculate the number of columns

                columns.forEach((column, columnIndex) => {
                    column.forEach((slotData) => {

                        const appointment = slotData.appointment;

                        // check whether slotdata.start and slotdata.
                        const startDate = new Date(slotData.start);
                        const endDate = new Date(slotData.end);

                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                            console.warn(`Invalid date in Appointment: ${appointment?.title || 'unknown'}`);
                            return; // Überspringe das fehlerhafte Datum
                        }

                        // Formatierung des Startdatums für den richtigen Container
                        const targetDateLocal = $.bsCalendar.utils.formatDateToDateString(startDate);

                        // Search of the container based on weekdays and date
                        const $weekDayContainer = $viewContainer.find(
                            `[data-week-day="${weekday}"][data-date-local="${targetDateLocal}"]`
                        );

                        if (!$weekDayContainer.length) {
                            console.warn(
                                `Container für Weekday ${weekday} mit Datum ${targetDateLocal} nicht gefunden.`
                            );
                            return; // Überspringen, wenn kein passender Container gefunden wird
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
                            appointmentWidthPercent =
                                totalColumns > 1 ?
                                    (100 - (totalGap * 100 / $weekDayContainer.width())) / totalColumns :
                                    100;
                        }

                        const appointmentLeftPercent =
                            totalColumns > 1 ?
                                (columnIndex * (100 / totalColumns)) :
                                0;

                        const position = calculateSlotPosition(
                            $wrapper,
                            startDate.toISOString(),
                            endDate.toISOString()
                        );


                        // Copy the original and return the clean appointment with the calculated extras
                        const returnData = getAppointmentForReturn(appointment);

                        const appointmentContent = view === 'day' ?
                            settings.formatter.day(returnData.appointment, returnData.extras) :
                            settings.formatter.week(returnData.appointment, returnData.extras);

                        // Rendern des Termins
                        const appointmentElement = $('<div>', {
                            'data-appointment': true,
                            class: 'position-absolute overflow-hidden rounded',
                            css: {
                                top: `${position.top}px`,
                                height: `${position.height}px`,
                                left: `${appointmentLeftPercent}%`,
                                width: `${appointmentWidthPercent}%`,
                            },
                            html: appointmentContent,
                        }).appendTo($weekDayContainer);

                        appointmentElement.data('appointment', appointment);
                        setAppointmentStyles(appointmentElement, appointment.extras.colors);
                    });
                });

                /** 2. Renders of the isolated full width dates **/
                fullWidth.forEach((slotData) => {
                    const appointment = slotData.appointment;

                    const startDate = new Date(slotData.start);

                    // appointments that take the whole width
                    const appointmentWidthPercent = 100; // full width
                    const appointmentLeftPercent = 0; // no distance from the left

                    // default value for position
                    let position = {
                        top: 0,
                        height: 0
                    };

                    // validity check for the data
                    if (
                        slotData.start instanceof Date &&
                        !isNaN(slotData.start) &&
                        slotData.end instanceof Date &&
                        !isNaN(slotData.end)
                    ) {
                        position = calculateSlotPosition(
                            $wrapper,
                            slotData.start.toISOString(),
                            slotData.end.toISOString()
                        );
                    } else {
                        console.error("Invalid date detected:", slotData.start, slotData.end, appointment);
                    }

                    // formatting of the start date for the container
                    const targetDateLocal = $.bsCalendar.utils.formatDateToDateString(startDate);

                    // Search of the container based on the date and Weekday
                    const $weekDayContainer = $viewContainer.find(
                        `[data-week-day="${weekday}"][data-date-local="${targetDateLocal}"]`
                    );
                    if (!$weekDayContainer.length) {
                        console.warn(
                            `Full-Width-Container für Weekday ${weekday} mit Datum ${targetDateLocal} nicht gefunden.`
                        );
                        return; // skip when the container is missing
                    }

                    // Copy the original and return the clean appointment with the calculated extras
                    const returnData = getAppointmentForReturn(appointment);

                    const appointmentContent = view === 'day' ?
                        settings.formatter.day(returnData.appointment, returnData.extras) :
                        settings.formatter.week(returnData.appointment, returnData.extras);

                    // rendering the full-width date
                    const appointmentElement = $('<div>', {
                        'data-appointment': true,
                        class: 'position-absolute overflow-hidden rounded',
                        css: {
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            left: `${appointmentLeftPercent}%`,
                            width: `${appointmentWidthPercent}%`,
                        },
                        html: appointmentContent,
                    }).appendTo($weekDayContainer);

                    // add meta data and styling
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
                backgroundImage: colors.backgroundImage,
                color: colors.color
            });
        }

        /**
         * Builds the appointment list and updates the search results container and pagination
         * based on the given appointments and the current search criteria.
         *
         * @param {jQuery} $wrapper - The wrapper element that contains the search and related components.
         * @param {Array<Object>} appointments - The list of appointment objects retrieved based on the search criteria.
         * @param {number} total - The total number of appointments available that match the search criteria.
         * @return {void} This function does not return a value. It updates the DOM directly.
         */
        function buildAppointmentsForSearch($wrapper, appointments, total) {
            const $container = getViewContainer($wrapper).find('.wc-search-result-container');
            const settings = getSettings($wrapper);

            if (settings.debug) {
                log('Call buildAppointmentsForSearch with appointments:', appointments, total);
            }

            const input = getSearchElement($wrapper);
            const search = input.val().trim();

            // If there is no search term
            if ($.bsCalendar.utils.isValueEmpty(search)) {
                $container.html('<div class="d-flex p-5 align-items-center justify-content-center"></div>');
                input.appendTo($container.find('.d-flex'));
                input.focus();
                return;
            }

            // If there are no search results
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

            // add pagination above
            buildSearchPagination($container, page, totalPages, itemsPerPage, total);

            // term list
            const $appointmentContainer = $('<div>', {class: 'list-group list-group-flush mb-3'}).appendTo($container);

            visibleAppointments.forEach((appointment) => {
                const borderLeftColor = appointment.color || settings.defaultColor;
                const copy = getAppointmentForReturn(appointment)
                const html = settings.formatter.search(copy.appointment, copy.extras);

                const appointmentElement = $('<div>', {
                    'data-appointment': true,
                    class: 'list-group-item overflow-hidden p-0',
                    html: html,
                    css: {
                        cursor: 'pointer',
                        borderLeftColor: borderLeftColor,
                    },
                }).appendTo($appointmentContainer);

                appointmentElement.data('appointment', appointment);
            });

            // Add pagination below
            buildSearchPagination($container, page, totalPages, itemsPerPage, total);
        }

        /**
         * Builds a search pagination component within a specified container, allowing navigation
         * through multiple pages of search results.
         *
         * @param {jQuery} $container - The jQuery object representing the container where the pagination should be inserted.
         * @param {number} currentPage - The currently active page number.
         * @param {number} totalPages - The total number of pages available.
         * @param {number} itemsPerPage - The number of items displayed per page.
         * @param {number} total - The total number of search results.
         * @return {void} This function does not return a value, it modifies the DOM to append the pagination.
         */
        function buildSearchPagination($container, currentPage, totalPages, itemsPerPage, total) {

            if (totalPages <= 1) {
                return;
            }

            const $paginationWrapper = $('<div>', {
                class: 'd-flex align-items-center justify-content-between my-1 wc-search-pagination',
            }).appendTo($container);

            // Display of the search results (start - end | Total)
            const startIndexDisplay = (currentPage - 1) * itemsPerPage + 1;
            const endIndexDisplay = Math.min(currentPage * itemsPerPage, total);
            const statusText = `${startIndexDisplay}-${endIndexDisplay} | ${total}`;

            $('<div>', {
                class: 'alert alert-secondary me-4 py-2 px-4',
                text: statusText,
            }).appendTo($paginationWrapper);

            const $pagination = $('<nav>', {'aria-label': 'Page navigation'}).appendTo($paginationWrapper);
            const $paginationList = $('<ul>', {class: 'pagination mb-0'}).appendTo($pagination);

            // number of maximum numbers of pages on the left and right of the current page
            const maxAdjacentPages = 2;

            // Auxiliary function: Add sites
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

            // auxiliary function: drunk (`...`)
            const addEllipsis = () => {
                $('<li>', {
                    class: 'page-item disabled',
                }).append(
                    $('<span>', {class: 'page-link', text: '...'})
                ).appendTo($paginationList);
            };

            // 1. Always display the first page
            if (currentPage > maxAdjacentPages + 1) {
                addPage(1); // first page
                if (currentPage > maxAdjacentPages + 2) {
                    addEllipsis(); // truncate
                }
            }

            // 2nd left of the current page
            for (let i = Math.max(1, currentPage - maxAdjacentPages); i < currentPage; i++) {
                addPage(i);
            }

            // 3rd page
            addPage(currentPage);

            // 4. right from the current side
            for (let i = currentPage + 1; i <= Math.min(totalPages, currentPage + maxAdjacentPages); i++) {
                addPage(i);
            }

            // 5. Always show the last page
            if (currentPage < totalPages - maxAdjacentPages) {
                if (currentPage < totalPages - maxAdjacentPages - 1) {
                    addEllipsis(); // truncate
                }
                addPage(totalPages); // last page
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
                appointment.extras.displayDates.forEach(obj => {
                    const startString = obj.date

                    const dayContainer = $container.find(`[data-month-date="${startString}"] [data-role="day-wrapper"]`);

                    // Copy the original and return the clean appointment with the calculated extras
                    const returnData = getAppointmentForReturn(appointment);

                    const appointmentContent = settings.formatter.month(returnData.appointment, returnData.extras)

                    const appointmentElement = $('<small>', {
                        'data-appointment': true,
                        class: 'px-1 w-100 overflow-hidden mb-1 rounded',
                        css: {
                            minHeight: '18px',
                        },
                        html: appointmentContent
                    }).appendTo(dayContainer);

                    appointmentElement.data('appointment', appointment);
                    setAppointmentStyles(appointmentElement, appointment.extras.colors);
                })
            })
        }

        /**
         * Creates a deep copy of the given appointment object.
         *
         * @param {Object} appointment - The appointment object to be copied.
         * @return {Object} A deep copy of the given appointment object.
         */
        function copyAppointment(appointment) {
            return $.extend(true, {}, appointment);
        }

        /**
         * Processes an appointment object to separate its main content and extras.
         *
         * @param {Object} origin - The original appointment object containing the details and extras.
         * @return {Object} An object with two properties:
         * `appointment`, which contains the main appointment details, and
         * `extras` which contains the extra details separated from the original object.
         */
        function getAppointmentForReturn(origin) {
            const appointment = copyAppointment(origin);
            const extras = appointment.extras;
            delete appointment.extras;
            return {appointment: appointment, extras: extras}
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
            const now = new Date();

            if (view === 'year') {
                appointments.forEach(appointment => {
                    const date = new Date(appointment.date);
                    appointment.extras = {
                        colors: $.bsCalendar.utils.getColors(appointment.color || settings.defaultColor, settings.defaultColor),
                        isToday: date.toDateString() === now.toDateString(),
                        isNow: date.getFullYear() === now.getFullYear()
                    };
                });
            } else {
                appointments.forEach(appointment => {
                    const start = new Date(appointment.start);
                    const end = new Date(appointment.end);
                    const isAllDay = appointment.allDay;

                    let iconClass = !isAllDay ? settings.icons.appointment : settings.icons.appointmentAllDay;
                    if (appointment.hasOwnProperty('icon') && appointment.icon) {
                        iconClass = appointment.icon;
                    }
                    const extras = {
                        locale: settings.locale,
                        icon: iconClass,
                        colors: $.bsCalendar.utils.getColors(appointment.color, settings.defaultColor),
                        start: {
                            date: $.bsCalendar.utils.formatDateToDateString(appointment.start),
                            time: isAllDay ? '00:00:00' : $.bsCalendar.utils.formatTime(appointment.start)
                        },
                        end: {
                            date: $.bsCalendar.utils.formatDateToDateString(appointment.end),
                            time: isAllDay ? '23:59:59' : $.bsCalendar.utils.formatTime(appointment.end)
                        },
                        duration: {
                            days: 0,
                            hours: 0,
                            minutes: 0,
                            totalMinutes: 0,
                            totalSeconds: 0,
                            seconds: 0
                        },
                        displayDates: [],
                        allDay: isAllDay,
                        inADay: false,
                        isToday: start.toDateString() === now.toDateString(),
                        isNow: (start <= now && end >= now),
                    };

                    let tempDate = new Date(start);
                    let tempEnd = new Date(end);
                    tempDate.setHours(0, 0, 0, 0);
                    tempEnd.setHours(0, 0, 0, 0);

                    // Calculate monthly borders

                    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                    // Extension for full weekly display in the month
                    const firstDayOffset = settings.startWeekOnSunday ? 0 : 1; // Sunday or Monday
                    const monthStart = new Date(firstOfMonth);
                    monthStart.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() - firstDayOffset + 7) % 7)); // first day of the week displayed
                    const monthEnd = new Date(lastOfMonth);
                    monthEnd.setDate(lastOfMonth.getDate() + (6 - (lastOfMonth.getDay() - firstDayOffset + 7) % 7)); // last day of last week

                    while (tempDate <= tempEnd) {
                        const dateIsStart = $.bsCalendar.utils.datesAreEqual(tempDate, start);
                        const dateIsEnd = $.bsCalendar.utils.datesAreEqual(tempDate, end);

                        const dateDetails = {
                            date: $.bsCalendar.utils.formatDateToDateString(tempDate),
                            day: tempDate.getDay(),
                            times: {
                                start: null,
                                end: null
                            },
                            visibleInWeek: false,
                            visibleInMonth: false
                        };

                        if (isAllDay) {
                            dateDetails.times.start = null;
                            dateDetails.times.end = null;
                        } else {
                            if (dateIsStart) {
                                dateDetails.times.start = $.bsCalendar.utils.formatTime(start);
                                dateDetails.times.end = end > new Date(tempDate).setHours(23, 59, 59, 999) ?
                                    '23:59' :
                                    $.bsCalendar.utils.formatTime(end);
                            } else if (dateIsEnd) {
                                dateDetails.times.start = '00:00';
                                dateDetails.times.end = $.bsCalendar.utils.formatTime(end);
                            } else {
                                dateDetails.times.start = '00:00';
                                dateDetails.times.end = '23:59';
                            }
                        }

                        // Exam: Is there a temp date within the extended monthly display?
                        if (tempDate >= monthStart && tempDate <= monthEnd) {
                            dateDetails.visibleInMonth = true;
                        }

                        // Exam for a weekly display is already implemented
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

                    // check whether the appointment remains complete in one day
                    extras.inADay = extras.displayDates.length === 1;

                    // calculation the total duration of the appointment
                    const diffMillis = end - start;

                    // check whether it is a full-day appointment
                    if (appointment.allDay) {
                        // only take into account the calendar days, regardless of the time
                        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

                        // calculate difference in the past days
                        const diffDaysMillis = endDate - startDate;
                        extras.duration.days = Math.floor(diffDaysMillis / (24 * 3600 * 1000)) + 1; // +1 inkludiert den letzten Tag
                        extras.duration.hours = 0;
                        extras.duration.minutes = 0;
                        extras.duration.totalMinutes = Math.floor(diffMillis / (60 * 1000));
                        extras.duration.totalSeconds = Math.floor(diffMillis / 1000);
                        extras.duration.seconds = 0;
                    } else {
                        // normal calculation for hourly-based appointments
                        const totalSeconds = Math.floor(diffMillis / 1000);
                        extras.duration.days = Math.floor(totalSeconds / (24 * 3600));
                        extras.duration.hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
                        extras.duration.minutes = Math.floor((totalSeconds % 3600) / 60);
                        extras.duration.totalSeconds = totalSeconds;
                        extras.duration.totalMinutes = Math.round(totalSeconds / 60);
                        extras.duration.seconds = totalSeconds % 60;
                    }

                    // durated duration, if desired
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

            const view = getView($wrapper);
            const container = getViewContainer($wrapper);
            if (settings.debug) {
                log('Call renderData with view:', view);
            }

            switch (view) {
                case 'day':
                case 'week':
                    drawAppointmentsForDayOrWeek($wrapper, appointments);
                    break;
                case 'month':
                    drawAppointmentsForMonth($wrapper, appointments);
                    break;
                case 'year':
                    drawAppointmentsForYear($wrapper, appointments);
                    break;
            }
            if (!isSearchMode) {
                loadHolidays($wrapper);
            }

            container.find('[data-appointment]').css('cursor', 'pointer');
        }

        /**
         * Loads and displays holidays on a given calendar wrapper element for a specific period.
         *
         * @param {jQuery} $wrapper - The calendar wrapper element where holidays should be displayed.
         * @return {void} This function does not return a value. It fetches and renders holidays on the given wrapper element.
         */
        function loadHolidays($wrapper) {
            // Reentrancy-Guard: verhindert doppeltes Laden innerhalb eines Build-Zyklus
            if ($wrapper.data('holidaysLoading')) {
                return;
            }
            $wrapper.data('holidaysLoading', true);

            const settings = getSettings($wrapper);
            const period = getStartAndEndDateByView($wrapper);
            const locale = $.bsCalendar.utils.getLanguageAndCountry(settings.locale);

            if (typeof settings.holidays === 'object' && !$.bsCalendar.utils.isValueEmpty(settings.holidays)) {
                let countryIsoCode;
                let languageIsoCode;
                let federalState = null;

                if (settings.holidays.hasOwnProperty('country') && !$.bsCalendar.utils.isValueEmpty(settings.holidays.country)) {
                    countryIsoCode = settings.holidays.country.toUpperCase();
                } else {
                    countryIsoCode = locale.country;
                }

                if (settings.holidays.hasOwnProperty('language') && !$.bsCalendar.utils.isValueEmpty(settings.holidays.language)) {
                    languageIsoCode = settings.holidays.language.toUpperCase();
                } else {
                    languageIsoCode = locale.language;
                }

                if (settings.holidays.hasOwnProperty('federalState') && !$.bsCalendar.utils.isValueEmpty(settings.holidays.federalState)) {
                    federalState = settings.holidays.federalState.toUpperCase();
                }

                if (settings.debug) {
                    log('Load public holidays with params:', {
                        country: countryIsoCode,
                        language: languageIsoCode,
                        period: period,
                        federalState: federalState
                    });
                }

                const promises = [];

                // Public holidays
                promises.push(
                    $.bsCalendar.utils.openHolidayApi.getPublicHolidays(
                        countryIsoCode, federalState, languageIsoCode, period.start, period.end
                    ).then(response => {
                        if (settings.debug) {
                            log('Received public holidays:', response);
                        }
                        return response.map(holiday => ({
                            startDate: holiday.startDate,
                            endDate: holiday.endDate,
                            title: holiday.name[0]?.text
                        }));
                    })
                );

                // School holidays (optional)
                if (federalState !== null) {
                    if (settings.debug) {
                        log('Load school holidays with params:', {
                            country: countryIsoCode,
                            language: languageIsoCode,
                            period: period,
                            federalState: federalState
                        });
                    }
                    promises.push(
                        $.bsCalendar.utils.openHolidayApi.getSchoolHolidays(
                            countryIsoCode, federalState, period.start, period.end
                        ).then(response => {
                            if (settings.debug) {
                                log('Received school holidays:', response);
                            }
                            return response.map(holiday => ({
                                startDate: holiday.startDate,
                                endDate: holiday.endDate,
                                title: holiday.name[0]?.text
                            }));
                        })
                    );
                }

                Promise.all(promises)
                    .then(results => {
                        // flatten
                        const all = [].concat.apply([], results);

                        // dedupe nach (startDate|endDate|title)
                        const seen = new Set();
                        const unique = all.filter(h => {
                            const key = [h.startDate, h.endDate, h.title].join('|');
                            if (seen.has(key)) return false;
                            seen.add(key);
                            return true;
                        });

                        if (settings.debug) {
                            log('Draw unique holidays:', unique);
                        }
                        drawHolidays($wrapper, unique);
                    })
                    .finally(() => {
                        $wrapper.removeData('holidaysLoading');
                    });

            } else if (typeof settings.holidays === 'function') {
                if (settings.debug) {
                    log('Load custom function holidays with params:', {
                        start: period.start,
                        end: period.end,
                        country: locale.country,
                        language: locale.language,
                        federalState: federalState
                    });
                    log('Make sure a promise is returned!');
                }
                Promise.resolve(
                    settings.holidays(period.start, period.end, locale.country, locale.language, federalState)
                )
                    .then(holidays => {
                        if (settings.debug) {
                            log('Received custom holidays:', holidays);
                        }
                        drawHolidays($wrapper, holidays);
                    })
                    .finally(() => {
                        $wrapper.removeData('holidaysLoading');
                    });
            } else {
                // nichts zu laden → Flag aufräumen
                $wrapper.removeData('holidaysLoading');
            }
        }

        /**
         * Draw holidays on the calendar based on the current view and a list of holiday objects.
         *
         * @param {jQuery} $wrapper - The main wrapper element for the calendar.
         * @param {Array} holidays - Array of holiday objects with the following structure:
         *                          {
         *                              startDate: string (ISO date format, e.g. "2023-11-25"),
         *                              endDate: string (ISO date format, e.g. "2023-11-27"),
         *                              title: string (e.g. "Christmas"),
         *                              global: boolean (indicates if the holiday is global),
         *                              fixed: boolean (indicates if the holiday is fixed every year)
         *                          }
         */
        function drawHolidays($wrapper, holidays) {
            // Get the current view of the calendar (e.g. "day", "week", "month")
            const settings = getSettings($wrapper);
            const view = getView($wrapper);
            const isDayOrWeek = view === 'day' || view === 'week';
            const isMonth = view === 'month';
            const isYear = view === 'year';
            // Get the container element for the current calendar view
            const $viewContainer = getViewContainer($wrapper);
            // Iterate through each holiday object
            holidays.forEach(holiday => {
                if (settings.debug) {
                    log('Draw holiday:', holiday);
                }
                // Parse the start and end dates of the holiday
                const startDate = new Date(holiday.startDate);
                const endDate = new Date(holiday.endDate);

                // Loop through each date from startDate to endDate
                for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                    // Format the current date as "YYYY-MM-DD" (ISO string without time part)
                    const formattedDate = date.toISOString().split('T')[0];
                    let container;


                    // Select the appropriate container depending on the current calendar view
                    if (isDayOrWeek) {
                        // For "day" and "week" views, match elements by weekday and date
                        container = $viewContainer.find(
                            `[data-all-day="${date.getDay()}"][data-date-local="${formattedDate}"]`
                        );
                    } else if (isMonth) {
                        // For the "month" view, match elements by date
                        container = $viewContainer.find(
                            `[data-month-date="${formattedDate}"] [data-role="day-wrapper"]`
                        );
                    } else if (isYear) {
                        container = $viewContainer.find(`[data-date="${formattedDate}"]`);
                    }

                    // Add the holiday element to the container if it exists
                    if (container?.length) {
                        if (!isYear) {
                            // build a wrapper for a holiday element
                            if (container.is(':empty') && (view === 'day' || view === 'week')) {
                                container.addClass('pb-3');
                            }
                            const $holidayWrapper = $('<small>', {
                                'data-role': 'holiday',
                                class: 'px-1  overflow-hidden mb-1 rounded w-100',
                            }).prependTo(container);
                            $(settings.formatter.holiday(holiday, view)).appendTo($holidayWrapper);
                        } else {
                            container.addClass('text-primary');
                            container.attr('data-role', 'holiday');
                            container.tooltip({
                                title: holiday.title,
                                container: $wrapper
                            });
                        }
                    }
                }
            });
        }

        /**
         * Renders and displays appointments for an entire year by updating the DOM with appointment details.
         *
         * @param {jQuery} $wrapper - A jQuery wrapper object representing the main container where appointments will be drawn.
         * @param {Array<Object>} appointments - An array of appointment objects, where each object contains details like date, total, and extra styling information.
         * @return {void} This function does not return any value.
         */
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
            hideBSCalendarLoader($wrapper);
            const spinner = $wrapper.find('.wc-calendar-spinner');
            spinner.show();
        }

        /**
         * Hides the loading spinner within the specified wrapper element.
         *
         * @param {jQuery} $wrapper - The jQuery object representing the wrapper element that contains the loading spinner.
         * @return {void} This function does not return a value.
         */
        function hideBSCalendarLoader($wrapper) {
            const spinner = $wrapper.find('.wc-calendar-spinner');
            spinner.hide();
        }

        /**
         * Calculates the start and end dates based on the provided view type and a given date context.
         *
         * @param {jQuery} $wrapper - A wrapper element or object providing context for getting
         *                            settings, date, and view type.
         * @return {Object} An object containing the following properties:
         *                  - `date`: The original date in ISO string format (yyyy-mm-dd).
         *                  - `start`: The calculated start date in ISO string format (yyyy-mm-dd) based on the view.
         *                  - `end`: The calculated end date in ISO string format (yyyy-mm-dd) based on the view.
         */
        function getStartAndEndDateByView($wrapper) {
            const settings = getSettings($wrapper);

            // Use a clone of the stored date to avoid accidental external mutation
            const rawDate = getDate($wrapper);
            const date = rawDate instanceof Date ? new Date(rawDate.getTime()) : new Date(rawDate);

            const view = getView($wrapper);

            // Work on copies to avoid accidental mutation of the stored date
            const startDate = new Date(date.getTime());
            const endDate = new Date(date.getTime());

            switch (view) {
                case "day":
                    // nothing to change
                    break;
                case "week": {
                    const dayOfWeek = startDate.getDay();
                    // If startWeekOnSunday -> offset relative to Sunday, otherwise Monday-based week: compute offset to Monday (Sunday -> -6)
                    const diffToMonday = settings.startWeekOnSunday ? dayOfWeek : (dayOfWeek === 0 ? -6 : 1 - dayOfWeek);
                    startDate.setDate(startDate.getDate() + diffToMonday);

                    // BUGFIX: endDate must be derived from startDate, not from the original date's month/day.
                    // Former code: endDate.setDate(startDate.getDate() + 6);
                    // That produced wrong month-rollover when startDate moved into previous month.
                    const newEnd = new Date(startDate.getTime());
                    newEnd.setDate(startDate.getDate() + 6);
                    // replace endDate with the properly computed value
                    endDate.setTime(newEnd.getTime());

                    if (settings.debug) {
                        log("getStartAndEndDateByView (week) computed:", {
                            viewDate: $.bsCalendar.utils.formatDateToDateString(date),
                            start: $.bsCalendar.utils.formatDateToDateString(startDate),
                            end: $.bsCalendar.utils.formatDateToDateString(endDate),
                            startWeekOnSunday: settings.startWeekOnSunday
                        });
                    }
                    break;
                }
                case "month": {
                    startDate.setDate(1);
                    const startDayOfWeek = startDate.getDay();
                    if (settings.startWeekOnSunday) {
                        startDate.setDate(startDate.getDate() - startDayOfWeek);
                    } else {
                        const offset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
                        startDate.setDate(startDate.getDate() - offset);
                    }

                    endDate.setMonth(endDate.getMonth() + 1);
                    endDate.setDate(0);
                    const endDayOfWeek = endDate.getDay();
                    if (settings.startWeekOnSunday) {
                        const offset = 6 - endDayOfWeek;
                        endDate.setDate(endDate.getDate() + offset);
                    } else {
                        const offset = endDayOfWeek === 0 ? -1 : 7 - endDayOfWeek;
                        endDate.setDate(endDate.getDate() + offset);
                    }
                    break;
                }
                case "year":
                case "search":
                    startDate.setMonth(0);
                    startDate.setDate(1);
                    endDate.setMonth(11);
                    endDate.setDate(31);
                    break;
                default:
                    if (settings.debug) {
                        console.error("Unknown view:", view);
                    }
                    break;
            }

            return {
                date: $.bsCalendar.utils.formatDateToDateString(date),
                start: $.bsCalendar.utils.formatDateToDateString(startDate),
                end: $.bsCalendar.utils.formatDateToDateString(endDate)
            };
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
         * Builds the search view by creating and appending the necessary DOM elements
         * to the wrapper's container. It initializes the container, configures its
         * structure, and attaches the search result container.
         *
         * @param {jQuery} $wrapper - The jQuery wrapped DOM element acting as the main wrapper for the search view.
         * @return {void} This function does not return a value.
         */
        function buildSearchView($wrapper) {
            const container = getViewContainer($wrapper);
            // Empty the container and generate a new structure
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
            const weekDays = $.bsCalendar.utils.getShortWeekDayNames(locale, startWeekOnSunday);

            // Tage rendern
            let currentDate = new Date(calendarStart);
            let isFirstRow = true; // Prüft, ob es die erste Zeile ist

            while (currentDate <= calendarEnd) {
                const weekRow = $('<div>', {
                    class: 'row border-top d-flex flex-nowrap flex-fill wc-calendar-content',
                });

                // Kalenderwoche berechnen und hinzufügen
                const calendarWeek = $.bsCalendar.utils.getCalendarWeek(currentDate);
                const paddingTop = isFirstRow ? '1.75rem' : '.75rem';
                const weekRowCss = [
                    `padding-top:` + paddingTop,
                    'font-size: 12px',
                    'width: 24px',
                    'max-width: 24px',
                    'min-width: 24px'
                ].join(';');
                weekRow.append(
                    $('<div>', {
                        class: `col px-1 d-flex align-items-start pt-${paddingTop} fw-bold justify-content-center bg-body-tertiary`,
                        style: weekRowCss,
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
                        const dayColors = $.bsCalendar.utils.getColors('primary gradient', null);
                        dayCss.push(`background-color: ${dayColors.backgroundColor}`);
                        dayCss.push(`background-image: ${dayColors.backgroundImage}`);
                        dayCss.push(`color: ${dayColors.color}`);
                    }

                    // Berechne Border-Klassen basierend auf der Position der Zelle
                    const isLastRow = currentDate.getTime() === calendarEnd.getTime(); // Prüft genau, ob wir beim letzten Datum des Kalenders sind

                    const isLastColumn = i === 6;
                    let borderClasses = [];
                    if (isLastRow) {
                        borderClasses.push('border-bottom');
                    }
                    borderClasses.push('border-start');
                    if (isLastColumn) {
                        borderClasses.push('border-end ');
                    }

                    // Wenn es die erste Zeile ist, Wochentagsnamen hinzufügen
                    const dayWrapper = $('<div>', {
                        'data-month-date': $.bsCalendar.utils.formatDateToDateString(currentDate),
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
                        'data-date': $.bsCalendar.utils.formatDateToDateString(currentDate),
                        class: `text-center my-1`,
                        style: dayCss.join(';'),
                        text: currentDate.getDate(),
                    }).appendTo(dayWrapper);


                    // inner wrapper
                    $('<div>', {
                        class: 'd-flex flex-column w-100 h-100',
                        'data-role': 'day-wrapper',
                        css: {
                            overflowY: 'auto',
                        }
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
         * Handles the resizing logic for a calendar or UI container, adjusting element heights and visibility as needed.
         *
         * @param {jQuery} $wrapper - The jQuery-wrapped DOM element that serves as the main container of the calendar or UI.
         * @param {boolean} [handleSidebar=false] - Flag indicating whether to handle sidebar visibility during resize.
         * @return {void} This function does not return any value.
         */
        function onResize($wrapper, handleSidebar = false) {
            const view = getView($wrapper);
            const windowWidth = $(window).width();
            const lgBreakPoint = 992;
            const calendarContainer = getViewContainer($wrapper);

            if (handleSidebar) {
                handleSidebarVisibility($wrapper, windowWidth < lgBreakPoint, windowWidth >= lgBreakPoint);
            }


            if (view === 'month') {

                const dayElements = calendarContainer.find('[data-month-date]');

                // calculate the height of a day
                let squareSize = 0;
                dayElements.each(function () {
                    const width = $(this).outerWidth(); // width of the element
                    $(this).css('height', `${width}px`); // set height
                    squareSize = width; // save the height for the later calculation
                });

                // set dynamic container height
                const rowCount = Math.ceil(dayElements.length / 7); // Anzahl der Zeilen
                const totalHeight = rowCount * squareSize; // Gesamthöhe berechnen
                calendarContainer.css('height', `${totalHeight}px`);
            } else {
                calendarContainer.css('height', '');
            }

        }

        /**
         * Builds a small monthly view calendar inside the specified container element.
         *
         * @param {jQuery} $wrapper The wrapper element containing the necessary settings and active date.
         * @param {Date} forDate The date for which the monthly view should be generated.
         * @param {jQuery} $container The container element where the small month view will be rendered.
         * @param {boolean} [forYearView=false] Indicates if the calendar is being built as part of a year view, which adjusts styles accordingly.
         * @return {void} Does not return a value; renders the small view calendar into the specified container.
         */
        function buildMonthSmallView($wrapper, forDate, $container, forYearView = false) {
            // Get container for a miniature view

            const settings = getSettings($wrapper);
            const date = forDate; // Aktuelles Datum
            const activeDate = getDate($wrapper);

            const cellSize = forYearView ? 36 : 28;
            const fontSize = forYearView ? 12 : 10;
            const weekRowWidth = 20;
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
            $container.css('overflow', 'visible');
            $container.addClass('table-responsive');

            const table = $('<table>', {
                class: 'wc-mini-calendar',
                css: {
                    width: `${cellSize * 7 + 20}px`,
                    fontSize: fontSize + 'px',
                    borderSpacing: '0',
                    borderCollapse: 'collapse',
                    tableLayout: 'fixed',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    lineHeight: cellSize + 'px',
                    padding: '0',
                    margin: '0',
                    backgroundColor: 'transparent',
                    border: '0',
                },
            }).appendTo($container);

            // Create a header for weekdays
            const thead = $('<thead>').appendTo(table);
            const weekdaysRow = $('<tr>', {
                class: '',
                css: {
                    height: `${cellSize}px`
                }
            }).appendTo(thead);

            // First column (CW)
            $('<th>', {
                class: '',
                css: {width: weekRowWidth + 'px', height: cellSize + 'px'},
                text: ''
            }).appendTo(weekdaysRow);

            // Add weekly days (Mon, Tue, Wed, ...)
            const weekDays = $.bsCalendar.utils.getShortWeekDayNames(settings.locale, settings.startWeekOnSunday);
            weekDays.forEach(day => {
                $('<th>', {
                    class: '',
                    text: day,
                    css: {width: `${cellSize}px`, height: cellSize + 'px'}
                }).appendTo(weekdaysRow);
            });

            // create the content of the calendar
            const tbody = $('<tbody>').appendTo(table);
            let currentDate = new Date(calendarStart);
            const defaultColor = 'primary gradient';
            const defaultColors = $.bsCalendar.utils.getColors(defaultColor, null);
            while (currentDate <= calendarEnd) {
                const weekRow = $('<tr>', {
                    css: {
                        fontSize: `${fontSize}px`,
                    }
                }).appendTo(tbody);

                // calculate calendar week
                const calendarWeek = $.bsCalendar.utils.getCalendarWeek(currentDate);
                const weekRowCss = [
                    `font-size: ${fontSize}px`,
                    `width: ${weekRowWidth}px`,
                    `height: ${cellSize}px`,
                ].join(';');
                $('<td>', {
                    style: weekRowCss,
                    class: 'px-1 text-center bg-body-tertiary',
                    text: calendarWeek,
                }).appendTo(weekRow); // insert cw into the first column of the line


                // days of the week (Mon-Sun) add
                for (let i = 0; i < 7; i++) {
                    const isToday = currentDate.toDateString() === new Date().toDateString();
                    const isOtherMonth = currentDate.getMonth() !== month;
                    const isSelected = currentDate.toDateString() === activeDate.toDateString();
                    const dayStyleArray = [];
                    let dayClass = '';
                    if (isToday) {
                        dayStyleArray.push('background-color: ' + defaultColors.backgroundColor);
                        dayStyleArray.push('background-image: ' + defaultColors.backgroundImage);
                        dayStyleArray.push('color: ' + defaultColors.color);
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
                            'z-index: 1'
                        ].join(';');

                        badge = `<span class="js-badge badge position-absolute start-50 top-100 rounded-pill translate-middle" style="${combinedCss}"></span>`;
                    }

                    const tdContent = [`<div style="${dayStyleArray.join(';')}" class="${dayClass} rounded-circle w-100 h-100 d-flex justify-content-center flex-column align-items-center">`,
                        `<span>${currentDate.getDate()}</span>`,
                        badge,
                        `</div>`
                    ].join('')

                    $('<td>', {
                        'data-date': $.bsCalendar.utils.formatDateToDateString(currentDate),
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
            // Get the view container and empty its content
            const $container = getViewContainer($wrapper).empty();

            // Retrieve the current date from the wrapper
            const date = getDate($wrapper);

            // Create the headline for the day's header
            const headline = $('<div>', {
                class: 'wc-day-header mb-2 ms-5',
                css: {
                    paddingLeft: '40px'
                },
                html: buildHeaderForDay($wrapper, date, false)
            }).appendTo($container);

            // Set data attributes for the headline and change the cursor to a pointer
            headline.attr('data-date', $.bsCalendar.utils.formatDateToDateString(date)).css('cursor', 'pointer');

            // Append a div for all-day events or metadata
            $('<div>', {
                'data-all-day': date.getDay(),
                'data-date-local': $.bsCalendar.utils.formatDateToDateString(date),
                class: 'mx-5',
                css: {
                    paddingLeft: '40px'
                }
            }).appendTo($container);

            // Build the main content for the day view
            buildDayViewContent($wrapper, date, $container);
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
                class: 'position-relative px-1 px-lg-5'
            }).appendTo($viewContainer);

            const date = getDate($wrapper);
            const settings = getSettings($wrapper);
            const {startWeekOnSunday} = settings;
            const currentDay = date.getDay();
            const startOfWeek = new Date(date);
            const startOffset = startWeekOnSunday ? currentDay : currentDay === 0 ? 6 : currentDay - 1;
            startOfWeek.setDate(date.getDate() - startOffset);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

// DEBUG: Ausgabe des berechneten Wochenbereichs
            if (settings.debug) {
                console.log(`bsCalendar DEBUG: buildWeekView - viewDate=${$.bsCalendar.utils.formatDateToDateString(date)}, startOfWeek=${$.bsCalendar.utils.formatDateToDateString(startOfWeek)}, endOfWeek=${$.bsCalendar.utils.formatDateToDateString(endOfWeek)}, startWeekOnSunday=${startWeekOnSunday}`);
            }

            const wrappAllDay = $("<div>", {
                class: "d-flex flex-nowrap flex-fill w-100",
                css: {paddingLeft: "40px"}
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
                headline.attr('data-date', $.bsCalendar.utils.formatDateToDateString(currentDate)).css('cursor', 'pointer');
                $('<div>', {
                    'data-all-day': currentDate.getDay(),
                    'data-date-local': $.bsCalendar.utils.formatDateToDateString(currentDate),
                    class: 'd-flex flex-column align-items-stretch flex-fill w-100',
                }).appendTo(col);
            }
            ////////

            // Create a weekly view as a flexible layout
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
                    'data-date-local': $.bsCalendar.utils.formatDateToDateString(currentDate),
                    class: 'wc-day-week-view flex-grow-1 flex-fill border-end position-relative',
                    css: {
                        width: (100 / 7) + '%' // Fixe Breite für 7 Spalten
                    }
                }).appendTo(weekContainer);


                // labels are only displayed in the first container (the 1st column)
                const showLabels = day === 0;

                buildDayViewContent($wrapper, currentDate, dayContainer, true, showLabels);
            }
        }

        /**
         * Builds an HTML header representation for a specific day.
         *
         * @param {jQuery} $wrapper - The HTML element container for settings and configuration.
         * @param {Date} date - The date object representing the specific day to build the header for.
         * @param {boolean} [forWeekView=false] - Whether the header is being built for a week view context (default is false).
         * @return {string} The constructed HTML string representing the day's header.
         */
        function buildHeaderForDay($wrapper, date, forWeekView = false) {
            const settings = getSettings($wrapper);
            const day = date.toLocaleDateString(settings.locale, {day: 'numeric'})
            const shortWeekday = date.toLocaleDateString(settings.locale, {weekday: 'short'});
            const justify = forWeekView ? 'center' : 'start';
            const isToday = date.toDateString() === new Date().toDateString();
            const todayColor = isToday ? 'text-primary' : '';
            const colors = $.bsCalendar.utils.getColors('primary gradient', null);
            const circleCss = [
                'width: 44px',
                'height: 44px',
                'line-height: 44px',
            ];
            const circleClasses = [];
            if (isToday) {
                circleClasses.push('rounded-circle');
                circleCss.push(`background-color: ${colors.backgroundColor}`);
                circleCss.push(`background-image: ${colors.backgroundImage}`);
                circleCss.push(`color: ${colors.color}`);
            }
            return [
                `<div class="d-flex flex-column justify-content-center  w-100 p-2 align-items-${justify} ${todayColor}">`,
                `<div class="d-flex justify-content-center" style="width: 44px"><small>${shortWeekday}</small></div>`,
                `<span style="${circleCss.join(';')}" class="h4 m-0 text-center ${circleClasses.join(' ')}">${day} </span>`,
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
                    class: 'position-relative px-1 px-lg-5',
                }).appendTo($container);

                $container = $('<div>', {
                    css: {paddingLeft: '40px'}
                }).appendTo($container);
            }

            $container.attr('data-weekday');
            $container.css('boxSizing', 'border-box');

            // Container for time slots. Here we need a match for the day of the week and the date
            const timeSlots = $('<div>', {
                "data-week-day": date.getDay(),
                "data-date-local": $.bsCalendar.utils.formatDateToDateString(date),
                class: 'wc-day-view-time-slots d-flex flex-column position-relative'
            }).appendTo($container);

            // present hours (from 0 to 23) with a horizontal line
            for (let hour = settings.hourSlots.start; hour <= settings.hourSlots.end; hour++) {
                const isLast = hour === settings.hourSlots.end;
                // line container for the hour
                // Add heading about the daily view
                const height = isLast ? 0 : settings.hourSlots.height;
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

                row.data('details', {
                    hour: hour,
                    date: date,
                    isToday: isToday,
                    isLast: isLast
                });

                if (showLabels) {
                    const combinedCss = [
                        'left: -34px'
                    ].join(';');

                    const hourDate = new Date(2023, 0, 1, hour); // 2023-01-01, Stunde = hour

                    $('<div>', {
                        class: 'wc-time-label ps-2 position-absolute top-0 translate-middle',
                        style: combinedCss,
                        html: $.bsCalendar.utils.formatTime(hourDate, false)
                    }).appendTo(row);
                }
            }

            if (isToday) {
                addCurrentTimeIndicator($wrapper, timeSlots)
            }
        }

        /**
         * Adds a current time indicator to the provided container, displaying the current time
         * and updating its position every minute dynamically.
         *
         * @param {jQuery} $wrapper - The wrapper element, serving as the parent container for the calendar.
         * @param {jQuery} $container - The target container element where the current time indicator will be placed.
         * @return {void} - This function does not return a value.
         */
        function addCurrentTimeIndicator($wrapper, $container) {

            // Helper functions to dynamically retrieve the current time as a Date object.
            const getDynamicNow = () => new Date();

            // Retrieve settings dynamically for the calendar (e.g., hour slots, start/end times).
            const settings = getSettings($wrapper);
            if (settings === null) {
                return; // Exit early if no settings are found for the calendar.
            }

            // Extract the `hourSlots` settings from the dynamic settings object.
            const {hourSlots} = settings; // `hourSlots` contains the start, end, and height of hourly slots.

            /**
             * Calculates the position of the current time indicator based on the current system time.
             * The position is calculated relative to the hour slots in the container.
             *
             * @return {Object} - An object containing `top` and `bottom` properties for positioning.
             */
            const calculatePosition = () => {
                const now = getDynamicNow(); // Fetch the current time.
                const currentHour = now.getHours() + now.getMinutes() / 60; // Convert current time to decimal format.

                // Determine the position of the time indicator based on calendar hour slots.
                if (currentHour < hourSlots.start) {
                    return {top: 0, bottom: ""}; // Time is earlier than the calendar start time.
                } else if (currentHour >= hourSlots.end) {
                    return {top: "", bottom: 0}; // Time is later than the calendar end time.
                } else {
                    return {top: calculateSlotPosition($wrapper, now).top, bottom: ""}; // Time is within the hour slot range.
                }
            };

            // Calculate the initial position for the current time indicator when it is first created.
            const position = calculatePosition();

            /**
             * Create the main time indicator as a horizontal line to visualize the current time.
             * This line is styled as a red indicator and appended to the target container.
             */
            const currentTimeIndicator = $('<div>', {
                class: 'current-time-indicator position-absolute bg-danger', // Add CSS classes for styling.
                css: {
                    boxSizing: 'border-box', // Ensure consistent box sizing.
                    height: '1px',           // Indicator height is 1 px (horizontal line).
                    width: '100%',           // Full width of the container.
                    zIndex: 10,              // Ensure the element is rendered on top.
                    ...position,             // Apply the calculated top/bottom position.
                }
            }).appendTo($container); // Append the indicator to the container element.

            // Dynamically fetch the background and font colors for the badge based on a "danger gradient" theme.
            const badgeColor = $.bsCalendar.utils.getColors('danger gradient', null);

            /**
             * Combine multiple CSS rules for the time badge (small text label).
             * This small badge will display the current time in a readable format (e.g., HH:mm).
             */
            const combinedCss = [
                'background-color: ' + badgeColor.backgroundColor, // Set the computed background color.
                'background-image: ' + badgeColor.backgroundImage, // Set the computed gradient.
                'color: ' + badgeColor.color,        // Set the computed font color.
            ].join(';'); // Combine the rules into a single CSS string.

            /**
             * Create and append a small badge to the time indicator.
             * This badge displays the current time in hours and minutes dynamically.
             */
            $(`<small class="position-absolute badge js-current-time top-0 start-0 translate-middle" style="${combinedCss}">` +
                $.bsCalendar.utils.formatTime(getDynamicNow(), false) +
                '</small>').appendTo(currentTimeIndicator);

            /**
             * Combine CSS rules with the circle indicator (a small red dot).
             * This is an additional visual marker for showing the exact current time.
             */
            const combinedCss2 = [
                'width: 10px',                        // Circle width.
                'height: 10px',                       // Circle height.
            ].join(';'); // Combine the rules into a single CSS string.

            /**
             * Create and append a small circular marker to the time indicator.
             * This marker visually represents the current time.
             */
            $(`<div class="position-absolute bg-danger start-100 top-50 rounded-circle translate-middle" style="${combinedCss2}"></div>`)
                .appendTo(currentTimeIndicator);

            /**
             * Function to dynamically update the time indicator's position and badge text.
             * Called periodically by the interval function.
             */
            const updateIndicator = () => {
                const now = getDynamicNow(); // Get the current time dynamically.
                const newPosition = calculatePosition(); // Recalculate the top/bottom position.
                currentTimeIndicator.css(newPosition); // Apply the new position to the indicator.
                currentTimeIndicator.find('.js-current-time').text($.bsCalendar.utils.formatTime(now, false)); // Update the badge text with the current time.
            };

            /**
             * Interval function to update the time indicator every minute.
             * Stops automatically if the wrapper or time indicator is removed from the DOM.
             */
            const intervalId = setInterval(() => {
                const isWrapperInDOM = $wrapper.closest('body').length > 0; // Check if the wrapper is still in the DOM.
                const hasTimeIndicator = $wrapper.find('.current-time-indicator').length > 0; // Check if the indicator exists.

                if (!isWrapperInDOM || !hasTimeIndicator) {
                    clearInterval(intervalId); // Stop the interval if the wrapper or indicator is not found.
                    return;
                }

                updateIndicator(); // Update the time indicator and badge text.
            }, 60 * 1000); // Repeat every minute (60,000 ms).

            // Immediately update the indicator's position and badge text on initialization.
            updateIndicator();
        }

        /**
         * Calculates the top position and height of a time slot based on the provided start and (optional) end times.
         * This is used to visually map events or time slots in a calendar-like view.
         *
         * @param {jQuery} $wrapper - The wrapper element containing the relevant settings for the calendar.
         * @param {Date|string} startDate - The start date and time of the time slot. Can be a Date object or a string representation of a date.
         * @param {Date|string} [endDate] - The optional end date and time of the time slot. Can be a Date object or a string representation of a date.
         * @return {Object} - An object containing the properties:
         *   - `top` {number}: The calculated top position of the slot, relative to the calendar container.
         *   - `height` {number}: The height of the slot, representing the duration. Defaults to 0 if `endDate` is not provided.
         */
        function calculateSlotPosition($wrapper, startDate, endDate) {
            // Fetch the dynamic settings for hour slots (start hour, end hour, and height of each slot).
            const settings = getSettings($wrapper);

            // Convert `startDate` to a Date object if it's a string representation of a date.
            if (typeof startDate === 'string') {
                startDate = new Date(startDate);
            }

            // Convert `endDate` to a Date object if it's a string representation of a date (optional).
            if (typeof endDate === 'string') {
                endDate = new Date(endDate);
            }

            // Extract hours and minutes from the startDate.
            const startHours = startDate.getHours();
            const startMinutes = startDate.getMinutes();

            // Extract hours and minutes from the endDate, if provided.
            const endHours = endDate ? endDate.getHours() : null;
            const endMinutes = endDate ? endDate.getMinutes() : null;

            /**
             * Case 1: Event occurs completely outside the visible time range.
             * - If the start time is before the calendar start and the end is also before or at the start, OR
             * - If the start time is at or beyond the calendar end time.
             * Return early with `top = 0` and `height = 0` to hide the event.
             */
            if ((startHours < settings.hourSlots.start && (!endHours || endHours <= settings.hourSlots.start)) ||
                (startHours >= settings.hourSlots.end)) {
                return {top: 0, height: 0};
            }

            /**
             * Adjust the start and end times to fit them within the visible bounds (hour slots) of the calendar.
             */
            let adjustedStartHours = Math.max(startHours, settings.hourSlots.start); // Ensure an event starts no earlier than the calendar's start hour.
            let adjustedStartMinutes = startHours < settings.hourSlots.start ? 0 : startMinutes; // Ignore minutes if an event starts before the calendar.

            let adjustedEndHours = endHours !== null ? Math.min(endHours, settings.hourSlots.end) : null; // Restrict end time to within the calendar's end hour.
            let adjustedEndMinutes =
                endHours !== null && endHours >= settings.hourSlots.end ? 0 : endMinutes; // Ignore minutes if the event ends after the calendar.

            /**
             * Case 2: Calculate the top position of the slot:
             * - `adjustedStartHours`: The hour difference from the calendar start multiplied by the slot height.
             * - `adjustedStartMinutes`: Convert minutes to a fraction of an hour and multiply by slot height.
             * - The value `4` ensures consistent alignment adjustment, applied across the calendar.
             */
            const top =
                ((adjustedStartHours - settings.hourSlots.start) * settings.hourSlots.height) +
                ((adjustedStartMinutes / 60) * settings.hourSlots.height) +
                4;

            let height = 0; // Default height is 0.

            /**
             * Case 3: If `endDate` is provided, calculate the total duration in minutes:
             * - Duration = Total minutes from the start time to the end time.
             * - The height of the slot is proportional to the duration and the slot height setting.
             */
            if (endDate) {
                const durationMinutes =
                    (adjustedEndHours * 60 + adjustedEndMinutes) - (adjustedStartHours * 60 + adjustedStartMinutes);

                height = (durationMinutes / 60) * settings.hourSlots.height; // Convert duration to height based on hours.
            }

            /**
             * Case 4: Return the calculated `top` position and `height` of the slot.
             * - Subtract `4` from the top position to ensure alignment with the adjusted offset.
             * - If the height is negative (invalid), default it to 0.
             */
            return {top: top - 4, height: height > 0 ? height : 0};
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

            const roundedClass = `rounded-${settings.rounded}`;
            // render a small calendar for each month
            for (let month = 0; month < 12; month++) {
                // Create a wrapper for every monthly calendar
                const css = [
                    'margin: 5px'
                ]
                const monthWrapper = $('<div>', {
                    class: `d-flex p-2 flex-column align-items-start wc-year-month-container ${roundedClass}`, // Col-Layout für Titel und Kalender
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
         * Displays an information modal window containing details about the provided appointment element.
         *
         * @param {jQuery} $wrapper - A wrapper element for the calendar DOM containing settings and references.
         * @param {jQuery} $targetElement - The element that was clicked to trigger the modal, containing data about an appointment.
         * @return {void} Does not return a value, but shows a modal with the appointment's details.
         */
        function showInfoWindow($wrapper, $targetElement) {
            const settings = getSettings($wrapper);
            // Extract the `appointment` data from the clicked target element (provided as a data attribute).
            const appointment = $targetElement.data('appointment');

            // Set a reference to the modal element using its ID.
            let $modal = $(calendarElements.infoModal);

            const returnData = getAppointmentForReturn(appointment);
            trigger($wrapper, 'show-info-window', returnData.appointment, returnData.extras);
            // Create the HTML content for the modal body, displaying the appointment details.
            settings.formatter.window(returnData.appointment, returnData.extras).then(html => {
                // Check if the modal already exists on the page.
                const modalExists = $modal.length > 0;
                if (!modalExists) {
                    const roundedClass = 'rounded-' + settings.rounded;
                    // If the modal does not exist, create the modal's HTML structure and append it to the body.
                    const modalHtml = [
                        `<div class="modal fade pe-none" id="${calendarElements.infoModal.substring(1)}" tabindex="-1" data-bs-backdrop="false">`,
                        `<div class="modal-dialog modal-fullscreen-sm-down position-absolute pe-auto">`,
                        `<div class="modal-content border border-1 shadow ${roundedClass}">`,
                        `<div class="modal-body d-flex flex-column align-items-stretch pb-4">`,
                        `<div class="d-flex justify-content-end align-items-center" data-modal-options>`,
                        `<button type="button" data-bs-dismiss="modal" class="btn"><i class="bi bi-x-lg"></i></button>`,
                        `</div>`,
                        `<div class="modal-appointment-content flex-fill overflow-y-auto">`,
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
                    $modal = $(calendarElements.infoModal);
                    // save the calendar wrapper ID in the modal to find the wrapper again
                    $modal.attr('data-bs-calendar-wrapper-id', $wrapper.attr('data-bs-calendar-id'));

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

                const modalOptions = $modal.find('[data-modal-options]');
                const deleteable = appointment.hasOwnProperty('deleteable') ? appointment.deleteable : true;
                const editable = appointment.hasOwnProperty('editable') ? appointment.editable : true;
                if (editable) {
                    if (!$modal.find('[data-edit]').length) {
                        $(`<button type="button" data-edit class="btn"><i class="bi bi-pen"></i></button>`).prependTo(modalOptions);
                    }
                } else {
                    $modal.find('[data-edit]').remove();
                }
                if (deleteable) {
                    if (!$modal.find('[data-remove]').length) {
                        $(`<button type="button" data-remove data-bs-dismiss="modal" class="btn"><i class="bi bi-trash3"></i></button>`).prependTo(modalOptions);
                    }
                } else {
                    $modal.find('[data-remove]').remove();
                }

                // Get relevant dimensions and positioning of the modal and target element.
                const $modalDialog = $modal.find('.modal-dialog');
                const $target = $($targetElement);
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
    }
    (jQuery)
)
