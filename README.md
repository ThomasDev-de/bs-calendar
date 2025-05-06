## Options

The calendar provides a wide range of configuration options to customize its behavior and appearance. While there are
many options available, you don’t need to configure them all—the default values are already set for common use cases.
Adjust the options as needed to better fit your specific requirements. Below is a detailed overview of all
available options, including their types, default values, and descriptions.

| **Option**        | **Type**                         | **Default Value**                  | **Description**                                                                                                                                                                                                                                 |
|-------------------|----------------------------------|------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| locale            | `string`                         | `"en-GB"`                          | Set the language and the country. The month and days of the week are set on the basis of language.                                                                                                                                              |
| title             | `string`                         | `null`                             | If a title is set in the form of string or HTML, it appears above in the middle of the calendar.                                                                                                                                                |
| startWeekOnSunday | `boolean`                        | `true`                             | Determine here whether the week starts on Sunday. Is the value `false` starts the week on Monday.                                                                                                                                               |
| navigateOnWheel   | `boolean`                        | `true`                             | If this value is `true`, you can be navigated with mouse wheel through the days, weeks, months or years.                                                                                                                                        |
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
| storeState        | `boolean`                        | `false`                            | If the value is set to `true`, the current view will be saved in localStorage and requested on the next load.                                                                                                                                   |
| formatter         | `object`                         | `formatterDay`, `formatterWeek`    | Formatters for views and content.                                                                                                                                                                                                               |

### Holidays

If an object is handed over (see below), will be
Holidays and school holidays brought from the [OpenHolidays API](https://www.openholidaysapi.org/en/).   
If the country or/and the language is not set, these attributes are determined from the local.  
Federal State is mandatory for the school holidays.

| **Key**      | **Default Value** | description                                                                                                            |
|--------------|-------------------|------------------------------------------------------------------------------------------------------------------------|
| federalState | `null \| string`  | federal state `DE-BE`                                                                                                  |
| country      | `null \| string`  | the country `DE` - You can find a list of all supported countries [here](https://www.openholidaysapi.org/en/sources/). |
| language     | `null \| string`  | the language `DE`                                                                                                      |

### Translations

Text editions of the calendar can be adapted to the language here.

| **Key**        | **Default Value**        |
|----------------|--------------------------|
| search         | `"Type and press Enter"` |
| searchNoResult | `"No appointment found"` |

### Icons

Icons used in the calendar can be adjusted here.  
The icons of bootstrap-icons are defined as standard.

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
