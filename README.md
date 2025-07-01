# Bootstrap Calendar Plugin
Version 1.2.3 [changelog](changelog.md#version-123)

Effortlessly manage and display calendar views with the **Bootstrap Calendar Plugin**, a lightweight yet powerful jQuery
plugin designed for modern web applications. This plugin seamlessly integrates with Bootstrap (v4 & v5), offering a
fully responsive and customizable calendar interface with advanced features such as event handling, dynamic holiday API
integration, and support for multiple views (`day`, `week`, `month`, and `year`).

Whether you're building a scheduling application, an event tracker, or simply need a robust calendar solution, this
plugin puts flexibility and ease-of-use at your fingertips. Packed with intuitive options, versatile callbacks, and a
highly customizable design, you can tailor it to fit your specific use case effortlessly.

- [Bootstrap Calendar Plugin](#bootstrap-calendar-plugin)
  + [Key Features](#key-features)
  + [Example Usage](#example-usage)
    * [Options](#options)
        + [options.holidays](#optionsholidays)
            - [Configuration Structure:](#configuration-structure)
            - [Notes](#notes)
        + [options.translations](#optionstranslations)
            - [Configuration Structure:](#configuration-structure-1)
            - [Notes](#notes-1)
        + [options.icons](#optionsicons)
            - [Configuration Structure:](#configuration-structure-2)
            - [Notes](#notes-2)
    * [Attributes for an Appointment](#attributes-for-an-appointment)
        + [Required Attributes](#required-attributes)
        + [Optional Attributes](#optional-attributes)
        + [Example](#example)
        + [Notes](#notes-3)
    * [Triggerable Events](#triggerable-events)
        + [Available Events and Parameters](#available-events-and-parameters)
        + [Usage](#usage)
        + [Notes](#notes-4)
    * [Utilities](#utilities)

### Key Features

- 🔄 **Dynamic Views**: Easily toggle between `day`, `week`, `month`, and `year` views.
- 🌐 **Localization Support**: Customize `locale`, start-of-week, and translations.
- 📅 **Event Management**: Add, edit, delete, and view appointments with ease.
- 🛠️ **Customizable Styling**: Fine-tune the appearance with support for themes, icons, and utility classes.
- 🎉 **Holiday Integration**: Fetch and display public holidays and school holidays using the `OpenHolidays API`.
- ⚡ **Interactive UI**: Navigate with mouse wheel, handle user interactions, and access powerful event callbacks.
- 🕒 **Flexible Time Slots**: Configure detailed hour slots for precision scheduling.

### Example Usage

```javascript
$('#calendar').bsCalendar({
    startView: 'week',
    locale: 'en-US',
    holidays: {country: 'US', federalState: 'CA'}
});
```

With the Bootstrap Calendar Plugin, you can turn any project into a fully functional, beautifully styled, and highly
interactive scheduling solution!

---

## Options

The calendar provides a wide range of configuration options to customize its behavior and appearance. While there are
many options available, you don’t need to configure them all—the default values are already set for common use cases.
Adjust the options as needed to better fit your specific requirements. Below is a detailed overview of all
available options, including their types, default values, and descriptions.

| **Option**            | **Type**                         | **Default Value**                                | **Description**                                                                                                                                                                                                    |
|-----------------------|----------------------------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **locale**            | `string`                         | `"en-GB"`                                        | Specifies the language and country format to be used. Determines the displayed text for months and days of the week based on the language.                                                                         |
| **title**             | `string`                         | `null`                                           | The title displayed at the top-center of the calendar. Can be a string or HTML.                                                                                                                                    |
| **startWeekOnSunday** | `boolean`                        | `true`                                           | Indicates whether the week starts on Sunday. If set to `false`, the week starts on Monday.                                                                                                                         |
| **navigateOnWheel**   | `boolean`                        | `true`                                           | Enables navigation through days, weeks, months, or years using the mouse wheel if set to `true`.                                                                                                                   |
| **rounded**           | `number`                         | `5`                                              | Specifies the border rounding of elements in pixels, enhancing the visual presentation.                                                                                                                            |
| **search.limit**      | `number`                         | `10`                                             | Sets a maximum number of search results to be returned.                                                                                                                                                            |
| **search.offset**     | `number`                         | `0`                                              | Sets an offset for starting the search results.                                                                                                                                                                    |
| **startDate**         | `Date`                           | `new Date()`                                     | The starting date for the calendar view.                                                                                                                                                                           |
| **startView**         | `string`                         | `"month"`                                        | Defines the initial view of the calendar. Acceptable values include `"year"`, `"month"`, `"week"`, and `"day"`.                                                                                                    |
| **defaultColor**      | `string`                         | `"primary"`                                      | The default color applied to calendar elements (e.g., events, highlights).                                                                                                                                         |
| **views**             | `array`                          | `["year", "month", "week", "day"]`               | Lists the available viewing modes for the calendar.                                                                                                                                                                |
| **holidays**          | `object` \| `null`               | See [options.holidays](#optionsHolidays)         | Data source for holiday display. Use an object for custom settings or `null` for no holidays.                                                                                                                      |
| **translations**      | `object`                         | See [options.translations](#optionsTranslations) | Defines translations used for various textual content in the calendar.                                                                                                                                             |
| **icons**             | `object`                         | See [options.icons](#optionsIcons)               | Specifies icons for different controls and actions in the calendar (e.g., next, back, add).                                                                                                                        |
| **url**               | `string` \| `function` \| `null` | `null`                                           | Specifies the base URL for fetching external data like holidays or events. Can be a fixed string URL or a dynamic function that generates the URL. `null` disables external requests.                              |
| **queryParams**       | `function` \| `null`             | `null`                                           | A function to dynamically define query parameters for external requests. Receives existing request data as input and returns additional key-value pairs for the request. If `null`, no extra parameters are added. |
| **topbarAddons**      | `function` \| `null`             | `null`                                           | Allows injecting additional custom content in the top navigation bar of the calendar.                                                                                                                              |
| **sidebarAddons**     | `function` \| `null`             | `null`                                           | Allows injecting additional custom content in the side navigation panel.                                                                                                                                           |
| **formatter**         | `object`                         | `formatterDay`, `formatterWeek`                  | Defines formatters to customize the display or structure of specific calendar views.                                                                                                                               |
| **hourSlots**         | `object`                         | `{height: 30, start: 0, end: 24}`                | Customizes time slots in the day or week view with detailed configurations (e.g., slot height, starting hour, ending hour).                                                                                        |
| **onAll**             | `function(eventName, ...params)` | `null`                                           | Global handler that triggers on all events. Receives the event name and additional parameters as arguments.                                                                                                        |
| **onInit**            | `function()`                     | `null`                                           | Called after the calendar is fully initialized. Use this for any required setup operations.                                                                                                                        |
| **onAdd**             | `function(data)`                 | `null`                                           | Triggered when the "Add" button is clicked or when a time grid is clicked in the day/week view. Provides an object with view-specific details.                                                                     |
| **onEdit**            | `function(appointment, extras)`  | `null`                                           | Triggered when editing an appointment. The first argument is the appointment being edited, and the second provides additional context.                                                                             |
| **onDelete**          | `function(appointment, extras)`  | `null`                                           | Triggered when deleting an appointment. The first argument is the appointment being deleted, and the second provides additional context.                                                                           |
| **onView**            | `function(view)`                 | `null`                                           | Triggered when the calendar view changes. The new view is passed as an argument.                                                                                                                                   |
| **onBeforeLoad**      | `function(requestData)`          | `null`                                           | Invoked prior to retrieving appointments. Receives contextual information, such as the current view, time span, and search term, if any.                                                                           |
| **onAfterLoad**       | `function(appointments)`         | `null`                                           | Triggers after the appointments have been loaded and gives them as parameters.                                                                                                                                     |
| **onShowInfoWindow**  | `function(appointment, extras)`  | `null`                                           | Triggered when an information dialog (info window) is displayed. The appointment and supplemental context are passed as parameters.                                                                                |
| **onHideInfoWindow**  | `function()`                     | `null`                                           | Triggered when an information dialog (info window) is closed.                                                                                                                                                      |
| **onNavigateForward** | `function(view, from, to)`       | `null`                                           | Triggered when navigating forward within the calendar. Provides the current view, and the starting and ending dates of the period.                                                                                 |
| **onNavigateBack**    | `function(view, from, to)`       | `null`                                           | Triggered when navigating backward within the calendar. Similar to `onNavigateForward`, providing the current view, and the starting/ending dates of the period.                                                   |
| **storeState**        | `boolean`                        | `false`                                          | When enabled (`true`), the current calendar state (e.g., selected view) is saved to `localStorage` and restored on the next page load.                                                                             |
| **debug**             | `boolean`                        | `false`                                          | Enables debug mode for development purposes. Logs additional information on various calendar operations.                                                                                                           |

### options.holidays

If an object is passed for this option (see structure below), holidays and school holidays will be fetched from
the [OpenHolidays API](https://www.openholidaysapi.org/en/).  
This option allows configuring the details of the holidays, such as specifying the country, federal state, and language.

- **Automatic Detection**:  
  If the `country` or `language` attributes are not explicitly set, their values are automatically determined based on
  the locale (`options.locale`) of the calendar.
- **Mandatory Field**:  
  The `federalState` field is required when fetching school holidays.

#### Configuration Structure:

| **Key**          | **Type**           | **Default Value** | **Description**                                                                                                                                                              |
|------------------|--------------------|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **federalState** | `null` \| `string` | `null`            | The federal state identifier (e.g., `DE-BE` for Berlin in Germany). This value is required when fetching school holidays.                                                    |
| **country**      | `null` \| `string` | `null`            | The country code in ISO 3166-1 alpha-2 format (e.g., `DE` for Germany). A full list of supported countries can be found [here](https://www.openholidaysapi.org/en/sources/). |
| **language**     | `null` \| `string` | `null`            | The language code in ISO 639-1 format (e.g., `DE` for German). Determines the language used when fetching holidays.                                                          |

#### Notes

- **OpenHolidays API Integration:**  
  This API serves as the source for holidays and school holidays data. Ensure the configuration matches the requirements
  of the API (e.g., valid country or state codes).

- **Dynamic Locale Handling:**  
  If `country` or `language` are omitted, their values are derived from the calendar's locale setting (specified in
  `options.locale`).

### options.translations

The `options.translations` option allows you to customize the text displayed in the calendar, enabling adaptation to
different languages or personal preferences.

#### Configuration Structure:

| **Key**            | **Type** | **Default Value**        | **Description**                                               |
|--------------------|----------|--------------------------|---------------------------------------------------------------|
| **search**         | `string` | `"Type and press Enter"` | The placeholder text displayed in the search input field.     |
| **searchNoResult** | `string` | `"No appointment found"` | The message displayed when a search query returns no results. |

#### Notes

- **Localization**:  
  This feature is particularly useful for multi-language applications, allowing developers to easily customize text
  based on user locale or branding needs.

### options.icons

The `options.icons` configuration allows customization of the icons used in the calendar interface.  
By default, icons are defined using the Bootstrap Icons library.

#### Configuration Structure:

| **Key**               | **Bootstrap Icon**           | **Description**                                   |
|-----------------------|------------------------------|---------------------------------------------------|
| **day**               | `"bi bi-calendar-day"`       | Icon for the day view.                            |
| **week**              | `"bi bi-kanban"`             | Icon for the week view.                           |
| **month**             | `"bi bi-calendar-month"`     | Icon for the month view.                          |
| **year**              | `"bi bi-calendar4"`          | Icon for the year view.                           |
| **add**               | `"bi bi-plus-lg"`            | Icon for the add button.                          |
| **menu**              | `"bi bi-list"`               | Icon for the menu button.                         |
| **search**            | `"bi bi-search"`             | Icon displayed in the search functionality.       |
| **prev**              | `"bi bi-chevron-left"`       | Icon for the previous navigation button.          |
| **next**              | `"bi bi-chevron-right"`      | Icon for the next navigation button.              |
| **link**              | `"bi bi-box-arrow-up-right"` | Icon used for links associated with the calendar. |
| **appointment**       | `"bi bi-clock"`              | Icon representing time-based appointments.        |
| **appointmentAllDay** | `"bi bi-brightness-high"`    | Icon representing all-day appointments.           |

#### Notes

- **Default Icon Library**:  
  Bootstrap Icons are used as the default icon set. Ensure the appropriate icons are loaded in your project.
- **Customization**:  
  Each key can be replaced with a different icon class to align with design requirements or preferences.

---

## Attributes for an Appointment
### Required Attributes
1. **`title`**
    - **Description**: The title of the appointment.
    - **Example**: `"Meeting with Bob"`

2. **`start`**
    - **Description**: The starting date and time of the appointment in `YYYY-MM-DD HH:mm:ss` format.
    - **Example**: `"2025-07-01 10:00:00"`

3. **`end`**
    - **Description**: The ending date and time of the appointment in `YYYY-MM-DD HH:mm:ss` format.
    - **Example**: `"2025-07-01 12:00:00"`

### Optional Attributes
1. **`id`**
    - **Description**: A unique identifier for the appointment.
    - **Example**: `1`

2. **`description`**
    - **Description**: A detailed description of the appointment.
    - **Example**: `"Discuss project roadmap and deliverables"`

3. **`allDay`**
    - **Description**: Specifies whether the appointment spans the whole day.
    - **Example**: `true` or `false`

4. **`color`**
    - **Description**: The color associated with the appointment. It can be a predefined class (`Bootstrap classes`) or a color code (e.g., HEX).
    - **Example**: `"primary"`, `"danger"`, or `"#FF5733"`

5. **`link`**
    - **Description**: A link associated with the appointment (e.g., an external reference or more details).
    - **Example**: `"https://example.com"`

6. **`location`**
    - **Description**: The location of the appointment. It can be:
        - A string: `"Conference Room A"`
        - An array: `["Room 3", "Building 1"]`
        - Or `null` if no location is specified.

### Example
```json
{
  "id": 123,
  "title": "Project Kickoff Meeting",
  "description": "Initial meeting to discuss project goals, timelines, and responsibilities.",
  "start": "2025-07-01 10:00:00",
  "end": "2025-07-01 12:00:00",
  "allDay": false,
  "color": "#FF5733",
  "link": "https://example.com/meeting-details",
  "location": [
    "Room 5A",
    "Building HQ"
  ]
}
```

### Notes
- `start` and `end` times are **mandatory** for creating valid appointments.
- Appointments marked as `allDay: true` do not require specific times, only the `start` and `end` dates.
- Additional attributes like `id`, `color`, or `link` provide extended functionality, but are not strictly required.
- When handling appointments using the modal in the code, attributes like `title`, `description`, `from_date`, `to_date`, etc., are mapped to respective inputs for user interaction.

---

## Triggerable Events

In addition to the configurable callback options like **onAdd**, **onEdit**, and **onNavigateBack**, custom events are
available for further flexibility. These events can perform specific actions when certain calendar interactions occur.
They follow the naming convention:

```
[event-name].bs.calendar
```

### Available Events and Parameters

| **Event**                        | **Parameters**         | **Description**                                                                      |
|----------------------------------|------------------------|--------------------------------------------------------------------------------------|
| **all.bs.calendar**              | `eventName, ...params` | Triggered for every calendar event.                                                  |
| **init.bs.calendar**             | `-`                    | Triggered after the calendar has been initialized.                                   |
| **add.bs.calendar**              | `data`                 | Triggered when a new item (e.g., appointment) is added.                              |
| **edit.bs.calendar**             | `appointment, extras`  | Triggered when an appointment or item is edited.                                     |
| **delete.bs.calendar**           | `appointment, extras`  | Fired when an appointment is deleted.                                                |
| **view.bs.calendar**             | `view`                 | Triggered when the calendar view is changed (e.g., from month to week).              |
| **navigate-forward.bs.calendar** | `view, from, to`       | Triggered when navigating forwards (e.g., to the next month or year).                |
| **navigate-back.bs.calendar**    | `view, from, to`       | Fired when navigating backwards (e.g., to the previous month or year).               |
| **show-info.bs.calendar**        | `appointment, extras`  | Triggered when the information dialog (info window) for an appointment is displayed. |
| **hide-info.bs.calendar**        | `-`                    | Triggered when the information dialog (info window) is closed.                       |
| **before-load.bs.calendar**      | `requestData`          | Fires before appointment data is retrieved.                                          |
| **after-load.bs.calendar**       | `appointments`         | Triggers after the appointments have been loaded and gives them as parameters.       |

### Usage

JavaScript can be used to listen to these events and take specific actions:

```javascript
$('#calendar').on('view.bs.calendar', function (event, view) {
    console.log("The calendar view has changed to:", view);
});

$('#calendar').on('add.bs.calendar', function (event, data) {
    console.log("A new appointment is to be created", data);
});

$('#calendar').on('navigate-forward.bs.calendar', function (event, view, from, to) {
    console.log(`Navigated forward in view: ${view}, from: ${from}, to: ${to}`);
});
```

### Notes

- **Global Event Handling**: The `all.bs.calendar` event provides a way to handle all events in one place with the
  `eventName` and its corresponding parameters.
- **Detailed Parameters**: Each event passes specific arguments to provide more detailed contextual information.
- **Flexibility**: These events allow developers to tap into native jQuery event management, enabling robust and custom
  handling for various use cases.

---

## Utilities

```javascript
// Available countries from the OpenHolidays API
$.bsCalendar.utils.openHolidayApi.getCountries('DE')
    .then(countries => {
        console.log('Countries loaded successfully:', countries);
    })
    .catch(error => {
        console.error('Error while fetching countries:', error.message || error);
    });

// Available languages from the OpenHolidays API
$.bsCalendar.utils.openHolidayApi.getLanguages('DE')
    .then(languages => {
        console.log(languages);
    });

// Available subdivisions (states, regions, etc.)
$.bsCalendar.utils.openHolidayApi.getSubdivisions('DE', 'DE')
    .then(subdivisions => {
        console.log(subdivisions);
    });

// Retrieve school holidays based on state and date range
$.bsCalendar.utils.openHolidayApi.getSchoolHolidays(
    'DE',          // Country (Germany)
    'BE',          // State (Berlin)
    '2025-01-01',  // Start date
    '2025-12-31'   // End date
)
    .then(schoolHolidays => {
        console.log(schoolHolidays);
    })

// Retrieve public holidays based on country, region, language, and date range
$.bsCalendar.utils.openHolidayApi.getPublicHolidays(
    'DE',          // Country (Germany)
    'BE',          // State (Berlin)
    'DE',          // Language
    '2025-01-01',  // Start date
    '2025-12-31'   // End date
)
    .then(publicHolidays => {
        console.log(publicHolidays);
    })
```
