import React from 'react'
import NetInfo from "@react-native-community/netinfo";
import { View, Text, TouchableOpacity,StyleSheet,dialog, ScrollView,Image} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dropdown } from 'react-native-element-dropdown';
import { Navigation } from "react-native-navigation";
import Spinner from 'react-native-loading-spinner-overlay';
import { TextInput,Button,Provider,Dialog, Portal, Paragraph, Modal } from 'react-native-paper';
import{launchCamera} from 'react-native-image-picker'
import { PermissionsAndroid } from 'react-native';

const styles = StyleSheet.create({
    Text:{
        color: 'blue',
        fontSize: 20
    },
    splitLine:{
        height: 0,
        width: '100%',
        marginTop: 10,
        marginBottom: 10,
        borderWidth: 0.5,
        borderColor: 'black',
        borderStyle: 'dashed'
    },
    dropdown: {
        height: 50,
        borderColor: 'blue',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
})

export default class InspectionContent extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            IP : "",
            isConnected: false,
            spinner: false,
            Content: {},
            itemlen : 0,
            name_S: "",
            code_S: "",
            remark: "",
            Ans: {},
            dialogTitle: '',
            dialogMessage: '',
            dialog: false,
            dialog2: false,
            dialog3: false,
            modal: false,
            Nowabnormal : '',
            abnormalText: '',
            base64: '',
            uri: '',
            ViewPicture: false,
        };
    }
    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        let StaffID = await AsyncStorage.getItem('@TaiSugar:id');
        let isConnected = false
        
        await NetInfo.fetch().then(state =>{
            isConnected = state.isConnected
        })
        console.log(StaffID)
        let Content = this.props.Content

        let Ans = this.state.Ans

        let itemlen = 0
        for(let i = 1; i<6; i++){
            let item = eval('Content.'+ 'item' +  i.toString())
            console.log(item)
            if(item != null && item != ""){
                itemlen += 1
            }
        }
        console.log(Content)

        Ans["id_C"] = Content.id_C
        Ans["id_S"] = Content.id_S
        Ans["code_S"] = Content.code_S
        Ans["location"] = Content.location
        Ans["name"] = StaffID
        
        this.setState({
            IP: IP,
            isConnected: isConnected, 
            Content: Content,
            itemlen:itemlen,
            name_S: Content.name_S,
            code_S : Content.code_S,
            remark: Content.remark
        })
    }

    SelectResult = (value,i) =>{
        let result = 'result' + i.toString()
        let abnormal = 'abnormal'+ i.toString()
        
        let NotFind = true
        let Ans = this.state.Ans

        if(value != 'default'){
            //如果json找不到, 就新增
            if(Ans[result] == undefined){
                Ans[result] = value
                Ans[abnormal] = ''
            }
            else{
                Ans[result] = value
            }
        }
        
        if(value == '異常'){
            this.setState({dialog2: true, Ans : Ans, Nowabnormal: abnormal})
        }
        console.log(this.state.Ans)
    }
    
    AbnormalReason = () =>{
        let Ans = this.state.Ans

        let abnormalText = this.state.abnormalText
        let Nowabnormal = this.state.Nowabnormal
        let number = Nowabnormal.substring(Nowabnormal.length -1,Nowabnormal.length)

        if(this.state.uri != ''){
            let key = 'image' + number
            Ans[key] = this.state.uri
        }
        Ans[Nowabnormal] = abnormalText
        this.setState({dialog2: false,uri:'',base64:''})
        // console.log(this.state.Ans)
    }

    requestCameraPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA,
            {
              title: "App Camera Permission",
              message:"App needs access to your camera ",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK"
            }
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Camera permission given");
          } else {
            console.log("Camera permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
    };

    StartCamera = async (key) => {
        this.requestCameraPermission()
        var options = {
            mediaType: 'photo',
            includeBase64: true,
            videoQuality: 'low',
            maxWidth: 800,
            maxHeight: 600,
        };
        launchCamera(options, res => {
            if (res.didCancel) {
                console.log('User cancelled image picker');
            } else if (res.error) {
                console.log('ImagePicker Error: ', res.error);
            } else if (res.customButton) {
                console.log('User tapped custom button: ', res.customButton);
                alert(res.customButton);
            } else {
                let data = res.assets[0]
                let base64 = data.base64
                let uri = data.uri
                console.log(uri)
                this.setState({uri:uri,ViewPicture:true})
            }
        });
    };

    CheckResult = () =>{
        let Ans = this.state.Ans
        let NotFind = true

        for(let i = 1; i <= this.state.itemlen; i++){
            let result = 'result' + i.toString()
            if(Ans[result] == undefined){
                break
            }
            else{
                NotFind = false
            }
        }

        if(NotFind){
            return "Fail"
        }
        else{
            return "Success"
        }
    }

    offLineResult = async() =>{
        let Ans = this.state.Ans
        let InspectionResult = await AsyncStorage.getItem('@TaiSugar:InspectionResult');
        console.log(InspectionResult)
        if(InspectionResult == null){
            let array = []
            array.push(Ans)
            AsyncStorage.setItem('@TaiSugar:InspectionResult',JSON.stringify(array))
        }
        else{
            let dataArray = JSON.parse(InspectionResult)
            dataArray.push(Ans)
            AsyncStorage.setItem('@TaiSugar:InspectionResult',JSON.stringify(dataArray))
            
        }
        
        this.setState({dialogTitle:"提醒",dialogMessage:"巡檢結果已儲存，請至系統設定上傳結果",dialog3:true})
    }

    UploadResult = async() =>{
        let Ans = JSON.stringify(this.state.Ans)

        //檢查是否所有項目都填了
        let CheckResult = this.CheckResult()
        if(CheckResult != "Success"){
            this.setState({dialogTitle:"警告",dialogMessage:"尚有巡檢結果未填，請重新查看",dialog:true})
            return
        }

        if(this.state.isConnected == false){
            this.offLineResult()
            return
        }
        
        this.setState({spinner: true});

        this.SaveImage()

        fetch(this.state.IP+'InspectionResult',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Data='+Ans+'Type=online'
        })
        .then(response => response.text())
        .then((response) =>{
            console.log(response)
            this.setState({spinner: false});
            if(response == "Success"){
                this.setState({dialogTitle:"提醒",dialogMessage:"上傳成功",dialog3:true})
            }
            else{
                this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
            }
            
        })
        .catch((e)=>{
            console.log(e)
            this.setState({spinner: false});
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
        })
    }

    SaveImage = () =>{
        let Status;
        let Ans = this.state.Ans
        let jsonkey = 'image'
        console.log(Ans)
        for(let i = 1; i < 6; i++){
            let imagekey = jsonkey + i.toString()
            let id_C = Ans['id_C']
            let file = Ans[imagekey]
            console.log('file:' +file)
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
        return Status
    }

    render(){
        let Content = this.state.Content

        let Ans = this.state.Ans

        let lists = []

        //檢查問題是否為null, 因為只有5個問題, 長度設6
        for(let i = 1; i<6; i++){
            let item = "item"
            let reference = "reference"
            let result = "result"
            let AnsData;

            item = eval('Content.'+ item +  i.toString())
            reference = eval('Content.'+ reference +  i.toString())
            
            //因為異常會使用setstate重新渲染, 需要檢查已填寫項目將value放上去 
            if(Ans[result + i.toString()] == undefined){
                result = 'default'
            }
            else{
                result = eval("Ans." + result + i.toString())
            }

            if(item == null || item == ""){
                item = "item"
                reference = "reference"
                continue
            }
            else{
                if(reference == null){
                    reference = ''
                }
                lists.push(
                    <View>
                        <Text style={styles.Text}>{item + ' ' + reference}</Text>

                        <View style={{height:10}}></View>

                        <Dropdown
                            key={i}
                            style={styles.dropdown}
                            labelField="label"
                            valueField="value"
                            value={result}
                            data={[
                                {label:'請選擇巡檢結果',value:'default'},
                                {label:'正常',value:'正常'},
                                {label:'異常',value:'異常'},
                            ]}
                            selectedTextStyle={{fontSize:16,color:'black'}}
                            // open={false}
                            // containerStyle={{height:50}}
                            // itemStyle={{
                            //     justifyContent: 'flex-start'
                            // }}
                            // dropDownContainerStyle={{
                            //     backgroundColor: "#dfdfdf",
                            //     position:'relative'
                            // }}
                            // dropDownStyle={{backgroundColor: '#fafafa'}}
                            onChange={item =>{this.SelectResult(item.value,i)}}
                            >
                        </Dropdown>
                           
                            
                        <View style={{height:10}}></View>
                    </View>
                )
            }
            
        }

    //     <TextInput 
    //     key={i}
    //     placeholder='請輸入巡檢結果'
    //     mode='outlined'
    //     onChangeText = {(text)=>this.TextResult(text,i)}
    //     >
    // </TextInput>
        
        return(

            <Provider>
                <View style={{flex:1}}>
                    <Spinner
                    visible={this.state.spinner}
                    textContent={'Loading...'}
                    textStyle={{color: '#FFF'}}
                    />
                    
                <Portal>
                    <Dialog visible={this.state.dialog}>
                        <Dialog.Icon icon="alert" size={64} />
                        <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={{textAlign:'center',fontSize:18}}>{this.state.dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({dialog:false})}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={this.state.dialog2}>
                        <Dialog.Title style={{textAlign: 'center'}}>{'請輸入異常原因'}</Dialog.Title>
                        <Dialog.Content>
                            <View style={{flexDirection: 'row'}}>
                                <Button icon="camera" mode="contained" onPress={()=>{
                                    this.StartCamera()
                                }}>
                                    <Text style={{fontSize:18}}>拍攝照片</Text>
                                </Button>
                                {this.state.ViewPicture&& <Button icon="file-search" mode="contained-tonal" buttonColor='white' textColor='blue' onPress={()=>{this.setState({modal:true})}}>
                                    <Text style={{fontSize:18}}>檢視照片</Text>
                                </Button>}
                            </View>
                            
                            <TextInput
                            mode='outlined'
                            label="異常原因"
                            style={{height:200}}
                            onChangeText={text =>{this.setState({abnormalText:text})}}
                            >
                            </TextInput>
                            
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => this.setState({dialog2:false})}>取消</Button>
                            <Button onPress={this.AbnormalReason}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>

                    <Dialog visible={this.state.dialog3}>
                        <Dialog.Icon icon="check" size={64} />
                        <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                        <Dialog.Content>
                            <Paragraph style={{textAlign:'center',fontSize:18}}>{this.state.dialogMessage}</Paragraph>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => {Navigation.popToRoot(this.props.componentId);this.setState({dialog3:false})}}>確定</Button>
                        </Dialog.Actions>
                    </Dialog>
                    
                    <Modal
                    visible={this.state.modal}
                    onDismiss={()=>this.setState({modal:false})}>
                        <Image
                            style={{height:640,width:480}}
                            source={{uri:this.state.uri}}
                            // source={require(this.state.uri)}
                        ></Image>
                    </Modal>

                </Portal>
                    <View>
                        <Text style={{color:'blue',fontSize:24}}>設備名稱:{this.state.name_S}</Text>
                        <Text style={{color:'blue',fontSize:24,marginBottom:5}}>設備編號:{this.state.code_S}</Text>
                        <Text style={{color:'red',fontSize:24,marginBottom:5}}>備註:{this.state.remark}</Text>
                    </View>
                    <View style={styles.splitLine}></View>
                    {lists}
                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                        <Button icon="close" mode="contained" buttonColor='red' onPress={()=>{Navigation.popToRoot(this.props.componentId)}}>
                                <Text style={{fontSize:18}}>取消</Text>
                        </Button>

                        <Button icon="check" mode="contained" onPress={this.UploadResult}>
                                <Text style={{fontSize:18}}>上傳</Text>
                        </Button>
                    </View>
                    
                </View>
            </Provider>
        )
    }
}
// <View>
//                     <Dialog.Container visible={this.state.dialog}>
//                         <Dialog.Title style={{color:'red'}}>請輸入異常原因:</Dialog.Title>
//                         <Dialog.Input onChangeText={text =>{this.setState({Dialog_Input:text})}}></Dialog.Input>
//                         <Dialog.Button label="取消" onPress={() =>{this.setState({dialog:false})}} />
//                         <Dialog.Button label="拍攝照片" onPress={() =>{Actions.Take_Photo2({'nfc_id':this.state.nfc_id,'id_C':this.state.id_C,'num':this.state.device_num})}}/>
//                         <Dialog.Button label="確定" onPress={this.Save_abnormal_text}/>
//                     </Dialog.Container>
//                 </View>