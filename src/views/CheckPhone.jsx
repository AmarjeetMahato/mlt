import React, { useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  I18nManager
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { normal, bold, regular, check_phone, api_url, btn_loader, f_xs, f_m, f_l } from '../config/Constants';
import DropdownAlert, {
  DropdownAlertData,
  DropdownAlertType,
} from 'react-native-dropdownalert';
import axios from 'axios';
import Icon, { Icons } from '../components/Icons';
import LottieView from 'lottie-react-native';
import PhoneInput from 'react-native-phone-input';
import strings from "../languages/strings.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import RNRestart from 'react-native-restart';

const CheckPhone = (props) => {
  const navigation = useNavigation();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState(false);
  const [formattedValue, setFormattedValue] = useState("");
  const [language, setLanguage] = useState(global.lang);
  const phone = useRef();
  let alt = useRef(
    (_data?: DropdownAlertData) => new Promise < DropdownAlertData > (res => res),
  );

  axios.interceptors.request.use(async function (config) {
    // Do something before request is sent
    //console.log("loading")
    setLoading(true);
    return config;
  }, function (error) {
    //console.log(error)
    setLoading(false);
    console.log("finish loading")
    // Do something with request error
    return Promise.reject(error);
  });

  const check_valid = () => {
    if ('+' + phone.current?.getCountryCode() == phone.current?.getValue()) {
      setValidation(false);
    } else if (!phone.current?.isValidNumber()) {
      setValidation(false);
      alt({
        type: DropdownAlertType.Error,
        title: strings.validation_error,
        message: strings.please_enter_valid_phone_number,
      });
    } else {
      setValidation(true);
      //alert(phone.current?.getValue())
      setFormattedValue(phone.current?.getValue())
      call_check_phone(phone.current?.getValue());
    }
  }

  const call_check_phone = async (phone_with_code) => {
    console.log("respose going to backend",phone_with_code)
    await axios({
      method: 'post',
      url: api_url + check_phone,
      data: { phone_with_code: phone_with_code }
    })
      .then(async response => {
        console.log("respose coming from backend",response.data.result)
        setLoading(false);
        navigate(response.data.result);
      })
      .catch(error => {
        console.log("error :", error)
        setLoading(false);
        alt({
          type: DropdownAlertType.Error,
          title: strings.error,
          message: strings.sorry_something_went_wrong,
        });
      });
  }

  const navigate = async (data) => {
    let phone_number = phone.current?.getValue();
    phone_number = phone_number.replace("+" + phone.current?.getCountryCode(), "");
    if (data.is_available == 1) {
      navigation.navigate('Password', { phone_number: phone.current?.getValue() });
    } else {
      navigation.navigate('OTP', { otp: data.otp, phone_with_code: phone.current?.getValue(), country_code: "+" + phone.current?.getCountryCode(), phone_number: phone_number, id: 0, from: "register" });
    }
  }

  const language_change = async(lang) => {
    if(global.lang != lang){
        try {
          await AsyncStorage.setItem('lang', lang);
          strings.setLanguage(lang);
          if(lang == 'ar'){
            global.lang = await lang;
            await I18nManager.forceRTL(true);
            await RNRestart.Restart();
          } else {
            global.lang = await lang;
            await I18nManager.forceRTL(false);
            await RNRestart.Restart();
          }
        } catch (e) {

        }
    }
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.lite_bg, flex: 1 }}>
      <StatusBar
        backgroundColor={colors.theme_bg}
      />
      <View style={[styles.header]} />
      <View style={{ margin: 20 }} />
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_l, fontFamily: bold }}>{strings.enter_your_phone_number}</Text>
        <View style={{ margin: 5 }} />
        <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal }}>{strings.you_need_enter_your_phone_number}</Text>
        <View style={{ margin: 20 }} />
        <View style={{ width: '80%' }}>
          <PhoneInput style={{ borderBottomColor: colors.theme_bg_two }}
            flagStyle={styles.flag_style}
            ref={phone}
            initialCountry="in" offset={10}
            textStyle={styles.country_text}
            textProps={{
              placeholder: strings.phone_number,
              placeholderTextColor: colors.theme_fg_two
            }}
            autoFormat={true} />
          <View style={{ margin: 30 }} />
          {loading == false ?
            <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>{strings.login_register}</Text>
            </TouchableOpacity>
            :
            <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
              <LottieView style={{ flex: 1 }} source={btn_loader} autoPlay loop />
            </View>
          }
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ paddingLeft: '50%', justifyContent: 'center', alignItems: 'flex-end' }}>
          <Icon type={Icons.MaterialCommunityIcons} name="translate" color={colors.grey} style={{ fontSize: 25 }} />
        </View>
        <View style={{ color: colors.theme_bg_two, justifyContent: 'center', alignItems: 'flex-end' }}>
          <Picker
            selectedValue={global.lang}
            dropdownIconColor={colors.theme_bg}
            style={{ height: 210, width: 160, color: colors.theme_fg }}
            itemStyle={{ fontFamily: normal }}
            onValueChange={(itemValue, itemIndex) =>
              language_change(itemValue)
            }>
            <Picker.Item label={strings.english} style={{ fontSize: 12, color: colors.theme_fg, fontFamily: regular, backgroundColor: colors.theme_bg_three, }} value="en" />
            <Picker.Item label={strings.arabic} style={{ fontSize: 12, color: colors.theme_fg, fontFamily: regular, backgroundColor: colors.theme_bg_three, }} value="ar" />
          </Picker>
        </View>
      </View>
      <DropdownAlert alert={func => (alt = func)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: colors.lite_bg,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textinput: {
    fontSize: f_l,
    color: colors.grey,
    fontFamily: regular,
    height: 60,
    backgroundColor: '#FAF9F6'
  },
  flag_style: {
    width: 38,
    height: 24
  },
  country_text: {
    fontSize: 18,
    borderBottomWidth: 1,
    paddingBottom: 8,
    height: 35,
    fontFamily: regular,
    color: colors.theme_fg_two
  },
});

export default CheckPhone;