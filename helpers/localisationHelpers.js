// Calcul les bornes lat, lon pour ne chercher que les shops entre celles ci
const calculateMaxLatitudeLongitude = (initialPosition, radius) => {
  // Convert the radius in meters to latitude degrees
  const radiusInLatitude = (radius / 6378) * (180 / Math.PI);
  // Convert the radius in meters to longitude degrees
  const radiusInLongitude =
    ((radius / 6378) * (180 / Math.PI)) /
    Math.cos((initialPosition.latitude * Math.PI) / 180);

  return {
    latitude: {
      min: initialPosition.latitude - radiusInLatitude,
      max: initialPosition.latitude + radiusInLatitude,
    },
    longitude: {
      min: initialPosition.longitude - radiusInLongitude,
      max: initialPosition.longitude + radiusInLongitude,
    },
  };
};

module.exports = {
  calculateMaxLatitudeLongitude,
};
