import React, { Component } from 'react';
import { StyleSheet, View, Text, I18nManager, Image, TouchableOpacity} from 'react-native';
import { Container, Content, Icon, Title, Header, Body, Button, Form, Item, Input, Label, Picker,Toast } from 'native-base'


import * as Permissions from 'expo-permissions';
import * as Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { connect } from 'react-redux';
import { userLogin, profile ,updateProfile,logout ,tempAuth} from '../actions'

import Spinner from 'react-native-loading-spinner-overlay';
import {NavigationEvents} from "react-navigation";

import axios from "axios";
import CONST from "../consts";

class EditProfile extends Component {
  componentWillMount() {
    I18nManager.forceRTL(true)
  }

  constructor(props) {

    super(props);
    this.state = {
        spinner      : false,
        countries    : [],
        cities       : [],
        city_id      : '',
        country_id   : '',
        phone        : '',
        name         : '',
        image        : '',
        img          : '',
    };
     let us = this.props.user;
  }

  onFocus(){
    this.componentWillMount();
  }

  async componentWillMount() {

    I18nManager.forceRTL(true);

    this.setState({user_id :  this.props.auth.data.user.id });

    if(this.props.auth){

      if(this.props.user)
      {
          this.setState         ({ image          : this.props.user.avatar });
          this.setState         ({ phone          : this.props.user.phone });
          this.setState         ({ city_id        : this.props.user.city_id });
          this.setState         ({ country_id     : this.props.user.country_id });
          this.setState         ({ name           : this.props.user.name });
          axios({
            url       : CONST.url + 'selectedCities',
            method    : 'POST',
            data      : { country_id: this.props.user.country_id }
          }).then(response => {

            this.setState({
              cities    :  response.data.data,
              spinner   :  false
            });

          }).catch(err => {
            console.log(err);
          });

      }

    }else{
        this.props.navigation.navigate('login');
    }

    axios({
      url       : CONST.url + 'countries',
      method    : 'GET',
    }).then(response => {

      this.setState({
        countries     :  response.data.data,
        spinner       :  false
      });

    }).catch(err => {
      console.log(err);
    });


  }

  onValueChange(value) {

    this.setState({spinner :  true});

    this.setState({ country_id: value});

    setTimeout(()=>{

          axios({
            url       : CONST.url + 'selectedCities',
            method    : 'POST',
            data      : { country_id: this.state.country_id }
          }).then(response => {

            this.setState({
              cities    :  response.data.data,
              spinner   :  false
            });

          }).catch(err => {
            console.log(err);
          });

    },1500);

  }

  onValueChangeCity(value) {
    this.setState({
      city_id: value
    });
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  };

  _pickImage    = async () => {

    let result  = await ImagePicker.launchImageLibraryAsync({
      allowsEditing   : true,
      base64          : true,
      aspect          : [4, 3],
    });

      this.setState({img: result.base64});

      if (!result.cancelled) {
          this.setState({ image: result.uri });
      }

  };

async  Update_User(){

    const data = {
        user_id     : this.props.auth.data.user.id,
        phone       : this.state.phone,
        avatar      : this.state.img,
        name        : this.state.name ,
        country_id  : this.state.country_id,
        city_id     : this.state.city_id
    };

     this.props.updateProfile(data);

     this.setState({spinner : true});
     setTimeout(()=> {
      this.setState({spinner : false});
        this.props.navigation.navigate('profile');
     } , 3000);

  }


  static navigationOptions = () => ({
    header      : null,
    drawerLabel : ( <Text style={styles.textLabel}>تعديل حسابي</Text> ) ,
    drawerIcon  : ( <Icon style={styles.icon} type="SimpleLineIcons" name="home" /> )
  });

  render() {

    let { image } = this.state;

    const img       =
    <View style     = {{ justifyContent : 'center', alignItems : "center", alignSelf : "center", padding : 20, borderRadius : 10 }}>
      <Image style  = {{ width: 100, height: 100 }}  source={require('../../assets/loading.gif')}/>
    </View>

    return (
      <Container>

        <NavigationEvents onWillFocus={() => this.onFocus()} />

        <Spinner
        visible           = { this.state.spinner }
 />
        <Header style={styles.header}>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon style={styles.icons} type="Entypo" name='chevron-thin-right' />
          </Button>
          <Body style={styles.bodyText}>
            <Title style={styles.Title}>تعديل حسابي</Title>
          </Body>
        </Header>
        <Content contentContainerStyle={{ flexGrow: 1 , zIndex : -1 }} style={styles.contentView}>
            <View style={styles.bgImage}>
                <View style={styles.blockForm}>
                    <Form style={styles.formControl}>
                      <View style={styles.uploadImg}>
                        <View style={styles.imagePicker}>
                          <View style={styles.overLay}></View>
                          <Button onPress={this._pickImage} style={styles.clickOpen}>
                            <Icon style={styles.iconImage} active type="AntDesign" name='plus' />
                          </Button>
                          {image && <Image source={{ uri: image }} style={styles.imgePrive} />}
                        </View>
                      </View>

                      <Item floatingLabel style={styles.item}>
                        <Label style={styles.label}>اسم المستخدم</Label>
                        <Input style={styles.input} value={ this.state.name} onChangeText={(name) => this.setState({ name })} auto-capitalization={false}/>
                      </Item>

                      <Item floatingLabel style={styles.item}>
                        <Label style={styles.label}>رقم الجوال</Label>
                        <Input style={styles.input} value={ this.state.phone } onChangeText={(phone) => this.setState({ phone })} keyboardType={'number-pad'}/>
                      </Item>

                      <View style={styles.viewPiker}>
                    <Item style={styles.itemPiker} regular>
                            <Picker
                                iosHeader={'البلد'}
                                headerBackButtonText={'رجوع'}
                                mode="dropdown"
                                style={styles.Picker}
                                placeholderStyle={{ color: "#121212", writingDirection: 'rtl', width : '100%',fontFamily : 'CairoRegular', fontSize : 16 }}
                                selectedValue={this.state.country_id}
                                onValueChange={this.onValueChange.bind(this)}
                                textStyle={{ color: "#121212" , width : '100%', writingDirection: 'rtl',fontFamily : 'CairoRegular',paddingLeft : 10, paddingRight: 10 }}
                                placeholder="البلد"
                                itemTextStyle={{ color: '#121212',fontFamily : 'CairoRegular', writingDirection: 'rtl' }}>

                                {
                                    this.state.countries.map((country, i) => (
                                        <Picker.Item style={{color: "#121212", width : '100%',fontFamily : 'CairoRegular'}} key={i} label={country.name} value={country.id} />
                                    ))
                                }

                            </Picker>
                        </Item>
                        <Icon style={styles.iconPicker} type="AntDesign" name='down' />
                    </View>

                    <View style={styles.viewPiker}>
                        <Item style={styles.itemPiker} regular>
                            <Picker
                                iosHeader={'المنطقة'}
                                headerBackButtonText={'رجوع'}
                                mode="dropdown"
                                style={styles.Picker}
                                placeholderStyle={{ color: "#121212", writingDirection: 'rtl', width : '100%',fontFamily : 'CairoRegular', fontSize : 16 }}
                                selectedValue={this.state.city_id}
                                onValueChange={this.onValueChangeCity.bind(this)}
                                textStyle={{ color: "#121212" , width : '100%', writingDirection: 'rtl',fontFamily : 'CairoRegular',paddingLeft : 10, paddingRight: 10 }}
                                placeholder="المنطقة"
                                itemTextStyle={{ color: '#121212',fontFamily : 'CairoRegular', writingDirection: 'rtl' }}>
                                {
                                    this.state.cities.map((city, i) => (
                                        <Picker.Item style={{color: "#121212", width : '100%',fontFamily : 'CairoRegular'}} key={i} label={city.name} value={city.id} />
                                    ))
                                }
                            </Picker>
                        </Item>
                        <Icon style={styles.iconPicker} type="AntDesign" name='down' />
                    </View>


                      <TouchableOpacity style={styles.clickFunction} onPress={() => this.Update_User()}>
                          <Text style={styles.textFun}>تآكيد</Text>
                      </TouchableOpacity>

                    </Form>
                </View>
            </View>

        </Content>

      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header:{
    backgroundColor     : "#2272bd",
    borderBottomColor   : "#2272bd",
    paddingRight        : 0,
    paddingLeft         : 0,
    paddingTop          : 10,
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
    height : 90
  },
  bodyText : {
    alignItems          : 'flex-end',
  },
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
    paddingTop : 30,
    marginTop : 20
  },
  Title : {
    color               : "#fff",
    fontFamily          : "CairoRegular",
    textAlign           : "center",
    fontSize            : 17,
    backgroundColor     : "#195992",
    width               : 150,
    paddingTop          : 5,
    paddingBottom       : 5,
    borderBottomRightRadius  : 10,
    borderTopRightRadius     : 10,
  },
  text :{
    color               : "#a1a5ab",
    fontFamily          : "CairoRegular",
    fontSize            : 16,
    paddingHorizontal   : 10,
    marginBottom        : 15
  },
  textInfo : {
    color               : "#a1a5ab",
    fontFamily          : "CairoRegular",
    fontSize            : 16,
    textAlign           : "center"
  },
  textLabel : {
    color               : "#fff",
    fontFamily          : "CairoRegular",
    fontSize            : 18,
    marginVertical      : 8
  },
  bgDiv : {
    paddingRight        : 10,
    paddingLeft         : 10,
  },
  formControl : {
    padding             : 15,
    overflow            : "hidden",
  },
  blockForm : {
    zIndex              : 99,
    position            : "relative"
  },
  clickChoose : {
    backgroundColor     : "#fff",
    borderColor         : '#e9e8e8',
    borderWidth         : 1,
    borderRadius        : 5,
    marginVertical      : 5,
    padding             : 5,
  },
  textMore : {
    color               : "#2272bd",
    fontFamily          : "CairoRegular",
    fontSize            : 14,
  },
  item : {
    width               : "100%",
    marginLeft          : 0,
    marginRight         : 0,
    marginVertical      : 5,
    padding             : 0,
    borderBottomWidth   : 0,
      textAlign           : "right",

      position            : "relative"
  },
  label : {
    color               : 'black',
    borderWidth         : 0,
    padding             : 10,
    top                 : 0,
    fontFamily          : 'CairoRegular',
    textAlign           : "right",
    fontSize            : 14,
    // zIndex              : 9,
    backgroundColor     : '#ffffff',
    opacity             : 1,
    paddingTop          : 0,
    paddingBottom       : 0,
  },
  input : {

      borderColor         : '#e9e8e8',
    borderWidth         : 1,
    borderRadius        : 5,
    width               : "100%",
    color               : 'black',
    padding             : 5,
      textAlign           : "right",
    fontFamily          : 'CairoRegular',
    fontSize            : 14,
  },
  bgLiner:{
    borderRadius        : 5,
    width               : 170,
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
  },
  icon : {
    color               : "#FFF",
    fontSize            : 25,
    position            : "relative",
    left                : -7
  },
  icons : {
    color               : "#FFF",
    fontSize            : 25,
  },
  uploadImg :{
    position            : "relative",
    zIndex              : 999,
    marginBottom : 50
  },
  imagePicker : {
    alignItems            : 'center',
    justifyContent        : 'center',
    alignSelf             : 'center',
    margin                : 10,
    width                 : 110,
    height                : 110,
    borderRadius          : 5,
    position              : "relative",
    zIndex                : 999
  },
  overLay : {
    alignItems            : 'center',
    justifyContent        : 'center',
    alignSelf             : 'center',
    width                 : 160,
    height                : 140,
    borderWidth           : 1,
    borderColor           : "#DDD",
    borderRadius          : 5,
    backgroundColor       : "rgba(255, 255, 255, 0.6)",
    left                  : -31,
    top                   : -21,
    position              : "absolute",
    zIndex                : -1
  },
  clickOpen : {
    width                 : 160,
    height                : 140,
    alignItems            : 'center',
    justifyContent        : 'center',
    alignSelf             : 'center',
    borderRadius          : 5,
    backgroundColor       : "rgba(255, 255, 255, 0.6)",
    padding               : 0,
    overflow              : 'hidden',
    shadowColor           : "transparent",
    shadowOffset          : { width: 0,height: 0 },
    elevation             : 0,
    zIndex                : 999,
    position              : "relative",
  },
  iconImage : {
    color                 : "#DDD"
  },
  imgePrive : {
    position              : 'absolute',
    width                 : 160,
    height                : 140,
    alignItems            : 'center',
    justifyContent        : 'center',
    alignSelf             : 'center',
    borderRadius          : 5,
    borderWidth           : 1,
    borderColor           : "#DDD",
  },
  viewPiker : {
    position            : 'relative',
    top                 : 15,
    overflow            : "hidden",
    marginTop           : 10,
    marginBottom        : 5,
    alignItems            : 'center',
    justifyContent        : 'center',
    alignSelf             : 'center',
  },
  Picker : {
    width               : '100%',
    borderWidth         : 0,
    paddingLeft         : 0,
    fontSize            : 18,
    fontFamily          : 'CairoRegular',
    backgroundColor     : 'transparent',
    marginRight         : 0,
    borderRadius        : 10,
    writingDirection    : 'rtl',
    height              : 40,
  },
  itemPiker : {
    borderWidth         : 0,
    borderColor         : "#DDD" ,
    width               : '100%',
    position            : 'relative',
    fontSize            : 18,
    fontFamily          : 'CairoRegular',
    borderRadius        : 5,
  },
  iconPicker : {
    position            : 'absolute',
    right               : 5,
    color               : "#121212",
    fontSize            : 16
  },
  clickFunction : {
    backgroundColor     : "#2272bd",
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
    borderRadius        : 10,
    marginVertical      : 40,
    padding             : 5,
    width               : 120,
  },
  textFun : {
    color               : "#fff",
    fontFamily          : "CairoRegular",
    fontSize            : 16,
  }
});


const mapStateToProps = ({ auth ,profile }) => {
  return {
       auth       : auth.user,
       user       : profile.user,
       result     : profile.result,
       userId     : profile.user_id,
       Updated    : profile.update,
  };
};
export default connect(mapStateToProps, { profile,updateProfile,logout,tempAuth })(EditProfile);
