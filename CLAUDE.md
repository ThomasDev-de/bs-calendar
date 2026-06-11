# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

`bs-calendar` is a zero-build jQuery plugin for Bootstrap 5. It ships two browser-ready files in `dist/` — there is no bundler, no npm, and no transpilation step.

## Running the demo

```bash
composer install
php -S localhost:8000 router.php
```

Open `http://localhost:8000/`. The `router.php` serves `demo/index.html` at `/` and resolves static assets from `vendor/` and `dist/`.

## Linting

JSHint is configured in `.jshintrc` (ES11, browser + node globals, jQuery and bootstrap as globals). Run it manually against `dist/bs-calendar.js`.

## No automated test suite

There are no unit or integration tests. Verify changes by running the demo and exercising the relevant paths in the browser.

## Code architecture

### Single-file plugin

All plugin logic lives in `dist/bs-calendar.js`. The file is a single IIFE `(function ($) { ... })(jQuery)` that registers the jQuery plugin `$.fn.bsCalendar` and the global namespace `$.bsCalendar`.

### Global namespace — `$.bsCalendar`

Exposed on the jQuery object after the plugin loads:

- `$.bsCalendar.setDefaults(opts)` / `getDefaults()` — mutate or read the `DEFAULTS` object used by all new instances.
- `$.bsCalendar.addTranslation(locale, obj)` / `getTranslations(lang)` / `getTranslation(lang, key)` — manage the `translations` map keyed by two-letter language codes.
- `$.bsCalendar.utils` — pure helper functions (color resolution, date parsing, ICS conversion, OpenHolidays API wrappers).
- `$.bsCalendar.version`, `$.bsCalendar.about`, `$.bsCalendar.possibleViews`.

### Instance lifecycle

Each `$el.bsCalendar(opts)` call creates per-element state stored in `$el.data('bsCalendar')`. The data object holds settings, loaded appointments, current view/date, active calendars, and an AbortController for in-flight requests.

Method dispatch is handled in a single `switch` inside `$.fn.bsCalendar`. String arguments route to methods; object arguments initialize or re-initialize.

### Views

Five views — `day`, `4day`, `week`, `month`, `year` — are each rendered by a dedicated internal function. The `year` view uses a different data contract (summary objects with `date`/`total`/`content`) rather than full appointment objects. The `day`, `4day`, and `week` views share an hour-grid renderer.

### Event/callback pattern

Every user-facing action fires a jQuery event in the `.bs.calendar` namespace on the element **and** calls the matching `on*` callback option. Intent events (`add`, `edit`, `delete`) fire before any mutation; completion events (`added`, `edited`, `deleted`) fire after `addAppointment`/`editAppointment`/`deleteAppointment` mutate local state.

### Color system

Colors are resolved through a layered utility pipeline in `$.bsCalendar.utils`: Bootstrap class names → CSS variables → hex/rgb/named-color literals. Each appointment gets an `extras.colors` object computed at load time and passed to formatters and event handlers.

### Extras object

After loading and normalization, each appointment gets an `extras` object computed by the plugin (color resolution, duration breakdown, per-day display windows, `isToday`, `isNow`). Formatters and event callbacks always receive `(appointment, extras)`. The `extras` object must never be persisted as appointment data — it is regenerated on every render.

### Remote loading

The `url` option accepts `null`, a URL string (jQuery AJAX GET), or a function returning a Promise. All three paths converge on the same normalization + render pipeline. The `queryParams` function is called after request data is built and before the request is sent; it cannot override `fromDate`, `toDate`, `year`, or `view`.

## Releasing

After changing `dist/bs-calendar.js`, regenerate `dist/bs-calendar.min.js` (minified copy). Update `changelog.md` and the `@version` JSDoc tag at the top of `dist/bs-calendar.js`.
