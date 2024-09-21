import React, { useState } from 'react';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, I18nManager } from 'react-native'
import Icon, { Icons } from './src/components/Icons';
import * as colors from './src/assets/css/Colors';
import { screenWidth, bold, normal, regular, logo, img_url,f_s } from './src/config/Constants';
import { connect } from 'react-redux';
import Dialog from "react-native-dialog";
import strings from "./src/languages/strings.js";
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNRestart from 'react-native-restart';

/* Screens */
import Splash from './src/views/Splash';
import LocationEnable from './src/views/LocationEnable';
import Intro from './src/views/Intro';
import Forgot from './src/views/Forgot';
import Dashboard from './src/views/Dashboard';
import Faq from './src/views/Faq';
import EmergencyContacts from './src/views/EmergencyContacts';
import Subscription from './src/views/Subscription';
import MyRides from './src/views/MyRides';
import Wallet from './src/views/Wallet';
import Profile from './src/views/Profile';
import Notifications from './src/views/Notifications';
import TripDetails from './src/views/TripDetails';
import CheckPhone from './src/views/CheckPhone';
import Password from './src/views/Password';
import OTP from './src/views/OTP';
import CreateName from './src/views/CreateName';
import CreateEmail from './src/views/CreateEmail';
import CreatePassword from './src/views/CreatePassword';
import ResetPassword from './src/views/ResetPassword';
import Bill from './src/views/Bill';
import PaymentMethod from './src/views/PaymentMethod';
import WriteRating from './src/views/WriteRating';
import PrivacyPolicies from './src/views/PrivacyPolicies';
import AboutUs from './src/views/AboutUs';
import Refer from './src/views/Refer';
import Terms from './src/views/Terms';
import ComplaintCategory from './src/views/ComplaintCategory';
import ComplaintSubCategory from './src/views/ComplaintSubCategory';
import Logout from './src/views/Logout';
import FaqDetails from './src/views/FaqDetails';
import Promo from './src/views/Promo';
import EditFirstName from './src/views/EditFirstName';
import EditLastName from './src/views/EditLastName';
import EditEmail from './src/views/EditEmail';
import Rating from './src/views/Rating';
import NotificationDetails from './src/views/NotificationDetails';
import AddEmergencyContact from './src/views/AddEmergencyContact';
import Paypal from './src/views/Paypal';
import CreateComplaint from './src/views/CreateComplaint';
import Chat from './src/views/Chat';
import AdminChat from './src/views/AdminChat';
import ScrollTest from './src/views/ScrollTest';
import AppUpdate from './src/views/AppUpdate';
import temp from './src/views/temp';
import Scheduling from './src/views/Scheduling.jsx';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  const navigation = useNavigation();
  const [dialog_visible, setDialogVisible] = useState(false);
  const [language, setLanguage] = useState(global.lang);

  const showDialog = () => {
    setDialogVisible(true);
  }

  const closeDialog = () => {
    setDialogVisible(false);
  }

  const handleCancel = () => {
    setDialogVisible(false)
  }

  const handleLogout = async () => {
    closeDialog();
    navigation.navigate('Logout');
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
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 10, alignItems: 'flex-start' }}>
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Dashboard') }} style={{ padding: 20, alignItems: 'flex-end', width: '100%' }}>
          <Icon type={Icons.MaterialIcons} name="close" color={colors.icon_inactive_color} style={{ fontSize: 25 }} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', width: '100%', alignItems: 'center' }}>
          <View style={{ width: '40%', alignItems: 'center' }}>
            <View style={{ width: 100, height: 100 }} >
              <Image style={{ height: undefined, width: undefined, flex: 1, borderRadius: 25 }} source={{ uri: img_url + global.profile_picture }} />
            </View>
          </View>
          <View style={{ width: '60%' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 20, fontFamily: normal }}>{strings.hello}</Text>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 25, fontFamily: bold, letterSpacing: 1 }}>{global.first_name}</Text>
          </View>
        </View>
      </View>
      <View style={styles.pickerFieldcontainer}>
      <Picker
        selectedValue={global.lang}
        dropdownIconColor={colors.theme_bg}
        style={{ height: 20, width: 160, color: colors.theme_fg,  backgroundColor: colors.theme_bg_three}}
        onValueChange={(itemValue, itemIndex) =>
          language_change(itemValue)
        }>
        <Picker.Item label={strings.english} style={{ fontSize:12, color:colors.theme_fg, fontFamily:regular, backgroundColor: colors.theme_bg_three, }} value="en"  />
        <Picker.Item label={strings.arabic} style={{ fontSize:12, color:colors.theme_fg, fontFamily:regular, backgroundColor: colors.theme_bg_three, }} value="ar" />
      </Picker>
      </View>
      <ScrollView style={{ padding: 10, height: 750}}>
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Dashboard') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="home" color={colors.theme_fg_two} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_two, fontSize: 18, fontFamily: regular }}>{strings.dashboard}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('MyRides') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="local-taxi" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.my_rides}</Text>
            <View style={{ margin: 3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{strings.ride_histories_invoice_complaints}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Scheduling') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="calendar-month" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.scheduling}</Text>
            <View style={{ margin: 3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{strings.ride_histories_invoice_complaints}</Text>
          </View>
        </TouchableOpacity>

        {/*<TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Subscription') }} style={{ flexDirection:'row', width:'100%', margin:15}}>
          <View style={{ width:'15%', alignItems:'center', justifyContent:'center'}}>
            <Icon type={Icons.MaterialIcons} name="card-membership" color={colors.text_grey} style={{ fontSize:25 }} />
          </View>
          <View style={{ width:'85%', alignItems:'flex-start', justifyContent:'center'}}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color:colors.text_grey, fontSize:18, fontFamily:regular }}>Subscription</Text>
            <View style={{ margin:3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color:colors.text_grey, fontSize:12, fontFamily:normal }}>Buy subscription for your free rides</Text>
          </View>
        </TouchableOpacity>*/}
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Profile') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="account-circle" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.profile_settings}</Text>
            <View style={{ margin: 3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{strings.edit_your_profile_details}</Text>
          </View>
        </TouchableOpacity>


        {/* Wallet Image/Icons   on Drawer Screen     @Amarjeet Mahato */}

        {/* <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Wallet') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="payments" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.wallet}</Text>
          </View>
        </TouchableOpacity> */}



        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Notifications') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="notifications" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.notifications}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('EmergencyContacts') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="contacts" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.emergency_contacts}</Text>
            <View style={{ margin: 3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{strings.add_sos_contacts}</Text>
          </View>
        </TouchableOpacity>
        {/*<TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Refer') }} style={{ flexDirection:'row', width:'100%', margin:15}}>
          <View style={{ width:'15%', alignItems:'center', justifyContent:'center'}}>
            <Icon type={Icons.MaterialIcons} name="share" color={colors.text_grey} style={{ fontSize:25 }} />
          </View>
          <View style={{ width:'85%', alignItems:'flex-start', justifyContent:'center'}}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color:colors.text_grey, fontSize:18, fontFamily:regular }}>Refer & Earn</Text>
          </View>
        </TouchableOpacity>*/}
        {/* <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('Faq') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="help-outline" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.faqs}</Text>
            <View style={{ margin: 3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{strings.how_can_we_help_you}</Text>
          </View>
        </TouchableOpacity> */}
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('PrivacyPolicies') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="article" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.privacy_policies}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('AboutUs') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="info" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.about_us}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => { navigation.navigate('AdminChat') }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="chat" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.admin_chat}</Text>
            <View style={{ margin: 3 }} />
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 12, fontFamily: normal }}>{strings.contact_admin_for_emergency_purpose}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={1} onPress={() => { showDialog() }} style={{ flexDirection: 'row', width: '100%', margin: 15 }}>
          <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
            <Icon type={Icons.MaterialIcons} name="logout" color={colors.text_grey} style={{ fontSize: 25 }} />
          </View>
          <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
            <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.text_grey, fontSize: 18, fontFamily: regular }}>{strings.logout}</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
      <Dialog.Container visible={dialog_visible} contentStyle={{ backgroundColor: colors.theme_bg_three }}>
        <Dialog.Title style={{fontFamily: bold, color: colors.theme_fg_two, fontSize: f_s}}>{strings.confirm}</Dialog.Title>
        <Dialog.Description style={{ fontFamily: regular, color: colors.theme_fg_two, fontSize: f_s}}>
          {strings.do_you_want_to_logout}
        </Dialog.Description>
        <Dialog.Button style={{fontFamily: regular, color: colors.theme_fg_two, fontSize: f_s}} label={strings.yes} onPress={handleLogout} />
        <Dialog.Button style={{fontFamily: regular, color: colors.theme_fg_two, fontSize: f_s}} label={strings.no} onPress={handleCancel} />
      </Dialog.Container>
      <View Style={{ margin: 70 }} />
    </DrawerContentScrollView>
  );
}


function MyDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      initialRouteName="Dashboard"
      drawerStyle={{ width: 350, backgroundColor: colors.theme_fg_three }}
      screenOptions={{
        drawerStyle: {
          backgroundColor: colors.theme_fg_three,
          width: screenWidth,
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={Dashboard}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="MyRides"
        component={MyRides}
        options={{ headerShown: false }}
      />
      {/* <Drawer.Screen
        name="Faq"
        component={Faq}
        options={{ headerShown: false }}
      /> */}
      {/* <Drawer.Screen
        name="Wallet"
        component={Wallet}
        options={{ headerShown: false }}
      /> */}
       <Drawer.Screen
        name="Scheduling"
        component={Scheduling}
        options={{ headerShown: false }}
      /> 
      <Drawer.Screen
        name="Notifications"
        component={Notifications}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="PrivacyPolicies"
        component={PrivacyPolicies}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="AboutUs"
        component={AboutUs}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Refer"
        component={Refer}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="EmergencyContacts"
        component={EmergencyContacts}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Subscription"
        component={Subscription}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="AdminChat"
        component={AdminChat}
        options={{ headerShown: false }}
      />
      <Drawer.Screen
        name="Logout"
        component={Logout}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={({ route, navigation }) => ({
        ...TransitionPresets.SlideFromRightIOS,
      })} options={{ headerShown: false }}  >
        <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
        <Stack.Screen name="CheckPhone" component={CheckPhone} options={{ headerShown: false }} />
        <Stack.Screen name="Password" component={Password} options={{ headerShown: false }} />
        <Stack.Screen name="OTP" component={OTP} options={{ headerShown: false }} />
        <Stack.Screen name="CreateName" component={CreateName} options={{ headerShown: false }} />
        <Stack.Screen name="CreateEmail" component={CreateEmail} options={{ headerShown: false }} />
        <Stack.Screen name="CreatePassword" component={CreatePassword} options={{ headerShown: false }} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} options={{ headerShown: false }} />
        <Stack.Screen name="LocationEnable" component={LocationEnable} options={{ headerShown: false }} />
        <Stack.Screen name="Intro" component={Intro} options={{ headerShown: false }} />
        <Stack.Screen name="Forgot" component={Forgot} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={MyDrawer} options={{ headerShown: false }} />
        <Stack.Screen name="TripDetails" component={TripDetails} options={{ headerShown: false }} />
        <Stack.Screen name="Bill" component={Bill} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethod} options={{ headerShown: false }} />
        <Stack.Screen name="WriteRating" component={WriteRating} options={{ headerShown: false }} />
        <Stack.Screen name="Refer" component={Refer} options={{ headerShown: false }} />
        <Stack.Screen name="Terms" component={Terms} options={{ headerShown: false }} />
        <Stack.Screen name="ComplaintCategory" component={ComplaintCategory} options={{ headerShown: false }} />
        <Stack.Screen name="ComplaintSubCategory" component={ComplaintSubCategory} options={{ headerShown: false }} />
        <Stack.Screen name="FaqDetails" component={FaqDetails} options={{ headerShown: false }} />
        <Stack.Screen name="Promo" component={Promo} options={{ headerShown: false }} />
        <Stack.Screen name="EditFirstName" component={EditFirstName} options={{ headerShown: false }} />
        <Stack.Screen name="EditLastName" component={EditLastName} options={{ headerShown: false }} />
        <Stack.Screen name="EditEmail" component={EditEmail} options={{ headerShown: false }} />
        <Stack.Screen name="Rating" component={Rating} options={{ headerShown: false }} />
        <Stack.Screen name="NotificationDetails" component={NotificationDetails} options={{ headerShown: false }} />
        <Stack.Screen name="AddEmergencyContact" component={AddEmergencyContact} options={{ headerShown: false }} />
        <Stack.Screen name="Paypal" component={Paypal} options={{ headerShown: false }} />
        <Stack.Screen name="CreateComplaint" component={CreateComplaint} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={Chat} options={{ headerShown: false }} />
        <Stack.Screen name="ScrollTest" component={ScrollTest} options={{ headerShown: false }} />
        <Stack.Screen name="AppUpdate" component={AppUpdate} options={{ headerShown: false }} />
        <Stack.Screen name="temp" component={temp} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 16,
  },
  pickerFieldcontainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 5,
    height: 45,
    backgroundColor:colors.theme_bg_three,
  },
  textField: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    height: 45,
    color:colors.theme_fg_two,
    fontSize:14,
    backgroundColor:colors.theme_bg_three,
  },
})

function mapStateToProps(state) {
  return {
    first_name: state.register.first_name,
    last_name: state.register.last_name,
    email: state.register.email,
  };
}

const mapDispatchToProps = (dispatch) => ({
  updateEmail: (data) => dispatch(updateEmail(data)),
  updateFirstName: (data) => dispatch(updateFirstName(data)),
  updateLastName: (data) => dispatch(updateLastName(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
