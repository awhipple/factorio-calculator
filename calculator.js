$(function() {
    var items = window.items;
    var item_select = $("#item_select");
    var per_sec_input = $("#items_per_sec");
    var materials_display = $("#materials");

    function show_item_details() {
        var item = items[item_select.val()];

        materials_display.empty();

        total_materials = calculate_total_materials(item);

        add_header(materials_display, "Total Materials");
        var per_sec = per_sec_input.val() || 1;

        add_sub_header(materials_display, "Raw");
        for (var mat_key in total_materials.raw) {
            materials_display.append(`${mat_key}: ${total_materials.raw[mat_key] * per_sec}<br />`);
        }

        for (var mat_key in total_materials.built) {
            add_sub_header(materials_display, mat_key)
            materials_display.append(`Count:            ${total_materials.built[mat_key] * per_sec}<br />`);
            if (items[mat_key] && items[mat_key].time) {
                materials_display.append(`Production Units: ${total_materials.built[mat_key] * items[mat_key].time * per_sec}`);
            }
        }

        add_header(materials_display, "Production Time");
        materials_display.append(`${item.time} seconds`);

        add_header(materials_display, "Material Tree");
        show_item_materials(item, 1, '');
    }

    function show_item_materials(item, multiplier, spacers) {
        var keys = item.mats ? Object.keys(item.mats) : [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var sub_item = items[key];

            var first_item = i === 0;
            var last_item = i === keys.length - 1;

            materials_display.append(first_item && spacers.length >= 3 ? spacers.slice(0, -3) + '-->' : spacers, `${key}: ${item.mats[key] * multiplier}`, '<br />');
            materials_display.append(spacers, (last_item && !sub_item) ? ' ' : '|', '<br />');

            if (sub_item) {
                show_item_materials(sub_item, multiplier * item.mats[key], spacers + (last_item ? '   ' : '|  '));
            }
        }
    }

    function calculate_total_materials(item) {
        var total_materials = { raw: {}, built: {} };
        total_materials.built[item.name] = 1;

        function count_material_list(mats, multiplier) {
            for (var mat_key in mats) {
                var total_needed = mats[mat_key] * multiplier;

                if (items[mat_key]) {
                    total_materials.built[mat_key] = total_materials.built[mat_key] || 0;
                    total_materials.built[mat_key] += total_needed;
                    count_material_list(items[mat_key].mats, total_needed);
                } else {
                    total_materials.raw[mat_key] = total_materials.raw[mat_key] || 0;
                    total_materials.raw[mat_key] += total_needed;
                }
            }
        }

        count_material_list(item.mats, 1);

        return total_materials;
    }

    function init() {
        divide_item_time_and_mats_and_add_name();

        item_select.change(show_item_details);
        per_sec_input.change(show_item_details);

        populate_select();

        // Test Code
        item_select.val("chemical science pack");
        item_select.change();
    }

    function divide_item_time_and_mats_and_add_name() {
        for (var main_item_key in items) {
            var main_item = items[main_item_key];
            main_item.name = main_item_key;
            if (main_item.produced === undefined) {
                main_item.produced = 1;
            }
            main_item.time /= main_item.produced;
            for (var material_key in main_item.mats) {
                main_item.mats[material_key] /= main_item.produced;
            }
        }
    }

    function populate_select() {
        for (var key in items) {
            item_select.append(`<option>${key}</option>`);
        };
    }

    function add_header(element, text) {
        element.append(`<h2>${text}</h2>`);
    }

    function add_sub_header(element, text) {
        element.append(`<h3>${text}</h3>`);
    }

    init();
});