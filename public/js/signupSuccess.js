function showSuccess(xhr) {
  let response = JSON.parse(xhr.responseText);
  if (response.success) {
    alertify.success('Signup success');
    changeContent('login');
  } else {
    alertify.alert('Something is wrong with your inputs');
  }
}