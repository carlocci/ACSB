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

function XHRGet(url, parameters, cb) { var p, req, hasOwnProp
  hasOwnProp = Object.prototype.hasOwnProperty
  if (window.XMLHttpRequest) req = new XMLHttpRequest()
  else if (window.ActiveXObject) {req = new ActiveXObject('Microsoft.XMLHTTP')}
  else alert('This browser does not support Ajax')
  url += '?'
  for (p in parameters) 
    if (hasOwnProp.call(parameters, p))
      url += encodeURIComponent(p) + '=' + encodeURIComponent(parameters[p]) + '&'
  url = url.substring(0, url.length-1)
  req.open('GET', url, true)
  req.onreadystatechange = function(e) {
    if (req.readyState == 4) {
      if (req.status == 200) {
        cb(req)
      }
      else throw new Error('Couldn\'t fetch the data from the server')}}
  req.send()}

function Autocomplete(input, options) { var suggestBox, timeout, inputValue, that

  function loadData(string) {
    if (typeof options.queryURL == "string")
      // Fetch data from an xhr
      XHRGet(options.queryURL
            ,extend(options.queryParameters, {'value': string})
            ,function(e) {try {updateSuggestBox(JSON.parse(e.responseText))}
                          catch (error) {alert('Il server ha risposto in modo inaspettato\n' + e.responseText)}})
    else if (typeof options.data == "object")
      // Fetch data from the provided object
      updateSuggestBox(filterDataSet(options.data, string))}

  function filterDataSet(dataDict, value) {var p, hasOwnProp, ret
    hasOwnProp = Object.prototype.hasOwnProperty
    ret = {}
    if (isNaN(Number(value))) {
      for (p in dataDict)
        if (hasOwnProp.call(dataDict, p) && dataDict[p].toLowerCase().indexOf(value.toLowerCase()) == 0)
          ret[p] = dataDict[p]}
    else {
      for (p in dataDict)
        if (hasOwnProp.call(dataDict, p) && p.indexOf(value) == 0)
          ret[p] = dataDict[p]}
    return ret} 

  function updateSuggestBox(dataDict) { var i, fragment, div, p, hasOwnProp
    hasOwnProp = Object.prototype.hasOwnProperty
    suggestBox.innerHTML = ''
    suggestBox.style.display = 'none';
    fragment = document.createDocumentFragment()
    for (i in dataDict)
      if (hasOwnProp.call(dataDict, i)) {
        div = document.createElement('div')
        div.className = 'acsb-element'
        div.id = i
        p = document.createElement('p')
        p.className = 'acsb-p'
        p.appendChild(document.createTextNode(dataDict[i]))
        div.appendChild(p)
        fragment.appendChild(div)}
    suggestBox.appendChild(fragment)
    suggestBox.style.display = 'block'}

  input.onkeyup = function(e) {var last
    if (input.value == inputValue) return false
    inputValue = input.value
    last = inputValue.split(options.fieldSeparator).pop()
    if (timeout) window.clearTimeout(timeout)
    if (last.length >= options.minChars) 
                 timeout = setTimeout(function(){loadData(last)}
                                     ,options.updateTimeout)}

  input.onkeydown = function(e) {var sel, value
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
          value = sel.textContent || sel.innerText
          if (typeof options.onPick == 'function')
            options.onPick.call(that, {'type': 'pick'
                                      ,'input': input
                                      ,'target': sel
                                      ,'value': value
                                      ,'suggestBox': suggestBox})
          return false}
        // TODO should return false only for special keys the app uses (up, down, esc)
        }}}

  that = this
  options = extend(defaultOptions, options)
  suggestBox = document.createElement('div')
  suggestBox.className = 'acsb'
  suggestBox.style.display = 'none'
  suggestBox.style.position = 'absolute'
  var pos = getPos(input)
  suggestBox.style.top = pos.y + input.offsetHeight + 'px'
  suggestBox.style.width = input.offsetWidth + 'px'
  input.parentNode.style.position = 'relative'
  input.parentNode.appendChild(suggestBox)

  // IE
  input.autocomplete = 'off'
  // Other browsers
  input.setAttribute('autocomplete', 'off')
}

// EXPORTS
window.Autocomplete = Autocomplete

// DEFAULTS
defaultOptions = {minChars: 3
                 ,updateTimeout: 100
                 ,fieldSeparator: ", "
                 ,data: {}
                 ,queryURL: undefined
                 ,queryParameters: undefined
                 ,onPick: function(e) {
                    e.input.value = e.input.value.replace(/(, )?[^, ]*$/, '$1' + e.value + ', ')
                    e.suggestBox.style.display = 'none'}
                 }
})(this)
