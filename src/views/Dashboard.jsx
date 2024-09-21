import React, { useState, useEffect, useRef } from "react";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Image,
  ScrollView,
  Animated,
  StatusBar,
  Keyboard,
  FlatList,
  Button,
  PermissionsAndroid,
  Alert
} from "react-native";
import { connect } from 'react-redux';
import { useNavigation } from "@react-navigation/native";
import { screenHeight, screenWidth, trip_details, search_loader, normal, promo_codes, bold, GOOGLE_KEY, month_names, money_icon, discount_icon, no_favourites, add_favourite, get_home, api_url, img_url, get_estimation_fare, pin_marker, regular, get_zone, btn_loader, ride_confirm, trip_request_cancel, f_m, login, sos_sms } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import * as colors from '../assets/css/Colors';
import DropShadow from "react-native-drop-shadow";
import { Badge, Divider } from 'react-native-paper';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import axios from "axios";
import LottieView from 'lottie-react-native';
import RBSheet from "react-native-raw-bottom-sheet";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import database from '@react-native-firebase/database';
import Modal from "react-native-modal";
import Dialog from "react-native-dialog";
import strings from "../languages/strings.js";
// import AsyncStorage from "@react-native-async-storage/async-storage"; 
import Geolocation from '@react-native-community/geolocation'; // or 'react-native-geolocation-service'
import { debounce } from 'lodash';
import AsyncStorage from "@react-native-async-storage/async-storage";

const Dashboard = (props) => {
  navigator.geolocation = Geolocation;
  const navigation = useNavigation();
  const search = useRef();
  const map_ref = useRef();
  const favMapRef = useRef(null);
  // console.log('Map ref:', favMapRef.current);
 
  let alt = useRef(
    (_data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res),
  );
  const fav_RBSheet = useRef();
  const [on_loaded, setOnLoaded] = useState(0);
  const [active_location, setActiveLocation] = useState(1);
  const [region, setRegion] = useState(props.initial_region); 
  const [trip_types, setTripTypes] = useState([]);
  const [promo_list, setPromoList] = useState([]);
  const [promo, setPromo] = useState(0);
  const [trip_sub_types, setTripSubTypes] = useState([]);
  const [estimation_fares, setEstimationFares] = useState([]);
  const [online_vehicles, setOnlineVehicles] = useState([]);
  const [customer_favourites, setCustomerFavourties] = useState([]);
  const [active_trip_type, setActiveTripType] = useState(0);
  const [active_trip_sub_type, setActiveTripSubType] = useState(0);
  const [active_vehicle_type, setActiveVehicleType] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search_loading, setSearchLoading] = useState(false);
  const [current_location_status, setCurrentLocationStatus] = useState(true);
  const [is_date_picker_visible, setDatePickerVisibility] = useState(false);
  const [pickup_date, setPickupDate] = useState(new Date());
  const [pickup_date_label, setPickupDateLabel] = useState(strings.now);
  const [packages, setPackages] = useState([]);
  const [package_hr, setPackageHr] = useState(0);
  const [package_km, setPackageKm] = useState(0);
  const [package_id, setPackageId] = useState(0);
  const [is_mount, setIsMount] = useState(0);
  const isMountRef = useRef(is_mount);
  const [km, setKm] = useState(0);
  const [search_status, setSearchStatus] = useState(0);
  const [wallet, setWallet] = useState(0);
  const [is_modal_visible, setModalVisible] = useState(false);
  const duration = 500;
  const [trip_request_id, setTripRequestId] = useState(0);

  //Address
  const [pickup_address, setPickupAddress] = useState('');
  const [pickup_lat, setPickupLat] = useState(null);
  const [pickup_lng, setPickupLng] = useState(null);
  
  const [drop_address, setDropAddress] = useState('');
  const [drop_lat, setDropLat] = useState(0);
  const [drop_lng, setDropLng] = useState(0);

  const [tmp_address, setTmpAddress] = useState('');
  const [tmp_lat, setTmpLat] = useState(props.initial_lat);
  const [tmp_lng, setTmpLng] = useState(props.initial_lng);

  //Screen Home
  const home_comp_1 = useRef(new Animated.Value(-60)).current;
  const home_comp_2 = useRef(new Animated.Value(screenHeight + 170)).current;
   const home_comp_3 = useRef(new Animated.Value(-60)).current;
   const home_comp_4 = useRef(new Animated.Value(-120)).current

  //Screen Location
  const drop_comp_1 = useRef(new Animated.Value(-110)).current;
  const drop_comp_2 = useRef(new Animated.Value(screenHeight + 150)).current;
  const drop_comp_3 = useRef(new Animated.Value(-130)).current;
  const drop_comp_4 = useRef(new Animated.Value(screenHeight + (screenHeight - 100))).current;

  //Screen Booking
  const book_comp_1 = useRef(new Animated.Value(screenHeight + 250)).current;

//  polyineCoordinates
  const [polylineCoordinates, setPolylineCoordinates] = useState([]);
  // const [favPolylineCoordinates, setFavPolylineCoordinates] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

// Distance and timing for total distance
  const [distance, setDistance] = useState('');
  const [travelTime, setTravelTime] = useState('');


  // Control the 
  const [isDropLocationSet, setIsDropLocationSet] = useState(false); 


// SOS_ALERT STATE
const [bookingId, setBookingId] = useState(null);


  const pickup = { latitude: 13.062040, longitude: 77.504370}; // Mei Layout
  const dropoff = { latitude:13.023780, longitude: 77.550583 }; // Yeshwantpur Railway Station
  
  // Calculate midpoint manually
const midpoint = {
  latitude: (pickup.latitude + dropoff.latitude) / 2,
  longitude: (pickup.longitude + dropoff.longitude) / 2,
};

// Calculate deltas manually to include both locations in view
const latDelta = Math.abs(pickup.latitude - dropoff.latitude) * 1.5; // Added padding
const lonDelta = Math.abs(pickup.longitude - dropoff.longitude) * 1.5; // Added padding

const [favRigion, setFavRegion] = useState({
  latitude: midpoint.latitude,
  longitude: midpoint.longitude,
  latitudeDelta: latDelta,
  longitudeDelta: lonDelta,
})

// console.log("Customer_fav",customer_favourites);

  
  useEffect(() => {
    screen_home_entry();
    get_home_api();
      booking_sync();  // Call the booking_sync function with snapshot data
    get_vehicles();
    call_promo_codes();
    const unsubscribe = navigation.addListener("focus", async () => {
      if (is_mount === 0) {
        setIsMount(1);
        isMountRef.current = 1;
      }
    });
    setTimeout(() => { setOnLoaded(1) }, 2000)
    return (
      unsubscribe()
    )
  }, []);


 

  // get FavRoutes
  const getRouteData = async (pickup , dropoff) => {
   
     try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${pickup.latitude},${pickup.longitude}&destination=${dropoff.latitude},${dropoff.longitude}&key=${GOOGLE_KEY}`
      );
  
      
      const route = response.data.routes[0]; // Access the first route
      const encodedPolyline = route.overview_polyline.points; // Get encoded polyline
      
      return {
        polyline: encodedPolyline
      };
     } catch (error) {
      console.error('Error fetching route data:', error);
     }

  };

   // get FavRoutes
  const decodePolyline = (encoded) => {
    return polyline.decode(encoded).map(coord => ({
      latitude: coord[0],
      longitude: coord[1],
    }));
  };

   // get FavRoutes
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const {polyline: encodedPolyline } = await getRouteData(pickup, dropoff);
        const decodedCoords = decodePolyline(encodedPolyline);
        // console.log('Decoded Coordinates:', decodedCoords);
        setRouteCoords(decodedCoords);
        if (favMapRef.current) {
          favMapRef.current.fitToCoordinates([
            { latitude: pickup.latitude, longitude: pickup.longitude },
            { latitude: dropoff.latitude, longitude: dropoff.longitude }
          ], {
            edgePadding: {
              top: 50,
              right: 50,
              bottom: 50,
              left: 50,
            },
            animated: true,
          });
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, []);




// Get direction on Home Screen   
useEffect(()=> {
       if(pickup_lat && pickup_lng && drop_lat && drop_lng && map_ref.current){
           map_ref.current.fitToCoordinates(
            [
              { latitude: pickup_lat, longitude: pickup_lng },
              { latitude: drop_lat, longitude: drop_lng }
            ],
            {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: true,
            }
           )
       }
},[pickup_lat, pickup_lng, drop_lat, drop_lng])


// Get the routes of the pickup and drop location
  useEffect(() => {
    if (pickup_lat !== null && pickup_lng !== null && drop_lat !== null && drop_lng !== null) {
      debouncedGetRoute(pickup_lat, pickup_lng, drop_lat, drop_lng);
    }
  }, [pickup_lat, pickup_lng, drop_lat, drop_lng]);




  // Axios Interceptors Request
  axios.interceptors.request.use(async function (config) {
    // Do something before request is sent
    //console.log("loading")
    setLoading(true);
    //setCurrentLocationStatus(true);
   // setSearchLoading(true);
    return config;
  }, function (error) {
      //console.log(error)
      setLoading(false);
     // setSearchLoading(false);
      console.log("finish loading")
      // Do something with request error
    return Promise.reject(error);
  });



  // Call Promo Code when at the Beginning when the components is mounted
  const call_promo_codes = () => {
    axios({
      method: 'post',
      url: api_url + promo_codes,
      data: { lang: global.lang, customer_id: global.id }
    })
      .then(async response => {
        setPromoList(response.data.result)
      })
      .catch(error => {
        alert(strings.sorry_something_went_wrong)
      });
  }

 
  // Call Apply Promo
  const call_apply_promo = (data) => {
    setPromo(data.id);
    toggleModal();
    get_estimation_fare_api(pickup_lat, pickup_lng, drop_lat, drop_lng, package_id, active_trip_sub_type, data.id);
  }


 const booking_sync = () => {
  // console.log("global ID in booking ", global.id);   
 database().ref(`customers/${global.id}`).on('value', snapshot => {
  //  console.log("snapeahot val", snapshot.val())
   setSearchStatus(snapshot.val().is_searching);
   if (snapshot.val().booking_id != 0) {
    // console.log("outside Loop is_mount",is_mount);
     if ( isMountRef.current === 0) {
      // console.log("Inside Loop is_mount", isMountRef.current);

      //  console.log("snapshot val customer name", snapshot.val().customer_name)
       setIsMount(1);
       isMountRef.current = 1;

       booking_exit();
       setActiveTripType(1);
        // Check for valid booking ID before calling trip details
       const booking_id = snapshot.val().booking_id;
      //  console.log("snapshot val booking Id",booking_id);
       if (booking_id) {
         setBookingId(booking_id);
        //  call_trip_details(booking_id); // Pass the actual booking ID
       } else {
         console.warn("Booking ID is undefined or 0. Skipping trip details call.");
       }
     }
   }
 });
}
  

// trip details recepits
const call_trip_details = (trip_id) => {
    console.log("Trip Id received", trip_id);
    axios({
      method: 'post',
      url: api_url + trip_details,
      data: { trip_id: trip_id }
    })
      .then(async response => {
        //  console.log("Received trip details:", response.data.result);
        navigation.navigate('TripDetails', { trip_id: trip_id, from: 'home', data: response.data.result });
    
      })
      .catch(error => {
        console.log("getting the Error",error)
      });
  }

// Toggle Mode
  const toggleModal = () => {
    setModalVisible(!is_modal_visible);
  };


  // Get Vehicles if any Driver is online.
  const get_vehicles = () => {
    database().ref(`drivers`).on('value', snapshot => {
      setOnlineVehicles([]);
      snapshot.forEach(function (childSnapshot) {
        if (childSnapshot.val() != null) {
          if (Array.isArray(childSnapshot.val())) {
            childSnapshot.val().map((value) => {
              if (value != null && value.booking && value.booking.booking_status == 0 && value.online_status == 1) {
                setOnlineVehicles(prevArray => [...prevArray, { latitude: value.geo.lat, longitude: value.geo.lng, vehicle_slug: value.vehicle_slug, bearing: value.geo.bearing }])
              }
            })
          } else {
            {
              Object.values(childSnapshot.val()).map(item => {
                if (item != null && item.booking && item.booking.booking_status == 0 && item.online_status == 1) {
                  setOnlineVehicles(prevArray => [...prevArray, { latitude: item.geo.lat, longitude: item.geo.lng, vehicle_slug: item.vehicle_slug, bearing: item.geo.bearing }])
                }
              })
            }
          }
        }
      });
    });
  }


  // Render Vehicle on Booking
  const render_vehicles = () => {
    return online_vehicles.map((marker, index) => {
      //console.log(marker.bearing);
      if (marker.vehicle_slug == "car") {
        return (
          <Marker key={index} coordinate={marker} rotation={marker.bearing}>
            <Image
              style={{ flex: 1, height: 30, width: 15 }}
              source={require('.././assets/img/tracking/car.png')}
            />
          </Marker>
        );
      } else if (marker.vehicle_slug == "bike") {
        return (
          <Marker key={index} coordinate={marker}>
            <Image
              style={{ flex: 1, height: 29, width: 17 }}
              source={require('.././assets/img/tracking/bike.png')}
            />
          </Marker>
        );
      } else if (marker.vehicle_slug == "truck") {
        return (
          <Marker coordinate={marker}>
            <Image
              style={{ flex: 1, height: 29, width: 17 }}
              source={require('.././assets/img/tracking/truck.png')}
            />
          </Marker>
        );
      }
    });
  }


  // Set Default Date
  const set_default_date = async (currentdate, type) => {
    let datetime =
      (await (currentdate.getDate() < 10 ? "0" : "")) +
      currentdate.getDate() +
      "-" +
      (currentdate.getMonth() + 1 < 10 ? "0" : "") +
      (currentdate.getMonth() + 1) +
      "-" +
      currentdate.getFullYear() +
      " " +
      (currentdate.getHours() < 10 ? "0" : "") +
      currentdate.getHours() +
      ":" +
      (currentdate.getMinutes() < 10 ? "0" : "") +
      currentdate.getMinutes() +
      ":" +
      (currentdate.getSeconds() < 10 ? "0" : "") +
      currentdate.getSeconds();
    let label =
      (await (currentdate.getDate() < 10 ? "0" : "")) +
      currentdate.getDate() +
      " " +
      month_names[currentdate.getMonth()] +
      ", " + formatAMPM(currentdate);
    if (type == 0) {
      setPickupDateLabel(strings.now);
    } else {
      setPickupDateLabel(label);
    }

    setPickupDate(datetime);
  };


  // Time Formatting
  const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  }


  // Screen_HomeEntry
  const screen_home_entry = () => {
    Keyboard.dismiss();
    Animated.timing(home_comp_1, {
      toValue: 60,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(home_comp_4, {
      toValue: 10,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(home_comp_3,{
        toValue:130,
        duration:duration,
        useNativeDriver: true
    }).start();
    Animated.timing(home_comp_2, {
      toValue: (screenHeight),
      duration: duration,
      useNativeDriver: true,
    }).start();
  }


  //Screen Home Exit 
  const screen_home_exit = () => {
    Animated.timing(home_comp_1, {
      toValue: -60,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(home_comp_3, {
      toValue: -120,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(home_comp_2, {
      toValue: (screenHeight + 170),
      duration: duration,
      useNativeDriver: true,
    }).start();
  }


  // Const Location_Entry

  const location_entry = () => {
    Animated.timing(drop_comp_1, {
      toValue: 75,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_2, {
      toValue: (screenHeight),
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_3, {
      toValue: 0,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }


  // Location Exit
  const location_exit = () => {
    Animated.timing(drop_comp_1, {
      toValue: -110,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_2, {
      toValue: (screenHeight + 150),
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_3, {
      toValue: -130,
      duration: duration,
      useNativeDriver: true,
    }).start();
    Animated.timing(drop_comp_4, {
      toValue: screenHeight + (screenHeight - 100),
      duration: duration,
      useNativeDriver: true,
    }).start();
  }


  // Search Entry
  const search_entry = () => {
    Animated.timing(drop_comp_4, {
      toValue: 100,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }



  // Serarch Exit
  const search_exit = () => {
    Keyboard.dismiss();
    Animated.timing(drop_comp_4, {
      toValue: screenHeight + (screenHeight - 100),
      duration: duration,
      useNativeDriver: true,
    }).start();
  }


  // // booking_entry
  // const booking_entry = () => {
  //   location_exit();
  //   set_default_date(new Date(), 0);
  //   setCurrentLocationStatus(false);
  //   Animated.timing(book_comp_1, {
  //     toValue: 250,
  //     duration: duration,
  //     useNativeDriver: true,
  //   }).start();
  // }


  // Booking exit
  const booking_exit = () => {
    setCurrentLocationStatus(true);
    screen_home_entry();
    Animated.timing(book_comp_1, {
      toValue: screenHeight + 250,
      duration: duration,
      useNativeDriver: true,
    }).start();
  }



  // Check_address_details
  const check_address_details = () => {
    alert(drop_address);
  }


  const is_focus = () => {
    search_entry();
  }

  const handleRegionChange = (region) => {
    setIsDragging(true); // Map is being dragged
  };


  const region_change = (region) => {
    // console.log(region+'1')
    // console.log('Region Change Triggered:', region, 'On Loaded:', on_loaded, 'Active Location:', active_location);
    // Only perform location entry if the map is not being dragged
    if (!isDragging) {
      if (on_loaded === 1) {
        screen_home_exit();
        location_entry();
        console.log("Location Change");
         onRegionChange(region, 'T');
      } else {
        onRegionChange(region, 'P');
      }
    }
  }

  // Debouncing call for fav location
  // const debouncedGetFavRoute = debounce(async (originLat, originLng, destLat, destLng) => {
  //   try {
  //     const directionsResponse = await axios.get(
  //       `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${GOOGLE_KEY}`
  //     );
  
  //     if (directionsResponse.data.status === "OK" && directionsResponse.data.routes.length > 0) {
  //       const points = directionsResponse.data.routes[0].overview_polyline.points;
  //       setFavPolylineCoordinates(decode(points));
  //     } else {
  //       console.error("No routes found or status not OK:", directionsResponse.data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching directions:", error);
  //   }
  // }, 300);
  
  
// Debouncing for get the Route from Google Api
  const debouncedGetRoute = debounce(async (originLat, originLng, destLat, destLng) => {
    try {
      const directionsResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${originLat},${originLng}&destination=${destLat},${destLng}&key=${GOOGLE_KEY}`
      );
  
      if (directionsResponse.data.status === "OK" && directionsResponse.data.routes.length > 0) {
        const points = directionsResponse.data.routes[0].overview_polyline.points;
        const route = directionsResponse.data.routes[0];
        setPolylineCoordinates(decode(points));
        setDistance(route.legs[0].distance.text);
        setTravelTime(route.legs[0].duration.text);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
  }, 300);



  const decode = (t) => {
    let points = [];
  
    let index = 0, len = t.length;
    let lat = 0, lng = 0;
  
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
  
      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
  
      points.push({ latitude: lat / 1E5, longitude: lng / 1E5 });
    }
    return points;
  };






  // call the google API for find the current location 
  const onRegionChange = async (value, type) => {
    console.log("Get the Value on onRegionChange", value);
    fetch('https://maps.googleapis.com/maps/api/geocode/json?address=' + value.latitude + ',' + value.longitude + '&key=' + GOOGLE_KEY)
      .then((response) =>  {
        // Log to see the response object
        if (!response.ok) {
          // console.error("Errors in API_KEY or response:", response.statusText);
          throw new Error("Network response was not ok");
        }
        console.log("Response object:", response);
        return response.json(); // Parse the response to JSON
      })
      .then(async (responseJson) => {
        if (responseJson.results.length > 2 && responseJson.results[2].formatted_address != undefined) {
         console.log("data is receive on  onRegionChange " , responseJson.results[2].formatted_address)
          if (type == 'P') {
            setPickupAddress(responseJson.results[2].formatted_address);
            setPickupLat(value.latitude);
            setPickupLng(value.longitude);
          } else {
            setTmpAddress(responseJson.results[2].formatted_address);
            setTmpLat(value.latitude);
            setTmpLng(value.longitude);
            search.current?.setAddressText(responseJson.results[2].formatted_address);
          }
          //this.get_distance();
          //this.find_city(responseJson.results[0]);
        }
      })
  } 

  const confirm_location = async () => {
    console.log("active_location", active_location);
    
    if (active_location == 1) {
      setPickupAddress(tmp_address);
      setPickupLat(tmp_lat);
      setPickupLng(tmp_lng);
    } else {
      setDropAddress(tmp_address);
      setDropLat(tmp_lat);
      setDropLng(tmp_lng);
    }
    if (pickup_address != '' && active_location == 2) {
      back_to_home_screen();
      get_estimation_fare_api(pickup_lat, pickup_lng, tmp_lat, tmp_lng, 0, active_trip_sub_type, 0);
    } else if (drop_address != '' && active_location == 1) {
      // booking_entry();
      back_to_home_screen();
       get_estimation_fare_api(tmp_lat, tmp_lng, drop_lat, drop_lng, 0, active_trip_sub_type, 0);
    } else {
      back_to_home_screen();
    }
  }

  const select_package = (data) => {
    screen_home_exit();
    setPackageId(data.id);
    setPackageHr(data.hours);
    setPackageKm(data.kilometers);
    booking_entry();
    get_estimation_fare_api(tmp_lat, tmp_lng, drop_lat, drop_lng, data.id, 0, 0);
  }


  // Get current Location
  const get_location = (data, details, type) => {
     console.log("Get current LOCATION")
    setTmpAddress(data.description);
    setTmpLat(details.geometry.location.lat);
    setTmpLng(details.geometry.location.lng);
    search_exit();
    set_location(details.geometry.location.lat, details.geometry.location.lng);
  }


  // Set Location for Pickup Address
  const set_location = (lat, lng) => {
    map_ref?.current?.animateCamera({
      center: {
        latitude: lat,
        longitude: lng,
      }
    }, { duration: 2000 })
  }

  const back_to_home_screen = () => {
    location_exit();
    screen_home_entry();
  }

  const open_location = async (location) => {
    search.current?.setAddressText('');
    search_entry();    //Animation will be happends
    setActiveLocation(location)
    screen_home_exit();
    location_entry();
  }


 
  const load_trip_types = () => {
    let icon = '';
    return trip_types.map((data, index) => {
      if (data.id == active_trip_type) {
        icon = data.active_icon;
      } else {
        icon = data.inactive_icon;
      }
      return (
        <TouchableOpacity key={index} activeOpacity={1} onPress={change_trip_type.bind(this, data)} style={{ alignItems: 'center', justifyContent: 'center', width: '20%' }}>
          <View style={styles.vehicle_img} >
            <Image style={{ height: undefined, width: undefined, flex: 1 }} source={{ uri: img_url + icon }} />
          </View>
          <View style={{ margin: 2 }} />
          <Text style={active_trip_type == data.id ? styles.active_trip_type_label : styles.inactive_trip_type_label}>{data.name}</Text>
        </TouchableOpacity>
      )
    })
  }

  const estimation_fare_list = () => {
    return estimation_fares.map((data,index) => {
      return (
        <DropShadow
          key={index}
          style={{
            width: '100%',
            marginBottom: 5,
            marginTop: 5,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 0,
            },
            shadowOpacity: active_vehicle_type == data.id ? 0.3 : 0,
            shadowRadius: 5,
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={change_vehicle_type.bind(this, data.id)} style={{ width: '100%', backgroundColor: colors.theme_bg_three, padding: 10, flexDirection: 'row', borderRadius: 10 }}>
            <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ height: 50, width: 50 }} >
                <Image style={{ height: undefined, width: undefined, flex: 1 }} source={{ uri: img_url + data.active_icon }} />
              </View>
            </View>
            <View style={{ width: '50%', alignItems: 'flex-start', justifyContent: 'center' }}>
              <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: 14, fontFamily: bold }}>{data.vehicle_type}</Text>
              <View style={{ margin: 2 }} />
              <Text numberOfLines={1} style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{data.description}</Text>
            </View>
            <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center' }}>
              <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 14, fontFamily: normal, letterSpacing: 1 }}>{global.currency}{data.fares.total_fare}</Text>
              {promo != 0 &&
                <View style={{ marginTop: 4, backgroundColor: colors.success_background, borderRadius: 5, padding: 2, paddingLeft: 5, paddingRight: 5, alignItems: 'center', justifyContent: 'center' }}>
                  <Text ellipsizeMode='tail' style={{ color: colors.success, fontSize: 8, fontFamily: normal }}>{strings.promo_applied}</Text>
                </View>
              }
            </View>
          </TouchableOpacity>
        </DropShadow>
      )
    })
  }

  const load_location = (address, lat, lng) => {
    back_to_home_screen();
    set_location(parseFloat(lat), parseFloat(lng));
  }

 


const favourites_list = () => {
      return (
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {/* <View style={{ height: 150, width: 150, alignSelf: 'center' }}>
            <LottieView style={{flex: 1}} source={no_favourites} autoPlay loop />
          </View> */}
          <View style={styles.container}>
        <MapView
        provider={PROVIDER_GOOGLE}
        ref={favMapRef}
        style={{
          flex: 1,
          width: '95%',
          height: '100%',
        }}
        region={favRigion}
        showsUserLocation={true}
        showsMyLocationButton={current_location_status}
      >
        {routeCoords.length > 0 &&
       ( <>
           <Marker coordinate={{latitude: pickup.latitude,longitude:pickup.longitude }} title={"pickup location"} />
           <Marker coordinate={{latitude:dropoff.latitude, longitude:dropoff.longitude}} title={"drop location"} />
           <Polyline
        coordinates={routeCoords}
        strokeColor="#0F52BA"   // Line color
        strokeWidth={3} // Line width
      />
        </>)
       } 
      </MapView>
    </View>
          {/* <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: 12, color: colors.text_grey, fontFamily: regular }}>{strings.no_data_found}</Text> */}
        </View>
      )
  }

  const change_trip_type = async (data) => {
    setActiveTripType(data.id);
    setTripSubTypes(data.trip_sub_type);
    if (data.trip_sub_type.length > 0) {
      setActiveTripSubType(data.trip_sub_type[0].id)
    } else {
      setActiveTripSubType(0)
    }
  }

  const get_home_api = async () => { 
    await axios({
      method: "post",
      url: api_url + get_home,
      data: { lang: global.lang, customer_id: global.id },
    })
      .then(async (response) => {
        //console.log(response.data)
        setLoading(false);
        if (response.data.status == 1) {
          setTripTypes(response.data.result.trip_types);
          setPackages(response.data.result.packages);
          setCustomerFavourties(response.data.result.customer_favourites);
          setActiveTripType(response.data.result.trip_types[0].id);
        }
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert(strings.sorry_something_went_wrong)
      });
  };


// Add Favourite 

  const add_favourite_api = async () => {
    fav_RBSheet.current.close()
   
    await axios({
      method: "post",
      url: api_url + add_favourite,
      data: { customer_id: global.id, address: pickup_address, lat: pickup_lat, lng: pickup_lng }
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.status == 1) {
          alt({
            type: DropdownAlertType.Success,
            title: strings.success,
            message: strings.location_added_in_your_favourite_spot,
          });
          console.log("response coming from add fav api",response.data.result);
          
          setCustomerFavourties(response.data.result);
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(strings.sorry_something_went_wrong)
      });
  };

  const get_estimation_fare_api = async (lat1, lng1, lat2, lng2, package_id, sub_type, pr) => {
    await axios({
      method: "post",
      url: api_url + get_estimation_fare,
      data: { customer_id: global.id, pickup_lat: lat1, pickup_lng: lng1, drop_lat: lat2, drop_lng: lng2, trip_type: active_trip_type, promo: pr, lang: global.lang, package_id: package_id, days: 1, trip_sub_type: sub_type },
    })
      .then(async (response) => {
        setLoading(false);
        // console.log("response data comming from backend in estimation" + response.data.result);
        
        if (response.data.status == 1) {
          setEstimationFares(response.data.result['vehicles']);
          setWallet(response.data.result['wallet']);
          setKm(response.data.result['vehicles'][0].fares.km);
          change_vehicle_type(response.data.result['vehicles'][0].id)
          if (pr != 0 && response.data.result['vehicles'][0].fares.discount <= 0) {
            setPromo(0);
            alt({
              type: DropdownAlertType.Error,
              title: strings.error,
              message: strings.sorry_promo_Not_Applied,
            });
          }
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(strings.sorry_something_went_wrong)
      });
  };

  const call_zone = async () => {

    await axios({
      method: "post",
      url: api_url + get_zone,
      data: { lat: pickup_lat, lng: pickup_lng },
    })
      .then(async (response) => {
        if (response.data.result == 0) {
          setLoading(false);
          alt({
            type: DropdownAlertType.Error,
            title: strings.not_available,
            message: strings.our_service_is_not_available_in_your_location,
          });
          
        } else {
          call_ride_confirm(response.data.result);
        }
      })
      .catch((error) => {
        setLoading(false);
        alert(strings.sorry_something_went_wrong)
      });
  }

  const call_ride_confirm = async (zone) => {
  
    await axios({
      method: "post",
      url: api_url + ride_confirm,
      data: {
        km: km,
        promo: promo,
        vehicle_type: active_vehicle_type,
        payment_method: 1,
        customer_id: global.id,
        trip_type: active_trip_type,
        surge: 1,
        pickup_address: pickup_address,
        pickup_date: pickup_date,
        pickup_lat: pickup_lat,
        pickup_lng: pickup_lng,
        drop_address: drop_address,
        drop_lat: drop_lat,
        drop_lng: drop_lng,
        package_id: package_id,
        trip_sub_type: active_trip_sub_type,
        stops: JSON.stringify([]),
        zone: zone,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.status == 1) {
          setTripRequestId(response.data.result);
          if (response.data.booking_type == 2) {
            alt({
              type: DropdownAlertType.Success,
              title: strings.booking_placed_successfully,
              message: strings.you_can_see_you_bookings_in_my_rides_menu,
            });
           
          }
          // booking_exit();
        } else {
          alt({
            type: DropdownAlertType.Error,
            title: strings.sorry,
            message: strings.driver_not_available_try_again,
          });
         
        }
      })
      .catch((error) => {
        setLoading(false);
        Alert.alert(strings.sorry_something_went_wrong)
      });
  }

  const change_vehicle_type = (vehicle_type) => {
    //alert(vehicle_type+'-'+km);
    setActiveVehicleType(vehicle_type);
    //setKm(km);
  }

  const show_date_picker = () => {
    setDatePickerVisibility(true);
  };

  const hide_date_picker = () => {
    setDatePickerVisibility(false);
  };

  const handle_confirm = (date) => {
    console.warn("A date has been picked: ", date);
    hide_date_picker();
    set_default_date(new Date(date), 1);
  };

  const navigate_promo = () => {
    //navigation.navigate("Promo")
    setModalVisible(true);
  }

  const change_trip_sub_type = (id) => {
    setActiveTripSubType(id)
    get_estimation_fare_api(pickup_lat, pickup_lng, drop_lat, drop_lng, 0, id, 0);
  }

  const load_trip_sub_types = () => {
    return trip_sub_types.map((item) => {
      return (
        <TouchableOpacity onPress={change_trip_sub_type.bind(this, item.id)} style={[active_trip_sub_type == item.id ? styles.segment_active_bg : styles.segment_inactive_bg]}>
          <Text style={[active_trip_sub_type == item.id ? styles.segment_active_fg : styles.segment_inactive_fg]}>{item.trip_sub_type}</Text>
        </TouchableOpacity>
      )
    })
  }

  // const show_packages = () => {
  //   return packages.map((data) => {
  //     return (
  //       <TouchableOpacity onPress={select_package.bind(this, data)} style={{ width: 70, borderColor: colors.text_grey, marginLeft: 5, marginRight: 5, borderRadius: 10, padding: 5, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
  //         <Text style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: bold }}>{data.hours}{strings.hr}</Text>
  //         <View style={{ margin: 2 }} />
  //         <Text style={{ color: colors.text_grey, fontSize: 13, fontFamily: regular }}>{data.kilometers}{strings.km}</Text>
  //       </TouchableOpacity>
  //     )
  //   })
  // }

// Call the SOS function 

// SOS Alert Function
const sos_alert = (booking_id, latitude, longitude, lang = global.lang) => {

      console.log("booking_id :",booking_id)
      console.log("latitude :",latitude)
      console.log("longitude :",longitude)
      console.log("lang :",global.lang)


  const sos_sms_alert = api_url + sos_sms;

  axios.post(sos_sms_alert, {
    customer_id: global.id,
    booking_id,
    latitude,
    longitude,
    lang,
  })
  .then(response => {
    console.log('SOS Alert Sent:', response.data);
    Alert.alert('Success', 'SOS Alert Sent Successfully');
  })
  .catch(error => {
    console.error('Error sending SOS Alert:', error);
    Alert.alert('Error', 'Failed to Send SOS Alert');
  });
};

 // SOS Button Press Handler
const handleSosPress = () => {
   console.log("Booking Id",bookingId);
   
  if (bookingId) {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        sos_alert(bookingId, latitude, longitude);
      },
      (error) => {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Unable to fetch current location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  } else {
    Alert.alert('Error', 'No active booking found');
  }
};

// const clearAsyncStorage = async () => {
//   try {
//     await AsyncStorage.clear();
//     console.log('AsyncStorage cleared');
//   } catch (error) {
//     console.error('Error clearing AsyncStorage:', error);
//   }
// };


  // Home Screen TopBar
  const screen_home = () => {
    return (
      <View>
       
      
          <Animated.View style={[{ transform: [{ translateY: home_comp_4 }] }, [{ position: 'absolute', width: '100%', height:60, alignItems:"center", marginLeft:10 }]]}>
                   <TouchableOpacity  onPress={handleSosPress} style={{backgroundColor: "red",justifyContent:"center",   alignItems: "center",
                    width:50,height:50, borderRadius:25,  borderWidth: 2, borderColor: "white",  shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },shadowRadius: 3.84,  elevation: 5, // For Android shadow
                   }}>
                       <Text style={{color:"white", lineHeight: 50,marginTop:-4, fontWeight:"800", textAlign:"center",lineHeight:50}}>
                          SOS
                       </Text>
                   </TouchableOpacity>

          </Animated.View>
      
        {/* Pick up Home Adderess */}
       

        <Animated.View style={[{ transform: [{ translateY: home_comp_1 }] }, [{ position: 'absolute', width: '100%', height: 60, alignItems: 'center', justifyContent: 'center' }]]}>
          <DropShadow
            style={{
              width: '90%',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          >
            
             
            <View activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three, borderRadius: 10, height: 50, flexDirection: 'row' }}>
            <TouchableOpacity activeOpacity={1} onPress={navigation.toggleDrawer.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                <Icon type={Icons.MaterialIcons} name="menu" color={colors.icon_active_color} style={ {fontSize: 22}} />
              </TouchableOpacity>

                  <TouchableOpacity activeOpacity={1} onPress={open_location.bind(this, 1)} style={{ width: '70%', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 14, fontFamily: normal }}>{pickup_address || "Select pickup address"}</Text>
                </TouchableOpacity>
             
             
              <TouchableOpacity activeOpacity={1} onPress={() => fav_RBSheet.current.open()} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                <Icon type={Icons.MaterialIcons} name="favorite-border" color={colors.icon_inactive_color} style={{ fontSize: 22 }} />
              </TouchableOpacity>
              {/* <Button title="Clear" onPress={clearAsyncStorage}/>  */}
            </View>
          </DropShadow>
        </Animated.View> 
    
      

    {/* Drop Office Address */}
  
  <Animated.View
    style={[{ transform: [{ translateY: home_comp_3 }] },
      { position: 'absolute', width: '100%', height: 60, alignItems: 'center', justifyContent: 'center' },]}
  >
    <DropShadow
      style={{
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      }}
    >
      <View activeOpacity={1}
        style={{
          width: '100%',
          backgroundColor: colors.theme_bg_three,
          borderRadius: 10,
          height: 50,
          flexDirection: 'row',
        }}
      >
        {/* <TouchableOpacity activeOpacity={1} onPress={navigation.toggleDrawer.bind(this)} 
        style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }} >
          <Icon  type={Icons.MaterialIcons}
            name="menu"
            color={colors.icon_active_color}
            style={{ fontSize: 22 }}
          />
        </TouchableOpacity> */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={open_location.bind(this, 2)}
          style={{ width: '70%', alignItems: 'flex-start', justifyContent: 'center' }}
        >
          <Text numberOfLines={1} ellipsizeMode='tail'style={{ color: colors.theme_fg_two, fontSize: 14,paddingLeft:15, fontFamily: normal }}>
            {drop_address || "Select drop address"}
          </Text>
        </TouchableOpacity>

        {/* Uncomment to Add Favorite Button */}
        {/* <TouchableOpacity
          activeOpacity={1}
          onPress={() => fav_RBSheet.current.open()}
          style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon
            type={Icons.MaterialIcons}
            name="favorite-border"
            color={colors.icon_inactive_color}
            style={{ fontSize: 22 }}
          />
        </TouchableOpacity> */}
        
        {/* Uncomment to Add Clear Button */}
        {/* <Button title="Clear" onPress={clearAsyncStorage} /> */}
      </View>
    </DropShadow>
  </Animated.View>


  
  {/* Bottom tab show all the cars and trip type */}
  {/* <Animated.View style={[{ transform: [{ translateY: home_comp_2 }] }, [{ position: 'absolute', bottom: 0, width: '100%', height: 170, backgroundColor: colors.theme_bg_three, alignItems: 'center', justifyContent: 'center' }]]}>
          <View style={{flexDirection: 'row'}}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                {load_trip_types()}
              </ScrollView>
            </View>
          <View style={{ flexDirection: 'row' }}>
            {load_trip_types()}
          </View>
          <View style={{ margin: 10 }} />
          {active_trip_type != 2 ?
            <DropShadow
              style={{
                width: '90%',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >

              
              <TouchableOpacity activeOpacity={1} onPress={open_location.bind(this, 2)} style={{ width: '100%', backgroundColor: colors.theme_bg_three, borderRadius: 10, height: 60, flexDirection: 'row' }}>
                <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon type={Icons.MaterialIcons} name="search" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                </View>
                <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
                  <Text style={{ color: colors.theme_fg_two, fontSize: 16, color: colors.text_grey }}>{strings.where_are_u_going}</Text>
                </View>
              </TouchableOpacity>
            </DropShadow>
            :
            <View style={{ height: 60, flexDirection: 'row' }}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
                {show_packages()}
              </ScrollView>
            </View>
          }
        </Animated.View> */}


      </View>
    )
  }


  // Pickup Locaion Screen     
  const screen_location = () => {
    return (
      <View>
        <Animated.View style={[{ transform: [{ translateY: drop_comp_3 }] }, [{ position: 'absolute', width: '100%', height: 100, alignItems: 'center', paddingBottom: 10, justifyContent: 'center', backgroundColor: colors.theme_bg_three }]]}>
          <View style={{ flexDirection: 'row', height: 90, width: '100%' }}>
            <TouchableOpacity onPress={back_to_home_screen.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
              <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.icon_active_color} style={{ fontSize: 22 }} />
            </TouchableOpacity>
            <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: 18, fontFamily: bold }}>{active_location == 1 ? strings.pick_up : strings.destination }</Text>
            </View>
          </View>
        </Animated.View>

        {/* Confirm Location */}
        <Animated.View style={[{ transform: [{ translateY: drop_comp_2 }] }, [{ position: 'absolute', bottom: 0, width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' }]]}>
          <TouchableOpacity activeOpacity={1} onPress={confirm_location.bind(this)} style={{ width: '90%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: colors.theme_fg_two, fontSize: 16, color: colors.theme_fg_three, fontFamily: bold }}>{strings.confirm_location}</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[{ transform: [{ translateY: drop_comp_4 }] }, [{ position: 'absolute', width: '100%', height: (screenHeight - 100), alignItems: 'center', paddingBottom: 10, justifyContent: 'flex-start', backgroundColor: colors.theme_bg_three }]]}>
          <View style={{ margin: 30 }} />
          <TouchableOpacity activeOpacity={1} onPress={search_exit.bind(this)} style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, padding: 10, borderRadius: 10, borderColor: colors.grey }}>
            <Icon type={Icons.MaterialIcons} name="location-on" color={colors.icon_inactive_color} style={{ fontSize: 22 }} />
            <View style={{ margin: 5 }} />
            <Text style={{ fontSize: 18, color: colors.text_grey, fontFamily: bold }}>{strings.locate_on_map}</Text>
          </TouchableOpacity>
          <View style={{ margin: 20 }} />
          <View style={{ width: '100%', padding: 20 }}>
            <Text style={{ fontSize: 18, color: colors.text_grey, fontFamily: bold }}>{strings.favourites}</Text>
            <View style={{ margin: 10 }} />
            {favourites_list()}
          </View>

        </Animated.View>
        <Animated.View style={[{ transform: [{ translateY: drop_comp_1 }] }, [{ position: 'absolute', width: '100%', alignItems: 'center', justifyContent: 'center' }]]}>
          <DropShadow
            style={{
              width: '90%',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 5,
            }}
          >
            <View style={{ borderRadius: 10, backgroundColor: colors.theme_bg_three }}>
              <GooglePlacesAutocomplete
                ref={search}
                minLength={2}       // Minimum length of text before search starts
                placeholder={active_location == 1 ? strings.enter_the_pick_up : strings.enter_the_destination}
                listViewDisplayed='auto'   // Whether to display the list view automatically
                fetchDetails={true}         // Fetch the details of the selected place
                GooglePlacesSearchQuery={{
                  rankby: 'distance',     // Search places by distance
                  types: 'food'              // Restrict results to food places
                }}
                debounce={200}             // Debounce time for the search query
                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // Filter results by types for reverse geocoding
                textInputProps={{
                  onFocus: () => is_focus(), // Function to call when input is focused
                  placeholderTextColor: colors.text_grey, // Placeholder text color
                  returnKeyType: "search" // Return key type for the keyboard
                }}
                styles={{
                  textInputContainer: {
                    backgroundColor: colors.theme_bg_three,
                    borderRadius: 10,
                  },
                  description: {
                    color: '#000'
                  },
                  textInput: {
                    height: 45,
                    color: colors.theme_fg_two,
                    fontFamily: normal,
                    fontSize: 14,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10
                  },
                  predefinedPlacesDescription: {
                    color: colors.theme_fg_two,
                  }
                }}
                currentLocation={true} // Enable fetching the current location
                enableHighAccuracyLocation={true} // Enable high accuracy for the location fetching
                // currentLocationLabel="current_location"
                onPress={(data, details = null) => {
                  get_location(data, details); // Call get_location function when a place is selected
                }}
                onFail={(error) => console.error('Google Places API error: ', error)}
                query={{
                  key: GOOGLE_KEY,
                  language: 'en',
                  radius: '1500',  //Search radius in meters
                  location: pickup_lat + ',' + pickup_lng,
                  types: ['geocode', 'address']
                }}
              />
            </View>
          </DropShadow>
        </Animated.View>
      </View>
    )
  }


  // Booking Screen
  const screen_booking = () => {
    return (
      <View>
        {!current_location_status &&
          <DropShadow
            style={{
              width: '100%',
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.3,
              shadowRadius: 25,
            }}
          >
            <TouchableOpacity activeOpacity={0} onPress={booking_exit.bind(this)} style={{ width: 40, height: 40, backgroundColor: colors.theme_bg_three, borderRadius: 25, alignItems: 'center', justifyContent: 'center', top: 20, left: 20 }}>
              <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.icon_active_color} style={{ fontSize: 22 }} />
            </TouchableOpacity>
          </DropShadow>
        }
        {/* Pickup and Drop Details */}
     
        {/* <Animated.View style={[{ transform: [{ translateY: book_comp_1 }] }, [{ position: 'absolute', width: '100%', height: (screenHeight - 250), paddingBottom: 10, justifyContent: 'flex-start', backgroundColor: colors.theme_bg_three }]]}>
          <View style={{ width: '100%', height: 110 }}>
            <DropShadow
              style={{
                width: '100%',
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}
            >
              <TouchableOpacity activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                <View style={{ flexDirection: 'row', width: '80%', height: 50 }}>
                  <View style={{ width: '10%', alignItems: 'center', justifyContent: 'center' }}>
                    <Badge status="success" backgroundColor="green" size={10} />
                  </View>
                  <View style={{ margin:3}}/>
                  <View style={{ width: '75%', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 13, fontFamily: normal }}>{pickup_address}</Text>
                  </View>
                </View>
              </TouchableOpacity>
              <Divider style={{ backgroundColor: colors.grey }} />
              {active_trip_type == 2 ?
                <TouchableOpacity activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                  <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 20, marginLeft: 10, marginRight: 10 }}>
                    <View style={{ width: '10%' }}>
                      <Icon type={Icons.MaterialIcons} name="schedule" color={colors.icon_inactive_color} style={{ fontSize: 22 }} />
                    </View>
                    <View style={{ width: '90%' }}>
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: bold }}>{package_hr} hrs {package_km}{strings.km_package}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                :
                <TouchableOpacity activeOpacity={1} style={{ width: '100%', backgroundColor: colors.theme_bg_three }}>
                  <View style={{ flexDirection: 'row', width: '80%', height: 50 }}>
                    <View style={{ width: '10%', alignItems: 'center', justifyContent: 'center' }}>
                      <Badge status="error" backgroundColor="red"  size={10} />
                    </View>
                    <View style={{ margin:3}}/>
                    <View style={{ width: '75%', alignItems: 'flex-start', justifyContent: 'center' }}>
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 13, fontFamily: normal }}>{drop_address}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              }
              {active_trip_type != 5 &&
                <TouchableOpacity activeOpacity={1} onPress={show_date_picker.bind(this)} style={{ padding: 10, position: 'absolute', height: 50, backgroundColor: colors.theme_bg_three, right: 10, top: 25, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: colors.theme_bg }}>
                  {pickup_date_label == strings.now ?
                    <View style={{ width: 50, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon type={Icons.MaterialIcons} name="schedule" color={colors.icon_inactive_color} style={{ fontSize: 20 }} />
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 12, fontFamily: bold }}>{pickup_date_label}</Text>
                    </View>
                    :
                    <View style={{ width: 100, alignItems: 'center', justifyContent: 'center' }}>
                      <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 12, fontFamily: bold }}>{pickup_date_label}</Text>
                    </View>
                  }
                </TouchableOpacity>
              }
            </DropShadow>
          </View>

          <ScrollView>
            <View style={{ marginTop: 10, marginBottom: 10, flexDirection: 'row', flex: 1, backgroundColor: colors.theme_bg_three }}>
              {load_trip_sub_types()}
            </View>
            <View style={{ padding: 10 }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: bold }}>{strings.available_rides}</Text>
              <View style={{ margin: 8 }} />
              {estimation_fare_list()}
            </View>
          </ScrollView>

        
           <View style={{ height: 140, alignItems: 'center', justifyContent: 'flex-end' }}>
            <View style={{ width: '100%', height: 30, backgroundColor: colors.theme_bg, alignItems: 'center', justifyContent: 'center' }}>
              <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: 12, fontFamily: normal, letterSpacing: 1 }}>{strings.you_have} {global.currency}{wallet} {strings.in_your_wallet}</Text>
            </View>
            <View style={{ height: 60, width: '100%', flexDirection: 'row' }}>
              <TouchableOpacity style={{ width: '49%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Image source={money_icon} style={{ width: 30, height: 30 }} />
                <View style={{ margin: 5 }} />
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: bold }}>{strings.cash}</Text>
              </TouchableOpacity>
              <View style={{ margin: '2%', borderLeftWidth: 1, borderColor: colors.grey }} />
              <TouchableOpacity activeOpacity={1} onPress={navigate_promo.bind(this)} style={{ width: '49%', alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}>
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: bold }}>{strings.coupons}</Text>
                <View style={{ margin: 5 }} />
                <Image source={discount_icon} style={{ width: 30, height: 30 }} />
              </TouchableOpacity>
            </View>
            {loading == false ?
              <TouchableOpacity onPress={call_zone.bind(this)} activeOpacity={1} style={{ width: '90%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.theme_fg_two, fontSize: 16, color: colors.theme_fg_three, fontFamily: bold }}>{strings.book_now}</Text>
              </TouchableOpacity>
              :
              <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                <LottieView style={{flex: 1}} source={btn_loader} autoPlay loop />
              </View>
            }
          </View>
        </Animated.View> */}
        
      </View>
    )
  }

  const rb_favourite = () => {
    return (
      <RBSheet
        ref={fav_RBSheet}
        height={500}
        openDuration={250}
        customStyles={{
          container: {
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: 10
          }
        }}
      >
        <MapView
        provider={PROVIDER_GOOGLE}
        ref={favMapRef}
        style={{
          flex: 1,
          width: '98%',
          height: '100%',
        }}
        region={favRigion}
        showsUserLocation={true}
        showsMyLocationButton={current_location_status}
      >
        {routeCoords.length > 0 &&
       ( <>
           <Marker coordinate={{latitude: pickup.latitude,longitude:pickup.longitude }}
                 title={"Pickup Location"}
                 description={pickup_address}
             />

           <Marker coordinate={{latitude:dropoff.latitude, longitude:dropoff.longitude}}
                    title={"Drop Location"}
                    description={drop_address}       
               />
           <Polyline
        coordinates={polylineCoordinates}
        strokeColor="#0F52BA"   // Line color
        strokeWidth={3} // Line width
      />
        </>)
       } 
      </MapView>



         <View style={{ padding: 10, width: '100%' }}>
          {/* <Text style={{ color: colors.theme_fg_two, fontSize: 25, fontFamily: normal }}>{strings.save_as_favourite}</Text> */}
          <View style={{ margin: 5 }} />
          <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: regular }}>{pickup_address}</Text>
        </View>
        <View style={{ margin: 10 }} />
        <View style={{ flexDirection: 'row', width: '100%' }}>
          <View style={{ width: '1%' }} />
          <View style={{ width: '48%', alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity activeOpacity={1} onPress={() => fav_RBSheet.current.close()} style={{ width: '100%', backgroundColor: colors.lite_grey, borderRadius: 5, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: 16, color: colors.theme_fg_two, fontFamily: bold }}>{strings.cancel}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ width: '1%' }} />
          <View style={{ width: '48%', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' }}>
            <TouchableOpacity activeOpacity={1} onPress={() => add_favourite_api()} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 5, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: 16, color: colors.theme_fg_three, fontFamily: bold }}>{strings.save}</Text>
            </TouchableOpacity>
          </View>
        </View> 
      </RBSheet>
    )
  }

  const cancel_request = () => {
    console.log( { trip_request_id: trip_request_id })
    axios({
      method: 'post',
      url: api_url + trip_request_cancel,
      data: { trip_request_id: trip_request_id }
    })
      .then(async response => {
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        console.log(error)
      });
  }


  // Search The Nearst Driver
  const search_dialog = () => {
    return (
      <Dialog.Container
        visible={search_status}
        width="90%"
      >
        <Dialog.Description>
          <View
            style={{
              padding: 10,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:colors.theme_bg_three
            }}
          >
            <View style={{ alignItems: "center", padding: 20 }}>
              <LottieView
                style={{ height: 100, width: 100, flex:1 }}
                source={search_loader}
                autoPlay
                loop
              />
            </View>
            <Text style={{ fontSize: 13, fontFamily: bold, color: colors.theme_fg_two }}>
              {strings.please_wait_while_searching_the_driver}
            </Text>
            <View style={{ margin: 10 }} />
            {loading == false ?
              <TouchableOpacity style={{ padding: 10 }} activeOpacity={1} onPress={cancel_request.bind(this)}>
                <Text
                  // onPress={cancel_request.bind(this)}
                  style={{
                    color: "red",
                    fontSize: f_m,
                    fontFamily: bold,
                    alignSelf: "center",
                  }}
                >
                  {strings.cancel}
                </Text>
              </TouchableOpacity>
              :
              <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                <LottieView style={{flex: 1}} source={btn_loader} autoPlay loop />
              </View>
            }
            </View>
        </Dialog.Description>
      </Dialog.Container>
    )
  }



  // Date Picker
  const date_picker = () => {
    return (
      <DateTimePickerModal
        isVisible={is_date_picker_visible}
        mode="datetime"
        date={new Date()}
        minimumDate={new Date(Date.now() + 10 * 60 * 1000)}
        is24Hour={false}
        onConfirm={handle_confirm}
        onCancel={hide_date_picker}
      />
    )
  }

  



  // Model
  const modal = () => {
    return (
      <View style={{ flex: 1 }}>
        <Modal isVisible={is_modal_visible} animationInTiming={500} animationOutTiming={500} onBackdropPress={() => setModalVisible(false)} animationIn="slideInUp" animationOut="slideOutDown" style={{ width: '90%', height: '60%', backgroundColor: colors.theme_bg_three, borderRadius: 10 }}>
          <View style={{ width: '100%', flexDirection: 'row', padding: 20 }}>
            <View style={{ width: '80%', alignItems: 'flex-start', justifyContent: 'center' }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: 20, fontFamily: bold }}>{strings.promo_codes}</Text>
            </View>
            <TouchableOpacity onPress={toggleModal.bind(this)} style={{ width: '20%', alignItems: 'flex-end', justifyContent: 'center' }}>
              <Icon type={Icons.MaterialIcons} name="close" color={colors.icon_inactive_color} style={{ fontSize: 30 }} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={promo_list}
            renderItem={show_promo_list}
            keyExtractor={item => item.id}
          />
        </Modal>
      </View>
    )
  }



// Show Promo List
  const show_promo_list = ({ item }) => (
    <View style={{ alignItems: 'center', borderBottomWidth: 0.5 }}>
      <View style={{ width: '100%', backgroundColor: colors.theme_bg_three, borderRadius: 10, padding: 20, marginTop: 5, marginBottom: 5 }}>
        <View style={{ width: '100%', alignItems: 'flex-start', justifyContent: 'center' }}>
          <Text style={{ color: colors.theme_fg_two, fontSize: 16, fontFamily: bold }}>{item.promo_name}</Text>
          <View style={{ margin: 3 }} />
          <Text style={{ color: colors.theme_fg_two, fontSize: 14, fontFamily: regular }}>{item.description}</Text>
        </View>
        <View style={{ margin: 5 }} />
        <View style={{ width: '100%', borderRadius: 10, flexDirection: 'row', borderWidth: 1, padding: 10, backgroundColor: colors.text_container_bg, borderStyle: 'dotted' }}>
          <View style={{ width: '70%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text style={{ color: colors.theme_fg, fontSize: 16, fontFamily: normal }}>{global.currency}{item.discount}{strings.OFF}</Text>
          </View>
          {loading == true ?
            <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
              <LottieView style={{flex: 1}} source={btn_loader} autoPlay loop />
            </View>
            :
            <TouchableOpacity onPress={call_apply_promo.bind(this, item)} activeOpacity={1} style={{ width: '30%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg, borderRadius: 10, padding: 10 }}>
              <Text style={{ color: colors.theme_fg_three, fontSize: 14, fontFamily: normal }}>{strings.apply}</Text>
            </TouchableOpacity>
          }
        </View>
      </View>
    </View>
  );

                                 
  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />

      {/* Google Mapview */}
      <MapView
        provider={PROVIDER_GOOGLE}
        ref={map_ref}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={current_location_status}
        onRegionChange={handleRegionChange} // Detect map dragging
        onRegionChangeComplete={(region) => {
          //  console.log("region coming in MapView",region);
          setIsDragging(false)
          region_change(region);
        }}
      >
        
        {render_vehicles()}
        {polylineCoordinates.length > 0 && (
          <>
            <Polyline
              coordinates={polylineCoordinates}
              strokeColor="#0F52BA" // Line color
              strokeWidth={3}    // Line width
            />
            <Marker
              coordinate={{ latitude: pickup_lat, longitude: pickup_lng }}
              title={"Pickup Location"}
              description={pickup_address}
            />
            <Marker
              coordinate={{ latitude: drop_lat, longitude: drop_lng }}
              title={"Drop Location"}
              description={drop_address}
                markerColor={"green"}
            />
          </>
        )}
      </MapView>

      <View style={{ height: 100, width: 100, alignSelf: 'center', position: 'absolute', top: (screenHeight / 2) - 50 }}>
        <LottieView style={{flex: 1}} source={pin_marker} autoPlay loop />
      </View>
      {screen_home()}
      {screen_location()}
      {screen_booking()}
      {rb_favourite()}
      {date_picker()}
      <DropdownAlert alert={func => (alt = func)} />
      {search_dialog()}
      {modal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    height: screenHeight,
    width: screenWidth,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  vehicle_img: {
    height: 40,
    width: 60
  },
  active_trip_type_label: {
    color: colors.theme_fg_two,
    fontSize: 12,
    fontFamily: bold
  },
  inactive_trip_type_label: {
    color: colors.text_grey,
    fontSize: 12,
    fontFamily: normal
  },
  segment_active_bg: { width: '48%', alignItems: 'center', justifyContent: 'center', padding: 5, marginLeft: '1%', marginRight: '1%', backgroundColor: colors.theme_bg, borderRadius: 10 },
  segment_active_fg: { color: colors.theme_fg_two, fontSize: 14, fontFamily: bold, color: colors.theme_fg_three },
  segment_inactive_bg: { width: '48%', alignItems: 'center', justifyContent: 'center', padding: 5, marginLeft: '1%', marginRight: '1%', backgroundColor: colors.lite_bg, borderRadius: 10 },
  segment_inactive_fg: { color: colors.theme_fg_two, fontSize: 14, fontFamily: normal, color: colors.theme_fg_two }
});

function mapStateToProps(state) {
  return {
    initial_lat: state.booking.initial_lat,
    initial_lng: state.booking.initial_lng,
    initial_region: state.booking.initial_region,
  };
}

export default connect(mapStateToProps, null)(Dashboard);
