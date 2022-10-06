import React from 'react';
import { Text, View, TouchableOpacity,dialog,ScrollView,StyleSheet,ActivityIndicator} from 'react-native';
import {Button, Dialog, Provider, Portal, Paragraph, DataTable,Searchbar} from 'react-native-paper'
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import Spinner from 'react-native-loading-spinner-overlay';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const styles = StyleSheet.create({
})

export default class RFID extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            IP: "",
            spinner: false,
            dialogTitle: '',
            dialogMessage: '',
            dialog: false,
            dialog2: false,
            dialog3: false,
            CategoryList: [],

            edit_num: 0,
            SearchText: '',
            
            search_device:[],
            
            local_id: '',
            already_owned:'',
        }
    }

    componentDidMount = async () =>{
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        this.setState({IP: IP})

        this.CategoryList();
        this.StartNFC();
    }

    componentWillUnmount = () =>{
        this.setState = () => false
        NfcManager.unregisterTagEvent().catch(() => 0);
    }

    StartNFC = () =>{
        NfcManager.start();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, async(tag) => {
            this.setState({dialog:false})

            let existType = false
            let RFID = tag.id
            var Check = await this.CheckRFID(RFID)
            console.log(Check)
            if(Check == 'Success'){
                let CategoryList = this.state.CategoryList
                let edit_num = this.state.edit_num
                //console.log(CategoryList)

                for(let i = 0; i<CategoryList.length; i++){
                    let Data = CategoryList[i]
                    let DataRFID = Data.RFID

                    if(DataRFID == RFID){
                        existType = true
                        break
                    }
                }

                if(existType){
                    this.setState({dialogTitle:"警告",dialogMessage:"此RFID以掃描，請重新掃描RFID",dialog2:true})
                }
                else{ 
                    for(let x = 0; x<CategoryList.length; x++){
                        let Data = CategoryList[x]
                        let id_S = Data.id_S
                        if(edit_num == id_S){
                            Data.RFID = RFID
                            break;
                        }
                    }
                    this.setState({CategoryList:CategoryList,dialog3: false})
                }

                
                
            }
            else{
                if(Check == "error"){
                    this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
                }
                else{
                    let name_S = Check.name_S
                    let code_S = Check.code_S
                    this.setState({dialogTitle:"警告",dialogMessage:"此RFID以配對設備\n編號:"+code_S+"\n設備名稱:"+name_S+"",dialog2:true,dialog3:false})
                }
                
            }
            
            //實際掃描nfc card獲取格式為json, 取得nfc card id(tag.id)
            console.log(RFID)     
        });
        try {
            NfcManager.registerTagEvent();
        } 
        catch (ex) {
            console.warn('ex', ex);
            NfcManager.unregisterTagEvent().catch(() => 0);
        }
    }

    CheckRFID = (RFID) =>{
        return fetch(this.state.IP + 'CheckRFID',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'RFID='+RFID+''
        })
        .then(response => response.json())
        .then((response) =>{
            let Data = response[0]
            console.log(Data)
            if(Data == null){
                return "Success"
            }
            else{
                return Data
            }
        })
        .catch((e)=>{
            console.log(e)
            return "error"
        })
    }

    CategoryList = () =>{
        this.setState({spinner: true});
        let SearchText = this.state.SearchText

        fetch(this.state.IP+'CategoryList',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Type=Edit&Text='+SearchText+''
        })
        .then(response => response.json())
        .then((response) =>{
            let Data = response
            if(Data == null){
                this.setState({dialogTitle:"提醒",dialogMessage:"未找到沒有RFID的設備",dialog:true,spinner:false})
            }
            else{
                this.setState({CategoryList:Data,spinner:false})
            }
            
            console.log(Data)
            
            
        })
        .catch((e)=>{
            console.log(e)
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
        })
    }

    EditRFID = (num) =>{
        console.log(num)
        this.setState
        ({
            dialog3:true,
            edit_num: num
        })
    }

    SaveCategoryRFID = () =>{
        this.setState({spinner: true});
        let CategoryList = JSON.stringify(this.state.CategoryList)
        console.log("CategoryList:",this.state.CategoryList)
        fetch(this.state.IP + 'SaveCategoryRFID',{
            timeout:1000,
            method : 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'Data='+CategoryList+''
        })
        .then(response => response.text())
        .then((response) =>{
            console.log(response)
            if(response == "Success"){
                this.setState({dialogTitle:"提醒",dialogMessage:"上傳成功",dialog2:true,spinner:false})
            }
            else{
                this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog2:true,spinner:false})
            }
        })
        .catch((e)=>{
            console.log(e)
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog2:true,spinner:false})
        })
    }

    // 陣列[[id_S,code_S,name_S],[xxx]] 第4個位置為後續加上去的RFID
    render() {
      let CategoryList = this.state.CategoryList
      let lists = [];
      console.log(CategoryList.length)
      if(CategoryList.length > 0){
          CategoryList.forEach((data,i,array) =>{
              let id_S = data.id_S
              let code_S = data.code_S
              let name_S = data.name_S
              let RFID = data.RFID

              lists.push(
                  <DataTable.Row key={i} style={{height:100}}>
                      <DataTable.Cell>
                          <Text>{code_S}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell>
                          <Text>{name_S}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                          <Text>{RFID}</Text>
                      </DataTable.Cell>
                      <DataTable.Cell numeric>
                          <Button icon="pencil" mode="Contained" onPress={()=>{this.EditRFID(id_S)}}><Text>修改</Text></Button>
                      </DataTable.Cell>
                  </DataTable.Row>
              )
          })
      }

      return (
          <Provider>
              <View>
            <Spinner
            visible={this.state.spinner}
            textContent={'spinner...'}
            textStyle={{color: '#FFF'}}
            />
                  
            <Portal>
                <Dialog visible={this.state.dialog}>
                    <Dialog.Icon icon="alert" size={64} />
                    <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph style={{textAlign:'center'}}>{this.state.dialogMessage}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => this.setState({dialog:false})}>確定</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            <Portal>
                <Dialog visible={this.state.dialog2}>
                    <Dialog.Icon icon="alert" size={64} />
                    <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph style={{textAlign:'center'}}>{this.state.dialogMessage}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => this.setState({dialog2:false})}>確定</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
                  <View style={{}}>
                      <Searchbar
                        placeholder="請輸入名稱或編號" 
                        onIconPress={() =>{this.CategoryList()}} 
                        onChangeText={(text)=>{this.setState({SearchText:text})}}
                        iconColor="#0000CD"
                      >
                      </Searchbar>
                  </View>
                      <DataTable style={{paddingTop:5}}>
                          <DataTable.Header>
                              <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號</Text></DataTable.Title>
                              <DataTable.Title><Text style={{color: 'red',fontSize:20}}>名稱</Text></DataTable.Title>
                              <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>RFID</Text></DataTable.Title>
                              <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>功能</Text></DataTable.Title>
                          </DataTable.Header>
                          {lists}
                      </DataTable>
                  <View style={{alignItems:'flex-end'}}>
                      <Button icon="check" mode="contained" onPress={this.SaveCategoryRFID}>
                          <Text style={{fontSize:24}}>儲存</Text>
                      </Button>
                  </View>
                  
                  <View>
                      <Portal>
                          <Dialog visible={this.state.dialog3}>
                              <Dialog.Content>
                                  <Paragraph style={{textAlign:'center',color:'red',fontSize:24,paddingTop:50}}>請掃描RFID</Paragraph>
                              </Dialog.Content>
                              <Dialog.Actions>
                                  <Button onPress={() =>{this.setState({dialog3:false})}}>取消</Button>
                              </Dialog.Actions>
                          </Dialog>
                      </Portal>
                      
                  </View>
                  
              </View>
          </Provider>
      );
  } 
}