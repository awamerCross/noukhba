import React, { Component } from 'react';
import { StyleSheet, Text, View,Image,TouchableOpacity,KeyboardAvoidingView, I18nManager } from 'react-native';
import {
    Container,
    Content,
    Icon,
    Title,
    Header,
    Body,
    Button,
    CheckBox,
    Form,
    Item,
    Input,
    Label,
    Toast,
    Textarea
} from 'native-base'

import axios from "axios";
import CONST from "../consts";

import Spinner from 'react-native-loading-spinner-overlay';

import { connect } from 'react-redux';
import { userLogin, profile } from '../actions'
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import Modal from "react-native-modal";

class BankTransfer extends Component {

  constructor(props) {
    super(props);
    this.state = {
      spinner               : false,
      isModal               : false,
      id                    : this.props.navigation.getParam('id'),
      name                  : '',
      account_number        : '',
      iban_number           : '',
      account_name          : '',
      image                 : null,
      price                 : 0,
      is_image              : '',
      is_bank_name          : '',
      is_user_name          : '',
      is_account_number     : '',
      is_ammount            : 0
    };
  }

  async componentWillMount() {

    I18nManager.forceRTL(true);

    this.setState({spinner :  true});

    axios({
        url     : CONST.url + 'getSelectedBank',
        method  : 'POST',
        data      : {
          bank_id    : this.state.id,
        }
    }).then(response => {

      this.setState({
        name                  :  response.data.data.name,
        account_number        :  response.data.data.account_number,
        iban_number           :  response.data.data.iban_number,
        account_name          :  response.data.data.account_name,
        image                 :  response.data.data.is_image,
        spinner               :  false
      });

    }).catch(err => {
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
    }).then(() =>{
      this.setState({spinner :  false});
    })
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      aspect: [4, 3],
    });

    if (!result.cancelled) {
      this.setState({ image: result.uri });
    }
  };

  sentTransfer(){

    this.setState({spinner :  true});

      axios({
        url       : CONST.url + 'addTransfer',
        method    : 'POST',
        data      : {
          bank_id                     : this.state.id,
          bank_name                   : this.state.is_user_name,
          user_name                   : this.state.is_user_name,
          user_account_number         : this.state.is_account_number,
          ammount                     : this.state.is_ammount,
          image                       : this.state.image
        }
      }).then(response => {

        this.setState({spinner :  false});

        Toast.show({
          text        : response.data.message,
          duration    : 2000,
          type        : response.data.success === true ? "success" : "danger",
          textStyle   : {
            color       : "white",
            fontFamily  : 'CairoRegular',
            textAlign   : 'center'
          }
        });

        if(response.data.success === true){
          this.props.navigation.navigate('commission');
        }

      }).catch(err => {
        console.log(err);
        this.setState({spinner :  false});
        Toast.show({
            text        : 'يوجد خطأ ما الرجاء المحاولة مرة اخري',
            type        : "danger",
            duration    : 3000,
            textStyle   : {
                color       : "white",
                fontFamily  : 'CairoRegular',
                textAlign   : 'center'
            }
        });
      });

  }

  static navigationOptions = () => ({
    drawerLabel : () => null,
  });
    modal = () => {
        this.setState({ isModal: !this.state.isModal });
    };
  render() {


    let { image } = this.state;

    const img       =
    <View style     = {{ justifyContent : 'center', alignItems : "center", alignSelf : "center", padding : 20, borderRadius : 10 }}>
      <Image style  = {{ width: 100, height: 100 }}  source={require('../../assets/loading.gif')}/>
    </View>

    return (
      <Container>

        <Spinner
        visible           = { this.state.spinner }
/>
        <Header style={styles.header}>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon style={styles.icons} type="Entypo" name='chevron-thin-right' />
          </Button>
          <Body style={styles.bodyText}>
            <Title style={styles.Title}>تحويل بنكي</Title>
          </Body>
        </Header>
        <Content contentContainerStyle={{ flexGrow: 1 }} style={styles.contentView}>
            <KeyboardAvoidingView behavior={'padding'} style={{ flex : 1 }}>
            <View style={styles.bgImage}>
                <View style={styles.blockAbout}>
                    <View style={styles.blockUp}>
                        <CheckBox
                            style={styles.checkBox}
                            checked={true}
                        />
                        <View style={styles.blockChick}>
                            <View style={styles.imgBank}>
                                <Image style={styles.Bank} source={{ uri: this.state.is_image }} resizeMode={'cover'}/>
                            </View>
                            <View>
                                <View style={styles.blockInfo}>
                                    <Text style={styles.nameBank}>البنك : </Text>
                                    <Text style={styles.bankInfo}>{ this.state.name }</Text>
                                </View>
                                <View style={styles.blockInfo}>
                                    <Text style={styles.nameBank}>رقم الحساب : </Text>
                                    <Text style={styles.bankInfo}>{ this.state.account_number }</Text>
                                </View>
                                <View style={styles.blockInfo}>
                                    <Text style={styles.nameBank}>اسم الحساب : </Text>
                                    <Text style={styles.bankInfo}>{ this.state.account_name }</Text>
                                </View>
                                <View style={styles.blockInfo}>
                                    <Text style={styles.nameBank}> : IBAN</Text>
                                    <Text style={styles.bankInfo}>{ this.state.iban_number }</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={{flex : 1 , justifyContent:'center' , alignItems:'center'}} onPress={()=> {this.modal()}}>
                        <Text style={[styles.text ,{color : '#F00' , fontSize:20,textDecorationLine: 'underline',}]}>إضغط هنا لحساب العمولة</Text>
                    </TouchableOpacity>
                    <Form style={styles.formControl}>
                        <Item floatingLabel style={styles.item}>
                            <Label style={styles.label}>اسم البنك المحول له</Label>
                            <Input style={styles.input} onChangeText={(is_bank_name) => this.setState({ is_bank_name })} auto-capitalization={false}/>
                        </Item>
                        <Item floatingLabel style={styles.item}>
                            <Label style={styles.label}>اسم صاحب الحساب</Label>
                            <Input style={styles.input} />
                            <Input style={styles.input} onChangeText={(is_user_name) => this.setState({ is_user_name })} auto-capitalization={false}/>
                        </Item>
                        <Item floatingLabel style={styles.item}>
                            <Label style={styles.label}>رقم الحساب</Label>
                            <Input style={styles.input} />
                            <Input style={styles.input} onChangeText={(is_account_number) => this.setState({ is_account_number })} keyboardType={'number-pad'}/>
                        </Item>
                        <Item floatingLabel style={styles.item}>
                            <Label style={styles.label}>المبلغ المراد سداده</Label>
                            <Input style={styles.input} />
                            <Input style={styles.input} onChangeText={(is_ammount) => this.setState({ is_ammount })} value ={this.state.is_ammount} keyboardType={'number-pad'}/>
                        </Item>
                        <View>
                          <View style={styles.imagePicker}>
                            <Button transparent onPress={this._pickImage} style={styles.clickOpen}>
                              <Icon style={styles.iconImage} active type="AntDesign" name='plus' />
                              <Text style={styles.textImg}>صوره إيصال التحويل</Text>
                            </Button>
                            {image && <Image resizeMode="cover" source={{ uri: image }} style={styles.imgePrive}/>}
                          </View>
                        </View>
                    </Form>

                    <TouchableOpacity style={styles.clickMore} onPress={() => this.sentTransfer()}>
                        <Text style={styles.textMore}>إستكمال</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </KeyboardAvoidingView>

            <Modal
                isVisible={this.state.isModal}
                hasBackdrop={false}
                avoidKeyboard={true}
                animationIn={'slideInUp'}
                animationOut={'slideOutDown'}
                animationInTiming={1000}
                animationOutTiming={1000}
                backdropTransitionInTiming={1000}
                backdropTransitionOutTiming={1000}
                swipeDirection="bottom"
                onBackdropPress={() => this.setState({ isVisible: false })}>

                <View style={styles.contentModel}>

                    <Form style={styles.formControl}>
                        <Text style={{textAlign:'right', alignSelf:'flex-start', color :'#fff' , fontSize:20}}>إذا تم البيع بسعر :</Text>
                        <Item floatingLabel style={[styles.item , styles.itemModel]}>
                            <Label style={[styles.label , styles.labelModel]}>السعر</Label>
                            <Input    keyboardType='numeric'
                                      style={[styles.input , styles.inputModel]} onChangeText={(price) => this.setState({ is_ammount : this.toEnglishDigits(price) })} auto-capitalization={false}/>
                        </Item>
                        <Text style={{textAlign:'center', alignSelf:'center', color :'#fff' , fontSize:24,marginVertical: 30}}>فإن المبلغ المستحق دفعه هو  </Text>
                        <Text style={{textAlign:'center', alignSelf:'center', color :'#fff' , fontSize:30}}>{ this.state.is_ammount } ريال</Text>
                    </Form>

                        <View style={styles.blockFunction}>
                            <TouchableOpacity style={styles.clickFunction} onPress={() => this.setState({isModal : !this.state.isModal})}>
                                <Text style={styles.textFun}>تأكيد</Text>
                            </TouchableOpacity>

                        </View>

                    </View>


            </Modal>
        </Content>

      </Container>
    );
  }

      toEnglishDigits(str) {

        // convert persian digits [۰۱۲۳۴۵۶۷۸۹]
        var e = '۰'.charCodeAt(0);
        str = str.replace(/[۰-۹]/g, function(t) {
            return t.charCodeAt(0) - e;
        });

        // convert arabic indic digits [٠١٢٣٤٥٦٧٨٩]
        e = '٠'.charCodeAt(0);
        str = str.replace(/[٠-٩]/g, function(t) {
            return t.charCodeAt(0) - e;
        });
        return ((3/ 100) * str).toFixed(2);
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
    height              : 90
  },
    textFun : {
        color                 : "#2272bd",
        fontFamily            : "CairoRegular",
        fontSize              : 16,
        textAlign             : "center",
    },
    clickFunction : {
        backgroundColor       : "#fff",
        borderRadius          : 10,
        margin                : 10,
        padding               : 5,
        width                 : 120,
        justifyContent        : 'center',
    },
    blockFunction : {
    flexDirection         : 'row',
        justifyContent        : 'center',
        alignItems            : 'center'
},
    contentModel : {
        alignItems          : 'center',
        //justifyContent      : 'center',
        alignSelf           : 'center',
        width               : "111%",
        backgroundColor     : "#2272bd",
        flex                : 1,
        top                 : 200
    },
    curveModel : {
        opacity             : 0.9,
        top                 : -50
    },
  bodyText : {
    alignItems          : 'flex-end',
  },
  contentView : {
    backgroundColor     : '#2272bd',
  },
    model : {
        width               : "100%",
        top                 : -110
    },
  bgImage : {
      flex                : 1,
      backgroundColor     : '#fff',
      borderTopRightRadius: 50,
      borderTopLeftRadius: 50,
      width : '95%',
      alignSelf:  'center',
      borderColor   : "#2272bd",
      paddingTop : 20
  },
  Title : {
    color               : "#fff",
    fontFamily          : "CairoRegular",
    textAlign           : "center",
    fontSize            : 16,
    backgroundColor     : "#025992",
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
    color               : "#504b45",
    fontFamily          : "CairoRegular",
    fontSize            : 16,
    paddingHorizontal   : 10,
    marginBottom        : 15
  },
  curve : {
      width               : '100%',
      height              : 80,
      zIndex              : 1,
      position            : 'absolute',
      top                 : -50,
  },
  upBlock : {
    minHeight           : 140,
  },
  bgDiv : {
    paddingRight        : 10,
    paddingLeft         : 10,
  },
    formControl : {
        padding             : 15,
        overflow            : "hidden"
    },
  label : {
    width               : "95%",
    color               : '#bbb',
    borderWidth         : 0,
    padding             : 10,
    top                 : 3,
    fontFamily          : 'CairoRegular',
    textAlign           : "left",
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
    textAlign           : 'right',
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
  blockUp : {
    position            : "relative",
    backgroundColor     : "#fbe2d1",
    borderRadius        : 10,
    padding             : 20,
    margin              : 10
  },
  checkBox : {
    position            : 'absolute',
    right               : 15,
    top                 : 10,
    zIndex              : 9,
    left                : "auto",
    paddingLeft         : 0,
    paddingBottom       : 0,
    borderColor         : '#025992',
    borderRadius        : 50,
    backgroundColor     : "#025992",
    paddingRight        : 3
  },
  blockChick : {
    flexDirection       : 'row',
    justifyContent      : "space-around",
    alignItems          : "center"
  },
  imgBank : {
    flexBasis           : '30%',
  },
  blockInfo : {
    flexDirection       : 'row',
    flexBasis           : '70%',
  },
  Bank : {
    width               : '100%',
    height              : 50
  },
  nameBank : {
    color               : "#025992",
    fontFamily          : "CairoRegular",
    fontSize            : 13,
  },
  bankInfo : {
    color               : "#a7a6a8",
    fontFamily          : "CairoRegular",
    fontSize            : 13,
  },
  clickMore : {
    backgroundColor     : "#2272bd",
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
    borderRadius        : 10,
    margin              : 10,
    padding             : 5,
    width               : 120,
  },
  textMore :{
    color               : "#FFF",
    fontFamily          : "CairoRegular",
    fontSize            : 16,
  },
  imagePicker : {
    position            : 'relative',
    overflow            : "hidden",
    borderRadius        : 5,
    borderColor         : '#e9e8e8',
    borderWidth         : 1,
    marginVertical      : 20,
    paddingHorizontal   : 10,
    width               : "100%",
  },
  clickOpen : {
    width               : "100%",
    height              : 100,
    justifyContent      : 'center',
    alignItems          : "center",
    borderRadius        : 5,
  },
  textImg : {
    color               : "#025992",
    fontFamily          : "CairoRegular",
    fontSize            : 14,
  },
  iconImage: {
    marginRight         : 0,
    marginLeft          : 0,
    color               : "#025992",
    padding             : 0,
    fontSize            : 16,
    marginHorizontal    : 20
  },
  imgePrive : {
    position            : "absolute",
    top                 : 0,
    width               : "100%",
    height              : "100%",
    borderRadius        : 5,
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
  },
    item : {
        width               : "100%",
        marginLeft          : 0,
        marginRight         : 0,
        marginTop           : 25,
        padding             : 0,
        borderBottomWidth   : 0,
        position            : "relative",
    },labelModel : {
        top                 : 2,
        backgroundColor     : 'transparent',
        color               : '#fff',
        zIndex              : -1,
    },
    inputModel : {
        borderColor         : '#fff',
        color               : '#fff',
    },
    writeModel : {
        borderColor         : '#fff',
        borderWidth         : 1,
        borderRadius        : 5,
        width               : "100%",
        color               : '#fff',
        padding             : 5,
        paddingLeft         : 5,
        textAlign           : 'right',
        height              : 100,
        fontSize            : 13,
        fontFamily          : 'CairoRegular',
        marginTop           : 10
    }
});

const mapStateToProps = ({ auth, profile }) => {
  return {
      auth: auth.user,
      user: profile.user,
  };
};
export default connect(mapStateToProps, { userLogin ,profile  })(BankTransfer);
