(function ($) {
    const DEFAULTS = {
        locale: 'en-EN',
        rounded: 5, // 1-5
        startDate: new Date(),
        startView: 'month' // day, week, month, year
    };

    $.fn.bsCalendar = function (optionsOrMethod) {
        if ($(this).length > 1) {
            return $(this).each(function (i, e) {
                return $(e).bsCalendar(optionsOrMethod);
            });
        }


        const optionsGiven = typeof optionsOrMethod === 'object';
        const methodGiven = typeof optionsOrMethod === 'string';

        const wrapper = $(this);
        if (!wrapper.data('initBsCalendar')) {
            init();
        }


        function init() {
            let settings = DEFAULTS;
            if (optionsGiven) {
                settings = $.extend({}, DEFAULTS, wrapper.data(), optionsOrMethod);
            }
            wrapper.data('settings', settings);
            wrapper.data('view', settings.startView);
            wrapper.data('date', settings.startDate);
            buildFramework(wrapper);
            buildMonthSmallView(wrapper)
            buildByView(wrapper);
            events(wrapper);
            wrapper.data('initBsCalendar', true);
        }


        return wrapper;
    }

    function buildFramework(wrapper) {

        const settings = getSettings(wrapper);
        // Clear the wrapper first
        wrapper.empty();

        const innerWrapper = $('<div>', {
            class: 'd-flex flex-column align-items-stretch h-100 w-100'
        }).appendTo(wrapper);

        const topNav = $('<div>', {
            class: 'd-flex align-items-center justify-content-end mb-3 wc-calendar-top-nav'
        }).appendTo(innerWrapper);

        const btnNew = $('<button>', {
            class: `btn rounded-${settings.rounded} border-3 border me-auto`,
            html: '<i class="bi bi-plus-lg"></i> Termin',
            click: function () {
                const date = new Date();
                setDate(wrapper, date);
                buildByView(wrapper);
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
            html: 'Heute',
            click: function () {
                const date = new Date();
                setDate(wrapper, date);
                buildByView(wrapper);
            }
        }).appendTo(topNav);
        const dropDownView = $('<div>', {
            class: 'dropdown wc-select-calendar-view',
            html: [
                `<a class="btn rounded-${settings.rounded} border border-3 dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">`,
                'Monat',
                '</a>',
                '<ul class="dropdown-menu">',
                '<li><a class="dropdown-item" data-view="day" href="#">Tag</a></li>',
                '<li><a class="dropdown-item" data-view="week" href="#">Woche</a></li>',
                '<li><a class="dropdown-item active" data-view="month" href="#">Monat</a></li>',
                '<li><a class="dropdown-item" data-view="year" href="#">Jahr</a></li>',
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

    function setCurrentDateName(wrapper) {
        const settings = getSettings(wrapper);
        const date = getDate(wrapper);
        const view = getView(wrapper);
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

    function prev(wrapper) {
        const view = getView(wrapper);
        const date = getDate(wrapper);
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
        setDate(wrapper, newDate);
        buildByView(wrapper);
    }

    function next(wrapper) {
        const view = getView(wrapper);
        const date = getDate(wrapper);
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
        setDate(wrapper, newDate);
        buildByView(wrapper);
    }

    function events(wrapper) {

        wrapper
            .on('click', '[data-date]', function (e) {
                e.preventDefault();
                const date = new Date($(e.currentTarget).attr('data-date'));
                setView(wrapper, 'day');
                setDate(wrapper, date);
                buildByView(wrapper);
            })
            .on('click', '.wc-nav-view-prev', function (e) {
                e.preventDefault();
                prev(wrapper);
            })
            .on('click', '.wc-nav-view-next', function (e) {
                e.preventDefault();
                next(wrapper);
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
                wrapper.data('view', view);
                buildByView(wrapper);
            })
    }

    function getSettings(wrapper) {
        return wrapper.data('settings');
    }

    function getView(wrapper) {
        return wrapper.data('view');
    }

    function setView(wrapper, view) {
        if (!['day', 'week', 'month', 'year'].includes(view)) {
            view = 'month';
        }
        wrapper.data('view', view);
    }

    /**
     * Retrieves the 'date' value from the provided wrapper's data.
     *
     * @param {jQuery} wrapper - The object containing the data method to fetch the 'date' value.
     * @return {Date} The value associated with the 'date' key in the wrapper's data.
     */
    function getDate(wrapper) {
        return wrapper.data('date');
    }

    function setDate(wrapper, date) {
        wrapper.data('date', date);
    }

    function getViewContainer(wrapper) {
        return wrapper.find('.wc-calendar-view-container');
    }

    function buildByView(wrapper) {
        const view = getView(wrapper);
        const container = getViewContainer(wrapper).empty();
        switch (view) {
            case 'month':
                buildMonthView(wrapper);
                break;
            case 'week':
                buildWeekView(wrapper);
                break;
            case 'year':
                buildYearView(wrapper);
                break;
            case 'day':
                buildDayView(wrapper);
                break;
            default:
                break;
        }
        setCurrentDateName(wrapper);
        buildMonthSmallView(wrapper);
    }

    function buildDayView(wrapper) {
        const container = getViewContainer(wrapper);
        $('<h1>', {text: 'Day View'}).appendTo(container);
    }

    function getShortWeekDayNames(locale) {
        const weekDays = [];
        const date = new Date();

        // Für alle 7 Wochentage jeweils den Namen generieren
        for (let i = 0; i < 7; i++) {
            // Das Datum so setzen, dass es den i-ten Wochentag entspricht
            date.setDate(date.getDate() - date.getDay() + i);

            // Den kürzeren Wochentagsnamen mit der gewünschten Lokalisierung abrufen
            const weekdayName = date.toLocaleDateString(locale, {weekday: 'short'});
            weekDays.push(weekdayName);
        }
        return weekDays;
    }


    function buildMonthView(wrapper) {
        const container = getViewContainer(wrapper); // Container: `wc-calendar-view-container`
        const settings = getSettings(wrapper);
        const date = getDate(wrapper); // Startdatum

        // Berechnung der Kalenderdaten
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

        // Container leeren und Kalender vorbereiten
        container.empty();

        // Erste Zeile für Wochentage (Mo, Di, ...)
        const weekdaysRow = $('<div>', {
            class: 'row d-flex flex-nowrap wc-calendar-weekdays fw-bold text-bg-secondary'
        }).append(
            $('<div>', {
                class: 'col d-flex align-items-center justify-content-center',
                style: 'width: 24px',
                html: '<small></small>',
            })
        );
        const weekDays = getShortWeekDayNames(settings.locale);
        weekDays.forEach(day => {
            weekdaysRow.append(
                $('<div>', {
                    class: 'text-center col flex-fill',
                    html: `<small>${day}</small>`,
                })
            );
        });
        container.append(weekdaysRow);

        // Tage generieren
        let currentDate = new Date(calendarStart); // Startzeitpunkt
        while (currentDate <= calendarEnd) {
            // Neue Zeile für Woche hinzufügen
            const weekRow = $('<div>', {
                class: 'row d-flex flex-nowrap flex-fill wc-calendar-content',
            });

            // Kalenderwoche berechnen
            const calendarWeek = getCalendarWeek(currentDate);
            weekRow.append(
                $('<div>', {
                    class: 'col d-flex align-items-start py-2 fw-bold  justify-content-center text-bg-secondary',
                    style: 'width: 24px;',
                    html: `<small>${calendarWeek}</small>`,
                })
            );

            // Wochentage (Mo-So) einfügen
            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const dayClass = isToday ? 'rounded-circle text-bg-primary' : ''
                const dayWrapper = $('<div>', {
                    class: `col border flex-fill d-flex flex-column align-items-center justify-content-start ${
                        isOtherMonth ? 'text-muted' : ''
                    } ${isToday ? '' : ''}`
                }).appendTo(weekRow);

                const dayNumber = $('<small>', {
                    css: {
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        fontSize: '12px',
                    },
                    class: `${dayClass} text-center`,
                    text: currentDate.getDate(),
                }).appendTo(dayWrapper);

                // Zum nächsten Tag springen
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Woche in den Container einfügen
            container.append(weekRow);
        }
    }

    function buildMonthSmallView(wrapper) {
        // Container für Miniaturansicht holen
        const container = wrapper.find('.wc-calendar-month-small');
        const settings = getSettings(wrapper);
        const date = getDate(wrapper); // Aktuelles Datum

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
        container.empty();
        container.addClass('table-responsive');

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
        }).appendTo(container);

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
        const weekDays = getShortWeekDayNames(settings.locale);
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
                    'data-date': formatDate(currentDate),
                    css: {
                        fontSize: '10px',
                        width: '24px',
                        height: '24px',
                        lineHeight: '24px',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                    }, // Einheitliches Quadrat für Zentrierung
                    html: `<div class="${dayClass} w-100 h-100 d-flex justify-content-center align-items-center">${currentDate.getDate()}</div>`,
                }).appendTo(weekRow);
                // const dayNumber = $('<small>', {
                //     css: {height: '24px', lineHeight: '24px', fontSize: '10px'},
                //     class: `${isToday ? 'text-bg-primary rounded-circle p-1' : ''} ${
                //         isOtherMonth ? 'text-muted' : ''
                //     }`,
                //     text: currentDate.getDate(),
                // }).appendTo(td.find('a:first'));

                // Zum nächsten Tag springen
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
    }

    function formatDate(date) {
        const day = date.toLocaleDateString('en-EN', {day: 'numeric'});
        const month = date.toLocaleDateString('en-EN', {month: 'numeric'});
        const year = date.toLocaleDateString('en-EN', {year: 'numeric'});
        //
        // const year = currentDate.getFullYear();
        // const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Monate starten bei 0
        // const day = String(currentDate.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;

    }

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


    function buildWeekView(wrapper) {
        const container = getViewContainer(wrapper);
        $('<h1>', {text: 'Week View'}).appendTo(container);
    }

    function buildYearView(wrapper) {
        const container = getViewContainer(wrapper);
        $('<h1>', {text: 'Year View'}).appendTo(container);
    }
}(jQuery))
