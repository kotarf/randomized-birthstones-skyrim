/* global ngapp, xelib, registerPatcher, patcherUrl */

registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE],
    settings: {
        label: 'Randomized Birthstones Patcher',
        hide: true,
        templateUrl: `${patcherUrl}/partials/settings.html`,
    },
    // optional array of required filenames.  can omit if empty.
    requiredFiles: [],

    execute: (patchFile, helpers, settings, locals) => ({
        // required: array of process blocks. each process block should have both
        initialize: function() {
            debugger;
            locals.refs = {
                'Lady' : '000DC84A',
                'Apprentice' : '000E0DC2',
                'Lover' : '000E0DBE',
                'Steed' :'000E0E1F',
                'Atronach' : '000E0F4A',
                'Shadow' : '000D1E9F',
                'Lord' : '000E0F22',
                'Ritual' : '000D9630',
                'Tower' : '000E0F6F',
                'Serpent':'000E0F55'
            };
            locals.activators = {
                'Lady' : '000D2330',
                'Apprentice' : '000D2331',
                'Lover' : '000D2332',
                'Steed' :'000D2333',
                'Atronach' : '000D2334',
                'Shadow' : '000D2335',
                'Lord' : '000D2336',
                'Ritual' : '000D2337',
                'Tower' : '000D2338',
                'Serpent':'000D2339'
            };

            locals.birthstone_names = Object.keys(locals.refs);
            locals.birthstone_ref_hex_ids = Object.values(locals.refs);
            locals.birthstone_activator_hex_ids = Object.values(locals.activators);
            locals.ref_to_birthstone = {};
            locals.randomized_birthstones = {};

            Object.keys(locals.refs).forEach(function(r) {
                locals.ref_to_birthstone[locals.refs[r]] = r;
            });

            locals.random_integer = function(len) {
                let random_int = null;

                if (len <= 1) {
                    return len;
                }

                while(random_int === null || random_int === 1) {
                    random_int = Math.floor((Math.random() * len) + 1);
                }

                return random_int;
            };

            // randomized birthstone ids
            let names = locals.birthstone_names.slice();

            names.forEach(function(name) {
                let r = locals.random_integer(names.length);

                if (!Object.keys(locals.randomized_birthstones).includes(name)) {
                    let alias_to = names[r - 1];

                    locals.randomized_birthstones[name] = alias_to;
                    locals.randomized_birthstones[alias_to] = name;

                    names = names.filter(function(element) {
                       return element !== name && element !== alias_to;
                    });
                }
            });
        },
        process: [
            {
                records: function (patchFile, helpers, settings, locals) {
                    let birthstone_records = [];
                    for (let i = 0; i < locals.birthstone_ref_hex_ids.length; ++i) {
                        let hex_id = locals.birthstone_ref_hex_ids[i];
                        let form_id = parseInt(hex_id, 16);

                        let birthstone_record = xelib.GetRecord(patchFile[0], form_id);
                        birthstone_records.push(birthstone_record);
                    }

                    return birthstone_records;
                },
                patch: function (record) {
                    helpers.logMessage(`Patching ${xelib.LongName(record)}`);

                    let hex_form_id = xelib.GetHexFormID(record);
                    let stone_name = locals.ref_to_birthstone[hex_form_id];
                    let new_stone_name = locals.randomized_birthstones[stone_name];

                    if (stone_name !== new_stone_name) {
                        let new_activator_id = locals.activators[new_stone_name];

                        xelib.SetValue(record, 'NAME - Base', new_activator_id);
                    }
                }
            }
        ]
    })
});
