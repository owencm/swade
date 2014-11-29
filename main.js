var req = new XMLHttpRequest();
req.onload = function () {
  console.log(this.responseText);
  if(req.status >= 200 && req.status < 400) {
    response = JSON.parse(this.responseText);
    if (response.success === "true") {
      //success
    } else {
      //failure
    }
  } else {
    // Request failed
    throw ('Request failed');
  }
}
req.open('get', '//localhost/items.json', true);
req.setRequestHeader('Content-type', 'application/json');
req.send();