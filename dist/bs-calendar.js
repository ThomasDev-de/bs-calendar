// noinspection JSUnresolvedReference,JSValidateTypes

/**
 * @fileOverview A jQuery plugin to create and manage a Bootstrap-based calendar with rich configuration options.
 *               This plugin provides functionalities for dynamic calendar creation, updating views,
 *               handling user interactions, and more. It is designed to be flexible, allowing customization
 *               through defined default settings or options provided at runtime.
 *
 * @author Thomas Kirsch
 * @version 2.3.6
 * @date 2026-06-17
 * @license MIT
 * @requires "jQuery" ^3
 * @requires "Bootstrap" ^v5
 * @requires "Bootstrap Icons" ^v1
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
 * @file bs-calendar.min.js
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

    const taskPriorityColors = {
        high: 'danger',
        normal: 'secondary',
        low: 'success',
    };

    // const localeKeys = ['today', 'day', 'week', 'month', 'year', 'agenda', 'search', 'searchNoResult'];
    const translations = {
        'ar': { // Arabic
            today: 'اليوم',
            day: 'يوم',
            '4day': '٤ أيام',
            week: 'أسبوع',
            month: 'شهر',
            year: 'سنة',
            agenda: 'جدول الأعمال',
            allDay: 'طوال اليوم',
            search: 'اكتب واضغط Enter',
            searchNoResult: 'لم يتم العثور على موعد',
            tasks: 'المهام',
            taskOpen: 'مفتوحة',
            taskDone: 'مكتملة',
            taskPriorityHigh: 'عالية',
            taskPriorityNormal: 'متوسطة',
            taskPriorityLow: 'منخفضة',
            duplicate: 'تكرار'
        },

        'he': { // Hebrew
            today: 'היום',
            day: 'יום',
            '4day': '4 ימים',
            week: 'שבוע',
            month: 'חודש',
            year: 'שנה',
            agenda: 'סדר יום',
            allDay: 'כל היום',
            search: 'הקלד ולחץ על Enter',
            searchNoResult: 'לא נמצא תור',
            tasks: 'משימות',
            taskOpen: 'פתוחות',
            taskDone: 'בוצעו',
            taskPriorityHigh: 'גבוהה',
            taskPriorityNormal: 'בינונית',
            taskPriorityLow: 'נמוכה',
            duplicate: 'שכפול'
        },

        'zh': { // Chinese Simplified
            today: '今天',
            day: '天',
            '4day': '4天',
            week: '周',
            month: '月',
            year: '年',
            agenda: '日程',
            allDay: '全天',
            search: '输入并按 Enter',
            searchNoResult: '未找到预约',
            tasks: '任务',
            taskOpen: '未完成',
            taskDone: '已完成',
            taskPriorityHigh: '高',
            taskPriorityNormal: '中',
            taskPriorityLow: '低',
            duplicate: '复制'
        },

        'en': { // English
            today: 'Today',
            day: 'Day',
            '4day': '4 Days',
            week: 'Week',
            month: 'Month',
            year: 'Year',
            agenda: 'Agenda',
            allDay: 'All day',
            search: 'Type and press Enter',
            searchNoResult: 'No appointment found',
            tasks: 'Tasks',
            taskOpen: 'Open',
            taskDone: 'Done',
            taskPriorityHigh: 'High',
            taskPriorityNormal: 'Medium',
            taskPriorityLow: 'Low',
            duplicate: 'Duplicate'
        },

        'de': { // German
            today: 'Heute',
            day: 'Tag',
            '4day': '4 Tage',
            week: 'Woche',
            month: 'Monat',
            year: 'Jahr',
            agenda: 'Terminliste',
            allDay: 'Ganztägig',
            search: 'Tippen und Enter drücken',
            searchNoResult: 'Keinen Termin gefunden',
            tasks: 'Aufgaben',
            taskOpen: 'Offen',
            taskDone: 'Erledigt',
            taskPriorityHigh: 'Hoch',
            taskPriorityNormal: 'Mittel',
            taskPriorityLow: 'Niedrig',
            duplicate: 'Duplizieren'
        },

        'es': { // Spanish
            today: 'Hoy',
            day: 'Día',
            '4day': '4 días',
            week: 'Semana',
            month: 'Mes',
            year: 'Año',
            agenda: 'Agenda',
            allDay: 'Todo el día',
            search: 'Escribe y pulsa Enter',
            searchNoResult: 'No se encontró ninguna cita',
            tasks: 'Tareas',
            taskOpen: 'Abiertas',
            taskDone: 'Completadas',
            taskPriorityHigh: 'Alta',
            taskPriorityNormal: 'Media',
            taskPriorityLow: 'Baja',
            duplicate: 'Duplicar'
        },

        'fr': { // French
            today: 'Aujourd’hui',
            day: 'Jour',
            '4day': '4 jours',
            week: 'Semaine',
            month: 'Mois',
            year: 'Année',
            agenda: 'Agenda',
            allDay: 'Toute la journée',
            search: 'Tapez et appuyez sur Entrée',
            searchNoResult: 'Aucun rendez-vous trouvé',
            tasks: 'Tâches',
            taskOpen: 'Ouvertes',
            taskDone: 'Terminées',
            taskPriorityHigh: 'Élevée',
            taskPriorityNormal: 'Moyenne',
            taskPriorityLow: 'Faible',
            duplicate: 'Dupliquer'
        },

        'it': { // Italian
            today: 'Oggi',
            day: 'Giorno',
            '4day': '4 giorni',
            week: 'Settimana',
            month: 'Mese',
            year: 'Anno',
            agenda: 'Agenda',
            allDay: 'Tutto il giorno',
            search: 'Digita e premi Invio',
            searchNoResult: 'Nessun appuntamento trovato',
            tasks: 'Attività',
            taskOpen: 'Aperte',
            taskDone: 'Completate',
            taskPriorityHigh: 'Alta',
            taskPriorityNormal: 'Media',
            taskPriorityLow: 'Bassa',
            duplicate: 'Duplica'
        },

        'pt': { // Portuguese
            today: 'Hoje',
            day: 'Dia',
            '4day': '4 dias',
            week: 'Semana',
            month: 'Mês',
            year: 'Ano',
            agenda: 'Agenda',
            allDay: 'Dia inteiro',
            search: 'Digite e pressione Enter',
            searchNoResult: 'Nenhum compromisso encontrado',
            tasks: 'Tarefas',
            taskOpen: 'Abertas',
            taskDone: 'Concluídas',
            taskPriorityHigh: 'Alta',
            taskPriorityNormal: 'Média',
            taskPriorityLow: 'Baixa',
            duplicate: 'Duplicar'
        },

        'nl': { // Dutch
            today: 'Vandaag',
            day: 'Dag',
            '4day': '4 dagen',
            week: 'Week',
            month: 'Maand',
            year: 'Jaar',
            agenda: 'Agenda',
            allDay: 'Hele dag',
            search: 'Typ en druk op Enter',
            searchNoResult: 'Geen afspraak gevonden',
            tasks: 'Taken',
            taskOpen: 'Open',
            taskDone: 'Voltooid',
            taskPriorityHigh: 'Hoog',
            taskPriorityNormal: 'Gemiddeld',
            taskPriorityLow: 'Laag',
            duplicate: 'Dupliceren'
        },

        'pl': { // Polish
            today: 'Dzisiaj',
            day: 'Dzień',
            '4day': '4 dni',
            week: 'Tydzień',
            month: 'Miesiąc',
            year: 'Rok',
            agenda: 'Agenda',
            allDay: 'Cały dzień',
            search: 'Wpisz i naciśnij Enter',
            searchNoResult: 'Nie znaleziono terminu',
            tasks: 'Zadania',
            taskOpen: 'Otwarte',
            taskDone: 'Ukończone',
            taskPriorityHigh: 'Wysoki',
            taskPriorityNormal: 'Średni',
            taskPriorityLow: 'Niski',
            duplicate: 'Duplikuj'
        },

        'ru': { // Russian
            today: 'Сегодня',
            day: 'День',
            '4day': '4 дня',
            week: 'Неделя',
            month: 'Месяц',
            year: 'Год',
            agenda: 'Повестка',
            allDay: 'Весь день',
            search: 'Введите и нажмите Enter',
            searchNoResult: 'Встреча не найдена',
            tasks: 'Задачи',
            taskOpen: 'Открытые',
            taskDone: 'Выполненные',
            taskPriorityHigh: 'Высокий',
            taskPriorityNormal: 'Средний',
            taskPriorityLow: 'Низкий',
            duplicate: 'Дублировать'
        },

        'uk': { // Ukrainian
            today: 'Сьогодні',
            day: 'День',
            '4day': '4 дні',
            week: 'Тиждень',
            month: 'Місяць',
            year: 'Рік',
            agenda: 'Порядок денний',
            allDay: 'Увесь день',
            search: 'Введіть і натисніть Enter',
            searchNoResult: 'Запис не знайдено',
            tasks: 'Завдання',
            taskOpen: 'Відкриті',
            taskDone: 'Виконані',
            taskPriorityHigh: 'Високий',
            taskPriorityNormal: 'Середній',
            taskPriorityLow: 'Низький',
            duplicate: 'Дублювати'
        },

        'tr': { // Turkish
            today: 'Bugün',
            day: 'Gün',
            '4day': '4 gün',
            week: 'Hafta',
            month: 'Ay',
            year: 'Yıl',
            agenda: 'Ajanda',
            allDay: 'Tüm gün',
            search: 'Yazın ve Enter’a basın',
            searchNoResult: 'Randevu bulunamadı',
            tasks: 'Görevler',
            taskOpen: 'Açık',
            taskDone: 'Tamamlandı',
            taskPriorityHigh: 'Yüksek',
            taskPriorityNormal: 'Orta',
            taskPriorityLow: 'Düşük',
            duplicate: 'Çoğalt'
        },

        'ja': { // Japanese
            today: '今日',
            day: '日',
            '4day': '4日間',
            week: '週',
            month: '月',
            year: '年',
            agenda: '予定リスト',
            allDay: '終日',
            search: '入力して Enter を押してください',
            searchNoResult: '予約が見つかりません',
            tasks: 'タスク',
            taskOpen: '未完了',
            taskDone: '完了',
            taskPriorityHigh: '高',
            taskPriorityNormal: '中',
            taskPriorityLow: '低',
            duplicate: '複製'
        },

        'ko': { // Korean
            today: '오늘',
            day: '일',
            '4day': '4일',
            week: '주',
            month: '월',
            year: '년',
            agenda: '일정',
            allDay: '종일',
            search: '입력 후 Enter를 누르세요',
            searchNoResult: '예약을 찾을 수 없습니다',
            tasks: '작업',
            taskOpen: '미완료',
            taskDone: '완료',
            taskPriorityHigh: '높음',
            taskPriorityNormal: '보통',
            taskPriorityLow: '낮음',
            duplicate: '복제'
        },

        'hi': { // Hindi
            today: 'आज',
            day: 'दिन',
            '4day': '4 दिन',
            week: 'सप्ताह',
            month: 'महीना',
            year: 'वर्ष',
            agenda: 'एजेंडा',
            allDay: 'पूरे दिन',
            search: 'टाइप करें और Enter दबाएँ',
            searchNoResult: 'कोई अपॉइंटमेंट नहीं मिला',
            tasks: 'कार्य',
            taskOpen: 'खुला',
            taskDone: 'पूर्ण',
            taskPriorityHigh: 'उच्च',
            taskPriorityNormal: 'मध्यम',
            taskPriorityLow: 'निम्न',
            duplicate: 'डुप्लिकेट करें'
        },

        'id': { // Indonesian
            today: 'Hari ini',
            day: 'Hari',
            '4day': '4 hari',
            week: 'Minggu',
            month: 'Bulan',
            year: 'Tahun',
            agenda: 'Agenda',
            allDay: 'Sepanjang hari',
            search: 'Ketik lalu tekan Enter',
            searchNoResult: 'Janji temu tidak ditemukan',
            tasks: 'Tugas',
            taskOpen: 'Terbuka',
            taskDone: 'Selesai',
            taskPriorityHigh: 'Tinggi',
            taskPriorityNormal: 'Sedang',
            taskPriorityLow: 'Rendah',
            duplicate: 'Duplikat'
        },

        'vi': { // Vietnamese
            today: 'Hôm nay',
            day: 'Ngày',
            '4day': '4 ngày',
            week: 'Tuần',
            month: 'Tháng',
            year: 'Năm',
            agenda: 'Lịch trình',
            allDay: 'Cả ngày',
            search: 'Nhập và nhấn Enter',
            searchNoResult: 'Không tìm thấy lịch hẹn',
            tasks: 'Nhiệm vụ',
            taskOpen: 'Đang mở',
            taskDone: 'Hoàn thành',
            taskPriorityHigh: 'Cao',
            taskPriorityNormal: 'Trung bình',
            taskPriorityLow: 'Thấp',
            duplicate: 'Nhân bản'
        },

        'th': { // Thai
            today: 'วันนี้',
            day: 'วัน',
            '4day': '4 วัน',
            week: 'สัปดาห์',
            month: 'เดือน',
            year: 'ปี',
            agenda: 'กำหนดการ',
            allDay: 'ทั้งวัน',
            search: 'พิมพ์แล้วกด Enter',
            searchNoResult: 'ไม่พบการนัดหมาย',
            tasks: 'งาน',
            taskOpen: 'เปิดอยู่',
            taskDone: 'เสร็จสิ้น',
            taskPriorityHigh: 'สูง',
            taskPriorityNormal: 'ปานกลาง',
            taskPriorityLow: 'ต่ำ',
            duplicate: 'ทำซ้ำ'
        },

        'cs': { // Czech
            today: 'Dnes',
            day: 'Den',
            '4day': '4 dny',
            week: 'Týden',
            month: 'Měsíc',
            year: 'Rok',
            agenda: 'Agenda',
            allDay: 'Celý den',
            search: 'Napište a stiskněte Enter',
            searchNoResult: 'Nebyla nalezena žádná schůzka',
            tasks: 'Úkoly',
            taskOpen: 'Otevřené',
            taskDone: 'Hotové',
            taskPriorityHigh: 'Vysoká',
            taskPriorityNormal: 'Střední',
            taskPriorityLow: 'Nízká',
            duplicate: 'Duplikovat'
        },

        'sv': { // Swedish
            today: 'Idag',
            day: 'Dag',
            '4day': '4 dagar',
            week: 'Vecka',
            month: 'Månad',
            year: 'År',
            agenda: 'Agenda',
            allDay: 'Hela dagen',
            search: 'Skriv och tryck på Enter',
            searchNoResult: 'Ingen tid hittades',
            tasks: 'Uppgifter',
            taskOpen: 'Öppna',
            taskDone: 'Klarmarkerade',
            taskPriorityHigh: 'Hög',
            taskPriorityNormal: 'Medel',
            taskPriorityLow: 'Låg',
            duplicate: 'Duplicera'
        },

        'da': { // Danish
            today: 'I dag',
            day: 'Dag',
            '4day': '4 dage',
            week: 'Uge',
            month: 'Måned',
            year: 'År',
            agenda: 'Agenda',
            allDay: 'Hele dagen',
            search: 'Skriv og tryk på Enter',
            searchNoResult: 'Ingen aftale fundet',
            tasks: 'Opgaver',
            taskOpen: 'Åbne',
            taskDone: 'Fuldførte',
            taskPriorityHigh: 'Høj',
            taskPriorityNormal: 'Mellem',
            taskPriorityLow: 'Lav',
            duplicate: 'Dupliker'
        },

        'no': { // Norwegian
            today: 'I dag',
            day: 'Dag',
            '4day': '4 dager',
            week: 'Uke',
            month: 'Måned',
            year: 'År',
            agenda: 'Agenda',
            allDay: 'Hele dagen',
            search: 'Skriv og trykk på Enter',
            searchNoResult: 'Ingen avtale funnet',
            tasks: 'Oppgaver',
            taskOpen: 'Åpne',
            taskDone: 'Fullført',
            taskPriorityHigh: 'Høy',
            taskPriorityNormal: 'Middels',
            taskPriorityLow: 'Lav',
            duplicate: 'Dupliser'
        },

        'fi': { // Finnish
            today: 'Tänään',
            day: 'Päivä',
            '4day': '4 päivää',
            week: 'Viikko',
            month: 'Kuukausi',
            year: 'Vuosi',
            agenda: 'Agenda',
            allDay: 'Koko päivä',
            search: 'Kirjoita ja paina Enter',
            searchNoResult: 'Aikaa ei löytynyt',
            tasks: 'Tehtävät',
            taskOpen: 'Avoimet',
            taskDone: 'Valmiit',
            taskPriorityHigh: 'Korkea',
            taskPriorityNormal: 'Keskitaso',
            taskPriorityLow: 'Matala',
            duplicate: 'Monista'
        },

        'ro': { // Romanian
            today: 'Astăzi',
            day: 'Zi',
            '4day': '4 zile',
            week: 'Săptămână',
            month: 'Lună',
            year: 'An',
            agenda: 'Agendă',
            allDay: 'Toată ziua',
            search: 'Tastează și apasă Enter',
            searchNoResult: 'Nu a fost găsită nicio programare',
            tasks: 'Sarcini',
            taskOpen: 'Deschise',
            taskDone: 'Finalizate',
            taskPriorityHigh: 'Ridicată',
            taskPriorityNormal: 'Medie',
            taskPriorityLow: 'Scăzută',
            duplicate: 'Duplică'
        },

        'el': { // Greek
            today: 'Σήμερα',
            day: 'Ημέρα',
            '4day': '4 ημέρες',
            week: 'Εβδομάδα',
            month: 'Μήνας',
            year: 'Έτος',
            agenda: 'Ατζέντα',
            allDay: 'Όλη μέρα',
            search: 'Πληκτρολογήστε και πατήστε Enter',
            searchNoResult: 'Δεν βρέθηκε ραντεβού',
            tasks: 'Εργασίες',
            taskOpen: 'Ανοιχτές',
            taskDone: 'Ολοκληρωμένες',
            taskPriorityHigh: 'Υψηλή',
            taskPriorityNormal: 'Μεσαία',
            taskPriorityLow: 'Χαμηλή',
            duplicate: 'Διπλότυπο'
        }
    };

    $.bsCalendar = {
        version: '2.3.6',
        about: {
            version: '2.3.6',
            releaseDate: '2026-06-16',
            project: 'https://github.com/ThomasDev-de/bs-calendar/',
            issues: 'https://github.com/ThomasDev-de/bs-calendar/issues',
            releases: 'https://github.com/ThomasDev-de/bs-calendar/releases',
            readme: 'https://github.com/ThomasDev-de/bs-calendar/blob/main/README.md',
            changelog: 'https://github.com/ThomasDev-de/bs-calendar/blob/main/changelog.md',
            demo: 'https://github.webcito.de/?bootswatch=bootstrap&plugin=bs-calendar',
            sponsor: 'https://www.paypal.com/paypalme/thomaskirsch1529',
            license: 'MIT'
        },
        setDefaults(options) {
            this.DEFAULTS = $.extend(true, {}, this.DEFAULTS, options || {});
        },
        getDefaults() {
            return this.DEFAULTS;
        },
        possibleViews: ['agenda', '4day', 'day', 'week', 'month', 'year'],
        addTranslation(locale, translation) {
            const loc = locale.split('-')[0].toLowerCase();

            translations[loc] = $.extend(
                true,
                {},
                translations['en'],
                translation
            );
        },
        getTranslations(locale) {
            const loc = locale.split('-')[0].toLowerCase();
            return translations?.[loc] || translations?.['en'];
        },
        getTranslation(locale, key) {
            const loc = locale.split('-')[0].toLowerCase();

            return translations?.[loc]?.[key]
                ?? translations?.['en']?.[key]
                ?? key;
        },
        DEFAULTS: {
            showAbout: true,
            locale: 'en-GB', // language and country
            title: null,
            startWeekOnSunday: true,
            navigateOnWheel: true,
            rounded: 5, // 1-5
            border: "border border-0 rounded-0 shadow",
            search: {
                limit: 10,
                offset: 0
            },
            startDate: new Date(),
            startView: 'month', // agenda, day, week, month, year, 4day
            mainColor: 'primary',
            views: ['year', 'month', 'agenda', 'week', '4day', 'day'],
            holidays: null,
            showAddButton: true,
            draggable: false,
            draggableSnapMinutes: 5,
            translations: null,
            icons: {
                day: 'bi bi-calendar-day',
                '4day': 'bi bi-calendar-range',
                week: 'bi bi-kanban',
                month: 'bi bi-calendar-month',
                year: 'bi bi-calendar4',
                agenda: 'bi bi-list-ul',
                about: 'bi bi-info-circle',
                add: 'bi bi-plus-lg',
                menu: 'bi bi-layout-sidebar-inset',
                search: 'bi bi-search',
                prev: 'bi bi-chevron-left',
                next: 'bi bi-chevron-right',
                link: 'bi bi-box-arrow-up-right',
                appointment: 'bi bi-clock',
                appointmentAllDay: 'bi bi-brightness-high',
                duplicate: 'bi bi-copy',
                task: 'bi bi-circle',
                taskDone: 'bi bi-check2-circle',
                taskOverdue: 'bi bi-exclamation-circle'
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
                monthExpanded: formatterMonthExpanded,
                agenda: formatterAgenda,
                search: formatterSearch,
                holiday: formatterHoliday,
                window: formatInfoWindow,
                duration: formatDuration,
            },
            hourSlots: {
                height: 30, // one hour in px
                start: 0, // starting hour as integer
                end: 24, // ending hour as integer
                rules: null
            },
            appointmentRules: {
                durationMinutes: null,
                durationStepMinutes: null,
                minDurationMinutes: null,
                maxDurationMinutes: null
            },
            calendars: null,
            onAll: null,
            onInit: null,
            onAdd: null,
            onAdded: null,
            onEdit: null,
            onEdited: null,
            onDuplicate: null,
            onDelete: null,
            onDeleted: null,
            onView: null,
            onBeforeLoad: null,
            onAfterLoad: null,
            onTaskStatusChanged: null,
            onShowInfoWindow: null,
            onHideInfoWindow: null,
            onNavigateForward: null,
            onNavigateBack: null,
            storeState: false,
            showTasks: true,
            debug: false
        },
        utils: {
            /**
             * Parses a time value (string "HH:mm" or number) to a decimal hour.
             *
             * @param {string|number} value - The time value to parse.
             * @return {number} The decimal hour (e.g., 8.5 for "08:30").
             */
            parseTimeToDecimal(value) {
                if (typeof value === 'number') {
                    return value;
                }
                if (typeof value === 'string' && value.includes(':')) {
                    const parts = value.split(':');
                    const hours = parseInt(parts[0], 10) || 0;
                    const minutes = parseInt(parts[1], 10) || 0;
                    return hours + (minutes / 60);
                }
                const num = parseFloat(value);
                return isNaN(num) ? 0 : num;
            },
            /**
             * Converts an ICS (iCalendar) string into an array of appointment objects compatible with bsCalendar.
             *
             * @param {string} icsData - The raw ICS string data.
             * @return {Array<Object>} An array of appointment objects.
             */
            convertIcsToAppointments: (icsData) => {
                const appointments = [];

                // 1. Unfold lines (handle multi-line values starting with space or tab)
                const lines = icsData.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
                const unfoldedLines = [];
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (/^[ \t]/.test(line) && unfoldedLines.length > 0) {
                        unfoldedLines[unfoldedLines.length - 1] += line.slice(1);
                    } else {
                        unfoldedLines.push(line.trim());
                    }
                }

                let currentEvent = null;

                // Helper: Simple ICS date parser (YYYYMMDD or YYYYMMDDTHHmmss[Z])
                const parseIcsDate = (val) => {
                    // Strip TZID etc., grab the value part (after last colon)
                    const cleanVal = val.split(':').pop().replace('Z', '');
                    const isAllDay = cleanVal.length === 8;

                    // Extract date components from the ICS string
                    const y = cleanVal.substring(0, 4);
                    const m = cleanVal.substring(4, 6);
                    const d = cleanVal.substring(6, 8);

                    if (isAllDay) {
                        return {
                            dateStr: `${y}-${m}-${d} 00:00:00`,
                            allDay: true
                        };
                    }

                    // Extract time from ICS value (YYYYMMDDTHHmmss)
                    // Index 9 is where T starts usually, so 9-11 is Hour, 11-13 Minute, 13-15 Second
                    const h = cleanVal.substring(9, 11);
                    const min = cleanVal.substring(11, 13);
                    const s = cleanVal.substring(13, 15) || '00';

                    return {
                        dateStr: `${y}-${m}-${d} ${h}:${min}:${s}`,
                        allDay: false
                    };
                };

                // Helper: Unescape chars (\, \n, \;)
                const unescapeText = (text) => {
                    return text
                        .replace(/\\n/gi, '\n')
                        .replace(/\\N/gi, '\n')
                        .replace(/\\,/g, ',')
                        .replace(/\\;/g, ';')
                        .replace(/\\\\/g, '\\');
                };

                for (const line of unfoldedLines) {
                    if (line.trim() === 'BEGIN:VEVENT') {
                        currentEvent = {
                            ATTENDEES: []
                        };
                        continue;
                    }
                    if (line.trim() === 'END:VEVENT') {
                        if (currentEvent) {
                            // Build appointment
                            // Ensure DTSTART exists, otherwise skip or default
                            const startRaw = currentEvent.DTSTART || '';
                            const endRaw = currentEvent.DTEND || null;

                            if (startRaw) {
                                const startData = parseIcsDate(startRaw);
                                let endData = endRaw ? parseIcsDate(endRaw) : null;

                                // Fallback if no end date
                                if (!endData) {
                                    endData = {dateStr: startData.dateStr, allDay: startData.allDay};
                                }

                                const appt = {
                                    title: unescapeText(currentEvent.SUMMARY || 'No Title'),
                                    description: unescapeText(currentEvent.DESCRIPTION || ''),
                                    location: unescapeText(currentEvent.LOCATION || ''),

                                    // Mapping extra fields
                                    link: currentEvent.URL || null,
                                    categories: currentEvent.CATEGORIES ? unescapeText(currentEvent.CATEGORIES) : null,
                                    status: currentEvent.STATUS || null,
                                    organizer: currentEvent.ORGANIZER || null,
                                    attendees: currentEvent.ATTENDEES.length > 0 ? currentEvent.ATTENDEES : null,

                                    start: startData.dateStr,
                                    end: endData.dateStr,
                                    allDay: startData.allDay
                                };

                                if (currentEvent.UID) {
                                    appt.id = currentEvent.UID;
                                }

                                appointments.push(appt);
                            }
                        }
                        currentEvent = null;
                        continue;
                    }

                    if (currentEvent) {
                        const colonIndex = line.indexOf(':');
                        if (colonIndex > -1) {
                            const keyPart = line.substring(0, colonIndex);
                            const valuePart = line.substring(colonIndex + 1);

                            // Extract main key name (split by ; to remove parameters like VALUE=DATE)
                            const mainKey = keyPart.split(';')[0];

                            if (['SUMMARY', 'DESCRIPTION', 'LOCATION', 'UID', 'URL', 'CATEGORIES', 'STATUS', 'ORGANIZER'].includes(mainKey)) {
                                currentEvent[mainKey] = valuePart;
                            } else if (mainKey === 'ATTENDEE') {
                                currentEvent.ATTENDEES.push(valuePart);
                            } else if (mainKey === 'DTSTART') {
                                currentEvent.DTSTART = line; // keep full line to parse params if needed later
                            } else if (mainKey === 'DTEND') {
                                currentEvent.DTEND = line;
                            }
                        }
                    }
                }

                return appointments;
            },
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
             * Parses date input in a timezone-safe way.
             * - `YYYY-MM-DD` is interpreted as a local date (not UTC).
             * - `YYYY-MM-DD HH:mm[:ss]` and `YYYY-MM-DDTHH:mm[:ss]` are interpreted as local date-time.
             * - Strings with timezone info (e.g. `Z` or `+02:00`) are delegated to native parsing.
             *
             * @param {Date|string|number} input
             * @returns {Date}
             */
            parseDateInput: (input) => {
                if (input instanceof Date) {
                    return new Date(input.getTime());
                }
                if (typeof input === 'number') {
                    return new Date(input);
                }
                if (typeof input !== 'string') {
                    return new Date(input);
                }

                const value = input.trim();
                const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
                if (dateOnlyMatch) {
                    const year = parseInt(dateOnlyMatch[1], 10);
                    const month = parseInt(dateOnlyMatch[2], 10) - 1;
                    const day = parseInt(dateOnlyMatch[3], 10);
                    return new Date(year, month, day, 0, 0, 0, 0);
                }

                const localDateTimeMatch = value.match(
                    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/
                );
                if (localDateTimeMatch) {
                    const year = parseInt(localDateTimeMatch[1], 10);
                    const month = parseInt(localDateTimeMatch[2], 10) - 1;
                    const day = parseInt(localDateTimeMatch[3], 10);
                    const hour = parseInt(localDateTimeMatch[4], 10);
                    const minute = parseInt(localDateTimeMatch[5], 10);
                    const second = parseInt(localDateTimeMatch[6] || '0', 10);
                    return new Date(year, month, day, hour, minute, second, 0);
                }

                return new Date(value);
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
                    date = $.bsCalendar.utils.parseDateInput(date);
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
                // Use local noon to avoid timezone rollovers (e.g. US timezones showing previous day).
                const weekDays = [...Array(7).keys()].map(day =>
                    // Use a fixed local date at 12:00 to keep weekday names stable across time zones.
                    formatter.format(new Date(2023, 0, day + 1, 12, 0, 0, 0))
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
                const dateObj = typeof date === 'string' ? $.bsCalendar.utils.parseDateInput(date) : date;
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
                    if (inputColor.startsWith("var(--")) {
                        return $.bsCalendar.utils.getComputedStyles(inputColor);
                    }

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
                // Check if input is a CSS variable
                const isVar = inputClassNames.startsWith("var(--");

                // Vereinfachte Implementierung: nur Bootstrap 5+ wird unterstützt.
                const classList = isVar ? [] : inputClassNames.split(" ").map(className => {
                    if (className.includes("opacity") || className.includes("gradient") || className.includes("bg-")) {
                        return className;
                    } else {
                        // Für Bootstrap 5 versuchen wir text-bg-*, aber wir behalten das Original als Fallback.
                        return className;
                    }
                });

                const tempElement = document.createElement("div");
                tempElement.style.visibility = "hidden";
                tempElement.style.position = "absolute";
                tempElement.style.left = "-9999px";
                tempElement.style.top = "-9999px";
                tempElement.style.pointerEvents = "none";
                document.body.appendChild(tempElement);

                if (isVar) {
                    tempElement.style.backgroundColor = inputClassNames;
                } else {
                    // Wir wenden sowohl das Original (z.B. "primary") als auch "text-bg-*" an,
                    // um maximale Kompatibilität mit verschiedenen Bootstrap-Versionen zu erreichen.
                    inputClassNames.split(" ").forEach(className => {
                        if (!className.includes("opacity") && !className.includes("gradient") && !className.startsWith("bg-") && !className.startsWith("text-bg-")) {
                            tempElement.classList.add(`text-bg-${className}`);
                            tempElement.classList.add(`bg-${className}`);
                        }
                        tempElement.classList.add(className);
                    });
                }

                const computedStyles = window.getComputedStyle(tempElement);

                const backgroundColor = computedStyles.backgroundColor || "rgba(0, 0, 0, 0)";
                const backgroundImage = computedStyles.backgroundImage || "none";
                // Bei Bootstrap 5 kann die Textfarbe direkt aus den berechneten Styles genommen werden.
                let color = computedStyles.color || "#000000";

                if (isVar) {
                    // If it's a variable, we check if the computed color is actually different from default (often black)
                    // Or we just calculate the contrast ourselves to be sure.
                    const resolvedBg = backgroundColor;
                    const isDark = $.bsCalendar.utils.isDarkColor(resolvedBg);
                    color = isDark ? "#FFFFFF" : "#000000";
                }

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
                const varPattern = /^var\(--.*\)$/;

                // check whether input is a valid hex/RGB value or a defined color name
                return hexPattern.test(inputColor) || rgbPattern.test(inputColor) || varPattern.test(inputColor) || inputColor.toLowerCase() in $.bsCalendar.utils.colorNameToHex;
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
            toHex: (color) => {
                if (!color) return null;
                try {
                    color = $.bsCalendar.utils.resolveColor(color);
                } catch (e) {
                    return null;
                }
                if (typeof color !== 'string') return null;
                if (color.startsWith('#')) {
                    if (color.length === 4) {
                        return '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
                    }
                    return color.toLowerCase();
                }
                const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
                if (m) {
                    const r = parseInt(m[1], 10);
                    const g = parseInt(m[2], 10);
                    const b = parseInt(m[3], 10);
                    const hex = '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('');
                    return hex.toLowerCase();
                }
                return null;
            },
            getColors: (color, fallbackColor = null) => {
                const primaryResult = $.bsCalendar.utils.computeColor(color);
                const fallbackResult = primaryResult || $.bsCalendar.utils.computeColor(fallbackColor);

                const defaultValues = {
                    backgroundColor: "#000000", // black background, if nothing fits
                    backgroundImage: "none", // No background image by default
                    color: "#FFFFFF", // standard text color with a dark background
                };

                const result = {...defaultValues, ...fallbackResult};

                // compute hex representation of the backgroundColor (if possible)
                const hex = $.bsCalendar.utils.toHex(result.backgroundColor);

                return {
                    origin: color, // input for debug purposes
                    ...result,
                    hex: hex
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
                    date = $.bsCalendar.utils.parseDateInput(date);
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
            getLanguageAndCountry: (locale) => {
                const parts = locale.replace('_', '-').split('-');
                let language = parts[0].toLowerCase();
                let country = parts[1] ? parts[1].toUpperCase() : language.toUpperCase();
                return {language: language, country: country};
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

    const globalCalendarElements = {
        wrapper: '.bs-calendar-wrapper',
        infoModal: '#wcCalendarInfoWindowModal',
    };

    let globalEventsInitialized = false;
    const globalDragState = {
        createDragState: null,
        moveDragState: null,
        resizeDragState: null,
        monthMoveDragState: null,
        pendingCreate: null,
        pendingMove: null,
        pendingResize: null,
        touchDragLock: null,
        suppressSlotClickUntil: 0,
        suppressAppointmentClickUntil: 0,
        appointmentClickTimer: null,
        appointmentInfoToken: 0
    };

    const namespace = '.bs.calendar';

    /**
     * jQuery plugin that initializes and manages a Bootstrap-based calendar.
     * Provides functionality for creating, updating, and interacting with a dynamic calendar widget.
     *
     * @function
     * @name $.fn.bsCalendar
     * @param {Object|undefined|string} optionsOrMethod - Configuration options for the calendar or a method name.
     * @param {Object|undefined} params - Optional parameters for methods.
     * @returns {jQuery} An instance of jQuery that allows for method chaining.
     */
    $.fn.bsCalendar = function (optionsOrMethod, params) {
        // Support being called on a jQuery collection of elements.
        // Use `this` directly (idiomatic, avoids re-wrapping).
        if (this.length > 1) {
            return this.each(function (i, e) {
                return $(e).bsCalendar(optionsOrMethod, params);
            });
        }

        const wrapper = this; // jQuery instance wrapping a single element
        // Robust initialization check
        const existingData = wrapper.data('bsCalendar');
        const isInitialized = !!existingData && typeof existingData === 'object';

        // Distinguish between options object and method string (guard null)
        const optionsGiven = optionsOrMethod !== null && optionsOrMethod !== undefined && typeof optionsOrMethod === 'object' && !Array.isArray(optionsOrMethod);
        const methodGiven = typeof optionsOrMethod === 'string';

        if (!isInitialized) {
            wrapper.addClass(globalCalendarElements.wrapper.substring(1));
            const bsCalendarData = {
                elements: {
                    wrapperId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperSmallMonthCalendarId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperSmallMonthCalendarTitleId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperViewContainerId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperViewContainerTitleId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperTopNavId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperSideNavId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperCalendarsId: $.bsCalendar.utils.generateRandomString(8),
                    wrapperSearchNavId: $.bsCalendar.utils.generateRandomString(8),
                },
                loading: false,
                loadingHolidays: false,
                settings: $.bsCalendar.getDefaults(),
                appointments: [],
                sourceAppointments: [],
                date: new Date(),
                lastView: null,
                viewBeforeSearch: null,
                view: null,
                dataBefore: snapshotWrapperState(wrapper),
                searchMode: false,
                showTasks: true,
                searchPagination: null,
                xhrs: {
                    appointments: null
                },
                mainColor: null,
                borderBefore: null,
            };

            // Merge data-attributes (if any)
            if (wrapper.data()) {
                bsCalendarData.settings = $.extend(true, {}, bsCalendarData.settings, wrapper.data());
                if (Object.prototype.hasOwnProperty.call(wrapper.data(), 'views')) {
                    bsCalendarData.settings.views = Array.isArray(wrapper.data().views) ? [...wrapper.data().views] : wrapper.data().views;
                }
            }

            // Merge provided options (defensive)
            if (optionsGiven) {
                bsCalendarData.settings = $.extend(true, {}, bsCalendarData.settings, optionsOrMethod);
                if (Object.prototype.hasOwnProperty.call(optionsOrMethod, 'views')) {
                    bsCalendarData.settings.views = Array.isArray(optionsOrMethod.views) ? [...optionsOrMethod.views] : optionsOrMethod.views;
                }
            }

            // Backwards-compatible normalization for ignoreStore typo ("ingoreStore")
            // Accept both 'ignoreStore' and legacy misspelling 'ingoreStore'
            const ignoreStoreFlag =
                bsCalendarData.settings.ingoreStore === true;

            // Remove both possible keys to normalize settings object
            if (bsCalendarData.settings.hasOwnProperty('ingoreStore')) {
                delete bsCalendarData.settings.ingoreStore;
            }
            //
            if (bsCalendarData.settings.hasOwnProperty('border')) {
                bsCalendarData.borderBefore = bsCalendarData.settings.border;
            }

            // Apply normalized flag
            const ignoreStore = ignoreStoreFlag === true;

            normalizeSettings(bsCalendarData.settings);

            // Merge standardized translation units (locale-dependent)
            const t = $.bsCalendar.getTranslations(bsCalendarData.settings.locale);
            bsCalendarData.settings.translations = $.extend(true, {}, bsCalendarData.settings.translations || {}, t || {});

            // Resolve main color now (colors may depend on normalized settings)
            bsCalendarData.mainColor = $.bsCalendar.utils.getColors(bsCalendarData.settings.mainColor, 'primary');

            bsCalendarData.showTasks = bsCalendarData.settings.showTasks;

            // Persist data object on element
            setBsCalendarData(wrapper, bsCalendarData);

            // Restore view and calendar states from storage unless explicitly ignored
            if (!ignoreStore && bsCalendarData.settings.storeState) {
                try {
                    // Restore last view
                    const view = getFromLocalStorage(wrapper, 'view');
                    if (!$.bsCalendar.utils.isValueEmpty(view)) {
                        bsCalendarData.settings.startView = view;
                        updateSettings(wrapper, bsCalendarData.settings);
                    }

                    // restore showTasks
                    // bsCalendarData.settings.showTasks = getFromLocalStorage(wrapper, 'showTasks');
                    const showTasks = getFromLocalStorage(wrapper, 'showTasks');
                    if (!$.bsCalendar.utils.isValueEmpty(showTasks)) {
                        bsCalendarData.showTasks = showTasks;
                    }

                    // Restore active calendars if available
                    const storedActiveIds = getFromLocalStorage(wrapper, 'calendars');
                    if (Array.isArray(storedActiveIds) &&
                        bsCalendarData.settings.calendars && Array.isArray(bsCalendarData.settings.calendars)) {
                        bsCalendarData.settings.calendars.forEach(c => {
                            if (c && c.id !== undefined && c.id !== null) {
                                c.active = storedActiveIds.includes(String(c.id)) || storedActiveIds.includes(c.id);
                            }
                        });
                        // persist updated settings on wrapper
                        updateSettings(wrapper, bsCalendarData.settings);
                    }
                } catch (e) {
                    // don't fail initialization for storage read errors; log if debug
                    if (bsCalendarData.settings && bsCalendarData.settings.debug) {
                        log('Error reading view/calendars from storage during init:', e);
                    }
                }
            }

            // Initialize UI and events — handle promise rejection defensively
            init(wrapper).then(() => {
                onResize(wrapper, true);
            }).catch(err => {
                // If init fails, clean up and rethrow in debug
                if (bsCalendarData.settings && bsCalendarData.settings.debug) {
                    log('bsCalendar init failed:', err);
                }
            });
        }

        // Method-call path
        if (methodGiven) {
            const inSearchMode = getSearchMode(wrapper);
            switch (optionsOrMethod) {
                case 'refresh':
                    methods.refresh(wrapper, params);
                    break;
                case 'render':
                    methods.render(wrapper);
                    // methodRender(wrapper);
                    break;
                case 'clear':
                    if (!inSearchMode) {
                        methods.clear(wrapper);
                    } else {
                        if (getSettings(wrapper).debug) {
                            log('Attempt to call clear() in search mode — ignored.');
                        }
                    }
                    break;
                case 'updateOptions':
                    methods.updateOptions(wrapper, params);
                    break;
                case 'addAppointment':
                    methods.addAppointment(wrapper, params);
                    break;
                case 'editAppointment':
                    methods.editAppointment(wrapper, params);
                    break;
                case 'deleteAppointment':
                    methods.deleteAppointment(wrapper, params);
                    break;
                case 'destroy':
                    methods.destroy(wrapper);
                    break;
                case 'setDate':
                    if (!inSearchMode) {
                        methods.setDate(wrapper, params);
                    } else {
                        if (getSettings(wrapper).debug) {
                            log('Attempt to call setDate() in search mode — ignored.');
                        }
                    }
                    break;
                case 'setToday':
                    if (!inSearchMode) {
                        methods.setToday(wrapper, params);
                    } else {
                        if (getSettings(wrapper).debug) {
                            log('Attempt to call setToday() in search mode — ignored.');
                        }
                    }
                    break;
                case 'setView':
                    if (!inSearchMode) {
                        methods.setView(wrapper, params);
                    } else {
                        if (getSettings(wrapper).debug) {
                            log('Attempt to call setView() in search mode — ignored.');
                        }
                    }
                    break;
                case 'setHourSlotRules':
                    if (!inSearchMode) {
                        methods.setHourSlotRules(wrapper, params);
                    } else {
                        if (getSettings(wrapper).debug) {
                            log('Attempt to call setHourSlotRules() in search mode — ignored.');
                        }
                    }
                    break;
                case 'setLocale':
                    if (!inSearchMode) {
                        methods.setLocale(wrapper, params);
                    } else {
                        if (getSettings(wrapper).debug) {
                            log('Attempt to call setLocale() in search mode — ignored.');
                        }
                    }
                    break;
                default:
                    // Unknown method → warn in debug mode to help detect typos
                    const settings = getSettings(wrapper) || {};
                    if (settings.debug) {
                        console.warn(`bsCalendar: unknown method "${optionsOrMethod}" called.`);
                    }
                    break;
            }
        }

        // Support chaining
        return wrapper;
    }

    const methods = {
        deleteAppointment($wrapper, object) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;

            if (data.searchMode || data.view === 'year') {
                if (settings.debug) {
                    log('Attempt to call deleteAppointment() in search/year mode — ignored.');
                }
                return;
            }

            const appointmentIdParam = getAppointmentIdParam(object);
            if (appointmentIdParam === null || appointmentIdParam === undefined || String(appointmentIdParam).trim() === '') {
                if (settings.debug) {
                    log('deleteAppointment() expects an appointment id or an appointment object with an id.');
                }
                return;
            }

            const appointmentId = String(appointmentIdParam);
            const currentAppointments = getSourceAppointments($wrapper);
            const deletedAppointment = currentAppointments.find(appointment => hasAppointmentId(appointment) && String(appointment.id) === appointmentId);
            const appointments = currentAppointments
                .filter(appointment => !hasAppointmentId(appointment) || String(appointment.id) !== appointmentId)
                .map(appointment => copyAppointment(appointment));

            if (appointments.length === currentAppointments.length) {
                if (settings.debug) {
                    log('deleteAppointment() could not find appointment with id:', appointmentIdParam);
                }
                return;
            }

            checkAndSetAppointments($wrapper, appointments).then(_cleanedAppointments => {
                void _cleanedAppointments;
                const returnData = getAppointmentReturnData($wrapper, deletedAppointment);
                buildAppointmentsForView($wrapper);
                trigger($wrapper, 'deleted', returnData.appointment, returnData.extras);
            });
        },
        editAppointment($wrapper, object) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;

            if (data.searchMode || data.view === 'year') {
                if (settings.debug) {
                    log('Attempt to call editAppointment() in search/year mode — ignored.');
                }
                return;
            }

            const changes = getEditableAppointmentParams(object);
            if (!hasAppointmentId(changes)) {
                if (settings.debug) {
                    log('editAppointment() expects an appointment object with an id.');
                }
                return;
            }

            let found = false;
            const appointmentId = String(changes.recurringId || changes.id);
            const normalizedChanges = copyAppointment(changes);
            normalizedChanges.id = appointmentId;
            delete normalizedChanges.recurringId;
            delete normalizedChanges.recurrenceDate;
            delete normalizedChanges.recurrenceIndex;
            delete normalizedChanges.isOccurrence;

            const appointments = getSourceAppointments($wrapper).map(appointment => {
                if (hasAppointmentId(appointment) && String(appointment.id) === appointmentId) {
                    found = true;
                    const updatedAppointment = $.extend(true, {}, appointment, normalizedChanges);
                    delete updatedAppointment.extras;
                    return updatedAppointment;
                }
                return copyAppointment(appointment);
            });

            if (!found) {
                if (settings.debug) {
                    log('editAppointment() could not find appointment with id:', appointmentId);
                }
                return;
            }

            checkAndSetAppointments($wrapper, appointments).then(_cleanedAppointments => {
                const editedAppointment = _cleanedAppointments.find(item => hasAppointmentId(item) && String(item.id) === appointmentId) ||
                    getSourceAppointments($wrapper).find(item => hasAppointmentId(item) && String(item.id) === appointmentId);
                const returnData = getAppointmentReturnData($wrapper, editedAppointment || normalizedChanges);
                buildAppointmentsForView($wrapper);
                trigger($wrapper, 'edited', returnData.appointment, returnData.extras);
            });
        },
        addAppointment($wrapper, appointment) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;

            if (data.searchMode || data.view === 'year') {
                if (settings.debug) {
                    log('Attempt to call addAppointment() in search/year mode — ignored.');
                }
                return;
            }

            if (!appointment || typeof appointment !== 'object') {
                if (settings.debug) {
                    log('addAppointment() expects an appointment object.');
                }
                return;
            }

            ensureAppointmentId(appointment);

            const appointments = getSourceAppointments($wrapper).map(item => copyAppointment(item));
            appointments.push(copyAppointment(appointment));

            checkAndSetAppointments($wrapper, appointments).then(_cleanedAppointments => {
                const addedAppointment = _cleanedAppointments.find(item => hasAppointmentId(item) && String(item.id) === String(appointment.id)) ||
                    getSourceAppointments($wrapper).find(item => hasAppointmentId(item) && String(item.id) === String(appointment.id));
                const returnData = getAppointmentReturnData($wrapper, addedAppointment || appointment);
                buildAppointmentsForView($wrapper);
                trigger($wrapper, 'added', returnData.appointment, returnData.extras);
            });
        },
        /**
         * Updates the settings of a given wrapper element with the provided options.
         *
         * @param {jQuery} $wrapper - The jQuery-wrapped DOM element to which settings are applied.
         * @param {Object} options - An object containing new configuration options to update the settings.
         * @returns {void} This method does not return any value.
         */
        updateOptions($wrapper, options) {
            if (typeof options !== 'object' || !options) return;

            const data = getBsCalendarData($wrapper);
            const prevSettings = data.settings || {};
            const merged = $.extend(true, {}, prevSettings, options);
            if (Object.prototype.hasOwnProperty.call(options, 'views')) {
                merged.views = Array.isArray(options.views) ? [...options.views] : options.views;
            }
            if (Object.prototype.hasOwnProperty.call(options, 'sidebarAddons')) {
                // Falls ein neuer Selektor oder ein neues Element übergeben wird, nehmen wir dieses.
                // Ansonsten bleibt das bestehende (ggf. bereits gedetachte) erhalten.
                merged.sidebarAddons = Array.isArray(options.sidebarAddons) ? [...options.sidebarAddons] : options.sidebarAddons;
            }
            if (Object.prototype.hasOwnProperty.call(options, 'topbarAddons')) {
                merged.topbarAddons = Array.isArray(options.topbarAddons) ? [...options.topbarAddons] : options.topbarAddons;
            }
            if (
                options.hourSlots &&
                typeof options.hourSlots === 'object' &&
                Object.prototype.hasOwnProperty.call(options.hourSlots, 'rules')
            ) {
                merged.hourSlots.rules = copyHourSlotRules(options.hourSlots.rules);
            }
            if (Object.prototype.hasOwnProperty.call(options, 'calendars')) {
                if (Array.isArray(options.calendars) && Array.isArray(prevSettings.calendars)) {
                    // Erstelle eine Kopie der alten Kalender
                    const newCalendars = JSON.parse(JSON.stringify(prevSettings.calendars));
                    options.calendars.forEach(newCal => {
                        const index = newCalendars.findIndex(c => c.id === newCal.id);
                        if (index !== -1) {
                            // Bestehenden Kalender mergen
                            newCalendars[index] = $.extend(true, {}, newCalendars[index], newCal);
                        } else {
                            // Neuen Kalender hinzufügen
                            newCalendars.push(JSON.parse(JSON.stringify(newCal)));
                        }
                    });
                    merged.calendars = newCalendars;
                } else {
                    merged.calendars = Array.isArray(options.calendars) ? JSON.parse(JSON.stringify(options.calendars)) : options.calendars;
                }
            }
            const frameworkSensitiveOptionKeys = new Set([
                'border',
                'calendars',
                'icons',
                'rounded',
                'search',
                'showAbout',
                'showAddButton',
                'sidebarAddons',
                'title',
                'topbarAddons',
                'translations',
                'views',
                'locale',
                'holidays'
            ]);
            const optionKeys = Object.keys(options);
            const shouldRebuildFramework = optionKeys.some(key => frameworkSensitiveOptionKeys.has(key));
            const renderStateSensitiveOptionKeys = new Set([
                'mainColor'
            ]);
            const shouldInvalidateRenderState = shouldRebuildFramework ||
                optionKeys.some(key => renderStateSensitiveOptionKeys.has(key));
            const wasSearchMode = !!data.searchMode;
            const previousSearchValue = wasSearchMode ? (getSearchElement($wrapper)?.val() ?? '') : '';

            normalizeSettings(merged);

            // Locale oder Translations geändert? Dann Übersetzungen neu laden
            if (options.hasOwnProperty('locale') || options.hasOwnProperty('translations')) {
                const t = $.bsCalendar.getTranslations(merged.locale);
                merged.translations = $.extend(true, {}, t || {}, options.translations || {});
            }

            merged.ingoreStore = true;
            data.mainColor = $.bsCalendar.utils.getColors(merged.mainColor);
            // Apply new settings
            data.settings = merged;
            if (shouldInvalidateRenderState) {
                data.renderState = null;
            }
            setBsCalendarData($wrapper, data);

            // View change requested?
            if (options.hasOwnProperty('startView') && merged.views.includes(merged.startView)) {
                setView($wrapper, merged.startView);
            }

            // Date change requested?
            if (options.hasOwnProperty('startDate')) {
                setDate($wrapper, merged.startDate);
            }

            // Title/rounded simple UI tweaks (no full rebuild needed)
            if (typeof merged.title !== 'undefined') {
                $wrapper.find('[data-calendar-static-title]')
                    .html(merged.title || '');
            }

            if (shouldRebuildFramework) {
                buildFramework($wrapper);
                if (wasSearchMode && merged.search) {
                    data.searchMode = true;
                    setBsCalendarData($wrapper, data);
                    const searchElement = getSearchElement($wrapper);
                    if (searchElement && searchElement.length > 0) {
                        searchElement.val(previousSearchValue);
                    }
                    toggleSearchBar($wrapper, true);
                } else {
                    data.searchMode = false;
                    setBsCalendarData($wrapper, data);
                }
            }

            // Rebuild view once
            buildByView($wrapper, true);

            // Persist if enabled
            if (merged.storeState) {
                saveToLocalStorage($wrapper, 'settings', merged);
            }
        },
        /**
         * Clears specific elements within a given wrapper and optionally removes associated appointments.
         *
         * @param {jQuery} $wrapper - The wrapper element where the elements will be cleared.
         * @param {boolean} [removeAppointments=true] - Determines whether the appointments should also be removed.
         * @return {void} This function does not return a value.
         */
        clear($wrapper, removeAppointments = true) {
            destroyCalendarTooltips($wrapper);

            $wrapper.find('[data-appointment]').remove();
            $wrapper.find('[data-role="holiday"]').remove();
            $wrapper.find('[data-month-expand-toggle], [data-month-expanded-day]').remove();
            $wrapper.find('[data-month-expanded-active]').removeAttr('data-month-expanded-active');

            // Clean up holidays in year view (preserve the day element, just remove styling)
            $wrapper.find('.wc-holiday-marked').each(function () {
                $(this).removeClass('text-secondary wc-holiday-marked');
            });

            // Reset badges in year view
            $wrapper.find('.js-badge').text('').removeAttr('style');

            if (removeAppointments) {
                checkAndSetAppointments($wrapper, []).then(_cleanedAppointments => {
                    void _cleanedAppointments; // Prevents the warning, but serves no purpose
                });
            }
        },
        render($wrapper) {
            buildByView($wrapper, false, false);
            trigger($wrapper, 'render');
        },
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
        refresh($wrapper, object) {
            const data = getBsCalendarData($wrapper);
            const viewBefore = data.view;
            // Flag to track if settings need to be updated.
            let changeSettings = false;
            let changeView = false;
            // Check if 'params' is an object.
            if (typeof object === 'object') {
                // If 'params' contains 'url', update the 'url' in settings.
                if (object.hasOwnProperty('url')) {
                    data.settings.url = object.url;
                    // Mark that settings have been changed.
                    changeSettings = true;
                }

                if (object.hasOwnProperty('view') && data.settings.views.includes(object.view) && viewBefore !== object.view) {
                    data.settings.view = object.view;
                    changeView = true;
                    changeSettings = true;
                }

                if (object.hasOwnProperty('queryParams') && typeof object.queryParams === 'function') {
                    // If 'params' contains 'queryParams' and it is a function, update it in settings.
                    data.settings.queryParams = object.queryParams;
                    // Mark that settings have been changed.
                    changeSettings = true;
                }
            }
            if (changeSettings) {
                setBsCalendarData($wrapper, data);
            }

            buildByView($wrapper, changeView);
            trigger($wrapper, 'refresh');
        },
        /**
         * Destroys and cleans up the specified wrapper element by removing associated data and content.
         *
         * @param {jQuery} $wrapper - The jQuery-wrapped DOM element to be cleaned up and reset.
         * @return {void} Does not return a value.
         */
        destroy($wrapper, callback = null) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;
            $(globalCalendarElements.infoModal).modal("hide");
            methods.clear($wrapper);

            // Remove namespaced event handlers to avoid duplicate bindings on re-init
            // Remove window handlers (resize, etc.) and body handlers registered in handleEvents()
            try {
                $(window).off(namespace);
                $("body").off(namespace);
                $(document).off(namespace);
                $wrapper.off(namespace);
                // Defensive: also remove handlers that might have been bound without namespace
                $wrapper.find('*').off();
            } catch (e) {
                if (settings && settings.debug) {
                    log("Error while removing namespaced events during destroy:", e);
                }
            }

            // If there is an active request stored, try to abort it (jqXHR or AbortController)
            const abortXHRAppointments = abortXhr(data.xhrs.appointments);

            if (!abortXHRAppointments && settings.debug) {
                log("Error while aborting xhrs.appointments during destroy:", e);
            }


            $wrapper.removeClass("position-relative bs-calendar overflow-hidden");
            $wrapper.css({
                overflow: ''
            });
            // remove generated unique id attribute
            $wrapper.removeAttr('data-bs-calendar-id');
            $wrapper.empty();

            // Ensure any info modal DOM node is removed (cleanup)
            if ($(globalCalendarElements.infoModal).length) {
                try {
                    // Dispose bootstrap modal instance (Bootstrap 5)
                    try {
                        $(globalCalendarElements.infoModal).modal('dispose');
                    } catch (ignore) {
                        // fallback: ignore if dispose not available
                    }
                    $(globalCalendarElements.infoModal).remove();
                } catch (e) {
                    // ignore
                }
            }
            restoreWrapperState($wrapper);
            $wrapper.removeData("bsCalendar");
            if (typeof callback === 'function') {
                callback();
            }
        },
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
        setDate($wrapper, object) {

            const p = prepareParamsForMethodSetDate($wrapper, object);
            let date = p.date;
            let view = p.view;
            let viewChanged = false;

            if (view) {
                setView($wrapper, view);
                viewChanged = true;
            }

            if (date) {
                setDate($wrapper, date);
            }

            buildByView($wrapper, viewChanged);
        },
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
        setToday($wrapper, view) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;
            let viewChanged = false;
            if (view && settings.views.includes(view)) {
                const viewBefore = data.view;
                if (viewBefore !== view) {
                    data.view = view;
                    viewChanged = true;
                }
            }
            const date = new Date();
            data.date = date;
            setBsCalendarData($wrapper, data);
            buildByView($wrapper, viewChanged);
        },
        /**
         * Updates the current view of the calendar, if the new view is valid and different from the current view.
         *
         * @param {jQuery} $wrapper - The DOM element wrapping the calendar.
         * @param {string} view - The name of the view to set.
         * @return {void} This method does not return a value.
         */
        setView($wrapper, view) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;
            if (settings.debug) {
                log('methodSetView called with view:', view);
            }
            if (!view) {
                if (settings.debug) {
                    log('methodSetView: view is not provided');
                }
                return;
            }
            if (data.view === view) {
                if (settings.debug) {
                    log('methodSetView: view is already set to', view);
                }
                return;
            }
            if (!settings.views.includes(view)) {
                if (settings.debug) {
                    log('methodSetView: view', view, 'is not in available views', settings.views);
                }
                return;
            }
            setView($wrapper, view);
            buildByView($wrapper, true);
        },
        /**
         * Updates hour slot rules and refreshes the current view.
         *
         * @param {jQuery} $wrapper - The calendar wrapper.
         * @param {Object|Object[]|null} hourSlotRules - A rule object,
         * an array of rule objects, or null to disable rules.
         * @return {void}
         */
        setHourSlotRules($wrapper, hourSlotRules) {
            methods.updateOptions($wrapper, {
                hourSlots: {
                    rules: hourSlotRules
                }
            });
        },
        /**
         * Sets the locale for the given calendar wrapper.
         * Updates the calendar's settings to use the provided locale
         * if it differs from the currently set locale.
         *
         * @param {jQuery} $wrapper - The wrapper object containing the calendar instance.
         * @param {string} locale - The locale string to be set. It should follow the format "language_region".
         * @return {void} Returns nothing.
         */
        setLocale($wrapper, locale) {
            const data = getBsCalendarData($wrapper);
            const settings = data.settings;
            if (settings.debug) {
                log('methodSetLocale called with locale:', locale);
            }
            if (!locale) {
                if (settings.debug) {
                    log('methodSetLocale: locale is not provided');
                }
                return;
            }
            if (data.settings.locale === locale) {
                if (settings.debug) {
                    log('methodSetLocale: locale is already set to', locale);
                }
                return;
            }

            methods.updateOptions($wrapper, {
                locale: locale.replace('_', '-')
            });
        }
    };

    /**
     * Erzeugt einen Snapshot des aktuellen Wrapper-Zustands:
     * - tiefe Kopie von jQuery .data()
     * - DOM-Rohattribute: class, style, id
     * - alle data-* Attribute (roh)
     * - ausgewählte Zusatzattribute (title, role, aria-label, aria-describedby)
     *
     * @param {jQuery} $el
     * @return {Object}
     */
    function snapshotWrapperState($el) {
        // tiefe Kopie aller via jQuery .data() gesetzten Werte
        var snap = $.extend(true, {}, $el.data());

        // DOM-Metadaten
        var dom = {
            id: $el.attr('id') || null,
            class: $el.attr('class') || '',
            style: $el.attr('style') || ''
        };

        // alle rohen data-* Attribute einsammeln
        var dataAttrs = {};
        var node = $el.get(0);
        if (node && node.attributes) {
            $.each(node.attributes, function (_, attr) {
                if (attr && attr.name && attr.name.indexOf('data-') === 0) {
                    dataAttrs[attr.name] = attr.value;
                }
            });
        }
        dom.dataAttributes = dataAttrs;

        // optional: normalisierte Map der data-* ohne 'data-' Prefix
        // damit du später leichter vergleichen/zusammenführen kannst
        var normalizedData = {};
        Object.keys(dataAttrs).forEach(function (k) {
            var nk = k.slice(5); // entfernt 'data-'
            normalizedData[nk] = dataAttrs[k];
        });
        dom.normalizedData = normalizedData;

        // ausgewählte Zusatzattribute
        var keepAttrs = ['title', 'role', 'aria-label', 'aria-describedby'];
        var extras = {};
        for (var i = 0; i < keepAttrs.length; i++) {
            var val = $el.attr(keepAttrs[i]);
            if (typeof val !== 'undefined') {
                extras[keepAttrs[i]] = val;
            }
        }
        dom.attributes = extras;

        // Alles unter __dom__ ablegen
        snap.__dom__ = dom;

        // optional: eine kombinierte Sicht auf Daten (jQuery .data() hat Vorrang)
        snap.__allData__ = $.extend({}, normalizedData, snap);

        return snap;
    }

    /**
     * Stellt den zuvor gesnapten Wrapper-Zustand wieder her:
     * - class, style, id
     * - data-* Attribute (vorher entfernen, dann aus Snapshot setzen)
     * - ausgewählte Zusatzattribute (leeren/entfernen, dann aus Snapshot setzen)
     * Hinweis: jQuery .data() wird absichtlich nicht zurückgeschrieben, da diese
     *         Struktur die interne Plugin-State kollidieren könnte. Falls gewünscht,
     *         gezielt Keys zurückspielen.
     *
     * @param {jQuery} $el
     * @param {Object} snapshot
     */
    function restoreWrapperState($el, snapshot) {
        if (!snapshot || !snapshot.__dom__) {
            return;
        }
        var dom = snapshot.__dom__;

        // Klassen und Inline-Styles
        if (typeof dom.class === 'string') {
            $el.attr('class', dom.class);
        } else {
            $el.removeAttr('class');
        }
        if (typeof dom.style === 'string') {
            if (dom.style.length) {
                $el.attr('style', dom.style);
            } else {
                $el.removeAttr('style');
            }
        } else {
            $el.removeAttr('style');
        }

        // id (vorsichtig: konflikt mit existierenden IDs vermeiden)
        if (dom.id) {
            $el.attr('id', dom.id);
        } else {
            $el.removeAttr('id');
        }

        // existierende data-* Attribute entfernen
        var node = $el.get(0);
        if (node && node.attributes) {
            var toRemove = [];
            $.each(node.attributes, function (_, attr) {
                if (attr && attr.name && attr.name.indexOf('data-') === 0) {
                    toRemove.push(attr.name);
                }
            });
            for (var r = 0; r < toRemove.length; r++) {
                $el.removeAttr(toRemove[r]);
            }
        }
        // data-* aus Snapshot setzen
        if (dom.dataAttributes && typeof dom.dataAttributes === 'object') {
            Object.keys(dom.dataAttributes).forEach(function (k) {
                $el.attr(k, dom.dataAttributes[k]);
            });
        }

        // ausgewählte Zusatzattribute zurücksetzen
        var keepAttrs = ['title', 'role', 'aria-label', 'aria-describedby'];
        for (var i = 0; i < keepAttrs.length; i++) {
            $el.removeAttr(keepAttrs[i]);
        }
        if (dom.attributes && typeof dom.attributes === 'object') {
            Object.keys(dom.attributes).forEach(function (k) {
                var v = dom.attributes[k];
                if (typeof v !== 'undefined' && v !== null) {
                    $el.attr(k, v);
                }
            });
        }
    }

    /**
     * Sets the calendar data for the provided wrapper element.
     *
     * @param {jQuery} wrapper - The DOM element or jQuery wrapper object where the calendar data is stored.
     * @param {object} data - The data object containing settings and information to be stored in the wrapper.
     * @return {void} Does not return a value.
     */
    function setBsCalendarData(wrapper, data) {
        if (data.settings.debug) {
            log('setBsCalendarData:', data);
        }
        wrapper.data('bsCalendar', data);
    }

    /**
     * getBsCalendarData
     * Returns the Bootstrap Calendar data object stored on the given jQuery wrapper element.
     *
     * @param {jQuery} wrapper - A jQuery-wrapped DOM element that holds the 'bsCalendar' data.
     * @returns {*} The value associated with the 'bsCalendar' key on the wrapper, or undefined if not set.
     */
    function getBsCalendarData(wrapper) {
        // Access the jQuery data store on the element and retrieve the 'bsCalendar' entry
        return wrapper.data('bsCalendar');
    }


    /**
     * setAppointments
     * Updates the calendar data on the given wrapper with a new appointments array.
     * - Reads current calendar data from the wrapper
     * - Optionally logs for debugging
     * - Stores the provided appointments (or an empty array) back into the data
     * - Persists the updated data on the wrapper
     */
    function setAppointments(wrapper, appointments) {
        // Access plugin/configuration data tied to this wrapper
        const data = getBsCalendarData(wrapper);
        // If debug mode is enabled, log the incoming appointments for troubleshooting
        if (data.settings.debug) {
            log('setAppointments', appointments);
        }
        // Normalize and assign appointments to data (fallback to empty array if falsy)
        data.appointments = appointments || [];
        // Persist the updated data back onto the wrapper element
        setBsCalendarData(wrapper, data);
    }

    function setSourceAppointments(wrapper, appointments) {
        const data = getBsCalendarData(wrapper);
        data.sourceAppointments = Array.isArray(appointments)
            ? appointments.map(appointment => copyAppointment(appointment))
            : [];
        setBsCalendarData(wrapper, data);
    }

    /**
     * Retrieves the list of appointments associated with the provided wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery wrapper element containing the appointment data.
     * @return {Array<Object>} The appointment data stored in the wrapper element, or undefined if no data is found.
     */
    function getAppointments($wrapper) {
        const data = getBsCalendarData($wrapper);
        return data.appointments || [];
    }

    function getSourceAppointments($wrapper) {
        const data = getBsCalendarData($wrapper);
        return Array.isArray(data.sourceAppointments) ? data.sourceAppointments : (data.appointments || []);
    }

    function hasAppointmentId(appointment) {
        return appointment &&
            Object.prototype.hasOwnProperty.call(appointment, 'id') &&
            appointment.id !== null &&
            appointment.id !== undefined &&
            String(appointment.id).trim() !== '';
    }

    function generateAppointmentId() {
        if (window.crypto && typeof window.crypto.randomUUID === 'function') {
            return window.crypto.randomUUID();
        }
        return $.bsCalendar.utils.generateRandomString(24, 'bs_calendar_appointment_');
    }

    function ensureAppointmentId(appointment) {
        if (appointment && typeof appointment === 'object' && !hasAppointmentId(appointment)) {
            appointment.id = generateAppointmentId();
        }
        return appointment;
    }

    function ensureAppointmentIds(appointments) {
        if (!Array.isArray(appointments)) {
            return appointments;
        }
        appointments.forEach(appointment => ensureAppointmentId(appointment));
        return appointments;
    }

    function getEditableAppointmentParams(object) {
        if (!object || typeof object !== 'object') {
            return null;
        }

        if (object.appointment && typeof object.appointment === 'object') {
            const appointment = $.extend(true, {}, object.appointment);
            if (!hasAppointmentId(appointment) && hasAppointmentId(object)) {
                appointment.id = object.id;
            }
            return appointment;
        }

        if (object.data && typeof object.data === 'object') {
            const appointment = $.extend(true, {}, object.data);
            if (!hasAppointmentId(appointment) && hasAppointmentId(object)) {
                appointment.id = object.id;
            }
            return appointment;
        }

        return $.extend(true, {}, object);
    }

    function getAppointmentIdParam(object) {
        if (typeof object === 'string' || typeof object === 'number') {
            return object;
        }
        const appointment = getEditableAppointmentParams(object);
        if (hasAppointmentId({id: appointment?.recurringId})) {
            return appointment.recurringId;
        }
        if (hasAppointmentId(appointment)) {
            return appointment.id;
        }
        return null;
    }

    function normalizeSettings(settings) {

        // clamp helper
        const clamp = (v, min, max) => Math.min(Math.max(v, min), max);


        const possibleViews = $.bsCalendar.possibleViews;

        // normalize locale format (e.g., en_US → en-US)
        settings.locale = settings.locale.replace('_', '-');

        if (settings.hasOwnProperty('startDate')) {
            if (typeof settings.startDate === 'string') {
                const date = $.bsCalendar.utils.normalizeDateTime(settings.startDate);
                settings.startDate = $.bsCalendar.utils.parseDateInput(date);
            }
        }
        if (settings.hasOwnProperty('calendars')) {
            if (Array.isArray(settings.calendars)) {
                let i = 1;
                // Filter: Calendar must have an ID
                settings.calendars = settings.calendars.filter(c => c && typeof c === 'object' && c.hasOwnProperty('id') && c.id);

                settings.calendars.forEach(calendar => {
                    // Title fallback
                    if (!calendar.hasOwnProperty('title') || typeof calendar.title !== 'string' || calendar.title.trim() === '') {
                        calendar.title = 'Calendar ' + i;
                    }

                    // Color fallback: Normalize to style object using getColors
                    let color = null;
                    if (calendar.hasOwnProperty('color') && typeof calendar.color === 'string') {
                        color = calendar.color;
                    }
                    calendar.color = $.bsCalendar.utils.getColors(color, settings.mainColor);

                    // Active fallback
                    if (!calendar.hasOwnProperty('active') || typeof calendar.active !== 'boolean') {
                        calendar.active = true;
                    }

                    i++;
                });

                if (settings.calendars.length === 0) {
                    settings.calendars = null;
                }
            } else {
                settings.calendars = null;
            }
        }

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
                settings.views = settings.views.filter(v => possibleViews.includes(v));

                // If nothing left after filtering, fallback to sensible default
                if (settings.views.length === 0) {
                    settings.views = $.bsCalendar.possibleViews;
                }
            } else {
                // Fallback to sensible default when views is invalid
                settings.views = $.bsCalendar.possibleViews;
            }
        }

        if (Array.isArray(settings.views) && settings.views.length === 1) {
            settings.startView = settings.views[0];
        } else if (!settings.hasOwnProperty('startView') || !possibleViews.includes(settings.startView) || !settings.views.includes(settings.startView)) {
            settings.startView = settings.views[0];
        }

        // Validate `rounded` -> must be an integer between 0 and 5
        if (settings.hasOwnProperty('rounded')) {
            // Try to coerce to number
            const parsed = Number(settings.rounded);

            // If parsed is not a finite integer, fallback to default (5)
            if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
                settings.rounded = $.bsCalendar.getDefaults().rounded;
            } else {
                settings.rounded = clamp(parsed, 0, 5);
            }
        }

        if (settings.hasOwnProperty('hourSlots') && typeof settings.hourSlots === 'object') {
            // parse values defensiv
            settings.hourSlots.start =
                Number.isFinite(Number($.bsCalendar.utils.parseTimeToDecimal(settings.hourSlots.start))) ?
                    parseFloat($.bsCalendar.utils.parseTimeToDecimal(settings.hourSlots.start)) :
                    NaN;
            settings.hourSlots.end =
                Number.isFinite(Number($.bsCalendar.utils.parseTimeToDecimal(settings.hourSlots.end))) ?
                    parseFloat($.bsCalendar.utils.parseTimeToDecimal(settings.hourSlots.end)) :
                    NaN;
            settings.hourSlots.height = Number.isFinite(Number(settings.hourSlots.height)) ? parseInt(settings.hourSlots.height, 10) : NaN;

            // Fallbacks für nicht-numerische Werte
            if (Number.isNaN(settings.hourSlots.start)) settings.hourSlots.start = 0;
            if (Number.isNaN(settings.hourSlots.end)) settings.hourSlots.end = 24;
            if (Number.isNaN(settings.hourSlots.height)) settings.hourSlots.height = 30;

            settings.hourSlots.start = clamp(settings.hourSlots.start, 0, 24);
            settings.hourSlots.end = clamp(settings.hourSlots.end, 0, 24);

            // height mindestens 1 (oder deine default 30)
            settings.hourSlots.height = Math.max(Math.floor(settings.hourSlots.height), 1);

            // Ensure at least some difference and start < end
            if (settings.hourSlots.start >= settings.hourSlots.end) {
                if (settings.hourSlots.start < 24) {
                    settings.hourSlots.end = Math.min(24, settings.hourSlots.start + 1);
                } else {
                    settings.hourSlots.start = 23;
                    settings.hourSlots.end = 24;
                }
            }

            // finaler Clamp (sicherheitshalber)
            settings.hourSlots.start = clamp(settings.hourSlots.start, 0, 23.99);
            settings.hourSlots.end = clamp(settings.hourSlots.end, 0.01, 24);
        }

        // Validate draggable snap interval (minutes)
        if (settings.hasOwnProperty('draggableSnapMinutes')) {
            const parsedSnap = Number(settings.draggableSnapMinutes);
            if (!Number.isFinite(parsedSnap)) {
                settings.draggableSnapMinutes = $.bsCalendar.getDefaults().draggableSnapMinutes;
            } else {
                settings.draggableSnapMinutes = Math.max(1, Math.floor(parsedSnap));
            }
        }

        if (!settings.appointmentRules || typeof settings.appointmentRules !== 'object') {
            settings.appointmentRules = $.extend(true, {}, $.bsCalendar.getDefaults().appointmentRules);
        } else {
            const defaults = $.bsCalendar.getDefaults().appointmentRules;
            settings.appointmentRules = $.extend(true, {}, defaults, settings.appointmentRules);
        }

        ['durationMinutes', 'durationStepMinutes', 'minDurationMinutes', 'maxDurationMinutes'].forEach(key => {
            const value = settings.appointmentRules[key];
            if (value === null || value === undefined || value === '') {
                settings.appointmentRules[key] = null;
                return;
            }
            const parsed = Number(value);
            settings.appointmentRules[key] = Number.isFinite(parsed) && parsed > 0
                ? Math.floor(parsed)
                : null;
        });

        if (
            settings.appointmentRules.minDurationMinutes !== null &&
            settings.appointmentRules.maxDurationMinutes !== null &&
            settings.appointmentRules.maxDurationMinutes < settings.appointmentRules.minDurationMinutes
        ) {
            settings.appointmentRules.maxDurationMinutes = settings.appointmentRules.minDurationMinutes;
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
        if (appointment.task) {
            const textClass = appointment.task.checked ? 'text-decoration-line-through' : '';
            const overdueClass = appointment.task.isOverdue ? '' : '';
            return `<div class="badge d-flex align-items-center flex-nowrap ${textClass} ${overdueClass}" style=""><i class="${extras.icon} me-1 task-toggle" style="cursor:pointer"></i> <span class="text-truncate">${appointment.title}</span></div>`;
        }
        void extras;
        return `<small class="px-2">${appointment.title}</small>`;
    }

    function formatterAllDay(appointment, extras, view) {
        const isStackedAllDayView = view === 'week' || view === '4day';
        const classes = ['badge', isStackedAllDayView ? 'd-flex' : 'd-inline-flex', 'align-items-center', 'flex-nowrap', 'px-2'];
        if (isStackedAllDayView) {
            classes.push('w-100');
        }

        if (appointment.task) {
            const textClass = appointment.task.checked ? 'text-decoration-line-through' : '';
            const overdueClass = appointment.task.isOverdue ? '' : '';
            classes.push(textClass);
            classes.push('justify-content-start');

            return `
                    <div class="${classes.join(' ')}" style="background-color: ${extras.colors.backgroundColor}; background-image: ${extras.colors.backgroundImage}; color: ${extras.colors.color}">
                        <i class="${extras.icon} me-1 task-toggle" style="cursor:pointer"></i>
                        <span class="text-nowrap d-inline-block text-truncate">${appointment.title}</span>
                    </div>
                `;
        }

        const style = {
            backgroundColor: extras.colors.backgroundColor,
            backgroundImage: extras.colors.backgroundImage,
            color: extras.colors.color
        };

        const styleString = toStyleString(style);

        return [
            '<div class="' + classes.join(' ') + '" style="' + styleString + '">',
            appointment.title,
            '</div>'
        ].join('')
    }

    function toStyleString(styleObj) {
        return Object.entries(styleObj)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) =>
                key.replace(/([A-Z])/g, '-$1').toLowerCase() + ': ' + value + ';'
            )
            .join(' ');
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }


    /**
     * Formats a holiday object into a styled HTML string representation suitable for display.
     *
     * @param {Object} holiday - The holiday object containing relevant information.
     * @param {string} view - The current view mode, which determines specific formatting. Possible values are 'month' or other view types.
     * @return {string} A styled HTML string representing the holiday for display.
     */
    function formatterHoliday(holiday, view) {
        const isDayOrWeek = view === 'day' || view === 'week' || view === '4day';
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
        if (appointment.task) {
            const textClass = appointment.task.checked ? 'text-decoration-line-through' : '';
            const overdueClass = appointment.task.isOverdue ? '' : '';
            return `<div class="badge d-flex align-items-center flex-nowrap ${textClass} ${overdueClass}" style="font-size: 10px;"><i class="${extras.icon} me-1 task-toggle" style="cursor:pointer"></i> <span class="text-truncate">${appointment.title}</span></div>`;
        }
        void extras;
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
        if (appointment.task) {
            const textClass = appointment.task.checked ? 'text-decoration-line-through' : '';
            const overdueClass = appointment.task.isOverdue ? '' : '';
            return `
                <div class="d-flex align-items-center flex-nowrap ${textClass}" style="font-size: 12px; line-height: 18px; color: ${extras.colors.color}; height: 18px; overflow: hidden;">
                    <i class="${extras.icon} me-1 task-toggle" style="cursor:pointer"></i>
                    <span class="text-nowrap d-inline-block text-truncate" style="flex: 1; min-width: 0;">${appointment.title}</span>
                </div>
            `;
        }

        const startTime = $.bsCalendar.utils.parseDateInput(appointment.start).toLocaleTimeString(extras.locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
        const timeToShow = appointment.allDay ? '' : `<small class="me-1">${startTime}</small>`;
        const icon = `<i class="${extras.icon} me-1"></i>`;
        const styles = [
            'font-size: 12px',
            'line-height: 18px',
            'height: 18px',
            'overflow: hidden'
        ].join(';')
        return [
            `<div class=" d-flex align-items-center flex-nowrap" style="${styles}; color: ${extras.colors.color}">`,
            icon,
            timeToShow,
            `<span class="text-nowrap d-inline-block text-truncate" style="flex: 1; min-width: 0;">${appointment.title}</span>`,
            `</div>`
        ].join('')
    }

    function formatterMonthExpanded(appointment, extras) {
        const t = $.bsCalendar.getTranslations(extras.locale);
        const isTask = !!appointment.task;
        const isDone = isTask && !!appointment.task.checked;
        const displayDate = extras.monthExpanded?.displayDate || null;
        const times = displayDate?.times || {};
        const startTime = String(times.start || extras.start?.time || '').slice(0, 5);
        const endTime = String(times.end || extras.end?.time || '').slice(0, 5);
        const timeText = appointment.allDay
            ? (t.allDay || $.bsCalendar.getTranslation(extras.locale, 'allDay') || 'All day')
            : [startTime, endTime].filter(Boolean).join(' - ');
        const icon = extras.icon
            ? `<i class="${extras.icon} ${isTask ? 'task-toggle' : ''} flex-shrink-0 mt-1" style="${isTask ? 'cursor:pointer' : ''}"></i>`
            : '';
        const titleClass = isDone ? 'text-decoration-line-through text-body-secondary' : 'text-body';

        const meta = [];
        if (timeText) {
            meta.push(`<span>${timeText}</span>`);
        }
        if (appointment.location) {
            meta.push(Array.isArray(appointment.location) ? appointment.location.join(' · ') : appointment.location);
        }
        if (appointment.task && appointment.task.priority) {
            const priority = appointment.task.priority;
            const translationKey = `taskPriority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
            meta.push(t[translationKey] || priority);
        }

        return [
            '<div class="d-flex align-items-start gap-2 w-100">',
            icon,
            '<div class="min-w-0 flex-fill">',
            `<div class="fw-semibold text-truncate ${titleClass}">${appointment.title}</div>`,
            meta.length ? `<div class="small text-body-secondary text-truncate">${meta.join(' · ')}</div>` : '',
            '</div>',
            '</div>'
        ].join('');
    }

    function formatterAgenda(appointment, extras) {
        const t = $.bsCalendar.getTranslations(extras.locale);
        const isTask = !!appointment.task;
        const isAllDay = appointment.allDay;
        const isDone = isTask && !!appointment.task.checked;
        const timeText = isAllDay
            ? `<span>`+ (t.allDay || $.bsCalendar.getTranslation(extras.locale, 'allDay') || 'All day') + `</span>`
            : `<span>${String(extras.start.time || '').slice(0, 5)}</span><span class="d-none d-lg-inline-block">-</span><span>${String(extras.end.time || '').slice(0, 5)}</span>`;
        const icon = extras.icon
            ? `<i class="${extras.icon} ${isTask ? 'task-toggle' : ''} flex-shrink-0" style="${isTask ? 'cursor:pointer' : ''}"></i>`
            : '';

        const meta = [];
        if (appointment.location) {
            meta.push(Array.isArray(appointment.location) ? appointment.location.join(' · ') : appointment.location);
        }
        let priorityHTML = "";
        if (appointment.task && appointment.task.priority) {
            const priorityColors = $.bsCalendar.utils.getColors(taskPriorityColors[appointment.task.priority]);
            const priority = appointment.task.priority;
            const translationKey = `taskPriority${priority.charAt(0).toUpperCase()}${priority.slice(1)}`;
            priorityHTML = `<small class="badge" style="background-color: ${priorityColors.backgroundColor};">${t[translationKey] || priority}</small>`;
            meta.push(priorityHTML);
        }

        return [
            '<div class="text-body-secondary d-flex gap-1 flex-column flex-lg-row small flex-shrink-0 text-center" style="width: 92px;">',
            timeText,
            '</div>',
            '<div class="flex-fill min-w-0">',
            `<div class="d-flex align-items-center gap-2 fw-semibold ${isDone ? 'text-decoration-line-through text-body-secondary' : ''}">`,
            icon,
            `<span class="text-truncate">${escapeHtml(appointment.title)}</span>`,
            '</div>',
            meta.length
                ? `<small>` + meta.join(' · ') + `</small>`
                : '',
            '</div>'
        ].join('');
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
        const appointmentStart = $.bsCalendar.utils.parseDateInput(appointment.start);
        const day = appointmentStart.getDate();
        const date = appointmentStart.toLocaleDateString(extras.locale, {
            month: 'short',
            year: 'numeric',
            weekday: 'short'
        })

        return [
            `<div class="d-flex align-items-center justify-content-start g-3 py-1">`,
            `<div class="day fw-bold text-center" style="${firstCollStyle}" data-date="${$.bsCalendar.utils.formatDateToDateString(appointmentStart)}">`,
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
     * Prepares a date object from the given input.
     *
     * @param {string|Date} date - The input date, which can be a string or a Date object.
     * @return {Date} The prepared Date object.
     */
    function prepareDate(date) {
        if (typeof date === "string") {
            date = $.bsCalendar.utils.parseDateInput(date);
        } else if (date instanceof Date) {
            date = new Date(date.getTime());
        }
        return date;
    }

    function prepareParamsForMethodSetDate($wrapper, object) {
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        let date = null;
        let view = null;
        let viewChanged = false;
        if (typeof object === "string") {
            date = $.bsCalendar.utils.parseDateInput(object);
        } else if (object instanceof Date) {
            date = object;
        } else if (typeof object === "object") {
            if (object.hasOwnProperty('date')) {
                date = prepareDate(object.date);
            }
            if (object.hasOwnProperty('view') && settings.views.includes(object.view)) {
                const viewBefore = data.view
                if (viewBefore !== object.view) {
                    view = object.view;
                }
            }
        }
        return {
            date: date,
            view: view
        };
    }

    /**
     * Disposes calendar-owned Bootstrap tooltip instances and removes any rendered tooltip nodes.
     *
     * @param {jQuery} $wrapper - The wrapper element that owns the calendar instance.
     * @return {void}
     */
    function destroyCalendarTooltips($wrapper) {
        const $tooltipOwners = $wrapper.find('[data-bs-calendar-tooltip], [data-bs-calendar-popover], .wc-holiday-marked, [data-bs-original-title]');

        $tooltipOwners.each(function () {
            const $el = $(this);
            disposeBootstrapTooltip($el);
            disposeBootstrapPopover($el);
            $el.removeAttr('aria-describedby');
        });

        // Remove rendered tooltip DOM nodes that may have survived rapid view/date switches.
        $wrapper.find('.tooltip').remove();
        $wrapper.find('.popover').remove();
        $('body > .tooltip.wc-calendar-tooltip').remove();
        $('body > .popover.wc-calendar-tooltip').remove();
    }

    function disposeBootstrapTooltip($element) {
        const element = $element?.[0];
        if (!element) {
            return;
        }

        if (window.bootstrap && window.bootstrap.Tooltip && typeof window.bootstrap.Tooltip.getInstance === 'function') {
            const instance = window.bootstrap.Tooltip.getInstance(element);
            if (instance) {
                instance.hide();
                instance.dispose();
            }
            return;
        }

        try {
            $element.tooltip('dispose');
        } catch (e) {
            // ignore
        }
    }

    function disposeBootstrapPopover($element) {
        const element = $element?.[0];
        if (!element) {
            return;
        }

        if (window.bootstrap && window.bootstrap.Popover && typeof window.bootstrap.Popover.getInstance === 'function') {
            const instance = window.bootstrap.Popover.getInstance(element);
            if (instance) {
                instance.hide();
                instance.dispose();
            }
            return;
        }

        try {
            $element.popover('dispose');
        } catch (e) {
            // ignore
        }
    }

    function initBootstrapTooltip($element, options) {
        disposeBootstrapPopover($element);
        disposeBootstrapTooltip($element);

        const element = $element?.[0];
        if (window.bootstrap && window.bootstrap.Tooltip && element) {
            return new window.bootstrap.Tooltip(element, options);
        }

        return $element.tooltip(options);
    }

    function initBootstrapPopover($element, options) {
        disposeBootstrapTooltip($element);
        disposeBootstrapPopover($element);

        const element = $element?.[0];
        if (window.bootstrap && window.bootstrap.Popover && element) {
            return new window.bootstrap.Popover(element, options);
        }

        return $element.popover(options);
    }

    function abortXhr(xhr) {
        try {
            if (xhr) {
                if (typeof xhr.abort === 'function') {
                    // jqXHR or XHR-like
                    xhr.abort();
                } else if (xhr instanceof AbortController) {
                    xhr.abort();
                } else if (xhr.signal && typeof xhr.signal.aborted === 'boolean') {
                    // nothing to do, already a fetch with signal; but try to call abort if controller stored
                    if (typeof xhr.abort === 'function') {
                        xhr.abort();
                    }
                }
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    function methodToggleTaskStatus($wrapper, appointment, status) {
        if (appointment && appointment.task) {
            appointment.task.checked = status;

            const data = getBsCalendarData($wrapper);
            const appointmentId = String(appointment.id);
            const sourceId = String(appointment.recurringId || appointment.id);

            data.appointments.forEach(item => {
                if (
                    item.task &&
                    (
                        String(item.id) === appointmentId ||
                        String(item.id) === sourceId ||
                        String(item.recurringId || '') === sourceId
                    )
                ) {
                    item.task.checked = status;
                }
            });

            if (Array.isArray(data.sourceAppointments)) {
                data.sourceAppointments.forEach(item => {
                    if (item.task && String(item.id) === sourceId) {
                        item.task.checked = status;
                    }
                });
            }

            setBsCalendarData($wrapper, data);

            // Re-calculate extras for icons
            setAppointmentExtras($wrapper, data.appointments);

            buildByView($wrapper, false, false);
            trigger($wrapper, 'task-status-changed', appointment, status);
        }
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
        const defaultDisabled = false;
        const defaultColor = "danger";

        if (typeof link === "string") {
            // treatment as a simple string
            return `<a class="btn btn-primary px-5 rounded-pill" href="${link}" target="${defaultTarget}" rel="${defaultRel}">${defaultText}</a>`;
        }

        if (typeof link === "object" && link.href) {
            // treatment as an object with attributes
            const text = link.text || defaultText;
            const target = link.target || defaultTarget;
            const rel = link.rel || defaultRel;
            const disabled = link.disabled || defaultDisabled;
            const disabledClass = disabled ? "disabled" : "";
            const color = $.bsCalendar.utils.getColors(link.color || defaultColor);
            const combinedCss = [
                'background-color: ' + color.backgroundColor, // Set the computed background color.
                'background-image: ' + color.backgroundImage, // Set the computed gradient.
                'color: ' + color.color,        // Set the computed font color.
            ].join(';');

            // When HTML content is defined, this is used
            const content = link.html || text;
            return `<a class="btn px-5 rounded-pill ${disabledClass}" href="${link.href}" style="${combinedCss}" target="${target}" rel="${rel}">${content}</a>`;
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

                const taskDue = appointment.task && appointment.task.due
                    ? $.bsCalendar.utils.parseDateInput(appointment.task.due)
                    : null;
                const due = taskDue && !isNaN(taskDue.getTime()) ? [
                    '<p class="d-flex align-items-center gap-2 mb-2">',
                    '<i class="bi bi-calendar-check" aria-hidden="true"></i>',
                    `<time datetime="${appointment.task.due}">${taskDue.toLocaleString(locale, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                    })}</time>`,
                    '</p>'
                ].join('') : "";

                const desc = appointment.description ? `<p>${appointment.description}</p>` : "";
                // assemble the result and dissolve the promise
                const result = [
                    `<h3>${appointment.title}</h3>`,
                    `<p>${showTime}</p>`,
                    due,
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
     * @param {boolean} [triggerEventInit=true] - A flag indicating whether event handlers should be attached during initialization.
     * @return {Promise<jQuery>} A promise that resolves with the initialized wrapper element or rejects with an error encountered during initialization.
     */
    function init($wrapper, initEvents = true, triggerEventInit = true, triggerViewChange = true) {
        return new Promise((resolve, reject) => {
            try {
                const data = getBsCalendarData($wrapper);
                const settings = data.settings;
                $wrapper.addClass('position-relative bs-calendar');
                $wrapper.css({
                    overflow: 'visible'
                });
                $wrapper.attr('data-bs-calendar-id', data.elements.wrapperId);

                if (!data.settings.hasOwnProperty('views') || data.settings.views.length === 0) {
                    data.settings.views = ['day', '4day', 'week', 'month', 'year'];
                }
                if (!data.settings.hasOwnProperty('startView') || !data.settings.startView) {
                    data.settings.startView = 'month';
                }
                if (!data.settings.views.includes(data.settings.startView)) {
                    data.settings.startView = data.settings.views[0];
                }
                data.view = settings.startView;
                data.date = settings.startDate;
                data.searchMode = false;
                let searchObject =
                    settings.search &&
                    settings.search.hasOwnProperty('limit') &&
                    settings.search.hasOwnProperty('offset') ?
                        {limit: settings.search.limit, offset: settings.search.offset} :
                        null;
                data.searchPagination = searchObject;
                setBsCalendarData($wrapper, data);
                buildFramework($wrapper);
                if (initEvents) {
                    handleEvents($wrapper);
                }

                $wrapper.find('[data-small-month-calendar]').each(function () {
                    buildMonthSmallView($wrapper, data.date, $(this), false);
                });
                if (triggerEventInit) {
                    trigger($wrapper, 'init');
                }
                buildByView($wrapper, triggerViewChange);

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
    async function checkAndSetAppointments($wrapper, appointments) {
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;

        // Return a Promise to manage asynchronous operations
        return new Promise((resolve, reject) => {
            // Check if the appointment array is valid, contains appointments, and is not empty
            const hasAppointmentsAsArray = appointments && Array.isArray(appointments) && appointments.length > 0;
            if (!hasAppointmentsAsArray) {
                // If no valid appointments are provided, initialize an empty appointments array
                appointments = [];

                // Store the empty appointments list in the wrapper's data attribute
                setSourceAppointments($wrapper, appointments);
                setAppointments($wrapper, appointments);

                // Resolve the Promise with an empty list of appointments
                resolve(appointments);
                return resolve([]);
            }

            const view = data.view;
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
                setSourceAppointments($wrapper, processedAppointments);
                setAppointments($wrapper, processedAppointments);
                return resolve(processedAppointments);
            }

            // Check if the appointment array is valid, contains appointments, and is not empty
            ensureAppointmentIds(appointments);
            cleanAppointments($wrapper, appointments);
            setSourceAppointments($wrapper, appointments);
            appointments = expandRecurringAppointments($wrapper, appointments);

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
                    setAppointments($wrapper, appointments);

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
                const startDate = $.bsCalendar.utils.parseDateInput(appointment.start);
                const endDate = $.bsCalendar.utils.parseDateInput(appointment.end);

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

    function expandRecurringAppointments($wrapper, appointments) {
        if (!Array.isArray(appointments) || appointments.length === 0) {
            return [];
        }

        const period = getStartAndEndDateByView($wrapper);
        const rangeStart = $.bsCalendar.utils.parseDateInput(period.start);
        const rangeEnd = $.bsCalendar.utils.parseDateInput(period.end);

        if (!rangeStart || !rangeEnd || isNaN(rangeStart.getTime()) || isNaN(rangeEnd.getTime())) {
            return appointments;
        }

        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);

        return appointments.flatMap(appointment => {
            const recurrence = normalizeRecurrenceRule(appointment);
            if (!recurrence) {
                return [appointment];
            }
            return expandRecurringAppointment(appointment, recurrence, rangeStart, rangeEnd);
        });
    }

    function normalizeRecurrenceRule(appointment) {
        if (!appointment || appointment.recurringId || appointment.isOccurrence || !appointment.recurrence || typeof appointment.recurrence !== 'object') {
            return null;
        }

        const rule = appointment.recurrence;
        const rawFrequency = String(rule.frequency || rule.freq || '').trim().toLowerCase();
        const frequencyAliases = {
            day: 'daily',
            daily: 'daily',
            week: 'weekly',
            weekly: 'weekly',
            month: 'monthly',
            monthly: 'monthly',
            year: 'yearly',
            yearly: 'yearly'
        };
        const frequency = frequencyAliases[rawFrequency] || null;
        if (!frequency) {
            return null;
        }

        const interval = Math.max(1, Math.floor(Number(rule.interval) || 1));
        const count = Number.isFinite(Number(rule.count)) && Number(rule.count) > 0
            ? Math.floor(Number(rule.count))
            : null;
        const until = rule.until || rule.end || null;
        const untilDate = until ? $.bsCalendar.utils.parseDateInput(until) : null;
        if (untilDate && !isNaN(untilDate.getTime())) {
            untilDate.setHours(23, 59, 59, 999);
        }

        const start = $.bsCalendar.utils.parseDateInput(appointment.start);
        if (!start || isNaN(start.getTime())) {
            return null;
        }

        const daysOfWeek = Array.isArray(rule.daysOfWeek)
            ? rule.daysOfWeek
                .map(day => Number(day))
                .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
            : [];

        return {
            frequency,
            interval,
            count,
            untilDate: untilDate && !isNaN(untilDate.getTime()) ? untilDate : null,
            daysOfWeek: daysOfWeek.length ? [...new Set(daysOfWeek)] : [start.getDay()]
        };
    }

    function expandRecurringAppointment(appointment, recurrence, rangeStart, rangeEnd) {
        const start = $.bsCalendar.utils.parseDateInput(appointment.start);
        const end = $.bsCalendar.utils.parseDateInput(appointment.end);
        if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
            return [appointment];
        }

        const durationMs = Math.max(0, end.getTime() - start.getTime());
        const seriesStartDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const loopEnd = new Date(Math.min(
            recurrence.untilDate ? recurrence.untilDate.getTime() : rangeEnd.getTime(),
            rangeEnd.getTime()
        ));
        loopEnd.setHours(0, 0, 0, 0);

        const exceptions = Array.isArray(appointment.recurrence.exceptions)
            ? new Set(appointment.recurrence.exceptions.map(value => formatDateOnly(value)).filter(Boolean))
            : new Set();

        const occurrences = [];
        let occurrenceIndex = 0;
        let safety = 0;
        const cursor = new Date(seriesStartDay);

        while (cursor <= loopEnd && safety < 20000) {
            safety++;

            if (dateMatchesRecurrence(cursor, seriesStartDay, recurrence)) {
                const occurrenceDate = $.bsCalendar.utils.formatDateToDateString(cursor);
                const occurrenceStart = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate(), start.getHours(), start.getMinutes(), start.getSeconds(), start.getMilliseconds());
                const occurrenceEnd = new Date(occurrenceStart.getTime() + durationMs);
                const skipped = exceptions.has(occurrenceDate);

                occurrenceIndex++;

                if (recurrence.count !== null && occurrenceIndex > recurrence.count) {
                    break;
                }

                if (!skipped && rangesOverlap(occurrenceStart, occurrenceEnd, rangeStart, rangeEnd)) {
                    occurrences.push(createRecurringOccurrence(appointment, occurrenceStart, occurrenceEnd, occurrenceDate, occurrenceIndex - 1, recurrence));
                }
            }

            cursor.setDate(cursor.getDate() + 1);
        }

        return occurrences;
    }

    function dateMatchesRecurrence(date, seriesStartDay, recurrence) {
        if (date < seriesStartDay) {
            return false;
        }

        const diffDays = localDateIndex(date) - localDateIndex(seriesStartDay);

        if (recurrence.frequency === 'daily') {
            return diffDays % recurrence.interval === 0;
        }

        if (recurrence.frequency === 'weekly') {
            const weekIndex = Math.floor(diffDays / 7);
            return weekIndex % recurrence.interval === 0 && recurrence.daysOfWeek.includes(date.getDay());
        }

        if (recurrence.frequency === 'monthly') {
            const monthIndex = ((date.getFullYear() - seriesStartDay.getFullYear()) * 12) + (date.getMonth() - seriesStartDay.getMonth());
            return monthIndex >= 0 &&
                monthIndex % recurrence.interval === 0 &&
                date.getDate() === seriesStartDay.getDate();
        }

        if (recurrence.frequency === 'yearly') {
            const yearIndex = date.getFullYear() - seriesStartDay.getFullYear();
            return yearIndex >= 0 &&
                yearIndex % recurrence.interval === 0 &&
                date.getMonth() === seriesStartDay.getMonth() &&
                date.getDate() === seriesStartDay.getDate();
        }

        return false;
    }

    function createRecurringOccurrence(appointment, start, end, occurrenceDate, occurrenceIndex, recurrence) {
        const occurrence = copyAppointment(appointment);
        const masterId = String(appointment.id);

        occurrence.id = `${masterId}__${occurrenceDate}`;
        occurrence.start = formatLocalDateTime(start);
        occurrence.end = formatLocalDateTime(end);
        occurrence.recurringId = masterId;
        occurrence.recurrenceDate = occurrenceDate;
        occurrence.recurrenceIndex = occurrenceIndex;
        occurrence.isOccurrence = true;
        occurrence.recurrence = $.extend(true, {}, appointment.recurrence);
        occurrence.recurrence.frequency = recurrence.frequency;
        occurrence.recurrence.interval = recurrence.interval;

        return occurrence;
    }

    function localDateIndex(date) {
        const parsedDate = typeof date === 'string' ? $.bsCalendar.utils.parseDateInput(date) : date;
        return Math.round(Date.UTC(
            parsedDate.getFullYear(),
            parsedDate.getMonth(),
            parsedDate.getDate()
        ) / 86400000);
    }

    function rangesOverlap(start, end, rangeStart, rangeEnd) {
        return start <= rangeEnd && end >= rangeStart;
    }

    function formatDateOnly(value) {
        const date = $.bsCalendar.utils.parseDateInput(value);
        if (!date || isNaN(date.getTime())) {
            return null;
        }
        return $.bsCalendar.utils.formatDateToDateString(date);
    }

    function formatLocalDateTime(date) {
        return `${$.bsCalendar.utils.formatDateToDateString(date)} ${$.bsCalendar.utils.formatTime(date)}`;
    }

    function getRecurrenceExtras(appointment) {
        const rule = appointment && appointment.recurrence && typeof appointment.recurrence === 'object'
            ? appointment.recurrence
            : null;

        if (!rule) {
            return {
                isRecurring: false,
                isOccurrence: false,
                recurringId: null,
                occurrenceId: null,
                occurrenceDate: null,
                occurrenceIndex: null,
                frequency: null,
                interval: null
            };
        }

        return {
            isRecurring: true,
            isOccurrence: !!appointment.isOccurrence,
            recurringId: appointment.recurringId || appointment.id || null,
            occurrenceId: appointment.id || null,
            occurrenceDate: appointment.recurrenceDate || formatDateOnly(appointment.start),
            occurrenceIndex: Number.isInteger(appointment.recurrenceIndex) ? appointment.recurrenceIndex : null,
            frequency: String(rule.frequency || rule.freq || '').trim().toLowerCase() || null,
            interval: Number(rule.interval) || 1
        };
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
     * Builds a dynamic framework for a calendar application within the specified wrapper element.
     * This method initializes and structures the user interface by adding navigation components,
     * buttons, and view containers.
     *
     * @param {jQuery} $wrapper The DOM element (wrapped in a jQuery object) where the framework will be built.
     * @return {void} Does not return a value; modifies the provided wrapper element directly.
     */
    function buildFramework($wrapper) {
        const data = getBsCalendarData($wrapper);
        // get the settings
        const settings = data.settings;

        // Vor dem Leeren des Wrappers: Addons "retten", falls sie bereits im DOM sind,
        // damit sie nicht durch .empty() gelöscht werden.
        // Wir suchen explizit im Wrapper, da sie dorthin verschoben wurden.
        if (settings.topbarAddons) {
            const $topAddons = $(settings.topbarAddons);
            if ($topAddons.length > 0) {
                $topAddons.detach();
                settings.topbarAddons = $topAddons; // Speichere das gedetachte Objekt
            }
        }
        if (settings.sidebarAddons) {
            const $sideAddons = $(settings.sidebarAddons);
            if ($sideAddons.length > 0) {
                $sideAddons.detach();
                settings.sidebarAddons = $sideAddons; // Speichere das gedetachte Objekt
            }
        }

        // Clear the wrapper first
        $wrapper.empty();

        // initial wrapper and put it at a 100% height and width
        const innerWrapper = $('<div>', {
            class: 'd-flex flex-column align-items-stretch h-100 w-100 rounded-2 gap-3 pb-3'
        }).appendTo($wrapper);

        const roundedClass = 'rounded-' + settings.rounded;
        const borderClass = settings.border;

        const offcanvasId = data.elements.wrapperTopNavId + '-offcanvas';

        function appendSidebarToggle($target, extraClass = '') {
            return $('<button>', {
                type: 'button',
                class: `btn border-0 text-body shadow-none ${extraClass} bs-calendar-border-style`,
                html: `<i class="${settings.icons.menu}"></i>`,
                'data-bs-toggle': 'sidebar',
                'aria-label': 'Menu'
            }).appendTo($target);
        }

        function appendViewNavigation($target, extraClass = '') {
            return $('<div>', {
                class: `d-flex align-items-center py-1 ps-3 justify-content-center wc-nav-view-wrapper flex-wrap flex-lg-nowrap text-nowrap bg-body rounded-pill shadow-sm bs-calendar-border-style ${extraClass}`,
                html: [
                    '<strong class="me-3 user-select-none text-body" data-calendar-view-title></strong>',
                    `<a data-prev href="#" class="text-decoration-none text-body d-flex align-items-center justify-content-center" style="width:24px; height:24px;"><i class="${settings.icons.prev}"></i></a>`,
                    `<a class="mx-2 text-decoration-none text-body d-flex align-items-center justify-content-center" data-next href="#" style="width:24px; height:24px;"><i class="${settings.icons.next}"></i></a>`,
                ].join('')
            }).appendTo($target);
        }

        function appendSearchButton($target, extraClass = '') {
            if (!settings.search) {
                return null;
            }

            const showSearchbar = $('<button>', {
                type: 'button',
                class: `btn border-0 text-body shadow-none js-btn-search ${extraClass} bs-calendar-border-style`,
                html: `<i class="${settings.icons.search}"></i>`,
                'aria-label': settings.translations.search || 'Search'
            }).appendTo($target);

            showSearchbar.on('click', function () {
                toggleSearchBar($wrapper, true);
            });

            return showSearchbar;
        }

        function appendAddButton($target, extraClass = '') {
            if (!settings.showAddButton) {
                return null;
            }

            return $('<button>', {
                type: 'button',
                class: `btn border-0 text-body shadow-none ${extraClass} ${roundedClass} bs-calendar-border-style`,
                html: `<i class="${settings.icons.add}"></i>`,
                'data-add-appointment': true,
                'aria-label': 'Add'
            }).appendTo($target);
        }

        function appendStaticTitle($target, extraClass = '') {
            if (!settings.title) {
                return null;
            }

            return $('<div>', {
                html: settings.title,
                class: `mb-0 fw-bold text-uppercase text-body ${extraClass}`,
                'data-calendar-static-title': true
            }).appendTo($target);
        }

        function appendLoadingSpinner($target, extraClass = '') {
            return $('<div>', {
                class: `spinner-border me-auto me-2 text-secondary wc-calendar-spinner ${extraClass}`,
                css: {
                    display: 'none',
                    width: '1.5rem',
                    height: '1.5rem'
                },
                role: 'status',
                html: '<span class="visually-hidden">Loading...</span>'
            }).appendTo($target);
        }

        function appendTodayButton($target, extraClass = '') {
            return $('<button>', {
                type: 'button',
                class: `btn border-0 text-body shadow-none ${extraClass} ${roundedClass} bs-calendar-border-style fw-bold`,
                html: settings.translations.today,
                'data-today': true
            }).appendTo($target);
        }

        function appendViewDropdown($target, extraClass = '', iconOnly = false) {
            if (settings.views.length <= 1) {
                return null;
            }

            const dropDownView = $('<div>', {
                class: `dropdown dropdown-center wc-select-calendar-view ${extraClass}`,
                html: [
                    `<a class="btn dropdown-toggle border-0 text-body shadow-none bs-calendar-border-style ${roundedClass}" data-dropdown-text href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" ${iconOnly ? 'data-dropdown-icon-only="true" aria-label="View"' : ''}>`,
                    '</a>',
                    '<ul class="dropdown-menu shadow border-0 mt-1">',
                    '</ul>',
                ].join('')
            }).appendTo($target);

            if (settings.debug) {
                log('buidlFramwork', settings.views);
            }
            settings.views.forEach(view => {
                $('<li>', {
                    html: `<a class="dropdown-item" data-view="${view}" href="#"><i class="${settings.icons[view]} me-2"></i> ${settings.translations[view]}</a>`
                }).appendTo(dropDownView.find('ul'));
            });

            return dropDownView;
        }

        function appendAboutDropdown($target, extraClass = '') {
            if (!settings.showAbout || !$.bsCalendar.about || typeof $.bsCalendar.about !== 'object') {
                return null;
            }

            const about = $.bsCalendar.about;
            const aboutDropdown = $('<div>', {
                class: `dropdown dropdown-end wc-about-dropdown ${extraClass}`
            }).appendTo($target);

            $('<button>', {
                type: 'button',
                class: `btn border-0 text-body shadow-none bs-calendar-border-style ${roundedClass}`,
                'data-bs-toggle': 'dropdown',
                'aria-expanded': 'false',
                'aria-label': 'About bs-calendar',
                html: `<i class="${settings.icons.about || 'bi bi-info-circle'}"></i>`
            }).appendTo(aboutDropdown);

            const menu = $('<div>', {
                class: 'dropdown-menu dropdown-menu-end shadow border-0 mt-1 p-2',
                css: {
                    minWidth: '280px',
                    maxWidth: '360px'
                }
            }).appendTo(aboutDropdown);

            $('<div>', {
                class: 'fw-bold text-uppercase text-body-secondary px-2 py-1 mb-1',
                text: 'About'
            }).appendTo(menu);

            const compactRows = [];
            if (about.version) {
                compactRows.push({label: 'Version', value: String(about.version)});
            }
            if (about.releaseDate) {
                compactRows.push({label: 'Release', value: String(about.releaseDate)});
            }
            if (about.developer || about.developerEmail) {
                const devText = [about.developer, about.developerEmail ? `<${about.developerEmail}>` : null]
                    .filter(Boolean)
                    .join(' ');
                compactRows.push({label: 'Developer', value: devText});
            }
            if (about.license) {
                compactRows.push({label: 'License', value: String(about.license)});
            }

            compactRows.forEach(row => {
                const line = $('<div>', {
                    class: 'px-2 py-1 d-flex align-items-center justify-content-between gap-2'
                }).appendTo(menu);
                $('<small>', {
                    class: 'text-body-secondary fw-semibold',
                    text: row.label
                }).appendTo(line);
                $('<small>', {
                    class: 'text-body text-end text-break',
                    text: row.value
                }).appendTo(line);
            });

            const linkRows = [
                {key: 'project', label: 'Repository', text: ''},
                {key: 'issues', label: 'Issues', text: ''},
                {key: 'releases', label: 'Releases', text: ''},
                {key: 'readme', label: 'Readme', text: ''},
                {key: 'changelog', label: 'Changelog', text: ''},
                {key: 'demo', label: 'Demo', text: ''},
                {key: 'sponsor', label: 'Sponsor', text: ''},
            ];

            linkRows.forEach(linkRow => {
                const href = about[linkRow.key];
                if (!href) {
                    return;
                }
                const line = $('<div>', {
                    class: 'px-2 py-1 d-flex align-items-center justify-content-between gap-2'
                }).appendTo(menu);
                $('<small>', {
                    class: 'text-body-secondary fw-semibold',
                    text: linkRow.label
                }).appendTo(line);
                $('<a>', {
                    class: 'small text-decoration-none',
                    href: String(href),
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    html: `${linkRow.text} <i class="bi bi-box-arrow-up-right ms-1"></i>`
                }).appendTo(line);
            });

            $('<div>', {
                class: 'px-2 py-1 mt-2 border-top small text-body-secondary',
                'data-about-debug': '1'
            }).appendTo(menu);

            return aboutDropdown;
        }

        function appendSidebarContent($target, forDesktop = false, extraClass = '') {
            const sidebarAttributes = {
                css: {
                    position: 'relative',
                    maxWidth: forDesktop ? '300px' : 'auto'
                },
                class: `py-4 px-4 bg-body-tertiary rounded-2 overflow-visible ${extraClass}`,
                html: [
                    '<div class="pb-3">',
                    '<div class="d-flex justify-content-between align-items-center gap-2">',
                    `<span ${forDesktop ? `id="${data.elements.wrapperSmallMonthCalendarTitleId}"` : ''} data-small-month-title class="fw-bold text-body"></span>`,
                    '<div>',
                    `<a data-prev href="#" class="text-decoration-none text-body me-2"><i class="${settings.icons.prev}"></i></a>`,
                    `<a data-next href="#" class="text-decoration-none text-body"><i class="${settings.icons.next}"></i></a>`,
                    '</div>',
                    '</div>',
                    '</div>',
                    `<div ${forDesktop ? `id="${data.elements.wrapperSmallMonthCalendarId}"` : ''} data-small-month-calendar></div>`,
                    `<div ${forDesktop ? `id="${data.elements.wrapperCalendarsId}"` : ''} data-calendar-list></div>`,
                ].join('')
            };

            if (forDesktop) {
                sidebarAttributes.id = data.elements.wrapperSideNavId;
            }

            const sidebar = $('<div>', sidebarAttributes).appendTo($target);
            sidebar.data('visible', true);

            const calendarList = sidebar.find('[data-calendar-list]');
            const hasCalendars = settings.calendars && Array.isArray(settings.calendars) && settings.calendars.length > 0;
            if (hasCalendars) {
                const calendarWrapper = $('<div>', {
                    class: 'd-flex flex-column gap-2 mt-3 py-2 ps-2 pe-0 bg-body overflow-visible'
                }).appendTo(calendarList);

                settings.calendars.forEach(calendar => {
                    const color = calendar.color.backgroundColor;

                    const itemContainer = $('<a>', {
                        href: '#',
                        class: 'd-flex align-items-center py-1 ps-3 pe-1 rounded-end text-decoration-none user-select-none transition-base',
                        css: {
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            ...getStyleCalendarButton(calendar)
                        },
                        'data-calendar-toggle': calendar.id
                    }).appendTo(calendarWrapper);
                    itemContainer.data('calendar', calendar);

                    $('<span>', {
                        class: 'text-truncate flex-fill',
                        css: {fontSize: '0.9rem'},
                        text: calendar.title
                    }).appendTo(itemContainer);

                    $('<span>', {
                        class: 'rounded-circle mx-2 js-calendar-dot',
                        css: {
                            width: '6px',
                            height: '6px',
                            backgroundColor: color,
                            opacity: calendar.active ? 1 : 0,
                            transition: 'opacity 0.2s'
                        }
                    }).appendTo(itemContainer);
                });
            }

            if (settings.showTasks) {
                const paddingControls = hasCalendars ? 'pb-2' : 'py-2';
                const controlWrapper = $('<div>', {
                    class: 'd-flex flex-column gap-2 ' + paddingControls + ' ps-2 pe-0 bg-body overflow-visible'
                }).appendTo(calendarList);

                const tasksControl = {
                    id: 'tasks',
                    title: settings.translations.tasks,
                    active: data.showTasks,
                    color: $.bsCalendar.utils.getColors(settings.mainColor, settings.mainColor)
                };

                const itemContainer = $('<a>', {
                    href: '#',
                    class: 'd-flex align-items-center py-1 ps-3 pe-1 rounded-end text-decoration-none user-select-none transition-base',
                    css: {
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        ...getStyleCalendarButton(tasksControl)
                    },
                    'data-control-toggle': 'tasks'
                }).appendTo(controlWrapper);

                $('<i>', {
                    class: settings.icons.taskDone + ' me-2',
                }).appendTo(itemContainer);

                $('<span>', {
                    class: 'text-truncate flex-fill',
                    css: {fontSize: '0.9rem'},
                    text: tasksControl.title
                }).appendTo(itemContainer);

                $('<span>', {
                    class: 'rounded-circle mx-2 js-calendar-dot',
                    css: {
                        width: '6px',
                        height: '6px',
                        backgroundColor: tasksControl.color.backgroundColor,
                        opacity: tasksControl.active ? 1 : 0,
                        transition: 'opacity 0.2s'
                    }
                }).appendTo(itemContainer);
            }

            if (settings.sidebarAddons && $(settings.sidebarAddons).length > 0) {
                const sidebarAddonWrapper = $('<div>', {
                    class: 'd-flex flex-column gap-2 mt-3 p-2 bg-body overflow-visible',
                    'data-sidebar-addons': true
                }).appendTo(calendarList);
                const addons = forDesktop ? $(settings.sidebarAddons) : $(settings.sidebarAddons).clone(true, true);
                addons.appendTo(sidebarAddonWrapper);
            }

            return sidebar;
        }

        const mobileTopNav = $('<nav>', {
            class: 'd-flex d-lg-none sticky-top w-100 align-items-center justify-content-between bg-body-tertiary border-0 shadow-sm p-2 rounded-2',
            'data-bs-calendar-mobile-topnav': true,
            css: {
                zIndex: 1010
            }
        }).appendTo(innerWrapper);

        $('<button>', {
            type: 'button',
            class: `btn border-0 text-body shadow-none bs-calendar-border-style`,
            html: `<i class="${settings.icons.menu}"></i>`,
            'data-bs-toggle': 'offcanvas',
            'data-bs-target': '#' + offcanvasId,
            'aria-controls': offcanvasId,
            'aria-label': 'Menu'
        }).appendTo(mobileTopNav);

        $('<strong>', {
            class: 'text-body text-truncate mx-2 flex-fill',
            'data-calendar-view-title': true
        }).appendTo(mobileTopNav);

        const mobileActions = $('<div>', {
            class: 'd-flex align-items-center gap-1'
        }).appendTo(mobileTopNav);
        appendAddButton(mobileActions);
        appendSearchButton(mobileActions);
        appendViewDropdown(mobileActions, '', true);

        const topNav = $('<nav>', {
            id: data.elements.wrapperTopNavId,
            class: 'd-none d-lg-flex sticky-top flex-wrap w-100 g-2 align-items-center justify-content-between bg-body-tertiary border-0 shadow-sm p-2 rounded-2',
            css: {
                zIndex: 1010
            }
        }).appendTo(innerWrapper);

        const leftCol = $('<div>', {class: 'col-md-4 d-flex flex-nowrap align-items-center flex-fill'}).appendTo(topNav);
        const middleCol = $('<div>', {class: 'col-md-4 d-flex justify-content-center flex-fill flex-nowrap align-items-center'}).appendTo(topNav);
        const rightCol = $('<div>', {class: 'col-md-4 d-flex justify-content-md-end flex-wrap flex-lg-nowrap flex-fill align-items-center gap-2'}).appendTo(topNav);

        appendSidebarToggle(leftCol, 'me-2');
        appendSearchButton(leftCol, 'me-2');
        appendAddButton(leftCol, 'me-2');
        appendLoadingSpinner(leftCol);
        appendStaticTitle(middleCol);
        appendViewNavigation(rightCol);
        appendTodayButton(rightCol, 'ms-2');
        appendViewDropdown(rightCol, 'ms-2');
        appendAboutDropdown(rightCol);

        let topSearchNav = null;
        if (settings.search) {
            topSearchNav = $('<div>', {
                id: data.elements.wrapperSearchNavId,
                class: 'd-none sticky-top w-100 align-items-center justify-content-center bg-body-tertiary border-0 shadow-sm p-2 rounded-2',
                css: {
                    zIndex: 1010
                }
            }).insertAfter(topNav);

            const inputCss = 'max-width: 400px;';
            $('<input>', {
                type: 'search',
                style: inputCss,
                class: `form-control border-0 bg-body text-body shadow-none ${roundedClass} bs-calendar-border-style`,
                placeholder: settings.translations.search || 'search',
                'data-search-input': true
            }).appendTo(topSearchNav);

            const btnCloseSearch = $('<button>', {
                type: 'button',
                class: `btn border-0 text-body shadow-none ms-2 js-btn-close-search ${roundedClass} bs-calendar-border-style`,
                html: '<i class="bi bi-x-lg"></i>',
                'aria-label': 'Close'
            }).appendTo(topSearchNav);

            btnCloseSearch.on('click', function () {
                toggleSearchBar($wrapper, false);
                toggleSearchMode($wrapper, false, true);
            });
        }

        if (settings.topbarAddons && $(settings.topbarAddons).length > 0) {
            $(settings.topbarAddons).insertAfter(topSearchNav || topNav);
        }

        const mobileOffcanvas = $('<div>', {
            id: offcanvasId,
            class: 'offcanvas offcanvas-start d-lg-none',
            tabindex: '-1',
            'aria-labelledby': offcanvasId + '-label',
            'data-bs-calendar-mobile-offcanvas': true
        }).appendTo(innerWrapper);

        const offcanvasHeader = $('<div>', {
            class: 'offcanvas-header border-bottom'
        }).appendTo(mobileOffcanvas);

        $('<h5>', {
            id: offcanvasId + '-label',
            class: 'offcanvas-title mb-0',
            html: settings.title || '<span data-calendar-view-title></span>',
            'data-calendar-static-title': settings.title ? true : null
        }).appendTo(offcanvasHeader);

        $('<button>', {
            type: 'button',
            class: 'btn-close',
            'data-bs-dismiss': 'offcanvas',
            'aria-label': 'Close'
        }).appendTo(offcanvasHeader);

        const offcanvasBody = $('<div>', {
            class: 'offcanvas-body p-0'
        }).appendTo(mobileOffcanvas);
        appendSidebarContent(offcanvasBody, false, 'rounded-0 shadow-none h-100');

        mobileOffcanvas.on('show.bs.offcanvas', function () {
            offcanvasBody.scrollTop(0);
        });

        mobileOffcanvas.on('click', '[data-sidebar-addons] a, [data-sidebar-addons] button', function () {
            const offcanvasElement = mobileOffcanvas[0];
            if (window.bootstrap && window.bootstrap.Offcanvas && offcanvasElement) {
                const instance = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasElement);
                if (instance) {
                    instance.hide();
                }
            }
        });

        updateAboutDebugInfo($wrapper);

        // The head was completed, creates a container for Sidebar and the view
        const container = $('<div>', {
            class: 'd-flex flex-fill wc-calendar-container gap-3'
        }).appendTo(innerWrapper);

        appendSidebarContent(container, true, 'd-none d-lg-block');

        // add the viewer
        // FIX: Wir erstellen einen "Design-Wrapper", der das Padding und den Hintergrund hält.
        const viewWrapper = $('<div>', {
            class: `w-100 bg-body-tertiary rounded-2 shadow-sm p-3 p-lg-4 flex-fill d-flex flex-column overflow-hidden`
        }).appendTo(container);

        // Der eigentliche View-Container (den JS resized) kommt da rein.
        // WICHTIG: Kein Padding, kein Border, kein Hintergrund hier drauf!
        // Er füllt einfach den verfügbaren Platz im Wrapper aus (100% - Padding).
        $('<div>', {
            id: data.elements.wrapperViewContainerId,
            class: `wc-calendar-view-container w-100 flex-fill d-flex flex-column align-items-stretch`,
        }).appendTo(viewWrapper);
        // done
    }

    /**
     * Retrieves the IDs of all currently active calendars.
     *
     * @param {jQuery} $wrapper - The wrapper element of the calendar instance.
     * @return {string[]} An array of strings containing the IDs of active calendars.
     *                    Returns an empty array if no calendars are defined or none are active.
     */
    function getActiveCalendarsIds($wrapper) {
        const settings = getSettings($wrapper);
        if (!settings || !settings.calendars || !Array.isArray(settings.calendars)) {
            return [];
        }

        return settings.calendars
            .filter(calendar => calendar.active === true)
            .map(calendar => calendar.id);
    }

    function getStyleCalendarButton(calendar) {
        const color = calendar.color || {};
        const backgroundColor = color.backgroundColor || 'transparent';
        const fadeColor = `color-mix(in srgb, ${backgroundColor}, transparent 85%)`;

        return calendar.active ? {
            borderLeft: `4px solid ${backgroundColor}`,
            backgroundColor: 'transparent',
            backgroundImage: `linear-gradient(90deg, ${fadeColor} 0%, transparent 100%)`,
            color: 'var(--bs-body-color)',
            fontWeight: '600',
            opacity: 1
        } : {
            borderLeft: `4px solid transparent`,
            backgroundColor: 'transparent',
            backgroundImage: 'none',
            color: 'var(--bs-secondary-color)',
            fontWeight: '400',
            opacity: 0.7
        };
    };

    /**
     * Updates the elements displaying the current date information based on the provided wrapper's settings, date, and view.
     *
     * @param {jQuery} $wrapper The wrapper object contains settings, date, and view for getting and formatting the current date.
     * @return {void} Does not return a value, directly updates the text content of the targeted elements with formatted date information.
     */
    function setCurrentDateName($wrapper) {
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const date = data.date;
        const view = data.view;
        const el = $wrapper.find('[data-calendar-view-title]');
        const elSmall = $wrapper.find('[data-small-month-title]');
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

        // Localized date range for the 4-day view (human-friendly)
        function get4DayDateRange(d, locale) {
            const start = new Date(d);
            const end = new Date(start);
            end.setDate(start.getDate() + 3);
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
            case '4day': {
                const range = get4DayDateRange(date, settings.locale);
                el.text(range);
                el.removeAttr('data-iso-week');
                el.attr('title', '');
                break;
            }
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
            case 'agenda':
                el.text((settings.translations.agenda || 'Agenda') + ' · ' + monthName + ' ' + yearName);
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
        const data = getBsCalendarData($wrapper);
        const view = data.view;
        const date = data.date;
        const newDate = new Date(date);
        switch (view) {
            case 'agenda':
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
            case '4day':
                newDate.setDate(newDate.getDate() - 4);
                break;
            case 'day':
                newDate.setDate(newDate.getDate() - 1);
                break;
        }
        data.date = newDate;
        setBsCalendarData($wrapper, data);
        trigger($wrapper, 'navigate-back', view, date, newDate);
        buildByView($wrapper, false);
        updateAboutDebugInfo($wrapper);
    }

    /**
     * Navigates forward in the calendar based on the current view (e.g., day, week, month, year).
     * Updates the date and rebuilds the view accordingly.
     *
     * @param {jQuery} $wrapper - The wrapper element that contains the calendar state and view information.
     * @return {void} - This function does not return a value. It updates the calendar state directly.
     */
    function navigateForward($wrapper) {
        const data = getBsCalendarData($wrapper);
        const view = data.view;
        const date = data.date;
        const newDate = new Date(date);
        switch (view) {
            case 'agenda':
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
            case '4day':
                newDate.setDate(newDate.getDate() + 4);
                break;
            case 'day':
                newDate.setDate(newDate.getDate() + 1);
                break;

        }
        data.date = newDate;
        setBsCalendarData($wrapper, data);
        trigger($wrapper, 'navigate-forward', view, date, newDate);
        buildByView($wrapper, false);
        updateAboutDebugInfo($wrapper);
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
        const data = getBsCalendarData($wrapper);
        const input = getSearchElement($wrapper);
        const topNav = $wrapper.find('#' + data.elements.wrapperTopNavId);
        const topSearchNav = $wrapper.find('#' + data.elements.wrapperSearchNavId);
        const mobileTopNav = $wrapper.find('[data-bs-calendar-mobile-topnav]');
        if (status) {
            topNav.removeClass('d-lg-flex').addClass('d-none');
            mobileTopNav.removeClass('d-flex').addClass('d-none');
            topSearchNav.removeClass('d-none').addClass('d-flex');
            input.focus();
        } else {
            input.val(null);
            topNav.removeClass('d-none').addClass('d-lg-flex');
            mobileTopNav.removeClass('d-none').addClass('d-flex');
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
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        if (status) {
            if (!data.searchMode && data.view !== 'search') {
                data.viewBeforeSearch = data.view;
            }
            data.searchMode = true;
            // Ensure the search view is rebuilt from scratch.
            data.renderState = null;
            setBsCalendarData($wrapper, data);
            buildByView($wrapper, false);
        } else {
            data.searchMode = false;
            if (data.viewBeforeSearch && settings.views.includes(data.viewBeforeSearch)) {
                data.view = data.viewBeforeSearch;
            }
            data.viewBeforeSearch = null;
            // Force a full structural rebuild when leaving search mode.
            // Otherwise the cached renderState may skip rebuilding and keep search DOM visible.
            data.renderState = null;
            setBsCalendarData($wrapper, data);

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
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const search = {limit: settings.search.limit, offset: settings.search.offset};
        data.searchPagination = search;
        setBsCalendarData($wrapper, data);
    }

    /**
     * Sets the search pagination data on the given wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery element where the pagination data will be stored.
     * @param {Object|null} object - The pagination data to be set. If the object is empty, it will set null.
     * @return {void}
     */
    function setSearchPagination($wrapper, object) {
        const data = getBsCalendarData($wrapper);
        const pagination = $.bsCalendar.utils.isValueEmpty(object) ? null : object;
        data.searchPagination = pagination;
        setBsCalendarData($wrapper, data);
    }

    /**
     * Retrieves the search pagination data from the given wrapper element.
     *
     * @param {Object} $wrapper - The jQuery-wrapped DOM element containing the search pagination data.
     * @return {Object|undefined} The search pagination data associated with the wrapper element, or undefined if none is found.
     */
    function getSearchPagination($wrapper) {
        const data = getBsCalendarData($wrapper);
        return data.searchPagination;
    }

    /**
     * Sets the search mode status on the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The jQuery object representing the wrapper element.
     * @param {boolean} status - The status indicating whether search mode should be enabled (true) or disabled (false).
     * @return {void}
     */
    function setSearchMode($wrapper, status) {
        const data = getBsCalendarData($wrapper);
        data.searchMode = status;
        setBsCalendarData($wrapper, data);
    }

    /**
     * Retrieves the search mode from the provided wrapper element.
     *
     * @param {Object} $wrapper - A jQuery object representing the wrapper element containing the search mode data.
     * @return {bool} The search mode value stored in the data attribute of the wrapper element.
     */
    function getSearchMode($wrapper) {
        const data = getBsCalendarData($wrapper);
        return data.searchMode;
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
        const data = getBsCalendarData($wrapper);
        const $sidebar = $wrapper.find('#' + data.elements.wrapperSideNavId);
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

    function getAllCalendarWrappers() {
        return $('body').find(globalCalendarElements.wrapper);
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
        if (!globalEventsInitialized) {
            $(window).off("resize" + namespace);
            $(window).on("resize" + namespace, function () {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    const allWrappers = getAllCalendarWrappers();
                    allWrappers.each(function (i, w) {
                        onResize($(w), true);
                    });

                }, 100);
            });
            globalEventsInitialized = true;
        }

        function getSnapMinutes($wrapperRef) {
            const settings = getSettings($wrapperRef);
            const snap = Number(settings?.draggableSnapMinutes);
            if (!Number.isFinite(snap)) {
                return $.bsCalendar.getDefaults().draggableSnapMinutes;
            }
            return Math.max(1, Math.floor(snap));
        }

        function isTouchPointerEvent(e) {
            return (e.originalEvent && e.originalEvent.pointerType === 'touch');
        }

        function isTouchLikeEvent(e) {
            return e.type.indexOf('touch') === 0 || isTouchPointerEvent(e);
        }

        function getEventPageXY(e) {
            const oe = e.originalEvent || e;
            if (Number.isFinite(e.pageX) && Number.isFinite(e.pageY)) {
                return {x: e.pageX, y: e.pageY};
            }
            if (oe && oe.touches && oe.touches.length > 0) {
                return {x: oe.touches[0].pageX, y: oe.touches[0].pageY};
            }
            if (oe && oe.changedTouches && oe.changedTouches.length > 0) {
                return {x: oe.changedTouches[0].pageX, y: oe.changedTouches[0].pageY};
            }
            if (Number.isFinite(oe?.pageX) && Number.isFinite(oe?.pageY)) {
                return {x: oe.pageX, y: oe.pageY};
            }
            return {x: NaN, y: NaN};
        }

        function resolveEventWrapper(target, fallbackWrapper) {
            const $resolved = $(target).closest(globalCalendarElements.wrapper);
            if ($resolved.length) {
                return $resolved;
            }
            return fallbackWrapper;
        }

        function getMinutesFromPointer($wrapperRef, $slotContainer, pageY) {
            const settings = getSettings($wrapperRef);
            const offset = $slotContainer.offset();
            const slotHeight = settings.hourSlots.height;
            const totalMinutes = Math.max(0, (settings.hourSlots.end - settings.hourSlots.start) * 60);
            const totalHeightPx = Math.max(0.1, (settings.hourSlots.end - settings.hourSlots.start) * slotHeight);
            const relativeY = Math.max(0, Math.min(totalHeightPx, pageY - offset.top));
            const minutesFloat = (relativeY / totalHeightPx) * totalMinutes;
            const snap = getSnapMinutes($wrapperRef);
            const snapped = Math.round(minutesFloat / snap) * snap;
            return Math.max(0, Math.min(totalMinutes, snapped));
        }

        function getMoveSlotContainerFromPointer($wrapperRef, point, $fallbackSlotContainer) {
            const view = getView($wrapperRef);
            if ((view !== 'week' && view !== '4day') || !Number.isFinite(point.x)) {
                return $fallbackSlotContainer;
            }

            let bestStrictMatch = null;
            let bestHorizontalMatch = null;

            // Restrict hit-testing to the active view and visible day slot columns only.
            // Choose the nearest candidate to avoid boundary flicker between adjacent days.
            getViewContainer($wrapperRef).find('.wc-day-view-time-slots:visible').each(function () {
                const $slotContainer = $(this);
                const offset = $slotContainer.offset();
                if (!offset) {
                    return;
                }

                const left = offset.left;
                const right = left + $slotContainer.outerWidth();
                const top = offset.top;
                const bottom = top + $slotContainer.outerHeight();
                const centerX = left + ((right - left) / 2);
                const centerY = top + ((bottom - top) / 2);
                const withinX = point.x >= left && point.x < right;
                const withinY = !Number.isFinite(point.y) || (point.y >= top - 40 && point.y <= bottom + 40);
                const distanceX = Math.abs(point.x - centerX);
                const distanceY = Number.isFinite(point.y) ? Math.abs(point.y - centerY) : 0;
                const score = distanceX + (distanceY * 0.1);

                if (withinX) {
                    if (!bestHorizontalMatch || score < bestHorizontalMatch.score) {
                        bestHorizontalMatch = {$slotContainer, score};
                    }
                }

                if (withinX && withinY) {
                    if (!bestStrictMatch || score < bestStrictMatch.score) {
                        bestStrictMatch = {$slotContainer, score};
                    }
                }
            });

            if (bestStrictMatch && bestStrictMatch.$slotContainer.length) {
                return bestStrictMatch.$slotContainer;
            }
            if (bestHorizontalMatch && bestHorizontalMatch.$slotContainer.length) {
                return bestHorizontalMatch.$slotContainer;
            }
            return $fallbackSlotContainer;
        }

        function getMonthDayCellFromPointer($wrapperRef, point, $fallbackCell) {
            if (getView($wrapperRef) !== 'month' || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
                return $fallbackCell;
            }

            let $matchedCell = $();
            getViewContainer($wrapperRef).find('[data-month-date]').each(function () {
                const $cell = $(this);
                const offset = $cell.offset();
                if (!offset) {
                    return;
                }

                const left = offset.left;
                const right = left + $cell.outerWidth();
                const top = offset.top;
                const bottom = top + $cell.outerHeight();

                if (point.x >= left && point.x <= right && point.y >= top && point.y <= bottom) {
                    $matchedCell = $cell;
                    return false;
                }
            });

            return $matchedCell.length ? $matchedCell : $fallbackCell;
        }

        function getLocalDateIndex(date) {
            const parsedDate = typeof date === 'string' ? $.bsCalendar.utils.parseDateInput(date) : date;
            return Math.round(Date.UTC(
                parsedDate.getFullYear(),
                parsedDate.getMonth(),
                parsedDate.getDate()
            ) / 86400000);
        }

        function addDaysPreservingTime(date, days) {
            const movedDate = new Date(date.getTime());
            movedDate.setDate(movedDate.getDate() + days);
            return movedDate;
        }

        function cleanupMonthMoveDragElement(dragState) {
            if (!dragState || !dragState.$appointment) {
                return;
            }

            dragState.$appointment.css({opacity: '', zIndex: '', cursor: ''});
            if (dragState.$placeholder && dragState.$placeholder.length) {
                dragState.$placeholder.remove();
            }
        }

        function minutesToTimeString(totalMinutes) {
            const h = Math.floor(totalMinutes / 60);
            const m = totalMinutes % 60;
            return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        }

        function buildDateTimeByMinutes($wrapperRef, dateString, minutesFromStart) {
            const settings = getSettings($wrapperRef);
            const date = $.bsCalendar.utils.parseDateInput(dateString);
            const startHour = Math.floor(settings.hourSlots.start);
            const startMin = Math.round((settings.hourSlots.start % 1) * 60);
            date.setHours(startHour, startMin, 0, 0);
            date.setMinutes(date.getMinutes() + minutesFromStart);
            return date;
        }

        function setInteractionCursor(canWork) {
            $('body').css('cursor', canWork ? '' : 'not-allowed');
        }

        function clearInteractionCursor() {
            $('body').css('cursor', '');
        }

        function getTouchLockTarget(target) {
            return $(target).closest('[data-day-hour], [data-appointment], [data-month-date], .wc-day-view-time-slots').get(0) || null;
        }

        function touchDragMoveGuard(ev) {
            const lock = globalDragState.touchDragLock;
            if (!lock) {
                return;
            }

            if (globalDragState.createDragState || globalDragState.moveDragState || globalDragState.resizeDragState || globalDragState.monthMoveDragState) {
                ev.preventDefault();
                return;
            }

            if (!globalDragState.pendingCreate && !globalDragState.pendingMove && !globalDragState.pendingResize) {
                return;
            }

            const point = getEventPageXY(ev);
            const x = Number.isFinite(point.x) ? point.x : lock.startX;
            const y = Number.isFinite(point.y) ? point.y : lock.startY;
            const deltaX = Math.abs(x - lock.startX);
            const deltaY = Math.abs(y - lock.startY);

            if (lock.preventScroll || deltaX <= lock.cancelDistance || deltaY <= lock.cancelDistance) {
                ev.preventDefault();
            }
        }

        function lockTouchDrag(target, startPoint, preventScroll = false) {
            unlockTouchDrag();

            const $target = $(getTouchLockTarget(target));
            const originalStyles = [];
            const $styled = $target.length
                ? $target.add($target.closest(globalCalendarElements.wrapper)).add($target.closest('.wc-calendar-view-container'))
                : $();

            $styled.each(function () {
                const el = this;
                originalStyles.push({
                    el: el,
                    touchAction: el.style.touchAction,
                    userSelect: el.style.userSelect,
                    webkitUserSelect: el.style.webkitUserSelect
                });
                el.style.touchAction = 'none';
                el.style.userSelect = 'none';
                el.style.webkitUserSelect = 'none';
            });

            document.addEventListener('touchmove', touchDragMoveGuard, {passive: false, capture: true});

            globalDragState.touchDragLock = {
                startX: Number.isFinite(startPoint.x) ? startPoint.x : 0,
                startY: Number.isFinite(startPoint.y) ? startPoint.y : 0,
                cancelDistance: 8,
                preventScroll: preventScroll,
                originalStyles: originalStyles
            };
        }

        function unlockTouchDrag() {
            const lock = globalDragState.touchDragLock;
            if (lock && Array.isArray(lock.originalStyles)) {
                lock.originalStyles.forEach(item => {
                    item.el.style.touchAction = item.touchAction;
                    item.el.style.userSelect = item.userSelect;
                    item.el.style.webkitUserSelect = item.webkitUserSelect;
                });
            }
            document.removeEventListener('touchmove', touchDragMoveGuard, {capture: true});
            globalDragState.touchDragLock = null;
        }

        function appointmentsOverlap(a, b) {
            return !(a.end <= b.start || a.start >= b.end);
        }

        function relayoutDayContainerForDrag($wrapperRef, $slotContainer, movingAppointment, tempStart, tempEnd) {
            const settings = getSettings($wrapperRef);
            const $movingEl = movingAppointment?.$appointment || $();
            const $appointments = $slotContainer.find('[data-appointment]').not($movingEl);
            const items = [];

            const containerDateLocal = $slotContainer.data('date-local');

            $appointments.each(function () {
                const $el = $(this);
                const appointment = $el.data('appointment');
                if (!appointment || appointment.allDay) {
                    return;
                }
                let start = $.bsCalendar.utils.parseDateInput(appointment.start);
                let end = $.bsCalendar.utils.parseDateInput(appointment.end);
                if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return;
                }

                // For multi-day appointments: crop start/end to the container's day
                if (containerDateLocal) {
                    const dayStart = new Date(`${containerDateLocal}T00:00:00`);
                    const dayEnd = new Date(`${containerDateLocal}T23:59:59`);
                    if (start < dayStart) {
                        start = dayStart;
                    }
                    if (end > dayEnd) {
                        end = dayEnd;
                    }
                }

                items.push({$el, appointment, start, end});
            });

            if (movingAppointment && movingAppointment.appointment) {
                let start = new Date(tempStart);
                let end = new Date(tempEnd);

                if (containerDateLocal) {
                    const dayStart = new Date(`${containerDateLocal}T00:00:00`);
                    const dayEnd = new Date(`${containerDateLocal}T23:59:59`);
                    if (start < dayStart) {
                        start = dayStart;
                    }
                    if (end > dayEnd) {
                        end = dayEnd;
                    }
                }

                items.push({
                    $el: $movingEl,
                    appointment: movingAppointment.appointment,
                    start: start,
                    end: end
                });
            }

            items.sort((a, b) => a.start - b.start || a.end - b.end);
            const clusters = [];
            let currentCluster = [];
            let clusterEnd = null;

            items.forEach(item => {
                if (!currentCluster.length) {
                    currentCluster.push(item);
                    clusterEnd = item.end;
                    return;
                }

                if (item.start < clusterEnd) {
                    currentCluster.push(item);
                    if (item.end > clusterEnd) {
                        clusterEnd = item.end;
                    }
                } else {
                    clusters.push(currentCluster);
                    currentCluster = [item];
                    clusterEnd = item.end;
                }
            });

            if (currentCluster.length) {
                clusters.push(currentCluster);
            }

            const columnGap = 2;
            const containerWidth = Math.max(1, $slotContainer.width());

            clusters.forEach(cluster => {
                const forcedOverlapItems = cluster.filter(item => isAppointmentOverlapEnabled(item.appointment));
                const regularItems = cluster.filter(item => !isAppointmentOverlapEnabled(item.appointment));
                const columns = [];
                regularItems.forEach(item => {
                    let placed = false;
                    for (let i = 0; i < columns.length; i++) {
                        const column = columns[i];
                        const hasOverlap = column.some(existing => appointmentsOverlap(existing, item));
                        if (!hasOverlap) {
                            column.push(item);
                            item._column = i;
                            placed = true;
                            break;
                        }
                    }
                    if (!placed) {
                        columns.push([item]);
                        item._column = columns.length - 1;
                    }
                });

                if (regularItems.length) {
                    const totalColumns = Math.max(1, columns.length);
                    const totalGap = (totalColumns - 1) * columnGap;
                    const widthPercent = totalColumns > 1 ? (100 - (totalGap * 100 / containerWidth)) / totalColumns : 100;

                    regularItems.forEach(item => {
                        const position = calculateSlotPosition($wrapperRef, item.start.toISOString(), item.end.toISOString());
                        const leftPercent = totalColumns > 1 ? item._column * (widthPercent + (columnGap * 100 / containerWidth)) : 0;
                        item.$el.css({
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            left: `${leftPercent}%`,
                            width: `${widthPercent}%`
                        });
                    });
                }

                forcedOverlapItems
                    .sort((a, b) => a.start - b.start || a.end - b.end)
                    .forEach((item) => {
                        const position = calculateSlotPosition($wrapperRef, item.start.toISOString(), item.end.toISOString());
                        item.$el.css({
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            left: '0%',
                            width: '100%'
                        });
                    });
            });

            // Keep stacking stable for the whole day container while dragging:
            // Sort ALL items by start ascending and assign zIndex accordingly
            items
                .sort((a, b) => a.start - b.start || a.end - b.end)
                .forEach((item, index) => {
                    const isMoving = movingAppointment && item.appointment === movingAppointment.appointment;
                    item.$el.css('zIndex', isMoving ? 12 : index + 1);
                });
        }

        function formatDragTimeLabel($wrapperRef, minutesFromStart) {
            const settings = getSettings($wrapperRef);
            const totalMinutes = minutesFromStart + (settings.hourSlots.start * 60);
            const hour = Math.floor(totalMinutes / 60);
            const minute = Math.round(totalMinutes % 60);
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        }

        function buildDragTimeBadge(text) {
            return $('<div>', {
                class: 'position-absolute badge bg-primary',
                css: {
                    fontSize: '10px',
                    padding: '2px 4px',
                    right: '4px',
                    top: '2px',
                    zIndex: 13,
                    pointerEvents: 'none'
                },
                text: text || ''
            });
        }

        $(document)
            .off('mousemove' + namespace + ' mouseup' + namespace + ' pointermove' + namespace + ' pointerup' + namespace + ' touchmove' + namespace + ' touchend' + namespace + ' touchcancel' + namespace)
            .on('mousemove' + namespace + ' pointermove' + namespace + ' touchmove' + namespace, function (e) {
                const point = getEventPageXY(e);
                const pageY = point.y;
                if (!Number.isFinite(pageY)) {
                    return;
                }

                if (globalDragState.monthMoveDragState) {
                    if (isTouchLikeEvent(e)) {
                        e.preventDefault();
                    }
                    let monthTargetBlocked = false;
                    const $previousCell = globalDragState.monthMoveDragState.$targetCell;
                    const $targetCell = getMonthDayCellFromPointer(
                        globalDragState.monthMoveDragState.$wrapper,
                        point,
                        $previousCell
                    );

                    if ($targetCell.length && !$targetCell.is($previousCell)) {
                        const targetDateLocal = String($targetCell.attr('data-month-date'));
                        const $dayWrapper = $targetCell.find('[data-role="day-wrapper"]').first();
                        if ($dayWrapper.length) {
                            const appointment = globalDragState.monthMoveDragState.$appointment.data('appointment');
                            const start = appointment ? $.bsCalendar.utils.parseDateInput(appointment.start) : null;
                            const end = appointment ? $.bsCalendar.utils.parseDateInput(appointment.end) : null;
                            let canUseTargetCell = true;

                            if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                                const dayDelta = getLocalDateIndex(targetDateLocal) -
                                    getLocalDateIndex(globalDragState.monthMoveDragState.sourceDateLocal);
                                const tempStart = addDaysPreservingTime(start, dayDelta);
                                const tempEnd = addDaysPreservingTime(end, dayDelta);
                                canUseTargetCell = isHourSlotRuleRangeAllowed(globalDragState.monthMoveDragState.$wrapper, tempStart, tempEnd) &&
                                    isAppointmentDurationAllowed(globalDragState.monthMoveDragState.$wrapper, tempStart, tempEnd);
                            }

                            if (canUseTargetCell) {
                                globalDragState.monthMoveDragState.$targetCell = $targetCell;
                                globalDragState.monthMoveDragState.targetDateLocal = targetDateLocal;
                                globalDragState.monthMoveDragState.$appointment.appendTo($dayWrapper);
                            } else {
                                monthTargetBlocked = true;
                            }
                        }
                    }

                    if (!globalDragState.monthMoveDragState.dragged) {
                        removeInfoWindowModal();
                    }
                    globalDragState.monthMoveDragState.$appointment.css({opacity: 0.8});
                    const monthAppointment = globalDragState.monthMoveDragState.$appointment.data('appointment');
                    if (monthTargetBlocked) {
                        globalDragState.monthMoveDragState.canWork = false;
                        globalDragState.monthMoveDragState.$appointment.css('cursor', 'not-allowed');
                        setInteractionCursor(false);
                    } else if (monthAppointment) {
                        const start = $.bsCalendar.utils.parseDateInput(monthAppointment.start);
                        const end = $.bsCalendar.utils.parseDateInput(monthAppointment.end);
                        if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                            const dayDelta = getLocalDateIndex(globalDragState.monthMoveDragState.targetDateLocal) -
                                getLocalDateIndex(globalDragState.monthMoveDragState.sourceDateLocal);
                            const tempStart = addDaysPreservingTime(start, dayDelta);
                            const tempEnd = addDaysPreservingTime(end, dayDelta);
                            const canWork = isHourSlotRuleRangeAllowed(globalDragState.monthMoveDragState.$wrapper, tempStart, tempEnd) &&
                                isAppointmentDurationAllowed(globalDragState.monthMoveDragState.$wrapper, tempStart, tempEnd);
                            globalDragState.monthMoveDragState.canWork = canWork;
                            globalDragState.monthMoveDragState.$appointment.css('cursor', canWork ? 'grabbing' : 'not-allowed');
                            setInteractionCursor(canWork);
                        }
                    }
                    globalDragState.monthMoveDragState.dragged = true;
                }

                if (globalDragState.createDragState) {
                    if (isTouchLikeEvent(e)) {
                        e.preventDefault();
                    }
                    const settings = getSettings(globalDragState.createDragState.$wrapper);
                    const endMinutesRaw = getMinutesFromPointer(globalDragState.createDragState.$wrapper, globalDragState.createDragState.$slotContainer, pageY);
                    let startMinutes = Math.min(globalDragState.createDragState.startMinutes, endMinutesRaw);
                    let endMinutes = Math.max(globalDragState.createDragState.startMinutes, endMinutesRaw);
                    const snap = getSnapMinutes(globalDragState.createDragState.$wrapper);
                    if (endMinutes - startMinutes < snap) {
                        endMinutes = Math.min(endMinutes + snap, (settings.hourSlots.end - settings.hourSlots.start) * 60);
                    }
                    const clampedRange = clampCreateMinutesToHourSlotRules(
                        globalDragState.createDragState.$wrapper,
                        globalDragState.createDragState.dateLocal,
                        globalDragState.createDragState.startMinutes,
                        endMinutesRaw,
                        snap
                    );
                    startMinutes = clampedRange.startMinutes;
                    endMinutes = clampedRange.endMinutes;

                    const topPx = (startMinutes / 60) * settings.hourSlots.height;
                    const heightPx = Math.max(10, ((endMinutes - startMinutes) / 60) * settings.hourSlots.height);
                    const previewStart = buildDateTimeByMinutes(globalDragState.createDragState.$wrapper, globalDragState.createDragState.dateLocal, startMinutes);
                    const previewEnd = buildDateTimeByMinutes(globalDragState.createDragState.$wrapper, globalDragState.createDragState.dateLocal, endMinutes);
                    const canWork = isHourSlotRuleRangeAllowed(globalDragState.createDragState.$wrapper, previewStart, previewEnd) &&
                        isAppointmentDurationAllowed(globalDragState.createDragState.$wrapper, previewStart, previewEnd);

                    globalDragState.createDragState.$preview.css({
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        display: 'block',
                        cursor: canWork ? 'copy' : 'not-allowed',
                        opacity: canWork ? 0.2 : 0.1
                    });
                    setInteractionCursor(canWork);

                    // Update time labels
                    const totalStartMinutes = startMinutes + (settings.hourSlots.start * 60);
                    const totalEndMinutes = endMinutes + (settings.hourSlots.start * 60);

                    const startHour = Math.floor(totalStartMinutes / 60);
                    const startMinute = Math.round(totalStartMinutes % 60);
                    const endHour = Math.floor(totalEndMinutes / 60);
                    const endMinute = Math.round(totalEndMinutes % 60);
                    const startTimeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
                    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;
                    globalDragState.createDragState.$startTimeLabel.text(startTimeStr);
                    globalDragState.createDragState.$endTimeLabel.text(endTimeStr);

                    if (!globalDragState.createDragState.dragged) {
                        removeInfoWindowModal();
                    }
                    globalDragState.createDragState.currentStartMinutes = startMinutes;
                    globalDragState.createDragState.currentEndMinutes = endMinutes;
                    globalDragState.createDragState.canWork = canWork;
                    globalDragState.createDragState.dragged = true;
                }

                if (globalDragState.moveDragState) {
                    if (isTouchLikeEvent(e)) {
                        e.preventDefault();
                    }
                    const settings = getSettings(globalDragState.moveDragState.$wrapper);
                    const durationMinutes = Math.max(getSnapMinutes(globalDragState.moveDragState.$wrapper), Math.round(globalDragState.moveDragState.durationMs / 60000));
                    let blockedMoveTarget = false;
                    const $previousSlotContainer = globalDragState.moveDragState.$slotContainer;
                    const $targetSlotContainer = getMoveSlotContainerFromPointer(
                        globalDragState.moveDragState.$wrapper,
                        point,
                        $previousSlotContainer
                    );

                    if ($targetSlotContainer.length && !$targetSlotContainer.is($previousSlotContainer)) {
                        const targetDateLocal = String($targetSlotContainer.attr('data-date-local'));
                        const targetPointerMinutes = getMinutesFromPointer(globalDragState.moveDragState.$wrapper, $targetSlotContainer, pageY);
                        const targetMaxStart = Math.max(0, ((settings.hourSlots.end - settings.hourSlots.start) * 60) - durationMinutes);
                        const targetNewStartMinutes = Math.max(0, Math.min(targetMaxStart, targetPointerMinutes - globalDragState.moveDragState.offsetMinutes));
                        const targetSnap = getSnapMinutes(globalDragState.moveDragState.$wrapper);
                        const targetSnappedStart = Math.round(targetNewStartMinutes / targetSnap) * targetSnap;
                        const targetClampedMove = clampMoveMinutesToHourSlotRules(
                            globalDragState.moveDragState.$wrapper,
                            targetDateLocal,
                            targetSnappedStart,
                            durationMinutes
                        );

                        if (targetClampedMove.canWork) {
                            globalDragState.moveDragState.$slotContainer = $targetSlotContainer;
                            globalDragState.moveDragState.dateLocal = targetDateLocal;
                            globalDragState.moveDragState.$appointment.appendTo($targetSlotContainer);
                            relayoutDayContainerForDrag(
                                globalDragState.moveDragState.$wrapper,
                                $previousSlotContainer,
                                null,
                                null,
                                null
                            );
                        } else {
                            blockedMoveTarget = true;
                        }
                    }

                    const pointerMinutes = getMinutesFromPointer(globalDragState.moveDragState.$wrapper, globalDragState.moveDragState.$slotContainer, pageY);
                    const maxStart = Math.max(0, ((settings.hourSlots.end - settings.hourSlots.start) * 60) - durationMinutes);
                    const newStartMinutes = Math.max(0, Math.min(maxStart, pointerMinutes - globalDragState.moveDragState.offsetMinutes));
                    const snap = getSnapMinutes(globalDragState.moveDragState.$wrapper);
                    let snappedStart = Math.round(newStartMinutes / snap) * snap;
                    const clampedMove = clampMoveMinutesToHourSlotRules(
                        globalDragState.moveDragState.$wrapper,
                        globalDragState.moveDragState.dateLocal,
                        snappedStart,
                        durationMinutes
                    );
                    snappedStart = clampedMove.startMinutes;
                    const tempStart = buildDateTimeByMinutes(
                        globalDragState.moveDragState.$wrapper,
                        globalDragState.moveDragState.dateLocal,
                        snappedStart
                    );
                    const tempEnd = new Date(tempStart.getTime() + globalDragState.moveDragState.durationMs);
                    const canWork = !blockedMoveTarget &&
                        isHourSlotRuleRangeAllowed(globalDragState.moveDragState.$wrapper, tempStart, tempEnd) &&
                        isAppointmentDurationAllowed(globalDragState.moveDragState.$wrapper, tempStart, tempEnd);
                    relayoutDayContainerForDrag(
                        globalDragState.moveDragState.$wrapper,
                        globalDragState.moveDragState.$slotContainer,
                        globalDragState.moveDragState,
                        tempStart,
                        tempEnd
                    );

                    // Update time display badge
                    const totalStartMinutes = snappedStart + (settings.hourSlots.start * 60);
                    const startHour = Math.floor(totalStartMinutes / 60);
                    const startMinute = Math.round(totalStartMinutes % 60);
                    const timeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
                    globalDragState.moveDragState.$timeDisplay.text(timeStr);

                    globalDragState.moveDragState.$appointment.css({opacity: 0.8});
                    globalDragState.moveDragState.$appointment.css('cursor', canWork ? 'grabbing' : 'not-allowed');
                    setInteractionCursor(canWork);
                    if (!globalDragState.moveDragState.dragged) {
                        removeInfoWindowModal();
                    }
                    globalDragState.moveDragState.currentStartMinutes = snappedStart;
                    globalDragState.moveDragState.canWork = canWork;
                    globalDragState.moveDragState.dragged = true;
                }

                if (globalDragState.resizeDragState) {
                    if (isTouchLikeEvent(e)) {
                        e.preventDefault();
                    }
                    const settings = getSettings(globalDragState.resizeDragState.$wrapper);
                    const snap = getSnapMinutes(globalDragState.resizeDragState.$wrapper);
                    const totalMinutes = Math.max(0, (settings.hourSlots.end - settings.hourSlots.start) * 60);
                    const pointerMinutes = getMinutesFromPointer(
                        globalDragState.resizeDragState.$wrapper,
                        globalDragState.resizeDragState.$slotContainer,
                        pageY
                    );
                    const clampedResize = clampResizeMinutesToHourSlotRules(
                        globalDragState.resizeDragState.$wrapper,
                        globalDragState.resizeDragState.dateLocal,
                        globalDragState.resizeDragState.edge,
                        globalDragState.resizeDragState.edge === 'start'
                            ? globalDragState.resizeDragState.originalEndMinutes
                            : globalDragState.resizeDragState.originalStartMinutes,
                        Math.max(0, Math.min(totalMinutes, pointerMinutes)),
                        snap
                    );
                    const startMinutes = clampedResize.startMinutes;
                    const endMinutes = clampedResize.endMinutes;
                    const tempStart = buildDateTimeByMinutes(
                        globalDragState.resizeDragState.$wrapper,
                        globalDragState.resizeDragState.dateLocal,
                        startMinutes
                    );
                    const tempEnd = buildDateTimeByMinutes(
                        globalDragState.resizeDragState.$wrapper,
                        globalDragState.resizeDragState.dateLocal,
                        endMinutes
                    );
                    const canWork = clampedResize.canWork &&
                        isHourSlotRuleRangeAllowed(globalDragState.resizeDragState.$wrapper, tempStart, tempEnd) &&
                        isAppointmentDurationAllowed(globalDragState.resizeDragState.$wrapper, tempStart, tempEnd);

                    relayoutDayContainerForDrag(
                        globalDragState.resizeDragState.$wrapper,
                        globalDragState.resizeDragState.$slotContainer,
                        globalDragState.resizeDragState,
                        tempStart,
                        tempEnd
                    );

                    globalDragState.resizeDragState.$appointment.css({opacity: 0.85});
                    globalDragState.resizeDragState.$appointment.css('cursor', canWork ? 'ns-resize' : 'not-allowed');
                    globalDragState.resizeDragState.$timeDisplay.text(
                        `${formatDragTimeLabel(globalDragState.resizeDragState.$wrapper, startMinutes)} - ${formatDragTimeLabel(globalDragState.resizeDragState.$wrapper, endMinutes)}`
                    );
                    setInteractionCursor(canWork);
                    if (!globalDragState.resizeDragState.dragged) {
                        removeInfoWindowModal();
                    }
                    globalDragState.resizeDragState.currentStartMinutes = startMinutes;
                    globalDragState.resizeDragState.currentEndMinutes = endMinutes;
                    globalDragState.resizeDragState.canWork = canWork;
                    globalDragState.resizeDragState.dragged = true;
                }
            })
            .on('mouseup' + namespace + ' pointerup' + namespace + ' touchend' + namespace + ' touchcancel' + namespace, function () {
                clearInteractionCursor();
                unlockTouchDrag();
                if (globalDragState.pendingCreate?.timer) {
                    clearTimeout(globalDragState.pendingCreate.timer);
                }
                if (globalDragState.pendingMove?.timer) {
                    clearTimeout(globalDragState.pendingMove.timer);
                }
                if (globalDragState.pendingResize?.timer) {
                    clearTimeout(globalDragState.pendingResize.timer);
                }
                globalDragState.pendingCreate = null;
                globalDragState.pendingMove = null;
                globalDragState.pendingResize = null;

                if (globalDragState.createDragState) {
                    if (globalDragState.createDragState.$preview) {
                        globalDragState.createDragState.$preview.remove();
                    }
                    // Clean up time labels
                    if (globalDragState.createDragState.$startTimeLabel) {
                        globalDragState.createDragState.$startTimeLabel.remove();
                    }
                    if (globalDragState.createDragState.$endTimeLabel) {
                        globalDragState.createDragState.$endTimeLabel.remove();
                    }
                    if (globalDragState.createDragState.dragged) {
                        globalDragState.suppressSlotClickUntil = Date.now() + 250;
                        const start = buildDateTimeByMinutes(globalDragState.createDragState.$wrapper, globalDragState.createDragState.dateLocal, globalDragState.createDragState.currentStartMinutes);
                        const end = buildDateTimeByMinutes(globalDragState.createDragState.$wrapper, globalDragState.createDragState.dateLocal, globalDragState.createDragState.currentEndMinutes);
                        const dragExtras = getDragAppointmentExtras(globalDragState.createDragState.$wrapper, start, end);
                        if (!dragExtras.hourSlotRules.canWork || !dragExtras.appointmentRules.canWork) {
                            globalDragState.createDragState = null;
                        } else {
                            const payload = {
                                start: {
                                    date: $.bsCalendar.utils.formatDateToDateString(start),
                                    time: start.toTimeString().slice(0, 5)
                                },
                                end: {
                                    date: $.bsCalendar.utils.formatDateToDateString(end),
                                    time: end.toTimeString().slice(0, 5)
                                },
                                view: getView(globalDragState.createDragState.$wrapper)
                            };
                            trigger(globalDragState.createDragState.$wrapper, 'add', payload, dragExtras);
                            removeInfoWindowModal();
                        }
                    }
                    globalDragState.createDragState = null;
                }

                if (globalDragState.moveDragState) {
                    const $appointment = globalDragState.moveDragState.$appointment;
                    $appointment.css({opacity: '', cursor: ''});
                    // Remove time display badge
                    if (globalDragState.moveDragState.$timeDisplay) {
                        globalDragState.moveDragState.$timeDisplay.remove();
                    }
                    if (globalDragState.moveDragState.dragged) {
                        globalDragState.suppressAppointmentClickUntil = Date.now() + 250;
                        const appointment = $appointment.data('appointment');
                        if (appointment) {
                            const newStart = buildDateTimeByMinutes(globalDragState.moveDragState.$wrapper, globalDragState.moveDragState.dateLocal, globalDragState.moveDragState.currentStartMinutes);
                            const newEnd = new Date(newStart.getTime() + globalDragState.moveDragState.durationMs);

                            const returnData = getAppointmentForReturn(appointment);
                            const dragExtras = getDragAppointmentExtras(globalDragState.moveDragState.$wrapper, newStart, newEnd);
                            if (!dragExtras.hourSlotRules.canWork || !dragExtras.appointmentRules.canWork) {
                                buildAppointmentsForView(globalDragState.moveDragState.$wrapper);
                                globalDragState.moveDragState = null;
                            } else {
                                trigger(globalDragState.moveDragState.$wrapper, 'edit', returnData.appointment, returnData.extras, dragExtras);
                                removeInfoWindowModal();
                            }
                        }
                    }
                    globalDragState.moveDragState = null;
                }

                if (globalDragState.resizeDragState) {
                    const dragState = globalDragState.resizeDragState;
                    const $appointment = dragState.$appointment;
                    $appointment.css({opacity: '', cursor: ''});
                    if (dragState.$timeDisplay) {
                        dragState.$timeDisplay.remove();
                    }
                    if (dragState.dragged) {
                        globalDragState.suppressAppointmentClickUntil = Date.now() + 250;
                        const appointment = $appointment.data('appointment');
                        if (appointment) {
                            const newStart = buildDateTimeByMinutes(dragState.$wrapper, dragState.dateLocal, dragState.currentStartMinutes);
                            const newEnd = buildDateTimeByMinutes(dragState.$wrapper, dragState.dateLocal, dragState.currentEndMinutes);
                            const returnData = getAppointmentForReturn(appointment);
                            const dragExtras = getDragAppointmentExtras(dragState.$wrapper, newStart, newEnd);
                            if (!dragExtras.hourSlotRules.canWork || !dragExtras.appointmentRules.canWork) {
                                buildAppointmentsForView(dragState.$wrapper);
                                globalDragState.resizeDragState = null;
                            } else {
                                trigger(dragState.$wrapper, 'edit', returnData.appointment, returnData.extras, dragExtras);
                                removeInfoWindowModal();
                            }
                        }
                    }
                    globalDragState.resizeDragState = null;
                }

                if (globalDragState.monthMoveDragState) {
                    const dragState = globalDragState.monthMoveDragState;
                    cleanupMonthMoveDragElement(dragState);
                    if (dragState.dragged) {
                        globalDragState.suppressSlotClickUntil = Date.now() + 250;
                        globalDragState.suppressAppointmentClickUntil = Date.now() + 250;
                    }
                    if (
                        dragState.dragged &&
                        dragState.targetDateLocal !== dragState.sourceDateLocal
                    ) {
                        const appointment = dragState.$appointment.data('appointment');
                        if (appointment && isAppointmentEditable(appointment)) {
                            const start = $.bsCalendar.utils.parseDateInput(appointment.start);
                            const end = $.bsCalendar.utils.parseDateInput(appointment.end);
                            if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                                const dayDelta = getLocalDateIndex(dragState.targetDateLocal) -
                                    getLocalDateIndex(dragState.sourceDateLocal);
                                const newStart = addDaysPreservingTime(start, dayDelta);
                                const newEnd = addDaysPreservingTime(end, dayDelta);
                                const returnData = getAppointmentForReturn(appointment);
                                const dragExtras = getDragAppointmentExtras(dragState.$wrapper, newStart, newEnd);
                                if (!dragExtras.hourSlotRules.canWork || !dragExtras.appointmentRules.canWork) {
                                    buildAppointmentsForView(dragState.$wrapper);
                                    globalDragState.monthMoveDragState = null;
                                } else {
                                    trigger(dragState.$wrapper, 'edit', returnData.appointment, returnData.extras, dragExtras);
                                    removeInfoWindowModal();
                                }
                            }
                        }
                    }
                    globalDragState.monthMoveDragState = null;
                }
            });

        $('body')
            .on('click' + namespace, globalCalendarElements.infoModal + ' [data-duplicate]', function (e) {
                e.preventDefault();
                const modal = $(globalCalendarElements.infoModal);
                const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                const appointment = $(globalCalendarElements.infoModal).data('appointment');
                const returnData = getAppointmentForReturn(appointment);
                trigger(wrapper, 'duplicate', returnData.appointment, returnData.extras);
                removeInfoWindowModal();
            })
            .on('click' + namespace, globalCalendarElements.infoModal + ' [data-edit]', function (e) {
                e.preventDefault();
                const modal = $(globalCalendarElements.infoModal);
                const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                const appointment = $(globalCalendarElements.infoModal).data('appointment');
                const returnData = getAppointmentForReturn(appointment);
                trigger(wrapper, 'edit', returnData.appointment, returnData.extras);
                removeInfoWindowModal();
            })
            .on('click' + namespace, globalCalendarElements.infoModal + ' [data-remove]', function (e) {
                e.preventDefault();
                const modal = $(globalCalendarElements.infoModal);
                const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                const appointment = $(globalCalendarElements.infoModal).data('appointment');
                const returnData = getAppointmentForReturn(appointment);
                trigger(wrapper, 'delete', returnData.appointment, returnData.extras);
                removeInfoWindowModal();
            })
            .on('click' + namespace, globalCalendarElements.infoModal + ' [data-task-option-status]', function (e) {
                e.preventDefault();
                e.stopPropagation();
                const $this = $(this);
                const status = $this.data('task-option-status');
                const checked = (status === true || status === 'true');
                const modal = $(globalCalendarElements.infoModal);
                const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                const appointment = modal.data('appointment');
                if (appointment.task && typeof appointment.task === 'object' && appointment.task.checked !== checked) {
                    methodToggleTaskStatus(wrapper, appointment, checked);
                    modal.data('appointment', appointment);
                    buildAppointmentModalOptions(wrapper, appointment);
                }

            })
            .on('click' + namespace, function (e) {
                const $target = $(e.target);
                const isInsideModal = $target.closest(globalCalendarElements.infoModal).length > 0; // checks for modal or child elements
                const isTargetElement = $target.closest('[data-appointment]').length > 0; // checks for the target element with appointment data

                // the modal only closes if the click was neither in the modal nor a target element
                if (!isInsideModal && !isTargetElement && $(globalCalendarElements.infoModal).length) {
                    removeInfoWindowModal();
                }
            })
            .on('hide.bs.modal', globalCalendarElements.infoModal, function () {
                const modal = $(globalCalendarElements.infoModal);
                const wrapperId = modal.attr('data-bs-calendar-wrapper-id');
                const wrapper = $(`.bs-calendar[data-bs-calendar-id="${wrapperId}"]`);
                trigger(wrapper, 'hide-info-window');
            })
            .on('hidden.bs.modal', globalCalendarElements.infoModal, function () {
                // removes the modal completely after it has been closed
                removeInfoWindowModal();
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
            .off('mouseenter mouseleave', '[data-calendar-toggle], [data-control-toggle]')
            .on('mouseenter mouseleave', '[data-calendar-toggle], [data-control-toggle]', function (e) {
                const item = $(e.currentTarget);
                let cal = item.data('calendar');

                if (!cal && item.attr('data-control-toggle') === 'tasks') {
                    const data = getBsCalendarData($wrapper);
                    cal = {
                        id: 'tasks',
                        active: data.showTasks,
                        color: $.bsCalendar.utils.getColors(data.settings.mainColor, data.settings.mainColor)
                    };
                }

                if (cal && !cal.active) {
                    const color = cal.color.backgroundColor;

                    if (e.type === 'mouseenter') {
                        // Hover IN:
                        // 1. Farbe etwas kräftiger (85% transparent statt 90%)
                        const fadeColor = `color-mix(in srgb, ${color}, transparent 85%)`;

                        item.css({
                            // Zeige den farbigen Balken links als Vorschau
                            'border-left-color': color,
                            // Hintergrundverlauf
                            'background': `linear-gradient(90deg, ${fadeColor} 0%, transparent 100%)`,
                            // Text dunkler machen (wie aktiv)
                            'color': 'var(--bs-body-color)',
                            // Element voll sichtbar machen
                            'opacity': 1
                        });
                    } else {
                        // Hover OUT: Zurücksetzen auf "Ghost"-Modus
                        item.css({
                            'border-left-color': 'transparent',
                            'background-color': 'transparent',
                            'background-image': 'none',
                            'color': 'var(--bs-secondary-color)',
                            'opacity': 0.7
                        });
                    }
                }
            })
            .off('click', '[data-calendar-toggle]')
            .on('click', '[data-calendar-toggle]', function (e) {
                e.preventDefault();
                const item = $(e.currentTarget);
                const id = item.attr('data-calendar-toggle');

                // 1. Zentrale Daten holen
                const data = getBsCalendarData($wrapper);

                // 2. Kalender im Settings-Array suchen
                if (data.settings.calendars && Array.isArray(data.settings.calendars)) {
                    const calendar = data.settings.calendars.find(c => c.id == id);

                    if (calendar) {
                        // 3. Status ändern
                        calendar.active = !calendar.active;

                        // 4. WICHTIG: Daten explizit aktualisieren und zurückschreiben
                        setBsCalendarData($wrapper, data);

                        // 5. Speichern (Persistence)
                        if (data.settings.storeState) {
                            const activeCalendarIds = getActiveCalendarsIds($wrapper);
                            saveToLocalStorage($wrapper, 'calendars', activeCalendarIds);
                        }

                        $wrapper.find(`[data-calendar-toggle="${id}"]`).each(function () {
                            const syncedItem = $(this);
                            syncedItem.data('calendar', calendar);
                            syncedItem.css(getStyleCalendarButton(calendar));
                            syncedItem.find('.js-calendar-dot').css('opacity', calendar.active ? 1 : 0);
                        });

                        // 7. Event & Rebuild
                        buildByView($wrapper, false);
                    }
                }
            })
            .on('click', '[data-control-toggle="tasks"]', function (e) {
                e.preventDefault();
                const data = getBsCalendarData($wrapper);

                data.showTasks = !data.showTasks;
                setBsCalendarData($wrapper, data);

                if (data.settings.storeState) {
                    saveToLocalStorage($wrapper, 'showTasks', data.showTasks);
                }

                const tasksControl = {
                    id: 'tasks',
                    title: data.settings.translations.tasks,
                    active: data.showTasks,
                    color: $.bsCalendar.utils.getColors(data.settings.mainColor, data.settings.mainColor)
                };

                $wrapper.find('[data-control-toggle="tasks"]').each(function () {
                    const syncedItem = $(this);
                    syncedItem.css(getStyleCalendarButton(tasksControl));
                    syncedItem.find('.js-calendar-dot').css('opacity', data.showTasks ? 1 : 0);
                });

                fetchAppointments($wrapper);
            })
            .off('click' + namespace, '.task-toggle')
            .on('click' + namespace, '.task-toggle', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const $appointmentEl = $(this).closest('[data-appointment]');
                const appointment = $appointmentEl.data('appointment');
                methodToggleTaskStatus($wrapper, appointment, !appointment.task.checked);

            })
            .off('input' + namespace, '[data-agenda-search-input]')
            .on('input' + namespace, '[data-agenda-search-input]', function () {
                const data = getBsCalendarData($wrapper);
                data.agendaSearchTerm = $(this).val();
                setBsCalendarData($wrapper, data);
                applyAgendaSearchFilter($wrapper);
            })
            .off('click' + namespace, '[data-agenda-search-clear]')
            .on('click' + namespace, '[data-agenda-search-clear]', function (e) {
                e.preventDefault();
                const data = getBsCalendarData($wrapper);
                data.agendaSearchTerm = '';
                setBsCalendarData($wrapper, data);
                $wrapper.find('[data-agenda-search-input]').val('').trigger('focus');
                applyAgendaSearchFilter($wrapper);
            })
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
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                // A page in the search navigation was clicked
                e.preventDefault();
                // determine the requested page
                const $clickedLink = $(e.currentTarget);
                const newPage = parseInt($clickedLink.attr('data-page'));
                // update the pagination cries
                const searchPagination = getSearchPagination($eventWrapper);
                searchPagination.offset = (newPage - 1) * searchPagination.limit;
                const search = {limit: searchPagination.limit, offset: searchPagination.offset};
                setSearchPagination($eventWrapper, search);
                // delete the navigation buttons because they are rebuilt
                $eventWrapper.find('.wc-search-pagination').remove();
                // get the appointments
                fetchAppointments($eventWrapper);
            })
            .off('keyup' + namespace, '[data-search-input]')
            .on('keyup' + namespace, '[data-search-input]', function (e) {
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                e.preventDefault();

                const input = $(e.currentTarget);
                const isEmpty = $.bsCalendar.utils.isValueEmpty(input.val()); // Check if the input is empty
                let inSearchMode = getSearchMode($eventWrapper);
                if (!inSearchMode && !isEmpty) {
                    setSearchMode($eventWrapper, true);
                }

                // If input is empty, stop here and optionally disable search mode
                if (isEmpty) {
                    toggleSearchMode($eventWrapper, false, true); // End search mode if necessary
                    return;
                }

                // Trigger search immediately if an Enter key is pressed or the input field gets updated
                const isEnterKey = e.type === 'keyup' && (e.key === 'Enter' || e.which === 13 || e.keyCode === 13);

                if (isEnterKey) {
                    triggerSearch($eventWrapper);
                }

            })
            .off('click' + namespace, '[data-day-hour]')
            .on('click' + namespace, '[data-day-hour]', function (e) {
                if (Date.now() < globalDragState.suppressSlotClickUntil) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const settings = getSettings($eventWrapper);
                const details = $(e.currentTarget).data('details');
                if (settings.debug) {
                    log('Day hour clicked:', details);
                }
                const clickHour = Math.floor(details.hour);
                const clickMin = Math.round((details.hour % 1) * 60);
                const start = new Date(`${$.bsCalendar.utils.formatDateToDateString(details.date)} ${String(clickHour).padStart(2, '0')}:${String(clickMin).padStart(2, '0')}:00`);
                const end = new Date(start);
                end.setMinutes(end.getMinutes() + getDefaultAppointmentCreateDurationMinutes($eventWrapper, 30));
                const dragExtras = getDragAppointmentExtras($eventWrapper, start, end);
                if (!dragExtras.hourSlotRules.canWork || !dragExtras.appointmentRules.canWork) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                const data = {
                    start: {
                        date: $.bsCalendar.utils.formatDateToDateString(start),
                        time: start.toTimeString().slice(0, 5) // nur "HH:mm"
                    },
                    end: {
                        date: $.bsCalendar.utils.formatDateToDateString(end),
                        time: end.toTimeString().slice(0, 5) // nur "HH:mm"
                    },
                    view: getView($eventWrapper)
                };
                trigger($eventWrapper, 'add', data, dragExtras);
                removeInfoWindowModal();
            })
            .off('mousedown' + namespace + ' pointerdown' + namespace + ' touchstart' + namespace, '[data-day-hour]')
            .on('mousedown' + namespace + ' pointerdown' + namespace + ' touchstart' + namespace, '[data-day-hour]', function (e) {
                const isTouchEvent = e.type === 'touchstart';
                const isPrimaryButton = isTouchEvent || (e.which === 1) || (e.button === 0) || (e.buttons === 1);
                if (!isPrimaryButton) {
                    return;
                }
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const settings = getSettings($eventWrapper);
                const view = getView($eventWrapper);
                if (!settings.draggable || !settings.showAddButton || (view !== 'day' && view !== 'week' && view !== '4day')) {
                    return;
                }
                const isTouch = isTouchLikeEvent(e);
                if ((e.type === 'pointerdown' || e.type === 'touchstart') && !isTouch) {
                    e.preventDefault();
                }
                if ($(e.target).closest('[data-appointment]').length) {
                    return;
                }

                const $slotContainer = $(e.currentTarget).closest('.wc-day-view-time-slots');
                if (!$slotContainer.length) {
                    return;
                }
                const startPoint = getEventPageXY(e);
                if (!Number.isFinite(startPoint.y)) {
                    return;
                }
                const startMinutes = getMinutesFromPointer($eventWrapper, $slotContainer, startPoint.y);
                const mainColors = $.bsCalendar.utils.getColors(settings.mainColor);
                const initialStart = buildDateTimeByMinutes($eventWrapper, String($slotContainer.attr('data-date-local')), startMinutes);
                const initialEnd = new Date(initialStart.getTime());
                const initialDuration = getDefaultAppointmentCreateDurationMinutes($eventWrapper, getSnapMinutes($eventWrapper));
                initialEnd.setMinutes(initialEnd.getMinutes() + initialDuration);
                if (!isHourSlotRuleRangeAllowed($eventWrapper, initialStart, initialEnd) || !isAppointmentDurationAllowed($eventWrapper, initialStart, initialEnd)) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                const $preview = $('<div>', {
                    class: 'position-absolute rounded',
                    css: {
                        left: '2px',
                        right: '2px',
                        top: '0',
                        height: '0',
                        display: 'none',
                        zIndex: 11,
                        backgroundColor: mainColors.backgroundColor,
                        opacity: 0.2,
                        border: '1px solid ' + mainColors.backgroundColor
                    }
                }).appendTo($slotContainer);

                // Add time labels for create drag (start at top, end at bottom)
                const $startTimeLabel = $('<div>', {
                    class: 'position-absolute text-nowrap',
                    css: {
                        left: '4px',
                        top: '-18px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: mainColors.backgroundColor,
                        zIndex: 12
                    },
                    text: ''
                }).appendTo($preview);

                const $endTimeLabel = $('<div>', {
                    class: 'position-absolute text-nowrap',
                    css: {
                        left: '4px',
                        bottom: '-18px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: mainColors.backgroundColor,
                        zIndex: 12
                    },
                    text: ''
                }).appendTo($preview);

                const activateCreateDrag = () => {
                    // Hide hover time indicator while an active drag is running
                    $eventWrapper.find('[data-role="time-indicator"]').remove();
                    globalDragState.createDragState = {
                        $wrapper: $eventWrapper,
                        $slotContainer: $slotContainer,
                        $preview: $preview,
                        $startTimeLabel: $startTimeLabel,
                        $endTimeLabel: $endTimeLabel,
                        dateLocal: String($slotContainer.attr('data-date-local')),
                        startMinutes: startMinutes,
                        currentStartMinutes: startMinutes,
                        currentEndMinutes: startMinutes + initialDuration,
                        dragged: true
                    };
                };
                if (isTouch) {
                    const startX = startPoint.x || 0;
                    const startY = startPoint.y || 0;
                    lockTouchDrag(e.currentTarget, startPoint, true);
                    const timer = setTimeout(() => {
                        if (!globalDragState.pendingCreate) return;
                        activateCreateDrag();
                        globalDragState.pendingCreate = null;
                    }, 250);
                    globalDragState.pendingCreate = {timer, startX, startY};
                    $(document).one('pointermove' + namespace + '.pendingCreate touchmove' + namespace + '.pendingCreate', function (ev) {
                        if (!globalDragState.pendingCreate) return;
                        const p = getEventPageXY(ev);
                        const x = Number.isFinite(p.x) ? p.x : startX;
                        const y = Number.isFinite(p.y) ? p.y : startY;
                        if (Math.abs(x - startX) > 8 || Math.abs(y - startY) > 8) {
                            clearTimeout(globalDragState.pendingCreate.timer);
                            activateCreateDrag();
                            globalDragState.pendingCreate = null;
                        }
                    });
                } else {
                    activateCreateDrag();
                    e.preventDefault();
                }
            })
            .off('mousedown' + namespace + ' pointerdown' + namespace + ' touchstart' + namespace, '[data-appointment-resize]')
            .on('mousedown' + namespace + ' pointerdown' + namespace + ' touchstart' + namespace, '[data-appointment-resize]', function (e) {
                const isTouchEvent = e.type === 'touchstart';
                const isPrimaryButton = isTouchEvent || (e.which === 1) || (e.button === 0) || (e.buttons === 1);
                if (!isPrimaryButton) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();

                const $handle = $(e.currentTarget);
                const edge = String($handle.attr('data-appointment-resize') || 'end');
                const $appointment = $handle.closest('[data-appointment]');
                const appointment = $appointment.data('appointment');
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const settings = getSettings($eventWrapper);
                const view = getView($eventWrapper);

                if (!settings.draggable || (view !== 'day' && view !== 'week' && view !== '4day') || !appointment || appointment.allDay || !isAppointmentEditable(appointment)) {
                    return;
                }
                if (settings.appointmentRules && settings.appointmentRules.durationMinutes !== null) {
                    return;
                }

                const $slotContainer = $appointment.closest('.wc-day-view-time-slots');
                if (!$slotContainer.length) {
                    return;
                }

                const start = $.bsCalendar.utils.parseDateInput(appointment.start);
                const end = $.bsCalendar.utils.parseDateInput(appointment.end);
                if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return;
                }

                const startPoint = getEventPageXY(e);
                if (!Number.isFinite(startPoint.y)) {
                    return;
                }

                const originalStartMinutes = (start.getHours() - settings.hourSlots.start) * 60 + start.getMinutes();
                const originalEndMinutes = (end.getHours() - settings.hourSlots.start) * 60 + end.getMinutes();
                const snap = getSnapMinutes($eventWrapper);
                if (originalEndMinutes - originalStartMinutes < snap) {
                    return;
                }

                const $timeDisplay = buildDragTimeBadge(
                    `${formatDragTimeLabel($eventWrapper, originalStartMinutes)} - ${formatDragTimeLabel($eventWrapper, originalEndMinutes)}`
                );

                const activateResizeDrag = () => {
                    $eventWrapper.find('[data-role="time-indicator"]').remove();
                    globalDragState.resizeDragState = {
                        $wrapper: $eventWrapper,
                        $slotContainer: $slotContainer,
                        $appointment: $appointment,
                        $timeDisplay: $timeDisplay,
                        appointment: appointment,
                        dateLocal: String($slotContainer.attr('data-date-local')),
                        edge: edge === 'start' ? 'start' : 'end',
                        originalStartMinutes: originalStartMinutes,
                        originalEndMinutes: originalEndMinutes,
                        currentStartMinutes: originalStartMinutes,
                        currentEndMinutes: originalEndMinutes,
                        dragged: false
                    };
                    $timeDisplay.appendTo($appointment);
                };

                const isTouch = isTouchLikeEvent(e);
                if (isTouch) {
                    const startX = startPoint.x || 0;
                    const startY = startPoint.y || 0;
                    lockTouchDrag(e.currentTarget, startPoint, true);
                    const timer = setTimeout(() => {
                        if (!globalDragState.pendingResize) return;
                        activateResizeDrag();
                        globalDragState.pendingResize = null;
                    }, 120);
                    globalDragState.pendingResize = {timer, startX, startY};
                } else {
                    activateResizeDrag();
                }
            })
            .off('mousedown' + namespace + ' pointerdown' + namespace + ' touchstart' + namespace, '[data-appointment]')
            .on('mousedown' + namespace + ' pointerdown' + namespace + ' touchstart' + namespace, '[data-appointment]', function (e) {
                const isTouchEvent = e.type === 'touchstart';
                const isPrimaryButton = isTouchEvent || (e.which === 1) || (e.button === 0) || (e.buttons === 1);
                if (!isPrimaryButton) {
                    return;
                }
                const $appointment = $(e.currentTarget);
                const appointment = $appointment.data('appointment');
                const editable = isAppointmentEditable(appointment);
                const pointerDetail = e.originalEvent && typeof e.originalEvent.detail === 'number'
                    ? e.originalEvent.detail
                    : e.detail;
                if (!isTouchEvent && pointerDetail > 1 && editable) {
                    globalDragState.appointmentInfoToken++;
                    globalDragState.suppressAppointmentClickUntil = Date.now() + 300;
                    clearTimeout(globalDragState.appointmentClickTimer);
                    globalDragState.appointmentClickTimer = null;
                    removeInfoWindowModal();
                    return;
                }
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const view = getView($eventWrapper);
                if (view !== 'day' && view !== 'week' && view !== '4day' && view !== 'month') {
                    return;
                }
                const settings = getSettings($eventWrapper);
                if (!settings.draggable) {
                    return;
                }
                const isTouch = isTouchLikeEvent(e);
                if ((e.type === 'pointerdown' || e.type === 'touchstart') && !isTouch) {
                    e.preventDefault();
                }
                if (!editable || !appointment) {
                    return;
                }

                if (view === 'month') {
                    const $sourceCell = $appointment.closest('[data-month-date]');
                    const sourceDateLocal = String($appointment.attr('data-month-appointment-date') || $sourceCell.attr('data-month-date') || '');
                    if (!$sourceCell.length || !sourceDateLocal) {
                        return;
                    }

                    const startPoint = getEventPageXY(e);
                    if (!Number.isFinite(startPoint.x) || !Number.isFinite(startPoint.y)) {
                        return;
                    }

                    const activateMonthMoveDrag = () => {
                        const $placeholder = $('<span>', {
                            'data-role': 'month-drag-placeholder',
                            css: {display: 'none'}
                        }).insertAfter($appointment);

                        globalDragState.monthMoveDragState = {
                            $wrapper: $eventWrapper,
                            $appointment: $appointment,
                            $placeholder: $placeholder,
                            $sourceCell: $sourceCell,
                            $targetCell: $sourceCell,
                            appointment: appointment,
                            sourceDateLocal: sourceDateLocal,
                            targetDateLocal: sourceDateLocal,
                            dragged: false
                        };
                        $appointment.css({zIndex: 12});
                    };

                    if (isTouch) {
                        const startX = startPoint.x || 0;
                        const startY = startPoint.y || 0;
                        lockTouchDrag(e.currentTarget, startPoint, true);
                        const timer = setTimeout(() => {
                            if (!globalDragState.pendingMove) return;
                            activateMonthMoveDrag();
                            globalDragState.pendingMove = null;
                        }, 250);
                        globalDragState.pendingMove = {timer, startX, startY};
                        $(document).one('pointermove' + namespace + '.pendingMove touchmove' + namespace + '.pendingMove', function (ev) {
                            if (!globalDragState.pendingMove) return;
                            const p = getEventPageXY(ev);
                            const x = Number.isFinite(p.x) ? p.x : startX;
                            const y = Number.isFinite(p.y) ? p.y : startY;
                            if (Math.abs(x - startX) > 8 || Math.abs(y - startY) > 8) {
                                clearTimeout(globalDragState.pendingMove.timer);
                                activateMonthMoveDrag();
                                globalDragState.pendingMove = null;
                            }
                        });
                    } else {
                        activateMonthMoveDrag();
                        e.preventDefault();
                    }
                    if (!isTouch) {
                        e.stopPropagation();
                    }
                    return;
                }

                if (appointment.allDay) {
                    return;
                }

                const $slotContainer = $appointment.closest('.wc-day-view-time-slots');
                if (!$slotContainer.length) {
                    return;
                }

                const start = $.bsCalendar.utils.parseDateInput(appointment.start);
                const end = $.bsCalendar.utils.parseDateInput(appointment.end);
                if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
                    return;
                }

                const startMinutes = (start.getHours() - settings.hourSlots.start) * 60 + start.getMinutes();
                const startPoint = getEventPageXY(e);
                if (!Number.isFinite(startPoint.y)) {
                    return;
                }
                const pointerMinutes = getMinutesFromPointer($eventWrapper, $slotContainer, startPoint.y);

                // Create time badge for move drag (appointment top-right)
                const $timeDisplay = $('<div>', {
                    class: 'position-absolute badge bg-primary',
                    css: {
                        fontSize: '10px',
                        padding: '2px 4px',
                        right: '4px',
                        top: '2px',
                        zIndex: 13,
                        pointerEvents: 'none'
                    },
                    text: ''
                });

                const activateMoveDrag = () => {
                    // Hide hover time indicator while an active drag is running
                    $eventWrapper.find('[data-role="time-indicator"]').remove();
                    globalDragState.moveDragState = {
                        $wrapper: $eventWrapper,
                        $slotContainer: $slotContainer,
                        $appointment: $appointment,
                        $timeDisplay: $timeDisplay,
                        appointment: appointment,
                        dateLocal: String($slotContainer.attr('data-date-local')),
                        offsetMinutes: pointerMinutes - startMinutes,
                        durationMs: end.getTime() - start.getTime(),
                        currentStartMinutes: startMinutes,
                        dragged: false
                    };
                    // Append time display to appointment
                    $timeDisplay.appendTo($appointment);
                };
                if (isTouch) {
                    const startX = startPoint.x || 0;
                    const startY = startPoint.y || 0;
                    lockTouchDrag(e.currentTarget, startPoint, true);
                    const timer = setTimeout(() => {
                        if (!globalDragState.pendingMove) return;
                        activateMoveDrag();
                        globalDragState.pendingMove = null;
                    }, 250);
                    globalDragState.pendingMove = {timer, startX, startY};
                    $(document).one('pointermove' + namespace + '.pendingMove touchmove' + namespace + '.pendingMove', function (ev) {
                        if (!globalDragState.pendingMove) return;
                        const p = getEventPageXY(ev);
                        const x = Number.isFinite(p.x) ? p.x : startX;
                        const y = Number.isFinite(p.y) ? p.y : startY;
                        if (Math.abs(x - startX) > 8 || Math.abs(y - startY) > 8) {
                            clearTimeout(globalDragState.pendingMove.timer);
                            activateMoveDrag();
                            globalDragState.pendingMove = null;
                        }
                    });
                } else {
                    activateMoveDrag();
                    e.preventDefault();
                }
                if (!isTouch) {
                    e.stopPropagation();
                }
            })
            .off('click' + namespace, '[data-role="day-wrapper"]')
            .on('click' + namespace, '[data-role="day-wrapper"]', function (e) {
                if (Date.now() < globalDragState.suppressSlotClickUntil) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                if (e.target !== e.currentTarget) {
                    return; // Abbrechen, falls ein untergeordnetes Element angeklickt wurde
                }
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);

                const dayWrapper = $(e.currentTarget).closest('[data-month-date]');
                const dateAttribute = dayWrapper.attr('data-month-date'); // Hole das Datum aus dem Attribut

                const currentTime = new Date(); // Aktuelle Zeit
                const start = new Date(`${$.bsCalendar.utils.formatDateToDateString(dateAttribute)} ${String(currentTime.getHours()).padStart(2, '0')}:${String(currentTime.getMinutes()).padStart(2, '0')}:${String(currentTime.getSeconds()).padStart(2, '0')}`);
                const end = new Date(start); // Erstelle eine Kopie des Startzeitpunkts (kann für andere Zwecke genutzt werden)


                end.setMinutes(end.getMinutes() + 30);
                const dragExtras = getDragAppointmentExtras($eventWrapper, start, end);
                if (!dragExtras.hourSlotRules.canWork) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                const data = {
                    start: {
                        date: $.bsCalendar.utils.formatDateToDateString(start),
                        time: start.toTimeString().slice(0, 5) // nur "HH:mm"
                    },
                    end: {
                        date: $.bsCalendar.utils.formatDateToDateString(end),
                        time: end.toTimeString().slice(0, 5) // nur "HH:mm"
                    },
                    view: getView($eventWrapper)
                };
                trigger($eventWrapper, 'add', data, dragExtras);
                removeInfoWindowModal();
            })
            .off('click' + namespace, '[data-add-appointment]')
            .on('click' + namespace, '[data-add-appointment]', function (e) {
                e.preventDefault();
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);

                if (getSearchMode($eventWrapper)) {
                    e.stopPropagation();
                    return; // If in search mode, cancel directly
                }

                const period = getStartAndEndDateByView($eventWrapper);

                const data = {
                    start: {
                        date: $.bsCalendar.utils.formatDateToDateString(period.start),
                        time: null
                    },
                    end: {
                        date: $.bsCalendar.utils.formatDateToDateString(period.end),
                        time: null
                    },
                    view: getView($eventWrapper)
                };
                trigger($eventWrapper, 'add', data);
                removeInfoWindowModal();
            })
            .off('click' + namespace, '[data-today]')
            .on('click' + namespace, '[data-today]', function (e) {
                e.preventDefault();
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    e.stopPropagation();
                } else {
                    methods.setToday($wrapper);
                }

            })
            .off(`click${namespace} touchend${namespace}`, '[data-appointment]')
            .on(`click${namespace} touchend${namespace}`, '[data-appointment]', function (e) {
                if (Date.now() < globalDragState.suppressAppointmentClickUntil) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                const clickedOnDate = $(e.target).is('[data-date]');
                const clickedOnMonth = $(e.target).is('[data-month]');
                const clickedOnToday = $(e.target).is('[data-today]');
                const clickedOnAnchor = $(e.target).is('a[href]') || $(e.target).closest('a[href]').length > 0;
                const clickedOnResizeHandle = $(e.target).is('[data-appointment-resize]') || $(e.target).closest('[data-appointment-resize]').length > 0;
                // check whether the goal is a [data date] or a link with [href]
                if (clickedOnToday || clickedOnDate || clickedOnMonth || clickedOnAnchor || clickedOnResizeHandle) {
                    // stop the execution of the parent event
                    e.stopPropagation();
                    return;
                }

                e.preventDefault();
                const element = $(e.currentTarget);
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const appointment = element.data('appointment');
                const editable = isAppointmentEditable(appointment);
                if (e.type === 'touchend') {
                    showAppointmentWindow($eventWrapper, appointment, element);
                    return;
                }
                const clickDetail = e.originalEvent && typeof e.originalEvent.detail === 'number'
                    ? e.originalEvent.detail
                    : e.detail;
                if (clickDetail > 1 && editable) {
                    globalDragState.appointmentInfoToken++;
                    clearTimeout(globalDragState.appointmentClickTimer);
                    globalDragState.appointmentClickTimer = null;
                    removeInfoWindowModal();
                    return;
                }
                clearTimeout(globalDragState.appointmentClickTimer);
                const infoToken = ++globalDragState.appointmentInfoToken;
                globalDragState.appointmentClickTimer = setTimeout(() => {
                    showAppointmentWindow($eventWrapper, appointment, element, () => infoToken === globalDragState.appointmentInfoToken);
                    globalDragState.appointmentClickTimer = null;
                }, 150);
            })
            .off('dblclick' + namespace, '[data-appointment]')
            .on('dblclick' + namespace, '[data-appointment]', function (e) {
                const element = $(e.currentTarget);
                const appointment = element.data('appointment');
                if (!appointment || !isAppointmentEditable(appointment)) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                globalDragState.appointmentInfoToken++;
                globalDragState.suppressAppointmentClickUntil = Date.now() + 300;
                clearTimeout(globalDragState.appointmentClickTimer);
                globalDragState.appointmentClickTimer = null;

                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const returnData = getAppointmentForReturn(appointment);
                trigger($eventWrapper, 'edit', returnData.appointment, returnData.extras);
                removeInfoWindowModal();
                // setTimeout(removeInfoWindowModal, 0);
            })
            .off('click' + namespace, '[data-week-date]')
            .on('click' + namespace, '[data-week-date]', function (e) {
                e.preventDefault();
                const settings = getSettings($wrapper);
                const viewBefore = getView($wrapper);
                const inSearchMode = getSearchMode($wrapper);
                if (inSearchMode) {
                    toggleSearchMode($wrapper, false, false);
                }
                if (settings.views.includes('week')) {
                    const date = $.bsCalendar.utils.parseDateInput($(e.currentTarget).attr('data-week-date'));
                    setView($wrapper, 'week');
                    setDate($wrapper, date);
                    buildByView($wrapper, viewBefore !== 'week');
                }
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
                    const date = $.bsCalendar.utils.parseDateInput($(e.currentTarget).attr('data-date'));
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
                    const date = $.bsCalendar.utils.parseDateInput($(e.currentTarget).attr('data-month'));
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
            // Live time indicator on hover over time slots (day/week only, when draggable enabled)
            .off('mousemove' + namespace + ' mouseleave' + namespace, '.wc-day-view-time-slots')
            .on('mousemove' + namespace, '.wc-day-view-time-slots', function (e) {
                const $eventWrapper = resolveEventWrapper(e.currentTarget, $wrapper);
                const settings = getSettings($eventWrapper);
                const view = getView($eventWrapper);

                // Only show if draggable is enabled and we're in day or week view
                if (!settings.draggable || (view !== 'day' && view !== 'week' && view !== '4day')) {
                    return;
                }

                // Skip if drag is in progress
                if (globalDragState.createDragState || globalDragState.moveDragState || globalDragState.resizeDragState || globalDragState.monthMoveDragState) {
                    return;
                }

                const mainColors = $.bsCalendar.utils.getColors(settings.mainColor);

                const $slotContainer = $(e.currentTarget);
                let $indicator = $slotContainer.find('[data-role="time-indicator"]');

                // Create indicator if not exists
                if (!$indicator.length) {
                    $indicator = $('<div>', {
                        'data-role': 'time-indicator',
                        class: 'position-absolute',
                        css: {
                            left: '0',
                            right: '0',
                            height: '2px',
                            backgroundColor: mainColors.backgroundColor,
                            zIndex: 10,
                            opacity: 0.7,
                            // boxShadow: '0 0 4px ' + mainColors.backgroundColor,
                            pointerEvents: 'none'
                        }
                    }).appendTo($slotContainer);

                    // Add time label badge
                    const $timeLabel = $('<div>', {
                        'data-role': 'time-label',
                        class: 'position-absolute badge',
                        css: {
                            right: '2px',
                            fontSize: '10px',
                            padding: '2px 4px',
                            transform: 'translateY(-50%)',
                            zIndex: 11,
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            backgroundColor: mainColors.backgroundColor,
                            color: mainColors.color
                        },
                        text: ''
                    }).appendTo($indicator);

                    $indicator.data('$timeLabel', $timeLabel);
                }

                // Update indicator position and time
                const pageY = e.pageY;
                const minutes = getMinutesFromPointer($eventWrapper, $slotContainer, pageY);

                const totalMinutes = minutes + (settings.hourSlots.start * 60);
                const startHour = Math.floor(totalMinutes / 60);
                const startMinute = Math.round(totalMinutes % 60);
                const timeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

                const offset = $slotContainer.offset();
                const relativeY = Math.max(0, pageY - offset.top);

                $indicator.css('top', `${relativeY}px`);
                $indicator.data('$timeLabel').text(timeStr);
            })
            .on('mouseleave' + namespace, '.wc-day-view-time-slots', function (e) {
                const $slotContainer = $(e.currentTarget);
                const $indicator = $slotContainer.find('[data-role="time-indicator"]');
                if ($indicator.length) {
                    $indicator.remove();
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
            removeFromLocalStorage($wrapper, key);
            if (settings.debug) {
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
            removeFromLocalStorage($wrapper, key);
            if (settings.debug) {
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
        const activeItem = dropdown.find(`[data-view="${view}"]`).first();

        dropdown.find('[data-dropdown-text]').each(function () {
            const target = $(this);
            if (target.attr('data-dropdown-icon-only') === 'true') {
                const icon = activeItem.find('i').first().clone();
                icon.removeClass('me-2');
                target.empty().append(icon);
                return;
            }

            target.html(activeItem.html());
        });
    }

    function getAboutDebugText($wrapper) {
        const settings = getSettings($wrapper);
        const locale = settings?.locale || '-';
        const view = getView($wrapper) || '-';
        const currentDate = getDate($wrapper);
        let dateText = '-';
        if (currentDate instanceof Date && !isNaN(currentDate.getTime())) {
            dateText = $.bsCalendar.utils.formatDateToDateString(currentDate);
        }
        return `Locale: ${locale}<br>Current view: ${view}<br>Current date: ${dateText}`;
    }

    function updateAboutDebugInfo($wrapper) {
        const hint = $wrapper.find('[data-about-debug="1"]');
        if (!hint.length) {
            return;
        }
        hint.html(getAboutDebugText($wrapper));
    }

    /**
     * Retrieves the 'view' data attribute from the given wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element.
     * @return {*} The value of the 'view' data attribute associated with the wrapper element.
     */
    function getView($wrapper) {
        const data = getBsCalendarData($wrapper);
        return data.view;
    }

    /**
     * Sets the active calendar view and persists the selected view state.
     *
     * The function validates the requested view before applying it. Supported
     * built-in views are `day`, `4day`, `week`, `month`, `year` and the special
     * `search` view.
     *
     * If an invalid non-search view is provided, the function falls back to the
     * month view. If the requested view is valid but disabled through
     * `settings.views`, the view switch is blocked and the current view remains
     * unchanged.
     *
     * When the view actually changes, the previous view is stored as `lastView`.
     * This allows the calendar to restore the previous normal view after leaving
     * special modes such as search mode.
     *
     * The selected view is saved to local storage, written into the calendar state
     * and the debug/about information is refreshed.
     *
     * @param {jQuery} $wrapper
     * The calendar wrapper whose active view should be changed.
     *
     * @param {string} view
     * The requested view name. Supported values are `day`, `4day`, `week`,
     * `month`, `year` and `search`.
     *
     * @returns {void}
     * This function updates the calendar state and local storage as side effects.
     */
    function setView($wrapper, view) {
        /**
         * Resolve the current calendar state and configuration.
         */
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const currentView = data.view;

        /**
         * Resolve the list of enabled views from the calendar settings.
         *
         * If settings.views is not an array, no additional view restriction is
         * applied.
         */
        const allowedViews = Array.isArray(settings.views) ? settings.views : [];

        /**
         * Validate the requested view.
         *
         * The special "search" view is allowed separately. All other values must
         * be one of the supported built-in calendar views.
         *
         * Invalid view names fall back to "month" so the calendar always remains
         * in a known and renderable state.
         */
        if (view !== 'search' && !['agenda', 'day', '4day', 'week', 'month', 'year'].includes(view)) {
            if (settings.debug) {
                console.error(
                    'Invalid view type provided. Defaulting to month view.',
                    'Provided view:', view
                );
            }

            view = 'month';
        }

        /**
         * Check whether the requested view is enabled in settings.views.
         *
         * If settings.views contains entries, only those views may be activated.
         * The search view is excluded from this restriction because it is treated
         * as a special internal view state.
         */
        if (view !== 'search' && allowedViews.length > 0 && !allowedViews.includes(view)) {
            if (settings.debug) {
                log('View switch blocked because the view is not enabled in settings.views:', view);
            }

            return;
        }

        /**
         * Store the previous view if the active view is changing.
         *
         * This is useful for returning from temporary modes such as search back to
         * the user's previous calendar view.
         */
        if (currentView !== view) {
            data.lastView = currentView;
        }

        /**
         * Optional debug output for tracing view changes.
         */
        if (settings.debug) {
            log('Set view to:', view);
        }

        /**
         * Persist the selected view so it can be restored later.
         */
        saveToLocalStorage($wrapper, 'view', view);

        /**
         * Update the calendar state with the new active view.
         */
        data.view = view;
        setBsCalendarData($wrapper, data);

        /**
         * Refresh debug/about information after the state change.
         */
        updateAboutDebugInfo($wrapper);
    }

    /**
     * Retrieves the 'date' value from the provided wrapper's data.
     *
     * @param {jQuery} $wrapper - The object containing the data method to fetch the 'date' value.
     * @return {Date} The value associated with the 'date' key in the wrapper's data.
     */
    function getDate($wrapper) {
        const data = getBsCalendarData($wrapper);
        return data.date || new Date();
    }

    /**
     * Sets a date value in the specified wrapper element's data attributes.
     *
     * @param {jQuery} $wrapper - The jQuery wrapper object for the element.
     * @param {string|Date} date - The date value to be set in the data attribute. Can be a string or Date object.
     * @return {void} Does not return a value.
     */
    function setDate($wrapper, date) {
        const data = getBsCalendarData($wrapper);

        const settings = getSettings($wrapper);
        if (typeof date === 'string') {
            data.date = $.bsCalendar.utils.parseDateInput(date);
        } else if (date instanceof Date) {
            data.date = date;
        }
        if (settings.debug) {
            log('Set date to:', data.date);
        }
        setBsCalendarData($wrapper, data);
        updateAboutDebugInfo($wrapper);
    }

    /**
     * Retrieves the settings data from the specified wrapper element.
     *
     * @param {jQuery} $wrapper - The wrapper element whose settings data is to be fetched.
     * @return {null|object} The settings data retrieved from the wrapper element.
     */
    function getSettings($wrapper) {
        const data = getBsCalendarData($wrapper);
        return data.settings;
    }

    /**
     * Updates the settings for the specified wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element.
     * @param {Object} settings - An object containing the new settings to be applied to the wrapper.
     * @return {void} Does not return a value.
     */
    function updateSettings($wrapper, settings) {
        const data = getBsCalendarData($wrapper);
        if (data.settings.debug) {
            log('Set settings to:', settings);
        }
        data.settings = settings;
        setBsCalendarData($wrapper, data);
    }

    /**
     * Retrieves the view container element within the given wrapper element.
     *
     * @param {jQuery} $wrapper - A jQuery object representing the wrapper element.
     * @return {jQuery} A jQuery object representing the view container element.
     */
    function getViewContainer($wrapper) {
        const data = getBsCalendarData($wrapper);
        return $wrapper.find('#' + data.elements.wrapperViewContainerId);
    }

    /**
     * Builds or updates the calendar UI for the currently selected view.
     *
     * This function is the central view-building entry point. It decides whether
     * the calendar should render the search view or one of the normal calendar
     * views, such as month, week, 4-day, year or day.
     *
     * To avoid unnecessary DOM work, the function compares the current render
     * state with the requested view state. The main calendar structure is only
     * rebuilt when something relevant has changed, for example the active view,
     * the visible date range, the selected date in year view or the hour-slot
     * configuration in time-grid views.
     *
     * After the view structure has been built or confirmed as unchanged, the
     * function updates dependent UI elements such as the responsive layout,
     * dropdown state, current date label, debug information and the small month
     * calendar.
     *
     * Finally, the function either fetches fresh appointment data or rebuilds the
     * appointments from the already available local data.
     *
     * @param {jQuery} $wrapper
     * The calendar wrapper whose view should be built or updated.
     *
     * @param {boolean} [triggerViewChanged=true]
     * Whether the calendar should trigger the custom view-change event after the
     * view has been updated.
     *
     * @param {boolean} [fetchData=true]
     * Whether appointment data should be fetched after rebuilding the view. If
     * false, appointments are rendered from the existing local state instead.
     *
     * @returns {void}
     * This function updates the calendar DOM and state as side effects.
     */
    function buildByView($wrapper, triggerViewChanged = true, fetchData = true) {
        /**
         * Resolve the current calendar state, settings and active view.
         */
        const data = getBsCalendarData($wrapper);
        const settings = data.settings
        const view = data.view;

        /**
         * Remove existing tooltips before rebuilding or updating the view.
         *
         * This prevents stale tooltip instances from remaining attached to DOM
         * elements that may be removed or replaced during rendering.
         */
        destroyCalendarTooltips($wrapper);

        /**
         * Optional debug output for tracing view rebuilds.
         */
        if (settings.debug) {
            log('Call buildByView with view:', view);
        }

        if (data.searchMode) {
            /**
             * Search mode has its own layout and does not use the normal calendar
             * view-building optimization.
             */
            buildSearchView($wrapper);
        } else {
            /**
             * Calculate the date range represented by the currently requested view.
             *
             * This range is used to detect whether the existing DOM structure still
             * matches the current calendar state.
             */
            const period = getStartAndEndDateByView($wrapper);

            /**
             * Read the previous render state.
             *
             * If no render state exists yet, use an empty default state so the
             * first call always triggers a full build.
             */
            const renderState = data.renderState || {
                view: null,
                start: null,
                end: null,
                selectedDate: null,
                hourSlots: null
            };

            /**
             * Normalize the currently selected calendar date.
             *
             * In year view, the selected date can affect the highlighted day, so it
             * must be part of the rebuild comparison.
             */
            const currentSelectedDate = $.bsCalendar.utils.formatDateToDateString(data.date);

            /**
             * Serialize the hour-slot configuration.
             *
             * Hour slots define the time grid in day, week and 4-day views. If they
             * change, the time-grid DOM must be rebuilt.
             */
            const currentHourSlots = JSON.stringify(settings.hourSlots);

            /**
             * Determine whether the main view DOM needs to be rebuilt.
             *
             * A rebuild is required when:
             *
             * - the active view changed
             * - the visible start date changed
             * - the visible end date changed
             * - the selected date changed in year view
             * - the hour-slot configuration changed in day/week/4-day views
             */
            const needsRebuild = renderState.view !== view ||
                renderState.start !== period.start ||
                renderState.end !== period.end ||
                (view === 'year' && renderState.selectedDate !== currentSelectedDate) ||
                (
                    (view === 'day' || view === 'week' || view === '4day') &&
                    renderState.hourSlots !== currentHourSlots
                );

            if (needsRebuild) {
                /**
                 * Build the DOM structure for the active calendar view.
                 */
                switch (view) {
                    case 'agenda':
                        buildAgendaView($wrapper);
                        break;

                    case 'month':
                        buildMonthView($wrapper);
                        break;

                    case '4day':
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
                        /**
                         * Unknown views are ignored here.
                         *
                         * This keeps the function safe if a custom or unsupported
                         * view value is present.
                         */
                        break;
                }

                /**
                 * Store the current render state.
                 *
                 * Future calls can compare against this snapshot and skip expensive
                 * DOM rebuilds when the visible structure has not changed.
                 */
                data.renderState = {
                    view: view,
                    start: period.start,
                    end: period.end,
                    selectedDate: currentSelectedDate,
                    hourSlots: currentHourSlots
                };

                setBsCalendarData($wrapper, data);
            } else {
                /**
                 * The existing DOM structure already matches the current view state.
                 * Appointment rendering and secondary UI updates can still continue.
                 */
                if (settings.debug) {
                    log('Skipping DOM rebuild for view (content unchanged).');
                }
            }

            /**
             * Recalculate responsive layout dimensions after the view check.
             */
            onResize($wrapper);

            /**
             * Synchronize the view dropdown with the current active view.
             */
            updateDropdownView($wrapper);

            /**
             * Update the displayed current date or period label.
             */
            setCurrentDateName($wrapper);

            /**
             * Refresh debug/about information if that UI is enabled.
             */
            updateAboutDebugInfo($wrapper);

            /**
             * Rebuild the small month calendar using the current selected date.
             */
            $wrapper.find('[data-small-month-calendar]').each(function () {
                buildMonthSmallView($wrapper, data.date, $(this));
            });

            /**
             * Trigger the custom view-change event if requested.
             */
            if (triggerViewChanged) {
                trigger($wrapper, 'view', view);
            }
        }

        /**
         * Load or rebuild appointment data after the view has been prepared.
         *
         * When fetchData is true, fresh appointments are requested from the
         * configured appointment source. Otherwise, the current locally stored
         * appointments are rendered again.
         */
        if (fetchData) {
            fetchAppointments($wrapper);
        } else {
            buildAppointmentsForView($wrapper);
        }
    }

    /**
     * Executes a function from either a direct function reference or a function name.
     *
     * This helper accepts two kinds of input:
     *
     * - a real function reference
     * - a string containing the name of a function
     *
     * If a direct function reference is provided, it is executed immediately with
     * the given arguments.
     *
     * If a string is provided, the function first tries to resolve the name in the
     * current JavaScript context. If that fails, it tries to resolve the function
     * from the global `window` object. When a matching function is found, it is
     * executed with the given arguments.
     *
     * If no valid function can be resolved, the function returns `undefined`.
     *
     * @param {Function|string|null|undefined} functionOrName
     * A function reference or the name of a function to execute.
     *
     * @param {...*} args
     * Arguments that should be passed to the resolved function.
     *
     * @returns {*|undefined}
     * Returns the result of the executed function. Returns `undefined` if no valid
     * function was provided or resolved.
     */
    function executeFunction(functionOrName, ...args) {
        /**
         * Continue only if a function reference or function name was provided.
         */
        if (functionOrName) {
            /**
             * Direct function reference.
             *
             * If the value is already a function, execute it directly and pass all
             * additional arguments through unchanged.
             */
            if (typeof functionOrName === 'function') {
                return functionOrName(...args);
            }

            /**
             * Function name as string.
             *
             * If a string was provided, try to resolve it to an actual function.
             */
            if (typeof functionOrName === 'string') {
                let func = null;

                /**
                 * Step 1:
                 * Try to resolve the function name in the current JavaScript
                 * execution context.
                 *
                 * This allows names that are available in the surrounding scope to
                 * be resolved dynamically.
                 *
                 * Errors are ignored because the function name may not exist, may
                 * not be accessible, or may contain an invalid identifier.
                 */
                try {
                    func = new Function(
                        `return typeof ${functionOrName} === 'function' ? ${functionOrName} : undefined`
                    )();
                } catch (error) {
                    /**
                     * Ignore lookup errors and continue with the global window
                     * fallback below.
                     */
                }

                /**
                 * Step 2:
                 * Try to resolve the function from the global window object.
                 *
                 * This is useful for globally registered callback functions.
                 */
                if (
                    !func &&
                    typeof window !== 'undefined' &&
                    typeof window[functionOrName] === 'function'
                ) {
                    func = window[functionOrName];
                }

                /**
                 * Execute the resolved function if a valid function was found.
                 */
                if (typeof func === 'function') {
                    return func(...args);
                }
            }
        }

        /**
         * No executable function was found.
         */
        return undefined;
    }

    /**
     * Fetches appointments for the current calendar wrapper and rebuilds the
     * appointment-related view state.
     *
     * The function supports both normal calendar loading and search mode. In normal
     * mode, it builds the request data from the currently active calendar view and
     * its visible date range. In search mode, it builds the request data from the
     * current search value and pagination state.
     *
     * The appointment source can be provided either as:
     *
     * - a function that receives the request data and returns a Promise
     * - a URL string that is called through AJAX
     * - no remote source, in which case the calendar continues with an empty
     *   appointment list
     *
     * The function prevents duplicate concurrent loads for the same calendar
     * wrapper by using a wrapper-specific loading flag. It also injects the active
     * calendar IDs into every request and optionally allows user-defined query
     * parameters to enrich the request data without overriding protected core keys.
     *
     * During the lifecycle, the function keeps the previous rendered appointments
     * visible while the next async result is loading, triggers before-load and
     * after-load events, shows and hides the calendar loader, stores cleaned
     * appointments, and rebuilds either the normal calendar view or the search
     * result view.
     *
     * @param {jQuery} $wrapper
     * The calendar wrapper whose appointments should be fetched and rendered.
     *
     * @returns {void}
     * This function performs asynchronous loading and updates the calendar state
     * and DOM as side effects.
     */
    function fetchAppointments($wrapper) {
        const bsCalendarData = getBsCalendarData($wrapper);
        const settings = bsCalendarData.settings;

        /**
         * Prevent concurrent appointment fetches for the same calendar wrapper.
         *
         * If a request is already running, the duplicate call is skipped. This
         * prevents race conditions, duplicated rendering and unnecessary network
         * traffic.
         */
        if (bsCalendarData.loading) {
            if (settings && settings.debug) {
                log("fetchAppointments: already loading for wrapper, skipping duplicate call");
            }
            return;
        }

        /**
         * Mark this wrapper as loading and persist the updated calendar data.
         */
        bsCalendarData.loading = true;
        setBsCalendarData($wrapper, bsCalendarData);

        /**
         * Indicates whether the loading workflow should be skipped.
         *
         * This is mainly used in search mode when the search input is empty.
         */
        let skipLoading = false;

        /**
         * Optional debug output for tracing fetch calls.
         */
        if (settings && settings.debug) {
            try {
                log(
                    'fetchAppointments called for wrapper:',
                    $wrapper.attr('data-bs-calendar-id') ||
                    $wrapper.attr('id') ||
                    $wrapper
                );

                /**
                 * Optional stack trace for debugging repeated or unexpected calls.
                 */
                // log('Stack:', (new Error()).stack.split('\n').slice(2, 8).join('\n'));
            } catch (e) {
                /**
                 * Ignore debug logging errors.
                 *
                 * Logging should never break the appointment loading workflow.
                 */
            }
        }

        /**
         * Request payload that will be passed either to the function-based data
         * source or to the AJAX request.
         */
        let requestData;

        /**
         * Determine whether the calendar is currently displaying search results
         * instead of the normal view-based appointment range.
         */
        const inSearchMode = getSearchMode($wrapper);

        /**
         * Build the request payload depending on the current mode.
         */
        if (!inSearchMode) {
            /**
             * Normal calendar mode:
             * Load appointments for the currently visible view range.
             */
            const view = bsCalendarData.view;
            const period = getStartAndEndDateByView($wrapper);

            if (view === 'year') {
                /**
                 * Year view only needs the year number instead of a start/end range.
                 */
                requestData = {
                    year: $.bsCalendar.utils.parseDateInput(period.date).getFullYear(),
                    view: view,
                    showTasks: bsCalendarData.showTasks
                };
            } else {
                /**
                 * Day, week, 4-day and month-like views use an explicit date range.
                 */
                requestData = {
                    fromDate: period.start,
                    toDate: period.end,
                    view: view,
                    showTasks: bsCalendarData.showTasks,
                };
            }
        } else {
            /**
             * Search mode:
             * Load appointments matching the current search input and pagination
             * state.
             */
            const searchElement = getSearchElement($wrapper);
            const search = searchElement?.val() ?? null;

            /**
             * If the search input is empty, skip remote loading and render an empty
             * result state instead.
             */
            skipLoading = $.bsCalendar.utils.isValueEmpty(search);

            requestData = {
                ...bsCalendarData.searchPagination,
                search: search
            };
        }

        /**
         * Inject active calendar IDs into every request.
         *
         * This ensures that the backend or function-based data source always knows
         * which calendars are currently enabled, independent of the current mode.
         */
        let activeCalendarIds = [];

        if (settings.calendars && Array.isArray(settings.calendars)) {
            activeCalendarIds = settings.calendars
                .filter(c => c.active === true)
                .map(c => c.id);
        }

        /**
         * Always attach calendarIds, even if the array is empty.
         *
         * This keeps the request shape stable for all transport types.
         */
        requestData.calendarIds = activeCalendarIds;

        /**
         * Allow custom query parameters to enrich the request payload.
         *
         * settings.queryParams can add extra parameters dynamically. Core keys that
         * define the calendar range or view are protected and cannot be overwritten.
         */
        if (typeof settings.queryParams === "function") {
            if (settings.debug) {
                log("Original requestData before queryParams:", requestData);
            }

            /**
             * Call the user-provided query parameter callback with the current
             * request data.
             */
            const queryParams = settings.queryParams(requestData);

            /**
             * Protect core request keys from accidental modification.
             *
             * These keys define the calendar's visible period and view mode and
             * should remain controlled by the calendar itself.
             */
            const protectedKeys = new Set(["fromDate", "toDate", "year", "view"]);

            if (queryParams && typeof queryParams === "object") {
                Object.keys(queryParams).forEach(key => {
                    if (protectedKeys.has(key)) {
                        if (settings.debug) {
                            log(
                                `queryParams tried to override protected key "${key}" -> ignored. value:`,
                                queryParams[key]
                            );
                        }
                        return;
                    }

                    requestData[key] = queryParams[key];
                });
            } else {
                /**
                 * Ignore invalid queryParams return values.
                 */
                if (settings.debug) {
                    log("queryParams did not return an object, skipping merge:", queryParams);
                }
            }

            if (settings.debug) {
                log("Merged requestData after queryParams:", requestData);
            }
        }

        /**
         * Handle empty search input.
         *
         * In this case, no remote request is necessary. The calendar is updated
         * with an empty appointment list and the normal rendering workflow is still
         * executed so the UI stays consistent.
         */
        if (skipLoading) {
            if (settings.debug) {
                log('Skip loading appointments because search is empty');
            }

            checkAndSetAppointments($wrapper, []).then(_cleanedAppointments => {
                trigger($wrapper, 'after-load', _cleanedAppointments);
                void _cleanedAppointments;
                buildAppointmentsForView($wrapper);
            }).finally(() => {
                /**
                 * Clear the loading flag even when the empty search workflow fails.
                 */
                bsCalendarData.loading = false;
                setBsCalendarData($wrapper, bsCalendarData);
            });

            return;
        }

        /**
         * Notify listeners that appointment loading is about to start.
         */
        trigger($wrapper, 'before-load', requestData);

        /**
         * Determine which transport type should be used.
         *
         * A function source is expected to return a Promise.
         * A string source is treated as an AJAX URL.
         */
        const callFunction = typeof settings.url === 'function';
        const callAjax = typeof settings.url === 'string';

        /**
         * Show the calendar loader only when a remote or function-based data source
         * is actually called.
         */
        if (callFunction || callAjax) {
            showBSCalendarLoader($wrapper);
        }

        if (callFunction) {
            /**
             * Function-based appointment loading.
             *
             * The configured function receives the prepared request data and should
             * resolve with either:
             *
             * - an appointment array in normal mode
             * - an object containing rows and total in search mode
             */
            if (settings.debug) {
                log('Call appointments by function with query:', requestData);
            }

            settings.url(requestData)
                .then(appointments => {
                    if (settings.debug) {
                        log('result:', appointments);
                    }

                    if (inSearchMode) {
                        /**
                         * In search mode, process returned rows and build the search
                         * result view including the total result count.
                         */
                        checkAndSetAppointments($wrapper, appointments.rows).then(cleanedAppointments => {
                            trigger($wrapper, 'after-load', cleanedAppointments);
                            buildAppointmentsForSearch(
                                $wrapper,
                                cleanedAppointments,
                                appointments.total
                            );
                        });
                    } else {
                        /**
                         * In normal mode, process the appointment array and rebuild
                         * the current calendar view.
                         */
                        checkAndSetAppointments($wrapper, appointments).then(_cleanedAppointments => {
                            trigger($wrapper, 'after-load', _cleanedAppointments);
                            void _cleanedAppointments;
                            buildAppointmentsForView($wrapper);
                        });
                    }
                })
                .catch(error => {
                    /**
                     * Handle errors from the function-based data source.
                     */
                    hideBSCalendarLoader($wrapper);

                    if (settings.debug) {
                        log('Error fetching appointments:', error);
                    }
                })
                .finally(() => {
                    /**
                     * Always hide the loader and clear the loading flag after the
                     * function-based request finishes.
                     */
                    hideBSCalendarLoader($wrapper);
                    bsCalendarData.loading = false;
                    setBsCalendarData($wrapper, bsCalendarData);
                });

        } else if (callAjax) {
            /**
             * AJAX-based appointment loading.
             *
             * The configured URL is called with a GET request and the prepared
             * request data.
             */

            /**
             * Abort any existing appointment request for this wrapper before
             * starting a new one.
             *
             * This prevents stale responses from older requests from updating the
             * calendar after a newer request has already been started.
             */
            abortXhr(bsCalendarData.xhrs.appointments);
            bsCalendarData.xhrs.appointments = null;

            if (settings.debug) {
                log('Call appointments by URL:', settings.url);
            }

            bsCalendarData.xhrs.appointments = $.ajax({
                url: settings.url,
                method: 'GET',
                contentType: 'application/json',
                data: requestData,

                success: function (response) {
                    if (inSearchMode) {
                        /**
                         * In search mode, use response.rows as appointment data and
                         * response.total for pagination/result count rendering.
                         */
                        checkAndSetAppointments($wrapper, response.rows).then(cleanedAppointments => {
                            trigger($wrapper, 'after-load', cleanedAppointments);
                            buildAppointmentsForSearch(
                                $wrapper,
                                cleanedAppointments,
                                response.total
                            );
                        });
                    } else {
                        /**
                         * In normal mode, use the full response as appointment data
                         * and rebuild the calendar view.
                         */
                        checkAndSetAppointments($wrapper, response).then(_cleanedAppointments => {
                            trigger($wrapper, 'after-load', _cleanedAppointments);
                            void _cleanedAppointments;
                            buildAppointmentsForView($wrapper);
                        });
                    }
                },

                error: function (xhr, status, error) {
                    /**
                     * Ignore abort errors because they are expected when a request
                     * is intentionally cancelled.
                     */
                    if (status !== 'abort') {
                        if (settings.debug) {
                            log('Error when retrieving the dates:', status, error);
                        }
                    }
                },

                complete: function () {
                    /**
                     * Clear the stored XHR reference, hide the loader and reset the
                     * loading flag after the AJAX request has completed.
                     */
                    bsCalendarData.xhrs.appointments = null;
                    hideBSCalendarLoader($wrapper);

                    bsCalendarData.loading = false;
                    setBsCalendarData($wrapper, bsCalendarData);
                }
            });
        } else {
            /**
             * No remote appointment source is configured.
             *
             * The calendar still runs the normal appointment workflow with an empty
             * appointment list. This allows other data sources or side effects, such
             * as holidays, to continue working.
             */
            if (settings.debug) {
                log('No URL provided, skipping appointment fetch but continuing with local workflow');
            }

            checkAndSetAppointments($wrapper, []).then(_cleanedAppointments => {
                trigger($wrapper, 'after-load', _cleanedAppointments);
                void _cleanedAppointments;
                buildAppointmentsForView($wrapper);
            }).finally(() => {
                /**
                 * Clear the loading flag after the local empty workflow finishes.
                 */
                bsCalendarData.loading = false;
                setBsCalendarData($wrapper, bsCalendarData);
            });
        }
    }

    /**
     * Groups timed appointments by weekday and date, then separates them into
     * column-based appointments and full-width appointments for rendering.
     *
     * The function iterates over each appointment's calculated display dates and
     * creates one renderable slot per visible day segment. For week-based views,
     * segments outside the current visible week range are ignored.
     *
     * Appointments are grouped by a combined key consisting of the JavaScript
     * weekday number and the local date string. This ensures that appointments are
     * grouped per actual rendered day, not only by weekday.
     *
     * Within each day group, appointments are sorted by start time and distributed
     * into either:
     *
     * - `columns`: appointments that overlap with others and need side-by-side
     *   rendering
     * - `fullWidth`: appointments that can use the full available width
     *
     * Appointments for which overlap behavior is explicitly enabled are added to
     * the full-width list immediately.
     *
     * @param {jQuery} $wrapper
     * The calendar wrapper used to resolve the current calendar view.
     *
     * @param {Array<Object>} appointments
     * Timed appointment objects with precomputed `extras.displayDates`.
     *
     * @returns {Object}
     * Returns an object grouped by `"weekday_date"` keys. Each group contains:
     * `{ appointments, columns, fullWidth }`.
     */
    function groupOverlappingAppointments($wrapper, appointments) {
        /**
         * Stores appointments grouped by rendered weekday and local date.
         *
         * Structure:
         *
         * {
         *   "1_2026-06-15": {
         *     appointments: [],
         *     columns: [],
         *     fullWidth: []
         *   }
         * }
         *
         * The key combines the weekday number and the local date so that the same
         * weekday in different rendered date ranges does not collide.
         */
        const groupedByWeekdays = {};

        /**
         * Resolve the current calendar view.
         *
         * The view is used to decide whether appointments outside the visible week
         * range should be skipped.
         */
        const view = getView($wrapper);

        /**
         * Step 1:
         * Create renderable appointment slots and group them by weekday/date.
         *
         * Each appointment can contain multiple display dates, especially when it
         * spans more than one calendar day. Every display date becomes its own
         * slot so it can be positioned and rendered independently.
         */
        appointments.forEach((appointment) => {
            appointment.extras.displayDates.forEach((obj) => {
                /**
                 * In week-like views, ignore appointment segments that are not
                 * visible in the currently rendered week range.
                 *
                 * This prevents hidden or out-of-range appointment segments from
                 * affecting overlap calculations.
                 */
                if ((view === 'week' || view === '4day') && !obj.visibleInWeek) {
                    return;
                }

                /**
                 * Build exact slot start and end timestamps from the display date
                 * and the segment-specific start/end times.
                 *
                 * This is important for multi-day appointments because each display
                 * date may have different visible times:
                 *
                 * - first day: actual start time to 23:59
                 * - middle days: 00:00 to 23:59
                 * - last day: 00:00 to actual end time
                 */
                const slotStart = new Date(`${obj.date}T${obj.times.start}`);
                const slotEnd = new Date(`${obj.date}T${obj.times.end}`);

                /**
                 * Resolve the local date and weekday for this appointment segment.
                 *
                 * The local date string is used instead of relying only on weekday
                 * numbers because weekday numbers repeat every week.
                 */
                const targetDateLocal = $.bsCalendar.utils.formatDateToDateString(slotStart);
                const weekday = slotStart.getDay();

                /**
                 * Build the grouping key for this rendered day.
                 */
                const key = `${weekday}_${targetDateLocal}`;

                /**
                 * Initialize the group structure for this weekday/date if it does
                 * not already exist.
                 */
                if (!groupedByWeekdays[key]) {
                    groupedByWeekdays[key] = {
                        appointments: [],
                        columns: [],
                        fullWidth: []
                    };
                }

                /**
                 * Add the renderable appointment slot to the current day group.
                 *
                 * The original appointment object is kept so the renderer can later
                 * access all appointment metadata, formatter data and extras.
                 */
                groupedByWeekdays[key].appointments.push({
                    start: slotStart,
                    end: slotEnd,
                    appointment
                });
            });
        });

        /**
         * Step 2:
         * For each weekday/date group, distribute appointments into columns or
         * full-width rendering.
         */
        Object.keys(groupedByWeekdays).forEach((key) => {
            const {appointments, columns, fullWidth} = groupedByWeekdays[key];

            /**
             * Split the key back into weekday and date parts.
             *
             * These values are currently not used directly in this function, but
             * keeping them available can be useful for debugging or later layout
             * logic.
             */
            const [weekday, targetDateLocal] = key.split('_');

            /**
             * Sort appointments by start time before assigning them to columns.
             *
             * Processing appointments chronologically makes the column assignment
             * deterministic and easier to reason about.
             */
            appointments.sort((a, b) => a.start - b.start);

            appointments.forEach((appointment) => {
                /**
                 * If this appointment is configured to allow overlap rendering,
                 * render it as a full-width appointment.
                 *
                 * This bypasses the normal column distribution logic.
                 */
                if (isAppointmentOverlapEnabled(appointment.appointment)) {
                    fullWidth.push(appointment);
                    return;
                }

                let placedInColumn = false;

                /**
                 * Try to place the appointment into an existing column.
                 *
                 * A column can contain multiple appointments as long as none of
                 * them visually overlap with the new appointment.
                 */
                for (let column of columns) {
                    if (doesNotOverlap(column, appointment)) {
                        column.push(appointment);
                        placedInColumn = true;
                        break;
                    }
                }

                /**
                 * If the appointment could not be placed into an existing column,
                 * decide whether it can be rendered full-width or whether a new
                 * overlap column is required.
                 */
                if (!placedInColumn) {
                    /**
                     * Check whether this appointment overlaps with any other
                     * appointment in the same weekday/date group.
                     *
                     * Two appointments do not overlap when one ends before the
                     * other starts.
                     */
                    const hasOverlap = appointments.some((otherAppointment) =>
                        otherAppointment !== appointment &&
                        !(
                            appointment.start >= otherAppointment.end ||
                            appointment.end <= otherAppointment.start
                        )
                    );

                    /**
                     * If the appointment has no overlap and no columns have been
                     * created yet, it can use the full available width.
                     */
                    if (!hasOverlap && columns.length === 0) {
                        fullWidth.push(appointment);
                    } else {
                        /**
                         * Otherwise, create a new column for this overlapping
                         * appointment.
                         */
                        columns.push([appointment]);
                    }
                }
            });
        });

        /**
         * Return the grouped layout structure.
         *
         * The rendering function uses this object to render appointments either
         * side by side in columns or as full-width blocks.
         */
        return groupedByWeekdays;
    }

    /**
     * Checks whether a new appointment can be placed into an existing column
     * without overlapping any appointment that is already in that column.
     *
     * The function compares the new appointment against every appointment in the
     * column. If the new appointment overlaps with at least one existing
     * appointment, the function returns false.
     *
     * Two appointments are considered non-overlapping when one of these conditions
     * is true:
     *
     * - the new appointment starts at or after the existing appointment ends
     * - the new appointment ends at or before the existing appointment starts
     *
     * This means appointments that touch exactly at their boundaries are allowed
     * in the same column.
     *
     * Example:
     *
     * Existing appointment: 09:00–10:00
     *
     * New appointment:      10:00–11:00 => no overlap
     * New appointment:      09:30–10:30 => overlap
     * New appointment:      08:00–09:00 => no overlap
     *
     * @param {Array<Object>} column
     * A list of already placed appointment slots in the same visual column.
     *
     * @param {Object} newAppointment
     * The appointment slot that should be checked.
     *
     * @param {Date} newAppointment.start
     * Start date/time of the new appointment slot.
     *
     * @param {Date} newAppointment.end
     * End date/time of the new appointment slot.
     *
     * @returns {boolean}
     * Returns true if the new appointment does not overlap with any appointment
     * in the column. Returns false if an overlap is detected.
     */
    function doesNotOverlap(column, newAppointment) {
        for (const appointment of column) {
            /**
             * Check whether the new appointment overlaps with the current
             * appointment in the column.
             *
             * There is no overlap if the new appointment starts after or exactly
             * when the current appointment ends, or if it ends before or exactly
             * when the current appointment starts.
             *
             * If neither condition is true, both appointments share at least part
             * of the same time range and therefore overlap.
             */
            if (!(newAppointment.start >= appointment.end || newAppointment.end <= appointment.start)) {
                return false;
            }
        }

        /**
         * No overlap was found with any appointment in the column.
         */
        return true;
    }

    /**
     * Renders all appointments for day-like and week-like calendar views.
     *
     * The function separates all-day appointments from timed appointments and
     * renders them into their corresponding containers within the current calendar
     * view.
     *
     * All-day appointments are rendered into the all-day row of each matching
     * display date. Timed appointments are grouped by overlapping time ranges so
     * that appointments which collide visually can be displayed side by side in
     * columns. Appointments without visual overlap are rendered using the full
     * available width.
     *
     * For each appointment, the function:
     * - resolves the correct target day container,
     * - calculates the vertical position and height based on the appointment time,
     * - applies formatter output depending on the current view,
     * - attaches the original appointment data to the rendered DOM element,
     * - applies appointment-specific styling,
     * - and normalizes z-index stacking per day container.
     *
     * The final stacking pass ensures deterministic layering for all rendered
     * appointments inside the same day container. Appointments are sorted by start
     * time and then by end time, so earlier appointments are placed behind later
     * ones in a predictable order.
     *
     * Debug logging is available through the calendar settings and prints the
     * current view, all-day appointments, timed appointments and the complete
     * appointment collection.
     *
     * @param {jQuery} $wrapper
     * The calendar wrapper element used to resolve settings, view state and target
     * containers.
     *
     * @param {Array<Object>} appointments
     * The list of appointments to render. Each appointment is expected to already
     * contain calculated `extras`, including display dates, colors and normalized
     * metadata.
     *
     * @returns {void}
     * This function directly updates the DOM and does not return a value.
     */
    function drawAppointmentsForDayOrWeek($wrapper, appointments) {
        /**
         * Resolve the calendar state and required DOM references.
         *
         * settings contains all configuration options, formatter callbacks,
         * icons, debug flags and visual options.
         *
         * view contains the currently active calendar view, for example "day",
         * "week" or a similar day/week-based view.
         *
         * $viewContainer is the DOM container into which the appointments are
         * rendered.
         */
        const settings = getSettings($wrapper);
        const view = getView($wrapper);
        const $viewContainer = getViewContainer($wrapper);

        /**
         * Split appointments into all-day appointments and timed appointments.
         *
         * All-day appointments are rendered into the dedicated all-day area.
         * Timed appointments are rendered into the time-slot grid.
         */
        const allDays = appointments.filter(appointment => appointment.allDay === true);
        const notAllDays = appointments.filter(appointment => appointment.allDay !== true);

        /**
         * Optional debug output for inspecting the rendering input.
         */
        if (settings.debug) {
            log('Call drawAppointmentsForDayOrWeek with view:', view);
            log("All-Day Appointments:", allDays);
            log("Not-All-Day Appointments:", notAllDays);
            log("All Appointments:", appointments);
        }

        /**
         * Render all-day appointments.
         *
         * Each all-day appointment may span multiple calendar days. Therefore,
         * the function iterates over appointment.extras.displayDates and renders
         * the appointment into every matching all-day container.
         */
        allDays.forEach(appointment => {
            if (settings.debug) {
                log(">>>> All-Day Appointment displayDates:", appointment.extras.displayDates);
            }

            appointment.extras.displayDates.forEach((obj) => {
                /**
                 * Convert the display date into a Date object so the weekday can
                 * be resolved and used for finding the matching all-day container.
                 */
                const fakeStart = new Date(obj.date);

                /**
                 * Find the all-day container for this specific weekday and local date.
                 *
                 * Both values are used because a weekday alone is not unique in
                 * multi-day or week-based views.
                 */
                const allDayWrapper = $viewContainer.find(
                    '[data-all-day="' + fakeStart.getDay() + '"]' +
                    '[data-date-local="' + $.bsCalendar.utils.formatDateToDateString(fakeStart) + '"]'
                );

                /**
                 * Only render the appointment if the matching all-day container
                 * exists in the current view.
                 */
                if (allDayWrapper.length) {
                    /**
                     * Add bottom padding so multiple all-day appointments have
                     * enough visual spacing.
                     */
                    allDayWrapper.addClass('pb-3');

                    /**
                     * Create a sanitized copy of the appointment data for formatter
                     * callbacks.
                     *
                     * This prevents formatter functions from accidentally depending
                     * on or modifying the original appointment object directly.
                     */
                    const returnData = getAppointmentForReturn(appointment);

                    /**
                     * Render the all-day appointment element.
                     *
                     * The actual HTML content is provided by the configured
                     * all-day formatter.
                     */
                    const appointmentElement = $('<span>', {
                        'data-appointment': true,
                        html: settings.formatter.allDay(
                            returnData.appointment,
                            returnData.extras,
                            view
                        ),
                        class: view === 'day'
                            ? 'mx-1 mb-1 d-inline-block'
                            : 'mx-1 mb-1 flex-fill',
                    }).appendTo(allDayWrapper);

                    /**
                     * Store the original appointment object on the DOM element.
                     *
                     * This allows later event handlers to access the full
                     * appointment data.
                     */
                    appointmentElement.data('appointment', appointment);
                }
            });
        });

        /**
         * Group timed appointments by visual overlap.
         *
         * The result separates appointments into:
         * - columns: appointments that overlap and need side-by-side rendering
         * - fullWidth: appointments that can use the full available width
         */
        const groupedAppointments = groupOverlappingAppointments($wrapper, notAllDays);

        /**
         * Pixel gap between overlapping appointment columns.
         */
        const columnGap = 2;

        /**
         * Render each overlap group.
         *
         * The key identifies a specific weekday/date combination.
         */
        Object.entries(groupedAppointments).forEach(([key, {columns, fullWidth}]) => {
            const [weekday, targetDateLocal] = key.split('_');

            /**
             * Render appointments that must be displayed in columns because they
             * overlap with other timed appointments.
             */
            const totalColumns = columns.length;

            columns.forEach((column, columnIndex) => {
                column.forEach((slotData) => {
                    const appointment = slotData.appointment;

                    /**
                     * Convert slot start and end values into Date objects.
                     *
                     * slotData may contain split appointment segments, especially
                     * for appointments that span multiple days.
                     */
                    const startDate = new Date(slotData.start);
                    const endDate = new Date(slotData.end);

                    /**
                     * Skip invalid appointment segments to avoid broken positioning
                     * calculations and invalid DOM output.
                     */
                    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                        console.warn(`Invalid date in Appointment: ${appointment?.title || 'unknown'}`);
                        return;
                    }

                    /**
                     * Find the time-slot container for the target weekday and date.
                     *
                     * The date is required because the same weekday can occur in
                     * different rendered weeks or ranges.
                     */
                    const $weekDayContainer = $viewContainer.find(
                        `.wc-day-view-time-slots[data-week-day="${weekday}"][data-date-local="${targetDateLocal}"]`
                    );

                    /**
                     * If no matching container exists, the appointment segment
                     * cannot be rendered in the current view.
                     */
                    if (!$weekDayContainer.length) {
                        console.warn(
                            `Container für Weekday ${weekday} mit Datum ${targetDateLocal} nicht gefunden.`
                        );
                        return;
                    }

                    /**
                     * Check whether this appointment can visually extend across
                     * the remaining columns.
                     *
                     * If it does not overlap with any appointments in later columns,
                     * it can use the remaining horizontal space instead of being
                     * restricted to a single column width.
                     */
                    const noOverlapWithNextColumns = columns
                        .slice(columnIndex + 1)
                        .every(nextColumn =>
                            nextColumn.every(slot =>
                                endDate <= new Date(slot.start) ||
                                startDate >= new Date(slot.end)
                            )
                        );

                    /**
                     * Calculate the total horizontal gap caused by all columns.
                     */
                    const totalGap = (totalColumns - 1) * columnGap;

                    let appointmentWidthPercent;

                    if (noOverlapWithNextColumns) {
                        /**
                         * If this appointment does not overlap with appointments in
                         * later columns, let it take the remaining available width.
                         */
                        const remainingColumns = totalColumns - columnIndex;
                        const remainingGap = (remainingColumns - 1) * columnGap;

                        appointmentWidthPercent =
                            100 -
                            (
                                (columnIndex * (100 / totalColumns)) +
                                (remainingGap * 100 / $weekDayContainer.width())
                            );
                    } else {
                        /**
                         * Otherwise, distribute the available width evenly across
                         * all overlap columns while subtracting the configured gaps.
                         */
                        appointmentWidthPercent =
                            totalColumns > 1
                                ? (100 - (totalGap * 100 / $weekDayContainer.width())) / totalColumns
                                : 100;
                    }

                    /**
                     * Calculate the horizontal start position of the appointment.
                     */
                    const appointmentLeftPercent =
                        totalColumns > 1
                            ? (columnIndex * (100 / totalColumns))
                            : 0;

                    /**
                     * Calculate the vertical position and height of the appointment
                     * based on its start and end time.
                     */
                    const position = calculateSlotPosition(
                        $wrapper,
                        startDate.toISOString(),
                        endDate.toISOString()
                    );

                    /**
                     * Prepare sanitized appointment data for the formatter.
                     */
                    const returnData = getAppointmentForReturn(appointment);

                    /**
                     * Use the correct formatter depending on the active view.
                     */
                    const appointmentContent = view === 'day'
                        ? settings.formatter.day(returnData.appointment, returnData.extras)
                        : settings.formatter.week(returnData.appointment, returnData.extras);

                    /**
                     * Render the timed appointment as an absolutely positioned
                     * element inside the matching day/time-slot container.
                     */
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

                    /**
                     * Attach the original appointment data and apply resolved
                     * appointment colors.
                     */
                    appointmentElement.data('appointment', appointment);
                    setAppointmentStyles(appointmentElement, appointment.extras.colors);
                    addAppointmentResizeHandles($wrapper, appointmentElement, appointment, startDate, endDate);
                });
            });

            /**
             * Render isolated timed appointments that can use the full container width.
             *
             * These appointments do not need column-based layout because they do
             * not visually overlap with appointments in the same group.
             */
            fullWidth
                .slice()
                .sort((a, b) => a.start - b.start || a.end - b.end)
                .forEach((slotData, overlapIndex) => {
                    const appointment = slotData.appointment;
                    const startDate = new Date(slotData.start);

                    /**
                     * Full-width appointments always start at the left edge and
                     * occupy the complete horizontal space.
                     */
                    const appointmentWidthPercent = 100;
                    const appointmentLeftPercent = 0;

                    /**
                     * Default position fallback.
                     *
                     * This prevents undefined values if invalid dates are detected.
                     */
                    let position = {
                        top: 0,
                        height: 0
                    };

                    /**
                     * Validate the date objects before calculating the slot position.
                     */
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

                    /**
                     * Resolve the target date for finding the correct day container.
                     */
                    const targetDateLocal = $.bsCalendar.utils.formatDateToDateString(startDate);

                    /**
                     * Find the time-slot container for this full-width appointment.
                     */
                    const $weekDayContainer = $viewContainer.find(
                        `.wc-day-view-time-slots[data-week-day="${weekday}"][data-date-local="${targetDateLocal}"]`
                    );

                    /**
                     * Skip rendering if the expected container does not exist.
                     */
                    if (!$weekDayContainer.length) {
                        console.warn(
                            `Full-Width-Container für Weekday ${weekday} mit Datum ${targetDateLocal} nicht gefunden.`
                        );
                        return;
                    }

                    /**
                     * Prepare sanitized appointment data for formatter callbacks.
                     */
                    const returnData = getAppointmentForReturn(appointment);

                    /**
                     * Use the day or week formatter depending on the current view.
                     */
                    const appointmentContent = view === 'day'
                        ? settings.formatter.day(returnData.appointment, returnData.extras)
                        : settings.formatter.week(returnData.appointment, returnData.extras);

                    /**
                     * Render the full-width appointment.
                     */
                    const appointmentElement = $('<div>', {
                        'data-appointment': true,
                        class: 'position-absolute overflow-hidden rounded',
                        css: {
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            left: `${appointmentLeftPercent}%`,
                            width: `${appointmentWidthPercent}%`,

                            /**
                             * Temporary stacking order.
                             *
                             * A final deterministic stacking pass is executed after
                             * all appointments in this group have been rendered.
                             */
                            zIndex: overlapIndex + 1
                        },
                        html: appointmentContent,
                    }).appendTo($weekDayContainer);

                    /**
                     * Attach metadata and apply appointment styling.
                     */
                    appointmentElement.data('appointment', appointment);
                    setAppointmentStyles(appointmentElement, appointment.extras.colors);
                    addAppointmentResizeHandles($wrapper, appointmentElement, appointment, slotData.start, slotData.end);
                });

            /**
             * Final stacking pass per actual day container.
             *
             * Appointments from both column-based rendering and full-width rendering
             * may end up inside the same day container. This pass collects all
             * rendered appointment elements per container and assigns a deterministic
             * z-index based on appointment start time and end time.
             *
             * This avoids inconsistent visual stacking caused by render order.
             */
            (function () {
                const seenContainers = {};

                /**
                 * Collect all containers used by column-based appointments.
                 */
                columns.forEach(column => {
                    column.forEach(slotData => {
                        const startDate = new Date(slotData.start);
                        const targetDateLocal = $.bsCalendar.utils.formatDateToDateString(startDate);

                        seenContainers[targetDateLocal] = $viewContainer
                            .find(`.wc-day-view-time-slots[data-week-day="${weekday}"][data-date-local="${targetDateLocal}"]`)
                            .first();
                    });
                });

                /**
                 * Collect all containers used by full-width appointments.
                 */
                fullWidth.forEach(slotData => {
                    const startDate = new Date(slotData.start);
                    const targetDateLocal = $.bsCalendar.utils.formatDateToDateString(startDate);

                    seenContainers[targetDateLocal] = $viewContainer
                        .find(`.wc-day-view-time-slots[data-week-day="${weekday}"][data-date-local="${targetDateLocal}"]`)
                        .first();
                });

                /**
                 * Normalize z-index stacking inside every collected container.
                 */
                Object.values(seenContainers).forEach($container => {
                    if (!$container || !$container.length) {
                        return;
                    }

                    /**
                     * Read all rendered appointment elements from the container and
                     * extract their original appointment start and end values.
                     */
                    const entries = $container
                        .find('[data-appointment]')
                        .toArray()
                        .map(el => {
                            const $el = $(el);
                            const appt = $el.data('appointment');

                            const start = appt
                                ? $.bsCalendar.utils.parseDateInput(appt.start)
                                : null;

                            const end = appt
                                ? $.bsCalendar.utils.parseDateInput(appt.end)
                                : null;

                            return {
                                $el,
                                start,
                                end
                            };
                        })
                        /**
                         * Ignore entries without a valid start date.
                         */
                        .filter(x => x.start && !isNaN(x.start.getTime()));

                    /**
                     * Sort appointments by start time and then by end time.
                     *
                     * Earlier appointments receive lower z-index values.
                     */
                    entries.sort((a, b) =>
                        a.start - b.start ||
                        (a.end && b.end ? a.end - b.end : 0)
                    );

                    /**
                     * Apply deterministic stacking order.
                     */
                    entries.forEach((entry, idx) => {
                        entry.$el.css('zIndex', idx + 1);
                    });
                });
            })();
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

    function drawAppointmentsForAgenda($wrapper, appointments) {
        const settings = getSettings($wrapper);
        const $container = getViewContainer($wrapper).find('[data-agenda-container]');
        const period = getStartAndEndDateByView($wrapper);
        const rangeStart = $.bsCalendar.utils.parseDateInput(period.start);
        const rangeEnd = $.bsCalendar.utils.parseDateInput(period.end);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);

        const items = [];
        appointments.forEach(appointment => {
            if (!appointment.extras || !Array.isArray(appointment.extras.displayDates)) {
                return;
            }

            appointment.extras.displayDates.forEach(displayDate => {
                const segmentDate = $.bsCalendar.utils.parseDateInput(displayDate.date);
                if (!segmentDate || isNaN(segmentDate.getTime())) {
                    return;
                }
                segmentDate.setHours(12, 0, 0, 0);
                if (segmentDate < rangeStart || segmentDate > rangeEnd) {
                    return;
                }

                const start = $.bsCalendar.utils.parseDateInput(`${displayDate.date} ${displayDate.times.start || '00:00:00'}`);
                const end = $.bsCalendar.utils.parseDateInput(`${displayDate.date} ${displayDate.times.end || '23:59:59'}`);
                items.push({
                    appointment,
                    displayDate,
                    dateLocal: displayDate.date,
                    start,
                    end
                });
            });
        });

        items.sort((a, b) => {
            if (a.dateLocal !== b.dateLocal) {
                return a.dateLocal.localeCompare(b.dateLocal);
            }
            if (a.appointment.allDay !== b.appointment.allDay) {
                return a.appointment.allDay ? -1 : 1;
            }
            return a.start - b.start || a.end - b.end;
        });

        $container.empty();
        if (!items.length) {
            $('<div>', {
                class: 'd-flex flex-column align-items-center justify-content-center text-body-secondary p-5 text-center',
                html: `<i class="${settings.icons.agenda} mb-2" style="font-size: 2rem;"></i><div>${settings.translations.searchNoResult}</div>`
            }).appendTo($container);
            return;
        }

        let currentDate = null;
        let $group = null;
        const mainColor = $.bsCalendar.utils.getColors(settings.mainColor);
        items.forEach(item => {
            if (item.dateLocal !== currentDate) {
                currentDate = item.dateLocal;
                const date = $.bsCalendar.utils.parseDateInput(item.dateLocal);

                const isToday = date.toDateString() === new Date().toDateString();
                const circleClasses = [];
                const circleCss = [
                    'width: 32px',
                    'height: 32px',
                    'line-height: 32px',
                ];
                if (isToday) {
                    circleClasses.push('d-flex justify-content-center align-items-center rounded-circle');
                    circleCss.push(`background-color: ${mainColor.backgroundColor}`);
                    circleCss.push(`background-image: ${mainColor.backgroundImage}`);
                    circleCss.push(`color: ${mainColor.color}`);
                } else {
                    circleClasses.push('d-flex justify-content-center align-items-center border rounded-circle');
                }

                const $section = $('<section>', {
                    class: 'wc-agenda-day border-bottom bg-body'
                }).appendTo($container);

                const dayName = date.toLocaleDateString(settings.locale, {weekday: 'short'});
                const monthName = date.toLocaleDateString(settings.locale, {month: 'short'});



                const dateWrapper = $('<div>', {
                    class: 'd-flex align-items-center gap-3 px-3 py-2 bg-body-tertiary',
                    html: [
                        `<div class="text-center ${isToday ? 'fw-bold' : ''}" style="width: 32px;">`,
                        `<div class="small text-uppercase text-body-secondary">${dayName}</div>`,
                        `<div class="h5 mb-0 ${circleClasses.join(' ')}" style="${circleCss.join(';')}">${date.getDate()}</div>`,
                        `</div>`,
                        `<div class="fw-semibold">${monthName} ${date.getFullYear()}</div>`
                    ].join('')
                }).appendTo($section);

                if (settings.views.includes('day')) {
                    const formattedDate = $.bsCalendar.utils.formatDateToDateString(date);
                    dateWrapper.attr('data-date', formattedDate).css({cursor: 'pointer'});
                }

                $group = $('<div>', {
                    class: 'list-group list-group-flush'
                }).appendTo($section);
            }

            appendAgendaAppointment($wrapper, $group, item);
        });
        $('<div>', {
            'data-agenda-search-empty': true,
            class: 'd-flex flex-column align-items-center justify-content-center text-body-secondary p-5 text-center',
            html: `<i class="${settings.icons.agenda} mb-2" style="font-size: 2rem;"></i><div>${settings.translations.searchNoResult}</div>`,
            css: {
                display: 'none'
            }
        }).appendTo($container);
        applyAgendaSearchFilter($wrapper);
    }

    function appendAgendaAppointment($wrapper, $group, item) {
        const settings = getSettings($wrapper);
        const appointment = item.appointment;
        const returnData = getAppointmentForReturn(appointment);
        const colors = returnData.extras.colors || $.bsCalendar.utils.getColors(appointment.color, settings.mainColor);
        const agendaExtras = $.extend(true, {}, returnData.extras, {
            agenda: {
                displayDate: item.displayDate,
                dateLocal: item.dateLocal,
                start: item.start,
                end: item.end
            }
        });

        const $item = $('<div>', {
            'data-appointment': true,
            'data-agenda-search-text': buildAgendaSearchText(returnData.appointment, agendaExtras),
            class: 'list-group-item list-group-item-action d-flex align-items-start gap-3 px-3 py-2',
            css: {
                borderLeft: `4px solid ${colors.backgroundColor}`,
                cursor: 'pointer'
            }
        }).appendTo($group);
        $item.data('appointment', appointment);
        $item.html(settings.formatter.agenda(returnData.appointment, agendaExtras));
    }

    function normalizeAgendaSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase();
    }

    function flattenAgendaSearchValue(value) {
        if (value === null || value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value.flatMap(item => flattenAgendaSearchValue(item));
        }
        if (value instanceof Date) {
            return [$.bsCalendar.utils.formatDateToDateString(value), $.bsCalendar.utils.formatTime(value, false)];
        }
        if (typeof value === 'object') {
            return Object.values(value).flatMap(item => flattenAgendaSearchValue(item));
        }
        return [String(value)];
    }

    function buildAgendaSearchText(appointment, extras) {
        const task = appointment.task || null;
        const agenda = extras.agenda || {};
        const displayDate = agenda.displayDate || {};
        const values = [
            appointment.title,
            appointment.description,
            appointment.location,
            appointment.calendarId,
            appointment.allDay ? $.bsCalendar.getTranslation(extras.locale, 'allDay') : '',
            task ? task.priority : '',
            task ? (task.checked ? $.bsCalendar.getTranslation(extras.locale, 'taskDone') : $.bsCalendar.getTranslation(extras.locale, 'taskOpen')) : '',
            extras.start,
            extras.end,
            displayDate.times,
            displayDate.date
        ];

        return normalizeAgendaSearchText(flattenAgendaSearchValue(values).join(' '));
    }

    function applyAgendaSearchFilter($wrapper) {
        const data = getBsCalendarData($wrapper);
        if (!data) {
            return;
        }

        const term = normalizeAgendaSearchText(data.agendaSearchTerm || '');
        const $viewContainer = getViewContainer($wrapper);
        const $agendaContainer = $viewContainer.find('[data-agenda-container]');
        const $empty = $viewContainer.find('[data-agenda-search-empty]');
        const $clear = $viewContainer.find('[data-agenda-search-clear]');

        $clear.toggle(!!term);
        let visibleCount = 0;

        $agendaContainer.find('[data-appointment]').each(function () {
            const $appointment = $(this);
            const text = String($appointment.attr('data-agenda-search-text') || '');
            const isVisible = !term || text.includes(term);
            if (isVisible) {
                visibleCount++;
            }
            setAgendaFilterVisibility(this, isVisible);
            $appointment.attr('data-agenda-search-match', isVisible ? 'true' : 'false');
        });

        $agendaContainer.find('.wc-agenda-day').each(function () {
            const $day = $(this);
            const hasVisibleAppointments = $day.find('[data-agenda-search-match="true"]').length > 0;
            setAgendaFilterVisibility(this, !term || hasVisibleAppointments);
        });

        setAgendaFilterVisibility($empty.get(0), !!term && visibleCount === 0);
    }

    function setAgendaFilterVisibility(element, isVisible) {
        if (!element || !element.style) {
            return;
        }
        if (isVisible) {
            element.style.removeProperty('display');
            return;
        }
        element.style.setProperty('display', 'none', 'important');
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
            const borderLeftColor = appointment.color || settings.mainColor;
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
                    'data-month-appointment-date': startString,
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

    function getAppointmentReturnData($wrapper, origin) {
        const appointment = copyAppointment(origin);
        if (!appointment.extras && appointment.start && appointment.end) {
            setAppointmentExtras($wrapper, [appointment]);
        }
        return getAppointmentForReturn(appointment);
    }

    /**
     * Builds a minimal drag context object without mutating the original appointment.
     *
     * @param {jQuery} $wrapper - The calendar wrapper.
     * @param {Date} start - The dragged start date.
     * @param {Date} end - The dragged end date.
     * @return {Object} The dragged start/end date and time values.
     */
    function getDragAppointmentExtras($wrapper, start, end) {
        const settings = getSettings($wrapper);
        const hourSlotRulesAvailability = getHourSlotRulesAvailabilityForRange($wrapper, start, end);
        const appointmentRulesAvailability = getAppointmentRulesAvailabilityForRange($wrapper, start, end);

        return {
            start: {
                date: $.bsCalendar.utils.formatDateToDateString(start),
                time: $.bsCalendar.utils.formatTime(start, false)
            },
            end: {
                date: $.bsCalendar.utils.formatDateToDateString(end),
                time: $.bsCalendar.utils.formatTime(end, false)
            },
            hourSlotRules: hourSlotRulesAvailability,
            appointmentRules: appointmentRulesAvailability
        };
    }

    function getAppointmentRules($wrapper) {
        const settings = getSettings($wrapper);
        return settings.appointmentRules || {};
    }

    function getAppointmentDurationMinutes(start, end) {
        return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    }

    function getMinimumAppointmentDurationMinutes($wrapper, fallbackMinutes = 1) {
        const rules = getAppointmentRules($wrapper);
        if (rules.durationMinutes !== null) {
            return rules.durationMinutes;
        }
        let minimum = Math.max(1, Math.floor(fallbackMinutes || 1));
        if (rules.minDurationMinutes !== null) {
            minimum = Math.max(minimum, rules.minDurationMinutes);
        }
        if (rules.durationStepMinutes !== null) {
            minimum = Math.max(minimum, rules.durationStepMinutes);
        }
        if (rules.maxDurationMinutes !== null) {
            minimum = Math.min(minimum, rules.maxDurationMinutes);
        }
        return Math.max(1, minimum);
    }

    function normalizeAppointmentDurationMinutes($wrapper, desiredMinutes, fallbackMinutes = 1) {
        const rules = getAppointmentRules($wrapper);
        let desired = Math.max(1, Math.round(Number(desiredMinutes) || fallbackMinutes || 1));

        if (rules.durationMinutes !== null) {
            return rules.durationMinutes;
        }

        let min = rules.minDurationMinutes !== null ? rules.minDurationMinutes : 1;
        let max = rules.maxDurationMinutes !== null ? rules.maxDurationMinutes : Infinity;
        if (rules.durationStepMinutes !== null) {
            min = Math.max(min, rules.durationStepMinutes);
        }
        if (max < min) {
            max = min;
        }

        desired = Math.max(min, Math.min(max, desired));

        if (rules.durationStepMinutes === null) {
            return desired;
        }

        const step = rules.durationStepMinutes;
        const first = Math.ceil(min / step) * step;
        const last = Math.floor(max / step) * step;
        if (!Number.isFinite(first) || first <= 0 || first > max) {
            return min;
        }
        if (last < first) {
            return first;
        }

        const lower = Math.max(first, Math.floor(desired / step) * step);
        const upper = Math.min(last, Math.ceil(desired / step) * step);
        if (Math.abs(desired - lower) <= Math.abs(upper - desired)) {
            return lower;
        }
        return upper;
    }

    function getDefaultAppointmentCreateDurationMinutes($wrapper, fallbackMinutes = 30) {
        return normalizeAppointmentDurationMinutes($wrapper, fallbackMinutes, fallbackMinutes);
    }

    function getAppointmentRulesAvailabilityForRange($wrapper, start, end) {
        const rules = getAppointmentRules($wrapper);
        const durationMinutes = getAppointmentDurationMinutes(start, end);
        const violations = [];

        if (rules.durationMinutes !== null && durationMinutes !== rules.durationMinutes) {
            violations.push('durationMinutes');
        }
        if (rules.minDurationMinutes !== null && durationMinutes < rules.minDurationMinutes) {
            violations.push('minDurationMinutes');
        }
        if (rules.maxDurationMinutes !== null && durationMinutes > rules.maxDurationMinutes) {
            violations.push('maxDurationMinutes');
        }
        if (rules.durationStepMinutes !== null && durationMinutes % rules.durationStepMinutes !== 0) {
            violations.push('durationStepMinutes');
        }

        return {
            canWork: violations.length === 0,
            durationMinutes: durationMinutes,
            rules: $.extend(true, {}, rules),
            violations: violations
        };
    }

    function isAppointmentDurationAllowed($wrapper, start, end) {
        return getAppointmentRulesAvailabilityForRange($wrapper, start, end).canWork;
    }

    function getHourSlotRulesAvailabilityForRange($wrapper, start, end) {
        const settings = getSettings($wrapper);

        if ($.bsCalendar.utils.isValueEmpty(settings.hourSlots.rules)) {
            return getDefaultHourSlotRulesAvailability();
        }

        return evaluateHourSlotRulesAvailability(
            settings.hourSlots.rules,
            start.getDay(),
            $.bsCalendar.utils.formatTime(start, false),
            $.bsCalendar.utils.formatTime(end, false)
        );
    }

    function isHourSlotRuleRangeAllowed($wrapper, start, end) {
        return getHourSlotRulesAvailabilityForRange($wrapper, start, end).canWork;
    }

    function getHourSlotRulesAllowedIntervals($wrapper, day) {
        const settings = getSettings($wrapper);
        const visibleStart = settings.hourSlots.start * 60;
        const visibleEnd = settings.hourSlots.end * 60;
        const ranges = getHourSlotRulesList(settings.hourSlots.rules)
            .filter(item => hourSlotRulesMatchesDay(item, day));
        const exclusiveRanges = ranges.filter(item => normalizeHourSlotRulesMode(item.mode) === 'exclusive');
        const blockedRanges = ranges.filter(item => normalizeHourSlotRulesMode(item.mode) === 'blocked');
        let intervals = exclusiveRanges.length
            ? exclusiveRanges.map(item => getHourSlotRulesTimeRange(item))
            : [{start: settings.hourSlots.start, end: settings.hourSlots.end}];

        intervals = intervals
            .map(interval => ({
                start: Math.max(visibleStart, interval.start * 60),
                end: Math.min(visibleEnd, interval.end * 60)
            }))
            .filter(interval => interval.end > interval.start)
            .sort((a, b) => a.start - b.start || a.end - b.end);

        intervals = mergeHourSlotRulesIntervals(intervals);

        blockedRanges.forEach(blockedRange => {
            const range = getHourSlotRulesTimeRange(blockedRange);
            const blockedStart = Math.max(visibleStart, range.start * 60);
            const blockedEnd = Math.min(visibleEnd, range.end * 60);
            if (blockedEnd <= blockedStart) {
                return;
            }

            const nextIntervals = [];
            intervals.forEach(interval => {
                if (blockedEnd <= interval.start || blockedStart >= interval.end) {
                    nextIntervals.push(interval);
                    return;
                }
                if (blockedStart > interval.start) {
                    nextIntervals.push({
                        start: interval.start,
                        end: Math.min(blockedStart, interval.end)
                    });
                }
                if (blockedEnd < interval.end) {
                    nextIntervals.push({
                        start: Math.max(blockedEnd, interval.start),
                        end: interval.end
                    });
                }
            });
            intervals = nextIntervals.filter(interval => interval.end > interval.start);
        });

        return intervals;
    }

    function mergeHourSlotRulesIntervals(intervals) {
        const merged = [];

        intervals.forEach(interval => {
            const previous = merged[merged.length - 1];
            if (!previous || interval.start > previous.end) {
                merged.push($.extend({}, interval));
                return;
            }
            previous.end = Math.max(previous.end, interval.end);
        });

        return merged;
    }

    function clampCreateMinutesToHourSlotRules($wrapper, dateLocal, anchorMinutes, floatingMinutes, minDurationMinutes) {
        const settings = getSettings($wrapper);
        const visibleStart = settings.hourSlots.start * 60;
        const date = $.bsCalendar.utils.parseDateInput(dateLocal);
        const day = date.getDay();
        const anchor = visibleStart + anchorMinutes;
        const floating = visibleStart + floatingMinutes;
        const minDuration = getMinimumAppointmentDurationMinutes($wrapper, minDurationMinutes);
        const intervals = getHourSlotRulesAllowedIntervals($wrapper, day)
            .filter(interval => interval.end - interval.start >= minDuration);

        if (!intervals.length) {
            return {
                startMinutes: Math.min(anchorMinutes, floatingMinutes),
                endMinutes: Math.max(anchorMinutes, floatingMinutes),
                canWork: false,
                clamped: false
            };
        }

        let interval = intervals.find(item => anchor >= item.start && anchor <= item.end);
        if (!interval) {
            interval = intervals
                .map(item => ({
                    interval: item,
                    distance: Math.min(Math.abs(anchor - item.start), Math.abs(anchor - item.end))
                }))
                .sort((a, b) => a.distance - b.distance)[0].interval;
        }

        let start = anchor;
        let end = floating;
        const duration = normalizeAppointmentDurationMinutes(
            $wrapper,
            Math.min(Math.abs(floating - anchor), interval.end - interval.start),
            minDuration
        );
        if (floating >= anchor) {
            start = Math.max(interval.start, Math.min(anchor, interval.end - duration));
            end = start + duration;
        } else {
            end = Math.min(interval.end, Math.max(anchor, interval.start + duration));
            start = end - duration;
        }

        start = Math.max(interval.start, Math.min(start, interval.end - duration));
        end = Math.min(interval.end, Math.max(end, start + duration));

        const startMinutes = start - visibleStart;
        const endMinutes = end - visibleStart;
        return {
            startMinutes: startMinutes,
            endMinutes: endMinutes,
            canWork: endMinutes > startMinutes,
            clamped: start !== Math.min(anchor, floating) || end !== Math.max(anchor, floating)
        };
    }

    function clampMoveMinutesToHourSlotRules($wrapper, dateLocal, startMinutes, durationMinutes) {
        const settings = getSettings($wrapper);
        const visibleStart = settings.hourSlots.start * 60;
        const date = $.bsCalendar.utils.parseDateInput(dateLocal);
        const day = date.getDay();
        const duration = Math.max(1, durationMinutes || 1);
        const proposedStart = visibleStart + startMinutes;
        const intervals = getHourSlotRulesAllowedIntervals($wrapper, day)
            .filter(interval => interval.end - interval.start >= duration);

        if (!intervals.length) {
            return {
                startMinutes: startMinutes,
                canWork: false,
                clamped: false
            };
        }

        const candidates = intervals.map(interval => {
            const start = Math.max(interval.start, Math.min(proposedStart, interval.end - duration));
            return {
                start: start,
                distance: Math.abs(start - proposedStart)
            };
        }).sort((a, b) => a.distance - b.distance || a.start - b.start);

        const best = candidates[0];
        return {
            startMinutes: best.start - visibleStart,
            canWork: true,
            clamped: best.start !== proposedStart
        };
    }

    function clampResizeMinutesToHourSlotRules($wrapper, dateLocal, edge, fixedMinutes, floatingMinutes, minDurationMinutes) {
        const settings = getSettings($wrapper);
        const visibleStart = settings.hourSlots.start * 60;
        const visibleEnd = settings.hourSlots.end * 60;
        const date = $.bsCalendar.utils.parseDateInput(dateLocal);
        const day = date.getDay();
        const minDuration = getMinimumAppointmentDurationMinutes($wrapper, minDurationMinutes);
        const fixed = visibleStart + fixedMinutes;
        const floating = Math.max(visibleStart, Math.min(visibleEnd, visibleStart + floatingMinutes));
        const intervals = getHourSlotRulesAllowedIntervals($wrapper, day)
            .filter(interval => interval.end - interval.start >= minDuration);

        if (!intervals.length) {
            const startMinutes = edge === 'start'
                ? Math.min(floatingMinutes, fixedMinutes - minDuration)
                : fixedMinutes;
            const endMinutes = edge === 'start'
                ? fixedMinutes
                : Math.max(floatingMinutes, fixedMinutes + minDuration);

            return {
                startMinutes: Math.max(0, startMinutes),
                endMinutes: Math.min((settings.hourSlots.end - settings.hourSlots.start) * 60, endMinutes),
                canWork: false,
                clamped: false
            };
        }

        let interval = intervals.find(item => fixed >= item.start && fixed <= item.end);
        if (!interval) {
            interval = intervals
                .map(item => ({
                    interval: item,
                    distance: Math.min(Math.abs(fixed - item.start), Math.abs(fixed - item.end))
                }))
                .sort((a, b) => a.distance - b.distance)[0].interval;
        }

        let start;
        let end;
        const duration = normalizeAppointmentDurationMinutes(
            $wrapper,
            Math.min(Math.abs(floating - fixed), interval.end - interval.start),
            minDuration
        );
        if (edge === 'start') {
            end = Math.max(interval.start + duration, Math.min(fixed, interval.end));
            start = end - duration;
            if (start < interval.start) {
                start = interval.start;
                end = start + duration;
            }
        } else {
            start = Math.max(interval.start, Math.min(fixed, interval.end - duration));
            end = start + duration;
            if (end > interval.end) {
                end = interval.end;
                start = end - duration;
            }
        }

        return {
            startMinutes: start - visibleStart,
            endMinutes: end - visibleStart,
            canWork: end > start,
            clamped: start !== Math.min(fixed, floating) || end !== Math.max(fixed, floating)
        };
    }

    /**
     * Determines whether an appointment is editable.
     *
     * Appointments are editable by default. If the appointment is missing, or if it
     * does not explicitly define an `editable` property, the function returns true.
     *
     * The `editable` value may be provided as a boolean, number or string:
     *
     * - `false`, `0`, `"false"`, `"0"` and `"no"` are treated as not editable
     * - all other values are treated as editable
     *
     * String values are normalized before comparison by trimming whitespace and
     * converting them to lowercase. This allows values such as `" false "`,
     * `"FALSE"` or `"No"` to be interpreted correctly.
     *
     * @param {Object|null|undefined} appointment
     * The appointment object to check.
     *
     * @returns {boolean}
     * Returns true if the appointment should be editable, otherwise false.
     */
    function isAppointmentEditable(appointment) {
        if (!appointment || !appointment.hasOwnProperty('editable')) {
            return true;
        }

        const value = appointment.editable;

        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            return normalized !== 'false' && normalized !== '0' && normalized !== 'no';
        }

        return value !== false && value !== 0;
    }

    /**
     * Resolves whether an appointment should render in overlap mode (full-width stack).
     * Accepts boolean-like values from APIs (`true`, `"true"`, `1`, `"1"`).
     *
     * @param {Object|null|undefined} appointment - Appointment payload.
     * @return {boolean} True when overlap mode is enabled.
     */
    function isAppointmentOverlapEnabled(appointment) {
        if (!appointment || !appointment.hasOwnProperty('overlap')) {
            return false;
        }
        const value = appointment.overlap;
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            return normalized === 'true' || normalized === '1' || normalized === 'yes';
        }
        return value === true || value === 1;
    }

    function addAppointmentResizeHandles($wrapper, $appointmentElement, appointment, slotStart, slotEnd) {
        const settings = getSettings($wrapper);
        const view = getView($wrapper);
        if (!settings.draggable || appointment.allDay || !isAppointmentEditable(appointment) || (view !== 'day' && view !== 'week' && view !== '4day')) {
            return;
        }
        if (settings.appointmentRules && settings.appointmentRules.durationMinutes !== null) {
            return;
        }

        const startDate = slotStart instanceof Date ? slotStart : $.bsCalendar.utils.parseDateInput(slotStart);
        const endDate = slotEnd instanceof Date ? slotEnd : $.bsCalendar.utils.parseDateInput(slotEnd);
        const appointmentStart = $.bsCalendar.utils.parseDateInput(appointment.start);
        const appointmentEnd = $.bsCalendar.utils.parseDateInput(appointment.end);
        if (
            !startDate ||
            !endDate ||
            !appointmentStart ||
            !appointmentEnd ||
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime()) ||
            isNaN(appointmentStart.getTime()) ||
            isNaN(appointmentEnd.getTime())
        ) {
            return;
        }

        const startLocal = $.bsCalendar.utils.formatDateToDateString(startDate);
        const endLocal = $.bsCalendar.utils.formatDateToDateString(endDate);
        if (
            $.bsCalendar.utils.formatDateToDateString(appointmentStart) !== startLocal ||
            $.bsCalendar.utils.formatDateToDateString(appointmentEnd) !== endLocal
        ) {
            return;
        }

        const baseCss = {
            position: 'absolute',
            left: '50%',
            width: '24px',
            height: '18px',
            zIndex: 14,
            cursor: 'ns-resize',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transform: 'translateX(-50%)'
        };
        const lineCss = {
            position: 'absolute',
            left: '0',
            width: '24px',
            height: '3px',
            borderRadius: '999px',
            backgroundColor: 'currentColor',
            opacity: 0.55,
            pointerEvents: 'none'
        };

        $('<div>', {
            'data-appointment-resize': 'start',
            'aria-hidden': 'true',
            css: $.extend({}, baseCss, {top: '0'})
        }).append($('<span>', {css: $.extend({}, lineCss, {top: '4px'})})).appendTo($appointmentElement);

        $('<div>', {
            'data-appointment-resize': 'end',
            'aria-hidden': 'true',
            css: $.extend({}, baseCss, {bottom: '0'})
        }).append($('<span>', {css: $.extend({}, lineCss, {bottom: '4px'})})).appendTo($appointmentElement);
    }

    /**
     * Removes the currently active calendar info modal from the DOM and cleans up
     * any Bootstrap modal state associated with it.
     *
     * The function first checks whether the configured info modal exists. If it
     * does not exist, the cleanup is skipped immediately.
     *
     * If the modal exists, the function attempts to dispose the Bootstrap modal
     * instance before removing the element. Disposal clears Bootstrap-managed
     * instance data, event handlers and internal modal state. Any disposal errors
     * are intentionally ignored so that a missing, already-disposed or invalid
     * modal instance does not prevent DOM cleanup.
     *
     * After the modal element has been removed, the function checks whether any
     * other Bootstrap modal is still visible. If no other modal is open, it restores
     * the document body state by removing Bootstrap's "modal-open" class and
     * clearing modal-related inline styles such as overflow and padding-right.
     *
     * This prevents stale modal overlays, locked page scrolling or incorrect body
     * padding after the calendar info modal has been closed or forcefully removed.
     */
    function removeInfoWindowModal() {
        /**
         * Select the calendar info modal element.
         *
         * globalCalendarElements.infoModal is expected to contain the selector
         * or element reference for the currently active appointment/info modal.
         */
        const modal = $(globalCalendarElements.infoModal);

        /**
         * If no matching modal exists in the DOM, there is nothing to clean up.
         */
        if (!modal.length) {
            return;
        }

        try {
            /**
             * Dispose the Bootstrap modal instance before removing the element.
             *
             * This removes Bootstrap's internally registered event handlers,
             * stored data and modal-related instance state.
             *
             * The call is wrapped in a try/catch because the modal may already
             * be removed, not initialized as a Bootstrap modal, or otherwise not
             * have a valid modal instance attached.
             */
            modal.modal('dispose');
        } catch (ignore) {
            /**
             * Ignore disposal errors intentionally.
             *
             * The goal of this function is cleanup. A failed Bootstrap dispose
             * should not prevent the modal element from being removed from the DOM.
             */
        }

        /**
         * Remove the modal element from the DOM.
         */
        modal.remove();

        /**
         * Restore the body state if no other modal is currently open.
         *
         * Bootstrap adds the "modal-open" class and may also apply inline styles
         * such as overflow and padding-right while a modal is visible. These values
         * should only be cleared when there are no remaining visible modals.
         *
         * The current info modal is excluded from the check to avoid counting the
         * element that is currently being cleaned up.
         */
        if (!$('.modal.show').not(globalCalendarElements.infoModal).length) {
            $('body').removeClass('modal-open').css({
                overflow: '',
                paddingRight: ''
            });
        }
    }

    /**
     * Normalizes task priorities to the supported public values.
     *
     * @param {*} priority - Raw priority value from appointment.task.priority.
     * @return {string} One of `low`, `normal`, or `high`.
     */
    function normalizeTaskPriority(priority) {
        const normalized = typeof priority === 'string' ? priority.trim().toLowerCase() : '';
        return ['low', 'normal', 'high'].includes(normalized) ? normalized : 'normal';
    }

    function copyHourSlotRules(hourSlotRules) {
        if (hourSlotRules === null || hourSlotRules === undefined) {
            return null;
        }
        return $.extend(true, Array.isArray(hourSlotRules) ? [] : {}, hourSlotRules);
    }

    function getHourSlotRulesList(hourSlotRules) {
        if ($.bsCalendar.utils.isValueEmpty(hourSlotRules)) {
            return [];
        }

        const list = Array.isArray(hourSlotRules) ? hourSlotRules : [hourSlotRules];

        return list.filter(item => item && typeof item === 'object');
    }

    function getMatchingHourSlotRules(hourSlotRules, day, startTime, endTime = null) {
        const start = $.bsCalendar.utils.parseTimeToDecimal(startTime);
        const end = endTime === null ? null : $.bsCalendar.utils.parseTimeToDecimal(endTime);

        return getHourSlotRulesList(hourSlotRules).find(item => {
            if (!hourSlotRulesMatchesDay(item, day)) {
                return false;
            }

            if (end === null) {
                return hourSlotRulesContainsPoint(item, start);
            }

            return hourSlotRulesContainsRange(item, start, end);
        }) || null;
    }

    function getHourSlotRulesColors(hourSlotRules) {
        return $.bsCalendar.utils.getColors(
            hourSlotRules && hourSlotRules.color ? hourSlotRules.color : null,
            'rgba(0, 0, 0, 0.05)'
        );
    }

    function normalizeHourSlotRulesMode(mode) {
        const normalized = typeof mode === 'string' ? mode.trim().toLowerCase() : '';
        return ['exclusive', 'preferred', 'blocked'].includes(normalized) ? normalized : 'highlight';
    }

    function getHourSlotRulesTimeRange(hourSlotRules) {
        return {
            start: $.bsCalendar.utils.parseTimeToDecimal(hourSlotRules.startTime || '00:00'),
            end: $.bsCalendar.utils.parseTimeToDecimal(hourSlotRules.endTime || '23:59')
        };
    }

    function hourSlotRulesMatchesDay(hourSlotRules, day) {
        return Array.isArray(hourSlotRules.daysOfWeek)
            ? hourSlotRules.daysOfWeek.includes(day)
            : false;
    }

    function hourSlotRulesContainsPoint(hourSlotRules, point) {
        const range = getHourSlotRulesTimeRange(hourSlotRules);
        return point >= range.start && point < range.end;
    }

    function hourSlotRulesContainsRange(hourSlotRules, start, end) {
        const range = getHourSlotRulesTimeRange(hourSlotRules);
        return start >= range.start && end <= range.end;
    }

    function hourSlotRulesOverlapsRange(hourSlotRules, start, end) {
        const range = getHourSlotRulesTimeRange(hourSlotRules);
        return start < range.end && end > range.start;
    }

    function getDefaultHourSlotRulesAvailability() {
        return {
            canWork: true,
            mode: null,
            reason: 'available',
            range: null,
            inRange: false,
            isBlocked: false,
            isPreferred: false,
            isExclusive: false
        };
    }

    function evaluateHourSlotRulesAvailability(hourSlotRules, day, startTime, endTime) {
        const start = $.bsCalendar.utils.parseTimeToDecimal(startTime);
        const end = $.bsCalendar.utils.parseTimeToDecimal(endTime);
        const ranges = getHourSlotRulesList(hourSlotRules)
            .filter(item => hourSlotRulesMatchesDay(item, day));

        const availability = getDefaultHourSlotRulesAvailability();

        if (!ranges.length) {
            return availability;
        }

        const containedRanges = ranges.filter(item => hourSlotRulesContainsRange(item, start, end));
        const overlappingRanges = ranges.filter(item => hourSlotRulesOverlapsRange(item, start, end));
        const blockedRange = overlappingRanges.find(item => normalizeHourSlotRulesMode(item.mode) === 'blocked');

        if (blockedRange) {
            return {
                canWork: false,
                mode: 'blocked',
                reason: 'blocked',
                range: blockedRange,
                inRange: containedRanges.includes(blockedRange),
                isBlocked: true,
                isPreferred: false,
                isExclusive: false
            };
        }

        const exclusiveRanges = ranges.filter(item => normalizeHourSlotRulesMode(item.mode) === 'exclusive');
        const exclusiveRange = containedRanges.find(item => normalizeHourSlotRulesMode(item.mode) === 'exclusive');

        if (exclusiveRange) {
            return {
                canWork: true,
                mode: 'exclusive',
                reason: 'exclusive',
                range: exclusiveRange,
                inRange: true,
                isBlocked: false,
                isPreferred: false,
                isExclusive: true
            };
        }

        if (exclusiveRanges.length) {
            return {
                canWork: false,
                mode: 'exclusive',
                reason: 'outsideExclusive',
                range: null,
                inRange: false,
                isBlocked: false,
                isPreferred: false,
                isExclusive: true
            };
        }

        const preferredRange = containedRanges.find(item => normalizeHourSlotRulesMode(item.mode) === 'preferred');

        if (preferredRange) {
            return {
                canWork: true,
                mode: 'preferred',
                reason: 'preferred',
                range: preferredRange,
                inRange: true,
                isBlocked: false,
                isPreferred: true,
                isExclusive: false
            };
        }

        if (containedRanges.length) {
            return {
                canWork: true,
                mode: normalizeHourSlotRulesMode(containedRanges[0].mode),
                reason: 'highlighted',
                range: containedRanges[0],
                inRange: true,
                isBlocked: false,
                isPreferred: false,
                isExclusive: false
            };
        }

        return availability;
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
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const view = data.view;
        const now = new Date();

        /**
         * Cache the currently visible date range for the active view.
         *
         * This range is later used to determine whether individual appointment
         * dates are visible in week-like views such as day, 4-day or week view.
         */
        const viewRangeCached = getStartAndEndDateByView($wrapper);

        if (view === 'year') {
            /**
             * In year view, appointments only need a reduced set of metadata.
             *
             * Since the year view usually displays appointments in a compact,
             * date-based way, time ranges, durations and display date segments
             * are not calculated here.
             */
            appointments.forEach(appointment => {
                const date = $.bsCalendar.utils.parseDateInput(appointment.date);

                appointment.extras = {
                    /**
                     * Resolved color configuration for the appointment.
                     *
                     * If the appointment has its own color, that color is used.
                     * Otherwise, the calendar's main color is used as fallback.
                     */
                    colors: $.bsCalendar.utils.getColors(
                        appointment.color || settings.mainColor,
                        settings.mainColor
                    ),

                    /**
                     * Indicates whether the appointment date is today.
                     */
                    isToday: date.toDateString() === now.toDateString(),

                    /**
                     * Indicates whether the appointment belongs to the currently
                     * displayed year.
                     *
                     * In year view this is used as a broader "current period"
                     * marker rather than a real-time "is happening now" check.
                     */
                    isNow: date.getFullYear() === now.getFullYear()
                };
            });
        } else {
            /**
             * In all non-year views, appointments require extended metadata.
             *
             * This includes normalized start/end values, icon and color data,
             * duration information, visible display dates, task state and
             * hour-slot-rules detection.
             */
            appointments.forEach(appointment => {
                const start = $.bsCalendar.utils.parseDateInput(appointment.start);
                const end = $.bsCalendar.utils.parseDateInput(appointment.end);
                const isAllDay = appointment.allDay;

                /**
                 * Normalize the appointment start and end dates into date strings.
                 *
                 * These values are used for rendering and for date-based
                 * comparisons independent from the original input format.
                 */
                const startDate = $.bsCalendar.utils.formatDateToDateString(appointment.start);
                const endDate = $.bsCalendar.utils.formatDateToDateString(appointment.end);

                /**
                 * Normalize the appointment start and end times.
                 *
                 * All-day appointments are internally represented as covering the
                 * complete day from 00:00:00 to 23:59:59.
                 */
                const startTime = isAllDay
                    ? '00:00:00'
                    : $.bsCalendar.utils.formatTime(appointment.start);

                const endTime = isAllDay
                    ? '23:59:59'
                    : $.bsCalendar.utils.formatTime(appointment.end);

                /**
                 * Determine the default appointment icon.
                 *
                 * Timed appointments and all-day appointments may use different
                 * default icons. A custom appointment.icon overrides both.
                 */
                let iconClass = !isAllDay
                    ? settings.icons.appointment
                    : settings.icons.appointmentAllDay;

                if (appointment.hasOwnProperty('icon') && appointment.icon) {
                    iconClass = appointment.icon;
                }

                /**
                 * Initialize the appointment extras object.
                 *
                 * The extras object contains all derived information required by
                 * the rendering layer. Keeping this data precomputed avoids
                 * repeating date, time and state calculations inside the templates.
                 */
                const extras = {
                    /**
                     * Locale used for localized rendering or formatting.
                     */
                    locale: settings.locale,

                    /**
                     * Final icon class used for this appointment.
                     */
                    icon: iconClass,

                    /**
                     * Resolved appointment color information with calendar-level
                     * fallback support.
                     */
                    colors: $.bsCalendar.utils.getColors(
                        appointment.color,
                        settings.mainColor
                    ),

                    /**
                     * Normalized start information used for rendering.
                     */
                    start: {
                        date: startDate,
                        time: startTime
                    },

                    /**
                     * Normalized end information used for rendering.
                     */
                    end: {
                        date: endDate,
                        time: endTime
                    },

                    /**
                     * Duration object.
                     *
                     * The numeric values are filled later after the appointment's
                     * total length has been calculated.
                     */
                    duration: {
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        totalMinutes: 0,
                        totalSeconds: 0,
                        seconds: 0
                    },

                    /**
                     * Availability metadata derived from hourSlots.rules.
                     *
                     * Modes:
                     * - blocked: overlapping appointments cannot be worked.
                     * - exclusive: appointments can only be worked when fully inside the range.
                     * - preferred: appointments can be worked and are marked as preferred.
                     * - highlight/default: visual highlight only.
                     */
                    hourSlotRules: getDefaultHourSlotRulesAvailability(),

                    /**
                     * Contains one entry per calendar day touched by this appointment.
                     *
                     * Multi-day appointments are split into display-date segments
                     * so each day can be rendered with the correct visible start
                     * and end time.
                     */
                    displayDates: [],

                    /**
                     * Indicates whether this appointment is an all-day appointment.
                     */
                    allDay: isAllDay,

                    /**
                     * Indicates whether the appointment fits into a single day.
                     *
                     * This value is recalculated after displayDates has been built.
                     */
                    inADay: false,

                    /**
                     * Indicates whether the appointment starts today.
                     */
                    isToday: start.toDateString() === now.toDateString(),

                    /**
                     * Indicates whether the appointment is currently active.
                     *
                     * This is true if the current time lies between the appointment's
                     * start and end timestamps.
                     */
                    isNow: start <= now && end >= now,

                    /**
                     * Recurrence metadata for generated occurrences.
                     *
                     * Source data keeps the `recurrence` rule on the appointment.
                     * Rendered occurrence instances expose their relationship here.
                     */
                    recurrence: getRecurrenceExtras(appointment)
                };

                /**
                 * Evaluate whether the appointment is affected by one configured
                 * hourSlots.rules range.
                 *
                 * Expected hourSlots.rules item structure:
                 *
                 * {
                 *   daysOfWeek: [1, 2, 3, 4, 5],
                 *   startTime: "09:00",
                 *   endTime: "17:00",
                 *   mode: "exclusive",
                 *   color: "primary"
                 * }
                 *
                 * The same object can also be provided as an array of objects.
                 *
                 * daysOfWeek uses JavaScript weekday numbers:
                 * 0 = Sunday
                 * 1 = Monday
                 * 2 = Tuesday
                 * 3 = Wednesday
                 * 4 = Thursday
                 * 5 = Friday
                 * 6 = Saturday
                 *
                 * The mode-aware work decision is exposed via
                 * `extras.hourSlotRules.canWork`.
                 */
                if (!isAllDay && !$.bsCalendar.utils.isValueEmpty(data.settings.hourSlots.rules)) {
                    const date = new Date(startDate);
                    const day = date.getDay();
                    const hourSlotRulesAvailability = evaluateHourSlotRulesAvailability(
                        data.settings.hourSlots.rules,
                        day,
                        startTime,
                        endTime
                    );
                    extras.hourSlotRules = hourSlotRulesAvailability;
                }

                /**
                 * Apply task-specific metadata and icon overrides.
                 *
                 * If the appointment represents a task, its priority is normalized,
                 * its overdue state is calculated and the icon is replaced depending
                 * on the task status.
                 */
                if (appointment.task) {
                    appointment.task.priority = normalizeTaskPriority(appointment.task.priority);

                    const dueDate = appointment.task.due
                        ? $.bsCalendar.utils.parseDateInput(appointment.task.due)
                        : null;

                    /**
                     * A task is overdue when it is unchecked and its due date is
                     * earlier than the current date/time.
                     */
                    appointment.task.isOverdue = !appointment.task.checked && dueDate && dueDate < now;

                    /**
                     * Task icons have priority over regular appointment icons.
                     */
                    extras.icon = appointment.task.checked
                        ? settings.icons.taskDone
                        : (
                            appointment.task.isOverdue
                                ? settings.icons.taskOverdue
                                : settings.icons.task
                        );
                }

                /**
                 * Prepare date-only cursor values for iterating through every
                 * calendar day touched by this appointment.
                 *
                 * The time is reset to midnight so comparisons are based on days,
                 * not on exact timestamps.
                 */
                let tempDate = new Date(start);
                let tempEnd = new Date(end);

                tempDate.setHours(0, 0, 0, 0);
                tempEnd.setHours(0, 0, 0, 0);

                /**
                 * Calculate the visible month grid boundaries.
                 *
                 * Month views often show leading and trailing days from adjacent
                 * months in order to render complete weeks. These boundaries define
                 * that extended visible month range.
                 */
                const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                /**
                 * Determine the first weekday of the calendar grid.
                 *
                 * Depending on the settings, weeks can start either on Sunday or
                 * Monday.
                 */
                const firstDayOffset = settings.startWeekOnSunday ? 0 : 1;

                /**
                 * Calculate the first visible day in the month grid.
                 *
                 * This may be a day from the previous month if the first day of the
                 * current month does not align with the configured week start.
                 */
                const monthStart = new Date(firstOfMonth);
                monthStart.setDate(
                    firstOfMonth.getDate() -
                    ((firstOfMonth.getDay() - firstDayOffset + 7) % 7)
                );

                /**
                 * Calculate the last visible day in the month grid.
                 *
                 * This may be a day from the next month so the last displayed week
                 * is complete.
                 */
                const monthEnd = new Date(lastOfMonth);
                monthEnd.setDate(
                    lastOfMonth.getDate() +
                    (6 - (lastOfMonth.getDay() - firstDayOffset + 7) % 7)
                );

                /**
                 * Normalize the active view range.
                 *
                 * The start is set to the beginning of the day and the end is set
                 * to the end of the day to make day-based visibility checks reliable.
                 */
                const viewRange = viewRangeCached;
                const viewRangeStart = new Date(viewRange.start);
                const viewRangeEnd = new Date(viewRange.end);

                viewRangeStart.setHours(0, 0, 0, 0);
                viewRangeEnd.setHours(23, 59, 59, 999);

                /**
                 * Build one display-date entry for each day covered by the appointment.
                 *
                 * This allows multi-day appointments to be rendered correctly on
                 * each individual day, with adjusted start and end times per segment.
                 */
                while (tempDate <= tempEnd) {
                    /**
                     * Determine whether the current segment is the first or last
                     * day of the appointment.
                     */
                    const dateIsStart = $.bsCalendar.utils.datesAreEqual(tempDate, start);
                    const dateIsEnd = $.bsCalendar.utils.datesAreEqual(tempDate, end);

                    /**
                     * Initialize the display metadata for the current day segment.
                     */
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

                    /**
                     * Assign segment-specific start and end times.
                     *
                     * All-day appointments do not need explicit segment times.
                     *
                     * Timed appointments are split as follows:
                     * - first day: actual start time until either actual end time
                     *   or 23:59 if the appointment continues
                     * - last day: 00:00 until actual end time
                     * - intermediate days: 00:00 until 23:59
                     */
                    if (isAllDay) {
                        dateDetails.times.start = null;
                        dateDetails.times.end = null;
                    } else {
                        if (dateIsStart) {
                            dateDetails.times.start = $.bsCalendar.utils.formatTime(start);
                            dateDetails.times.end = end > new Date(tempDate).setHours(23, 59, 59, 999)
                                ? '23:59'
                                : $.bsCalendar.utils.formatTime(end);
                        } else if (dateIsEnd) {
                            dateDetails.times.start = '00:00';
                            dateDetails.times.end = $.bsCalendar.utils.formatTime(end);
                        } else {
                            dateDetails.times.start = '00:00';
                            dateDetails.times.end = '23:59';
                        }
                    }

                    /**
                     * Mark whether this day segment is visible in the extended
                     * month grid.
                     */
                    if (tempDate >= monthStart && tempDate <= monthEnd) {
                        dateDetails.visibleInMonth = true;
                    }

                    /**
                     * Mark whether this day segment is visible in the active
                     * week-like view range.
                     */
                    if (tempDate >= viewRangeStart && tempDate <= viewRangeEnd) {
                        dateDetails.visibleInWeek = true;
                    }

                    extras.displayDates.push(dateDetails);

                    /**
                     * Move to the next calendar day.
                     */
                    tempDate.setDate(tempDate.getDate() + 1);
                }

                /**
                 * Indicates whether the appointment is contained within exactly
                 * one calendar day.
                 */
                extras.inADay = extras.displayDates.length === 1;

                /**
                 * Calculate the total appointment duration in milliseconds.
                 */
                const diffMillis = end - start;

                if (appointment.allDay) {
                    /**
                     * Calculate the duration of all-day appointments by calendar days.
                     *
                     * For all-day events, the number of days is based only on the
                     * date portion, independent from the exact start and end times.
                     *
                     * The final day is included, so an appointment from Monday to
                     * Monday counts as one day, not zero days.
                     */
                    const startDate = new Date(
                        start.getFullYear(),
                        start.getMonth(),
                        start.getDate()
                    );

                    const endDate = new Date(
                        end.getFullYear(),
                        end.getMonth(),
                        end.getDate()
                    );

                    const diffDaysMillis = endDate - startDate;

                    extras.duration.days = Math.floor(diffDaysMillis / (24 * 3600 * 1000)) + 1;
                    extras.duration.hours = 0;
                    extras.duration.minutes = 0;
                    extras.duration.totalMinutes = Math.floor(diffMillis / (60 * 1000));
                    extras.duration.totalSeconds = Math.floor(diffMillis / 1000);
                    extras.duration.seconds = 0;
                } else {
                    /**
                     * Calculate the duration of timed appointments based on the exact
                     * timestamp difference between start and end.
                     */
                    const totalSeconds = Math.floor(diffMillis / 1000);

                    extras.duration.days = Math.floor(totalSeconds / (24 * 3600));
                    extras.duration.hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
                    extras.duration.minutes = Math.floor((totalSeconds % 3600) / 60);
                    extras.duration.totalSeconds = totalSeconds;
                    extras.duration.totalMinutes = Math.round(totalSeconds / 60);
                    extras.duration.seconds = totalSeconds % 60;
                }

                /**
                 * Create a formatted duration string using the configured formatter.
                 *
                 * This keeps formatting customizable while the duration calculation
                 * itself remains centralized here.
                 */
                extras.duration.formatted = settings.formatter.duration(extras.duration);

                /**
                 * Recalculate the single-day flag after all display dates have been
                 * finalized.
                 */
                extras.inADay = extras.displayDates.length === 1;

                /**
                 * Attach the computed metadata to the appointment.
                 */
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
        const data = getBsCalendarData($wrapper);
        methods.clear($wrapper, false);

        const settings = data.settings;

        let appointments = data.appointments;

        const isSearchMode = data.searchMode;

        const view = data.view;
        const container = getViewContainer($wrapper);
        if (settings.debug) {
            log('Call renderData with view:', view);
        }

        switch (view) {
            case 'day':
            case '4day':
            case 'week':
                drawAppointmentsForDayOrWeek($wrapper, appointments);
                break;
            case 'agenda':
                drawAppointmentsForAgenda($wrapper, appointments);
                break;
            case 'month':
                drawAppointmentsForMonth($wrapper, appointments);
                break;
            case 'year':
                drawAppointmentsForYear($wrapper, appointments);
                break;
        }
        if (!isSearchMode && view !== 'agenda') {
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
        const data = getBsCalendarData($wrapper);
        // Reentrancy-Guard: verhindert doppeltes Laden innerhalb eines Build-Zyklus
        if (data.loadingHolidays) {
            return;
        }
        data.loadingHolidays = true;
        setBsCalendarData($wrapper, data);

        const settings = data.settings;
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
                    data.loadingHolidays = false;
                    setBsCalendarData($wrapper, data);
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
                    data.loadingHolidays = false;
                    setBsCalendarData($wrapper, data);
                });
        } else {
            // nothing to load → clean up flag
            data.loadingHolidays = false;
            setBsCalendarData($wrapper, data);
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
        const isDayOrWeek = view === 'day' || view === 'week' || view === '4day';
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
            const startDate = $.bsCalendar.utils.parseDateInput(holiday.startDate);
            const endDate = $.bsCalendar.utils.parseDateInput(holiday.endDate);

            // Loop through each date from startDate to endDate
            for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                // Format the current date as local "YYYY-MM-DD" (timezone-safe)
                const formattedDate = $.bsCalendar.utils.formatDateToDateString(date);
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
                        if (container.is(':empty') && (view === 'day' || view === 'week' || view === '4day')) {
                            container.addClass('pb-3');
                        }
                        const $holidayWrapper = $('<small>', {
                            'data-role': 'holiday',
                            class: 'px-1  overflow-hidden mb-1 rounded w-100',
                        }).prependTo(container);
                        $(settings.formatter.holiday(holiday, view)).appendTo($holidayWrapper);
                    } else {
                        // Year view: Mark the existing day container instead of adding a removable element
                        container.addClass('text-secondary wc-holiday-marked');
                        container.attr('data-bs-calendar-tooltip', '1');
                        initBootstrapTooltip(container, {
                            title: holiday.title,
                            container: $wrapper,
                            customClass: 'wc-calendar-tooltip'
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
    /**
     * Renders and displays appointments for an entire year by updating the DOM with appointment details.
     */
    function drawAppointmentsForYear($wrapper, appointments) {
        const settings = getSettings($wrapper);
        const $container = getViewContainer($wrapper);
        appointments.forEach(appointment => {
            const $badge = $container.find(`[data-date="${appointment.date}"] .js-badge`);
            const tooltipText = Object.prototype.hasOwnProperty.call(appointment, 'content')
                ? String(appointment.content ?? '')
                : String(appointment.total ?? '');
            const popoverTitleDate = $.bsCalendar.utils.parseDateInput(appointment.date);
            const popoverTitle = isNaN(popoverTitleDate?.getTime?.())
                ? ''
                : popoverTitleDate.toLocaleDateString(settings.locale, {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });

            // 1. Farben setzen
            const bg = appointment.extras.colors.backgroundColor;
            $badge.css({
                backgroundColor: bg,
                color: '#ffffff'
            });

            // 2. Styles erzwingen (Sichtbarkeit, Flexbox, Größe)
            $badge.css({
                'width': '14px',
                'height': '14px',
                // 'z-index': '13',
                'font-size': '9px',
                'display': 'flex',
                'justify-content': 'center',
                'align-items': 'center',
                'border-radius': '50%',
                'border-style': 'solid',
                'border-width': '0px',
                'box-sizing': 'border-box',
                'overflow': 'hidden',
                'line-height': '1'
            });

            // 3. Wert setzen
            $badge.text(appointment.total);

            // FIX: Tooltip korrekt initialisieren
            // Wir setzen den Title auf das Parent-Div (den Tag-Kreis), nicht auf den Badge.
            const $target = $badge.closest('div');
            $target.removeAttr('data-bs-calendar-tooltip data-bs-calendar-popover title data-bs-content data-bs-original-title aria-describedby');

            $target.attr('data-bs-calendar-popover', '1');
            initBootstrapPopover($target, {
                title: popoverTitle,
                content: tooltipText,
                container: $wrapper,
                customClass: 'wc-calendar-tooltip',
                trigger: 'hover focus',
                html: true
            });
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
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;

        // Use a clone of the stored date to avoid accidental external mutation
        const rawDate = data.date;
        const date = rawDate instanceof Date ? new Date(rawDate.getTime()) : new Date(rawDate);
        const view = data.view;

        // Work on copies to avoid accidental mutation of the stored date
        const startDate = new Date(date.getTime());
        const endDate = new Date(date.getTime());

        switch (view) {
            case "day":
                // nothing to change
                break;
            case "4day": {
                const newEnd = new Date(startDate.getTime());
                newEnd.setDate(startDate.getDate() + 3);
                endDate.setTime(newEnd.getTime());

                if (settings.debug) {
                    log("getStartAndEndDateByView (4day) computed:", {
                        viewDate: $.bsCalendar.utils.formatDateToDateString(date),
                        start: $.bsCalendar.utils.formatDateToDateString(startDate),
                        end: $.bsCalendar.utils.formatDateToDateString(endDate)
                    });
                }
                break;
            }
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
            case "agenda":
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
            case "search": {
                startDate.setMonth(0);
                startDate.setDate(1);
                endDate.setMonth(11);
                endDate.setDate(31);
            }
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

    function buildAgendaView($wrapper) {
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const container = getViewContainer($wrapper);
        data.agendaSearchTerm = '';
        setBsCalendarData($wrapper, data);
        const searchTerm = '';
        container.empty();

        const $searchWrapper = $('<div>', {
            class: 'wc-agenda-search px-3 py-2 bg-body rounded-pill mb-1'
        }).appendTo(container);

        const $inputGroup = $('<div>', {
            class: 'input-group input-group-sm'
        }).appendTo($searchWrapper);

        $('<span>', {
            class: 'input-group-text bg-body border-0',
            html: `<i class="${settings.icons.search}"></i>`
        }).appendTo($inputGroup);

        $('<input>', {
            type: 'search',
            class: 'form-control border-0',
            'data-agenda-search-input': true,
            placeholder: settings.translations.search,
            value: searchTerm
        }).appendTo($inputGroup);

        $('<button>', {
            type: 'button',
            class: 'btn border-0',
            'data-agenda-search-clear': true,
            'aria-label': settings.translations.searchClear || 'Clear search',
            html: '<i class="bi bi-x-lg"></i>',
            css: {
                display: searchTerm ? '' : 'none'
            }
        }).appendTo($inputGroup);

        $('<div>', {
            'data-agenda-container': true,
            class: 'wc-agenda-container overflow-auto bg-body',
            css: {
                minHeight: '100%',
                fontSize: '.92rem'
            }
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
        const data = getBsCalendarData($wrapper);
        const mainColor = data.mainColor;
        const container = getViewContainer($wrapper);
        const settings = data.settings;
        const date = data.date;

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

        container.empty();

        const weekDays = $.bsCalendar.utils.getShortWeekDayNames(locale, startWeekOnSunday);

        // --- TABLE STRUCTURE ---
        // border-collapse: collapse ist wichtig, damit Border-Logiken sauber greifen (keine doppelten Linien)
        const table = $('<table>', {
            class: 'table m-0 p-0  w-100',
            css: {
                tableLayout: 'fixed',
                borderCollapse: 'collapse',
                borderSpacing: '0'
            }
        }).appendTo(container);

        const tbody = $('<tbody>').appendTo(table);

        // --- BODY RENDERING ---
        let currentDate = new Date(calendarStart);
        let isFirstRow = true;

        while (currentDate <= calendarEnd) {
            // Exakte Prüfung für die letzte Zeile (für border-bottom)
            const checkDate = new Date(currentDate);
            checkDate.setDate(checkDate.getDate() + 6);
            const isLastRow = checkDate.getTime() >= (calendarEnd.getTime() - 43200000);

            const tr = $('<tr>', {
                class: 'wc-calendar-content'
            }).appendTo(tbody);

            // --- Kalenderwoche (1. Spalte) ---
            const calendarWeek = $.bsCalendar.utils.getCalendarWeek(currentDate);

            // Padding-Logik aus dem Original: 1. Zeile hat mehr Padding oben, um den Wochentagsnamen auszugleichen
            const paddingTop = isFirstRow ? '1.75rem' : '.15rem';

            // Borders für KW: Immer Oben und Links. Unten nur bei der letzten Zeile.
            // border-collapse kümmert sich darum, dass es nicht doppelt wird.
            let kwClasses = 'align-top bg-body-tertiary text-muted fw-bold text-center border-top border-start';
            if (isLastRow) kwClasses += ' border-bottom';

            const weekColumn = $('<td>', {
                class: kwClasses,
                css: {
                    verticalAlign: 'top',
                    paddingTop: paddingTop,
                    width: '30px' // Minimale Breite
                },
                html: `<small>${calendarWeek}</small>`,
            }).appendTo(tr);

            // If "week" is allowed in the views, make the column clickable
            if (settings.views.includes('week')) {
                weekColumn
                    .attr('data-week-date', $.bsCalendar.utils.formatDateToDateString(currentDate))
                    .css('cursor', 'pointer');
            }

            // --- Die 7 Tage ---
            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const isLastColumn = i === 6;

                // Border Logik
                let borderClasses = ['border-top', 'border-start'];
                if (isLastColumn) borderClasses.push('border-end');
                if (isLastRow) borderClasses.push('border-bottom');

                let dayCss = [
                    'border-radius: 50%',
                    'width: 24px',
                    'height: 24px',
                    'line-height: 24px',
                    'font-size: 12px',
                    'cursor: pointer',
                ];
                if (isToday) {
                    dayCss.push(`background-color: ${mainColor.backgroundColor}`);
                    dayCss.push(`background-image: ${mainColor.backgroundImage}`);
                    dayCss.push(`color: ${mainColor.color}`);
                }

                // Die Zelle (TD)
                const td = $('<td>', {
                    'data-month-date': $.bsCalendar.utils.formatDateToDateString(currentDate),
                    class: `align-top px-1 py-0 ${borderClasses.join(' ')} ${
                        isOtherMonth ? 'text-muted bg-body-tertiary' : 'bg-body'
                    }`,
                    css: {
                        verticalAlign: 'top',
                        overflow: 'hidden',
                        position: 'relative' // Wichtig für absolute Positionierung darin, falls nötig
                    }
                }).appendTo(tr);

                // Wrapper für den Inhalt der Zelle
                const contentWrapper = $('<div>', {
                    class: 'd-flex flex-column w-100 h-100'
                }).appendTo(td);

                // 1. Wochentags-Name (Nur in der ersten Zeile, IN der Zelle)
                if (isFirstRow) {
                    $('<div>', {
                        class: 'text-center text-uppercase fw-bold text-body-secondary small pt-1 user-select-none pe-none',
                        css: {lineHeight: '16px', fontSize: '10px'},
                        text: weekDays[i]
                    }).appendTo(contentWrapper);
                }

                // 2. Tag-Nummer
                $('<small>', {
                    'data-date': $.bsCalendar.utils.formatDateToDateString(currentDate),
                    class: `text-center my-1 align-self-center`,
                    style: dayCss.join(';'),
                    text: currentDate.getDate(),
                }).appendTo(contentWrapper);

                // 3. Innerer Container für Termine
                $('<div>', {
                    class: 'd-flex flex-column w-100 flex-fill',
                    'data-role': 'day-wrapper',
                    css: {
                        overflowY: 'auto',
                        minHeight: 0
                    }
                }).appendTo(contentWrapper);

                currentDate.setDate(currentDate.getDate() + 1);
            }

            isFirstRow = false;
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
        const data = getBsCalendarData($wrapper);
        const view = data.view;
        const windowWidth = $(window).width();
        const mdBreakPoint = 768;
        const lgBreakPoint = 992;
        const calendarContainer = getViewContainer($wrapper);

        if (handleSidebar) {
            handleSidebarVisibility($wrapper, windowWidth < lgBreakPoint, windowWidth >= lgBreakPoint);
        }


        if (view === 'month') {

            const dayElements = calendarContainer.find('[data-month-date]');
            const rowCount = Math.ceil(dayElements.length / 7); // Anzahl der Zeilen
            const minMonthCellHeight = windowWidth < mdBreakPoint && rowCount > 0
                ? Math.max(88, Math.min(132, Math.floor(($(window).height() * 0.82) / rowCount)))
                : 0;

            // Keep desktop month cells square, but give mobile enough height for day content.
            let dayHeight = 0;
            dayElements.each(function () {
                const width = $(this).outerWidth(); // width of the element
                const height = Math.max(width, minMonthCellHeight);
                $(this).css('height', `${height}px`); // set height
                dayHeight = height; // save the height for the later calculation
            });

            // set dynamic container height
            const totalHeight = rowCount * dayHeight; // Gesamthöhe berechnen
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
        const data = getBsCalendarData($wrapper);
        const mainColor = data.mainColor;
        const settings = data.settings;
        const date = forDate;
        const activeDate = data.date;
        const {startWeekOnSunday} = settings;

        const cellSize = forYearView ? 36 : 28;
        const fontSize = forYearView ? 13 : 11;
        const weekRowWidth = 24;

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

        $container.empty();
        $container.addClass('d-flex justify-content-center p-1 bg-body');

        const totalWidth = (cellSize * 7) + weekRowWidth;

        const table = $('<table>', {
            class: 'table table-borderless m-0 p-0 text-center user-select-none',
            css: {
                width: `${totalWidth}px`,
                minWidth: `${totalWidth}px`,
                fontSize: fontSize + 'px',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                lineHeight: cellSize + 'px',
                margin: '0 auto'
            },
        }).appendTo($container);

        const thead = $('<thead>').appendTo(table);
        const weekdaysRow = $('<tr>', {css: {height: `${cellSize}px`}}).appendTo(thead);

        $('<th>', {class: 'p-0', css: {width: weekRowWidth + 'px'}, text: ''}).appendTo(weekdaysRow);

        const weekDays = $.bsCalendar.utils.getShortWeekDayNames(settings.locale, settings.startWeekOnSunday);
        weekDays.forEach(day => {
            $('<th>', {
                text: day.substring(0, 2),
                class: 'text-body-secondary fw-normal p-0 user-select-none pe-none',
                css: {width: `${cellSize}px`, verticalAlign: 'middle'}
            }).appendTo(weekdaysRow);
        });

        const tbody = $('<tbody>').appendTo(table);
        let currentDate = new Date(calendarStart);

        while (currentDate <= calendarEnd) {
            const weekRow = $('<tr>', {css: {height: `${cellSize}px`}}).appendTo(tbody);

            const calendarWeek = $.bsCalendar.utils.getCalendarWeek(currentDate);
            const weekColumn = $('<td>', {
                class: 'text-body-tertiary p-0 align-middle small',
                css: {fontSize: (fontSize - 3) + 'px', width: weekRowWidth + 'px'},
                text: calendarWeek,
            }).appendTo(weekRow);

            // If "week" is allowed in the views, make the column clickable
            if (settings.views.includes('week')) {
                weekColumn
                    .attr('data-week-date', $.bsCalendar.utils.formatDateToDateString(currentDate))
                    .css('cursor', 'pointer');
            }

            for (let i = 0; i < 7; i++) {
                const isToday = currentDate.toDateString() === new Date().toDateString();
                const isOtherMonth = currentDate.getMonth() !== month;
                const isSelected = currentDate.toDateString() === activeDate.toDateString();

                let dayClass = 'rounded-circle d-inline-flex align-items-center justify-content-center transition-base';
                let dayStyles = {
                    width: (cellSize - 4) + 'px',
                    height: (cellSize - 4) + 'px',
                    margin: '2px auto',
                    position: 'relative'
                };

                if (isToday) {
                    dayStyles.backgroundColor = mainColor.backgroundColor;
                    dayStyles.backgroundImage = mainColor.backgroundImage;
                    dayStyles.color = mainColor.color;
                    dayStyles.fontWeight = '600';
                    dayClass += ' shadow-sm';
                } else if (isSelected) {
                    dayStyles.boxShadow = `inset 0 0 0 2px ${mainColor.backgroundColor}`;
                    dayStyles.color = 'var(--bs-body-color)';
                    dayStyles.fontWeight = '600';
                } else if (isOtherMonth) {
                    dayClass += ' text-body-tertiary'; // opacity-50 removed
                } else {
                    dayClass += ' hover-bg-body-secondary';
                }

                const $cellContent = $('<div>', {
                    class: dayClass,
                    css: dayStyles,
                    html: `<span>${currentDate.getDate()}</span>`
                });
                if (forYearView) {
                    $('<span>', {
                        // Nur Positionierung, KEINE Border, KEINE Badge-Klasse hier!
                        class: 'js-badge position-absolute top-100 start-50 translate-middle z-1',
                        css: {
                            display: 'none' // Garantiert unsichtbar
                        }
                    }).appendTo($cellContent);
                }

                $('<td>', {
                    'data-date': $.bsCalendar.utils.formatDateToDateString(currentDate),
                    class: 'p-0 align-middle position-relative',
                    css: {cursor: 'pointer'}
                }).append($cellContent).appendTo(weekRow);

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
        const settings = getSettings($wrapper);

        const headerRow = $('<div>', {
            class: 'position-relative px-1 px-lg-5'
        }).appendTo($container);
        appendUtcOffsetHeaderLabel(headerRow, date);

        const headerContent = $('<div>', {
            css: {
                paddingLeft: '40px'
            }
        }).appendTo(headerRow);

        // Create the headline for the day's header
        const headline = $('<div>', {
            class: 'wc-day-header mb-2',
            html: buildHeaderForDay($wrapper, date, false)
        }).appendTo(headerContent);

        // Set data attributes for the headline and change the cursor to a pointer
        headline.attr('data-date', $.bsCalendar.utils.formatDateToDateString(date)).css('cursor', 'pointer');

        // Append a div for all-day events or metadata
        $('<div>', {
            'data-all-day': date.getDay(),
            'data-date-local': $.bsCalendar.utils.formatDateToDateString(date),
        }).appendTo(headerContent);

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
        const data = getBsCalendarData($wrapper);
        const is4Day = data.view === '4day';
        const dayCount = is4Day ? 4 : 7;

        // empty container (remove the old content)
        $viewContainer.empty();

        const $container = $('<div>', {
            class: 'position-relative px-1 px-lg-5'
        }).appendTo($viewContainer);

        const date = getDate($wrapper);
        const settings = getSettings($wrapper);
        const {startWeekOnSunday} = settings;
        const currentDay = date.getDay();

        let startOfWeek;
        if (is4Day) {
            startOfWeek = new Date(date);
        } else {
            startOfWeek = new Date(date);
            const startOffset = startWeekOnSunday ? currentDay : currentDay === 0 ? 6 : currentDay - 1;
            startOfWeek.setDate(date.getDate() - startOffset);
        }

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + (dayCount - 1));

// DEBUG: Ausgabe des berechneten Wochenbereichs
        if (settings.debug) {
            log(`buildWeekView - viewDate=${$.bsCalendar.utils.formatDateToDateString(date)}, startOfWeek=${$.bsCalendar.utils.formatDateToDateString(startOfWeek)}, endOfWeek=${$.bsCalendar.utils.formatDateToDateString(endOfWeek)}, startWeekOnSunday=${startWeekOnSunday}`);
        }

        const wrappAllDay = $('<div>', {
            class: 'd-flex flex-nowrap flex-fill w-100 position-relative',
            css: {paddingLeft: "40px"}
        }).appendTo($container);
        appendUtcOffsetHeaderLabel(wrappAllDay, startOfWeek);


        for (let day = 0; day < dayCount; day++) {
            const col = $('<div>', {
                class: 'flex-grow-1 d-flex flex-column jusify-content-center align-items-center flex-fill position-relative overflow-hidden',
                css: {
                    // minHeight:'133px',
                    width: (100 / dayCount) + '%' // Fixe Breite für Spalten
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
                css: {
                    minHeight: 0,
                    // width: (100 / dayCount) + '%' // Fixe Breite für Spalten
                },
                'data-all-day': currentDate.getDay(),
                'data-date-local': $.bsCalendar.utils.formatDateToDateString(currentDate),
                class: 'd-flex flex-column align-items-stretch w-100',
            }).appendTo(col);
        }
        ////////

        // Create a weekly view as a flexible layout
        const weekContainer = $('<div>', {
            class: 'wc-week-view d-flex flex-nowrap',
            css: {paddingLeft: '40px'}
        }).appendTo($container);


        // iteration over the days of the week (from starting day to end day)
        for (let day = 0; day < dayCount; day++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + day); // calculate the next day

            // Create day container
            const dayContainer = $('<div>', {
                'data-week-day': currentDate.getDay(),
                'data-date-local': $.bsCalendar.utils.formatDateToDateString(currentDate),
                class: 'wc-day-week-view flex-grow-1 flex-fill border-end position-relative',
                css: {
                    width: (100 / dayCount) + '%' // Fixe Breite für Spalten
                }
            }).appendTo(weekContainer);


            // labels are only displayed in the first container (the 1st column)
            const showLabels = day === 0;

            buildDayViewContent($wrapper, currentDate, dayContainer, true, showLabels);
        }
    }

    function formatUtcOffsetLabel(date) {
        const localDate = date instanceof Date && !isNaN(date.getTime()) ? date : new Date();
        const offsetMinutes = -localDate.getTimezoneOffset();
        if (offsetMinutes === 0) {
            return 'UTC';
        }

        const sign = offsetMinutes >= 0 ? '+' : '-';
        const absoluteMinutes = Math.abs(offsetMinutes);
        const hours = Math.floor(absoluteMinutes / 60);
        const minutes = absoluteMinutes % 60;

        return `UTC${sign}${hours}${minutes ? ':' + String(minutes).padStart(2, '0') : ''}`;
    }

    function appendUtcOffsetHeaderLabel($target, date) {
        return $('<div>', {
            class: 'position-absolute text-body-secondary text-center user-select-none',
            css: {
                bottom: '1rem',
                paddingRight: '0.5rem',
                left: 0,
                width: '40px',
                fontSize: '10px',
                lineHeight: '1.1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                pointerEvents: 'none'
            },
            text: formatUtcOffsetLabel(date)
        }).appendTo($target);
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
        const data = getBsCalendarData($wrapper);
        const mainColor = data.mainColor;
        const settings = data.settings;
        const day = date.toLocaleDateString(settings.locale, {day: 'numeric'})
        const shortWeekday = date.toLocaleDateString(settings.locale, {weekday: 'short'});
        const justify = forWeekView ? 'center' : 'start';
        const isToday = date.toDateString() === new Date().toDateString();
        const circleCss = [
            'width: 44px',
            'height: 44px',
            'line-height: 44px',
        ];
        const circleClasses = [];
        if (isToday) {
            circleClasses.push('rounded-circle');
            circleCss.push(`background-color: ${mainColor.backgroundColor}`);
            circleCss.push(`background-image: ${mainColor.backgroundImage}`);
            circleCss.push(`color: ${mainColor.color}`);
        }
        return [
            `<div class="d-flex flex-column justify-content-center w-100 p-2 align-items-${justify}">`,
            `<div class="d-flex justify-content-center user-select-none pe-none" style="width: 44px"><small>${shortWeekday}</small></div>`,
            `<span style="${circleCss.join(';')}" class="h4 m-0 text-center user-select-none pe-none ${circleClasses.join(' ')}">${day} </span>`,
            `</div>`
        ].join('')

    }

    /**
     * Build a daily overview with hourly labels and horizontal lines for each hour.
     *
     * @param {jQuery} $wrapper - The wrapper element containing calendar settings and context.
     * @param {Date} date - The date for which the day view is built.
     * @param {jQuery} $container - The target element where the day content is appended.
     * @param {boolean} forWeekView - If true, adapt layout for use inside a week view.
     * @param {boolean} showLabels - If true, render hour labels on the left.
     */
    function buildDayViewContent($wrapper, date, $container, forWeekView = false, showLabels = true) {
        // Read calendar settings from wrapper (e.g., hour range and row height)
        const settings = getSettings($wrapper);

        // Check if provided date is today to optionally render current-time indicator
        const isToday = date.toDateString() === new Date().toDateString();

        if (!forWeekView) {
            // Create an inner container with padding when not embedded in week view
            $container = $('<div>', {
                class: 'position-relative px-1 px-lg-5',
            }).appendTo($container);

            // Reserve space on the left for hour labels
            $container = $('<div>', {
                css: {paddingLeft: '40px'}
            }).appendTo($container);
        }

        // Ensure consistent box sizing for layout precision
        $container.attr('data-weekday'); // no value set: likely used as a hook or legacy artifact
        $container.css('boxSizing', 'border-box');

        // Create the vertical stack that hosts all hour rows for the given day
        const timeSlots = $('<div>', {
            "data-week-day": date.getDay(), // 0-6 (Sun-Sat) to identify weekday
            "data-date-local": $.bsCalendar.utils.formatDateToDateString(date), // normalized local date
            class: 'wc-day-view-time-slots d-flex flex-column position-relative'
        }).appendTo($container);

        // Render an hourly grid from configured start to end hour (inclusive)
        for (let hour = Math.floor(settings.hourSlots.start); hour <= Math.ceil(settings.hourSlots.end); hour++) {
            const rowHour = Math.max(hour, settings.hourSlots.start);
            if (rowHour >= settings.hourSlots.end && hour > Math.floor(settings.hourSlots.start)) {
                if (hour > settings.hourSlots.end) break;
            }

            const isLast = rowHour >= settings.hourSlots.end;
            const isFirst = rowHour === settings.hourSlots.start;

            // Calculate height for partial first/last hours
            let rowHeight = settings.hourSlots.height;
            if (isFirst && !isLast) {
                rowHeight = (Math.ceil(rowHour) - rowHour) * settings.hourSlots.height;
                if (rowHeight <= 0) rowHeight = settings.hourSlots.height;
            }
            if (isLast) rowHeight = 0;
            let rowCursor = 'copy';
            let rowHourSlotRulesAvailability = getDefaultHourSlotRulesAvailability();
            if (!isLast) {
                const slotStartHour = Math.floor(rowHour);
                const slotStartMinute = Math.round((rowHour % 1) * 60);
                const slotStart = new Date(date.getTime());
                slotStart.setHours(slotStartHour, slotStartMinute, 0, 0);
                const slotEnd = new Date(slotStart.getTime());
                slotEnd.setMinutes(slotEnd.getMinutes() + 30);
                rowHourSlotRulesAvailability = getHourSlotRulesAvailabilityForRange($wrapper, slotStart, slotEnd);
                rowCursor = rowHourSlotRulesAvailability.canWork ? 'copy' : 'not-allowed';
            }
            let css = isLast ? {} : {
                boxSizing: 'border-box',
                height: rowHeight + 'px',
                cursor: rowCursor,
            };

            if (!isLast) {
                const hourSlotRules = rowHourSlotRulesAvailability.range;

                if (hourSlotRules) {
                    const hhColors = getHourSlotRulesColors(hourSlotRules);
                    css.backgroundColor = hhColors.backgroundColor;
                    if (hhColors.backgroundImage && hhColors.backgroundImage !== "none") {
                        css.backgroundImage = hhColors.backgroundImage;
                    }
                }
            }

            // One row per hour with a top border to form the grid
            const row = $('<div>', {
                'data-day-hour': rowHour,
                'data-hour-slot-rules-mode': rowHourSlotRulesAvailability.mode || '',
                'data-hour-slot-rules-can-work': rowHourSlotRulesAvailability.canWork ? 'true' : 'false',
                css: css,
                class: 'd-flex align-items-center border-top position-relative'
            }).appendTo(timeSlots);

            // Store contextual info for event handlers (e.g., click/drag)
            row.data('details', {
                hour: rowHour,
                date: date,
                isToday: isToday,
                isLast: isLast
            });

            // Half-hour dashed line: only when row-height is even and sufficiently tall (> 30px)
            if (!isLast && Number.isFinite(rowHeight) && rowHeight > 30 && rowHeight % 2 === 0 && (rowHour % 1 === 0)) {
                $('<div>', {
                    class: 'position-absolute w-100',
                    css: {
                        // position slightly above the exact middle to account for border thickness
                        top: Math.max(0, Math.floor(rowHeight / 2) - 1) + 'px',
                        left: 0,
                        borderTop: '1px dashed var(--bs-border-color, #dee2e6)',
                        pointerEvents: 'none'
                    },
                    'aria-hidden': 'true'
                }).appendTo(row);
            }

            if (showLabels) {
                // Position label to the left of the row
                const combinedCss = [
                    'left: -34px'
                ].join(';');

                // Create a Date object for formatting the hour label
                const labelHour = Math.floor(rowHour);
                const labelMinutes = Math.round((rowHour % 1) * 60);
                const hourDate = new Date(2023, 0, 1, labelHour, labelMinutes); // fixed date, hour varies

                // Render the hour label (e.g., 08:00) aligned to the row's top
                $('<div>', {
                    class: 'wc-time-label ps-2 position-absolute top-0 translate-middle user-select-none pe-none',
                    style: combinedCss,
                    html: $.bsCalendar.utils.formatTime(hourDate, false)
                }).appendTo(row);
            }
        }

        // If the view is for today, overlay a current-time indicator across the grid
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
        const data = getBsCalendarData($wrapper);
        const mainColor = data.mainColor;
        // Helper functions to dynamically retrieve the current time as a Date object.
        const getDynamicNow = () => new Date();

        // Retrieve settings dynamically for the calendar (e.g., hour slots, start/end times).
        const settings = data.settings;
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
            class: 'current-time-indicator position-absolute', // Add CSS classes for styling.
            css: {
                backgroundColor: mainColor.backgroundColor,
                backgroundImage: mainColor.backgroundImage,
                color: mainColor.color,
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
            'background-color: ' + mainColor.backgroundColor, // Set the computed background color.
            'background-image: ' + mainColor.backgroundImage, // Set the computed gradient.
            'color: ' + mainColor.color,        // Set the computed font color.
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
            'background-color: ' + mainColor.backgroundColor, // Set the computed background color.
            'background-image: ' + mainColor.backgroundImage, // Set the computed gradient.
            'color: ' + mainColor.color,        // Set the computed font color.
            'width: 10px',                        // Circle width.
            'height: 10px',                       // Circle height.
        ].join(';'); // Combine the rules into a single CSS string.

        /**
         * Create and append a small circular marker to the time indicator.
         * This marker visually represents the current time.
         */
        $(`<div class="position-absolute start-100 top-50 rounded-circle translate-middle" style="${combinedCss2}"></div>`)
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
        const startTotalMinutes = startDate.getHours() * 60 + startDate.getMinutes();

        // Extract hours and minutes from the endDate, if provided.
        const endTotalMinutes = endDate ? (endDate.getHours() * 60 + endDate.getMinutes()) : null;

        const calendarStartMinutes = settings.hourSlots.start * 60;
        const calendarEndMinutes = settings.hourSlots.end * 60;

        /**
         * Case 1: Event occurs completely outside the visible time range.
         */
        if ((startTotalMinutes < calendarStartMinutes && (endTotalMinutes === null || endTotalMinutes <= calendarStartMinutes)) ||
            (startTotalMinutes >= calendarEndMinutes)) {
            return {top: 0, height: 0};
        }

        /**
         * Adjust the start and end times to fit them within the visible bounds (hour slots) of the calendar.
         */
        let adjustedStartMinutes = Math.max(startTotalMinutes, calendarStartMinutes);
        let adjustedEndMinutes = endTotalMinutes !== null ? Math.min(endTotalMinutes, calendarEndMinutes) : null;

        /**
         * Case 2: Calculate the top position of the slot:
         */
        const top = ((adjustedStartMinutes - calendarStartMinutes) / 60) * settings.hourSlots.height;

        let height = 0; // Default height is 0.

        /**
         * Case 3: If `endDate` is provided, calculate the total duration in minutes:
         */
        if (endDate) {
            const durationMinutes = adjustedEndMinutes - adjustedStartMinutes;
            height = (durationMinutes / 60) * settings.hourSlots.height; // Convert duration to height based on hours.
        }

        /**
         * Case 4: Return the calculated `top` position and `height` of the slot.
         */
        return {top: top, height: height > 0 ? height : 0};
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
        // DESIGN UPDATE: justify-content-center für mittige Ausrichtung, größeres Gap
        const grid = $('<div>', {
            class: 'd-flex flex-wrap justify-content-center gap-3 py-4',
        }).appendTo(container);

        const roundedClass = `rounded-${settings.rounded}`;

        // render a small calendar for each month
        for (let month = 0; month < 12; month++) {
            // Create a wrapper for every monthly calendar
            // DESIGN UPDATE: Card-Style (bg-body, shadow-sm, p-3)
            const monthWrapper = $('<div>', {
                class: `d-flex flex-column align-items-center wc-year-month-container bs-calendar-border-style bg-body shadow-sm p-3 ${roundedClass}`,
                css: {
                    minWidth: '260px' // Mindestbreite für stabile Optik
                }
            }).appendTo(grid);

            // monthly name and year as the title
            const monthName = new Intl.DateTimeFormat(settings.locale, {month: 'long'}).format(
                new Date(year, month)
            );

            // DESIGN UPDATE: Modern Typography (Uppercase, smaller, spaced)
            $('<div>', {
                'data-month': `${year}-${String(month + 1).padStart(2, '0')}-01`,
                class: 'fw-bold text-uppercase text-body-secondary mb-3',
                text: `${monthName}`,
                css: {
                    cursor: 'pointer',
                    letterSpacing: '1px',
                    fontSize: '0.85rem'
                },
            }).appendTo(monthWrapper);

            const monthContainer = $('<div>').appendTo(monthWrapper)

            // Insert small monthly calendars
            const tempDate = new Date(year, month, 1); // start date of the current month
            buildMonthSmallView($wrapper, tempDate, monthContainer, true);
        }
    }

    function buildAppointmentModalOptions($wrapper, appointment) {
        const $modal = $(globalCalendarElements.infoModal);
        if (!$modal.length) return;

        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const isTask = !!appointment.task;
        const colors = $.bsCalendar.utils.getColors(data.settings.mainColor);
        const isDeleteable = appointment.hasOwnProperty('deleteable') ? appointment.deleteable : true;
        const isEditable = isAppointmentEditable(appointment);
        const t = $.bsCalendar.getTranslations(data.settings.locale);

        // Get the option wrapper and empty it
        const $modalOptionsWrapper = $modal.find('[data-modal-options]').empty();

        const $closeBtn = $(`<button type="button" data-bs-dismiss="modal" class="btn"><i class="bi bi-x-lg"></i></button>`);
        const $editBtn = $(`<button type="button" data-edit class="btn"><i class="bi bi-pen"></i></button>`);
        const $deleteBtn = $(`<button type="button" data-remove data-bs-dismiss="modal" class="btn"><i class="bi bi-trash3"></i></button>`);
        const dropdownHTML = [
            `<div class="dropdown" data-modal-dropdown>`,
            `<button class="btn" type="button" data-bs-toggle="dropdown" aria-expanded="false">`,
            `<i class="bi bi-three-dots-vertical"></i>`,
            `</button>`,
            `<ul class="dropdown-menu">`,
            `</ul>`,
            `</div>`
        ].join('');
        const $btnDropdown = $(dropdownHTML);
        const $dropDownItemDuplicate = $(`<li><a class="dropdown-item" data-duplicate href="#"><i class="${settings.icons.duplicate}"></i> ${t.duplicate}</a></li>`);
        const $dropDownItemDivider = $(`<li><hr class="dropdown-divider"></li>`);


        // first add the close button
        $closeBtn.appendTo($modalOptionsWrapper);
        if (isEditable) {
            $btnDropdown.prependTo($modalOptionsWrapper);
            const $dropdownMenu = $btnDropdown.find('.dropdown-menu');
            $dropDownItemDuplicate.appendTo($dropdownMenu);
            if (isTask) {
                $dropDownItemDivider.appendTo($dropdownMenu);
                const taskIsChecked = appointment.task ? appointment.task.checked : false;
                const icon = taskIsChecked ? settings.icons.task : settings.icons.taskDone;
                const text = taskIsChecked ? t.taskOpen : t.taskDone;
                const status = taskIsChecked ? 'false' : 'true';
                $(`<li><a class="dropdown-item" data-task-option-status="${status}" href="#"><i class="${icon}"></i> ${text}</a></li>`).appendTo($dropdownMenu);
            }
        }

        if (isDeleteable) {
            $deleteBtn.prependTo($modalOptionsWrapper);
        }

        if (isEditable) {
            $editBtn.prependTo($modalOptionsWrapper);
        }

        if (isTask) {
            const priority = appointment.task ? appointment.task.priority : 'normal';
            const priorityColors = $.bsCalendar.utils.getColors(taskPriorityColors[priority]);
            let priorityText = t.taskPriorityNormal;
            if (priority === 'high') {
                priorityText = t.taskPriorityHigh;
            }
            if (priority === 'low') {
                priorityText = t.taskPriorityLow;
            }

            $('<span>', {
                'data-task-badge': '',
                class: 'badge me-auto',
                css: {
                    backgroundColor: priorityColors.backgroundColor,
                    color: priorityColors.color,
                },
                text: priorityText,
            }).prependTo($modalOptionsWrapper);

            $('<span>', {
                'data-task-badge': '',
                class: 'badge me-2',
                css: {
                    backgroundColor: colors.backgroundColor,
                    color: colors.color,
                },
                text: t.tasks
            }).prependTo($modalOptionsWrapper);
        }

    }

    function calcInfoModalPositionAndOpen(modalAlreadyExisted = true) {
        const $modal = $(globalCalendarElements.infoModal);
        const modalExists = $modal.length > 0;
        if (!modalExists) {
            $modal.modal('show');
            return;
        }
        const $target = $modal.data('target');
        if (!$target || !$target.length) {
            return;
        }

        // Get relevant dimensions and positioning of the modal and target element.
        const $modalDialog = $modal.find('.modal-dialog');

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
            if (modalAlreadyExisted) {
                $modalDialog.animate({
                    top: `${top}px`,
                    left: `${left}px`
                }, "slow");
            } else {
                $modalDialog.css({
                    top: `${top}px`,
                    left: `${left}px`
                });
            }
        }, 0);

        // Display the modal.
        $modal.modal('show');
    }

    async function showAppointmentWindow($wrapper, appointment, $targetElement = null, shouldShow = null) {
        const data = getBsCalendarData($wrapper);
        const settings = data.settings;
        const isTask = !!appointment.task;

        let $modal = $(globalCalendarElements.infoModal);

        const returnData = getAppointmentForReturn(appointment);

        const modalExists = $modal.length > 0;

        if (!modalExists) {
            trigger($wrapper, 'show-info-window', returnData.appointment, returnData.extras);
        }

        const html = await settings.formatter.window(returnData.appointment, returnData.extras);

        if (typeof shouldShow === 'function' && !shouldShow()) {
            return;
        }

        if (!modalExists) {
            const shadowStyle = 'box-shadow: rgba(0, 0, 0, 0.56) 0px 22px 70px 4px !important;';

            const modalHtml = [
                `<div class="modal fade pe-none" id="${globalCalendarElements.infoModal.substring(1)}" tabindex="-1" data-bs-backdrop="false">`,
                `<div class="modal-dialog modal-fullscreen-sm-down position-absolute pe-auto rounded-3" style="min-width: min(360px, calc(100vw - var(--bs-modal-margin) * 2)); max-height: calc(100% - var(--bs-modal-margin) * 2);">`,
                `<div class="modal-content border-0 bs-calendar-border-style" style="${shadowStyle}">`,
                `<div class="modal-header justify-content-end border-bottom-0 py-1 pe-0" data-modal-options></div>`,
                `<div class="modal-body d-flex flex-column align-items-stretch p-0">`,
                `<div class="modal-appointment-content flex-fill overflow-y-auto px-3 pb-3 pt-1">`,
                html,
                `</div>`,
                `</div>`,
                `</div>`,
                `</div>`,
                `</div>`,
            ].join('');

            $('body').append(modalHtml);

            $modal = $(globalCalendarElements.infoModal);

            $modal.attr('data-bs-calendar-wrapper-id', $wrapper.attr('data-bs-calendar-id'));

            $modal.modal({
                backdrop: false,
                keyboard: true
            });
        } else {
            $modal.find('.modal-appointment-content').html(html);
        }

        $modal.data('appointment', appointment);
        $modal.data('target', $targetElement);

        buildAppointmentModalOptions($wrapper, appointment);
        calcInfoModalPositionAndOpen(modalExists);
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}(jQuery));
