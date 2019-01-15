let chip8 = null;

$(document).ready( function() {
    chip8 = new Chip8();
    run_emulator('STARTUP');

    let keys = document.getElementsByClassName("key");
    for (let i = 0; i < keys.length; i++) {
        keys[i].addEventListener('touchstart', keypad_down, false);
        keys[i].addEventListener('touchend', keypad_up, false);
    }
});

async function run_emulator(file) {
    chip8.stop();
    await sleep(10);
    highlight_controls(file);
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "roms/" + file, true);
    xhr.responseType = "arraybuffer";
    xhr.onload = function () {
        chip8.clear();
        chip8.load(new Uint8Array(xhr.response));
    };
    xhr.send();
    chip8.run();
}

function highlight_controls(file) {
    let keys = document.getElementsByClassName("key");
    for (let i = 0; i < keys.length; i++) {
        keys[i].style.background = '#AAA'
    }
    switch (file) {
        case 'AIRPLANE':
        case 'LANDING':
            keys[9].style.background = "#666";
            break;
        case 'ASTRO':
        case 'INVADERS':
        case 'UFO':
            keys[4].style.background = "#666";
            keys[5].style.background = "#666";
            keys[6].style.background = "#666";
            break;
        case 'BLINKY':
            keys[2].style.background = "#666";
            keys[6].style.background = "#666";
            keys[8].style.background = "#666";
            keys[9].style.background = "#666";
            break;
        case 'BRIX':
            keys[4].style.background = "#666";
            keys[6].style.background = "#666";
            break;
        case 'CAVE':
            keys[1].style.background = "#666";
            keys[4].style.background = "#666";
            keys[6].style.background = "#666";
            keys[9].style.background = "#666";
            keys[15].style.background = "#666";
            break;
        case 'LUNAR':
            keys[1].style.background = "#666";
            keys[4].style.background = "#666";
            keys[6].style.background = "#666";
            break;
        case 'PADDLES':
            keys[4].style.background = "#666";
            keys[6].style.background = "#666";
            keys[15].style.background = "#666";
            break;
        case 'PONG':
        case 'VBRIX':
            keys[0].style.background = "#666";
            keys[4].style.background = "#666";
            break;
        case 'TANK':
            keys[1].style.background = "#666";
            keys[4].style.background = "#666";
            keys[5].style.background = "#666";
            keys[6].style.background = "#666";
            keys[9].style.background = "#666";
            break;
        case 'TETRIS':
            keys[4].style.background = "#666";
            keys[5].style.background = "#666";
            keys[6].style.background = "#666";
            keys[8].style.background = "#666";
            break;
        case 'WORM':
        case 'XMIRROR':
            keys[1].style.background = "#666";
            keys[4].style.background = "#666";
            keys[6].style.background = "#666";
            keys[9].style.background = "#666";
            break;
    }
}

function menu() {
    document.getElementById("menu_button").classList.toggle("change");

    let slide = document.getElementById("slide_menu");
    if (slide.style.left === "0em") {
        slide.style.left = "-21em";
    } else slide.style.left = "0em";
}

function show_roms() {
    let style = document.getElementById("rom_list").style;
    if (style.display === 'none') style.display = 'block';
    else style.display = 'none';
}

function sleep() {
    return new Promise(resolve => setTimeout(resolve, 10));
}

function keypad_down(event) {
    chip8.keypress(parseInt(event.target.innerHTML, 16), 1)
}

function keypad_up(event) {
    chip8.keypress(parseInt(event.target.innerHTML, 16), 0);
}

document.onkeydown = function (e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 49:
            chip8.keypress(0x1, 1);
            break;
        case 50:
            chip8.keypress(0x2, 1);
            break;
        case 51:
            chip8.keypress(0x3, 1);
            break;
        case 52:
            chip8.keypress(0xC, 1);
            break;
        case 81:
            chip8.keypress(0x4, 1);
            break;
        case 87:
            chip8.keypress(0x5, 1);
            break;
        case 69:
            chip8.keypress(0x6, 1);
            break;
        case 82:
            chip8.keypress(0xD, 1);
            break;
        case 65:
            chip8.keypress(0x7, 1);
            break;
        case 83:
            chip8.keypress(0x8, 1);
            break;
        case 68:
            chip8.keypress(0x9, 1);
            break;
        case 70:
            chip8.keypress(0xE, 1);
            break;
        case 90:
            chip8.keypress(0xA, 1);
            break;
        case 88:
            chip8.keypress(0x0, 1);
            break;
        case 67:
            chip8.keypress(0xB, 1);
            break;
        case 86:
            chip8.keypress(0xF, 1);
            break;
    }
};

document.onkeyup = function (e) {
    e = e || window.event;
    switch (e.keyCode) {
        case 49:
            chip8.keypress(0x1, 0);
            break;
        case 50:
            chip8.keypress(0x2, 0);
            break;
        case 51:
            chip8.keypress(0x3, 0);
            break;
        case 52:
            chip8.keypress(0xC, 0);
            break;
        case 81:
            chip8.keypress(0x4, 0);
            break;
        case 87:
            chip8.keypress(0x5, 0);
            break;
        case 69:
            chip8.keypress(0x6, 0);
            break;
        case 82:
            chip8.keypress(0xD, 0);
            break;
        case 65:
            chip8.keypress(0x7, 0);
            break;
        case 83:
            chip8.keypress(0x8, 0);
            break;
        case 68:
            chip8.keypress(0x9, 0);
            break;
        case 70:
            chip8.keypress(0xE, 0);
            break;
        case 90:
            chip8.keypress(0xA, 0);
            break;
        case 88:
            chip8.keypress(0x0, 0);
            break;
        case 67:
            chip8.keypress(0xB, 0);
            break;
        case 86:
            chip8.keypress(0xF, 0);
            break;
    }
};

// prevents image dragging
$(document).on("dragstart", function() {
    return false;
});

// from Stack Overflow
// https://stackoverflow.com/questions/1403615/use-jquery-to-hide-a-div-when-the-user-clicks-outside-of-it
$(document).mouseup(function(e)
{
    let container = $("rom_list");

    // if the target of the click isn't the container nor a descendant of the container
    if (!container.is(e.target) && container.has(e.target).length === 0)
    {
        let style = document.getElementById("rom_list").style;
        if (style.display !== 'none') show_roms();
    }
});