(function ($) {
    $.bsCalendar = {
        setDefaults: function (options) {
            this.DEFAULTS = $.extend({}, this.DEFAULTS, options || {});
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
            },
            url: null,
            queryParams: null,
            sidebarAddons: null,
            debug: false,
            formatInfoWindow: formatInfoWindow,
            formatDuration: formatDuration,
        }
    };


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
                settings = $.extend({}, settings, wrapper.data(), optionsOrMethod || {});
            }

            setSettings(wrapper, settings);
            init(wrapper);
        }

        if (methodGiven) {
            switch (optionsOrMethod) {
                case 'refresh':
                    methodRefresh(wrapper, params);
                    break;
                case 'clear':
                    methodClear(wrapper);
                    break;
                case 'updateOptions':
                    methodUpdateOptions(wrapper, params);
                    break;
                case 'destroy':
                    destroy(wrapper);
                    break;
                case 'setDate':
                    methodSetDate(wrapper, params);
                    break;
                case 'setToday':
                    setToday(wrapper, params);
                    break;
            }
        }

        return wrapper;
    }

    function setToday($wrapper, view) {
        let viewChanged = false;
        const settings = getSettings($wrapper);
        if (view && settings.views.includes(view)) {
            const viewBefore = getView($wrapper);
            if (viewBefore !== view) {
                setView($wrapper, view);
                viewChanged = true;
            }
        }
        const date = new Date();
        setDate($wrapper, date);
        // if (viewChanged) {
        buildByView($wrapper);
        // }
        fetchAppointments($wrapper);
    }

    function methodSetDate($wrapper, object) {
        const settings = getSettings($wrapper);
        let date = null;
        let viewChanged = false;
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


        // if (viewChanged) {
        buildByView($wrapper);
        // }


        fetchAppointments($wrapper);
    }

    function methodClear($wrapper) {
        $wrapper.find('[data-appointment]').remove();
        setAppointments($wrapper, []);
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
        $wrapper.empty();
    };

    function methodUpdateOptions($wrapper, options) {
        if (typeof options === 'object') {
            const settingsBefore = getSettings($wrapper);
            const newSettings = $.extend({}, $.bsCalendar.getDefaults(), $wrapper.data(), settingsBefore, options || {});
            destroy($wrapper);
            setSettings($wrapper, newSettings);
            init($wrapper);
        }
    }

    /**
     * Updates and applies settings for a given wrapper element based on the provided parameters.
     *
     * @param {HTMLElement} $wrapper - The DOM element representing the wrapper where settings are applied.
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
     * @param {jQuery} $wrapper - A jQuery wrapper element where the appointments data will be stored.
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
     * @param {jQuery} $wrapper - The jQuery wrapper element containing the appointments data.
     * @return {Array<Object>} The appointments data stored in the wrapper element, or undefined if no data is found.
     */
    function getAppointments($wrapper) {
        return $wrapper.data('appointments');
    }

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
            class: 'd-flex sticky-top align-items-center justify-content-end mb-3 wc-calendar-top-nav  bg-body-tertiary rounded-' + settings.rounded
        }).appendTo(innerWrapper);

        const btnNew = $('<button>', {
            class: `btn rounded-${settings.rounded} border-3 border`,
            html: '<i class="bi bi-plus-lg"></i><span class="d-xl-inline ms-xl-2 ml-xl-2 d-none">' + settings.translations.appointment + '</span>',
            'data-add-appointment': true
        }).appendTo(topNav);

        const spinner = $('<div>', {
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

        const navDate = $('<div>', {
            class: 'd-flex ms-2 align-items-center justify-content-center wc-nav-view-wrapper flex-nowrap text-nowrap',
            html: [
                '<small class="wc-nav-view-name mr-3 me-3"></small>',
                '<a class="wc-nav-view-prev" href="#"><i class="bi bi-chevron-left"></i></a>',
                '<a class="wc-nav-view-next mx-2" href="#"><i class="bi bi-chevron-right"></i></a>',
            ].join('')
        }).appendTo(topNav);

        if (settings.search) {
            const searchInput = $('<input>', {
                type: 'search',
                class: 'form-control ms-2 rounded-' + settings.rounded + ' border-3 border',
                placeholder: settings.translations.search || 'search',
                'data-search': true
            }).appendTo(navDate);
        }

        const todayButton = $('<button>', {
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

            function getIcon(view) {
                switch (view) {
                    case 'day':
                        return '<i class="bi bi-calendar-day me-2 mr-2"></i>';
                        break;
                    case 'week':
                        return '<i class="bi bi-calendar-week me-2 mr-2"></i>';
                        break;
                    case 'month':
                        return '<i class="bi bi-calendar-month me-2 mr-2"></i>';
                        break;
                    case 'year':
                        return '<i class="bi bi-calendar4 me-2 mr-2"></i>';
                }
            }

            settings.views.forEach(view => {
                const li = $('<li>', {
                    html: `<a class="dropdown-item" data-view="${view}" href="#">${getIcon(view)} ${settings.translations[view]}</a>`
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
                '<a class="wc-nav-view-prev" href="#"><i class="bi bi-chevron-left"></i></a>',
                '<a class="wc-nav-view-next ml-2 ms-2" href="#"><i class="bi bi-chevron-right"></i></a>',
                '</div>',
                '</div>',
                '</div>',
                '<div class="wc-calendar-month-small"></div>'
            ].join('')
        }).appendTo(container);

        if (settings.sidebarAddons) {
            $(settings.sidebarAddons).appendTo(leftBar);
        }

        const viewContainer = $('<div>', {
            class: `container-fluid wc-calendar-view-container  border-1 rounded-${settings.rounded} flex-fill border overflow-hidden  d-flex flex-column align-items-stretch`
        }).appendTo(container);

    }

    /**
     * Updates the elements displaying the current date information based on the provided wrapper's settings, date, and view.
     *
     * @param {Object} $wrapper The wrapper object containing settings, date, and view for obtaining and formatting the current date.
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
     * @param {Object} $wrapper - The wrapper object containing the current view and date context.
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
     * Navigates forward in the calendar based on the current view (e.g., day, week, month, year).
     * Updates the date and rebuilds the view accordingly.
     *
     * @param {Object} $wrapper - The wrapper element that contains the calendar state and view information.
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
     * Attaches event listeners to a given wrapper element to handle user interactions with the calendar interface.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the main wrapper element of the calendar.
     *
     * @return {void} This function does not return a value.
     */
    function handleEvents($wrapper) {
        $wrapper
            .on('keyup input', '[data-search]', function (e) {
                e.preventDefault();
                const search = $(e.currentTarget).val();
                const settings = getSettings($wrapper);
                if (search) {
                    setView($wrapper, 'search');
                }
                else{
                    setView($wrapper, settings.startView);
                }
                buildByView($wrapper);
            })
            .on('click', '[data-add-appointment]', function (e) {
                e.preventDefault();
                const date = getDate($wrapper);
                const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
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
            })
            .on('click', '[data-today]', function (e) {
                e.preventDefault();
                setToday($wrapper);
            })
            .on('click touchend', '[data-appointment]', function (e) {
                e.preventDefault();
                const element = $(e.currentTarget);
                element.popover('hide');
                element.removeClass('text-bg-light');

                const appointment = element.data('appointment');
                trigger($wrapper, 'edit', [appointment, element]);
            })
            .on('click', '[data-date]', function (e) {
                e.preventDefault();
                const settings = getSettings($wrapper);
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
            .on('click', '.wc-nav-view-prev', function (e) {
                e.preventDefault();
                navigateBack($wrapper);
            })
            .on('click', '.wc-nav-view-next', function (e) {
                e.preventDefault();
                navigateForward($wrapper);
            })
            .on('click', '.wc-select-calendar-view [data-view]', function (e) {
                e.preventDefault();
                const dropdown = $(e.currentTarget).closest('.dropdown');
                dropdown.find('.dropdown-item.active').removeClass('active');
                const a = $(e.currentTarget);
                const translate = a.text();
                dropdown.find('.dropdown-toggle').text(translate);
                const view = a.data('view');
                a.addClass('active');
                setView($wrapper, view);
                buildByView($wrapper);
            })
    }


    function updateDropdownView($wrapper) {
        const dropdown = $wrapper.find('.wc-select-calendar-view');
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
        if (view !== 'search' && !['day', 'week', 'month', 'year'].includes(view)) {
            if (settings.debug) {
                console.error(
                    'Invalid view type provided. Defaulting to month view.',
                    'Provided view:', view
                );
            }
            view = 'month';
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
        ;
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
        ;
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
        return $wrapper.find('.wc-calendar-view-container');
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

        const container = getViewContainer($wrapper).empty();
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
            case 'search':
                buildSearchView($wrapper);
                break;
            default:
                break;
        }
        $wrapper.find('.popover').remove();
        updateDropdownView($wrapper);
        setCurrentDateName($wrapper);
        buildMonthSmallView($wrapper, getDate($wrapper), $('.wc-calendar-month-small'));
        trigger($wrapper, 'view', [view]);
        fetchAppointments($wrapper);
    }

    function fetchAppointments($wrapper) {
        const settings = getSettings($wrapper);
        if (settings.debug) {
            log('Call fetchAppointments');
        }
        // Get the latest date and view
        const date = getDate($wrapper);
        const view = getView($wrapper);
        const searchElement = getSearchElement($wrapper);
        const search = searchElement?.val() ?? null;

        // calculate the start and end date based on the view
        const period = getStartAndEndDateByView($wrapper);
        const spinner = $wrapper.find('.wc-calendar-spinner');
        $wrapper.find('.popover').remove();
        $wrapper.find('[data-appointment]').remove();
        // Daten für den Ajax-Request zusammenstellen
        const requestData = {
            fromDate: period.start, // Startdatum im ISO-Format
            toDate: period.end,    // Enddatum im ISO-Format
            view: view, // 'day', 'week', 'month', 'year'
            search: search // ?string
        };

        if (typeof settings.queryParams === 'function') {
            const queryParams = settings.queryParams(requestData);
            for (const key in queryParams) {
                if (key !== 'fromDate' && key !== 'toDate' && key !== 'view' && key !== 'search') {
                    requestData[key] = queryParams[key];
                }
            }
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

    function checkAppointmentOverlap(appointment1, appointment2) {
        return (
            new Date(appointment1.start) < new Date(appointment2.end) &&
            new Date(appointment1.end) > new Date(appointment2.start)
        );
    }

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

// Hilfsfunktion zur Prüfung auf Überschneidungen
    function fitsColumn(column, appointment) {
        return column.every(colAppointment => !checkAppointmentOverlap(appointment, colAppointment));
    }

    function buildAppointmentsForWeek($wrapper, appointments) {
        const container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);

        const appointmentsByWeekday = [[], [], [], [], [], [], []]; // Array für jeden Wochentag (Sonntag bis Samstag)

        // Sortiere die Termine nach dem Wochentag
        appointments.forEach(appointment => {
            appointment.displayDates.forEach(startString => {
                const appointmentDate = new Date(appointment.start);
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

    function buildAppointmentsForDay($wrapper, $container, appointments, marginLeft = 1) {
        const settings = getSettings($wrapper);
        const columns = assignColumnsToAppointments(appointments);

        const gap = 1; // Abstand zwischen den Terminen in Pixeln

        // Breite inkl. Berücksichtigung des Zwischenraums (relativ in % berechnen)
        const containerWidth = $container.width();
        const containerHeight = $container.height();

        const appointmentWidthPercent = ((containerWidth - marginLeft) / columns.length - gap) / containerWidth * 100;

        // Gehe durch jede Spalte und positioniere die Termine
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

                // Konvertiere `topPosition` und `appointmentHeight` in Prozent
                const topPositionPercent = (topPositionInPixels / containerHeight) * 100;
                const appointmentHeightPercent = (appointmentHeightInPixels / containerHeight) * 100;

                // Berechne die `left`-Position relativ in % inkl. des Zwischenraums
                const appointmentLeftInPixels = marginLeft + (columnIndex * (appointmentWidthPercent * containerWidth / 100 + gap));
                const appointmentLeftPercent = (appointmentLeftInPixels / containerWidth) * 100;

                let durationString = end.toTimeString().slice(0, 5);
                if (typeof settings.formatDuration === "function") {
                    durationString += " (" + settings.formatDuration(appointment.duration) + ")";
                }

                const backgroundColor = appointment.color || settings.defaultColor;

                // Setze die Termin-Elemente
                const appointmentElement = $('<small>', {
                    'data-appointment': true,
                    class: 'position-absolute text-nowrap text-truncate shadow px-2 btn-sm overflow-hidden',
                    css: {
                        backgroundColor: backgroundColor,
                        top: `${topPositionPercent}%`, // Top in %
                        height: `${appointmentHeightPercent}%`, // Höhe in %
                        left: `${appointmentLeftPercent}%`, // Linke Position in %
                        width: `${appointmentWidthPercent}%`, // Breite in %
                    },
                    html: `<div class="">${start.toTimeString().slice(0, 5)} ${durationString} - ${appointment.title || 'Ohne Titel'}</div>`,
                }).appendTo($container);

                appointmentElement.data('appointment', appointment);
                setColorByBackgroundColor(appointmentElement, settings.defaultColor);
                setPopoverForAppointment($wrapper, appointmentElement);
            });
        });
    }

    function setColorByBackgroundColor($el, defaultColor) {
        const backgroundColor = $el.css('background-color') || defaultColor;
        $el.css('color', !isDarkBackgroundColor(backgroundColor) ? '#ffffff' : '#000000');
    }

    function isSameDate(date1, date2) {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }

    function buildAppointmentsForSearch($wrapper, appointments) {
        const settings = getSettings($wrapper);
        const $container = getViewContainer($wrapper).find('.wc-search-result-container').css('font-size', '.9rem');
        if (! appointments.length) {
            $container.html('<div class="d-flex h-100 w-100 align-items-center justify-content-center"> <i class="bi bi-calendar2-x fs-4"></i></div>');
            return;
        }
        appointments.forEach(appointment => {
            const appointmentElement = $('<div>', {
                'data-appointment': true,
                class: 'list-group-item d-flex align-items-center g-3 py-1 overflow-hidden',
                html: `
        <div class="day fw-bold fs-3 text-center" style="width: 60px;" data-date="${formatDate($wrapper, new Date(appointment.start))}">
            ${new Date(appointment.start).getDate()}
        </div>
        <div class="text-muted" style="width: 150px;">
            ${new Date(appointment.start).toLocaleDateString(settings.locale, {
                    month: 'short',
                    year: 'numeric',
                    weekday: 'short'
                })}
        </div>
        <div class="title-container flex-fill text-nowrap">
            ${appointment.title}
        </div>
        `
            }).appendTo($container);
            appointmentElement.data('appointment', appointment);
            setPopoverForAppointment($wrapper, appointmentElement);
        })
    }

    function buildAppointmentsForMonth($wrapper, appointments) {
        const $container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);
        if (settings.debug) {
            log('Call buildAppointmentsForMonth with appointments:', appointments);
        }
        const max = 6;
        appointments.forEach(appointment => {
            const multipleStartDates = appointment.displayDates.length > 1;
            appointment.displayDates.forEach(startString => {
                const fakeStart = new Date(startString);
                const start = new Date(appointment.start);
                const startDate = start.toISOString().split('T')[0];
                const sameDate = isSameDate(fakeStart, start);
                const isNotStartOnThisDay = multipleStartDates && !sameDate;
                const isStartOnThisDay = multipleStartDates && sameDate;
                if (!isNotStartOnThisDay) {
                    console.warn('Appointment start date does not match the start date of the appointment:', startDate, startString);
                }
                const startTime = start.toLocaleTimeString(settings.locale, {hour: '2-digit', minute: '2-digit'});
                const dayContainer = $container.find(`[data-month-date="${startString}"]`);
                let iconClass = `bi-clock`;
                if (appointment.allDay) {
                    iconClass = `bi-circle-fill`;
                } else if (isStartOnThisDay) {
                    iconClass = `bi-arrow-bar-right`;
                } else if (isNotStartOnThisDay) {
                    iconClass = `bi-arrow-bar-left`;
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
                        `<i class="bi ${iconClass} me-1 mr-1" style="color: ${appointment.color || settings.defaultColor}; font-size: 12px"></i>`,
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
                    // title: <i class="bi bi-circle-fill"></i> + appointment.title,
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
                .on('mouseleave touchend', function (e) {
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

    function buildAppointmentsForView($wrapper) {
        $wrapper.find('[data-appointment]').remove();
        const appointments = getAppointments($wrapper);
        const view = getView($wrapper);
        const settings = getSettings($wrapper);
        if (settings.debug) {
            log('Call renderData with view:', view);
        }
        const container = getViewContainer($wrapper);
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
            case 'search':
                buildAppointmentsForSearch($wrapper, appointments);
                break;
            case 'year':
                break;
        }
    }

    function renderAppointments($wrapper) {
        buildAppointmentsForView($wrapper);
        hideLoader($wrapper);
    }

    function showLoader($wrapper) {
        const spinner = $wrapper.find('.wc-calendar-spinner');
        spinner.show();
    }

    function hideLoader($wrapper) {
        const spinner = $wrapper.find('.wc-calendar-spinner');
        spinner.hide();
    }

    function getStartAndEndDateByView($wrapper) {
        const settings = getSettings($wrapper);
        const date = getDate($wrapper);
        const view = getView($wrapper);
        const startDate = new Date(date); // Neues Date-Objekt basierend auf `date`
        const endDate = new Date(date);   // Neues Date-Objekt basierend auf `date`

        switch (view) {
            case 'day':
                // Start und Ende bleiben innerhalb eines Tages
                break;

            case 'week':
                // Startdatum: Montag der laufenden Woche
                const dayOfWeek = startDate.getDay(); // 0 = Sonntag, 1 = Montag, ...
                const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Abweichung zum Montag berechnen
                startDate.setDate(startDate.getDate() + diffToMonday);

                // Enddatum: Sonntag der gleichen Woche
                endDate.setDate(startDate.getDate() + 6);
                break;

            case 'month':
                // Startdatum: 1. Tag des Monats
                startDate.setDate(1);

                // Enddatum: Letzter Tag des Monats
                endDate.setMonth(startDate.getMonth() + 1); // Zum nächsten Monat wechseln
                endDate.setDate(0); // Geht einen Tag zurück: Letzter Tag des Vormonats (aktueller Monat)
                break;

            case 'year':
            case 'search':
                // Startdatum: 1. Januar des aktuellen Jahres
                startDate.setMonth(0); // Januar
                startDate.setDate(1);  // 1. Tag

                // Enddatum: 31. Dezember des aktuellen Jahres
                endDate.setMonth(11); // Dezember
                endDate.setDate(31);  // Letzter Tag
                break;

            default:
                if (settings.debug) {
                    console.error('Unknown view:', view);
                }
                break;
        }

        return {
            date: date.toISOString().split('T')[0],
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
        };
    }

    function getSearchElement($wrapper) {
        return $wrapper.find('[data-search]') || null;
    }


    /**
     * Gibt die verkürzten Namen der Wochentage basierend auf der Locale zurück,
     * angepasst an den Starttag der Woche.
     *
     * @param {string} locale - Die Locale wie 'en-US' oder 'de-DE'.
     * @param {boolean} startWeekOnSunday - Gibt an, ob die Woche mit Sonntag beginnen soll.
     * @returns {string[]} - Ein Array der Wochentagsnamen, z. B. ['So.', 'Mo.', 'Di.', ...].
     */
    function getShortWeekDayNames(locale, startWeekOnSunday) {
        // Intl.DateTimeFormat zur dynamischen Ermittlung der Wochentagnamen nutzen.
        const formatter = new Intl.DateTimeFormat(locale, {weekday: 'short'});

        // Wochentagsnamen für Sonntag (0) bis Samstag (6) sammeln.
        const weekDays = [...Array(7).keys()].map(day =>
            formatter.format(new Date(Date.UTC(2023, 0, day + 1))) // Beispieljahr, Tag + 1
        );

        // Reihenfolge anpassen, wenn die Woche auf Montag starten soll.
        return startWeekOnSunday ? weekDays : weekDays.slice(1).concat(weekDays[0]);
    }

    function buildSearchView($wrapper) {
        const container = getViewContainer($wrapper);
        const settings = getSettings($wrapper);
        const searchElement = getSearchElement($wrapper);
        // Container leeren und neue Struktur generieren
        container.empty();
        const $searchContainer = $('<div>', {
            class: 'wc-search-result-container list-group list-group-flush vh-100 overflow-auto',
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

        // Berechnung der Kalenderdaten
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Starten mit dem richtigen Wochentag (Möglichkeit: Sonntag oder Montag)
        let calendarStart = new Date(firstDayOfMonth);
        while (calendarStart.getDay() !== (startWeekOnSunday ? 0 : 1)) {
            calendarStart.setDate(calendarStart.getDate() - 1);
        }

        // Enden mit dem richtigen Wochentag (Samstag oder Sonntag)
        let calendarEnd = new Date(lastDayOfMonth);
        while (calendarEnd.getDay() !== (startWeekOnSunday ? 6 : 0)) {
            calendarEnd.setDate(calendarEnd.getDate() + 1);
        }

        // Container leeren und neue Struktur generieren
        container.empty();

        // Wochentagszeile erstellen
        const weekdaysRow = $('<div>', {
            class: 'row d-flex flex-nowrap wc-calendar-weekdays fw-bold text-bg-secondary',
        }).append(
            $('<div>', {
                class: 'col px-1 d-flex align-items-center justify-content-center',
                style: 'width: 24px',
                html: '<small></small>',
            })
        );

        // Dynamische Wochennamen basierend auf Locale und Flag
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

        // Tage darstellen
        let currentDate = new Date(calendarStart);
        while (currentDate <= calendarEnd) {
            const weekRow = $('<div>', {
                class: 'row d-flex flex-nowrap flex-fill wc-calendar-content',
            });

            // Kalenderwoche berechnen
            const calendarWeek = getCalendarWeek(currentDate);
            weekRow.append(
                $('<div>', {
                    class: 'col px-1 d-flex align-items-start py-2 fw-bold text-bg-secondary justify-content-center',
                    style: 'width: 24px;',
                    html: `<small>${calendarWeek}</small>`,

                })
            );

            // Tage der Woche (Mo-So oder So-Sa) zeichnen
            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const dayClass = isToday ? 'rounded-circle text-bg-primary' : '';
                const dayWrapper = $('<div>', {
                    'data-month-date': formatDate($wrapper, currentDate),
                    class: `col px-1 border flex-fill d-flex flex-column align-items-center justify-content-start ${
                        isOtherMonth ? 'text-muted' : ''
                    } ${isToday ? '' : ''}`,
                    css: {
                        maxHeight: '100%',
                        overflowY: 'auto',
                    }
                }).appendTo(weekRow);

                $('<small>', {
                    'data-date': formatDate($wrapper, currentDate),
                    css: {
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        fontSize: '12px',
                    },
                    class: `${dayClass} text-center`,
                    text: currentDate.getDate(),
                }).appendTo(dayWrapper);

                // Nächster Tag
                currentDate.setDate(currentDate.getDate() + 1);
            }

            container.append(weekRow);
        }
    }

    /**
     * Builds a small month view calendar inside the provided wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery wrapper object containing the calendar structure.
     * @return {void} - This function does not return a value.
     */
    function buildMonthSmallView($wrapper, forDate, $container) {
        // Container für Miniaturansicht holen

        const settings = getSettings($wrapper);
        const date = forDate; // Aktuelles Datum
        const activeDate = getDate($wrapper);

        // Berechnung der Monatsdaten
        const year = date.getFullYear();
        const month = date.getMonth();

        // 1. Tag und letzter Tag des Monats
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Beginn mit dem Montag vor dem Monatsbeginn
        let calendarStart = new Date(firstDayOfMonth);
        while (calendarStart.getDay() !== 1) {
            calendarStart.setDate(calendarStart.getDate() - 1);
        }

        // Ende mit dem Sonntag nach dem Monatsende
        let calendarEnd = new Date(lastDayOfMonth);
        while (calendarEnd.getDay() !== 0) {
            calendarEnd.setDate(calendarEnd.getDate() + 1);
        }

        // Container leeren und Miniaturkalender vorbereiten
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

        // Kopfzeile für Wochentage erstellen
        const thead = $('<thead>').appendTo(table);
        const weekdaysRow = $('<tr>', {
            class: '',
            css: {
                height: '24px'
            }
        }).appendTo(thead);

        // Erste Spalte (KW)
        $('<th>', {class: '', css: {width: '15px'}, text: ''}).appendTo(weekdaysRow);

        // Wochentage (Mo, Di, Mi, ...) hinzufügen
        const weekDays = getShortWeekDayNames(settings.locale, settings.startWeekOnSunday);
        weekDays.forEach(day => {
            $('<th>', {class: '', text: day}).appendTo(weekdaysRow);
        });

        // Inhalt des Kalenders erzeugen
        const tbody = $('<tbody>').appendTo(table);
        let currentDate = new Date(calendarStart);

        while (currentDate <= calendarEnd) {
            const weekRow = $('<tr>', {
                css: {
                    fontSize: '10px',
                }
            }).appendTo(tbody);

            // Kalenderwoche berechnen
            const calendarWeek = getCalendarWeek(currentDate);
            $('<td>', {
                css: {
                    width: '10px',
                    fontSize: '10px'
                },
                class: 'border-end pe-1 text-end text-secondary fw-bold',
                text: calendarWeek,
            }).appendTo(weekRow); // KW in die erste Spalte der Zeile einfügen

            // Tage der Woche (Mo - So) hinzufügen
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
                const td = $('<td>', {
                    'data-date': formatDate($wrapper, currentDate),
                    css: {
                        cursor: 'pointer',
                        fontSize: '10px',
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                    }, // Einheitliches Quadrat für Zentrierung
                    html: `<div class="${dayClass} w-100 h-100 d-flex justify-content-center align-items-center">${currentDate.getDate()}</div>`,
                }).appendTo(weekRow);

                // Zum nächsten Tag springen
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    function buildDayView($wrapper) {
        const container = getViewContainer($wrapper);
        const date = getDate($wrapper);
        buildDayViewContent($wrapper, date, container);
        // $('<h1>', {text: 'Day View'}).appendTo(container);
    }


    /**
     * Formats a given date object into a string based on the locale settings retrieved from the provided wrapper element.
     * The returned format is "YYYY-MM-DD".
     *
     * @param {HTMLElement} $wrapper - The HTML element from which locale settings are determined.
     * @param {Date} date - The date object to be formatted.
     * @return {string} The formatted date as a string in "YYYY-MM-DD" format.
     */
    function formatDate($wrapper, date) {
        const settings = getSettings($wrapper);
        let day = date.toLocaleDateString(settings.locale, {day: 'numeric'});
        if (day < 10) {
            day = '0' + day;
        }
        let month = date.toLocaleDateString(settings.locale, {month: 'numeric'});
        if (month < 10) {
            month = '0' + month;
        }
        const year = date.toLocaleDateString(settings.locale, {year: 'numeric'});
        return `${year}-${month}-${day}`;

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
        // Kopieren des Eingabedatums und Wochentagsberechnung
        const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNr = (target.getUTCDay() + 6) % 7; // Montag = 0, Sonntag = 6
        target.setUTCDate(target.getUTCDate() - dayNr + 3); // Auf den Donnerstag der aktuellen Woche schieben

        // Der erste Donnerstag des Jahres
        const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
        const firstDayOfWeek = firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7);

        // Anzahl Wochen zwischen erstem Donnerstag und aktuellem Donnerstag berechnen
        const weekNumber = Math.floor(1 + (target - new Date(Date.UTC(target.getUTCFullYear(), 0, firstDayOfWeek))) / (7 * 24 * 60 * 60 * 1000));

        return weekNumber;
    }


    /**
     * Constructs and appends a week view into the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element where the week view will be created.
     * @return {void} This method does not return any value.
     */
    function buildWeekView($wrapper) {
        // Den Hauptcontainer für die Ansicht holen
        const $viewContainer = getViewContainer($wrapper);
        // Container leeren (alte Inhalte entfernen)
        $viewContainer.empty();

        const $container = $('<div>', {
            class: 'position-relative px-5'
        }).appendTo($viewContainer);

        // Aktuelles Datum für die Ansicht holen
        const date = getDate($wrapper);

        // Einstellungen aus dem Wrapper abrufen
        const settings = getSettings($wrapper);

        // Berechnung des ersten Tags der Woche basierend auf startWeekOnSunday
        const {startWeekOnSunday} = settings;
        const currentDay = date.getDay(); // Wochentag (0 = Sonntag, 1 = Montag, ...)
        const startOfWeek = new Date(date);
        const startOffset = startWeekOnSunday ? currentDay : (currentDay === 0 ? 6 : currentDay - 1);
        startOfWeek.setDate(date.getDate() - startOffset);

        // Berechnung des letzten Tags der Woche
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);


        // Wochenansicht als flexibles Layout erstellen
        const weekContainer = $('<div>', {
            class: 'wc-week-view d-flex flex-nowrap',
            css: {paddingLeft: '40px'}
        }).appendTo($container);

        // Iteration über die Tage der Woche (von Starttag bis Endtag)
        for (let day = 0; day < 7; day++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + day); // Nächsten Tag berechnen

            // Tagescontainer erstellen
            const dayContainer = $('<div>', {
                'data-week-day': currentDate.getDay(),
                class: 'wc-day-week-view flex-grow-1 flex-fill border-end position-relative',
            }).appendTo(weekContainer);


            // Labels werden nur im ersten Container (der 1. Spalte) angezeigt
            const showLabels = day === 0;

            // Funktion buildDayViewContent verwenden, um die Ansicht für den Tag zu erstellen
            buildDayViewContent($wrapper, currentDate, dayContainer, true, showLabels);
        }
    }

    /**
     * Baut eine Tagesübersicht mit Stunden-Labels und horizontalen Linien für jede Zeile.
     *
     * @param {jQuery} $wrapper - Das Wrapper-Element für den Kalender.
     * @param {Date} date - Das aktuelle Datum.
     * @param {jQuery} $container - Das Ziel-Element, in das der Inhalt eingefügt wird.
     * @param forWeekView
     * @param showLabels
     */
    function buildDayViewContent($wrapper, date, $container, forWeekView = false, showLabels = true) {
        // Container leeren
        // $container.empty();

        // Einstellungen aus dem Wrapper abrufen
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

        const headline = $('<div>', {
            class: 'wc-day-header py-2 text-center fw-bold mb-2',
            text: date.toLocaleDateString(settings.locale, {weekday: 'long', day: 'numeric', month: 'long'})
        }).appendTo($container);

        if (isToday) {
            headline.addClass('text-primary');
        }

        if (forWeekView) {
            headline.attr('data-date', formatDate($wrapper, date)).css('cursor', 'pointer');
        }

        const allDayContainer = $('<div>', {
            'data-all-day': true,
            class: 'd-flex flex-column flex-fill',
        }).appendTo($container);

        // Container für Zeitslots
        const timeSlots = $('<div>', {
            class: 'wc-day-view-time-slots d-flex flex-column position-relative  py-2'
        }).appendTo($container);

        // Stunden (von 0 bis 23) mit einer horizontalen Linie präsentieren
        for (let hour = 0; hour <= 24; hour++) {
            // Zeilencontainer für die Stunde
            // Überschrift über die Tagesansicht hinzufügen

            const row = $('<div>', {
                'data-day-hour': hour,
                css: {
                    height: '34px',
                },
                class: 'd-flex align-items-center border-top position-relative'
            }).appendTo(timeSlots);

            if (showLabels) {
                // Stunden-Label (z. B. 08:00)
                $('<div>', {
                    class: 'wc-time-label ps-2 position-absolute top-0 translate-middle text-bg-secondary',
                    css: {
                        left: '-34px'
                    },
                    html: `${hour.toString().padStart(2, '0')}:00 <i class="bi bi-caret-right-fill"></i>`
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
        const container = getViewContainer($wrapper); // Haupt-Container für die Jahresansicht
        const settings = getSettings($wrapper); // Einstellungen des Kalenders
        const date = getDate($wrapper); // Aktuelles Datum aus den Einstellungen
        const year = date.getFullYear(); // Das Jahr bestimmen

        // Container vorher leeren
        container.empty();

        // Flex-Layout für alle 12 Monatskalender
        const grid = $('<div>', {
            class: 'd-flex flex-wrap p-3', // Flexbox für Inline-Darstellung
            css: {
                gap: '10px', // Abstand zwischen Kalendern
            },
        }).appendTo(container);

        // Für jeden Monat einen kleinen Kalender rendern
        for (let month = 0; month < 12; month++) {
            // Ein Wrapper für jeden Monatskalender erstellen
            const monthWrapper = $('<div>', {
                class: 'd-flex shadow p-3 flex-column rounded-' + settings.rounded + ' align-items-center wc-year-month-container', // Col-Layout für Titel und Kalender
                css: {
                    width: '200px', // Feste Breite für jeden Kalender
                    margin: '5px', // Abstand am Rand
                },
            }).appendTo(grid);

            // Monatsname und Jahr als Titel (z. B. "Januar 2023")
            const monthName = new Intl.DateTimeFormat(settings.locale, {month: 'long'}).format(
                new Date(year, month)
            );
            $('<div>', {
                'data-month': `${year}-${String(month + 1).padStart(2, '0')}-01`,
                class: 'text-center fw-bold',
                text: `${monthName} ${year}`, // Titel erzeugen
                css: {
                    cursor: 'pointer',
                    marginBottom: '10px',
                },
            }).appendTo(monthWrapper);

            const monthContainer = $('<div>').appendTo(monthWrapper)

            // Kleinen Monatskalender einfügen
            const tempDate = new Date(year, month, 1); // Startdatum des aktuellen Monats
            // setDate($wrapper, tempDate); // Temporäres Datum setzen
            buildMonthSmallView($wrapper, tempDate, monthContainer); // buildMonthSmallView verwenden
        }
    }
}(jQuery))
