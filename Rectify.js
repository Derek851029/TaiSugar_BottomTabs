import React from 'react'
import {
  View, Text,StyleSheet
} from 'react-native'
import NetInfo from "@react-native-community/netinfo";
import { Navigation } from "react-native-navigation";
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DataTable,Provider,Dialog, Portal, Paragraph,Button,TextInput} from 'react-native-paper'

export default class Rectify extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
          IP:"",
          isConnected: false,
          StaffID: '',
          spinner: false, 
          TaskList: [],
          offlineResult: [],
          page : 0,
          index : 0,
          dialogTitle: '',
          dialogMessage: '',
          dialog: false,
          dialog2: false,
          dialog3: false,
          result: '',
        };
    }
    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        let StaffID = await AsyncStorage.getItem('@TaiSugar:id');
        let offlineResult
        let isConnected = false
        
        await NetInfo.fetch().then(state =>{
            isConnected = state.isConnected
        })

        if(isConnected){
          offlineResult = []
        }
        else{
          offlineResult = await AsyncStorage.getItem('@TaiSugar:RectifyResult')
          if(offlineResult == null){
            offlineResult = []
          }
          else{
            offlineResult = JSON.parse(offlineResult)
          }
          
      }

        this.setState({IP: IP,StaffID: StaffID,offlineResult:offlineResult,isConnected:isConnected})
        this.TaskList()
    }
    
    componentWillUnmount() {
    }

    TaskList = async() =>{
      if(this.state.isConnected == false){
        let TaskList = await AsyncStorage.getItem('@TaiSugar:Rectify')
        if(TaskList == null){
          this.setState({dialogTitle:"警告",dialogMessage:"當前為離線狀態，未找到任務，請至系統設定中下載任務",dialog:true})
        }
        else{
          this.setState({
            TaskList: eval(TaskList),
            dialogTitle:"提醒",
            dialogMessage:"當前為離線狀態",
            dialog2:true})
          }
        return
      }

      this.setState({spinner: true})
      fetch(this.state.IP + 'TaskList',{
          timeout:1000,
          method : 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'Type=Rectify'
      })
      .then(response => response.text())
      .then((response) =>{
          console.log(response)
          this.setState({spinner: false})
          if(response == 'Error'){
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
          }
          else if(eval(response).length == 0){
            this.setState({dialogTitle:"提醒",dialogMessage:"未找到矯正性任務，請確認任務是否已完成",dialog:true})
          }
          else{
              this.setState({TaskList: eval(response)})
          }
          
      })
      .catch((e)=>{
          console.log(e)
          this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
      })
    }

    offLineResult = async(data) =>{
      let RectifyResult = await AsyncStorage.getItem('@TaiSugar:RectifyResult');
      console.log(RectifyResult)
      if(RectifyResult == null){
          let array = []
          array.push(data)
          AsyncStorage.setItem('@TaiSugar:RectifyResult',JSON.stringify(array))
          this.setState({offlineResult:array})
      }
      else{
          let dataArray = JSON.parse(RectifyResult)
          dataArray.push(data)
          AsyncStorage.setItem('@TaiSugar:RectifyResult',JSON.stringify(dataArray))
          console.log(dataArray)
          this.setState({offlineResult:dataArray})
      }
      
      this.setState({dialogTitle:"提醒",dialogMessage:"矯正性結果已儲存，請至系統設定上傳結果",offlineResult:RectifyResult,dialog2:true,dialog3:false})
    }

    UploadResult = () =>{
      let StaffID = this.state.StaffID
      let TaskList = this.state.TaskList
      let result = this.state.result
      let index = this.state.index
      
      let Taskdata = TaskList[index]

      let data = {}
      data['name'] = StaffID
      data['id_R'] = Taskdata.id_R
      data['result'] = result

      if(this.state.isConnected == false){
        this.offLineResult(data)
        return
    }

      this.setState({spinner: true});

      fetch(this.state.IP+'RectifyResult',{
          timeout:1000,
          method : 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'Data='+JSON.stringify(data)+'&Type=online'
      })
      .then(response => response.text())
      .then((response) =>{
        console.log(response)
        if(response == "Success"){
            this.setState({dialogTitle:"提醒",dialogMessage:"上傳成功",dialog2:true})
        }
        else{
            this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
        }
        this.TaskList()
        this.setState({spinner: false,dialog3:false});
      })
      .catch((e)=>{
          console.log(e)
          this.setState({spinner: false});
          this.setState({dialogTitle:"警告",dialogMessage:"伺服器發生錯誤，請重新嘗試或洽詢管理員",dialog:true})
      })
    }

    render(){
      let TaskList = this.state.TaskList
      let offlineResult = this.state.offlineResult
      let showDatalength = Math.min((this.state.page + 1 ) * 10,TaskList.length)

      let lists = []

      if(TaskList.length >= 10){
        for(let i = 0; i<showDatalength; i++){
          let data = TaskList[i]
          
          let id_R = data.id_R
          let code_S = data.code_S
          let time = data.time
          let name = data.name
          let Status = '未完成'

          for(let i = 0; i< offlineResult.length; i++){
            let result = offlineResult[i]
            let id = result.id_R
            console.log("id:",id_R,id)
            if(id_R == id){
              Status = '完成'
              break
            }
          }
  
          lists.push(
              <DataTable.Row key={i} style={{height:100}}
                onPress={()=>{this.setState({dialog3: true,index: i})}}>
                  <DataTable.Cell>
                      <Text>{code_S}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                      <Text>{name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell>
                      <Text>{Status}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                      <Text>{time}</Text>
                  </DataTable.Cell>
              </DataTable.Row>
          )
        }
      }
      else{
        TaskList.forEach((data,i,array) =>{
          let id_R = data.id_R
          let code_S = data.code_S
          let time = data.time
          let name = data.name
          let Status = '未完成'

          for(let i = 0; i< offlineResult.length; i++){
            let result = offlineResult[i]
            let id = result.id_R
            console.log("id:",id_R,id)
            if(id_R == id){
              Status = '完成'
              break
            }
          }
    
          lists.push(
              <DataTable.Row key={i} style={{height:100}}
                onPress={()=>{this.setState({dialog3: true,index: i})}}>
                  <DataTable.Cell>
                      <Text>{code_S}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{paddingLeft:10}}>
                      <Text>{name}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={{paddingLeft:10}}>
                      <Text>{Status}</Text>
                  </DataTable.Cell>
                  <DataTable.Cell numeric>
                      <Text>{time}</Text>
                  </DataTable.Cell>
              </DataTable.Row>
          )
        })
      }

      //最後放入分頁
      lists.push(
        <DataTable.Pagination
            page={this.state.page}
            numberOfPages={Math.ceil(lists.length /5)}
            onPageChange={(page)=>{this.setState({page:page})}}
            label={`顯示第 ${this.state.page * 5 + 1} 至 ${Math.min((this.state.page + 1 ) * 5,lists.length)} 項結果，共 ${lists.length} 項`}
            // numberOfItemsPerPageList={[1,2,3]}
            numberOfItemsPerPage={1}
            onItemsPerPageChange={()=>{console.log('123')}}
        >
        </DataTable.Pagination>
      )
      
      return(
        <Provider>
          <View>
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
                    <Paragraph style={{textAlign:'center'}}>{this.state.dialogMessage}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => {this.setState({dialog:false});Navigation.popToRoot(this.props.componentId)}}>確定</Button>
                </Dialog.Actions>
            </Dialog>

            <Dialog visible={this.state.dialog2}>
                <Dialog.Icon icon="check" size={64} />
                <Dialog.Title style={{textAlign: 'center'}}>{this.state.dialogTitle}</Dialog.Title>
                <Dialog.Content>
                    <Paragraph style={{textAlign:'center'}}>{this.state.dialogMessage}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={() => this.setState({dialog2:false})}>確定</Button>
                </Dialog.Actions>
            </Dialog>
            
            <Dialog visible={this.state.dialog3}>
              <Dialog.Title style={{textAlign: 'center'}}>{'請輸入矯正性結果'}</Dialog.Title>
              <Dialog.Content>
                  <TextInput
                  mode='outlined'
                  label="矯正性結果"
                  multiline={true}
                  style={{height:200}}
                  onChangeText={text =>{this.setState({result:text})}}
                  >
                  </TextInput>
              </Dialog.Content>
              <Dialog.Actions>
                  <Button onPress={() => this.setState({dialog3:false})}>取消</Button>
                  <Button onPress={this.UploadResult}>上傳結果</Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
  
            <DataTable>
              <DataTable.Header>
                <DataTable.Title><Text style={{color: 'red',fontSize:20}}>編號/敘述</Text></DataTable.Title>
                <DataTable.Title style={{paddingLeft:10}}><Text style={{color: 'red',fontSize:20}}>派工人</Text></DataTable.Title>
                <DataTable.Title style={{paddingLeft:10}}><Text style={{color: 'red',fontSize:20}}>狀態</Text></DataTable.Title>
                <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>發生日期</Text></DataTable.Title>
              </DataTable.Header>
              {lists}
            </DataTable>
          </View>
        </Provider>
      )
    }
}