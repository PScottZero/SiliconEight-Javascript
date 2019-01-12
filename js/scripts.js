$(document).ready(function(){
    let chip8 = new Chip8();
    $("#file_selector").on('change', function() {
        chip8.clear(chip8);
        chip8.load(chip8);
        window.setInterval(function() {
            chip8.step(chip8);
        }, 1);
    });

    document.onkeydown = function (e) {
        e = e || window.event;
        switch (e.keyCode) {
            case 49:
                chip8.keypress(chip8, 0x1, 1);
                break;
            case 50:
                chip8.keypress(chip8, 0x2, 1);
                break;
            case 51:
                chip8.keypress(chip8, 0x3, 1);
                break;
            case 52:
                chip8.keypress(chip8, 0xC, 1);
                break;
            case 81:
                chip8.keypress(chip8, 0x4, 1);
                break;
            case 87:
                chip8.keypress(chip8, 0x5, 1);
                break;
            case 69:
                chip8.keypress(chip8, 0x6, 1);
                break;
            case 82:
                chip8.keypress(chip8, 0xD, 1);
                break;
            case 65:
                chip8.keypress(chip8, 0x7, 1);
                break;
            case 83:
                chip8.keypress(chip8, 0x8, 1);
                break;
            case 68:
                chip8.keypress(chip8, 0x9, 1);
                break;
            case 70:
                chip8.keypress(chip8, 0xE, 1);
                break;
            case 90:
                chip8.keypress(chip8, 0xA, 1);
                break;
            case 88:
                chip8.keypress(chip8, 0x0, 1);
                break;
            case 67:
                chip8.keypress(chip8, 0xB, 1);
                break;
            case 86:
                chip8.keypress(chip8, 0xF, 1);
                break;
        }
    };

    document.onkeyup = function (e) {
        e = e || window.event;
        switch (e.keyCode) {
            case 49:
                chip8.keypress(chip8, "1", 0);
                break;
            case 50:
                chip8.keypress(chip8, "2", 0);
                break;
            case 51:
                chip8.keypress(chip8, "3", 0);
                break;
            case 52:
                chip8.keypress(chip8, "C", 0);
                break;
            case 81:
                chip8.keypress(chip8, "4", 0);
                break;
            case 87:
                chip8.keypress(chip8, "5", 0);
                break;
            case 69:
                chip8.keypress(chip8, "6", 0);
                break;
            case 82:
                chip8.keypress(chip8, "D", 0);
                break;
            case 65:
                chip8.keypress(chip8, "7", 0);
                break;
            case 83:
                chip8.keypress(chip8, "8", 0);
                break;
            case 68:
                chip8.keypress(chip8, "9", 0);
                break;
            case 70:
                chip8.keypress(chip8, "E", 0);
                break;
            case 90:
                chip8.keypress(chip8, "A", 0);
                break;
            case 88:
                chip8.keypress(chip8, "0", 0);
                break;
            case 67:
                chip8.keypress(chip8, "B", 0);
                break;
            case 86:
                chip8.keypress(chip8, "F", 0);
                break;
        }
    };
});

function menu() {
    document.getElementById("menu_button").classList.toggle("change");

    let slide = document.getElementById("slide_menu");
    if (slide.style.left === "0em") {
        slide.style.left = "-21em";
    } else slide.style.left = "0em";
}