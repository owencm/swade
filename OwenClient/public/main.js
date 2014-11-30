var model = (function () {
  var listeners = [];
  var addListener = function (newListener) {
    listeners.push(newListener);
  };
  var changed = function () {
    listeners.map(function (listener) {
      listener();
    });
  };
  var items = [];
  var setItems = function (newItems) {
    items = newItems;
    changed();
  };
  var getItems = function () {
    return items;
  };

  return {setItems: setItems,
          getItems: getItems,
          addListener: addListener};
})();

var view = (function (model) {
  // This is the container which contains the cards
  var containerElem = document.querySelector('#container');
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
    console.log(elemTop +', compared to '+docViewBottom);
    return (elemTop < docViewBottom);
  };

  var insertItemIntoContainer = function (item) {
    var source = document.querySelector('#cardTemplate').innerHTML;
    var template = Handlebars.compile(source);
    var newHTML = template(item);
    var newElem = document.createElement('div');
    newElem.innerHTML = newHTML;
    containerElem.appendChild(newElem.children[0]);
  }

  var redrawItems = function () {
    // Empty the container so we can fill it again
    containerElem.innerHTML = '';
    var items = model.getItems();
    var i = 0;
    // While we have more to draw and there is visible space to fill
    while (i < items.length && isSpaceForMore()) {
      var item = items[i];
      item.id = i;
      insertItemIntoContainer(item);
      bottomItemId = i;
      i++;
    };
  }

  var drawMoreItemsIfNeeded = function () {
    var items = model.getItems();
    var i = bottomItemId + 1;
    while (i < items.length && isSpaceForMore()) {
      var item = items[i];
      item.id = i;
      insertItemIntoContainer(item);
      bottomItemId = i;
      i++;
    }
  }

  var handledScrollRecently = false;
  // Instead of checking and redrawing everything frequently we only do this every 200ms while scrolling
  var handleScroll = function () {
    if (!handledScrollRecently) {
      handledScrollRecently = true;
      setTimeout(function () {
        handledScrollRecently = false;
      }, 200);
      drawMoreItemsIfNeeded();
    }
  };
  window.addEventListener('scroll', handleScroll);

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