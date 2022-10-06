import React from 'react'
import NetInfo from "@react-native-community/netinfo";
import { View, Text, TouchableOpacity,StyleSheet,dialog, ScrollView} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Navigation } from "react-native-navigation";
import { Dropdown } from 'react-native-element-dropdown';
import Spinner from 'react-native-loading-spinner-overlay';
import { TextInput,Button,Provider,Dialog, Portal, Paragraph } from 'react-native-paper';

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

export default class PreventContent extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
            IP : "",
            spinner: false,
            isConnected: false,
            Content: {},
            item : '',
            itemlen : 0,
            location: "",
            code_S: "",
            Ans: [],
            dialogTitle: '',
            dialogMessage: '',
            dialog: false,
            dialog2: false,
            dialog3: false,
            Nowabnormal : '',
            abnormalText: '',
        };
    }

    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        let StaffID = await AsyncStorage.getItem('@TaiSugar:id');

        let Content = this.props.Content
        
        let currentDate = new Date()
        let theSaturday = currentDate.getDate() + (6 - currentDate.getDay())
        let week = Math.ceil(theSaturday / 7)

        let id_PW = Content.id_PW
        let location = Content.location
        let code_S = Content.code_S
        let item = Content[week.toString()]

        let isConnected = false
        
        await NetInfo.fetch().then(state =>{
            isConnected = state.isConnected
        })

        let Ans = this.state.Ans
        for(let i = 0; i<item.length; i++){
            Ans.push(
                {
                    "StaffID": StaffID,
                    "id_PW": id_PW,
                    "project" : item[i],
                    "result" : '',
                    "abnormal" : ''
                }
            )
        }
        
        this.setState({
            IP : IP,
            isConnected: isConnected,
            Content : Content,
            location: location,
            code_S: code_S,
            item : item,
            itemlen: item.length
        })
    }

    SelectResult = (value,i) =>{
        let Ans = this.state.Ans
        
        Ans[i].result = value 
        
        if(value == '完成'){
            Ans[i].abnormal = ''
        }
        else if(value == '未完成'){
            this.setState({dialog2: true, Ans : Ans, Nowabnormal: i})
        }
    }

    AbnormalReason = () =>{
        let Ans = this.state.Ans

        let abnormalText = this.state.abnormalText
        let Nowabnormal = this.state.Nowabnormal

        Ans[Nowabnormal].abnormal = abnormalText
        this.setState({dialog2: false,Ans: Ans})
        console.log(Ans)
    }

    CheckResult = () =>{
        let Ans = this.state.Ans
        let NotAns = false
        for(let i = 0; i < Ans.length; i++){
            let data = Ans[i]
            let result = data.result
            if(result == '' || result == 'default'){
                NotAns = true
                break
            }
        }

        if(NotAns){
            return "Fail"
        }
        else{
            return "Success"
        }
    }

    offLineResult = async() =>{
        let Ans = this.state.Ans
        let PreventResult = await AsyncStorage.getItem('@TaiSugar:PreventResult');
        if(PreventResult == null){
            // let array = []
            // array.push(Ans)
            AsyncStorage.setItem('@TaiSugar:PreventResult',JSON.stringify(Ans))
        }
        else{
            let dataArray = JSON.parse(PreventResult)

            //原先是陣列, 將陣列內容拿出來直接放入storage
            for(let i = 0; i< Ans.length; i++){
                let data = Ans[i]
                dataArray.push(data)
            }

            AsyncStorage.setItem('@TaiSugar:PreventResult',JSON.stringify(dataArray))
            console.log(dataArray)
        }
        
        this.setState({dialogTitle:"提醒",dialogMessage:"保養結果已儲存，請至系統設定上傳結果",dialog3:true})
    }

    UploadResult = () =>{
        //檢查是否所有項目都填了
        let CheckResult = this.CheckResult()
        if(CheckResult != "Success"){
            this.setState({dialogTitle:"警告",dialogMessage:"尚有保養結果未填，請重新查看",dialog:true})
            return
        }

        if(this.state.isConnected == false){
            this.offLineResult()
            return
        }

        let Ans = JSON.stringify(this.state.Ans)
        this.setState({spinner: true});

        fetch(this.state.IP+'PreventResult',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Data='+Ans+''
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

    CodeToChinese = (code) =>{
        let projectName = ""
        switch(code){
            case "A":
                projectName = "更換機油"
                break
            case "B":
                projectName = "潤滑"
                break
            case "C":
                projectName = "機件調整"
                break
            case "D":
                projectName = "機件固定檢查"
                break
            case "E":
                projectName = "除鏽上漆"
                break
            case "F":
                projectName = "電控箱清理功能檢查"
                break
            case "G":
                projectName = "電壓電流檢測"
                break
            case "H":
                projectName = "紅外線熱顯檢測"
                break
            case "I":
                projectName = "震動檢測"
                break
            case "J":
                projectName = "絕緣檢測"
                break
            case "K":
                projectName = "動態測試"
                break
            case "L":
                projectName = "潤滑油測試"
                break
            case "M":
                projectName = "自行校正"
                break
            case "N":
                projectName = "委外校正"
                break
        }
        return projectName
        
    }
    
    render(){
        let Ans = this.state.Ans
        let item = this.state.item

        let lists = []
        for(let i = 0; i<item.length; i++){
            let projectName = this.CodeToChinese(item[i])
            let result = "default"
            
            if(Ans[i].result != ''){
                result = Ans[i].result
            }

            lists.push(
                <View>
                        <Text style={styles.Text}>{projectName + ':'}</Text>

                        <View style={{height:10}}></View>

                        <Dropdown
                            key={i}
                            style={styles.dropdown}
                            labelField="label"
                            valueField="value"
                            value={result}
                            data={[
                                {label:'請選擇保養結果',value:'default'},
                                {label:'完成',value:'完成'},
                                {label:'未完成',value:'未完成'},
                            ]}
                            selectedTextStyle={{fontSize:16,color:'black'}}
                            onChange={item =>{this.SelectResult(item.value,i)}}
                            >
                        </Dropdown>
                           
                            
                        <View style={{height:10}}></View>
                    </View>
            )
        }
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
                        <Dialog.Title style={{textAlign: 'center'}}>{'請輸入未完成原因'}</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                            mode='outlined'
                            label="未完成原因"
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

                </Portal>
                    <View>
                        <Text style={{color:'blue',fontSize:24}}>設備位置:{this.state.location}</Text>
                        <Text style={{color:'blue',fontSize:24,marginBottom:5}}>設備編號:{this.state.code_S}</Text>
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