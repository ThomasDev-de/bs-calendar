# Bootstrap Calendar Plugin

![Version](https://img.shields.io/badge/version-2.1.6-blue)
![jQuery](https://img.shields.io/badge/jQuery-v3.x-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-v5-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)

`bs-calendar` is a jQuery plugin for Bootstrap 5 calendars with `day`, `week`, `month`, and `year` views. It supports
remote appointment loading, calendar filters, search, holidays, custom formatting, drag-create, drag-move, and local
appointment add/edit/delete methods.

As of version 2, Bootstrap 4 is no longer supported. Use version `^1` for Bootstrap 4 projects.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Run the Demo](#run-the-demo)
- [Core Concepts](#core-concepts)
- [Appointment Data](#appointment-data)
- [Remote Data with `url`](#remote-data-with-url)
- [Add, Edit, and Delete Workflow](#add-edit-and-delete-workflow)
- [Options](#options)
- [Events and Callbacks](#events-and-callbacks)
- [Methods](#methods)
- [Formatters](#formatters)
- [Extras Object](#extras-object)
- [Colors](#colors)
- [Holidays](#holidays)
- [Utilities](#utilities)
- [Repository Notes](#repository-notes)
- [Completeness Check](#completeness-check)

## Requirements

- jQuery `^3`
- Bootstrap `^5` CSS and JavaScript bundle
- Bootstrap Icons `^1`
- PHP and Composer are only needed for running the local demo with the bundled `vendor/` dependencies.

No Node.js build step is required for normal usage. The browser-ready files are shipped in `dist/`.

## Installation

Use CDN/script tags:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">

<div id="calendar"></div>

<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.6/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/gh/ThomasDev-de/bs-calendar@2.1.6/dist/bs-calendar.min.js"></script>
```

Or install via Composer:

```bash
composer require webcito/bs-calendar
```

After Composer installation, include `vendor/webcito/bs-calendar/dist/bs-calendar.min.js` together with jQuery,
Bootstrap, and Bootstrap Icons.

## Quick Start

```html
<div id="calendar"></div>

<script>
    $(function () {
        $('#calendar').bsCalendar({
            locale: 'de-DE',
            startView: 'week',
            startWeekOnSunday: false
        });
    });
</script>
```

Load appointments from a function:

```javascript
$('#calendar').bsCalendar({
    url(requestData) {
        return fetch('/api/appointments?' + new URLSearchParams(requestData))
            .then(response => response.json());
    }
});
```

Add and edit appointments locally:

```javascript
const appointment = {
    title: 'New meeting',
    start: '2026-05-08 10:00:00',
    end: '2026-05-08 11:00:00'
};

$('#calendar').bsCalendar('addAppointment', appointment);

$('#calendar').bsCalendar('editAppointment', {
    id: appointment.id,
    title: 'Updated meeting'
});

$('#calendar').bsCalendar('deleteAppointment', appointment.id);
```

## Run the Demo

```bash
composer install
php -S localhost:8000 -t .
```

Open `http://localhost:8000/demo/index.html`.

The demo contains one calendar instance and shows a modal-based add/edit/delete flow using `addAppointment`,
`editAppointment`, and `deleteAppointment`.

## Core Concepts

- `url` loads appointment data for the current view, search term, and active calendars.
- `calendars` defines sidebar filters. Active calendar IDs are sent as `calendarIds`.
- `add.bs.calendar`, `edit.bs.calendar`, and `delete.bs.calendar` are intent events. They tell you what the user wants;
  they do not save.
- `addAppointment`, `editAppointment`, and `deleteAppointment` update the currently loaded browser-side appointment data
  and re-render.
- `added.bs.calendar`, `edited.bs.calendar`, and `deleted.bs.calendar` fire after a local mutation method succeeded.
- `refresh` reloads data from `url`.
- `render` re-renders already loaded data without calling `url`.
- `year` view uses summary objects (`date`, `total`, optional `content`), not full appointment objects.

## Appointment Data

For `day`, `week`, `month`, and search results, appointments use this shape:

```json
{
  "id": 123,
  "title": "Project Kickoff",
  "start": "2026-05-08 10:00:00",
  "end": "2026-05-08 11:00:00",
  "allDay": false,
  "calendarId": "work",
  "description": "Discuss goals and next steps.",
  "color": "primary",
  "link": "https://example.com",
  "location": "Room 5A",
  "editable": true,
  "deleteable": true
}
```

Required fields:

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Appointment title. |
| `start` | `string` | Start date/time in `YYYY-MM-DD HH:mm:ss` or compatible local date-time format. |
| `end` | `string` | End date/time in `YYYY-MM-DD HH:mm:ss` or compatible local date-time format. |

Optional fields:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | `string` or `number` | generated when missing | Required for later `editAppointment` calls. |
| `allDay` | `boolean` | `false` | Treat the appointment as an all-day item. |
| `calendarId` | `string` or `number` | none | Useful for server-side or custom filtering by calendar. |
| `description` | `string` | none | Used by the default info window formatter. |
| `color` | `string` | `mainColor` | Bootstrap color, CSS color, CSS variable, or class combination. |
| `icon` | `string` | appointment icon | Bootstrap icon class for this appointment. |
| `link` | `string` or `object` | none | Rendered by the default info window formatter. |
| `location` | `string`, `array`, or `null` | none | Rendered by the default info window formatter. |
| `editable` | `boolean` | `true` | Controls whether the info window shows an edit button. |
| `deleteable` | `boolean` | `true` | Controls whether the info window shows a delete button. |

Reserved field:

| Field | Description |
|-------|-------------|
| `extras` | Internal render context generated by bs-calendar. Do not send or persist it as appointment data. |

All-day appointments:

```json
{
  "title": "Conference",
  "start": "2026-05-08",
  "end": "2026-05-09",
  "allDay": true
}
```

The plugin normalizes all-day start/end values to full-day boundaries internally.

Link object:

```json
{
  "href": "https://example.com",
  "text": "Open details",
  "target": "_blank",
  "rel": "noopener noreferrer",
  "disabled": false,
  "html": "<strong>Open</strong>"
}
```

## Remote Data with `url`

`url` can be `null`, a string URL, or a function.

```javascript
$('#calendar').bsCalendar({
    url: '/api/appointments'
});
```

With a string URL, bs-calendar sends a GET request using jQuery AJAX.

```javascript
$('#calendar').bsCalendar({
    url(requestData) {
        return fetch('/api/appointments?' + new URLSearchParams(requestData))
            .then(response => response.json());
    }
});
```

With a function, bs-calendar passes `requestData` and expects a Promise.

Request data in normal views:

| View | Request fields |
|------|----------------|
| `day`, `week`, `month` | `fromDate`, `toDate`, `view`, `calendarIds` |
| `year` | `year`, `view`, `calendarIds` |

Request data in search mode:

| Field | Description |
|-------|-------------|
| `search` | Search string. |
| `limit` | Page size from `options.search.limit`. |
| `offset` | Current search offset. |
| `calendarIds` | Active calendar IDs. |

Normal response for `day`, `week`, and `month`:

```json
[
  {
    "id": 1,
    "title": "Meeting",
    "start": "2026-05-08 10:00:00",
    "end": "2026-05-08 11:00:00",
    "color": "primary"
  }
]
```

Search response:

```json
{
  "rows": [
    {
      "id": 1,
      "title": "Meeting",
      "start": "2026-05-08 10:00:00",
      "end": "2026-05-08 11:00:00"
    }
  ],
  "total": 42
}
```

Year-view response:

```json
[
  {
    "date": "2026-05-08",
    "total": 3,
    "content": "3 appointments"
  }
]
```

Year summary fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `date` | `string` | Yes | Day in `YYYY-MM-DD` format. |
| `total` | `number` | Yes | Badge number shown in year view. Must be greater than `0`. |
| `content` | `string` | No | Popover body. HTML rendering is enabled. Defaults to `total`. |

Use `queryParams` to append custom request values:

```javascript
$('#calendar').bsCalendar({
    url: '/api/appointments',
    queryParams(requestData) {
        return {
            userId: $('#user').val()
        };
    }
});
```

`queryParams` cannot override protected period keys such as `fromDate`, `toDate`, `year`, or `view`.

## Add, Edit, and Delete Workflow

`add.bs.calendar`, `edit.bs.calendar`, and `delete.bs.calendar` are intent events. They let your app open a modal,
confirm destructive actions, validate input, save to a backend, and then update the calendar.

Callback options receive the same payloads:

| Event | Callback | Payload |
|-------|----------|---------|
| `add.bs.calendar` | `onAdd(data, dragExtras)` | Proposed start/end for a new appointment. |
| `edit.bs.calendar` | `onEdit(appointment, extras, dragExtras)` | Current appointment plus render context. |
| `delete.bs.calendar` | `onDelete(appointment, extras)` | Appointment selected for deletion. |

After a local mutation method has succeeded, the calendar fires completion events:

| Event | Callback | Payload |
|-------|----------|---------|
| `added.bs.calendar` | `onAdded(appointment, extras)` | Appointment that was added. |
| `edited.bs.calendar` | `onEdited(appointment, extras)` | Appointment after the local update. |
| `deleted.bs.calendar` | `onDeleted(appointment, extras)` | Appointment that was removed. |

When drag-create is used, `dragExtras` contains the proposed `start` and `end`. When drag-move is used, `appointment`
still contains the original appointment and `dragExtras` contains the proposed new range. In week view, drag-move can
also move an appointment to another day in the visible week. In month view, drag-move can move an appointment to another
day cell while keeping the original start/end times.

Open a modal for new appointments:

```javascript
let appointmentModalMode = 'add';
let currentAppointmentId = null;

$('#calendar').on('add.bs.calendar', function (event, data, dragExtras) {
    const start = dragExtras?.start || data.start;
    const end = dragExtras?.end || data.end;

    appointmentModalMode = 'add';
    currentAppointmentId = null;

    $('#appointmentModal input[name="from_date"]').val(start.date);
    $('#appointmentModal input[name="to_date"]').val(end.date);
    $('#appointmentModal input[name="from_time"]').val(start.time ? start.time.substring(0, 5) : '');
    $('#appointmentModal input[name="to_time"]').val(end.time ? end.time.substring(0, 5) : '');
    $('#appointmentModal').modal('show');
});
```

Open a modal for existing appointments:

```javascript
$('#calendar').on('edit.bs.calendar', function (event, appointment, extras, dragExtras) {
    const eventExtras = dragExtras || extras;
    const isAllDay = !!appointment.allDay;

    appointmentModalMode = 'edit';
    currentAppointmentId = appointment.id;

    $('#appointmentModal input[name="title"]').val(appointment.title);
    $('#appointmentModal input[name="from_date"]').val(eventExtras.start.date);
    $('#appointmentModal input[name="to_date"]').val(eventExtras.end.date);
    $('#appointmentModal input[name="from_time"]').val(isAllDay ? '' : eventExtras.start.time.substring(0, 5));
    $('#appointmentModal input[name="to_time"]').val(isAllDay ? '' : eventExtras.end.time.substring(0, 5));
    $('#appointmentModal input[name="allDay"]').prop('checked', isAllDay);
    $('#appointmentModal').modal('show');
});
```

Save local browser-side changes:

```javascript
const appointment = {
    title: $('#appointmentModal input[name="title"]').val(),
    start: '2026-05-08 10:00:00',
    end: '2026-05-08 11:00:00',
    allDay: false
};

if (appointmentModalMode === 'edit') {
    appointment.id = currentAppointmentId;
    $('#calendar').bsCalendar('editAppointment', appointment);
} else {
    $('#calendar').bsCalendar('addAppointment', appointment);
}
```

Handle delete intents:

```javascript
$('#calendar').on('delete.bs.calendar', function (event, appointment) {
    event.preventDefault();

    if (confirm(`Delete "${appointment.title}"?`)) {
        $('#calendar').bsCalendar('deleteAppointment', appointment.id);
    }
});
```

For backend-backed calendars, save to your backend first and then either:

- call `refresh` so the updated data is loaded from `url`, or
- call `addAppointment`, `editAppointment`, or `deleteAppointment` for an immediate local update and ensure the backend
  returns the same data on the next `refresh`.

## Options

All options can be passed during initialization:

```javascript
$('#calendar').bsCalendar({
    locale: 'de-DE',
    startView: 'week'
});
```

Some options can be updated later with `updateOptions`.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showAbout` | `boolean` | `true` | Shows the About dropdown. |
| `locale` | `string` | `"en-GB"` | Locale for labels and date formatting. |
| `title` | `string` or `null` | `null` | HTML/string title in the toolbar. |
| `startWeekOnSunday` | `boolean` | `true` | If `false`, weeks start on Monday. |
| `navigateOnWheel` | `boolean` | `true` | Enables mouse-wheel navigation over the calendar. |
| `rounded` | `number` | `5` | Bootstrap rounded level used by calendar UI elements. |
| `border` | `string` | `"border border-0 rounded-0 shadow"` | Bootstrap classes used by bordered calendar UI elements. |
| `search` | `object` or `null` | `{limit: 10, offset: 0}` | Search config. Set `null` to disable search. |
| `search.limit` | `number` | `10` | Number of search results per page. |
| `search.offset` | `number` | `0` | Initial search offset. |
| `startDate` | `Date` or `string` | `new Date()` | Initial reference date. |
| `startView` | `string` | `"month"` | Initial view: `year`, `month`, `week`, or `day`. |
| `mainColor` | `string` | `"primary"` | Default color used by highlights and appointments. |
| `views` | `array` | `["year", "month", "week", "day"]` | Enabled views. |
| `holidays` | `object` or `null` | `null` | OpenHolidays configuration. |
| `showAddButton` | `boolean` | `true` | Shows the toolbar add button. |
| `draggable` | `boolean` | `false` | Enables drag-create in day/week view and drag-move in day/week/month view. Touch uses long-press. |
| `translations` | `object` | see below | Search strings. |
| `icons` | `object` | see below | Bootstrap icon classes. |
| `url` | `string`, `function`, or `null` | `null` | Appointment data source. |
| `queryParams` | `function` or `null` | `null` | Adds custom request params before loading appointments. |
| `topbarAddons` | selector or `null` | `null` | jQuery selector/element inserted after the top toolbar. |
| `sidebarAddons` | selector or `null` | `null` | jQuery selector/element appended to the sidebar. |
| `formatter` | `object` | see below | Custom render functions. |
| `hourSlots` | `object` | `{height: 30, start: 0, end: 24}` | Day/week hour slot layout. |
| `calendars` | `array` or `null` | `null` | Sidebar calendar filters. |
| `onAll` | `function` or `null` | `null` | Receives all event callbacks. |
| `onInit` | `function` or `null` | `null` | Called after initialization. |
| `onAdd` | `function` or `null` | `null` | Same payload as `add.bs.calendar`. |
| `onAdded` | `function` or `null` | `null` | Same payload as `added.bs.calendar`. |
| `onEdit` | `function` or `null` | `null` | Same payload as `edit.bs.calendar`. |
| `onEdited` | `function` or `null` | `null` | Same payload as `edited.bs.calendar`. |
| `onDelete` | `function` or `null` | `null` | Same payload as `delete.bs.calendar`. |
| `onDeleted` | `function` or `null` | `null` | Same payload as `deleted.bs.calendar`. |
| `onView` | `function` or `null` | `null` | Called when the view changes. |
| `onBeforeLoad` | `function` or `null` | `null` | Called before loading appointments. |
| `onAfterLoad` | `function` or `null` | `null` | Called after appointments were processed. |
| `onShowInfoWindow` | `function` or `null` | `null` | Called before the info window is shown. |
| `onHideInfoWindow` | `function` or `null` | `null` | Called when the info window is hidden. |
| `onNavigateForward` | `function` or `null` | `null` | Called after forward navigation. |
| `onNavigateBack` | `function` or `null` | `null` | Called after backward navigation. |
| `storeState` | `boolean` | `false` | Persists selected view and active calendars in `localStorage`. |
| `debug` | `boolean` | `false` | Enables debug logging. |

Calendar filters:

```javascript
$('#calendar').bsCalendar({
    calendars: [
        {id: 'personal', title: 'Personal', color: 'primary', active: true},
        {id: 'work', title: 'Work', color: 'danger', active: true}
    ]
});
```

Calendar fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | `string` or `number` | Yes | none | Sent in `calendarIds`. |
| `title` | `string` | No | `Calendar {i}` | Sidebar label. |
| `color` | `string` | No | `mainColor` | Sidebar color. |
| `active` | `boolean` | No | `true` | Initial filter state. |

Translations:

| Key | Default | Description |
|-----|---------|-------------|
| `search` | `"Type and press Enter"` | Search placeholder. |
| `searchNoResult` | `"No appointment found"` | Empty search message. |

Icons:

| Key | Default |
|-----|---------|
| `day` | `"bi bi-calendar-day"` |
| `week` | `"bi bi-kanban"` |
| `month` | `"bi bi-calendar-month"` |
| `year` | `"bi bi-calendar4"` |
| `about` | `"bi bi-info-circle"` |
| `add` | `"bi bi-plus-lg"` |
| `menu` | `"bi bi-layout-sidebar-inset"` |
| `search` | `"bi bi-search"` |
| `prev` | `"bi bi-chevron-left"` |
| `next` | `"bi bi-chevron-right"` |
| `link` | `"bi bi-box-arrow-up-right"` |
| `appointment` | `"bi bi-clock"` |
| `appointmentAllDay` | `"bi bi-brightness-high"` |

## Events and Callbacks

Events use the `.bs.calendar` namespace:

```javascript
$('#calendar').on('view.bs.calendar', function (event, view) {
    console.log(view);
});
```

| Event | Callback option | Payload |
|-------|-----------------|---------|
| `all.bs.calendar` | `onAll(eventName, ...params)` | Event name plus event params. |
| `init.bs.calendar` | `onInit()` | none |
| `add.bs.calendar` | `onAdd(data, dragExtras)` | New appointment intent. |
| `added.bs.calendar` | `onAdded(appointment, extras)` | Appointment added with `addAppointment`. |
| `edit.bs.calendar` | `onEdit(appointment, extras, dragExtras)` | Edit appointment intent. |
| `edited.bs.calendar` | `onEdited(appointment, extras)` | Appointment updated with `editAppointment`. |
| `delete.bs.calendar` | `onDelete(appointment, extras)` | Delete appointment intent. |
| `deleted.bs.calendar` | `onDeleted(appointment, extras)` | Appointment removed with `deleteAppointment`. |
| `view.bs.calendar` | `onView(view)` | New view. |
| `navigate-forward.bs.calendar` | `onNavigateForward(view, from, to)` | View and period. |
| `navigate-back.bs.calendar` | `onNavigateBack(view, from, to)` | View and period. |
| `show-info-window.bs.calendar` | `onShowInfoWindow(appointment, extras)` | Info window opened. |
| `hide-info-window.bs.calendar` | `onHideInfoWindow()` | Info window closed. |
| `before-load.bs.calendar` | `onBeforeLoad(requestData)` | Request data before loading. |
| `after-load.bs.calendar` | `onAfterLoad(appointments)` | Processed appointments. |

## Methods

Call methods with the jQuery plugin method syntax:

```javascript
$('#calendar').bsCalendar('refresh');
```

| Method | Params | Description |
|--------|--------|-------------|
| `refresh` | optional `{url, view, queryParams}` | Reloads data from `url` and renders. |
| `render` | none | Re-renders current loaded data without fetching. |
| `clear` | none | Clears rendered appointments and stored local appointment data. Not available in search mode. |
| `updateOptions` | `object` | Merges runtime options and rebuilds where needed. |
| `addAppointment` | appointment object | Adds one local appointment and renders. Not available in search mode or year view. |
| `editAppointment` | appointment object with `id` | Updates a local appointment by `id` and renders. Not available in search mode or year view. |
| `editApointment` | appointment object with `id` | Compatibility alias for `editAppointment`. |
| `deleteAppointment` | appointment `id` or object with `id` | Deletes one local appointment by `id` and renders. Not available in search mode or year view. |
| `destroy` | none | Removes generated markup/events and restores the original element state. |
| `setDate` | date string, `Date`, or `{date, view}` | Sets the visible reference date. Not available in search mode. |
| `setToday` | optional view string | Navigates to today. Not available in search mode. |

Examples:

```javascript
$('#calendar').bsCalendar('setDate', {date: '2026-05-08', view: 'day'});
$('#calendar').bsCalendar('setToday', 'week');
$('#calendar').bsCalendar('updateOptions', {locale: 'fr-FR'});
```

## Formatters

Formatters customize appointment, search, holiday, info-window, and duration rendering.

```javascript
$('#calendar').bsCalendar({
    formatter: {
        day(appointment, extras) {
            return appointment.title;
        },
        week(appointment, extras) {
            return appointment.title;
        },
        allDay(appointment, extras, view) {
            return appointment.title;
        },
        month(appointment, extras) {
            return appointment.title;
        },
        search(appointment, extras) {
            return appointment.title;
        },
        holiday(holiday, view) {
            return holiday.name?.[0]?.text || holiday.title;
        },
        window(appointment, extras) {
            return Promise.resolve(`<h3>${appointment.title}</h3>`);
        },
        duration(duration) {
            return `${duration.totalMinutes} min`;
        }
    }
});
```

Formatter signatures:

| Formatter | Signature | Return |
|-----------|-----------|--------|
| `day` | `(appointment, extras)` | HTML/string |
| `week` | `(appointment, extras)` | HTML/string |
| `allDay` | `(appointment, extras, view)` | HTML/string |
| `month` | `(appointment, extras)` | HTML/string |
| `search` | `(appointment, extras)` | HTML/string |
| `holiday` | `(holiday, view)` | HTML/string |
| `window` | `(appointment, extras)` | Promise resolving to HTML/string |
| `duration` | `(duration)` | string |

## Extras Object

`extras` is generated for each appointment after loading/normalization.

| Field | Description |
|-------|-------------|
| `locale` | Locale used for formatting. |
| `icon` | Appointment icon class. |
| `colors.origin` | Original color value. |
| `colors.backgroundColor` | Computed background color. |
| `colors.backgroundImage` | Computed background image/gradient. |
| `colors.color` | Computed text color. |
| `colors.classList` | Computed Bootstrap classes, if applicable. |
| `start.date` | Start date in `YYYY-MM-DD`. |
| `start.time` | Start time in `HH:MM:SS`. |
| `end.date` | End date in `YYYY-MM-DD`. |
| `end.time` | End time in `HH:MM:SS`. |
| `duration.days` | Full days. |
| `duration.hours` | Remaining hours. |
| `duration.minutes` | Remaining minutes. |
| `duration.seconds` | Remaining seconds. |
| `duration.totalMinutes` | Total minutes. |
| `duration.totalSeconds` | Total seconds. |
| `duration.formatted` | Formatter output. |
| `displayDates` | Per-day display data used by month/week/day rendering. |
| `allDay` | Whether the appointment is all-day. |
| `inADay` | Whether it stays within one calendar day. |
| `isToday` | Whether it intersects today. |
| `isNow` | Whether it is currently active. |

`displayDates[]` entries contain:

| Field | Description |
|-------|-------------|
| `date` | Display date. |
| `day` | Weekday index. |
| `times.start` | Visible start time for that day. |
| `times.end` | Visible end time for that day. |
| `visibleInWeek` | Whether this date is visible in week view. |
| `visibleInMonth` | Whether this date is visible in month view. |

## Colors

Supported color inputs:

- Bootstrap theme names or class combinations, e.g. `primary`, `danger opacity-75 gradient`
- Hex colors, e.g. `#ff5733`
- RGB/RGBA values
- CSS variables, e.g. `var(--bs-primary)`
- Named CSS colors, e.g. `steelblue`

Use the public color helper:

```javascript
const colors = $.bsCalendar.utils.getColors('#ff5733', 'primary');

// {
//   origin: '#ff5733',
//   backgroundColor: '#ff5733',
//   backgroundImage: 'none',
//   color: '#000000' or '#FFFFFF'
// }
```

## Holidays

`holidays` uses the OpenHolidays API. If `country` or `language` is missing, bs-calendar derives it from `locale`.

```javascript
$('#calendar').bsCalendar({
    holidays: {
        country: 'DE',
        federalState: 'BE',
        language: 'DE'
    }
});
```

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `country` | `string` or `null` | locale country | ISO 3166-1 alpha-2 country code. |
| `federalState` | `string` or `null` | `null` | Subdivision/state code. Required for school holidays. |
| `language` | `string` or `null` | locale language | ISO 639-1 language code. |

If `url` is `null`, holidays can still be loaded and rendered.

## Utilities

Global API:

```javascript
$.bsCalendar.version;
$.bsCalendar.about;
$.bsCalendar.setDefaults({locale: 'de-DE'});
$.bsCalendar.getDefaults();
```

Appointment and date helpers:

```javascript
const appointments = $.bsCalendar.utils.convertIcsToAppointments(icsString);
const date = $.bsCalendar.utils.parseDateInput('2026-05-08 10:00:00');
const time = $.bsCalendar.utils.formatTime(date);
const dateString = $.bsCalendar.utils.formatDateToDateString(date);
const localizedDate = $.bsCalendar.utils.formatDateByLocale(date, 'de-DE');
const week = $.bsCalendar.utils.getCalendarWeek(date);
const weekdays = $.bsCalendar.utils.getShortWeekDayNames('de-DE', false);
const sameDay = $.bsCalendar.utils.datesAreEqual(new Date(), date);
const label = $.bsCalendar.utils.getAppointmentTimespanBeautify(extras, true);
```

Lower-level utility helpers:

```javascript
const colors = $.bsCalendar.utils.getColors('primary', 'secondary');
const id = $.bsCalendar.utils.generateRandomString(8);
const units = $.bsCalendar.utils.getStandardizedUnits('de-DE');
const localeParts = $.bsCalendar.utils.getLanguageAndCountry('de-DE');
const empty = $.bsCalendar.utils.isValueEmpty('');
```

OpenHolidays helpers:

```javascript
$.bsCalendar.utils.openHolidayApi.getCountries('DE');
$.bsCalendar.utils.openHolidayApi.getLanguages('DE');
$.bsCalendar.utils.openHolidayApi.getSubdivisions('DE', 'DE');
$.bsCalendar.utils.openHolidayApi.getSchoolHolidays('DE', 'BE', '2026-01-01', '2026-12-31');
$.bsCalendar.utils.openHolidayApi.getPublicHolidays('DE', 'BE', 'DE', '2026-01-01', '2026-12-31');
```

## Repository Notes

Key files:

```text
.
├── README.md
├── changelog.md
├── composer.json
├── dist/
│   ├── bs-calendar.js
│   └── bs-calendar.min.js
└── demo/
    ├── index.html
    └── img/
```

Development notes:

- No npm build is required.
- `dist/bs-calendar.js` is the unminified browser source.
- `dist/bs-calendar.min.js` should be regenerated after changes to `dist/bs-calendar.js`.
- The demo expects Composer dependencies in `vendor/`.
- No automated test suite is currently included.

Changelog and support:

- [Changelog](changelog.md#version-216)
- [Issues](https://github.com/ThomasDev-de/bs-calendar/issues)
- [License](LICENSE)

## Completeness Check

This README is intended to cover the public surface of version `2.1.6`:

- All `DEFAULTS` options from `dist/bs-calendar.js`
- All public plugin methods in the method switch
- All documented jQuery events and matching `on*` callback options
- Appointment object fields, including generated `id` behavior
- Normal, search, and year-view `url` response contracts
- Formatter signatures
- `extras` fields used by callbacks and formatters
- Public utility entry points
- Current single-calendar demo workflow
