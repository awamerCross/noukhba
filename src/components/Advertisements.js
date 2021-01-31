import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity,ScrollView,FlatList,Platform } from 'react-native';
import { Container, Content, Icon, Title, Header, Left, Body, Right, Button, Picker, Item,Toast, } from 'native-base'

import axios from "axios";
import CONST from "../consts";

import { connect } from 'react-redux';
import { profile } from '../actions'

import * as Permissions from 'expo-permissions';
import * as Location    from 'expo-location';

import {NavigationEvents} from "react-navigation";
import { Video } from 'expo-av'

import Tabs from './Tabs';
import * as Animatable from 'react-native-animatable';
import Spinner from 'react-native-loading-spinner-overlay';
const isIOS = Platform.OS === 'ios';
let focusListener;

class Advertisements extends Component {


  constructor(props) {

    super(props);
    this.state = {
        selected           : null,
        blocks             : [],
        cities             : [],
        countries          : [],
        subCategories      : [],
        colors             : [],
        favourites         : [],
        country_id         : null,
        city_id            : null,
        color_id           : null,
        sub_category_id    : null,
        is_favourite       : 0,
        count              : 0,
        spinner            : false,
        latitude           : null,
        longitude          : null,
    };

  }

  componentDidMount(){
  }
  componentWillMount() {
    this.setState({spinner :  true , colors  : [] ,subCategories :[] });
    axios({
      url       : CONST.url + 'advertisements',
      method    : 'POST',
      data      : {
        category_id     : this.props.navigation.state.params.id,
        user_id         : (this.props.auth) ? this.props.auth.data.user.id : null,
      }
    }).then(response => {
        this.setState({
            blocks            :  response.data.data.advertisements,
            countries         :  response.data.data.countries,
        });


      if(response.data.data.advertisements.length > 0){
        if(this.props.navigation.state.params.id !== undefined && this.props.navigation.state.params.id !== null)
        {
            this.setState({
                 colors        :  response.data.data.colors,
                 subCategories :  response.data.data.subCategories,
            });
        }
      }
      let favorite = response.data.data.advertisements.favorite;
      if(favorite === 0){
          this.setState({is_favourite: true});
      }else{
          this.setState({is_favourite: false});
      }
    }).then(() =>{
      this.setState({spinner :  false});
    })

  }

  onFocus(){
      this.componentWillMount();
  }

  onValueChange(value) {

      this.setState({
          country_id: value,
          city_id : null
      });

      this.setState({spinner :  false});


    setTimeout(() =>{
        this.getCities()
    }, 300);
  }


  getCities(){
    axios({
      url       : CONST.url + 'selectedCities',
      method    : 'POST',
      data      : {
         country_id    : this.state.country_id
      }
    }).then(response => {

      this.setState({
        cities    : response.data.data,
        spinner   : false
      });

      this.filter();

    }).catch(err => {
      console.log(err);
      this.setState({spinner :  false});
      Toast.show({
        text        : 'حدث خطآ ما .. يرجي المحاوله مره آخري',
        duration    : 2000,
        type        : "danger",
        textStyle   : {
          color       : "white",
          fontFamily  : 'CairoRegular',
          textAlign   : 'center'
        }
      });
    });
  }

  onValueChangeCity(value) {

    this.setState({city_id: value});

    setTimeout(()=>{

      if(value !== 'null'){
        this.filter();
        this.setState({spinner :  false});
      }

    },1000);

  }

  filter(){

    this.setState({spinner :  true});

      axios({
        url       : CONST.url + 'advertisementFilteration',
        method    : 'POST',
        data      : {
          color_id            : this.state.color_id,
          sub_category_id     : this.state.sub_category_id,
          country_id          : this.state.country_id,
          city_id             : this.state.city_id,
          latitude            : this.state.latitude,
          longitude           : this.state.longitude,
          category_id         : this.props.navigation.state.params.id,
          //text                : 'search',
        }
      }).then(response => {

          let  data_adv = response.data.data.advertisements;
          this.setState({
              blocks  :  response.data.data.advertisements,
              spinner :  false
          });

        if(data_adv.length <= 0){

          Toast.show({
            text : 'لا توجد إعلانات',
            duration      : 2000,
            type          : "danger",
            textStyle       : {
                color         : "white",
                fontFamily    : 'CairoRegular',
                textAlign     : 'center'
            }
          });



        }else{
          this.setState({
            blocks  :  data_adv,
            spinner :  false
          });
        }

        this.setState({spinner : false});

      }).catch(err => {
        this.setState({spinner : false});
          Toast.show({
              text        : 'حدث خطآ ما .. يرجي المحاوله مره آخري',
              duration    : 2000,
              type        : "danger",
              textStyle   : {
                  color       : "white",
                  fontFamily  : 'CairoRegular',
                  textAlign   : 'center'
              }
          });
      });

  }

  toggleFavorite(item){

    this.setState({spinner :  true});

    axios({
      url       : CONST.url + 'addToFavorite',
      method    : 'POST',
      data      : {
        advertisement_id    : item.id,
        user_id             : (this.props.auth)?this.props.auth.data.user.id:null,
      }
    }).then(response => {

      const id = this._keyExtractor(item);

      this.setState(({ favourites }) => ({

          favourites: this.isFavorite(item) ? favourites.filter(a => a !== id) : [...favourites, id]

      }));

      Toast.show({ text:
        response.data.message,
        duration    : 2000,
        type        : "danger",
        textStyle   : {
          color         : "white",
          fontFamily    : 'CairoRegular' ,
          textAlign     : 'center'
        }
      });

      this.setState({spinner : false});

    }).catch(err => {

        this.setState({spinner :  false});
        Toast.show({
          text          : response.data.message,
          duration      : 2000,
          type          : "warning",
          textStyle     : {
              color       : "white",
              fontFamily  : 'CairoRegular',
              textAlign   : 'center'
          }
        });
    });

  }

  isFavorite = item => {
    const id = this._keyExtractor(item);
    return this.state.favourites.includes(id);
  };

  _getLocation = async () => {

    this.setState({spinner :  true});

    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    return await Location.getCurrentPositionAsync({
      enableHighAccuracy    : false,
      maximumAge            : 15000
    }).then((position) => {
        this.setState({spinner :  false});
        this.setState({'longitude': position.coords.longitude});
        this.setState({'latitude': position.coords.latitude});
        this.filter();
    }).catch(err => {
      this.setState({spinner :  false});
      Toast.show({
            text : 'صلاحيات تحديد موقعك الحالي ملغاه',
            duration      : 2000,
            type          : "danger",
            textStyle       : {
                color         : "white",
                fontFamily    : 'CairoRegular',
                textAlign     : 'center'
            }
        });
    });

  };


  _keyExtractor = (item, index) => item.id;

  _renderItem = ({item ,key}) => {
      return(

          <View style={styles.blockUp} key={key}>
              {
                  <Animatable.View animation="fadeInUp" easing="ease-out" delay={300}>
                      <TouchableOpacity onPress={() => this.props.navigation.navigate('detailsadv', { id: item.id , video : item.video})}>
                          <View style={styles.blockItem}>

                              <View style={styles.overLay}></View>
                              <View style={styles.blockImg}>
                                  {
                                      (this.props.auth)
                                          ?
                                          <TouchableOpacity style={styles.clickFav} onPress={()=>{this.toggleFavorite(item)}}>
                                              <Icon style={[styles.iconFun , styles.iconRed]} type="MaterialIcons" name={this.isFavorite(item) ? 'favorite' : 'favorite-border'}/>
                                          </TouchableOpacity>
                                          :

                                          <View></View>
                                  }

                                  {
                                      (item.image !== '')
                                          ?

                                          <Image style={styles.Img} source={{ uri: item.image }}/>

                                          :
                                          <Video
                                              source          = {{ uri: item.video }}
                                              resizeMode      = " cover"
                                              style           = { styles.Img }
                                              shouldPlay      = { false }
                                              isLooping       = { false }
                                          />
                                  }

                              </View>
                              <View style={styles.blockInfo}>
                                  <View style={styles.view}>
                                      <Text style={styles.textN} numberOfLines={1} ellipsizeMode='tail'>{ item.title }</Text>
                                  </View>
                                  <View style={styles.view}>
                                      <Icon style={styles.iconN} type="AntDesign" name='user' />
                                      <Text style={[styles.textN,{fontSize:15 }]} numberOfLines={1} ellipsizeMode='tail'>{ item.user_name }</Text>
                                  </View>
                                  <View style={styles.viewN}>
                                      <View style={styles.view}>
                                          <Icon style={styles.iconN} type="MaterialCommunityIcons" name='map-marker-outline' />
                                          <Text style={styles.textN}>{ item.city }</Text>
                                      </View>
                                      <Text style={styles.textN}>{ item.date }</Text>
                                  </View>
                              </View>
                          </View>
                      </TouchableOpacity>
                  </Animatable.View>

              }
          </View>

      )
  };

  static navigationOptions = () => ({
    drawerLabel : () => null,
  });

  render() {

    const img       =
    <View style     = {{ justifyContent : 'center', alignItems : "center", alignSelf : "center", padding : 20, borderRadius : 10 }}>
      <Image style  = {{ width: 100, height: 100 }}  source={require('../../assets/loading.gif')}/>
    </View>

    return (
      <Container>

      <NavigationEvents onWillFocus={() => this.onFocus()} />

      <Spinner visible           = { this.state.spinner }/>
        <Header style={styles.header}>
          <Left>
            <Button transparent onPress={() => this.props.navigation.openDrawer()}>
              <Icon style={styles.icons} type="Feather" name='align-right' />
            </Button>
          </Left>
          <Body>
            <Title style={styles.text}>الآعلانات</Title>
          </Body>
          <Right>
            <Button transparent onPress={() => {this.props.auth ? this.props.navigation.navigate('notification') : this.props.navigation.navigate('login')}}>
              <Icon style={styles.icons} type="MaterialCommunityIcons" name='bell-outline' />
            </Button>
          </Right>
        </Header>
        <ScrollView   ref='_scrollView'
                      onContentSizeChange={() => { this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true}); }}
                      contentContainerStyle={{ flexGrow: 1 }} style={styles.contentView}  >
        <View style={styles.bgImage}>
            <View style={styles.bgDiv}>

            {
                (this.state.subCategories.length !== 0)

                ?
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={[styles.scroll , styles.scrollRight]}>

                        <Button  style={[styles.BTN , styles.Active]} onPress={()=> {
                          this.setState({
                               sub_category_id       : null,
                               color_id              : null,
                               country_id            : null,
                               latitude              : null,
                               longitude             : null,
                               city_id               : null,
                          });


                          setTimeout(()=>{
                            this.filter()
                          },300)
                        }}>
                            <Text style={[styles.TextRights , styles.textActive]}> الكل </Text>
                        </Button>
                        {
                          this.state.subCategories.map((sub, i) => (
                              <Button key={i} style={[styles.BTN , styles.Active]} onPress={()=>  {
                                this.setState({
                                    sub_category_id : sub.id
                                });

                                setTimeout(()=>{
                                  this.filter();
                                },300)
                              }}>
                                  <Text style={[styles.TextRights , styles.textActive]}>{ sub.name }</Text>
                              </Button>
                          ))
                        }

                    </ScrollView>
                :
                <View/>
            }

            {
                (this.state.colors.length !== 0)

                ?
                    <ScrollView showsHorizontalScrollIndicator={false} horizontal={true} style={[styles.scroll , styles.scrollLeft]}>
                        <Button  style={[styles.BTN , styles.Active]} onPress={()=> {
                            this.setState({
                                sub_category_id       : null,
                                color_id              : null,
                                country_id            : null,
                                latitude              : null,
                                longitude             : null,
                                city_id               : null,
                            });

                            setTimeout(()=>{
                                this.filter()
                            },300)
                        }}>
                            <Text style={[styles.TextRight , styles.textActive,{fontSize: 15,color :'#fff'}]}> الكل </Text>
                        </Button>
                        {
                          this.state.colors.map((color, i) => (
                              <Button key={i} style={[styles.BTN , styles.Active]} onPress={()=>  {
                                  this.setState({
                                      color_id : color.id
                                  });

                                  setTimeout(()=>{
                                      this.filter();
                                  },300)
                              }}>
                                  <Text style={[styles.TextLeft , styles.textActive,{fontSize: 15,color :'#fff'}]}>{ color.name }</Text>
                              </Button>
                          ))
                        }

                    </ScrollView>
                :
                <View/>
            }

                <View style={styles.filter}>

                <View style={[styles.viewPiker,{color:'#FFFFFF'}]}>
                      <Item style={styles.itemPiker} regular>
                          <Picker
                              iosHeader={'البلد'}
                              headerBackButtonText={'رجوع'}
                              mode="dropdown"
                              style={styles.Picker}
                              placeholderStyle={{ color: "#2700ff", writingDirection: 'rtl', width : '100%',fontFamily : 'CairoRegular', fontSize : 14 }}
                              selectedValue={this.state.country_id}
                              onValueChange={this.onValueChange.bind(this)}
                              textStyle={{ color: "#fff",fontFamily : 'CairoRegular', writingDirection: 'rtl' }}
                              placeholder="البلد"
                              itemTextStyle={{ color: '#2700ff',fontFamily : 'CairoRegular', writingDirection: 'rtl' }}>
                              <Picker.Item style={[styles.itemPicker,{color:'black'}]} label='البلد' value={null} />

                              {
                                  this.state.countries.map((country, i) => (
                                      <Picker.Item style={[styles.itemPicker,{color:'black'}]} key={i} label={country.name} value={country.id} />
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
                              placeholderStyle={{ color: "#2700ff", writingDirection: 'rtl', width : '100%',fontFamily : 'CairoRegular', fontSize : 14 }}
                              selectedValue={this.state.city_id}
                              onValueChange={this.onValueChangeCity.bind(this)}
                              textStyle={{ color: "#FFF",fontFamily : 'CairoRegular', writingDirection: 'rtl' }}
                              placeholder="المنطقة"
                              itemTextStyle={{ color: '#2700ff',fontFamily : 'CairoRegular', writingDirection: 'rtl' }}>

                              <Picker.Item style={styles.itemPicker} label='المنطقة' value={null} />
                              {
                                  this.state.cities.map((city, i) => (
                                      <Picker.Item style={styles.itemPicker} key={i} label={city.name} value={city.id} />
                                  ))
                              }

                          </Picker>
                      </Item>
                      <Icon style={styles.iconPicker} type="AntDesign" name='down' />
                  </View>

                    <TouchableOpacity style={styles.clickFunction} onPress={()=>  this._getLocation()}>
                        <Text style={styles.textFun}>الآقرب</Text>
                        <Icon style={styles.iconFun} type="MaterialCommunityIcons" name='map-marker-outline' />
                    </TouchableOpacity>

                </View>

                <FlatList
                    ref="listRef"
                    data={ this.state.blocks}
                    keyExtractor={ this._keyExtractor }
                    onEndReachedThreshold={isIOS ? .01 : 1}
                    extraData={this.state.favourites}
                    renderItem={ this._renderItem }
                    numColumns = { 1 }
                />

            </View>
        </View>
        </ScrollView>


        <Tabs routeName="adv"  navigation={this.props.navigation}/>

      </Container>
    );
  }

}

const styles = StyleSheet.create({
  header:{
    backgroundColor     : "#2272bd",
    borderBottomColor   : "#2272bd",
    paddingTop          : 10,
      height : 90
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
      marginTop:  20
  },
  text : {
    color               : "#fff",
    position            : "relative",
    zIndex              : 99,
    fontFamily          : "CairoRegular",
    textAlign           : "center",
    fontSize            : 22,
  },
  bgDiv : {
    paddingRight        : 10,
    paddingLeft         : 10,
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
  filter : {
    flexDirection       : "row",
    justifyContent      : "space-between",
    marginBottom        : 20,
      top : -10
  },
  viewPiker : {
    position            : 'relative',
    marginTop           : 5,
    marginBottom        : 5,
    flexBasis           : "33%",
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
    backgroundColor     : "#025992",
    borderRadius        : 5,
  },
  Picker : {
    width               : '100%',
    backgroundColor     : 'transparent',
    borderWidth         : 0,
    paddingLeft         : 0,
    marginRight         : 0,
    borderRadius        : 10,
    height              : 40,
  },
  itemPiker : {
    borderWidth         : 0,
    borderColor         : '#FFF',
    width               : '100%',
    position            : 'relative',
    fontSize            : 18,
    fontFamily          : 'CairoRegular',
    borderRadius        : 5,
    borderLeftWidth     : 0,
    borderBottomWidth   : 0,
    borderTopWidth      : 0,
    borderRightWidth    : 0,
    color               : "black"
  },
  iconPicker : {
    position            : 'absolute',
    right               : 5,
    color               : "#fff",
    fontSize            : 16
  },
  clickFunction : {
    backgroundColor     : "#025992",
    alignItems          : 'center',
    justifyContent      : 'space-between',
    alignSelf           : 'center',
    borderRadius        : 5,
    padding             : 8,
    flexBasis           : "33%",
    flexDirection       : "row"
  },
  textFun : {
    color               : "#FFF",
    fontFamily          : "CairoRegular",
    fontSize            : 14,
  },
  iconFun : {
    color               : "#FFF",
    fontSize            : 16,
  },
  iconRed : {
    color               : "#F00"
  },
  blockItem : {
    position            : "relative",
    flexDirection       : "row",
    justifyContent      : "space-between",
    alignItems          : "center",
    borderRadius        : 5,
    backgroundColor     : "rgba(255, 255, 255, 0.6)",
    borderWidth         : 1,
    borderColor         : "#DDD",
    padding             : 10,
    marginVertical      : 10
  },
  overLay : {
    width                 : '107%',
    height                : 100,
    borderWidth           : 1,
    borderColor           : "#DDD",
    borderRadius          : 5,
    backgroundColor       : "rgba(255, 255, 255, 0.6)",
    left                  : -7,
    top                   : -7,
    position              : "absolute",
    zIndex                : -1,
  },
  itemPicker : {
    color                 : "#FFF",
    fontFamily            : "CairoRegular",
    fontSize              : 14,
  },
  blockImg : {
    flexBasis             : "30%",
    position              : "relative",
    overflow              : "hidden"
  },
  clickFav : {
    position              : "absolute",
    left                  : 0,
    top                   : 3,
    backgroundColor       : "rgba(255, 255, 255, 0.7)",
    padding               : 10,
    borderTopRightRadius   : 5,
    borderBottomRightRadius: 5,
    zIndex                : 9
  },
  Img : {
    width                 : "100%",
    height                : 70,
    borderRadius          : 5,
    resizeMode            : 'contain'
  },
  blockInfo : {
    flexBasis             : "70%",
    paddingHorizontal     : 10
  },
  view : {
    alignSelf             : 'flex-start',
    flexDirection         : "row",
    alignItems            : "center"
  },
  textN : {
    color                 : "black",
    fontFamily            : "CairoRegular",
    fontSize              : 14,
  },
  iconN : {
    color                 : "#4c4640",
    fontSize              : 12,
  },
  viewN : {
    flexDirection         : "row",
    justifyContent        : "space-between",
    alignItems            : "center"
  },
  scroll: {
    flexDirection         : 'row',
    borderWidth           : 1,
    borderStyle           : 'solid',
    borderColor           : '#DDD',
    marginBottom          : 10,
    width                 : "100%",
    overflow              : "hidden",
    backgroundColor       : "rgba(255, 255, 255, 0.4)",
  },
  scrollRight : {
    position              : "relative",
    left                  : 10,
    borderBottomLeftRadius  : 0,
    borderTopLeftRadius     : 0,
  },
  scrollLeft : {
    position              : "relative",
    right                 : 10,
    borderBottomRightRadius  : 0,
    borderTopRightRadius     : 0,
    backgroundColor         : "#2272bd",
  },
  Active : {
    borderTopColor        : "#121212",
    borderTopWidth        : 1
  },
  textActive : {
    color                 : "#121212",
      fontSize : 18
  },
  TextRight: {
    color                 : '#2272bd',
    paddingHorizontal     : 15,
    fontFamily            : 'CairoRegular',
     fontSize : 18
  },
  TextRights: {
    color                 : '#2272bd',
    paddingHorizontal     : 15,
    fontFamily            : 'CairoRegular',
   },
  TextLeft : {
    color                 : '#fff',
    paddingHorizontal     : 15,
    fontFamily            : 'CairoRegular'
  },
  BTN : {
    backgroundColor       : "transparent",
    shadowColor           : "transparent",
    shadowOffset          : { width: 0,height: 0 },
    elevation             : 0,
    borderRadius          : 0
  },
});


const mapStateToProps = ({ auth, profile }) => {
  return {
      auth: auth.user,
      user: profile.user,
  };
};
export default connect(mapStateToProps, { profile  })(Advertisements);
