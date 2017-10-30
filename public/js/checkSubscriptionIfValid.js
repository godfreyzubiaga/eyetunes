function isStillSubscribed(subscriptionDetails) {
  let oneDay = 1000 * 60 * 60 * 24;
  let oneYear = oneDay * 64;
  let todayDate = new Date().getTime();
  let subscriptionStillValid = true;
  let subscriptionDate = new Date().getTime();
  let daysDifference = Math.trunc((todayDate - subscriptionDate) / oneDay);
  let alertMsg = `Your ${subscriptionDetails.type} Subscription is already expired`;

  if (subscriptionDetails.type === 'monthly') {
    if (daysDifference >= 30) {
      subscriptionStillValid = false;
      alertify.alert(alertMsg);
    }
  } else if (subscriptionDetails.type === 'yearly') {
    if (daysDifference >= 365) {
      subscriptionStillValid = false;
      alertify.alert(alertMsg);
    }
  }

  return subscriptionStillValid;
}