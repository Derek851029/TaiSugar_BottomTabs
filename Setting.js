import {
    Platform,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableHighlight,
    SafeAreaView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import React, { Component } from 'react';
import { Navigation } from "react-native-navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Spinner from 'react-native-loading-spinner-overlay';
import { List,Button,Provider,Dialog, Portal, Paragraph } from 'react-native-paper';

const styles = StyleSheet.create({
    Button_end:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'gray'
    },
})

export default class Setting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            IP: '',
            spinner: false,
            dialog: false,
            dialog2: false,
            dialog3: false,
            DownloadDate: "",
            UploadDate: "",
            Task: "",
            Status: '',
        };
    }

    componentDidMount =  async () => {
        var IP = await AsyncStorage.getItem('@TaiSugar:IP')
        var DownloadDate =  await AsyncStorage.getItem('@TaiSugar:DownloadDate')
        var UploadDate = await AsyncStorage.getItem('@TaiSugar:UploadDate')
        if (IP != null){
            this.setState({IP: IP})
        }
        if (DownloadDate != null){
            this.setState({DownloadDate: DownloadDate})
        }
        if (UploadDate != null){
            this.setState({UploadDate: UploadDate})
        }
    }

    CheckStorage = async(Type) =>{
        let Status = this.state.Status
        if(Status == 'download'){
            let Task = await AsyncStorage.getItem('@TaiSugar:'+Type+'');
            if(Task == null){
                this.DownloadTask(Type)
            }
            else{
                Alert.alert(
                    "警告:",
                    "已有下載的任務，是否重新下載任務?",
                    [
                        { text: "取消", onPress: () => {} },
                        { text: "確定", onPress: () => {this.DownloadTask(Type)} }
                      
                    ]
                );
            }
        }
        else{
            let text = Type + 'Result'
            let result = await AsyncStorage.getItem('@TaiSugar:'+text+'')
            if(result == null){
                this.setState({dialogTitle:"警告",dialogMessage:"未找到完成的任務，請確認是否完成任務",dialog3:true})
                return
            }
            else{
                if(Type == 'Inspection'){
                    this.SaveImage()
                }
                this.Upload(text,result)
            }
        }
    }

    DownloadTask = async (Type) =>{
        this.setState({dialog2:false,spinner:true})
        fetch(this.state.IP + 'TaskList',{
            timeout:5000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Type='+Type+''
        })
        .then(response => response.text())
        .then((response) =>{
            console.log(response)
            if(response == 'Error'){
                this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog3:true,spinner:false})
            }
            else if(eval(response).length == 0){
                this.setState({dialogTitle:"提醒",dialogMessage:"未找到任務，請確認任務是否建立或已完成",dialog3:true,spinner:false})
            }
            else{
                var date = new Date().toISOString();
                var today = date.replace('T',' ').substring(0,date.length - 5)
                AsyncStorage.setItem('@TaiSugar:'+Type+'',response)
                AsyncStorage.setItem('@TaiSugar:DownloadDate',today);
                this.setState({dialogTitle:"提醒",dialogMessage:"下載成功",DownloadDate:today,dialog3:true,spinner:false})
            }
            
            
        })
        .catch((e)=>{
            console.log(e)
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog3:true,spinner:false})
        })
    }

    Upload = async(functionName,result) =>{
        console.log(result)
        //這裡的functionName是後端function的名字, 也是storage的key
        this.setState({dialog2:false,spinner: true})

        fetch(this.state.IP + functionName,{
            timeout:5000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Data='+result+'&Type=offline'
        })
        .then(response => response.text())
        .then((response) =>{
            console.log(response)
            if(response == "Success"){
                var date = new Date().toISOString();
                var today = date.replace('T',' ').substring(0,date.length - 5)
                AsyncStorage.setItem('@TaiSugar:UploadDate',today);
                AsyncStorage.removeItem('@TaiSugar:'+functionName+'')
                this.setState({dialogTitle:"提醒",dialogMessage:"上傳成功",dialog3:true,spinner:false})
            }
            else{
                this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog3:true,spinner:false})
            }
            
            
        })
        .catch((e)=>{
            console.log(e)
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog3:true,spinner:false})
        })
    }

    SaveImage = async() =>{
        let result = await AsyncStorage.getItem('@TaiSugar:InspectionResult')
        let Ans = eval(result)
        let Status;
        let jsonkey = 'image'
        console.log(Ans)

        Ans.forEach((data,i,array) =>{
            for(let i = 1; i < 6; i++){
                let imagekey = jsonkey + i.toString()
                let id_C = data['id_C']
                let file = data[imagekey]
                
                if(file != undefined && file != ''){
                    let formData = new FormData()
                    formData.append('file',{
                        uri: file,
                        type: 'image/jpg',
                        name: id_C + imagekey + ".jpg"
                    })
                    formData.append('id_C',id_C)
                    formData.append('key',imagekey)
    
                    fetch(this.state.IP+'SaveImage',{
                        timeout:1000,
                        method : 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                        body: formData
                    })
                    .then(response => response.text())
                    .then((response) =>{
                        Status = response
                        console.log(response)
                    })
                    .catch((e)=>{
                        console.log(e)
                        Status = "Error"
                        this.setState({spinner: false});
                        // this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
                    })
    
                }
            }
        })
        return Status
    }

    Logout = async() =>{
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        let DownloadDate =  await AsyncStorage.getItem('@TaiSugar:DownloadDate')
        let UploadDate = await AsyncStorage.getItem('@TaiSugar:UploadDate')

        AsyncStorage.clear()

        AsyncStorage.setItem('@TaiSugar:IP',IP)
        AsyncStorage.setItem('@TaiSugar:DownloadDate',DownloadDate)
        AsyncStorage.setItem('@TaiSugar:UploadDate',UploadDate)
        this.setState({dialogTitle:"提醒",dialogMessage:"登出成功",dialog:true})
    }

    render(){
        return(
            <Provider>
                <View style={{flex:1}}>
                    <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={{color: '#FFF'}}
                    />
                </View>
                <Portal>
                    <Dialog visible={this.state.dialog}>
                        <Dialog.Icon icon="alert" size={64} />
                        <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={{textAlign:'center',fontSize:18}}>{this.state.dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => Navigation.setRoot(loginRoot)}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={this.state.dialog3}>
                        <Dialog.Icon icon="alert" size={64} />
                        <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={{textAlign:'center',fontSize:18}}>{this.state.dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({dialog3:false})}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={this.state.dialog2}>
                        <Dialog.Title style={{textAlign: 'center'}}>{'請選擇任務'}</Dialog.Title>
                        <Dialog.Content>
                            <List.Item
                                title="巡檢任務"
                                left={props=><List.Icon icon="alpha-i-box"></List.Icon>}
                                onPress={()=>{this.CheckStorage('Inspection')}}>
                            </List.Item>
                            <List.Item
                                title="保養任務"
                                left={props=><List.Icon icon="alpha-p-box"></List.Icon>}
                                onPress={()=>{this.CheckStorage('Prevent')}}>
                            </List.Item>
                            <List.Item
                                title="矯正性任務"
                                left={props=><List.Icon icon="alpha-r-box"></List.Icon>}
                                onPress={()=>{this.CheckStorage('Rectify')}}>
                            </List.Item>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({dialog2:false})}>取消</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
                <View>
                    <Image 
                        source={require('./assets/images/syncicon.png')}
                        style={{width: '100%', height: '70%',resizeMode:'contain'}}>
                    </Image>
                    <Text style={{fontSize:20,paddingBottom: 30}}>案件下載時間: {this.state.DownloadDate}</Text>
                    <Text style={{fontSize:20}}>案件上傳時間: {this.state.UploadDate}</Text>
                </View>
                <View style={{flexDirection: 'row',marginBottom:50}}>
                    <Button icon="download" mode="contained" onPress={()=>this.setState({dialog2:true,Status:'download'})}>
                        <Text style={{fontSize:18}}>下載任務</Text>
                    </Button>

                    <View style={{width: 5}}></View>

                    <Button icon="upload" mode="contained" onPress={()=>{this.setState({dialog2:true,Status:'upload'})}}>
                        <Text style={{fontSize:18}}>上傳任務</Text>
                    </Button>

                    <View style={{width: 5}}></View>
                    <Button icon="logout" mode="contained" onPress={this.Logout}>
                        <Text style={{fontSize:18}}>登出</Text>
                    </Button>
                </View>
            </Provider>
        )
    }
}

const loginRoot = {
    root: {
      component: {
        name: 'Login'
      }
    }
};