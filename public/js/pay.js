function pay(phoneNumber) {
  let subscriptionTypes = document.getElementsByName('subscriptionType');
  let subscriptionType;
  subscriptionTypes.forEach(row => {
    if (row.checked) {
      subscriptionType = row.value;
    }
  });

  if (phoneNumber.length === 10 && String(phoneNumber).charAt(0) === '9') {
    doAjax(
      'POST',
      `/pay-subscription`,
      {
        userId: activeUser,
        subscriptionType: subscriptionType,
        phoneNumber: '+63' + phoneNumber
      },
      xhr => {
        let response = JSON.parse(xhr.responseText);
        if (response.success) {
          alertify.success('Subscribed!');
          changeContent('user');
        }
      }
    );
  } else {
    alertify.alert('Your phone number is incorrect');
  }
}
