// Variables

const units = {
    mg_to_g: 0.001,
    kg_to_g: 1000,
    t_to_g: 1000000,
    lbs_to_g: 453.592,
    oz_to_g: 28.3495,
}

const input_buttons = document.querySelectorAll('.input > button');
const output_buttons = document.querySelectorAll('.output > button');

const input = document.querySelectorAll('.display')[0];
const output = document.querySelectorAll('.display')[1];

const clear_btn = document.querySelector('#clear');

// Selector functions

input_buttons.forEach(item => {
    item.addEventListener('click', function(e) {
        for (let i = 0; i < input_buttons.length; i++) {
            if (input_buttons[i].classList.contains('checked')) {
                input_buttons[i].classList.toggle('checked');
            }
        }
        let target = e.target;
        target.classList.toggle('checked');
        getInfo()
    });
})

output_buttons.forEach(item => {
    item.addEventListener('click', function(e) {
        for (let i = 0; i < output_buttons.length; i++) {
            if (output_buttons[i].classList.contains('checked')) {
                output_buttons[i].classList.toggle('checked');
            }
        }
        let target = e.target;
        target.classList.toggle('checked');
        getInfo()
    });
})

// Converter functions

input.addEventListener('input', getInfo);

function getInfo() {
    let selected_units = document.querySelectorAll('.checked');
    output.value = Convert(input.value, selected_units[0].textContent, selected_units[1].textContent);
}

function Convert(number, input_unit, output_unit) {
    let result;
    switch (input_unit) {
        case "g":
            result = number * 1;
            break;
        case "mg":
            result = number * units.mg_to_g;
            break;
        case "kg":
            result = number * units.kg_to_g;
            break;
        case "t":
            result = number * units.t_to_g;
            break;
        case "lbs":
            result = number * units.lbs_to_g;
            break;
        case "oz":
            result = number * units.oz_to_g;
            break;
    }

    switch (output_unit) {
        case "g":
            break;
        case "mg":
            result = result / units.mg_to_g;
            break;
        case "kg":
            result = result / units.kg_to_g;
            break;
        case "t":
            result = result / units.t_to_g;
            break;
        case "lbs":
            result = result / units.lbs_to_g;
            break;
        case "oz":
            result = result / units.oz_to_g;
            break;
    }

    if (result == 0) {
        return "";
    }
    else {
        result = +result.toFixed(3)
        return result;
    }
}

// Clear button

clear_btn.addEventListener('click', ()=> {
    input.value = '';
    getInfo();
})