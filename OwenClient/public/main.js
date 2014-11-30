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

var view = (function (model) {
  var scrollY = 0;
  // This is the container which contains the cards
  var listContainerElem = document.querySelector('#listContainer');
  var detailContainerElem = document.querySelector('#detailContainer');

  var MODE = {list: 0, detail: 1};
  var mode = MODE.list;

  var changeMode = function (newMode, userTriggered) {
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
      if (userTriggered) {
        history.pushState({mode: MODE.detail}, 'SWADE');
        console.log('pushing history');
      }
      window.scrollTo(0, 0);
    }
    if (newMode == MODE.list) {
      listContainerElem.style.display = '';
      footerElem.style.display = '';
      detailContainerElem.style.display = 'none';
      backButtonElem.style.display = 'none';
      window.scrollTo(0, scrollY);
      if (userTriggered) {
        history.pushState({mode: MODE.list}, 'SWADE');
      }
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
    var elemLeft = bottomElem.offsetLeft;
    if (Math.max(document.documentElement.clientWidth, window.innerWidth || 0) < 321) {
      elemLeft = 111;
    }
    // console.log('item ' + model.getBottomItemId() +' top is '+elemTop +', compared to '+docViewBottom);
    // Elem left hack to ensure we never have a row of just one
    return (elemTop < docViewBottom || elemLeft < 110);
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
      changeMode(MODE.detail, true);
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
      console.log(items.length +' items total, '+i +' on screen.');
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
      changeMode(MODE.list, true);
    });

    var buyButtonElem = document.querySelector('.buyButton');
    buyButtonElem.addEventListener('click', function () {
      window.open('http://www.asos.com/ASOS-Black/ASOS-BLACK-Crop-Top-with-Gem-Collar/Prod/pgeproduct.aspx?iid=4479086&cid=19632&sh=0&pge=0&pgesize=36&sort=-1&clr=Silver+holographic&totalstyles=422&gridsize=3');
    });
  }

  window.addEventListener('popstate', function(e) {
    console.log('User pressed back, popping a state');
    console.log(e);
    if (e.state !== null && e.state.mode !== undefined) {
      console.log('Moving back in history to mode '+e.state.mode);
      changeMode(e.state.mode, false);
    } else {
      // Note safari calls popstate on page load so this is expected
      console.log('Uh oh, no valid state in history to move back to');
    }
  });

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
      }, 10);
      drawMoreItemsIfNeeded();
    }
  };
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('touchmove', handleScroll);
  window.addEventListener('gesturechange', handleScroll);

  window.setInterval(drawMoreItemsIfNeeded, 300);

  model.addListener(redrawItems);

  changeMode(MODE.list, true);

  return {
    changeMode: changeMode
  }
})(model);

var network = (function (model) {
  var token = 'ad8ck8ISRU4rRceP4m1eJg';

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

  var requestPending = false;
  var getMoreItemsFromServer = function (replaceMode) {
    if (!requestPending) {
      requestPending = true;
      var req = new XMLHttpRequest();
      req.onload = function () {
        requestPending = false;
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
  }

  var getNewSession = function () {
    var req = new XMLHttpRequest();
    req.onload = function () {
      if(req.status >= 200 && req.status < 400) {
        token = (JSON.parse(this.responseText));
        alert(token);
      } else {
        // Request failed
        throw ('Request failed');
      }
    }
    getItemsFromServer(); // Do this in success above
    req.open('get', 'http://vvv.pagekite.me/api/sessions/new', true);
    // req.setRequestHeader('Content-type', 'application/json');
    req.send();
  }

  return {getItemsFromServer: getItemsFromServer,
          requestUserLikedItem: requestUserLikedItem,
          getMoreItemsFromServer: getMoreItemsFromServer,
          getNewSession: getNewSession}
})(model);


network.getNewSession();
