function clearPurchasedSong() {
  while (purchasedSongs.length > 0) {
    purchasedSongs.pop();
  }
}
