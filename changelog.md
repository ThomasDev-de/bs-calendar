### Changelog for `bs-calendar.js`

- [Changelog for `bs-calendar.js`](#changelog-for-bs-calendarjs)
    * [**Version 1.2.8**](#version-128)
    * [**Version 1.2.7**](#version-127)
    * [**Version 1.2.6**](#version-126)
    * [**Version 1.2.4**](#version-124)
    * [**Version 1.2.3**](#version-123)
    * [**Version 1.2.2**](#version-122)

#### **Version 1.2.8**

- Fix: Normalize and deduplicate settings.views after merging defaults, data-attributes and passed options to avoid duplicating view entries in the view dropdown (prevents rendering the same view multiple times).
- Fix: Ensure settings.views accepts comma-separated strings and invalid values gracefully (falls back to sensible defaults).
- Improvement: Replace locale-dependent "KW" week label with a language-neutral compact week label ("W42") for UI, store ISO week ("YYYY-Www") in a data-attribute, and add a localized date-range tooltip for better international clarity.

#### **Version 1.2.7**

- Fixed an issue where clicks inside the modal could trigger unintended calendar interactions or events. User actions on
  modal controls (inputs, buttons, etc.) are now isolated and no longer propagate unwanted events to the calendar view.

#### **Version 1.2.6**

##### **Changed**

- Extended the `formatter.allDay` function:  
  The callback now supports additional parameters to provide more flexibility when customizing the all-day area in the
  week view. Existing implementations remain compatible, but developers can now access more detailed context if needed.

##### **Docs**

- The documentation for the `formatter` option has been updated:
    - The description for `allDay` now reflects the possible new parameters and their structure.

  Example (in table format):

  | **Property** | **Type**   | **Params**                  | **Description**                                                       | 
      |--------------|------------|-----------------------------|-----------------------------------------------------------------------|
  | **allDay**   | `function` | (appointment, extras, view) | Customizes the rendering of the all-day area in weekly or daily view. |

#### **Version 1.2.4**

##### **Added**

- **Feature**: Appointment creation in the **Month View**:
    - Users can now effortlessly add appointments by clicking on a specific day in the calendar's month view.
    - This enhancement improves usability and streamlines the process of scheduling events directly from the calendar
      interface.

  **Technical Details:**
    - A click event on elements with `data-role="day-wrapper"` triggers a new appointment dialog.
    - The selected date is automatically populated in the appointment form.

  **Example:**
  ```javascript
  $('#calendar').on('add.bs.calendar', function (event, data) {
      console.log('New appointment created:', data);
  });
  ```

#### **Version 1.2.3**

##### **Added**

- **New Setting**: `settings.onAfterLoad`:
    - A new callback triggered after appointment loading has completed.
    - Receives the newly loaded appointments as parameters for additional processing.
- **New Event**: `after-load.bs.calendar`:
    - Introduced a jQuery event that fires after the calendar has finished loading appointments.
    - The new appointments are passed as parameters, enabling dynamic handling of loaded data.

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
- **Dynamic Style Computation**: Added `computeColor` and `getComputedStyles` utilities to handle dynamic CSS
  class-based style computation.
- **Color Handling**: Implemented `colorNameToHex` for CSS color name to hex mapping.

##### **Changed**

- **Default Options**:
    - Improved flexibility with new configuration options:
        - `hourSlots`: Added new configuration for customizing the day/week view with parameters like `start`, `end`,
          and `height`.
        - `on*` Events: Expanded events (`onInit`, `onAdd`, `onEdit`, etc.) for granular handling of UI actions like
          event additions, deletions, calendar-view changes, etc.
- **Formatter Views**: Added support for holiday and duration display customization.

##### **Fixed**

- Error handling for invalid inputs in functions like API calls and date utilities.
- Validation of default configurations, ensuring fallbacks for undefined or null settings.

##### **Removed**

- Redundant or outdated methods that overlapped with newer, more efficient utilities.
