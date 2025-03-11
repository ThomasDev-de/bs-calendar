<div style="border: 1px solid red; padding: 10px; background-color: #ffe6e6;">
  <strong>⚠️ Important note:</strong> The documentation is currently not complete
</div>

# **bsCalendar** - A jQuery Plugin for Bootstrap-Based Calendar Management

`bsCalendar` is a lightweight and flexible jQuery plugin designed to enable a customizable Bootstrap-based calendar. With support for multiple views (day, week, month, and year), dynamic appointment loading, and localization, `bsCalendar` is suitable for building user-friendly and responsive calendar interfaces.

---

## **Features**

- **Responsive Design**: Seamlessly integrates with Bootstrap for modern layouts.
- **Multiple Views**: Supports **day**, **week**, **month**, and **year** views.
- **Interactive Methods**: Dynamic methods for refreshing, clearing, or updating calendar data.
- **Customizable Options**: Extensive default settings to tailor the calendar to your needs.
- **Localization Support**: Translate calendar text and labels for different languages.
- **Bootstrap Icons**: Sleek, modern UI with full icon support.
- **Advanced Usage**: Fetch appointments dynamically with ease or enhance with custom sidebars.

---

## **Installation**

Add the plugin to your project by including the required dependencies and loading the corresponding CSS/JS files.

### **1. Dependencies**
Ensure the following dependencies are included:

- **jQuery** (Version 3.7.1 or higher)
- **Bootstrap** (Version 5 or higher)
- **Bootstrap Icons**

### **2. Loading Files**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css">

<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script src="path/to/bs-calendar.min.js"></script>
```

---

## **Usage**

#### **Basic Initialization**

You can easily initialize the calendar by targeting an element and passing options:

```javascript
$('#calendar').bsCalendar({
    locale: 'en-EN', 
    startView: 'month',
    startDate: new Date(),
});
```

## **Options**

---
### `string` **locale**
The `locale` option defines the default language and regional settings for the calendar. By specifying a locale string (e.g., `'en-EN'`), the calendar adapts its text, labels, and formatting according to the selected language. The default value is `'en-EN'`.

--- 
### `bool` **startWeekOnSunday**
The `startWeekOnSunday` option determines whether the calendar week begins on Sunday. By setting this option to `true`, the week starts on Sunday; otherwise, it can be set to `false` to start the week on Monday. The default value is `true`.

---
### `number` **rounded**
The `rounded` option specifies the border radius for the calendar's elements. It accepts a numeric value between `0` and `5`, where larger values result in more rounded corners. The default value is `5`.

---
### `null|object` **search**
The **`search`** option can either be `null` or an object.
If an object is provided, it can include the following properties:
- **`limit`** (`number`): Specifies the maximum number of results allowed. Default value: `10`.
- **`offset`** (`number`): Defines the starting point for the search in the results. Default value: `0`.

If set to `null`, the search functionality is disabled.

---
### `string|Date` startDate
The **`startDate`** option can be a `string` or a `Date` object.
- If a **`string`** is provided, it should follow a valid date format (e.g., `YYYY-MM-DD` or another expected format depending on the implementation).
- If a **`Date`** object is provided, it directly represents the starting date.

**Default:** If no value is provided, the default is `new Date()`, which represents the current date and time.

---
### `string` startView
The **`startView`** option is a `string` that defines the initial display or view mode.
**Default:** The default value is `"month"`, meaning the view will initially display a monthly calendar.
**Possible values:**
- `"day"`: Displays a daily view.
- `"week"`: Displays a weekly view.
- `"month"`: Displays a monthly view.
- `"year"`: Displays a yearly view.

---
### `Array<string>` views
The **`views`** option is an array of strings that defines the views accessible to the user.
**Example:**
``` javascript
views: ['year', 'month', 'week', 'day']
```
**Description of values:**
- `"year"`: Allows access to the yearly view.
- `"month"`: Allows access to the monthly view.
- `"week"`: Allows access to the weekly view.
- `"day"`: Allows access to the daily view.

The order specified in the array may also determine the order of the available views.

---
### `string` defaultColor
### 
The **`defaultColor`** option is a `string` that specifies the default color.
**Default:** The default value is `"primary"`, which usually corresponds to the default primary color defined in your Bootstrap theme.
**Possible values:**
- A Bootstrap color class (e.g., `"primary"`, `"secondary"`, `"danger"`, etc.).
- A HEX color code (e.g., `#ff5733`).
- An RGB color value (e.g., `rgb(255, 87, 51)`).
- An RGBA color value (e.g., `rgba(255, 87, 51, 0.5)`).

---
### `object` translations
The **`translations`** option is an object that provides customizable text or labels for various components, supporting localization or custom text requirements.
**Example:**
``` javascript
translations: {
    day: 'Day',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    today: 'Today',
    appointment: 'Appointment',
    search: 'Type and press Enter',
    searchNoResult: 'No appointment found'
}
```
**Description of keys:**
- **`day`**: The label for the **Day** view.
  Example: `'Day'`
- **`week`**: The label for the **Week** view.
  Example: `'Week'`
- **`month`**: The label for the **Month** view.
  Example: `'Month'`
- **`year`**: The label for the **Year** view.
  Example: `'Year'`
- **`today`**: Text for the button or section indicating **Today**.
  Example: `'Today'`
- **`appointment`**: Label for an **Appointment**.
  Example: `'Appointment'`
- **`search`**: Placeholder text for the **Search** input field.
  Example: `'Type and press Enter'`
- **`searchNoResult`**: Message displayed when no search results are found for an appointment.
  Example: `'No appointment found'`

This configuration allows you to adjust the terms used in the interface for specific languages or custom needs.

---
### `object` icons
The **`icons`** option is an object that links specific features or UI elements to corresponding icons. These icons are typically represented by CSS classes, for example, Bootstrap Icons in this case.
**Example:**
``` javascript
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
```
**Description of keys:**
- **`day`**: Icon used for the **Day** view.
- **`week`**: Icon used for the **Week** view.
- **`month`**: Icon used for the **Month** view.
- **`year`**: Icon used for the **Year** view.
- **`add`**: Icon for adding a new item (e.g., appointment, event).
- **`search`**: Icon for the **Search** functionality.
- **`prev`**: Icon for navigating to the **previous** period (e.g., day, week, month, year).
- **`next`**: Icon for navigating to the **next** period (e.g., day, week, month, year).
- **`link`**: Icon representing a **link** action or external resource.
- **`appointment`**: Icon for an **Appointment**.
- **`appointmentAllDay`**: Icon for an **All-Day Appointment**.
- **`timeSlot`**: Icon representing a **Time Slot**.

These settings allow you to customize the appearance by linking appropriate icons to specific features using icon libraries like Bootstrap Icons.

---
 to be continued ...

---
### **Methods**

`bsCalendar` provides an intuitive API with several useful methods for interacting with the calendar instance.

| **Method**         | **Description**                                                                                     | **Example**                              |
|---------------------|-----------------------------------------------------------------------------------------------------|------------------------------------------|
| `refresh`          | Refreshes the calendar view without resetting configurations.                                        | `$('#calendar').bsCalendar('refresh');`  |
| `clear`            | Clears all appointments and content within the calendar.                                             | `$('#calendar').bsCalendar('clear');`    |
| `updateOptions`    | Dynamically updates the calendar's settings.                                                         | `$('#calendar').bsCalendar('updateOptions', { startView: 'week' });` |
| `destroy`          | Completely removes the calendar instance and its data.                                               | `$('#calendar').bsCalendar('destroy');`  |
| `setDate`          | Sets the calendar to display a specific date.                                                        | `$('#calendar').bsCalendar('setDate', '2023-12-01');` |
| `setToday`         | Sets the calendar view to the current date.                                                          | `$('#calendar').bsCalendar('setToday');` |

---

### **Configuration Options**

The following configuration options are available to customize the behavior of the calendar:

```javascript
$.bsCalendar.DEFAULTS = {
    locale: 'en-EN',               // Default locale for the calendar.
    startWeekOnSunday: true,      // Start the calendar week on Sunday (true/false).
    rounded: 5,                   // Sets the border rounding (values: 1 to 5).
    search: true,                 // Enables calendar data search (true/false).
    startDate: new Date(),        // The default start date for the calendar.
    startView: 'month',           // Default view: 'day', 'week', 'month', or 'year'.
    defaultColor: 'var(--bs-danger)', // Default color for calendar items.
    views: ['year', 'month', 'week', 'day'], // Available views for the calendar.
    translations: {               // Text translations for different labels.
        day: 'Day',
        week: 'Week',
        month: 'Month',
        year: 'Year',
        today: 'Today',
        appointment: 'Appointment',
        search: 'Search',
        searchNoResult: 'No results found'
    },
    icons: {                      // Defines Bootstrap Icons used in the calendar.
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
        appointmentAllDay: 'bi bi-circle-fill',
        timeSlot: 'bi bi-caret-right-fill',
    },
    url: null,                    // Fetch data dynamically via an API URL.
    queryParams: null,            // Additional query parameters for API calls.
    sidebarAddons: null,          // Add custom sidebars or components.
    debug: false,                 // Toggle debugging mode (useful for development).
    formatInfoWindow: function () {}, // Callback to format the popup info window.
    formatDuration: function () {},   // Callback to customize the time duration display.
};
```
### the url option

The `fetchAppointments` function is responsible for dynamically loading appointments into the calendar. This function works by communicating with a backend API or data source, sending different parameters depending on the current view of the calendar or the search mode.

---

#### How It Works
1. **Clear Existing Content**  
   Clears all existing calendar data before fetching new appointments.

2. **Determine View or Search Mode**
    - If **not in search mode**, the function uses the currently active view (e.g., `day`, `week`, `month`, `year`) to calculate the appropriate date range or year.
    - If **in search mode**, it uses the search keyword entered by the user.

3. **Prepare Request Data**
    - Adds additional parameters if a custom `queryParams` option is defined.
    - Constructs the request payload according to the current view mode or search input.

4. **Trigger Events**  
   Triggers a `beforeLoad` event to allow developers to hook into the data-loading process.

5. **Fetch Data**  
   Calls the provided `url` function (or the static URL string) to fetch appointment data.
    - Supports promises for custom functions.
    - Handles API responses by updating the calendar with the fetched appointments.

6. **Handle Errors**  
   Provides robust error handling, outputs logs (if `debug` is enabled), and continues cleanly after failed requests.

---

#### Parameters Passed Based on Calendar View

| **Calendar View**     | **Request Parameters**                                                                                                                                |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Day (`day`)**        | `fromDate` (ISO format start date), `toDate` (ISO format end date), `view='day'`                                                                    |
| **Week (`week`)**      | `fromDate` (ISO format start date), `toDate` (ISO format end date), `view='week'`                                                                   |
| **Month (`month`)**    | `fromDate` (ISO format start date), `toDate` (ISO format end date), `view='month'`                                                                  |
| **Year (`year`)**      | `year` (integer year, e.g., `2023`), `view='year'`                                                                                                  |
| **Search Mode**        | `search` (string containing the search keyword)                                                                                                     |

---

#### Requirements for Custom Backend Integration

The backend must handle the following request parameters based on the view:

1. **Day, Week, or Month Views**  
   The API should read `fromDate` and `toDate` to return appointments within the given range. Example payload:
   ```json
   {
       "fromDate": "2023-12-01T00:00:00.000Z",
       "toDate": "2023-12-07T23:59:59.999Z",
       "view": "week"
   }
   ```

2. **Year View**  
   For the year view, the API should return all appointments for the given `year`. Example payload:
   ```json
   {
       "year": 2023,
       "view": "year"
   }
   ```

3. **Search Mode**  
   The API should filter appointments based on the `search` keyword. Example payload:
   ```json
   {
       "search": "meeting"
   }
   ```

---

#### Example Usage in `bsCalendar` Configuration

**1. Basic API Endpoint (Static URL)**  
Use a static URL for fetching appointments, and let `fetchAppointments` dynamically handle views and parameters:
```javascript
$('#calendar').bsCalendar({
    url: '/api/appointments', // Backend endpoint
    debug: true               // Enable logging for debugging
});
```

**2. Advanced Function-Based Data Fetching**  
For custom logic, pass a function that processes `requestData` as a payload:
```javascript
$('#calendar').bsCalendar({
    url: function (requestData) {
        return fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        }).then(res => res.json());
    },
    queryParams: function (query) {
        query.userId = 123; // Add custom parameters
        return query;
    },
    debug: true // Enable debugging
});
```

---

#### Notes for End Users
- The function automatically adapts the parameters to the current calendar view.
- The backend should support filtering by date ranges, year, and search keywords as shown above.
- Use the `debug` option to log network requests and identify integration issues.

---

This function is a cornerstone of the `bsCalendar` plugin and ensures seamless integration with data providers for dynamic and interactive calendar features.

---

### **Dynamic Data Fetching**

Use the `url` option to dynamically fetch appointments or events. You can supply a function or direct URL.

Here’s an example using a custom AJAX function:

```javascript
$('#calendar').bsCalendar({
    url: function (requestData) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/api/appointments',
                method: 'GET',
                data: requestData,
                success: resolve,
                error: reject
            });
        });
    }
});
```

---

## **Contributing**

Contributions are welcome! If you encounter a bug, have feature suggestions, or would like to contribute, feel free to open an issue or create a pull request.

---

## **License**

This project is licensed under the **MIT License**. See the LICENSE file for details.

---

## **Author**

Developed with ❤️ by **Thomas Kirsch**.
