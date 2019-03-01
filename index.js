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
    requiredFiles: ['Unofficial Skyrim Special Edition Patch.esp'],

    execute: (patchFile, helpers, settings, locals) => ({
        // required: array of process blocks. each process block should have both
        initialize: function() {
            locals.activator_references = {
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
            locals.locations = {
                'Lady' : '000D5676',
                'Apprentice' : '000D5673',
                'Lover' : '000D5678',
                'Steed' :'000D567D',
                'Atronach' : '000D5675',
                'Shadow' : '000D567C',
                'Lord' : '000D5677',
                'Ritual' : '000D567A',
                'Tower' : '000D567E',
                'Serpent':'000D567B'
            };
            locals.marker_references = {
                'Lady' : '000DED90',
                'Apprentice' : '0001BAB9',
                'Lover' : '0001BABB',
                'Steed' :'0001BAC0',
                'Atronach' : '000E0F4C',
                'Shadow' : '000D3935',
                'Lord' : '000E0F47',
                'Ritual' : '000DD9D5',
                'Tower' : '000E0ED5',
                'Serpent':'000E0F69'
            };

            locals.birthstone_names = Object.keys(locals.activator_references);
            locals.birthstone_ref_hex_ids = Object.values(locals.activator_references);
            locals.birthstone_lctn_hex_ids = Object.values(locals.locations);
            locals.birthstone_map_marker_hex_ids = Object.values(locals.marker_references);
            locals.ref_to_birthstone = {};
            locals.lctn_to_birthstone = {};
            locals.marker_to_birthstone = {};
            locals.randomized_birthstones = {};

            Object.keys(locals.activator_references).forEach(function(r) {
                locals.ref_to_birthstone[locals.activator_references[r]] = r;
            });

            Object.keys(locals.locations).forEach(function(r) {
                locals.lctn_to_birthstone[locals.locations[r]] = r;
            });

            Object.keys(locals.marker_references).forEach(function(r) {
                locals.marker_to_birthstone[locals.marker_references[r]] = r;
            });

            locals.get_records = function(patchFile, helpers, settings, locals, birthstone_hex_ids) {
                let birthstone_records = [];
                for (let i = 0; i < birthstone_hex_ids.length; ++i) {
                    let hex_id = birthstone_hex_ids[i];
                    let form_id = parseInt(hex_id, 16);

                    let birthstone_record = xelib.GetRecord(patchFile, form_id);
                    birthstone_records.push(birthstone_record);
                }

                return birthstone_records;
            };

            locals.random_integer = function(max) {
                return Math.floor(Math.random() * (max - 1)) + 1;
            };

            // randomized birthstone ids
            let names = locals.birthstone_names.slice();

            names.forEach(function(name) {
                let r = locals.random_integer(names.length);

                if (!Object.keys(locals.randomized_birthstones).includes(name)) {
                    let alias_to = names[r];

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
                // Patch References to Activators
                // Adds new References, disables old References
                records: function (patchFile, helpers, settings, locals) {
                    return locals.get_records(patchFile, helpers, settings, locals, locals.birthstone_ref_hex_ids);
                },
                patch: function (record) {
                    helpers.logMessage(`Patching ${xelib.LongName(record)}`);

                    let hex_form_id = xelib.GetHexFormID(record);
                    let stone_name = locals.ref_to_birthstone[hex_form_id];
                    let new_stone_name = locals.randomized_birthstones[stone_name];

                    if (stone_name !== new_stone_name) {
                        let new_activator_id = locals.activators[new_stone_name];

                        // Copy new record
                        let new_record = xelib.CopyElement(record, patchFile, true);

                        // Disable existing record
                        xelib.SetRecordFlag(record, 'Initially Disabled', true);

                        // Rename new record with random birthstone
                        xelib.SetValue(new_record, 'NAME - Base', new_activator_id);
                    }
                }
            },
            {
                // Patch Locations
                records: function (patchFile, helpers, settings, locals) {
                    return locals.get_records(patchFile, helpers, settings, locals, locals.birthstone_lctn_hex_ids);
                },
                patch: function (record) {
                    helpers.logMessage(`Patching ${xelib.LongName(record)}`);

                    let hex_form_id = xelib.GetHexFormID(record);
                    let stone_name = locals.lctn_to_birthstone[hex_form_id];
                    let new_stone_name = locals.randomized_birthstones[stone_name];

                    if (stone_name !== new_stone_name) {
                        let new_name = 'The ' + new_stone_name + ' Doomstone';

                        xelib.SetValue(record, 'FULL - Name', new_name);
                    }
                }
            },
            {
                // Patch References to Map Markers
                records: function (patchFile, helpers, settings, locals) {
                    return locals.get_records(patchFile, helpers, settings, locals, locals.birthstone_map_marker_hex_ids);
                },
                patch: function (record) {
                    helpers.logMessage(`Patching ${xelib.LongName(record)}`);

                    let hex_form_id = xelib.GetHexFormID(record);
                    let stone_name = locals.marker_to_birthstone[hex_form_id];
                    let new_stone_name = locals.randomized_birthstones[stone_name];

                    if (stone_name !== new_stone_name) {
                        let new_name = 'The ' + new_stone_name + ' Doomstone';

                        xelib.SetValue(record, 'Map Marker\\FULL - Name', new_name);
                    }
                }
            }
        ]
    })
});
