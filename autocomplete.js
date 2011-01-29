(function(window, undefined) {

function Autocomplete(input, options) {

  function getPos(el) {
    var x = 0, y = 0
    do {
      x += el.offsetX
      y += el.offsetY
    } while (el = el.offsetParent)

}

// EXPORTS
window.Autocomplete = Autocomplete

})(this)
