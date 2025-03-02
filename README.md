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