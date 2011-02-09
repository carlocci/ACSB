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

function Autocomplete(input, options) {var suggestBox, timeout, inputValue, that

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

  function updateSuggestBox(dataDict) {var i, fragment, div, p, hasOwnProp
    hasOwnProp = Object.prototype.hasOwnProperty
    suggestBox.innerHTML = ''
    suggestBox.style.display = 'none';
    fragment = document.createDocumentFragment()
    for (i in dataDict)
      if (hasOwnProp.call(dataDict, i)) {
        div = document.createElement('div')
        div.className = 'acsb-element'
        div.id = i
        div.onmouseover = addHover
        div.onmouseout = removeHover
        p = document.createElement('p')
        p.className = 'acsb-p'
        p.appendChild(document.createTextNode(dataDict[i]))
        div.appendChild(p)
        fragment.appendChild(div)}
    suggestBox.appendChild(fragment)
    suggestBox.style.display = 'block'

    // Helper functions
    function addHover() {
      this.className += ' hover'}

    function removeHover(e) {
      this.className = this.className.replace(/ ?\bhover\b ?/g, '')}}

  function singleClickHandler(e) {var t, el, value
    e = e || window.event
    t = e.target || e.srcElement
    if (t.className.indexOf('acsb-element') >= 0) {el = t}
    else if (t.parentNode.className.indexOf('acsb-element') >= 0) {el = t.parentNode}
    else return
    if (typeof options.onPick == 'function') {
      value = el.textContent || el.innerText
      options.onPick.call(that, {'type': 'pick'
                                ,'input': input
                                ,'target': el
                                ,'value': value
                                ,'suggestBox': suggestBox})}}

  function multipleClicksHandler(e) {var t, value, el
    e = e || window.event
    t = e.target || e.srcElement
    if (t.className.indexOf('acsb-element') >= 0) {el = t}
    else if (t.parentNode.className.indexOf('acsb-element') >= 0) {el = t.parentNode}
    else return
      if (typeof options.onPick == 'function') {
        value = el.textContent || el.innerText
        options.onPick.call(that, {'type': 'pick'
                                  ,'input': input
                                  ,'target': el
                                  ,'value': value
                                  ,'suggestBox': suggestBox})}}

  function keysNavigationHandler(e) {var sel, value
    e = e || window.event
    if (suggestBox.style.display == 'block') {
      sel = suggestBox.getElementsByClassName('hover')[0]
      if (!sel) {
        if (e.keyCode == 40) suggestBox.firstChild.className += ' hover'
        if (e.keyCode == 38) suggestBox.lastChild.className += ' hover'}
      // If some suggestion is selected:
      else {
        sel.className = sel.className.replace('hover', '')
        // 40 is the down arrow key
        if (e.keyCode == 40)
          if (sel.nextSibling) sel.nextSibling.className += ' hover'
          else suggestBox.firstChild.className += ' hover'
        // 38 is the up arrow key
        if (e.keyCode == 38)
          if (sel.previousSibling) sel.previousSibling.className += ' hover'
          else suggestBox.lastChild.className +=' hover'
        // 13 is the enter key
        if (e.keyCode == 13) {
          if (typeof options.onPick == 'function')
            value = sel.textContent || sel.innerText
            options.onPick.call(that, {'type': 'pick'
                                      ,'input': input
                                      ,'target': sel
                                      ,'value': value
                                      ,'suggestBox': suggestBox})
          return false}
        // TODO should return false only for special keys the app uses (up, down, esc)
        }}}

  // Constructor
  that = this
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

  // Events
  input.onkeyup = function(e) {var last
    if (input.value == inputValue) return false
    inputValue = input.value
    last = inputValue.split(options.fieldSeparator).pop()
    if (timeout) window.clearTimeout(timeout)
    if (last.length >= options.minChars) 
                 timeout = setTimeout(function(){loadData(last)}
                                     ,options.updateTimeout)}


  input.onkeydown = keysNavigationHandler
  if (!multiclickAsDefault) {
    suggestBox.onclick = singleClickHandler
    document.body.onkeydown = function(e) {
      e = e || window.event
      // 17 is the control key
      if (e.keyCode == 17) suggestBox.onclick = multipleClicksHandler}
    document.body.onkeyup = function(e) {
      e = e || window.event
      // 17 is the control key
      if (e.keyCode == 17) suggestBox.onclick = singleClickHandler}}
  else suggestBox.onclick = multipleClickHandler

  // API
  that.options = options

}

// EXPORTS
window.Autocomplete = Autocomplete

// DEFAULTS
defaultOptions = {minChars: 3
                 ,updateTimeout: 100
                 ,data: {}
                 ,queryURL: undefined
                 ,queryParameters: undefined
                 ,multiclickAsDefault: false
                 ,fieldSeparator: ", "
                 ,onPick: function(e) {
                    e.input.value = e.input.value.replace(/(, )?[^, ]*$/, '$1' + e.value + ', ')
                    e.suggestBox.style.display = 'none'}
                 }
})(this)
