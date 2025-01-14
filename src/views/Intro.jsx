import React, {useState} from 'react';
import { StyleSheet, View, SafeAreaView, Text, StatusBar } from 'react-native';
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { normal, bold, screenWidth, f_s, f_25 } from '../config/Constants';
import { useNavigation } from '@react-navigation/native';
import AppIntroSlider from 'react-native-app-intro-slider';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import strings from "../languages/strings.js";
import {Picker} from '@react-native-picker/picker';
import RNRestart from 'react-native-restart';

const Intro = () => {
  const navigation = useNavigation();
  const [language, setLanguage] = useState(global.lang);

  const slides = [
    {
      key: 1,
      title: strings.search_a_car,
      text: strings.you_can_choose_the_vehicle_model_and_the_fare_for_that_ride_based_on_your_needs_and_the_number_of_passengers,
      image: require('.././assets/json/slider_1.json'),
      bg: colors.theme_bg_three,
    },
    {
      key: 2,
      title: strings.choose_your_route,
      text: strings.to_begin_your_journey_log_in_to_our_app_and_select_your_pick_up_and_drop_off_locations,
      image: require('.././assets/json/slider_2.json'),
      bg: colors.theme_bg_three,
    },
    {
      key: 3,
      title: strings.reach_your_destination,
      text: strings.have_a_pleasant_ride_and_arrive_at_your_destination_on_time_and_within_your_estimated_fare,
      image: require('.././assets/json/slider_3.json'),
      bg: colors.theme_bg_three,
    }
  ];

  const renderItem = ({ item }: { item: Item }) => {
    return (
      <View
        style={[
          styles.slide,
          {
            backgroundColor: item.bg,
          },
        ]}>
        <View style={{ height: screenWidth, width: screenWidth }}>
          <LottieView style={{flex: 1}} source={item.image} autoPlay loop />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.text}>{item.text}</Text>
      </View>
    );
  };

  const onDone = async () => {
    try {
      await AsyncStorage.setItem('existing', '1');
      global.existing = await 1;
      navigation.navigate('CheckPhone');
    } catch (e) {
      alert(e);
    }
  }

  const renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon type={Icons.Ionicons} name="chevron-forward" color={colors.theme_fg_three} style={{ fontSize: 35 }} />
      </View>
    );
  };

  const renderPrevButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon type={Icons.Ionicons} name="chevron-back" color={colors.theme_fg_three} style={{ fontSize: 35 }} />
      </View>
    );
  };

  const renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon type={Icons.Ionicons} name="home" color={colors.theme_fg_three} style={{ fontSize: 25 }} />
      </View>
    );
  };


  const keyExtractor = (item: Item) => item.title;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={{ flex: 1 }}>
        <AppIntroSlider
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onDone={onDone}
          showSkipButton
          showPrevButton
          activeDotStyle={{ backgroundColor: colors.theme_bg }}
          renderDoneButton={renderDoneButton}
          renderNextButton={renderNextButton}
          renderPrevButton={renderPrevButton}
          data={slides}
        />
      </View>
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textFieldcontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    height: 45
  },
  textFieldIcon: {
    padding: 5
  },
  textField: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    height: 45,
    backgroundColor: colors.theme_bg_three,
    fontSize: 14,
    color: colors.grey
  },
  button: {
    padding: 10,
    borderRadius: 10,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.theme_bg,
    width: '100%',
    height: 45
  },
  flag_style: {
    width: 38,
    height: 24
  },
  country_text: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    height: 45,
    backgroundColor: colors.theme_bg_three,
    fontSize: f_s,
    color: colors.theme_fg_two
  },
  textFieldcontainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    height: 45
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 96,
  },
  image: {
    width: 320,
    height: 320,
    marginTop: 32,
  },
  title: {
    fontSize: f_25,
    color: colors.theme_fg_two,
    fontFamily: bold,
    textAlign: 'center',
  },
  text: {
    fontSize: f_s,
    fontFamily: normal,
    color: colors.text_grey,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'justify',
    padding: 20,
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: colors.theme_bg,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Intro;