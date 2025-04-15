## Options

The calendar provides a wide range of configuration options to customize its behavior and appearance. While there are
many options available, you don’t need to configure them all—the default values are already set for common use cases.
Simply adjust the options as needed to better fit your specific requirements. Below is a detailed overview of all
available options, including their types, default values, and descriptions.

| **Option**        | **Type**                         | **Default Value**                  | **Description**                                                                                                                                                                                                                                 |
|-------------------|----------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| locale            | `string`                         | `"en-GB"`                          | Defines the localization (e.g., language).                                                                                                                                                                                                      |
| title             | `string`                         | `"Calendar"`                       | Title of the calendar.                                                                                                                                                                                                                          |
| startWeekOnSunday | `boolean`                        | `true`                             | Specifies whether the week should start on Sunday.                                                                                                                                                                                              |
| navigateOnWheel   | `boolean`                        | `true`                             | Enables navigation using the mouse wheel.                                                                                                                                                                                                       |
| rounded           | `number`                         | `5`                                | Rounding of elements in pixels.                                                                                                                                                                                                                 |
| search.limit      | `number`                         | `10`                               | Maximum number of search results.                                                                                                                                                                                                               |
| search.offset     | `number`                         | `0`                                | Offset for the search results.                                                                                                                                                                                                                  |
| startDate         | `Date`                           | `new Date()`                       | Start date of the calendar.                                                                                                                                                                                                                     |
| startView         | `string`                         | `"month"`                          | Starting view (`"year"`, `"month"`, `"week"`, `"day"`).                                                                                                                                                                                         |
| defaultColor      | `string`                         | `"primary"`                        | Default color for elements.                                                                                                                                                                                                                     |
| views             | `array`                          | `["year", "month", "week", "day"]` | Available view modes.                                                                                                                                                                                                                           |
| holidays          | `object` \| `null`               | See below                          | Source for holidays (or `null` for none).                                                                                                                                                                                                       |
| translations      | `object`                         | See below                          | Translations for calendar text content.                                                                                                                                                                                                         |
| icons             | `object`                         | See below                          | Icons for controls and actions.                                                                                                                                                                                                                 |
| url               | `string` \| `function` \| `null` | `null`                             | The base URL for fetching external data, such as holiday or event information. Can be a string URL or a function that dynamically generates the URL based on current context. If `null`, no external requests are made.                         |
| queryParams       | `function` \| `null`             | `null`                             | A function that dynamically generates query parameters. It receives the existing request data (as an object) and should return an object with key-value pairs to be included in the request. If `null`, no additional parameters will be added. |
| topbarAddons      | `function` \| `null`             | `null`                             | Additional content for the top navigation bar.                                                                                                                                                                                                  |
| sidebarAddons     | `function` \| `null`             | `null`                             | Additional content for the side navigation bar.                                                                                                                                                                                                 |
| debug             | `boolean`                        | `false`                            | Enables debug mode.                                                                                                                                                                                                                             |
| formatter         | `object`                         | `formatterDay`, `formatterWeek`    | Formatters for views and content.                                                                                                                                                                                                               |

### Holidays

| **Key**      | **Default Value** | description           |
|--------------|-------------------|-----------------------|
| federalState | `null \| string`  | federal state `DE-BE` |
| country      | `null \| string`  | the country `DE`      |
| language     | `null \| string`  | the language `DE`     |

### Translations

| **Key**        | **Default Value**        |
|----------------|--------------------------|
| day            | `"Day"`                  |
| week           | `"Week"`                 |
| month          | `"Month"`                |
| year           | `"Year"`                 |
| today          | `"Today"`                |
| appointment    | `"Appointment"`          |
| search         | `"Type and press Enter"` |
| searchNoResult | `"No appointment found"` |

### Icons

| **Key**           | **Bootstrap Icon**           |
|-------------------|------------------------------|
| day               | `"bi bi-calendar-day"`       |
| week              | `"bi bi-kanban"`             |
| month             | `"bi bi-calendar-month"`     |
| year              | `"bi bi-calendar4"`          |
| add               | `"bi bi-plus-lg"`            |
| menu              | `"bi bi-list"`               |
| search            | `"bi bi-search"`             |
| prev              | `"bi bi-chevron-left"`       |
| next              | `"bi bi-chevron-right"`      |
| link              | `"bi bi-box-arrow-up-right"` |
| appointment       | `"bi bi-clock"`              |
| appointmentAllDay | `"bi bi-brightness-high"`    |