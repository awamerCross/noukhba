import axios from 'axios';
import { AsyncStorage } from 'react-native';
import CONST from '../consts';
import {Toast} from "native-base";

export const userLogin = ({phone, password, token}, props) => {
    return async (dispatch) => {
        await dispatch({type: 'user_login'});

             axios({
                url       : `${CONST.url}auth/login`,
                method    : 'POST',
                data :{
                    phone, password,
                    device_id   : token
                }
            }).then(response => {

                  handelLogin(dispatch, response.data);

                 Toast.show({
                     text: response.data.message,
                     type: response.data.success ? "success" : "danger",
                     duration: 3000,
                     textStyle   : {
                         color       : "white",
                         fontFamily  : 'CairoRegular',
                         textAlign   : 'center'
                     }
                 });

                 console.log('response ----------', response.data)

                 if(response.data.active === 0){
                     props.navigation.navigate('activeacount',
                         {
                             user_id : response.data.user_id
                         });
                 }

            }).catch(err => {

                console.warn(  'error Login'  , err)

            });
    };
};


export const tempAuth = () => {
    return (dispatch) => {
        dispatch({type: 'temp_auth'});
    };
};


const handelLogin = (dispatch, data) => {

    if (data.success === false){
        loginFailed(dispatch, data)
    }else{
        loginSuccess(dispatch, data)
    }
};


const loginSuccess = (dispatch, data) => {
    AsyncStorage.setItem('token', JSON.stringify(data))
        .then(() => dispatch({type: 'login_success', data }));

    dispatch({type: 'login_success', data});
};

const loginFailed = (dispatch, error) => {
    dispatch({type: 'login_failed', error});
};
