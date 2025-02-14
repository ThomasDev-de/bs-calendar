(function ($) {
    const DEFAULTS = {
        locale: 'en-EN',
        startWeekOnSunday: true,
        rounded: 5, // 1-5
        startDate: new Date(),
        startView: 'month', // day, week, month, year
        translations: {
            day: 'Day',
            week: 'Week',
            month: 'Month',
            year: 'Year',
            today: 'Today',
            appointment: 'Appointment',
        }
    };

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
            let settings = DEFAULTS;
            if (optionsGiven) {
                settings = $.extend({}, DEFAULTS, wrapper.data(), optionsOrMethod);
            }
            setSettings(wrapper, settings);
            init(wrapper).then(function () {
                wrapper.data('initBsCalendar', true);
            });
        }

        return wrapper;
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
                $wrapper.data('view', settings.startView);
                $wrapper.data('date', settings.startDate);

                buildFramework($wrapper);
                buildMonthSmallView($wrapper, $('.wc-calendar-month-small'));
                buildByView($wrapper);
                handleEvents($wrapper);
                resolve($wrapper);
            } catch (error) {
                reject(error);
            }
        });
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
            class: 'd-flex align-items-center justify-content-end mb-3 wc-calendar-top-nav'
        }).appendTo(innerWrapper);

        const btnNew = $('<button>', {
            class: `btn rounded-${settings.rounded} border-3 border me-auto`,
            html: '<i class="bi bi-plus-lg"></i> ' + settings.translations.appointment,
            click: function () {
                const date = new Date();
                setDate($wrapper, date);
                buildByView($wrapper);
            }
        }).appendTo(topNav);

        const navDate = $('<div>', {
            class: 'd-flex mx-2 align-items-center justify-content-center wc-nav-view-wrapper',
            html: [
                '<small class="wc-nav-view-name me-3">test</small>',
                '<a class="wc-nav-view-prev" href="#"><i class="bi bi-chevron-left"></i></a>',
                '<a class="wc-nav-view-next mx-2" href="#"><i class="bi bi-chevron-right"></i></a>',
            ].join('')
        }).appendTo(topNav);

        const todayButton = $('<button>', {
            class: `btn rounded-${settings.rounded} border-3 mx-2 border`,
            html: settings.translations.today,
            click: function () {
                const date = new Date();
                setDate($wrapper, date);
                buildByView($wrapper);
            }
        }).appendTo(topNav);
        const dropDownView = $('<div>', {
            class: 'dropdown wc-select-calendar-view',
            html: [
                `<a class="btn rounded-${settings.rounded} border border-3 dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">`,
                '</a>',
                '<ul class="dropdown-menu">',
                '<li><a class="dropdown-item" data-view="day" href="#">' + settings.translations.day + '</a></li>',
                '<li><a class="dropdown-item" data-view="week" href="#">' + settings.translations.week + '</a></li>',
                '<li><a class="dropdown-item active" data-view="month" href="#">' + settings.translations.month + '</a></li>',
                '<li><a class="dropdown-item" data-view="year" href="#">' + settings.translations.year + '</a></li>',
                '</ul>',
            ].join('')
        }).appendTo(topNav);

        const container = $('<div>', {
            class: 'd-flex flex-fill wc-calendar-container'
        }).appendTo(innerWrapper);

        const leftBar = $('<div>', {
            class: 'wc-calendar-left-nav d-xl-flex d-none flex-column me-4',
            html: [
                '<div class="pb-3">',
                '<div class="d-flex justify-content-between">',
                '<small class="wc-nav-view-small-name me-3">test</small>',
                '<div>',
                '<a class="wc-nav-view-prev" href="#"><i class="bi bi-chevron-left"></i></a>',
                '<a class="wc-nav-view-next ms-2" href="#"><i class="bi bi-chevron-right"></i></a>',
                '</div>',
                '</div>',
                '</div>',
                '<div class="wc-calendar-month-small"></div>'
            ].join('')
        }).appendTo(container);

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
            .on('click', '[data-date]', function (e) {
                e.preventDefault();
                const date = new Date($(e.currentTarget).attr('data-date'));
                setView($wrapper, 'day');
                setDate($wrapper, date);
                buildByView($wrapper);
            })
            .on('click', '[data-month]', function (e) {
                e.preventDefault();
                const date = new Date($(e.currentTarget).attr('data-month'));
                setView($wrapper, 'month');
                setDate($wrapper, date);
                buildByView($wrapper);
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
        dropdown.find('.dropdown-toggle').text(dropdown.find(`[data-view="${view}"]`).text());
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
        if (!['day', 'week', 'month', 'year'].includes(view)) {
            view = 'month';
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
        const view = getView($wrapper);
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
            default:
                break;
        }
        updateDropdownView($wrapper);
        setCurrentDateName($wrapper);
        buildMonthSmallView($wrapper, $('.wc-calendar-month-small'));
    }

    /**
     * Generates and appends a "Day View" section to the provided wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery wrapper element where the "Day View" section will be built.
     * @return {void} This method does not return any value.
     */
    function buildDayView($wrapper) {
        const container = getViewContainer($wrapper);
        $('<h1>', {text: 'Day View'}).appendTo(container);
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
        const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

        // Wochentagsnamen für Sonntag (0) bis Samstag (6) sammeln.
        const weekDays = [...Array(7).keys()].map(day =>
            formatter.format(new Date(Date.UTC(2023, 0, day + 1))) // Beispieljahr, Tag + 1
        );

        // Reihenfolge anpassen, wenn die Woche auf Montag starten soll.
        return startWeekOnSunday ? weekDays : weekDays.slice(1).concat(weekDays[0]);
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

        const { locale, startWeekOnSunday } = settings;

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
                class: 'col d-flex align-items-center justify-content-center',
                style: 'width: 24px',
                html: '<small></small>',
            })
        );

        // Dynamische Wochennamen basierend auf Locale und Flag
        const weekDays = getShortWeekDayNames(locale, startWeekOnSunday);
        weekDays.forEach(day => {
            weekdaysRow.append(
                $('<div>', {
                    class: 'text-center col flex-fill',
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
                    class: 'col d-flex align-items-start py-2 fw-bold text-bg-secondary justify-content-center',
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
                    class: `col border flex-fill d-flex flex-column align-items-center justify-content-start ${
                        isOtherMonth ? 'text-muted' : ''
                    } ${isToday ? '' : ''}`,
                }).appendTo(weekRow);

                $('<small>', {
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
    function buildMonthSmallView($wrapper, $container) {
        // Container für Miniaturansicht holen

        const settings = getSettings($wrapper);
        const date = getDate($wrapper); // Aktuelles Datum

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
                    maxWidth: '0px',
                    fontSize: '10px'
                },
                class: 'text-bg-secondary',
                text: calendarWeek,
            }).appendTo(weekRow); // KW in die erste Spalte der Zeile einfügen

            // Tage der Woche (Mo - So) hinzufügen
            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const dayClass = isToday ? 'rounded-circle text-bg-primary' : 'text-decoration-none'
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
        const day = date.toLocaleDateString(settings.locale, {day: 'numeric'});
        const month = date.toLocaleDateString(settings.locale, {month: 'numeric'});
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
        const container = getViewContainer($wrapper);
        $('<h1>', {text: 'Week View'}).appendTo(container);
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
            class: 'd-flex flex-wrap', // Flexbox für Inline-Darstellung
            css: {
                gap: '10px', // Abstand zwischen Kalendern
            },
        }).appendTo(container);

        // Für jeden Monat einen kleinen Kalender rendern
        for (let month = 0; month < 12; month++) {
            // Ein Wrapper für jeden Monatskalender erstellen
            const monthWrapper = $('<div>', {
                class: 'd-flex shadow p-3 flex-column rounded-'+settings.rounded+' align-items-center wc-year-month-container', // Col-Layout für Titel und Kalender
                css: {
                    width: '200px', // Feste Breite für jeden Kalender
                    margin: '5px', // Abstand am Rand
                },
            }).appendTo(grid);

            // Monatsname und Jahr als Titel (z. B. "Januar 2023")
            const monthName = new Intl.DateTimeFormat(settings.locale, { month: 'long' }).format(
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
            setDate($wrapper, tempDate); // Temporäres Datum setzen
            buildMonthSmallView($wrapper, monthContainer); // buildMonthSmallView verwenden
        }
    }
}(jQuery))
