import LocalizedStrings from 'react-native-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from "../languages/en.json";
import tl from "../languages/tl.json";
import ar from "../languages/ar.json";
import sp from "../languages/sp.json";
let strings = new LocalizedStrings({en:en,ar:ar});

export default strings;