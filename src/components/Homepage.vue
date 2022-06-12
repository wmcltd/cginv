<template>
  <v-container>
    <v-overlay :value="overlay">
      <v-row>
        <v-progress-circular :size='100' indeterminate></v-progress-circular>
      </v-row>
      <v-row>
       <v-btn @click="overlay=!overlay">Cancel</v-btn>
      </v-row>
    </v-overlay>
    <v-row>
      <v-col>
     <v-select
          :items="supplierData"
          item-text="supplierId"
          item-value="supplierId"
          label="Select Supplier"
          v-model="supplier"
        ></v-select>
      </v-col>
      <v-col cols=6>  
    <v-text-field label="Enter Item Id" v-model=productID clearable />
    <v-btn small color='primary' :disabled="disabled" @click="getInv()">Search Inventory</v-btn>
     <v-col cols=6 v-if = "errorMsg.length>0"><span class="err" >{{errorMsg}}</span></v-col>
      </v-col>
     
    </v-row>
    <!-- <v-btn @click="getData('D100')">data</v-btn> -->
    
    <v-row>
      <span style="color:blue; font-weight:300;">{{productID}} |</span><span style="margin-left:7px;font-weight:300;">{{partDesc}}</span>
    </v-row>
    <v-row>
      <v-col>
        <span style="font-size:.8rem; font-weight:200;">Click on column names to sort</span>
      </v-col>
      <v-col cols=12>
      <v-data-table
        :headers="headers"
        :items="items"
        class="elevation-1"
        hide-default-footer
        disable-pagination
      >
      </v-data-table>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols=10>
      <p style="font-size:1rem; color:#DEDEDE;">RawData:</p>
      <p style="font-size:.8rem; color:#DEDEDE;">{{rawData}}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import xml2js from 'xml2js';
import suppliers from '../assets/suppliers.json';
export default {
  data() {
    return {
      supplierData: suppliers.data,
      overlay: false,
      errorMsg: '',
      supplier: '',
      rawData: '',
      productID: '',
      invResponse: '',
      partDesc: '',
      sku: '',
      headers:[
        {
            text: 'Part ID',
            align: 'start',
            sortable: true,
            value: 'partID',
          },
        {
          text: 'Color',
          value: 'attributeColor'
        },
        {
          text: 'Size',
          value: 'attributeSize'
        },
         {
            text: 'Quantity Available',
            align: 'start',
            sortable: true,
            value: 'quantityAvailable',
          }, 
      ],
      items: []
    };
  },
  computed:{
    disabled(){
      if(this.supplier && this.productID){
        return false
      }else{
        return true
      }
    }
  },
  methods: {
    // getData(itemId){
    //   itemId='D100'
    //   this.$store.dispatch('setItemData',itemId)
    // },
    getInv() {
      this.items = []
      const supplierDataObj = this.supplierData.filter(e=>{
        return e.supplierId.toUpperCase() == this.supplier.toUpperCase()
      })
      console.log('target Supplier', this.supplier)
      console.log('supplierFound', supplierData)
      const supplierData = supplierDataObj[0]
     // console.log(supplierData0, supplierData)
    //  var wsdlVer = '1.2.1'
    //  if(supplierData.version == '2.0.0'){
    //    wsdlVer = '2.0.0';
    //  }
   
      var qry = '';
      if(supplierData.version == '1.2.1'){
          qry = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" >
        <soap:Body>
          <Request xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">
            <wsVersion>`+supplierData.version +`</wsVersion>
            <id>` +supplierData.username + `</id>
            <password>` + supplierData.pwd + `</password>
            <productID>` +this.productID.toUpperCase() + `</productID>
            <productIDtype>Supplier</productIDtype>
          </Request>
        </soap:Body>
      </soap:Envelope>`;
      }else{
        //version 2
        qry = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/2.0.0/" xmlns:shar="http://www.promostandards.org/WSDL/InventoryService/2.0.0/SharedObjects/">
              <soapenv:Header/>
              <soapenv:Body>

          <GetInventoryLevelsRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/">
            <wsVersion xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">`+ supplierData.version + `</wsVersion>
            <id xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` + supplierData.username + `</id>
            <password xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` + supplierData.pwd + `</password>
            <productId xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` + this.productID.toUpperCase() + `</productId>
          
          </GetInventoryLevelsRequest>

          </soapenv:Body>
          </soapenv:Envelope>`;
      }

      var config = {
        method: 'post',
       // url: '/default/promostandardsProxy?url='+supplierData.endpoint,
        url: 'https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url='+supplierData.endpoint,
        //url: 'https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url='+supplierData.endpoint,
        headers: { 
          'Content-Type': 'text/xml',
        },
        data : qry
      };
      
      console.log('config:',config)
      this.overlay=true
      axios(config).then(response => {
        console.log('RESPONSE:', JSON.stringify(response.data))
        var xml = response.data
       // xml = xml.toString().replace("\ufeff", "");
        // convert XML to JSON
        var options = {explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] };
        xml2js.parseString(xml, options,(err, result) => {
            if(err) {
                throw err;
            }
            // if(result.Envelope.Body.GetInventoryLevelsResponse.ServiceMessageArray.ServiceMessage != undefined){
                
            // }
            try{
                this.errorMsg = result.Envelope.Body.GetInventoryLevelsResponse.ServiceMessageArray.ServiceMessage.description
                this.overlay=false
            }catch(e){
                //no errors
                this.errorMsg = ''
            }
            if(supplierData.version == '1.2.1'){
              try{
                this.errorMsg = result.Envelope.Body.Request.errorMessage
                this.overlay=false
              }catch(e){
                //no errors
                this.errorMsg = ''
              }
            }

            // Get the soap body object
            //console.log('altbody', result.Envelope.Body)
            var soapBody = ''
            var itemArray = []
            var color = ''
            var size = ''
            var quantityAvailable = ''
            if(supplierData.version == '2.0.0'){ //inventory version 2.0.0
              soapBody = result.Envelope.Body
              itemArray = soapBody.GetInventoryLevelsResponse.Inventory.PartInventoryArray.PartInventory
              this.rawData = itemArray
              
              itemArray.forEach(element => {
                if('partColor' in element){color = element.partColor}
                if('labelSize' in element){
                  //console.log('LABEL SIZE FOUND')
                  size = element.labelSize
                }else{
                  //console.log('LABEL SIZE NOT FOUND')
                }
                if(element.quantityAvailable.Quantity.value){
                  quantityAvailable = element.quantityAvailable.Quantity.value
                }else if('quantityAvailable' in itemArray){
                    quantityAvailable = element.quantityAvailable.Quantity.value
                }else{
                  quantityAvailable = 'N/A'
                }
                this.partDesc = element.partDescription
                this.items.push({'partID': element.partId, 'attributeColor': color, 'attributeSize': size, 'quantityAvailable': quantityAvailable})
              });
            }else{ //inventory version 1.2.1
              soapBody=result.Envelope.Body.Reply;
              itemArray = soapBody.ProductVariationInventoryArray.ProductVariationInventory
              this.rawData = itemArray
            
            
            console.log('BODY:', soapBody)
            console.log('itemArray', itemArray)
            //var productID = soapBody.productID;
           
            // var itemArray = soapBody.ProductVariationInventoryArray.ProductVariationInventory
            // console.log('itemArray', typeof itemArray, itemArray)
            // //this.invResponse = itemArray
            // console.log('length of itemArray', itemArray.length)
            /** parse itemArray into items object **/
           
              if(itemArray.length>0){
                itemArray.forEach(element => {
                  if(element.attributeColor){color = element.attributeColor}
                  if(element.attributeSize){size = element.attributeSize}
                  this.partDesc = element.partDescription
                  this.items.push({'partID': element.partID, 'attributeColor': color, 'attributeSize': size, 'quantityAvailable': element.quantityAvailable})
                });
              }else{
                if(itemArray.attributeColor){color = itemArray.attributeColor}
                this.partDesc = itemArray.partDescription
                this.items.push({'partID': itemArray.partID, 'attributeColor': color, 'quantityAvailable': itemArray.quantityAvailable})
              }
            }
            //this.items = itemArray
            console.log('items', this.items)
            this.overlay=false
            // log JSON string
            //console.log(json);
            //var invData = this.invResponse[0] //.Body[0]; //['ns1:ProductVariationInventoryArray'][0]['ns1:ProductVariationInventory']
            
           // console.log('invData', invData)
        });
        
      }
      
      )}
      
  },
  
};
</script>

<style>
  .invTbl tr, tr{border:1px solid #666; border-collapse: collapse;}
  .err {
    color:red !important;
  }
</style>
