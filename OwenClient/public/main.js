var model = (function () {
  // This is the ID of the lowest item shown on the page
  var bottomItemId;
  var selected;
  var getBottomItemId = function () {
    return bottomItemId;
  }
  var setBottomItemId = function (newBottomItemId) {
    bottomItemId = newBottomItemId;
  }

  var getSelected = function () {
    return selected;
  }
  var setSelected = function (newSelected) {
    selected = newSelected;
  }

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
  var addItems = function (newItems) {
    items = items.concat(newItems);
  }
  var replaceUnshownItems = function (newItems) {
    console.log('adding new items');
    for (var i = items.length-1; i > 0; i--) {
      if (items[i].id == bottomItemId) {
        break;
      } else {
        items.pop();
      }
    }
    items = items.concat(newItems);
  }

  return {setItems: setItems,
          getItems: getItems,
          addItems: addItems,
          addListener: addListener,
          setBottomItemId: setBottomItemId,
          getBottomItemId: getBottomItemId,
          replaceUnshownItems: replaceUnshownItems,
          setSelected: setSelected,
          getSelected: getSelected
        };
})();

$(document).ready(function(){
  $( ".filtersContainer a" ).bind( "click", function(event) {
    console.log($(event.target).attr('class')+"="+event.target.id);
  });
});

var view = (function (model) {
  var scrollY = 0;
  // This is the container which contains the cards
  var listContainerElem = document.querySelector('#listContainer');
  var detailContainerElem = document.querySelector('#detailContainer');

  var MODE = {list: 0, detail: 1};
  var mode = MODE.list;

  var changeMode = function (newMode) {
    var footerElem = document.querySelector('footer');
    var backButtonElem = document.querySelector('#backButton');
    if (newMode == MODE.detail) {
      // TODO store and restore scroll
      listContainerElem.style.display = 'none';
      footerElem.style.display = 'none';
      detailContainerElem.style.display = 'block';
      redrawDetails();
      backButtonElem.style.display = '';
      var toastElem = document.querySelector('#toast');
      toastElem.style.opacity = 0;
    }
    if (newMode == MODE.list) {
      listContainerElem.style.display = '';
      footerElem.style.display = '';
      detailContainerElem.style.display = 'none';
      backButtonElem.style.display = 'none';
      window.scrollTo(0, scrollY);
    }
    mode = newMode;
  }

  var isSpaceForMore = function () {
    if (model.getBottomItemId() == undefined) {
      return true;
    }
    bottomElem = document.querySelector('#item'+model.getBottomItemId());
    var docViewTop = window.scrollY;
    var docViewBottom = docViewTop + window.innerHeight;
    var elemTop = bottomElem.offsetTop;
    // console.log('item ' + model.getBottomItemId() +' top is '+elemTop +', compared to '+docViewBottom);
    return (elemTop < docViewBottom);
  };

  var insertItemIntoContainer = function (item) {
    var source = document.querySelector('#cardTemplate').innerHTML;
    var template = Handlebars.compile(source);
    var newHTML = template(item);
    var newElem = document.createElement('div');
    newElem.innerHTML = newHTML;
    listContainerElem.appendChild(newElem.children[0]);

    var thumbContainer = listContainerElem.querySelector('#item'+item.id).querySelector('.thumbContainer');
    thumbContainer.addEventListener('click', function () {
      if (!thumbContainer.classList.contains('liked')) {
        var toastElem = document.querySelector('#toast');
        setTimeout(function () {
          toastElem.style.opacity = 1;
          setTimeout(function () {
            toastElem.style.opacity = 0;
          }, 3500);
        }, 500);
        thumbContainer.classList.add('liked');
        network.requestUserLikedItem(item.id);
      }
    });
    var metaContainer = listContainerElem.querySelector('#item'+item.id).querySelector('.metaContainer');
    metaContainer.addEventListener('click', function () {
      model.setSelected(item.id);
      changeMode(MODE.detail);
    });

  }

  var redrawItems = function () {
    // Empty the container so we can fill it again
    listContainerElem.innerHTML = '';
    var items = model.getItems();
    var i = 0;
    // While we have more to draw and there is visible space to fill
    while (i < items.length && isSpaceForMore()) {
      var item = items[i];
      item.id = i;
      insertItemIntoContainer(item);
      model.setBottomItemId(i);
      i++;
    };
  }

  var drawMoreItemsIfNeeded = function () {
    console.log('mode is '+mode);
    if (mode == MODE.list) {
      var items = model.getItems();
      var i = model.getBottomItemId() + 1;
      while (i < items.length && isSpaceForMore()) {
        var item = items[i];
        item.id = i;
        insertItemIntoContainer(item);
        model.setBottomItemId(i);
        i++;
      }
      if (i + 5 > items.length) {
        console.log('not much content left, get some more');
        network.getMoreItemsFromServer(false);
      }
    }
  }

  var redrawDetails = function () {
    if (model.getSelected() == undefined) {
      alert('selected is undefined');
    }
    var source = document.querySelector('#detailTemplate').innerHTML;
    var template = Handlebars.compile(source);
    var items = model.getItems();
    var selectedItem;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id == model.getSelected()) {
        selectedItem = items[i];
        break;
      }
    }
    if (selectedItem === undefined) {
      alert('Something went wrong');
    }
    var newHTML = template(selectedItem);
    detailContainerElem.innerHTML = newHTML;

    var backButtonElem = document.querySelector('#backButton');
    backButtonElem.addEventListener('click', function () {
      changeMode(MODE.list);
    });
  }

  var handledScrollRecently = false;
  // Instead of checking and redrawing everything frequently we only do this every 200ms while scrolling
  var handleScroll = function () {
    if (!handledScrollRecently) {
      handledScrollRecently = true;
      if (mode == MODE.list) {
        scrollY = window.scrollY;
      }
      setTimeout(function () {
        handledScrollRecently = false;
      }, 50);
      drawMoreItemsIfNeeded();
    }
  };
  window.addEventListener('scroll', handleScroll);

  window.setTimeout(drawMoreItemsIfNeeded, 300);
  window.setInterval(drawMoreItemsIfNeeded, 1000);

  model.addListener(redrawItems);

  return {
    changeMode: changeMode
  }
})(model);

var network = (function (model) {
  var getItemsFromServer = function () {
    var req = new XMLHttpRequest();
    req.onload = function () {
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

  var requestUserLikedItem = function (itemId) {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if(req.status >= 200 && req.status < 400) {
        // These are the new items sent to us by the server
        getMoreItemsFromServer(true);
      } else {
        // Request failed
        throw ('Request failed');
      }
    }
    req.open('get', 'newItems.json', true);
    req.setRequestHeader('Content-type', 'application/json');
    req.send({item: itemId});   
  }

  var getMoreItemsFromServer = function (replaceMode) {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if(req.status >= 200 && req.status < 400) {
        // These are the new items sent to us by the server
        model.addItems(JSON.parse(this.responseText));
      } else {
        // Request failed
        throw ('Request failed');
      }
    }
    req.open('get', 'items.json', true);
    req.setRequestHeader('Content-type', 'application/json');
    req.send();
  }

  return {getItemsFromServer: getItemsFromServer,
          requestUserLikedItem: requestUserLikedItem,
          getMoreItemsFromServer: getMoreItemsFromServer}
})(model);

network.getItemsFromServer();