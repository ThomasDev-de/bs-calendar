QUnit.module('highlightedHours', function (hooks) {

    hooks.beforeEach(function () {
        $('#qunit-fixture').html('<div id="cal"></div>');
    });

    hooks.afterEach(function () {
        try { $('#cal').bsCalendar('destroy'); } catch (e) { /* */ }
    });

    QUnit.test('renders a single highlightedHours object', function (assert) {
        const done = assert.async(1);

        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-15',
            hourSlots: {
                start: 8,
                end: 12
            },
            highlightedHours: {
                daysOfWeek: [1],
                startTime: '09:00',
                endTime: '11:00',
                color: 'rgba(10, 20, 30, 0.25)'
            }
        });

        setTimeout(function () {
            const highlighted = $('#cal').find('[data-day-hour="9"]').css('background-color');
            const normal = $('#cal').find('[data-day-hour="8"]').css('background-color');

            assert.strictEqual(highlighted, 'rgba(10, 20, 30, 0.25)', 'matching hour row receives the configured color');
            assert.notStrictEqual(normal, 'rgba(10, 20, 30, 0.25)', 'non-matching hour row is not highlighted');
            done();
        }, 0);
    });

    QUnit.test('renders highlightedHours arrays with separate colors', function (assert) {
        const done = assert.async(1);

        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-20',
            hourSlots: {
                start: 9,
                end: 15
            },
            highlightedHours: [
                {
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '09:00',
                    endTime: '17:00',
                    mode: 'exclusive',
                    color: 'rgba(10, 20, 30, 0.25)'
                },
                {
                    daysOfWeek: [6],
                    startTime: '10:00',
                    endTime: '14:00',
                    mode: 'preferred',
                    color: 'rgba(40, 120, 60, 0.3)'
                }
            ]
        });

        setTimeout(function () {
            const highlighted = $('#cal').find('[data-day-hour="10"]').css('background-color');
            const normal = $('#cal').find('[data-day-hour="14"]').css('background-color');

            assert.strictEqual(highlighted, 'rgba(40, 120, 60, 0.3)', 'matching array item controls the row color');
            assert.notStrictEqual(normal, 'rgba(40, 120, 60, 0.3)', 'range end is exclusive for row highlighting');
            done();
        }, 0);
    });

    QUnit.test('sets inHighlightedHours when appointment is contained in any range', function (assert) {
        const done = assert.async(1);

        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-15',
            highlightedHours: [
                {
                    daysOfWeek: [1, 2, 3, 4, 5],
                    startTime: '09:00',
                    endTime: '17:00',
                    mode: 'exclusive',
                    color: 'primary'
                },
                {
                    daysOfWeek: [6],
                    startTime: '10:00',
                    endTime: '14:00',
                    mode: 'preferred',
                    color: 'success'
                }
            ]
        });

        $('#cal').one('added.bs.calendar', function (event, appointment, extras) {
            void event;
            void appointment;
            assert.strictEqual(extras.inHighlightedHours, true, 'appointment is inside the weekday range');
            assert.strictEqual(extras.highlightedHours.canWork, true, 'exclusive range allows work inside the configured slot');
            assert.strictEqual(extras.highlightedHours.mode, 'exclusive');
            done();
        });

        $('#cal').bsCalendar('addAppointment', {
            title: 'Inside highlighted hours',
            start: '2026-06-15 10:00:00',
            end: '2026-06-15 11:00:00'
        });
    });

    QUnit.test('exclusive mode blocks appointments outside the exclusive range', function (assert) {
        const done = assert.async(1);

        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-15',
            highlightedHours: [
                {
                    daysOfWeek: [1],
                    startTime: '09:00',
                    endTime: '17:00',
                    mode: 'exclusive',
                    color: 'success'
                }
            ]
        });

        $('#cal').one('added.bs.calendar', function (event, appointment, extras) {
            void event;
            void appointment;
            assert.strictEqual(extras.inHighlightedHours, false, 'appointment is outside the exclusive range');
            assert.strictEqual(extras.highlightedHours.canWork, false, 'outside exclusive range is not workable');
            assert.strictEqual(extras.highlightedHours.reason, 'outsideExclusive');
            done();
        });

        $('#cal').bsCalendar('addAppointment', {
            title: 'Outside exclusive hours',
            start: '2026-06-15 18:00:00',
            end: '2026-06-15 19:00:00'
        });
    });

    QUnit.test('blocked mode blocks overlapping appointments', function (assert) {
        const done = assert.async(1);

        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-21',
            highlightedHours: [
                {
                    daysOfWeek: [0],
                    startTime: '00:00',
                    endTime: '23:59',
                    mode: 'blocked',
                    color: 'danger'
                }
            ]
        });

        $('#cal').one('added.bs.calendar', function (event, appointment, extras) {
            void event;
            void appointment;
            assert.strictEqual(extras.highlightedHours.canWork, false, 'blocked range is not workable');
            assert.strictEqual(extras.highlightedHours.isBlocked, true);
            assert.strictEqual(extras.highlightedHours.mode, 'blocked');
            done();
        });

        $('#cal').bsCalendar('addAppointment', {
            title: 'Blocked Sunday work',
            start: '2026-06-21 10:00:00',
            end: '2026-06-21 11:00:00'
        });
    });

    QUnit.test('preferred mode keeps appointments workable and marks them preferred', function (assert) {
        const done = assert.async(1);

        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-20',
            highlightedHours: [
                {
                    daysOfWeek: [6],
                    startTime: '10:00',
                    endTime: '14:00',
                    mode: 'preferred',
                    color: 'grey'
                }
            ]
        });

        $('#cal').one('added.bs.calendar', function (event, appointment, extras) {
            void event;
            void appointment;
            assert.strictEqual(extras.highlightedHours.canWork, true, 'preferred range is workable');
            assert.strictEqual(extras.highlightedHours.isPreferred, true);
            assert.strictEqual(extras.highlightedHours.mode, 'preferred');
            done();
        });

        $('#cal').bsCalendar('addAppointment', {
            title: 'Preferred Saturday work',
            start: '2026-06-20 11:00:00',
            end: '2026-06-20 12:00:00'
        });
    });

    QUnit.test('setHighlightedHours accepts arrays at runtime', function (assert) {
        $('#cal').bsCalendar({
            url: null,
            startView: 'day',
            startDate: '2026-06-15'
        });

        $('#cal').bsCalendar('setHighlightedHours', [
            {
                daysOfWeek: [1],
                startTime: '08:00',
                endTime: '12:00',
                color: 'rgba(10, 20, 30, 0.25)'
            }
        ]);

        const settings = $('#cal').data('bsCalendar').settings;
        assert.ok(Array.isArray(settings.highlightedHours), 'runtime value remains an array');
        assert.strictEqual(settings.highlightedHours[0].startTime, '08:00');
    });
});
