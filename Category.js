import React from 'react'
import {
    View, Image, TouchableHighlight, Text, Touchable,StyleSheet, Alert,ScrollView
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { Navigation } from "react-native-navigation";
import { Provider,Card } from 'react-native-paper';

export default class Category extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
          IP:"", 
          TaskList: [],
          alertTitle: '',
          alertMessage: '',
          alert: false,
          alert2: false,
        };
      }
    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        this.setState({IP: IP})
    }
    render(){
        return(
            <Provider>
              <View style={{height:80}}></View>
              <Image
                  source={require('./assets/images/assets.png')}
                  style={{width: '100%', height: '30%',alignSelf:'center',resizeMode:'contain'}}>
              </Image>
              <View style={{height:80}}></View>
              <TouchableHighlight
                onPress={()=>{Navigation.push(this.props.componentId,
                {
                  component: {
                    name: 'AddRFID',
                    options: {
                      bottomTabs: { visible: false, drawBehind: true, animate: true },
                      topBar: {
                        title: {
                          text: '新增RFID'
                        }
                      }
                    }
                  }
                })}}
              >
                <View style={styles.content}>
                  <Icon
                    name="md-add-circle-outline"
                    color='white'
                    style={styles.icon}
                  >
                  </Icon>
                  <Text style={styles.text}>新增RFID</Text>
                </View>
              </TouchableHighlight>

              <View style={{height:50}}></View>

              <TouchableHighlight
              onPress={()=>{Navigation.push(this.props.componentId,
                {
                  component: {
                    name: 'EditRFID',
                    options: {
                      bottomTabs: { visible: false, drawBehind: true, animate: true },
                      topBar: {
                        title: {
                          text: '編輯RFID'
                        }
                      }
                    }
                  }
                })}}
              >
                <View style={styles.content}>
                  <Icon
                    name="pencil"
                    color='white'
                    style={styles.icon}
                  >
                  </Icon>
                  <Text style={styles.text}>編輯RFID</Text>
                </View>
              </TouchableHighlight>
            </Provider>
            
        )
            
    }
}

const RFIDRoot = {
  root: {
    component: {
      name: 'Login'
    }
  }
}

const styles = StyleSheet.create({
  content :{
    flexDirection:'row',
    width:'100%',
    backgroundColor:'#0000CD',
    alignItems:'center'
  },

  text:{
    fontSize:45,
    color:'white',
    marginLeft:40
  },
  
  icon: {
      fontSize: 90,
  },
})