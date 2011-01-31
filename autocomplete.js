(function(window, undefined) {

function extend() { var hasOwnProp, p, i, l, r
  hasOwnProp = Object.prototype.hasOwnProperty
  r = {}
  for (i = 0, l = arguments.length; i < l; ++i)
    for (p in arguments[i])
      if (hasOwnProp.call(arguments[i], p))
        r[p] = arguments[i][p]
  return r}

function getPos(el) { var x, y
  x = 0, y = 0
  do {
    x += el.offsetLeft
    y += el.offsetTop}
  while (el = el.offsetParent)
  return {x: x, y: y}}

function XHRGet(url, cb) { var req
  if (window.XMLHttpRequest) req = new XMLHttpRequest()
  else if (window.ActiveXObject) req = new ActiveXObject('Microsoft.XMLHTTP')
  else alert('This browser does not support Ajax')
  req.open('GET', url, true)
  req.onreadystatechange = function(e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        cb(req)
      }
      else throw new Error('Couldn\'t fetch the data from the server')}}}

function Autocomplete(input, options) { var suggestBox, timeout, inputValue

  function loadData(string) {
    if (typeof options.data == "object") {
      // Fetch data from the provided object
      updateSuggestBox(filterDataSet(options.data, string))}
    else if (typeof options.data == "string")
      // Fetch data from an xhr
      XHRGet(options.data + '?q=' + encodeURIComponent(string)
            ,function(e) {updateSuggestBox(JSON.parse(e.responseText))})}

  function filterDataSet(dataDict, value) {var p, hasOwnProp, ret
    hasOwnProp = Object.prototype.hasOwnProperty
    ret = []
    if (isNaN(Number(value))) {
      for (p in dataDict)
        if (hasOwnProp.call(dataDict, p) && dataDict[p].toLowerCase().indexOf(value.toLowerCase()) == 0)
          ret.push(dataDict[p])}
    else {
      for (p in dataDict)
        if (hasOwnProp.call(dataDict, p) && p.indexOf(value) == 0)
          ret.push(dataDict[p])}
    return ret} 

  function updateSuggestBox(dataList) { var i, l, fragment, div, p
    suggestBox.innerHTML = ''
    suggestBox.style.display = 'none';
    if (dataList.length > 0) {
      fragment = document.createDocumentFragment()
      for (i = 0, l = dataList.length; i < l; ++i) {
        div = document.createElement('div')
        div.className = 'acsb-element'
        p = document.createElement('p')
        p.className = 'acsb-p'
        p.appendChild(document.createTextNode(dataList[i]))
        div.appendChild(p)
        fragment.appendChild(div)}
      suggestBox.appendChild(fragment)
      suggestBox.style.display = 'block'}}

  input.onkeyup = function(e) {var last
    if (input.value == inputValue) return false
    inputValue = input.value
    last = inputValue.split(options.fieldSeparator).pop()
    if (timeout) window.clearTimeout(timeout)
    if (last.length >= options.minChars) 
                 timeout = setTimeout(function(){loadData(last)}
                                     ,options.updateTimeout)}

  input.onkeydown = function(e) {var sel
    e = e || window.event
    if (suggestBox.style.display == 'block') {
      sel = suggestBox.getElementsByClassName('hover')[0]
      if (!sel) {
        if (e.keyCode == 40) suggestBox.firstChild.className += ' hover'
        if (e.keyCode == 38) suggestBox.lastChild.className += ' hover'}
      // If some suggestion is selected:
      else {
        sel.className = sel.className.replace('hover', '')
        if (e.keyCode == 40)
          if (sel.nextSibling) sel.nextSibling.className += ' hover'
          else suggestBox.firstChild.className += ' hover'
        if (e.keyCode == 38)
          if (sel.previousSibling) sel.previousSibling.className += ' hover'
          else suggestBox.lastChild.className +=' hover'
        if (e.keyCode == 13) {
          input.value = input.value.replace(/(, )?[^, ]*$/, '$1'+sel.textContent+', ')
          suggestBox.style.display = 'none'
          return false}
        // TODO should return false only for special keys the app uses (up, down, esc)
        }}}


  options = extend(defaultOptions, options)
  suggestBox = document.createElement('div')
  suggestBox.className = 'acsb'
  suggestBox.style.display = 'none'
  suggestBox.style.position = 'absolute'
  var pos = getPos(input)
  suggestBox.style.top = pos.y + input.offsetHeight + 'px'
  suggestBox.style.left = pos.x + 'px'
  suggestBox.style.width = input.offsetWidth + 'px'
  document.body.appendChild(suggestBox)

  // IE
  input.autocomplete = 'off'
  // Other browsers
  input.setAttribute('autocomplete', 'off')

}

// EXPORTS
window.Autocomplete = Autocomplete

// DEFAULTS
defaultOptions = {minChars: 3
                 ,updateTimeout: 50
                 ,fieldSeparator: ", "
                 ,data: {}
                 }


})(this)
