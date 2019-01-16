/**
 * @author Paul Scott
 * @version 15 January 2019
 *
 * javascript file for 'controls.html'
 *
 */

/**
 * toggle sliding menu
 */
function menu() {
    document.getElementById("menu_button").classList.toggle("change");

    let slide = document.getElementById("slide_menu");
    if (slide.style.left === "0em") {
        slide.style.left = "-21em";
    } else slide.style.left = "0em";
}

/**
 * prevents image dragging
 */
$(document).on("dragstart", function() {
    return false;
});