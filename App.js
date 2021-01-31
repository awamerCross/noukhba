import React, { Component } from 'react';
import { StyleSheet, View, AsyncStorage,Platform } from 'react-native';

import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import Routes from './src/RootNavigator'
import './ReactotronConfig';
import { Provider } from 'react-redux';
import { store, persistedStore } from './src/store';
import { PersistGate } from 'redux-persist/integration/react';
import { Root } from 'native-base'
import './ReactotronConfig';
import * as Permissions from 'expo-permissions';
import * as Notifications from 'expo-notifications'
import Constants from "expo-constants";
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default class App extends Component {
/*
*   Keystore password: 60e7fa62339a46c8908a7dce32a1800b
  Key alias:         QGRldnRhaGEvQUwtTm91a2hiYQ==
  Key password:      f5d0c39ee48149d9aa2b2df7f61aa684
* */
  constructor(props){
    super(props);
    this.loadFontAsync();
    this.state = {
      fontLoaded: false
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'Roboto': require('native-base/Fonts/Roboto.ttf'),
      'Roboto_medium': require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });

    // AsyncStorage.clear();
    I18nManager.forceRTL(true)
  }

   componentWillMount() {


     if (Platform.OS === 'android') {
       Notifications.setNotificationChannelAsync('default', {
         name: 'default',
         importance: Notifications.AndroidImportance.MAX,
         vibrationPattern: [0, 250, 250, 250],
         lightColor: '#FF231F7C',
       });
     }
   }

  async loadFontAsync() { try 
    {
      await Font.loadAsync({ CairoRegular: require("./assets/fonts/Cairo-Regular.ttf") });
      await Font.loadAsync({ CairoBold: require("./assets/fonts/Cairo-Bold.ttf") });
      this.setState({ fontLoaded: true });
    } catch (e) {
      console.log(e);
    }
  }
  
  render() {
    if (!this.state.fontLoaded) {
      return <View />;
    }
    return (
      <Provider store={store}>
        <PersistGate persistor={persistedStore}>
          <Root>
            <Routes/>
          </Root>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex            : 1,
    fontFamily      : 'CairoRegular'
  },
});

