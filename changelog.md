### Changelog for `bs-calendar.js`

#### **Version 1.2.2**

##### **Added**
- **Utils Integration**:
    - Introduced `openHolidayApi` utility to handle holiday-related external API integrations, including:
        - `getSubdivisions`: Fetch subdivisions based on country and language ISO codes.
        - `getLanguages`: Retrieve supported languages by country.
        - `getCountries`: Fetch country data.
        - `getSchoolHolidays`: Fetch school holidays for specified regions and dates.
        - `getPublicHolidays`: Retrieve public holidays based on ISO codes, region, language, and timeframes.
- **Date and Time Utils**:
    - Added utilities for date and time processing:
        - `formatTime`: Formats a `Date` object or string to a time string (`HH:mm:ss` or `HH:mm`).
        - `formatDateToDateString`: Converts a date to the SQL `YYYY-MM-DD` format.
        - `getCalendarWeek`: Calculates ISO 8601-compliant week numbers for a given date.
        - `getShortWeekDayNames`: Returns an array of shortened weekday names based on a locale.
        - `datesAreEqual`: Checks if two dates are equal by year, month, and day.
- **Dynamic Style Computation**: Added `computeColor` and `getComputedStyles` utilities to handle dynamic CSS class-based style computation.
- **Color Handling**: Implemented `colorNameToHex` for CSS color name to hex mapping.

##### **Changed**
- **Default Options**:
    - Improved flexibility with new configuration options:
        - `hourSlots`: Added new configuration for customizing the day/week view with parameters like `start`, `end`, and `height`.
        - `on*` Events: Expanded events (`onInit`, `onAdd`, `onEdit`, etc.) for granular handling of UI actions like event additions, deletions, calendar-view changes, etc.
- **Formatter Views**: Added support for holiday and duration display customization.

##### **Fixed**
- Error handling for invalid inputs in functions like API calls and date utilities.
- Validation of default configurations, ensuring fallbacks for undefined or null settings.

##### **Removed**
- Redundant or outdated methods that overlapped with newer, more efficient utilities.
