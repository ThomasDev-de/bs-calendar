# Bootstrap Calendar Plugin

![Version](https://img.shields.io/badge/version-2.3.5-blue)
![jQuery](https://img.shields.io/badge/jQuery-v3.x-orange)
![Bootstrap](https://img.shields.io/badge/Bootstrap-v5-blueviolet)
![License](https://img.shields.io/badge/license-MIT-green)

`bs-calendar` is a jQuery plugin for Bootstrap 5 calendars with `day`, `4day`, `week`, `month`, and `year` views. It supports remote
appointment loading, calendar filters, search, holidays, custom formatting, drag-create, drag-move, tasks, and local appointment
add/edit/delete methods.

As of version 2, Bootstrap 4 is no longer supported. Use version `^1` for Bootstrap 4 projects.

<table>
<tbody>
<tr>
<td><img src="/demo/img/day.png" alt="Calendar Preview" width="200"></td>
<td><img src="/demo/img/week.png" alt="Calendar Preview" width="200"></td>
<td><img src="/demo/img/month.png" alt="Calendar Preview" width="200"></td>
<td><img src="/demo/img/year.png" alt="Calendar Preview" width="200"></td>
</tr>
</tbody>
</table>

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
- [Localization and Translations](#localization-and-translations)
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
<script src="https://cdn.jsdelivr.net/gh/ThomasDev-de/bs-calendar@2.3.5/dist/bs-calendar.min.js"></script>
```

Or install via Composer:

```bash
composer require webcito/bs-calendar
```

After Composer installation, include `vendor/webcito/bs-calendar/dist/bs-calendar.min.js` together with jQuery, Bootstrap, and Bootstrap
Icons.

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

Add, edit, and delete appointments locally:

```javascript
const appointment = {
    title: 'New meeting',
    start: '2026-05-08 10:00:00',
    end: '2026-05-08 11:00:00'
};

$('#calendar').bsCalendar('addAppointment', appointment);
$('#calendar').bsCalendar('editAppointment', {id: appointment.id, title: 'Updated meeting'});
$('#calendar').bsCalendar('deleteAppointment', appointment.id);
```

## Run the Demo

```bash
composer install
php -S localhost:8000 -t .
```

Open `http://localhost:8000/demo/index.html`.

The demo contains one calendar instance and shows a modal-based add/edit/delete flow using `addAppointment`, `editAppointment`, and
`deleteAppointment`.

## Core Concepts

- `url` controls remote appointment loading. It can be `null`, a URL string, or a function returning a Promise.
- `calendars` defines sidebar filters. Active calendar IDs are always sent as `calendarIds` in remote requests.
- `add.bs.calendar`, `edit.bs.calendar`, and `delete.bs.calendar` are intent events. They tell your application what the user wants; they do
  not save anything.
- `addAppointment`, `editAppointment`, and `deleteAppointment` mutate only the currently loaded browser-side appointment list. For
  backend-backed calendars, persist to your backend first or call `refresh` after saving.
- `refresh` reloads data from `url`.
- `render` re-renders already loaded data without calling `url`.
- `year` view uses summary objects (`date`, `total`, optional `content`), not full appointment objects.
- Tasks are normal appointment objects with a `task` object.

## Appointment Data

For `day`, `4day`, `week`, `month`, and search results, appointments use this shape:

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
  "icon": "bi bi-briefcase",
  "link": "https://example.com",
  "location": "Room 5A",
  "editable": true,
  "deleteable": true,
  "overlap": false,
  "task": {
    "checked": false,
    "priority": "high",
    "due": "2026-05-08 09:30:00"
  }
}
```

Required fields:

| Field   | Type     | Description                                                                                                             |
|---------|----------|-------------------------------------------------------------------------------------------------------------------------|
| `title` | `string` | Appointment title.                                                                                                      |
| `start` | `string` | Start date/time in `YYYY-MM-DD HH:mm:ss`, `YYYY-MM-DD`, or another local date-time format accepted by `parseDateInput`. |
| `end`   | `string` | End date/time in `YYYY-MM-DD HH:mm:ss`, `YYYY-MM-DD`, or another local date-time format accepted by `parseDateInput`.   |

Optional fields:

| Field         | Type                             | Default                  | Description                                                                                                                                        |
|---------------|----------------------------------|--------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| `id`          | `string` or `number`             | generated when missing   | Required for later `editAppointment` and `deleteAppointment` calls. Missing IDs are generated with `crypto.randomUUID()` when available.           |
| `allDay`      | `boolean`                        | `false`                  | Treat the appointment as an all-day item.                                                                                                          |
| `calendarId`  | `string` or `number`             | none                     | Useful for server-side or custom filtering by calendar.                                                                                            |
| `description` | `string`                         | none                     | Rendered by the default info window formatter as HTML.                                                                                             |
| `color`       | `string`                         | `mainColor`              | Bootstrap color, CSS color, CSS variable, or class combination.                                                                                    |
| `icon`        | `string`                         | appointment/all-day icon | Bootstrap icon class for this appointment. Task state icons override this for task rendering.                                                      |
| `link`        | `string` or `object`             | none                     | Rendered by the default info window formatter.                                                                                                     |
| `location`    | `string`, `array`, or `null`     | none                     | Rendered by the default info window formatter. Arrays are joined with `<br>`.                                                                      |
| `editable`    | `boolean`, `string`, or `number` | `true`                   | Controls whether the info window shows edit/duplicate controls. Boolean-like strings such as `"false"`, `"0"`, and `"no"` are treated as false.    |
| `deleteable`  | `boolean`                        | `true`                   | Controls whether the info window shows a delete button.                                                                                            |
| `overlap`     | `boolean`, `string`, or `number` | `false`                  | Day/week/4day view only. Boolean-like `true`, `"true"`, `"1"`, or `"yes"` renders this appointment full-width and stacked instead of side-by-side. |
| `task`        | `object` or `null`               | none                     | If provided, the appointment is treated as a task. See [Task fields](#task-fields).                                                                |

Reserved field:

| Field    | Description                                                                                      |
|----------|--------------------------------------------------------------------------------------------------|
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
  "html": "<strong>Open</strong>",
  "color": "primary"
}
```

Link object fields:

| Field      | Type      | Default                 | Description                               |
|------------|-----------|-------------------------|-------------------------------------------|
| `href`     | `string`  | none                    | Link URL. Empty links are not rendered.   |
| `text`     | `string`  | `href`                  | Link text when `html` is not provided.    |
| `target`   | `string`  | `"_blank"`              | Link target.                              |
| `rel`      | `string`  | `"noopener noreferrer"` | Link `rel` attribute.                     |
| `disabled` | `boolean` | `false`                 | If true, no link is rendered.             |
| `html`     | `string`  | none                    | Raw HTML content for the link body.       |
| `color`    | `string`  | `"primary"`             | Color used by the default link formatter. |

### Task Fields

An appointment is treated as a task when it contains a truthy `task` object.

| Field      | Type               | Default    | Description                                                                                                                 |
|------------|--------------------|------------|-----------------------------------------------------------------------------------------------------------------------------|
| `checked`  | `boolean`          | `false`    | Whether the task is completed. Completed tasks render muted/struck through.                                                 |
| `priority` | `string`           | `"normal"` | Supported values are `"low"`, `"normal"`, and `"high"`. Missing, empty, or unsupported values are normalized to `"normal"`. |
| `due`      | `string` or `null` | `null`     | Optional due date/time. If it is in the past and the task is not checked, `task.isOverdue` is generated internally.         |

Task behavior:

- Task icons use `icons.task`, `icons.taskDone`, and `icons.taskOverdue`.
- Clicking a task icon toggles `task.checked` locally and fires `task-status-changed.bs.calendar`.
- The global task sidebar control is shown when `showTasks` is `true`.
- Task visibility state is sent to normal view requests as `showTasks`. Search requests can add it via `queryParams` if needed.
- `task.isOverdue` is internal render state. You may read it in callbacks, but you should not persist it as source data.

## Remote Data with `url`

`url` is the appointment data source. It accepts three value types:

| Value      | Behavior                                                                                                                                                             |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `null`     | No remote appointment request is made. The current appointment list is cleared and `after-load.bs.calendar` fires with an empty array. Holidays can still be loaded. |
| `string`   | The plugin sends a jQuery AJAX `GET` request to that URL with `requestData` as query data. The response must match the view/search response contract below.          |
| `function` | The function is called as `url(requestData)` and must return a Promise/thenable resolving to the response data.                                                      |

String URL example:

```javascript
$('#calendar').bsCalendar({
    url: '/api/appointments'
});
```

Function URL example:

```javascript
$('#calendar').bsCalendar({
    url(requestData) {
        return fetch('/api/appointments?' + new URLSearchParams(requestData))
            .then(response => response.json());
    }
});
```

Request data in normal appointment views:

| View                           | Request fields                                           |
|--------------------------------|----------------------------------------------------------|
| `day`, `4day`, `week`, `month` | `fromDate`, `toDate`, `view`, `showTasks`, `calendarIds` |
| `year`                         | `year`, `view`, `showTasks`, `calendarIds`               |

Request data in search mode:

| Field         | Description                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------|
| `search`      | Search string from the search input. Empty searches are skipped and return an empty local list. |
| `limit`       | Page size from `options.search.limit`.                                                          |
| `offset`      | Current search offset.                                                                          |
| `calendarIds` | Active calendar IDs, always an array.                                                           |

`showTasks` is not currently added in search mode by the fetch implementation. If your search endpoint needs it, add it via `queryParams`.

Normal response for `day`, `4day`, `week`, and `month`:

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

| Field     | Type     | Required | Description                                                   |
|-----------|----------|----------|---------------------------------------------------------------|
| `date`    | `string` | Yes      | Day in `YYYY-MM-DD` format.                                   |
| `total`   | `number` | Yes      | Badge number shown in year view. Must be greater than `0`.    |
| `content` | `string` | No       | Popover body. HTML rendering is enabled. Defaults to `total`. |

Use `queryParams` to append custom request values:

```javascript
$('#calendar').bsCalendar({
    url: '/api/appointments',
    queryParams(requestData) {
        return {
            userId: $('#user').val(),
            showTasks: requestData.showTasks
        };
    }
});
```

`queryParams` receives the generated `requestData` and should return an object. The returned object is merged into the request. Protected
keys `fromDate`, `toDate`, `year`, and `view` cannot be overridden.

You can also change remote loading at runtime:

```javascript
$('#calendar').bsCalendar('refresh', {
    url: '/api/other-appointments',
    queryParams(requestData) {
        return {teamId: 5};
    }
});
```

## Add, Edit, and Delete Workflow

`add.bs.calendar`, `edit.bs.calendar`, and `delete.bs.calendar` are intent events. They let your app open a modal, confirm destructive
actions, validate input, save to a backend, and then update the calendar.

Callback options receive the same payloads:

| Event                | Callback                                  | Payload                                   |
|----------------------|-------------------------------------------|-------------------------------------------|
| `add.bs.calendar`    | `onAdd(data, dragExtras)`                 | Proposed start/end for a new appointment. |
| `edit.bs.calendar`   | `onEdit(appointment, extras, dragExtras)` | Current appointment plus render context.  |
| `delete.bs.calendar` | `onDelete(appointment, extras)`           | Appointment selected for deletion.        |

After a local mutation method has succeeded, the calendar fires completion events:

| Event                 | Callback                         | Payload                             |
|-----------------------|----------------------------------|-------------------------------------|
| `added.bs.calendar`   | `onAdded(appointment, extras)`   | Appointment that was added.         |
| `edited.bs.calendar`  | `onEdited(appointment, extras)`  | Appointment after the local update. |
| `deleted.bs.calendar` | `onDeleted(appointment, extras)` | Appointment that was removed.       |

When drag-create is used, `dragExtras` contains the proposed `start`, `end`, and hour-slot rule availability data. When drag-move is
used, `appointment` still contains the original appointment and `dragExtras` contains the proposed new range.

If `hourSlots.rules[].mode` is `blocked` or `exclusive`, interactive creation and drag-moving respect those rules. Day/week/4day
drag-create and drag-move clamp to the nearest valid rule edge while dragging; invalid click-create and invalid drop targets
do not fire `add.bs.calendar` or `edit.bs.calendar`.

For drag-create and drag-move, the allowed interval starts as every `exclusive` range for that weekday. If no `exclusive` range exists,
the whole visible `hourSlots.start` to `hourSlots.end` range is allowed. `blocked` ranges are then subtracted from those intervals.
`preferred` ranges do not block dragging.

For backend-backed calendars, save to your backend first and then either call `refresh` so the updated data is loaded from `url`, or call
`addAppointment`, `editAppointment`, or `deleteAppointment` for an immediate local update and ensure the backend returns the same data on
the next `refresh`.

## Options

All options can be passed during initialization:

```javascript
$('#calendar').bsCalendar({
    locale: 'de-DE',
    startView: 'week'
});
```

Options may also be supplied through jQuery `data-*` attributes. JavaScript options override data attributes. Some options can be changed
later with `updateOptions`.

| Option                        | Type                                          | Default                                                    | Description                                                                                                        |
|-------------------------------|-----------------------------------------------|------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| `showAbout`                   | `boolean`                                     | `true`                                                     | Shows the About dropdown.                                                                                          |
| `locale`                      | `string`                                      | `"en-GB"`                                                  | Locale for labels and date formatting. Underscores are normalized to hyphens.                                      |
| `title`                       | `string` or `null`                            | `null`                                                     | HTML/string title in the toolbar.                                                                                  |
| `startWeekOnSunday`           | `boolean`                                     | `true`                                                     | If `false`, weeks start on Monday.                                                                                 |
| `navigateOnWheel`             | `boolean`                                     | `true`                                                     | Enables mouse-wheel navigation over the calendar.                                                                  |
| `rounded`                     | `number`                                      | `5`                                                        | Bootstrap rounded level `0` to `5`. Invalid values fall back to `5`.                                               |
| `border`                      | `string`                                      | `"border border-0 rounded-0 shadow"`                       | Bootstrap classes used by bordered calendar UI elements.                                                           |
| `search`                      | `object` or `null`                            | `{limit: 10, offset: 0}`                                   | Search config. Set `null` to disable search UI.                                                                    |
| `search.limit`                | `number`                                      | `10`                                                       | Number of search results per page.                                                                                 |
| `search.offset`               | `number`                                      | `0`                                                        | Initial search offset.                                                                                             |
| `startDate`                   | `Date` or `string`                            | `new Date()`                                               | Initial reference date. String values are parsed during initialization.                                            |
| `startView`                   | `string`                                      | `"month"`                                                  | Initial view. Allowed values: `day`, `4day`, `week`, `month`, `year`. Must be enabled in `views`.                  |
| `mainColor`                   | `string`                                      | `"primary"`                                                | Default color used by highlights, controls, and appointments.                                                      |
| `views`                       | `array` or comma-separated `string`           | `["year", "month", "week", "4day", "day"]`                 | Enabled views. Invalid entries are removed; duplicates are removed; empty result falls back to all possible views. |
| `holidays`                    | `object` or `null`                            | `null`                                                     | OpenHolidays configuration. See [Holidays](#holidays).                                                             |
| `showAddButton`               | `boolean`                                     | `true`                                                     | Shows the toolbar add button.                                                                                      |
| `draggable`                   | `boolean`                                     | `false`                                                    | Enables drag-create in day/week/4day view and drag-move in day/week/4day/month view. Touch uses long-press and locks native scrolling while dragging. |
| `draggableSnapMinutes`        | `number`                                      | `5`                                                        | Snap interval in minutes for drag-create/move in day/week/4day view. Minimum is `1`.                               |
| `translations`                | `object`                                      | `{search, searchNoResult}` merged with locale translations | Custom UI translations. See [Localization and Translations](#localization-and-translations).                       |
| `icons`                       | `object`                                      | see [Icons](#icons)                                        | Bootstrap icon classes.                                                                                            |
| `url`                         | `null`, `string`, or `function`               | `null`                                                     | Appointment data source. See [Remote Data with `url`](#remote-data-with-url).                                      |
| `queryParams`                 | `function` or `null`                          | `null`                                                     | Adds custom request params before loading appointments.                                                            |
| `topbarAddons`                | selector, element, jQuery object, or `null`   | `null`                                                     | Element(s) inserted after the top toolbar.                                                                         |
| `sidebarAddons`               | selector, element, jQuery object, or `null`   | `null`                                                     | Element(s) appended to the sidebar.                                                                                |
| `formatter`                   | `object`                                      | see [Formatters](#formatters)                              | Custom render functions.                                                                                           |
| `hourSlots`                   | `object`                                      | `{height: 30, start: 0, end: 24}`                          | Day/week/4day hour grid configuration.                                                                             |
| `hourSlots.height`            | `number`                                      | `30`                                                       | Height in pixels for one hour. Minimum normalized value is `1`.                                                    |
| `hourSlots.start`             | `number` or `string`                          | `0`                                                        | First visible hour. Normalized to `0` to `23`. Supports decimals and `HH:mm` strings.                               |
| `hourSlots.end`               | `number` or `string`                          | `24`                                                       | Last visible hour boundary. Normalized to `1` to `24` and kept greater than `start`. Supports decimals and `HH:mm` strings. |
| `hourSlots.rules`             | `object`, `array`, or `null`                  | `null`                                                     | Highlight and availability rules for specific time slots. Accepts one object or an array of objects.               |
| `hourSlots.rules.startTime`   | `string`                                      | `'08:00'`                                                  | Start time for each rule range (format `HH:mm`).                                                                   |
| `hourSlots.rules.endTime`     | `string`                                      | `'17:00'`                                                  | End time for each rule range (format `HH:mm`).                                                                     |
| `hourSlots.rules.daysOfWeek`  | `array`                                       | `[1,2,3,4,5]`                                              | Days of the week (0-6, Sun-Sat) for each rule range.                                                               |
| `hourSlots.rules.mode`        | `string`                                      | `'highlight'`                                              | `exclusive` allows creation/move only inside the range, `blocked` prevents overlapping creation/move, `preferred` marks preferred work time, omitted mode only highlights. |
| `hourSlots.rules.color`       | `string`                                      | `rgba(0,0,0,0.05)`                                         | Color/styling for each rule range, normalized with `getColors`.                                                    |
| `calendars`                   | `array` or `null`                             | `null`                                                     | Sidebar calendar filters.                                                                                          |
| `onAll`                       | `function`, function-name `string`, or `null` | `null`                                                     | Receives every event name and payload.                                                                             |
| `onInit`                      | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `init.bs.calendar`.                                                                                |
| `onAdd`                       | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `add.bs.calendar`.                                                                                 |
| `onAdded`                     | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `added.bs.calendar`.                                                                               |
| `onEdit`                      | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `edit.bs.calendar`.                                                                                |
| `onEdited`                    | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `edited.bs.calendar`.                                                                              |
| `onDuplicate`                 | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `duplicate.bs.calendar`.                                                                           |
| `onDelete`                    | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `delete.bs.calendar`.                                                                              |
| `onDeleted`                   | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `deleted.bs.calendar`.                                                                             |
| `onView`                      | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `view.bs.calendar`.                                                                                |
| `onBeforeLoad`                | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `before-load.bs.calendar`.                                                                         |
| `onAfterLoad`                 | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `after-load.bs.calendar`.                                                                          |
| `onTaskStatusChanged`         | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `task-status-changed.bs.calendar`.                                                                 |
| `onShowInfoWindow`            | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `show-info-window.bs.calendar`.                                                                    |
| `onHideInfoWindow`            | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `hide-info-window.bs.calendar`.                                                                    |
| `onNavigateForward`           | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `navigate-forward.bs.calendar`.                                                                    |
| `onNavigateBack`              | `function`, function-name `string`, or `null` | `null`                                                     | Same payload as `navigate-back.bs.calendar`.                                                                       |
| `storeState`                  | `boolean`                                     | `false`                                                    | Persists selected view, active calendars, and task visibility in `localStorage`.                                   |
| `showTasks`                   | `boolean`                                     | `true`                                                     | Enables task UI and the global task toggle in the sidebar.                                                         |
| `debug`                       | `boolean`                                     | `false`                                                    | Enables debug logging.                                                                                             |

### Hour Slot Rule Priority

`hourSlots.rules` affect availability in this order:

1. `blocked` wins whenever the requested time range overlaps a blocked range.
2. `exclusive` applies next. If any `exclusive` rule exists for the weekday, work is allowed only when the requested time range is fully
   contained in an `exclusive` range.
3. `preferred` allows work and sets `isPreferred`.
4. `highlight` or an omitted `mode` is visual only and does not block work.
5. If no rule matches, work is allowed.

This means overlapping `blocked` and `exclusive` rules are treated as blocked. Overlapping `blocked` and `preferred` rules are also
treated as blocked.

Slot background colors use the same mode-aware priority. For overlapping colors, the winning availability rule provides the color.

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

| Field    | Type                 | Required | Default        | Description                                               |
|----------|----------------------|----------|----------------|-----------------------------------------------------------|
| `id`     | `string` or `number` | Yes      | none           | Sent in `calendarIds`. Entries without an ID are removed. |
| `title`  | `string`             | No       | `Calendar {i}` | Sidebar label.                                            |
| `color`  | `string`             | No       | `mainColor`    | Sidebar color, normalized with `getColors`.               |
| `active` | `boolean`            | No       | `true`         | Initial filter state.                                     |

### Translations

| Key                  | English default          | Description                               |
|----------------------|--------------------------|-------------------------------------------|
| `today`              | `"Today"`                | Text for the Today button.                |
| `day`                | `"Day"`                  | Label for the day view.                   |
| `4day`               | `"4 Days"`               | Label for the 4-day view.                 |
| `week`               | `"Week"`                 | Label for the week view.                  |
| `month`              | `"Month"`                | Label for the month view.                 |
| `year`               | `"Year"`                 | Label for the year view.                  |
| `search`             | `"Type and press Enter"` | Search placeholder.                       |
| `searchNoResult`     | `"No appointment found"` | Empty search message.                     |
| `tasks`              | `"Tasks"`                | Label for the task toggle and task badge. |
| `taskPriorityHigh`   | `"High"`                 | Label for high-priority task badge.       |
| `taskPriorityNormal` | `"Medium"`               | Label for normal-priority task badge.     |
| `taskPriorityLow`    | `"Low"`                  | Label for low-priority task badge.        |
| `duplicate`          | `"Duplicate"`            | Info-window duplicate action label.       |

### Icons

| Key                 | Default                        |
|---------------------|--------------------------------|
| `day`               | `"bi bi-calendar-day"`         |
| `4day`              | `"bi bi-calendar-range"`       |
| `week`              | `"bi bi-kanban"`               |
| `month`             | `"bi bi-calendar-month"`       |
| `year`              | `"bi bi-calendar4"`            |
| `about`             | `"bi bi-info-circle"`          |
| `add`               | `"bi bi-plus-lg"`              |
| `menu`              | `"bi bi-layout-sidebar-inset"` |
| `search`            | `"bi bi-search"`               |
| `prev`              | `"bi bi-chevron-left"`         |
| `next`              | `"bi bi-chevron-right"`        |
| `link`              | `"bi bi-box-arrow-up-right"`   |
| `appointment`       | `"bi bi-clock"`                |
| `appointmentAllDay` | `"bi bi-brightness-high"`      |
| `task`              | `"bi bi-circle"`               |
| `taskDone`          | `"bi bi-check2-circle"`        |
| `taskOverdue`       | `"bi bi-exclamation-circle"`   |

## Events and Callbacks

Events use the `.bs.calendar` namespace:

```javascript
$('#calendar').on('view.bs.calendar', function (event, view) {
    console.log(view);
});
```

Callback options receive the same payload as their matching event, without the jQuery event object. Callback options may be functions or
global function-name strings.

| Event                             | Callback option                           | jQuery handler payload                     | Description                                                                                 |
|-----------------------------------|-------------------------------------------|--------------------------------------------|---------------------------------------------------------------------------------------------|
| `all.bs.calendar`                 | `onAll(eventName, ...params)`             | `(event, eventName, ...params)`            | Fired before every specific event except `all` itself. `eventName` includes `.bs.calendar`. |
| `init.bs.calendar`                | `onInit()`                                | `(event)`                                  | Calendar initialized.                                                                       |
| `add.bs.calendar`                 | `onAdd(data, dragExtras)`                 | `(event, data, dragExtras)`                | Add intent from toolbar, day/hour click, date click, or drag-create.                        |
| `added.bs.calendar`               | `onAdded(appointment, extras)`            | `(event, appointment, extras)`             | Appointment added with `addAppointment`.                                                    |
| `edit.bs.calendar`                | `onEdit(appointment, extras, dragExtras)` | `(event, appointment, extras, dragExtras)` | Edit intent from info window or drag-move.                                                  |
| `edited.bs.calendar`              | `onEdited(appointment, extras)`           | `(event, appointment, extras)`             | Appointment updated with `editAppointment`.                                                 |
| `duplicate.bs.calendar`           | `onDuplicate(appointment, extras)`        | `(event, appointment, extras)`             | Duplicate action clicked in the info window.                                                |
| `delete.bs.calendar`              | `onDelete(appointment, extras)`           | `(event, appointment, extras)`             | Delete intent from info window.                                                             |
| `deleted.bs.calendar`             | `onDeleted(appointment, extras)`          | `(event, appointment, extras)`             | Appointment removed with `deleteAppointment`.                                               |
| `view.bs.calendar`                | `onView(view)`                            | `(event, view)`                            | View rendered or changed.                                                                   |
| `navigate-forward.bs.calendar`    | `onNavigateForward(view, from, to)`       | `(event, view, from, to)`                  | Forward navigation completed. `from` and `to` are `Date` objects.                           |
| `navigate-back.bs.calendar`       | `onNavigateBack(view, from, to)`          | `(event, view, from, to)`                  | Backward navigation completed. `from` and `to` are `Date` objects.                          |
| `show-info-window.bs.calendar`    | `onShowInfoWindow(appointment, extras)`   | `(event, appointment, extras)`             | Info window is about to be shown for a newly created info modal.                            |
| `hide-info-window.bs.calendar`    | `onHideInfoWindow()`                      | `(event)`                                  | Info window closed by outside click.                                                        |
| `before-load.bs.calendar`         | `onBeforeLoad(requestData)`               | `(event, requestData)`                     | Fired after `requestData` is built and before remote loading starts.                        |
| `after-load.bs.calendar`          | `onAfterLoad(appointments)`               | `(event, appointments)`                    | Fired after appointment data has been normalized and stored.                                |
| `task-status-changed.bs.calendar` | `onTaskStatusChanged(appointment)`        | `(event, appointment)`                     | A task checkbox icon was toggled locally.                                                   |

## Methods

Call methods with the jQuery plugin method syntax:

```javascript
$('#calendar').bsCalendar('refresh');
```

| Method                | Params                                                              | Description                                                                                                                                                               |
|-----------------------|---------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `refresh`             | optional `{url, view, queryParams}`                                 | Reloads and renders. Can update `settings.url`, switch to an enabled `view`, and replace `queryParams` before loading.                                                    |
| `render`              | none                                                                | Re-renders current loaded data without fetching.                                                                                                                          |
| `clear`               | none                                                                | Clears rendered appointments and local appointment data. Ignored in search mode.                                                                                          |
| `updateOptions`       | `object`                                                            | Deep-merges runtime options, normalizes settings, rebuilds affected UI, and fetches data.                                                                                 |
| `addAppointment`      | appointment object                                                  | Adds one local appointment, generates an ID if missing, normalizes it, renders, and fires `added.bs.calendar`. Ignored in search mode and year view.                      |
| `editAppointment`     | appointment object with `id`, or `{id, appointment}` / `{id, data}` | Deep-merges changes into the currently loaded appointment with the same ID, normalizes it, renders, and fires `edited.bs.calendar`. Ignored in search mode and year view. |
| `editApointment`      | same as `editAppointment`                                           | Backward-compatible misspelled alias.                                                                                                                                     |
| `deleteAppointment`   | appointment `id` or object with `id`                                | Deletes one currently loaded appointment by ID, renders, and fires `deleted.bs.calendar`. Ignored in search mode and year view.                                           |
| `destroy`             | none                                                                | Removes generated markup/events, aborts outstanding appointment requests, removes the info modal, and restores the original element state.                                |
| `setDate`             | date string, `Date`, or `{date, view}`                              | Sets the visible reference date and optionally switches to an enabled view. Ignored in search mode.                                                                       |
| `setToday`            | optional view string                                                | Sets the reference date to today and optionally switches to an enabled view. Ignored in search mode.                                                                      |
| `setView`             | view string                                                         | Switches to an enabled view and reloads/renders. Ignored in search mode.                                                                                                  |
| `setHourSlotRules`     | `object`, `array`, or `null`                                         | Updates `hourSlots.rules` and refreshes the grid.                                                                                                                       |
| `setLocale`           | locale string                                                       | Normalizes the locale and applies it through `updateOptions`. Ignored in search mode.                                                                                     |

Examples:

```javascript
$('#calendar').bsCalendar('refresh', {url: '/api/appointments'});
$('#calendar').bsCalendar('render');
$('#calendar').bsCalendar('clear');
$('#calendar').bsCalendar('updateOptions', {locale: 'fr-FR'});
$('#calendar').bsCalendar('addAppointment', {title: 'Call', start: '2026-05-08 10:00:00', end: '2026-05-08 10:30:00'});
$('#calendar').bsCalendar('editAppointment', {id: 123, title: 'Updated'});
$('#calendar').bsCalendar('deleteAppointment', 123);
$('#calendar').bsCalendar('setDate', {date: '2026-05-08', view: 'day'});
$('#calendar').bsCalendar('setToday', 'week');
$('#calendar').bsCalendar('setView', 'month');
$('#calendar').bsCalendar('setHourSlotRules', [
    {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: '09:00',
        endTime: '17:00',
        mode: 'exclusive',
        color: 'rgba(25, 135, 84, 0.055)'
    },
    {
        daysOfWeek: [6],
        startTime: '10:00',
        endTime: '14:00',
        mode: 'preferred',
        color: 'rgba(13, 110, 253, 0.045)'
    },
    {
        daysOfWeek: [0],
        startTime: '00:00',
        endTime: '23:59',
        mode: 'blocked',
        color: 'rgba(220, 53, 69, 0.06)'
    }
]);
$('#calendar').bsCalendar('setLocale', 'de-DE');
$('#calendar').bsCalendar('destroy');
```

There is no public `getAppointment` method. The plugin only stores the currently loaded view/search appointment slice, so ID lookup would
not be a reliable global data access API.

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

| Formatter  | Signature                     | Return                           |
|------------|-------------------------------|----------------------------------|
| `day`      | `(appointment, extras)`       | HTML/string                      |
| `week`     | `(appointment, extras)`       | HTML/string                      |
| `allDay`   | `(appointment, extras, view)` | HTML/string                      |
| `month`    | `(appointment, extras)`       | HTML/string                      |
| `search`   | `(appointment, extras)`       | HTML/string                      |
| `holiday`  | `(holiday, view)`             | HTML/string                      |
| `window`   | `(appointment, extras)`       | Promise resolving to HTML/string |
| `duration` | `(duration)`                  | string                           |

## Extras Object

`extras` is generated for each appointment after loading/normalization.

| Field                       | Description                                                               |
|-----------------------------|---------------------------------------------------------------------------|
| `locale`                    | Locale used for formatting.                                               |
| `icon`                      | Appointment or task icon class used for rendering.                        |
| `colors.origin`             | Original color value.                                                     |
| `colors.backgroundColor`    | Computed background color.                                                |
| `colors.backgroundImage`    | Computed background image/gradient.                                       |
| `colors.color`              | Computed text color.                                                      |
| `colors.classList`          | Computed Bootstrap classes, if applicable.                                |
| `colors.hex`                | Computed hexadecimal color (`#rrggbb`) when resolvable, otherwise `null`. |
| `start.date`                | Start date in `YYYY-MM-DD`.                                               |
| `start.time`                | Start time in `HH:MM:SS`.                                                 |
| `end.date`                  | End date in `YYYY-MM-DD`.                                                 |
| `end.time`                  | End time in `HH:MM:SS`.                                                   |
| `duration.days`             | Full days.                                                                |
| `duration.hours`            | Remaining hours.                                                          |
| `duration.minutes`          | Remaining minutes.                                                        |
| `duration.seconds`          | Remaining seconds.                                                        |
| `duration.totalMinutes`     | Total minutes.                                                            |
| `duration.totalSeconds`     | Total seconds.                                                            |
| `duration.formatted`        | Formatter output from `formatter.duration`.                               |
| `hourSlotRules`              | Mode-aware availability object derived from `hourSlots.rules`.                  |
| `displayDates`              | Per-day display data used by month/week/day rendering.                    |
| `allDay`                    | Whether the appointment is all-day.                                       |
| `inADay`                    | Whether it stays within one calendar day.                                 |
| `isToday`                   | Whether the start date is today.                                          |
| `isNow`                     | Whether the current time is between start and end.                        |

`extras.hourSlotRules` and drag `dragExtras.hourSlotRules` contain:

| Field         | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `canWork`     | `false` for blocked ranges and outside exclusive ranges, otherwise `true`.   |
| `mode`        | Matching mode: `exclusive`, `preferred`, `blocked`, `highlight`, or `null`.  |
| `reason`      | Availability reason: `available`, `blocked`, `exclusive`, `outsideExclusive`, `preferred`, or `highlighted`. |
| `range`       | The matching `hourSlots.rules` object, or `null`.                           |
| `inRange`     | Whether the appointment is fully contained in the matching range.            |
| `isBlocked`   | Whether the range blocks work.                                               |
| `isPreferred` | Whether the range marks preferred work time.                                 |
| `isExclusive` | Whether exclusive mode affects this appointment.                             |

`displayDates[]` entries contain:

| Field            | Description                                     |
|------------------|-------------------------------------------------|
| `date`           | Display date.                                   |
| `day`            | Weekday index.                                  |
| `times.start`    | Visible start time for that day.                |
| `times.end`      | Visible end time for that day.                  |
| `visibleInWeek`  | Whether this date is visible in week/4day view. |
| `visibleInMonth` | Whether this date is visible in month view.     |

Year-view summary objects get a smaller `extras` object with `colors`, `isToday`, and `isNow`.

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
//   color: '#000000' or '#FFFFFF',
//   hex: '#ff5733'
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

| Key            | Type               | Default         | Description                                           |
|----------------|--------------------|-----------------|-------------------------------------------------------|
| `country`      | `string` or `null` | locale country  | ISO 3166-1 alpha-2 country code.                      |
| `federalState` | `string` or `null` | `null`          | Subdivision/state code. Required for school holidays. |
| `language`     | `string` or `null` | locale language | ISO 639-1 language code.                              |

If `url` is `null`, holidays can still be loaded and rendered.

## Localization and Translations

The `locale` option has two responsibilities:

- It controls date/time formatting through `Intl.DateTimeFormat`.
- Its language part selects the built-in translation object. For example, `de-DE`, `de-AT`, and `de_CH` all use the `de` translations after
  locale normalization.

If no matching language exists, bs-calendar falls back to English.

### Built-In Languages

| Code | Language           |
|------|--------------------|
| `ar` | Arabic             |
| `he` | Hebrew             |
| `zh` | Chinese Simplified |
| `en` | English            |
| `de` | German             |
| `es` | Spanish            |
| `fr` | French             |
| `it` | Italian            |
| `pt` | Portuguese         |
| `nl` | Dutch              |
| `pl` | Polish             |
| `ru` | Russian            |
| `uk` | Ukrainian          |
| `tr` | Turkish            |
| `ja` | Japanese           |
| `ko` | Korean             |
| `hi` | Hindi              |
| `id` | Indonesian         |
| `vi` | Vietnamese         |
| `th` | Thai               |
| `cs` | Czech              |
| `sv` | Swedish            |
| `da` | Danish             |
| `no` | Norwegian          |
| `fi` | Finnish            |
| `ro` | Romanian           |
| `el` | Greek              |

### Translation Keys

All built-in translation objects currently use these keys:

| Key                  | English default          | Used for                                      |
|----------------------|--------------------------|-----------------------------------------------|
| `today`              | `"Today"`                | Today toolbar button.                         |
| `day`                | `"Day"`                  | Day view label.                               |
| `4day`               | `"4 Days"`               | 4-day view label.                             |
| `week`               | `"Week"`                 | Week view label.                              |
| `month`              | `"Month"`                | Month view label.                             |
| `year`               | `"Year"`                 | Year view label.                              |
| `search`             | `"Type and press Enter"` | Search input placeholder.                     |
| `searchNoResult`     | `"No appointment found"` | Empty search result message.                  |
| `tasks`              | `"Tasks"`                | Task sidebar toggle and task badge label.     |
| `taskPriorityHigh`   | `"High"`                 | High-priority task badge.                     |
| `taskPriorityNormal` | `"Medium"`               | Normal-priority task badge.                   |
| `taskPriorityLow`    | `"Low"`                  | Low-priority task badge.                      |
| `duplicate`          | `"Duplicate"`            | Duplicate action in the info-window dropdown. |

### Selecting A Locale

```javascript
$('#calendar').bsCalendar({
    locale: 'de-DE'
});
```

Underscores are normalized, so `de_DE` is treated as `de-DE`.

### Overriding Strings Per Instance

You can override individual strings without redefining the whole language. Custom `translations` are merged with the selected built-in
language.

```javascript
$('#calendar').bsCalendar({
    locale: 'en-GB',
    translations: {
        today: 'Now',
        search: 'Find appointments...',
        taskPriorityNormal: 'Normal',
        duplicate: 'Copy'
    }
});
```

### Registering Or Replacing A Language

Use `$.bsCalendar.addTranslation(locale, translation)` before initialization. Only the language code before the hyphen is used as the
registry key. For example, `de-CH` registers or replaces `de`, not a separate Swiss-German variant.

```javascript
$.bsCalendar.addTranslation('eo', {
    today: 'Hodiau',
    day: 'Tago',
    '4day': '4 Tagoj',
    week: 'Semajno',
    month: 'Monato',
    year: 'Jaro',
    search: 'Tajpu kaj premu Enter',
    searchNoResult: 'Neniu rendevuo trovita',
    tasks: 'Taskoj',
    taskPriorityHigh: 'Alta',
    taskPriorityNormal: 'Normala',
    taskPriorityLow: 'Malalta',
    duplicate: 'Duobligi'
});

$('#calendar').bsCalendar({
    locale: 'eo'
});
```

For regional wording differences, keep the regional `locale` for date formatting and override strings per instance:

```javascript
$('#calendar').bsCalendar({
    locale: 'de-CH',
    translations: {
        taskPriorityNormal: 'Normal',
        duplicate: 'Kopieren'
    }
});
```

### Reading Translations Programmatically

These helpers use the language key. If you pass a regional locale like `de-DE`, only `de` is used internally.

```javascript
const de = $.bsCalendar.getTranslations('de');
const today = $.bsCalendar.getTranslation('de', 'today');
const fallback = $.bsCalendar.getTranslation('xx', 'duplicate'); // English fallback
```

### Changing Locale At Runtime

Use `setLocale` when you only want to change the locale. Use `updateOptions` when you also want to override translation keys at the same
time.

```javascript
$('#calendar').bsCalendar('setLocale', 'es-ES');

$('#calendar').bsCalendar('updateOptions', {
    locale: 'fr-FR',
    translations: {
        duplicate: 'Copier'
    }
});
```

Runtime locale changes are ignored while the calendar is in search mode.

## Utilities

Global API:

```javascript
$.bsCalendar.version;
$.bsCalendar.about;
$.bsCalendar.possibleViews;
$.bsCalendar.setDefaults({locale: 'de-DE'});
$.bsCalendar.getDefaults();
$.bsCalendar.addTranslation('es', {today: 'Hoy'});
$.bsCalendar.getTranslations('de');
$.bsCalendar.getTranslation('de', 'today');
```

Appointment and date helpers:

```javascript
const hourNumber = $.bsCalendar.utils.parseTimeToDecimal('08:30'); // output -> 8.5
const appointments = $.bsCalendar.utils.convertIcsToAppointments(icsString);
const date = $.bsCalendar.utils.parseDateInput('2026-05-08 10:00:00');
const normalized = $.bsCalendar.utils.normalizeDateTime('2026-05-08 10:00');
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
const computed = $.bsCalendar.utils.computeColor('primary');
const styles = $.bsCalendar.utils.getComputedStyles('danger opacity-75 gradient');
const direct = $.bsCalendar.utils.isDirectColorValid('#ff5733');
const resolved = $.bsCalendar.utils.resolveColor('steelblue');
const dark = $.bsCalendar.utils.isDarkColor('#000000');
const hex = $.bsCalendar.utils.toHex('rgb(255, 87, 51)');
const colors = $.bsCalendar.utils.getColors('primary', 'secondary');
const id = $.bsCalendar.utils.generateRandomString(8);
const localeParts = $.bsCalendar.utils.getLanguageAndCountry('de-DE');
const empty = $.bsCalendar.utils.isValueEmpty('');
const namedHex = $.bsCalendar.utils.colorNameToHex.steelblue;
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

- [Changelog](changelog.md)
- [Issues](https://github.com/ThomasDev-de/bs-calendar/issues)
- [License](LICENSE)

## Completeness Check

This README is intended to cover the public surface of version `2.3.5`:

- All `DEFAULTS` options from `dist/bs-calendar.js`
- All public plugin methods in the method switch
- All jQuery events emitted through `trigger()` and matching `on*` callback options
- Appointment object fields, including task fields and generated `id` behavior
- `url` value types, request data, and response contracts
- Formatter signatures
- `extras` fields used by callbacks and formatters
- Global `$.bsCalendar` API and utility helpers
- Localization and custom translation handling
