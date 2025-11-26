### Changelog for `bs-calendar.js`

- [Changelog for `bs-calendar.js`](#changelog-for-bs-calendarjs)
    * [**Version 2.0.5**](#version-205)
    * [**Version 2.0.3**](#version-203)
    * [**Version 2.0.2**](#version-202)
    * [**Version 2.0.0**](#version-200)
    * [**Version 1.2.12**](#version-1212)
    * [**Version 1.2.11**](#version-1211)
    * [**Version 1.2.9**](#version-129)
    * [**Version 1.2.8**](#version-128)
    * [**Version 1.2.7**](#version-127)
    * [**Version 1.2.6**](#version-126)
    * [**Version 1.2.4**](#version-124)
    * [**Version 1.2.3**](#version-123)
    * [**Version 1.2.2**](#version-122)

  ### Version 2.0.5

    - Added: New utility function `convertIcsToAppointments(icsData)` to parse raw ICS strings into calendar-compatible appointment objects.
        - Supports standard properties: `SUMMARY` (mapped to `title`), `DESCRIPTION`, `LOCATION`, `UID`, `DTSTART`, `DTEND`.
        - Supports extended properties: `URL` (mapped to `link`), `CATEGORIES`, `STATUS`, `ORGANIZER`, and `ATTENDEE` (as array).
        - Automatically handles line unfolding (for long descriptions or broken lines).
        - Parses dates exactly as defined in the ICS string.

### Version 2.0.4

- Replaced `defaultColor` with `mainColor` for consistency in color settings.
- Enhanced layout flexibility with updated `flex-wrap` classes in navigation and top bar elements.
- Improved color application logic for holidays, appointments, and current-time indicators.
- Standardized `mainColor` utilization for day and month view rendering.
- Addressed minor layout inconsistencies in year view style definitions.
- Improved parameter documentation in `buildDayViewContent`.
- Enhanced layout handling with better defaults for hour labels and week view adjustments.
- Implemented half-hour dashed lines for rows meeting height criteria.
- Added clearer time slot metadata and consistent styling for grid rows.
- Included current-time indicator logic for the 'today' view.

### Version 2.0.3

Breaking/Structural

- Introduced stable, per-instance element IDs under `data.elements` (e.g., `wrapperId`, , , , , , , ) and refactored DOM
  queries to use these IDs. This reduces selector collisions and improves multi-instance and re-init stability.
  `wrapperTopNavId``wrapperSideNavId``wrapperSearchNavId``wrapperViewContainerId``wrapperViewContainerTitleId``wrapperSmallMonthCalendarId``wrapperSmallMonthCalendarTitleId`

Improvements

- Re-initialization and state flow
    - `init()` now writes/reads `view`, `date`, and `searchMode` through the central data object and assigns a unique
      `data-bs-calendar-id` from `data.elements.wrapperId`.
    - `buildFramework()` constructs a deterministic layout using the new IDs and integrates / at explicit anchor points.
      `topbarAddons``sidebarAddons`
    - `setCurrentDateName()` and `buildByView()` now update titles/containers via per-instance IDs for reliable
      rendering.

- Safer destroy lifecycle
    - Centralized modal selector via `globalCalendarElements.infoModal`.
    - More defensive cleanup of namespaced events, aborting outstanding requests, removing classes/attributes, and
      disposing/removing the modal.
    - Restores original wrapper attributes via `restoreWrapperState()` and clears plugin data to avoid leaks.

- Search UX
    - `toggleSearchBar()` now toggles instance-scoped elements by ID (prevents cross-instance interference).
    - Search result rendering/pagination continues to work with instance-aware containers.

- Mini month calendar
    - `buildMonthSmallView()` renders into ID-scoped containers and highlights the active date from the central data
      object.
    - Year view consistently delegates to the mini month builder per month and provides badge placeholders.

- Debuggability
    - Added structured logs in `init()`, `buildByView()`, `fetchAppointments()`, and week-range calculations.

Fixes

- View container targeting: `getViewContainer()` uses an instance ID, fixing collisions with multiple calendars on the
  same page.
- Title/labels: `setCurrentDateName()` selects and updates the correct title nodes by ID; resolves inconsistent header
  updates.
- Sidebar animation/resizing: `handleSidebarVisibility()` targets the per-instance sidebar by ID and updates layout in
  month view reliably.
- Event containment: Namespaced body/document/window handlers combined with instance-aware selectors reduce
  cross-instance event handling.

Developer Notes

- If external code relied on class-based selectors inside the calendar, prefer instance-scoped selectors or the public
  API/events.
- When injecting addons (, ), ensure the selectors resolve within the new, ID-based framework structure.
  `topbarAddons``sidebarAddons`

#### **Version 2.0.2**

- Fix: week/period calculation (week view)
    - Fixed a bug where the calculated end date of the week was determined incorrectly (too far into the following
      month)
      at the change of month.
    - Cause: endDate was incorrectly modified based on the originally set Date object instead of being recalculated as a
      copy of startDate. As a result, weeks that protrude into the previous month resulted in a "rolling" of the day (
      e.g.
      27.10. => 03.12.).
    - Fix: endDate is now explicitly copied from startDate and then added +6 days (endDate = new Date(
      startDate.getTime()); endDate.setDate(startDate.getDate() + 6)).

- Fix: Protection against unintentional overwriting of period parameters by queryParams
    - When merging the values returned by settings.queryParams, period-related keys (fromDate, toDate, year, view) are
      now
      protected by default and not overwritten.
    - This keeps the UI calculation of the visible period consistent with the data queries.

- Improvement: Defensive Copies & Debug Logs
    - getStartAndEndDateByView now always uses copies of the internal date (avoiding side effects due to reference
      mutations).
    - Additional debug logs have been added (computed start/end data, requestData before/after queryParams) to make it
      easier to find errors when determining the query periods.

-Result:

- Appointments are now correctly placed within the rendered week, even at the change of month.
- Fewer error messages such as "Full-width container ... not found".
- Better debugging for future time period and request issues.

#### **Version 2.0.0**

- Removed many features for Bootstrap 4 support.

#### **Version 1.2.12**

- Add: totalMinutes and totalSeconds to appointment.extras object

#### **Version 1.2.11**

- Update: readme
- Add: util function `getAppointmentTimespanBeautify`

#### **Version 1.2.9**

- Add configurable `showAddButton` option.

#### **Version 1.2.8**

- Fix: Normalize and deduplicate settings.views after merging defaults, data-attributes and passed options to avoid
  duplicating view entries in the view dropdown (prevents rendering the same view multiple times).
- Fix: Ensure settings.views accepts comma-separated strings and invalid values gracefully (falls back to sensible
  defaults).
- Improvement: Replace locale-dependent "KW" week label with a language-neutral compact week label ("W42") for UI, store
  ISO week ("YYYY-Www") in a data-attribute, and add a localized date-range tooltip for better international clarity.

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
