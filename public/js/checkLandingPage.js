function checkLandingPage(response) {
  if (response.role === 'user') {
    doAjax(
      'GET',
      `/get-subscription/${activeUser}`,
      null,
      xhr => {
        let subscription = JSON.parse(xhr.responseText);
        if (subscription.subscribed) {
          if (subscription.type === 'oneTime') {
            changeContent(response.role);
          } else {
            if (isStillSubscribed(subscription)) {
              changeContent(response.role);
            } else {
              changeContent('subscribe');
            }
          }
        } else {
          changeContent('subscribe');
        }
      }
    );
  } else {
    changeContent(response.role);
  }
}
