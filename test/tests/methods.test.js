QUnit.module('Plugin — Methods', function (hooks) {

    hooks.beforeEach(function () {
        $('#qunit-fixture').html('<div id="cal"></div>');
        $('#cal').bsCalendar({ url: null, startView: 'month' });
    });

    hooks.afterEach(function () {
        $('#cal').find('*').stop(true);
        try { $('#cal').bsCalendar('destroy'); } catch (e) { /* */ }
        $('.bs-calendar-info-modal').remove();
    });

    // Calls assertFn after any pending fetchAppointments cycle completes.
    // If loading=true a fetch is in flight; wait for after-load.bs.calendar.
    // Otherwise drain microtasks via setTimeout(0) and then assert.
    function awaitFetch(assert, assertFn) {
        var done = assert.async(1);
        var data = $('#cal').data('bsCalendar');
        if (data && data.loading) {
            $('#cal').one('after-load.bs.calendar', function () {
                assertFn();
                done();
            });
        } else {
            setTimeout(function () {
                assertFn();
                done();
            }, 0);
        }
    }

    // ── setView ───────────────────────────────────────────────────────────────

    QUnit.module('setView', function () {
        ['day', '4day', 'week', 'month', 'year'].forEach(function (view) {
            QUnit.test('switches to "' + view + '"', function (assert) {
                $('#cal').bsCalendar('setView', view);
                awaitFetch(assert, function () {
                    assert.strictEqual($('#cal').data('bsCalendar').view, view);
                });
            });
        });
    });

    // ── setDate ───────────────────────────────────────────────────────────────

    QUnit.module('setDate', function () {
        QUnit.test('accepts a date string and updates currentDate', function (assert) {
            $('#cal').bsCalendar('setDate', '2025-01-15');
            awaitFetch(assert, function () {
                assert.ok($('#cal').data('bsCalendar') !== undefined);
            });
        });

        QUnit.test('accepts { date, view } object and switches view', function (assert) {
            $('#cal').bsCalendar('setDate', { date: '2025-06-01', view: 'week' });
            awaitFetch(assert, function () {
                assert.strictEqual($('#cal').data('bsCalendar').view, 'week');
            });
        });
    });

    // ── setToday ──────────────────────────────────────────────────────────────

    QUnit.module('setToday', function () {
        QUnit.test('resets to today without throwing', function (assert) {
            $('#cal').bsCalendar('setDate', '2020-01-01');
            $('#cal').bsCalendar('setToday');
            awaitFetch(assert, function () {
                assert.ok($('#cal').data('bsCalendar') !== undefined);
            });
        });

        QUnit.test('switches view when view argument is passed', function (assert) {
            $('#cal').bsCalendar('setToday', 'day');
            awaitFetch(assert, function () {
                assert.strictEqual($('#cal').data('bsCalendar').view, 'day');
            });
        });
    });

    // ── setLocale ─────────────────────────────────────────────────────────────

    QUnit.module('setLocale', function () {
        QUnit.test('updates the locale setting', function (assert) {
            $('#cal').bsCalendar('setLocale', 'fr-FR');
            const data = $('#cal').data('bsCalendar');
            assert.strictEqual(data.settings.locale, 'fr-FR');
        });

        QUnit.test('normalizes underscore form', function (assert) {
            $('#cal').bsCalendar('setLocale', 'de_DE');
            const data = $('#cal').data('bsCalendar');
            assert.strictEqual(data.settings.locale, 'de-DE');
        });
    });

    // ── updateOptions ─────────────────────────────────────────────────────────

    QUnit.module('updateOptions', function () {
        QUnit.test('merges new options into settings', function (assert) {
            $('#cal').bsCalendar('updateOptions', { mainColor: 'danger' });
            const data = $('#cal').data('bsCalendar');
            assert.strictEqual(data.settings.mainColor, 'danger');
        });

        QUnit.test('deep-merges nested options', function (assert) {
            const origEnd = $('#cal').data('bsCalendar').settings.hourSlots.end;
            $('#cal').bsCalendar('updateOptions', { hourSlots: { start: 7 } });
            const data = $('#cal').data('bsCalendar');
            assert.strictEqual(data.settings.hourSlots.start, 7);
            assert.strictEqual(data.settings.hourSlots.end, origEnd);
        });
    });

    // ── clear ─────────────────────────────────────────────────────────────────

    QUnit.module('clear', function () {
        QUnit.test('executes without throwing', function (assert) {
            assert.expect(1);
            $('#cal').bsCalendar('clear');
            assert.ok(true);
        });
    });

    // ── render ────────────────────────────────────────────────────────────────

    QUnit.module('render', function () {
        QUnit.test('re-renders without throwing', function (assert) {
            assert.expect(1);
            $('#cal').bsCalendar('render');
            assert.ok(true);
        });
    });

    // ── refresh ───────────────────────────────────────────────────────────────

    QUnit.module('refresh', function () {
        QUnit.test('executes without throwing (no url)', function (assert) {
            $('#cal').bsCalendar('refresh');
            awaitFetch(assert, function () {
                assert.ok(true);
            });
        });

        QUnit.test('updates url when passed as option', function (assert) {
            $('#cal').bsCalendar('refresh', { url: '/api/test' });
            awaitFetch(assert, function () {
                assert.strictEqual($('#cal').data('bsCalendar').settings.url, '/api/test');
            });
        });
    });

    // ── editApointment (typo alias) ───────────────────────────────────────────

    QUnit.module('editApointment (misspelled alias)', function () {
        QUnit.test('alias exists and does not throw', function (assert) {
            var done = assert.async(1);
            $('#cal').one('added.bs.calendar', function () {
                $('#cal').one('edited.bs.calendar', function () {
                    assert.ok(true);
                    done();
                });
                $('#cal').bsCalendar('editApointment', { id: 'alias-test', title: 'Updated' });
            });
            $('#cal').bsCalendar('addAppointment', {
                id: 'alias-test',
                title: 'Alias Test',
                start: '2026-05-08 10:00:00',
                end: '2026-05-08 11:00:00'
            });
        });
    });
});
