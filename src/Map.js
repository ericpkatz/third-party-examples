import React, { useEffect, useState } from 'react';


const Map = ({ users })=> {
  console.log(users);
  const [map, setMap ] = useState({});
  let el;

  useEffect(()=> {
    const bounds = new google.maps.LatLngBounds();
    
    users.forEach( user => {
      new google.maps.Marker({position: {lat: user.lat * 1, lng: user.lng * 1}, map: map}); 
      bounds.extend({lat: user.lat * 1, lng: user.lng * 1});
    });
    if(map.fitBounds){
      map.fitBounds(bounds);
    }
  }, [users, map]);
  
  useEffect(()=> {
    const _map = new google.maps.Map(el, {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });
    setMap(_map);

  }, []);
  return (
    <div>
      <h1>Map</h1>
      <div className='map' ref={ ref => el = ref }></div>
    </div>
  );
};


export default Map;
