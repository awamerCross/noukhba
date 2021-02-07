import React, { Component } from 'react';
import { StyleSheet, Text, View,Image,TouchableOpacity, AsyncStorage,KeyboardAvoidingView,I18nManager, ActivityIndicator } from 'react-native';
import { Container, Content, Form, Item, Input, Label, Icon,Toast } from 'native-base'
import { connect } from 'react-redux';
import { userLogin, profile } from '../actions'
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { NavigationEvents } from "react-navigation";
import Spinner from 'react-native-loading-spinner-overlay';
import Constants from 'expo-constants';

class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
        phone       : '',
        password    : '',
        token       : '',
        spinner     : false,
        userId      : null,
    };
  }

  validate = () => {
    let isError = false;
    let msg = '';

    if (this.state.phone.length <= 0) {
        isError   = true;
        msg       = 'ادخل رقم الهاتف';
    }else if (this.state.password.length <= 0) {
        isError   = true;
        msg       = 'ادخل كلمة المرور';
    }
    if (msg != ''){
        Toast.show({
            text      : msg,
            type      : "danger",
            duration  : 3000,
            textStyle   : {
              color       : "white",
              fontFamily  : 'CairoRegular',
              textAlign   : 'center'
            }
        });
    }
    return isError;
  };

  onLoginPressed() {

    const err = this.validate();

    if (!err){
        this.setState({ spinner: true });
        const {phone, password, token} = this.state;
        this.props.userLogin({ phone, password, token }, this.props).then(() =>{
            this.setState({spinner: false});
        }).catch(() =>{
            this.setState({spinner: false});
        });
    }

  }

  async componentWillMount() {
    I18nManager.forceRTL(true)
    setTimeout(()=>{
        this.registerForPushNotificationsAsync();
    },6000);
  }
    async  registerForPushNotificationsAsync() {
        let token;
        // لان الاشعارات مش بتشتغل ع السيميولاتور
        if (Constants.isDevice) {
            const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                alert('Failed to get push token for push notification!');
                return;
            }
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log(token);
        } else {
            alert('Must use physical device for Push Notifications');
        }
        this.setState({token : token})
        AsyncStorage.setItem('deviceID', token);
        return token;
    }

  componentWillReceiveProps(newProps){

    if (newProps.auth !== null && newProps.auth.success == true){

      if (this.state.userId === null){
          this.setState({ userId: newProps.auth.data.user.id });
          this.props.profile(newProps.auth.data.user.id);
      }

      this.props.navigation.navigate('DrawerNavigator');
    }


    if (newProps.auth !== null) {
        Toast.show({
            text: newProps.auth.message,
            type: newProps.auth.success ? "success" : "danger",
            duration: 3000,
            textStyle   : {
              color       : "white",
              fontFamily  : 'CairoRegular',
              textAlign   : 'center'
            }
        });
    }

  }

  onFocus(){
    this.componentWillMount()
  }

  render() {

    const img       =
    <View style     = {{ justifyContent : 'center', alignItems : "center", alignSelf : "center", padding : 20, borderRadius : 10 }}>
      <Image style  = {{ width: 100, height: 100 }}  source={require('../../assets/loading.gif')}/>
    </View>

    return (
      <Container>

        <NavigationEvents onWillFocus={() => this.onFocus()} />

        <Content contentContainerStyle={{ flexGrow: 1 }} style={styles.contentView}>
            <TouchableOpacity onPress={()=>this.props.navigation.goBack()} style={{flex : 1 , margin : 10}}>
                <Icon name={'arrow-back'} style={{color : '#fff'}}/>
            </TouchableOpacity>
            <KeyboardAvoidingView behavior={'padding'} style={{ flex : 1 }}>
            <Image style={styles.logo} resizeMode={'stretch'} source={require('../../assets/logo-layer.png')}/>
            <View style={styles.bgImage}>
                {/*<Image style={styles.curve} source={require('../../assets/white_curve.png')}/>*/}
                <View style={styles.bgDiv}>
                  <Text style={styles.text}>تسجيل دخول</Text>
                  <Form style={styles.formControl}>
                    <Item floatingLabel style={styles.item}>
                      <Label style={styles.label}>رقم الجوال</Label>
                      <Input style={styles.input}  keyboardType={'number-pad'} placeholderTextColor="#bbb" onChangeText={(phone) => this.setState({phone})}  value={ this.state.mobile }/>
                    </Item>
                    <Item floatingLabel style={styles.item}>
                      <Label style={styles.label}>كلمة المرور</Label>
                      <Input autoCapitalize='none' value={ this.state.password } onChangeText={(password) => this.setState({password})} secureTextEntry style={styles.input}/>
                    </Item>

                    <TouchableOpacity onPress={!this.state.spinner ? () => this.onLoginPressed() : null} style={styles.touchBtn}>
                        {
                            this.state.spinner ?
                                <View style={{ padding : 7, alignItems : 'center', justifyContent : 'center', alignSelf : 'center' }}>
                                    <ActivityIndicator size={20} color={'#fff'} />
                                </View>
                                :
                                <Text style={[ styles.textBtn, { color: '#FFF' } ]}>دخول</Text>
                        }
                    </TouchableOpacity>

                    <Text onPress={() => this.props.navigation.navigate('forgetpassword')} style={styles.textFont}>نسيت كلمة السر ؟</Text>

                      <TouchableOpacity onPress={() => this.props.navigation.navigate('register')} style={styles.Register}>
                          <Text style={styles.textBtn}>
                              تسجيل
                          </Text>
                      </TouchableOpacity>

                  </Form>
                </View>
            </View>
        </KeyboardAvoidingView>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
    contentView : {
      backgroundColor     : '#2272bd',
    },
    bgImage : {
        flex                : 1,
        backgroundColor     : '#fff',
        borderTopRightRadius: 50,
        borderTopLeftRadius: 50,
        width : '95%',
        alignSelf:  'center',
        borderColor   : "#2272bd",
        paddingTop : 50
    },
    text : {
      color               : "#2272bd",
      position            : "relative",
      zIndex              : 99,
      fontFamily          : "CairoRegular",
      textAlign           : "center",
      fontSize            : 20
    },
    logo : {
      alignItems          : 'center',
      justifyContent      : 'center',
      alignSelf           : 'center',
        width : 140,
        height : 140,
        marginVertical:  40
    },
    bgDiv : {
        paddingRight        : 0,
        paddingLeft         : 0,
        flex                : 1,
        alignItems          : 'center',
        justifyContent      : 'center',
        alignSelf           : 'center',
    },
    formControl : {
      paddingRight        : 20,
      paddingLeft         : 20,
      flex                : 1,
      paddingTop          : 20,
    },
    icon : {
      color               : '#fff',
      fontSize            : 16
    },
    icons : {
      position            : "absolute",
      left                : 20,
      color               : "#FFF",
      fontSize            : 18,
      top                 : 12
    },
    item : {
      width               : "100%",
      marginLeft          : 0,
      marginRight         : 0,
      marginTop           : 15,
      padding             : 0,
      borderBottomWidth   : 0,
    },
    label : {
      width               : "95%",
      color               : '#363636',
      borderWidth         : 0,
      padding             : 10,
      top                 : 3,
      fontFamily          : 'CairoRegular',
        textAlign           : 'left',
      fontSize            : 14,
      // zIndex              : 9,
      backgroundColor     : '#ffffff',
      opacity             : 1,
      paddingTop          : 0,
      paddingBottom       : 0,
      alignItems          : 'center',
      justifyContent      : 'center',
      alignSelf           : 'center',

    },
    input : {
      borderColor         : '#e9e8e8',
      borderWidth         : 1,
      borderRadius        : 5,
      width               : "100%",
      color               : '#2272bd',
      padding             : 5,
      textAlign           : 'left',
    },
    bgLiner:{
      borderRadius        : 5,
      width               : 170,
      alignItems          : 'center',
      justifyContent      : 'center',
      alignSelf           : 'center',
    },
    touchBtn : {
      backgroundColor     : "#2272bd",
      borderRadius        : 10,
      width               : 170,
      alignItems          : 'center',
      justifyContent      : 'center',
      alignSelf           : 'center',
      margin              : 40
    },
    Register : {
      position            : 'relative',
      bottom              : 10,
      margin              : 0,
      borderBottomRightRadius : 0,
      borderTopRightRadius    : 0,
      borderRadius        : 10,
      width               : 160,
      marginVertical      : 30,
        alignItems          : 'center',
        justifyContent      : 'center',
        alignSelf           : 'center',
    },
    textBtn : {
      textAlign           : 'center',
      color               : '#025992',
      fontSize            : 16,
      padding             : 7,
      fontFamily          : 'CairoRegular'
    },
    textFont : {
      alignItems          : 'center',
      justifyContent      : 'center',
      alignSelf           : 'center',
      color               : '#bbb',
      fontSize            : 16,
      fontFamily          : 'CairoRegular'
    }
});



const mapStateToProps = ({ auth, profile }) => {
  return {
      loading   : auth.loading,
      auth      : auth.user,
      user      : profile.user,
  };
};
export default connect(mapStateToProps, { userLogin, profile })(Login);
