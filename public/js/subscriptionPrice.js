function getSubscriptionPrice(subscriptionType) {
  if (subscriptionType === 'monthly') {
    return 100;
  } else if (subscriptionType === 'yearly') {
    return 800;
  } else if (subscriptionType === 'oneTime') {
    return 1500;
  } else {
    return 0;
  }
}