QUnit.module('Plugin — Appointment CRUD', function (hooks) {

    const APPT = {
        id: 'appt-1',
        title: 'Test Appointment',
        start: '2026-05-08 10:00:00',
        end: '2026-05-08 11:00:00',
        color: 'primary'
    };

    hooks.beforeEach(function () {
        $('#qunit-fixture').html('<div id="cal"></div>');
        // Use month view so addAppointment/editAppointment/deleteAppointment are active
        $('#cal').bsCalendar({ url: null, startView: 'month', startDate: '2026-05-08' });
    });

    hooks.afterEach(function (assert) {
        var done = assert.async();
        function cleanup() {
            $('#cal').find('*').stop(true);
            try { $('#cal').bsCalendar('destroy'); } catch (e) { /* */ }
            $('.bs-calendar-info-modal').remove();
            done();
        }
        var data = $('#cal').data('bsCalendar');
        if (data && data.loading) {
            $('#cal').one('after-load.bs.calendar', function () { setTimeout(cleanup, 0); });
        } else {
            setTimeout(cleanup, 0);
        }
    });

    // ── addAppointment ────────────────────────────────────────────────────────

    QUnit.module('addAppointment', function () {
        QUnit.test('adds the appointment to the internal list', function (assert) {
            const done = assert.async();
            $('#cal').one('added.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.ok(found, 'appointment found in data.appointments');
                done();
            });
            $('#cal').bsCalendar('addAppointment', $.extend({}, APPT));
        });

        QUnit.test('fires "added.bs.calendar" event', function (assert) {
            const done = assert.async();
            $('#cal').one('added.bs.calendar', function (e, appointment) {
                assert.strictEqual(appointment.id, 'appt-1');
                done();
            });
            $('#cal').bsCalendar('addAppointment', $.extend({}, APPT));
        });

        QUnit.test('generates an id when none is provided', function (assert) {
            const done = assert.async();
            $('#cal').one('added.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const last = data.appointments[data.appointments.length - 1];
                assert.ok(last.id, 'id was auto-generated');
                done();
            });
            $('#cal').bsCalendar('addAppointment', {
                title: 'No-ID Appointment',
                start: '2026-05-08 12:00:00',
                end: '2026-05-08 13:00:00'
            });
        });

        QUnit.test('multiple appointments accumulate', function (assert) {
            const done = assert.async();
            $('#cal').one('added.bs.calendar', function () {
                $('#cal').one('added.bs.calendar', function () {
                    const data = $('#cal').data('bsCalendar');
                    assert.ok(data.appointments.length >= 2);
                    done();
                });
                $('#cal').bsCalendar('addAppointment', {
                    id: 'appt-2',
                    title: 'Second',
                    start: '2026-05-09 09:00:00',
                    end: '2026-05-09 10:00:00'
                });
            });
            $('#cal').bsCalendar('addAppointment', $.extend({}, APPT));
        });
    });

    // ── editAppointment ───────────────────────────────────────────────────────

    QUnit.module('editAppointment', function (innerHooks) {
        innerHooks.beforeEach(function (assert) {
            const done = assert.async();
            $('#cal').one('added.bs.calendar', done);
            $('#cal').bsCalendar('addAppointment', $.extend({}, APPT));
        });

        QUnit.test('merges changes into the existing appointment', function (assert) {
            const done = assert.async();
            $('#cal').one('edited.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.strictEqual(found.title, 'Updated Title');
                done();
            });
            $('#cal').bsCalendar('editAppointment', { id: 'appt-1', title: 'Updated Title' });
        });

        QUnit.test('fires "edited.bs.calendar" event', function (assert) {
            const done = assert.async();
            $('#cal').one('edited.bs.calendar', function (e, appointment) {
                assert.strictEqual(appointment.id, 'appt-1');
                assert.strictEqual(appointment.title, 'Edited');
                done();
            });
            $('#cal').bsCalendar('editAppointment', { id: 'appt-1', title: 'Edited' });
        });

        QUnit.test('accepts {id, appointment} shape', function (assert) {
            const done = assert.async();
            $('#cal').one('edited.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.strictEqual(found.title, 'Shape-Test');
                done();
            });
            $('#cal').bsCalendar('editAppointment', {
                id: 'appt-1',
                appointment: { title: 'Shape-Test' }
            });
        });

        QUnit.test('accepts {id, data} shape', function (assert) {
            const done = assert.async();
            $('#cal').one('edited.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.strictEqual(found.title, 'Data-Shape-Test');
                done();
            });
            $('#cal').bsCalendar('editAppointment', {
                id: 'appt-1',
                data: { title: 'Data-Shape-Test' }
            });
        });

        QUnit.test('original fields not in update are preserved', function (assert) {
            const done = assert.async();
            $('#cal').one('edited.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.strictEqual(new Date(found.start).getTime(), new Date(APPT.start).getTime(), 'start preserved');
                done();
            });
            $('#cal').bsCalendar('editAppointment', { id: 'appt-1', title: 'New Title' });
        });
    });

    // ── deleteAppointment ─────────────────────────────────────────────────────

    QUnit.module('deleteAppointment', function (innerHooks) {
        innerHooks.beforeEach(function (assert) {
            const done = assert.async();
            $('#cal').one('added.bs.calendar', done);
            $('#cal').bsCalendar('addAppointment', $.extend({}, APPT));
        });

        QUnit.test('removes the appointment from the internal list', function (assert) {
            const done = assert.async();
            $('#cal').one('deleted.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.notOk(found, 'appointment no longer in data.appointments');
                done();
            });
            $('#cal').bsCalendar('deleteAppointment', 'appt-1');
        });

        QUnit.test('fires "deleted.bs.calendar" event', function (assert) {
            const done = assert.async();
            $('#cal').one('deleted.bs.calendar', function (e, appointment) {
                assert.strictEqual(appointment.id, 'appt-1');
                done();
            });
            $('#cal').bsCalendar('deleteAppointment', 'appt-1');
        });

        QUnit.test('accepts an appointment object instead of bare id', function (assert) {
            const done = assert.async();
            $('#cal').one('deleted.bs.calendar', function () {
                const data = $('#cal').data('bsCalendar');
                const found = data.appointments.find(a => a.id === 'appt-1');
                assert.notOk(found);
                done();
            });
            $('#cal').bsCalendar('deleteAppointment', { id: 'appt-1' });
        });
    });
});
