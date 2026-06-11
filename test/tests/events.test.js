QUnit.module('Plugin — Events & Callbacks', function (hooks) {

    hooks.beforeEach(function () {
        $('#qunit-fixture').html('<div id="cal"></div>');
    });

    hooks.afterEach(function () {
        try { $('#cal').bsCalendar('destroy'); } catch (e) { /* */ }
        $('.bs-calendar-info-modal').remove();
    });

    // ── init.bs.calendar ──────────────────────────────────────────────────────

    QUnit.test('fires "init.bs.calendar" on initialization', function (assert) {
        const done = assert.async();
        $('#cal').one('init.bs.calendar', function () {
            assert.ok(true, 'init event fired');
            done();
        });
        $('#cal').bsCalendar({ url: null });
    });

    QUnit.test('calls onInit callback on initialization', function (assert) {
        const done = assert.async();
        $('#cal').bsCalendar({
            url: null,
            onInit() {
                assert.ok(true, 'onInit called');
                done();
            }
        });
    });

    // ── view.bs.calendar ──────────────────────────────────────────────────────

    QUnit.test('fires "view.bs.calendar" after setView', function (assert) {
        const done = assert.async();
        $('#cal').bsCalendar({ url: null, startView: 'month' });

        $('#cal').one('view.bs.calendar', function (e, view) {
            assert.ok(['day', '4day', 'week', 'month', 'year'].includes(view), `view="${view}" is valid`);
            done();
        });

        $('#cal').bsCalendar('setView', 'week');
    });

    QUnit.test('calls onView callback on view change', function (assert) {
        const done = assert.async();
        let initDone = false;

        $('#cal').bsCalendar({
            url: null,
            startView: 'month',
            onView(view) {
                if (!initDone) {
                    // First call comes from the initial render
                    initDone = true;
                    return;
                }
                assert.strictEqual(view, 'day');
                done();
            }
        });

        $('#cal').bsCalendar('setView', 'day');
    });

    // ── after-load.bs.calendar ────────────────────────────────────────────────

    QUnit.test('fires "after-load.bs.calendar" on init (url: null → empty array)', function (assert) {
        const done = assert.async();
        $('#cal').one('after-load.bs.calendar', function (e, appointments) {
            assert.ok(Array.isArray(appointments), 'payload is an array');
            done();
        });
        $('#cal').bsCalendar({ url: null });
    });

    QUnit.test('calls onAfterLoad callback', function (assert) {
        const done = assert.async();
        let fired = false;
        $('#cal').bsCalendar({
            url: null,
            onAfterLoad(appointments) {
                if (!fired) {
                    fired = true;
                    assert.ok(Array.isArray(appointments));
                    done();
                }
            }
        });
    });

    // ── before-load.bs.calendar ───────────────────────────────────────────────

    QUnit.test('fires "before-load.bs.calendar" before data fetch', function (assert) {
        const done = assert.async();
        $('#cal').one('before-load.bs.calendar', function (e, requestData) {
            assert.ok(typeof requestData === 'object', 'requestData is an object');
            done();
        });
        $('#cal').bsCalendar({ url: null });
    });

    // ── navigate-forward / navigate-back ─────────────────────────────────────

    QUnit.test('fires "navigate-forward.bs.calendar" when clicking next', function (assert) {
        const done = assert.async();
        $('#cal').bsCalendar({ url: null, startView: 'month' });

        $('#cal').one('navigate-forward.bs.calendar', function (e, view, from, to) {
            assert.ok(view, 'view payload present');
            assert.ok(from instanceof Date, 'from is a Date');
            assert.ok(to instanceof Date, 'to is a Date');
            done();
        });

        // Simulate next-button click
        $('#cal').find('[data-action="next"]').trigger('click');
    });

    QUnit.test('fires "navigate-back.bs.calendar" when clicking prev', function (assert) {
        const done = assert.async();
        $('#cal').bsCalendar({ url: null, startView: 'month' });

        $('#cal').one('navigate-back.bs.calendar', function (e, view, from, to) {
            assert.ok(view, 'view payload present');
            assert.ok(from instanceof Date, 'from is a Date');
            assert.ok(to instanceof Date, 'to is a Date');
            done();
        });

        $('#cal').find('[data-action="prev"]').trigger('click');
    });

    // ── all.bs.calendar ───────────────────────────────────────────────────────

    QUnit.test('fires "all.bs.calendar" meta-event for every event', function (assert) {
        const fired = [];
        $('#cal').on('all.bs.calendar', function (e, eventName) {
            fired.push(eventName);
        });
        $('#cal').bsCalendar({ url: null });

        assert.ok(fired.includes('init.bs.calendar'), '"init.bs.calendar" was caught by all');
    });

    QUnit.test('onAll callback receives every event name', function (assert) {
        const caught = [];
        $('#cal').bsCalendar({
            url: null,
            onAll(eventName) {
                caught.push(eventName);
            }
        });

        assert.ok(caught.includes('init.bs.calendar'), 'init event caught via onAll');
    });

    // ── added.bs.calendar ─────────────────────────────────────────────────────

    QUnit.test('fires "added.bs.calendar" after addAppointment', function (assert) {
        const done = assert.async();
        $('#cal').bsCalendar({ url: null, startView: 'month', startDate: '2026-05-08' });

        $('#cal').one('added.bs.calendar', function (e, appointment, extras) {
            assert.strictEqual(appointment.id, 'evt-test');
            assert.ok(extras && typeof extras === 'object', 'extras object present');
            done();
        });

        $('#cal').bsCalendar('addAppointment', {
            id: 'evt-test',
            title: 'Event Test',
            start: '2026-05-08 10:00:00',
            end: '2026-05-08 11:00:00'
        });
    });

    // ── deleted.bs.calendar ───────────────────────────────────────────────────

    QUnit.test('fires "deleted.bs.calendar" after deleteAppointment', function (assert) {
        const done = assert.async();
        $('#cal').bsCalendar({ url: null, startView: 'month', startDate: '2026-05-08' });
        $('#cal').bsCalendar('addAppointment', {
            id: 'del-test',
            title: 'Delete Me',
            start: '2026-05-08 10:00:00',
            end: '2026-05-08 11:00:00'
        });

        $('#cal').one('deleted.bs.calendar', function (e, appointment) {
            assert.strictEqual(appointment.id, 'del-test');
            done();
        });

        $('#cal').bsCalendar('deleteAppointment', 'del-test');
    });
});
