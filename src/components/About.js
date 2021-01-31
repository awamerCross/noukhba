import React, { Component } from 'react';
import { StyleSheet, Text, View,Image,I18nManager  } from 'react-native';
import { Container, Content, Icon, Title, Header, Body, Button } from 'native-base'

import axios from "axios";
import CONST from "../consts";

class About extends Component {

  constructor(props){
    super(props);
    this.state = {
        aboutUs: '',
    };
    I18nManager
  }

  componentWillMount() {

    I18nManager.forceRTL(true);

    axios({
        url: CONST.url + 'aboutApp',
        method: 'GET',
    }).then(response => {

      this.setState({
          aboutUs :  response.data.data
      });

    }).catch(err => {
      console.log(err);
    });
  }

  static navigationOptions = () => ({
    header      : null,
    drawerLabel : ( <Text style={styles.textLabel}>من نحن</Text> ) ,
    drawerIcon  : ( <Icon style={styles.icon} type="FontAwesome5" name="users" /> )
  });

  render() {
    return (
      <Container>
        <Header style={styles.header}>
          <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon style={styles.icons} type="Entypo" name='chevron-thin-right' />
          </Button>
          <Body style={styles.bodyText}>
            <Title style={styles.Title}>الداعمين</Title>
          </Body>
        </Header>
        <Content contentContainerStyle={{ flexGrow: 1 }} style={styles.contentView}>
            <View style={styles.bgImage}>
                <View style={styles.blockAbout}>
                    <Text style={styles.text}>{ this.state.aboutUs }</Text>
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
    borderBottomWidth : 0,
    paddingRight        : 0,
    paddingLeft         : 0,
    paddingTop          : 10,
    alignItems          : 'center',
    justifyContent      : 'center',
    alignSelf           : 'center',
    height              : 90
  },
  bodyText : {
    alignItems          : 'flex-end',
  },
  contentView : {
    backgroundColor     : '#2272bd',
    borderColor   : "#2272bd",
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
  textLabel : {
    color               : "#fff",
    fontFamily          : "CairoRegular",
    fontSize            : 18,
    marginVertical      : 8
  },
  text :{
    color               : "#a1a5ab",
    fontFamily          : "CairoRegular",
    fontSize            : 16,
    paddingHorizontal   : 10,
    textAlign           : "center"
  },
  upBlock : {
    minHeight           : 140,
  },
  bgDiv : {
    paddingRight        : 10,
    paddingLeft         : 10,
  },
  icon : {
    color               : "#FFF",
    fontSize            : 23,
    position            : "relative",
    left                : -7
  },
  icons : {
    color               : "#FFF",
    fontSize            : 25,
  },

});


export default About;
