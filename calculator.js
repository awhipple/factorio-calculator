$(function() {
    var START_ON = "rocket";

    var items = window.items;
    var hide_items = [];
    var item_select = $("#item_select");
    var per_sec_input = $("#items_per_sec");
    var material_detail_checkbox = $("#show_material_details");
    var materials_display = $("#materials");
    var craft_tree_display = $("#craft_tree");

    function show_item_details() {
        var item = items[item_select.val()];

        materials_display.empty();
        craft_tree_display.empty();

        total_materials = calculate_total_materials(item);

        add_header(materials_display, "Total Materials");
        var per_sec = per_sec_input.val() || 1;


        add_sub_header(materials_display, "Raw");
        for (var mat_key in total_materials.raw) {
            if (hide_items.indexOf(mat_key) !== -1) {
                continue;
            }
            materials_display.append(`${hide_material_button(mat_key)}${mat_key}: ${format_num(total_materials.raw[mat_key] * per_sec)}<br />`);
            if (material_detail_checkbox.is(":checked")) {
                materials_display.append(`Goes into ${generate_mat_used_for_list(mat_key, item)}<br /><br />`);
            }
        }

        for (var mat_key in total_materials.built) {
            if (hide_items.indexOf(mat_key) !== -1) {
                continue;
            }
            add_sub_header(materials_display, hide_material_button(mat_key) + mat_key)
            materials_display.append(`Count:            ${format_num(total_materials.built[mat_key] * per_sec)}<br />`);
            if (items[mat_key] && items[mat_key].time) {
                var production_units = total_materials.built[mat_key] * items[mat_key].time * per_sec;
                materials_display.append(`Production Units: ${format_num(production_units)}`);
                if (material_detail_checkbox.is(":checked")) {
                    materials_display.append(
                        '<br />',
                        `0.50 x ${format_num(production_units / 0.5)} <br />`,
                        `0.75 x ${format_num(production_units / 0.75)} <br />`,
                        `1.00 x ${format_num(production_units / 1)} <br />`,
                        `1.25 x ${format_num(production_units / 1.25)} <br />`,
                        `2.00 x ${format_num(production_units / 2)} <br />`
                    );
                    materials_display.append(`Goes into ${generate_mat_used_for_list(mat_key, item)}<br />`);
                }
            }
        }

        if (hide_items.length > 0) {
            add_sub_header(materials_display, "Hidden Materials");
        }
        for (var i = 0; i < hide_items.length; i++) {
            materials_display.append(`${show_material_button(hide_items[i])}${hide_items[i]}<br />`);
        }

        add_header(craft_tree_display, "Material Tree");
        show_item_materials(item, 1, '');

        $(".hide.button").on('click', function(ele) {
            hide_items.push($(this).attr("data-material"));
            show_item_details();
        });

        $(".show.button").on('click', function(ele) {
            hide_items.splice(hide_items.indexOf($(this).attr("data-material")), 1);
            show_item_details();
        });


    }

    function show_item_materials(item, multiplier, spacers) {
        var keys = item.mats ? Object.keys(item.mats) : [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var sub_item = items[key];

            var first_item = i === 0;
            var last_item = i === keys.length - 1;

            craft_tree_display.append(first_item && spacers.length >= 3 ? spacers.slice(0, -3) + '-->' : spacers, `${key}: ${format_num(item.mats[key] * multiplier)}`, '<br />');
            craft_tree_display.append(spacers, (last_item && !sub_item) ? ' ' : '|', '<br />');

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

    function generate_mat_used_for_list(material, item) {
        var found_parents = [];

        function traverse_mat_tree(item) {
            for (var mat_key in item.mats) {
                if (mat_key === material) {
                    found_parents.push(item.name);
                }
                var item_mat = items[mat_key];
                if (item_mat) {
                    traverse_mat_tree(item_mat);
                }
            }
        }
        traverse_mat_tree(item);
        found_parents = [...new Set(found_parents)];
        return found_parents.length === 0 ? 'nothing' : found_parents.join(', ');
    }

    function init() {
        divide_item_time_and_mats_and_add_name();

        item_select.change(function() {
            hide_items = [];
            show_item_details();
        });
        per_sec_input.change(show_item_details);
        material_detail_checkbox.change(show_item_details);

        populate_select();

        // Test Code
        item_select.val(START_ON);
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

    function hide_material_button(material) {
        return `<div class='hide button' data-material='${material}')'></div>`;
    }

    function show_material_button(material) {
        return `<div class='show button' data-material='${material}')'></div>`;
    }

    function format_num(value) {
        return Math.floor(value * 100) / 100;
    }

    init();
});
