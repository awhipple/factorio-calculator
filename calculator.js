$(function() {
    var items = window.items;
    var item_select = $("#item_select");
    var materials_display = $("#materials");

    function show_item_details() {
        var item = items[item_select.val()];

        materials_display.empty();

        add_header(materials_display, "Production Time");
        materials_display.append(`${item.time} seconds`);

        add_header(materials_display, "Materials");
        show_item_materials(item, '');
    }

    function show_item_materials(item, spacers) {
        var keys = item.mats ? Object.keys(item.mats) : [];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var sub_item = items[key];

            var first_item = i === 0;
            var last_item = i === keys.length - 1;

            materials_display.append(first_item && spacers.length >= 3 ? spacers.slice(0, -3) + '-->' : spacers, `${key}: ${item.mats[key]}`, '<br />');
            materials_display.append(spacers, (last_item && !sub_item) ? ' ' : '|', '<br />');

            if (sub_item) {
                show_item_materials(sub_item, spacers + (last_item ? '   ' : '|  '));
            }
        }
    }

    function init() {
        divide_item_time_and_mats();

        item_select.change(show_item_details);

        populate_select();

        // Test Code
        item_select.val("logistic science pack");
        item_select.change();
    }

    function divide_item_time_and_mats() {
        for (var main_item_key in items) {
            var main_item = items[main_item_key];
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
        element.append(`<h3>${text}</h3>`);
    }

    init();
});