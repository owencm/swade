var model = (function () {
  var listeners = [];
  var addListener = function (newListener) {
    listeners.push(newListener);
  };
  var changed = function () {
    listeners.map(function (listener) {
      listener();
    });
  }
  var items = [];
  var setItems = function (newItems) {
    items = newItems;
    changed();
  }
  var getItems = function () {
    return items;
  }

  return {setItems: setItems,
          getItems: getItems,
          addListener: addListener};
})();

var view = (function (model) {
  // This is the ID of the lowest item shown on the page
  var bottomItemId;
  var isSpaceForMore = function () {
    if (bottomItemId == undefined) {
      return true;
    }
    bottomElem = document.querySelector('#item'+bottomItemId);
    var docViewTop = window.scrollY;
    var docViewBottom = docViewTop + window.innerHeight;
    var elemTop = bottomElem.offsetTop;
    return (elemTop < docViewBottom);
  }

  var redrawItems = function () {
    var containerElem = document.querySelector('#container');
    // Empty the container so we can fill it again
    containerElem.innerHTML = '';
    var items = model.getItems();
    var i = 0;
    // While we have more to draw and there is visible space to fill
    while (i < items.length && isSpaceForMore()) {
      var item = items[i];
      item.id = i;
      var source = document.querySelector('#cardTemplate').innerHTML;
      var template = Handlebars.compile(source);
      var newHTML = template(item);
      var newElem = document.createElement('div');
      newElem.innerHTML = newHTML;
      containerElem.appendChild(newElem);
      bottomItemId = i;
      i++;
    }
  }
  model.addListener(redrawItems);
})(model);

var network = (function (model) {
  var getItemsFromServer = function () {
    var req = new XMLHttpRequest();
    req.onload = function () {
      console.log(this.responseText);
      if(req.status >= 200 && req.status < 400) {
        // These are the new items sent to us by the server
        model.setItems(JSON.parse(this.responseText));
      } else {
        // Request failed
        throw ('Request failed');
      }
    }
    req.open('get', 'items.json', true);
    req.setRequestHeader('Content-type', 'application/json');
    req.send();
  }

  return {getItemsFromServer: getItemsFromServer}
})(model);

network.getItemsFromServer();