function doAjax(method, url, data, customFunction) {
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4 && xhr.status === 200) {
      customFunction(xhr);
    }
  };

  xhr.open(method, url, true);
  if (url !== '/register') {
    xhr.setRequestHeader(
      'Authorization',
      `Bearer ${localStorage.getItem('token')}`
    );
  }
  
  if (method === 'POST') {
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));
  } else {
    xhr.send();
  }
}
