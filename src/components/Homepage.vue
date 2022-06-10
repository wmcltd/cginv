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
      <v-col>  
    <v-text-field label="Enter Item Id" v-model=productID clearable />
    <v-btn small color='primary' :disabled="disabled" @click="getInv()">Search Inventory</v-btn>
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
   

  </v-container>
</template>

<script>
import axios from 'axios';
import xml2js from 'xml2js';
export default {
  data() {
    return {
     // disabled: true,
      overlay: false,
      supplier: '',
      supplierData: [
        { 
          supplierId: 'Primeline',
          endpoint: 'https://api.primeline.com/soap/InventoryService.svc',
          version: '1.2.1',
          username: 'denar@corporategift.com',
          pwd: 'P9HghK5S'
        },
        {
          supplierId: 'Alphabroder',
          endpoint: 'https://services.alphabroder.com/inventory/InventoryService.svc',
          version: '1.2.1',
          username: 'ps3369205',
          pwd: 'vhSIpiY2'
        },
        {
          supplierId: 'PCNA',
          endpoint: 'https://psinventory121.pcna.online/psInventory.svc',
          version: '1.2.1',
          username: 'CORPORATEGIFT',
          pwd: 'U+%b[tk8(f@ilT;z7P[|5vqD?[6TjQ*@ugLulgpW{$N*8mhI9bgqlSF@GDr7|Ma'
        },
        {
          supplierId: 'Gemline',
          endpoint: 'https://wsp.gemline.com/GemlineWebService/Inventory/v1/GemlineInventoryService.svc',
          version: '1.2.1',
          username: '1017565',
          pwd: '01fdc894-9cd4-42d5-a5ab-2388bc614252'
        },
        {
          supplierId: 'Spector',
          endpoint: 'https://www.spectorapps.com/pws_product/Inventory/Inventory.php',
          version: '1.2.1',
          username: '169228',
          pwd: '4WKEHRPv'
        },
        {
          supplierId: 'Koozie Group',
          endpoint: 'https://services.kooziegroup.com/soa-infra/services/external/promostandards/inventory_v2.0.0',
          version: '2.0.0',
          username: 'SYSCORPUJT',
          pwd: 'mmklsouV2r'
        },
        {
          supplierId: 'HIT Promotional Products',
          endpoint: 'https://ppds.hitpromo.net/inventoryV2RC4?ws=1',
          version: '2.0.0',
          username: '192363',
          pwd: '50bae7cd5bb86dab12a9a75502202244'
        },
      ],
      productID: '',
      //vendorEndpoint: 'https://api.primeline.com',
      invResponse: '',
      partDesc: '',
      //data: '<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" >\n    \n    <soap:Body>\n   <Request xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">\n  <wsVersion>1.2.1</wsVersion>\n  <id>denar@corporategift.com</id>\n  <password>P9HghK5S</password>\n  <productID>BG100</productID>\n  <productIDtype>Supplier</productIDtype>\n</Request>\n    </soap:Body>\n</soap:Envelope>',
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
//    qry = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/`+wsdlVer+`/" xmlns:shar="http://www.promostandards.org/WSDL/InventoryService/`+wsdlVer+`/SharedObjects/">
//     <soapenv:Header/>
//     <soapenv:Body>

// <GetInventoryLevelsRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/Inventory/`+wsdlVer+`/">
//   <wsVersion xmlns="http://www.promostandards.org/WSDL/Inventory/`+wsdlVer+`/SharedObjects/">`+supplierData.version +`</wsVersion>
//   <id xmlns="http://www.promostandards.org/WSDL/Inventory/`+wsdlVer+`/SharedObjects/">` +supplierData.username + `</id>
//   <password xmlns="http://www.promostandards.org/WSDL/Inventory/`+wsdlVer+`/SharedObjects/">` + supplierData.pwd + `</password>
//   <productId xmlns="http://www.promostandards.org/WSDL/Inventory/`+wsdlVer+`/SharedObjects/">` +this.productID.toUpperCase() + `</productId>
 
// </GetInventoryLevelsRequest>

// </soapenv:Body>
// </soapenv:Envelope>`;
      //console.log(qry, query)
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
        // this.invResponse = JSON.stringify(response.data)
        var xml = response.data
       // xml = xml.toString().replace("\ufeff", "");
        // convert XML to JSON
        var options = {explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] };
        xml2js.parseString(xml, options,(err, result) => {
            if(err) {
                throw err;
            }
            // Get the soap body object
            console.log('altbody', result.Envelope.Body)
            var soapBody = ''
            var itemArray = []
            var color = ''
            var size = ''
            if(supplierData.version == '2.0.0'){
              soapBody = result.Envelope.Body
              itemArray = soapBody.GetInventoryLevelsResponse.Inventory.PartInventoryArray.PartInventory
              itemArray.forEach(element => {
                if(element.partColor){color = element.partColor}
                if(element.partSize){size = element.partSize}
                this.partDesc = element.partDescription
                this.items.push({'partID': element.partId, 'attributeColor': color, 'attributeSize': size, 'quantityAvailable': element.quantityAvailable.Quantity.value})
              });
            }else{
              soapBody=result.Envelope.Body.Reply;
              itemArray = soapBody.ProductVariationInventoryArray.ProductVariationInventory

            
            
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
</style>
