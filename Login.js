import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  Text,
  TouchableOpacity,
} from "react-native";
import {TextInput,Provider,Paragraph,Dialog, Portal,Button, IconButton, MD3Colors} from 'react-native-paper'
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { Navigation } from 'react-native-navigation';


export default class Login extends React.Component{

    constructor(props) {
        super(props)
        this.state = {
          IP: '',
          account: 'ABC',
          password:'123',
          dialogtitle: '',
          dialogcontent: '',
          dialog: false,
          dialog2: false,
          spinner: false
        }
    }
    
    componentDidMount = async() =>{
      let IP = await AsyncStorage.getItem('@TaiSugar:IP')
      this.setState({IP:IP})

      let account = await AsyncStorage.getItem('@TaiSugar:account')
      let password = await AsyncStorage.getItem('@TaiSugar:password')
      let Authority = await AsyncStorage.getItem('@TaiSugar:Authority')
      console.log(account + password + Authority)
    }

    

    Login = async() =>{
      let account = this.state.account;
      let password = this.state.password;
      console.log(this.state.IP + 'Login')
      if(account != "" && password != ""){
        this.setState({spinner:true})

        fetch(this.state.IP + 'Login',{
          timeout:5000,
          method : 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'account='+account+'&password='+password+''
        })
        .then(response => response.json())
        .then((response) =>{
          this.setState({spinner:false})
          console.log(response[0])

          if(eval(response).length == 0){
            this.setState({dialogtitle:"警告",dialogcontent:"帳號或密碼錯誤，請重新嘗試",dialog:true})
          }
          else{
            let Data = eval(response[0])
            let Authority = Data.competence3
            let id = Data.id
            console.log("id:",id)
            AsyncStorage.setItem('@TaiSugar:account',account)
            AsyncStorage.setItem('@TaiSugar:password',password)
            AsyncStorage.setItem('@TaiSugar:id',id.toString())
            Navigation.setRoot(MainRoot)
          }
        })
        .catch((e)=>{
            this.setState({spinner:false})
            console.log(e)
            this.setState({dialogtitle:"警告",dialogcontent:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
        })    
      }
      else{
        if(this.state.account == ""){
            this.setState({dialogtitle:"警告",dialogcontent:"請輸入帳號",dialog:true})
        }
        else if(this.state.password == ""){
            this.setState({dialogtitle:"警告",dialogcontent:"請輸入密碼",dialog:true})
        }
      }
    }

    SetIP = () =>{
      let textIP = this.state.textIP

      let IP = 'http://'+textIP+'/ServiceAPI/AppService.asmx/'
      AsyncStorage.setItem('@TaiSugar:IP',IP)
    }

    render(){
      return(
        <Provider>
            <View style={styles.root}>
                <Spinner
                  visible={this.state.spinner}
                  textContent={'Loading...'}
                  textStyle={{color: '#FFF'}}
                />
                
                <Portal>
                    <Dialog visible={this.state.dialog}>
                        <Dialog.Icon icon="alert" size={64} />
                        <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogtitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph>{this.state.dialogcontent}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({dialog:false})}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={this.state.dialog2}>
                        <Dialog.Title style={{textAlign: 'center'}}>{'請輸入IP'}</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                            mode='outlined'
                            label="IP"
                            onChangeText={text =>{this.setState({textIP:text})}}
                            >
                            </TextInput>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({dialog2:false})}>取消</Button>
                            <Button onPress={this.SetIP}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                

                <View style={styles.background}>
                
                  <ImageBackground
                  style={styles.rect}
                  source={require('./assets/images/Gradient_VHD2HEh.png')}
                  >
                    <View style={styles.logoColumn}>
                        <IconButton
                          icon='tools'
                          size={20}
                          iconColor={MD3Colors.secondary40}
                          onPress={()=>{this.setState({dialog2:true})}}>
                        </IconButton>

                        <View style={styles.logo}>
                            <View style={styles.endWrapperFiller}></View>
                            <View style={styles.text3Column}>
                                <Text style={styles.text3}>台糖畜殖事業部</Text>
                                <View style={styles.rect7}></View>
                            </View>
                        </View>
                        <View style={styles.form}>
                            <View style={styles.usernameColumn}>
                                <View style={styles.username}>
                                    <Icon
                                    name="person"
                                    style={styles.icon22}
                                    ></Icon>
                                    <TextInput
                                    label="使用者名稱"
                                    placeholder="使用者名稱"
                                    placeholderTextColor="rgba(255,255,255,1)"
                                    secureTextEntry={false}
                                    onChangeText = {(text)=>this.setState({account:text})}
                                    style={styles.usernameInput}
                                    ></TextInput>
                                </View>
                                <View style={styles.password}>
                                    <Icon
                                    name="lock-closed"
                                    style={styles.icon2}
                                    ></Icon>
                                    <TextInput
                                    label="密碼"
                                    placeholder="密碼"
                                    placeholderTextColor="rgba(255,255,255,1)"
                                    secureTextEntry={true}
                                    onChangeText = {(text)=>this.setState({password:text})}
                                    style={styles.passwordInput}
                                    ></TextInput>
                                </View>
                            </View>
                              <View style={styles.usernameColumnFiller}></View>
                              <TouchableOpacity
                                onPress={() => this.Login()}
                                style={styles.button}
                                >
                                <Text style={styles.text2}>登入</Text>
                              </TouchableOpacity>
                        </View>
                    </View>
                      <View style={styles.logoColumnFiller}></View>
                    </ImageBackground>
                </View>
            </View>
        </Provider>
        )
    }
}

const MainRoot = {
    root: {
      
      bottomTabs: {
          children: [
          {
            stack:{
              children:[
                {

                  component: {
                    name: 'Home',
                    options:{
                        topBar: {
                            title: {
                            text: '首頁',
                            },
                        },
                        bottomTab: {
                            text: '首頁',
                            icon: Icon.getImageSourceSync('home'),
                            iconColor: 'blue',
                        }
                    }
                      
                  }
                }
              ]
            },
              
          },
          {
            stack:{
              children:[
                  {
                    component: {
                        name: 'Category',
                        options:{
                            topBar: {
                                title: {
                                text: '資產管理',
                                },
                            },
                            bottomTab: {
                                text: '資產管理',
                                icon: Icon.getImageSourceSync('md-wallet'),
                                iconColor: 'blue',
                            }
                        }
                        
                    },  
                  }
              ]
            }
        },
          {
              stack:{
                  children:[
                      {
                          component: {
                              name: 'TaskList',
                              options:{
                                  topBar: {
                                      title: {
                                      text: '任務列表',
                                      },
                                  },
                                  bottomTab: {
                                      text: '任務列表',
                                      icon: Icon.getImageSourceSync('md-receipt'),
                                      iconColor: 'blue',
                                  }
                              }
                              
                          }
                      }
                  ]
              }
          },
          {
              stack:{
                  children:[
                      {
                          component: {
                              name: 'Setting',
                              options:{
                                  topBar: {
                                      title: {
                                      text: '系統設定',
                                      },
                                  },
                                  bottomTab: {
                                      text: '系統設定',
                                      icon: Icon.getImageSourceSync('md-settings'),
                                      iconColor: 'blue',
                                  }
                              }
                              
                          }
                      }
                  ]
              }
          },
          ]
      }
    }
}

const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: "rgb(255,255,255)"
    },
    background: {
      flex: 1
    },
    rect: {
      flex: 1
    },
    logo: {
      width: 200,
      height: 200,
      alignSelf: "center"
    },
    endWrapperFiller: {
      flex: 1
    },
    text3: {
      color: "rgba(255,255,255,1)",
      fontSize:24,
      marginBottom: 10
    },
    rect7: {
      height: 8,
      backgroundColor: "#25cdec",
      marginRight: 11
    },
    text3Column: {
      marginBottom: 0,
      marginLeft: 2,
      marginRight: -8
    },
    form: {
      height: 230,
      marginTop: 144
    },
    username: {
      height: 59,
      backgroundColor: "rgba(251,247,247,0.25)",
      borderRadius: 5,
      flexDirection: "row"
    },
    icon22: {
      color: "rgba(255,255,255,1)",
      fontSize: 30,
      marginLeft: 20,
      alignSelf: "center"
    },
    usernameInput: {
      height: 40,
      color: "rgba(255,255,255,1)",
      flex: 1,
      marginRight: 11,
      marginLeft: 11,
      marginTop: 14
    },
    password: {
      height: 59,
      backgroundColor: "rgba(253,251,251,0.25)",
      borderRadius: 5,
      flexDirection: "row",
      marginTop: 27
    },
    icon2: {
      color: "rgba(255,255,255,1)",
      fontSize: 33,
      marginLeft: 20,
      alignSelf: "center"
    },
    passwordInput: {
      height: 40,
      color: "rgba(255,255,255,1)",
      flex: 1,
      marginRight: 17,
      marginLeft: 8,
      marginTop: 14
    },
    usernameColumn: {},
    usernameColumnFiller: {
      flex: 1
    },
    button: {
      height: 59,
      backgroundColor: "rgba(31,178,204,1)",
      borderRadius: 5,
      justifyContent: "center"
    },
    text2: {
      color: "rgba(255,255,255,1)",
      alignSelf: "center"
    },
    logoColumn: {
      marginLeft: 41,
      marginRight: 41
    },
    logoColumnFiller: {
      flex: 1
    },
    footerTexts: {
      height: 14,
      flexDirection: "row",
      marginBottom: 36,
      marginLeft: 37,
      marginRight: 36
    },
    button2: {
      width: 104,
      height: 14,
      alignSelf: "flex-end"
    },
    createAccountFiller: {
      flex: 1
    },
    createAccount: {
      color: "rgba(255,255,255,0.5)"
    },
    button2Filler: {
      flex: 1,
      flexDirection: "row"
    },
    needHelp: {
      color: "rgba(255,255,255,0.5)",
      alignSelf: "flex-end",
      marginRight: -1
    }
  });