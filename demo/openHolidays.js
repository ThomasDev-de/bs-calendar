class OpenHolidays {
    constructor() {
        this.baseUrl = 'https://openholidaysapi.org'; // Basis-URL der API
    }

    /**
     * Ruft die Feiertage für ein bestimmtes Land und einen Zeitraum ab.
     *
     * @param {string} countryIsoCode Der Ländercode (z. B. 'CH', 'DE').
     * @param {string} validFrom Startdatum im Format YYYY-MM-DD.
     * @param {string} validTo Enddatum im Format YYYY-MM-DD.
     * @param {string} languageIsoCode Die Sprache der Antwort (z. B. 'DE', 'EN').
     * @param {string} acceptHeader Das gewünschte Antwortformat ('text/json' oder 'text/calendar').
     * @returns {Promise<Object|string>} Die Antwort der API.
     */
    async getPublicHolidays(countryIsoCode, validFrom, validTo, languageIsoCode = 'DE', acceptHeader = 'application/json') {
        const url = `${this.baseUrl}/PublicHolidays?countryIsoCode=${countryIsoCode.toUpperCase()}&languageIsoCode=${languageIsoCode.toUpperCase()}&validFrom=${validFrom}&validTo=${validTo}`;
        return this.call(url, acceptHeader);
    }

    /**
     * Ruft die Schulferien für ein bestimmtes Land, eine Region und einen Zeitraum ab.
     *
     * @param {string} countryIsoCode Der Ländercode (z. B. 'AT', 'DE').
     * @param {string} subdivisionCode Der Code der Unterteilung (z. B. 'AT-KÄ').
     * @param {string} validFrom Startdatum im Format YYYY-MM-DD.
     * @param {string} validTo Enddatum im Format YYYY-MM-DD.
     * @param {string} languageIsoCode ISO-Code der Sprache ('DE', 'EN').
     * @param {string} acceptHeader Das gewünschte Antwortformat ('application/json' oder 'text/calendar').
     * @returns {Promise<Object|string>} Die Antwort der API.
     */
    async getSchoolHolidays(countryIsoCode, subdivisionCode, validFrom, validTo, languageIsoCode = 'DE', acceptHeader = 'application/json') {
        const url = `${this.baseUrl}/SchoolHolidays?countryIsoCode=${countryIsoCode.toUpperCase()}&subdivisionCode=${subdivisionCode.toUpperCase()}&languageIsoCode=${languageIsoCode.toUpperCase()}&validFrom=${validFrom}&validTo=${validTo}`;
        return this.call(url, acceptHeader);
    }

    /**
     * Ruft die Liste der Länder mit Namen und offiziellen Sprachen ab.
     *
     * @param {string} languageIsoCode ISO-Code der Sprache ('DE', 'EN').
     * @param {string} acceptHeader Das gewünschte Antwortformat ('application/json').
     * @returns {Promise<Object|string>} Die Antwort der API.
     */
    async getCountries(languageIsoCode = 'DE', acceptHeader = 'application/json') {
        const url = `${this.baseUrl}/Countries?languageIsoCode=${languageIsoCode}`;
        return this.call(url, acceptHeader);
    }

    /**
     * Ruft die Liste der Sprachen mit ISO-Codes und Namen ab.
     *
     * @param {string} languageIsoCode ISO-Code der Sprache ('DE', 'EN').
     * @param {string} acceptHeader Das gewünschte Antwortformat ('application/json').
     * @returns {Promise<Object|string>} Die Antwort der API.
     */
    async getLanguages(languageIsoCode = 'DE', acceptHeader = 'application/json') {
        const url = `${this.baseUrl}/Languages?languageIsoCode=${languageIsoCode}`;
        return this.call(url, acceptHeader);
    }

    /**
     * Ruft Unterteilungen (z. B. Regionen) eines Landes ab.
     *
     * @param {string} countryIsoCode Der Ländercode (z. B. 'AT', 'DE').
     * @param {string} languageIsoCode ISO-Code der Sprache ('DE', 'EN').
     * @param {string} acceptHeader Das gewünschte Antwortformat ('application/json' oder 'application/xml').
     * @returns {Promise<Object|string>} Die Antwort der API.
     */
    async getSubdivisions(countryIsoCode = 'DE', languageIsoCode = 'DE', acceptHeader = 'application/json') {
        const url = `${this.baseUrl}/Subdivisions?languageIsoCode=${languageIsoCode}&countryIsoCode=${countryIsoCode}`;
        return this.call(url, acceptHeader);
    }

    /**
     * Führt die API-Anfrage aus.
     *
     * @param {string} url Die vollständige URL für die Anfrage.
     * @param {string} acceptHeader Der akzeptierte Antworttyp ('application/json' oder 'text/calendar').
     * @returns {Promise<Object|string>} Die Antwort der API.
     * @throws {Error} Wenn die Anfrage fehlschlägt.
     */
    async call(url, acceptHeader) {
        const options = {
            method: 'GET',
            headers: {
                Accept: acceptHeader,
            },
        };

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`API-Anfrage fehlgeschlagen: ${response.statusText}, HTTP-Code: ${response.status}`);
            }

            if (acceptHeader === 'application/json') {
                return await response.json();
            }

            return await response.text();
        } catch (error) {
            throw new Error(`API-Anfrage fehlgeschlagen: ${error.message}`);
        }
    }
}
