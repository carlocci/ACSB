(function(window, undefined) {

function addEvent(el, ev, cb) {
  if (el.addEventListener) el.addEventListener(ev, cb, false)
  else if (el.attachEvent) el.attachEvent('on' + ev, cb)}

function removeEvent(el, ev, cb) {
  if (el.removeEventListener) el.removeEventListener(ev, cb, false)
  else if (el.detachEvent) el.detachEvent('on' + ev, cb)}

function getStyle(el, p) {var r
  if (window.getComputedStyle) r = getComputedStyle(el,null).getPropertyValue(p);
  else                         r = el.currentStyle[p]
  return r}

function extend() { var hasOwnProp, p, i, l, r
  hasOwnProp = Object.prototype.hasOwnProperty
  r = {}
  for (i = 0, l = arguments.length; i < l; ++i)
    for (p in arguments[i])
      if (hasOwnProp.call(arguments[i], p))
        r[p] = arguments[i][p]
  return r}

function contains(a, b) {
  return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16)}

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
  req.send()
  return req}

function Autocomplete(input, options) {var suggestBox, timeout, inputValue, xhr, that

  function loadData(string) {
    if (typeof options.onFetch == 'function')
      if (options.onFetch.call(that, string) === false) return false
    if (typeof options.queryURL == "string")
      // Fetch data from an xhr
      xhr = XHRGet(options.queryURL
                  ,extend(options.queryParameters, {'value': string})
                  ,function(e) {var msg
                     try {updateSuggestBox(JSON.parse(e.responseText))}
                     catch (error) {
                       if (error.name == 'SyntaxError')
                         alert('Il server ha risposto in modo inaspettato\n\n'
                               + e.responseText)
                       else throw error}})
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

  function updateSuggestBox(dataDict) {var i, fragment, div, p, hasOwnProp, n
    // this is to catch the case where the user delete every character and we
    // don't manage to catch it in time to stop the xhr callback from firing
    // It's the wrong way to do it (see input.onkeyup handler)
    if (input.value.length < options.minChars) return
    hasOwnProp = Object.prototype.hasOwnProperty
    n = 0
    suggestBox.innerHTML = ''
    fragment = document.createDocumentFragment()
    for (i in dataDict)
      if (hasOwnProp.call(dataDict, i)) {
        ++n
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
    // If there is at least one element, i is not undefin...NOT!
    // GODDAMN YOU, PROTOTYPE! ROT IN HELL FFS
    //if (i !== undefined) that.showSuggestBox(true)
    if (n > 0 && getStyle(suggestBox, 'display') == 'none')
      that.showSuggestBox(true)
    else if (n === 0 && getStyle(suggestBox, 'display') == 'block')
      that.showSuggestBox(false)

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

  var multipleClicksHandler = singleClickHandler

  function keysNavigationHandler(e) {var sel, value
    e = e || window.event
    // If the suggestBox is not shown
    if (getStyle(suggestBox, 'display') == 'none') {
      if (e.keyCode == 40) {
        that.showSuggestBox(true)
        if (suggestBox.firstChild) suggestBox.firstChild.className += ' hover'}}
    // If the suggestBox is shown
    else if (getStyle(suggestBox, 'display') == 'block') {
      if (e.keyCode == 27) // esc
      that.showSuggestBox(false)
      sel = suggestBox.getElementsByClassName('hover')[0]
      // If there is no selection:
      if (!sel) {
        if (e.keyCode == 40) suggestBox.firstChild.className += ' hover'
        if (e.keyCode == 38) suggestBox.lastChild.className += ' hover'}
      // If some suggestion is selected:
      else {
        sel.className = sel.className.replace('hover', '')
        if (e.keyCode == 40) // down arrow
          if (sel.nextSibling) {
            sel.nextSibling.className += ' hover'}
          else {
            suggestBox.firstChild.className += ' hover'}
        if (e.keyCode == 38) // up arrow
          if (sel.previousSibling) {
            sel.previousSibling.className += ' hover'}
          else {
            suggestBox.lastChild.className +=' hover'}
        if (e.keyCode == 13) { // enter
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
  suggestBox.style.zIndex = 999
  suggestBox.style.width = input.offsetWidth + 'px'
  input.parentNode.appendChild(suggestBox)

  // IE
  input.autocomplete = 'off'
  // Other browsers
  input.setAttribute('autocomplete', 'off')

  // Events
  input.onkeyup = function(e) {var last
    // TODO investigate some time
    if (input.value.length < options.minChars) {
      that.showSuggestBox(false)
      if (timeout) window.clearTimeout(timeout)
      // This raises some error, but it would be the right way to do it
      // See the updateSuggestBox function for the "temporary" fix
      /*if (xhr)     {xhr.onreadystatechange = null
                    xhr.abort()
                    xhr = undefined}*/
    }
    if (input.value == inputValue) return false
    inputValue = input.value
    last = inputValue.split(options.fieldSeparator).pop()
    if (timeout) window.clearTimeout(timeout)
    if (last.length >= options.minChars) 
                 timeout = setTimeout(function(){loadData(last)}
                                     ,options.updateTimeout)}

  input.onkeydown = keysNavigationHandler

  if (!options.multiclickAsDefault) {
    suggestBox.onclick = singleClickHandler
  /*  document.body.onkeydown = function(e) {
      e = e || window.event
      // 17 is the control key
      if (e.keyCode == 17) suggestBox.onclick = multipleClicksHandler}
    document.body.onkeyup = function(e) {
      e = e || window.event
      if (e.keyCode == 17) suggestBox.onclick = singleClickHandler}*/}
  else suggestBox.onclick = multipleClickHandler

  // API
  that.options = options
  that.forceUpdate = function() {loadData(input.value)}
  that.showSuggestBox = (function() {
      function handler(e) {
        e = e || window.event
        if (e.keyCode == 27) that.showSuggestBox(false)} // 27 is esc

      return function(bool) {
        options.showHide.call(suggestBox, bool)
        if (bool)    addEvent(window, 'keydown', handler)
        else      removeEvent(window, 'keydown', handler)}})()
}

// EXPORTS
window.Autocomplete = Autocomplete

// DEFAULTS
defaultOptions = {minChars: 3
                 ,updateTimeout: 100
                 ,data: {}
                 ,queryURL: undefined
                 ,queryParameters: undefined
                 ,onFetch: undefined
                 ,multiclickAsDefault: false
                 ,fieldSeparator: ", "
                 ,onPick: function(e) {
                    e.input.value = e.input.value.replace(/(, )?[^, ]*$/, '$1' + e.value + ', ')
                    this.showSuggestBox(false)}
                 ,showHide: function(bool) {
                    if (bool) this.style.display = 'block'
                    else      this.style.display = 'none'}}
})(this)
