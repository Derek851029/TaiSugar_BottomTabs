import React from 'react'
import {
  View, Text,StyleSheet
} from 'react-native'
import NetInfo from "@react-native-community/netinfo";
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import { Navigation } from "react-native-navigation";
import Spinner from 'react-native-loading-spinner-overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DataTable,Provider,Dialog, Portal, Paragraph,Button} from 'react-native-paper'

export default class Prevent extends React.Component{
    constructor(props) {
        super(props)
        this.state = {
          IP:"",
          isConnected: false,
          offlineResult: [],
          spinner: false, 
          TaskList: [],
          page : 0,
          dialogTitle: '',
          dialogMessage: '',
          dialog: false,
          dialog2: false,
        };
    }

    componentDidMount= async() => {
        let IP = await AsyncStorage.getItem('@TaiSugar:IP');
        let isConnected = false
        let offLineResult

        await NetInfo.fetch().then(state =>{
            isConnected = state.isConnected
        })

        if(isConnected){
            offlineResult = []
          }
          else{
            offlineResult = await AsyncStorage.getItem('@TaiSugar:PreventResult')
            if(offlineResult == null){
              offlineResult = []
            }
            else{
              offlineResult = JSON.parse(offlineResult)
            }
            
        }

        this.setState({IP: IP,offlineResult:offlineResult,isConnected:isConnected})

        this.StartNFC()
        this.TaskList()
    }

    componentWillUnmount() {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        NfcManager.unregisterTagEvent().catch(() => 0);
    }

    StartNFC = () =>{
        NfcManager.start();

        NfcManager.setEventListener(NfcEvents.DiscoverTag, async tag => {
            let RFID = tag.id
            let TaskList = this.state.TaskList
            let NotFind = true
            console.log(RFID)
        
            for(let i = 0; i<TaskList.length; i++){
            let data = TaskList[i]
            
            let DataRFID = data.RFID
            if(DataRFID == RFID){
                NotFind = false
                Navigation.push(this.props.componentId,
                {
                component: {
                    name: 'PreventContent',
                    passProps:{
                    Content: data
                    },
                    options: {
                    bottomTabs: { visible: false, drawBehind: true, animate: true },
                    topBar: {
                        title: {
                            text: data.location
                        },
                        backButton: {
                        }
                    }
                    }
                }
                })
                break;
            }
            else{
                continue
            }
            }

            if(NotFind){
            this.setState({dialogTitle:"??????",dialogMessage:"????????????????????????????????????????????????",dialog2:true})
            }

        });
        try {
                NfcManager.registerTagEvent();
        } catch (ex) {
            console.warn('ex', ex);
            NfcManager.unregisterTagEvent().catch(() => 0);
        }
    }

    TaskList = async() =>{
        if(this.state.isConnected == false){
            let TaskList = await AsyncStorage.getItem('@TaiSugar:Prevent')
            if(TaskList == null){
                this.setState({dialogTitle:"??????",dialogMessage:"???????????????????????????????????????????????????????????????????????????",dialog:true})
              }
              else{
                this.setState({
                  TaskList: eval(TaskList),
                  dialogTitle:"??????",
                  dialogMessage:"?????????????????????",
                  dialog2:true
                })
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
            body: 'Type=Prevent'
        })
        .then(response => response.json())
        .then((response) =>{
            console.log(response)
            this.setState({spinner: false})
            if(response == 'Error'){
                this.setState({dialogTitle:"??????",dialogMessage:"?????????????????????????????????????????????????????????",dialog:true})
            }
            else if(eval(response).length == 0){
                this.setState({dialogTitle:"??????",dialogMessage:"?????????????????????",dialog:true})
            }
            else{
                this.setState({TaskList: eval(response)})
            }
            
        })
        .catch((e)=>{
            console.log(e)
            this.setState({dialogTitle:"??????",dialogMessage:"?????????????????????????????????????????????????????????",dialog:true})
        })
      }
      
    render(){
        let TaskList = this.state.TaskList
        let offlineResult = this.state.offlineResult
        console.log(offlineResult[0])
        let lists = []

        for(let i = 0; i<TaskList.length; i++){
            let Status = "?????????"
            let data = TaskList[i]
            let id_PW = data.id_PW

            // ???????????????????????????, ????????????+[0]
            for(let i = 0; i< offlineResult.length; i++){
                let result = offlineResult[i]
                let id = result.id_PW
      
                if(id_PW == id){
                  Status = result.result
                  break
                }
            
            }
            lists.push(
                <DataTable.Row key={0} style={{height:100}}>
                    <DataTable.Cell>
                        <Text>{data.code_S}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell>
                        <Text>{data.location}</Text>
                    </DataTable.Cell>
                    <DataTable.Cell numeric>
                        <Text>{Status}</Text>
                    </DataTable.Cell>
                </DataTable.Row>
            )
        }

        //??????????????????
        lists.push(
            <DataTable.Pagination
                page={this.state.page}
                numberOfPages={Math.ceil(lists.length /5)}
                onPageChange={(page)=>{this.setState({page:page})}}
                label={`????????? ${this.state.page * 5 + 1} ??? ${Math.min((this.state.page + 1 ) * 5,lists.length)} ??????????????? ${lists.length} ???`}
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
                        <Button onPress={() => {this.setState({dialog:false});Navigation.popToRoot(this.props.componentId)}}>??????</Button>
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
                        <Button onPress={() => this.setState({dialog2:false})}>??????</Button>
                    </Dialog.Actions>
                </Dialog>
                </Portal>

                <DataTable>
                    <DataTable.Header>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>??????</Text></DataTable.Title>
                        <DataTable.Title><Text style={{color: 'red',fontSize:20}}>??????</Text></DataTable.Title>
                        <DataTable.Title numeric><Text style={{color: 'red',fontSize:20}}>??????</Text></DataTable.Title>
                    </DataTable.Header>
                    {lists}
                </DataTable>
                </View>
            </Provider>
        )
    }
}