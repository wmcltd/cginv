<template>
  <v-container>
    <v-overlay :value="overlay">
      <v-row>
        <v-progress-circular :size="100" indeterminate></v-progress-circular>
      </v-row>
      <v-row>
        <v-btn @click="clearOverlay()">Cancel</v-btn>
      </v-row>
    </v-overlay>
 
    <v-btn @click="validateJson()">test validator</v-btn>
    <h2 class="mb-5">Supplier Inventory Search</h2> - {{curSupplier}}
    <v-card style="background:#F5F5F5;">
      <v-card-text>
    <v-row>
      <v-col>
        <v-select
          :items="supplierData"
          item-text="supplierId"
          item-value="supplierId"
          label="Select Supplier"
          @change="setSupplier()"
          v-model="supplier"
          outlined
        ></v-select>
    
      </v-col>
      <v-col cols="6">
        <v-text-field
          label="Enter Item Id"
          v-model="productID"
          @change="setProductId()"
          clearable
          @click="clearItems()"
           outlined
        />
        <v-btn small color="primary"  @click="getInv()"
          >Search Inventory</v-btn>
         <!-- <v-btn class="ml-2" small color="primary" disabled @click="getInvAlt()"
          >Search Inventory OneSource</v-btn
        > -->
        <v-col cols="6" v-if="errorMsg.length > 0"
          ><span class="err">{{ errorMsg }}</span></v-col
        >
      </v-col>
    </v-row>
    <!-- <v-btn @click="getData('D100')">data</v-btn> -->
    <!-- altInv: {{altInv}} -->
    <v-row class="ml-3">
      <v-col cols="6">
      <span style="color: blue; font-size:1.1rem;font-weight: 300">{{ foundProductID }} |</span
      ><span style="margin-left: 7px; font-weight: 300">{{ partDesc }}</span>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <span style="font-size: 0.8rem; font-weight: 300; color:#000;"
          >Click on column names to sort</span
        >
      </v-col>
      <v-col cols="12">
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
      <v-col cols="10">
        <p style="font-size: 1rem; color: #6d6d6d">
          RawData | {{ version
          }}<v-btn
            x-small
            @click="showRaw = !showRaw"
            class="ml-3"
            color="warning"
            >Show/Hide</v-btn
          >
        </p>
        <div v-if="showRaw" style="font-size: 0.8rem; color: #6d6d6d">
          <vue-json-pretty
            :path="'res'"
            :data="rawData"
            :deepCollapseChildren="true"
          >
          </vue-json-pretty>
        </div>
      </v-col>
    </v-row>
    </v-card-text>
    </v-card>
  </v-container>
</template>

<script>

import axios from "axios";
import xml2js from "xml2js";
import suppliers from "../assets/suppliers.json";
import supplierEndpoints from "../assets/supplierEndpoints.json"
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

export default {
  
  components: {
    VueJsonPretty,
  },
  data() {
    return {
      supplierData: suppliers.data,
      supplierEndpoints: supplierEndpoints,
      showRaw: false,
      
      errorMsg: "",
      supplier: "",
      version: "",
      rawData: "",
      productID: "",
      foundProductID: "",
      invResponse: "",
      partDesc: "",
      sku: "",
      headers: [
        {
          text: "Product ID",
          value: "productId",
        },
        {
          text: "Part ID",
          align: "start",
          sortable: true,
          value: "partId",
        },
        {
          text: "Color",
          value: "attributeColor",
        },
        {
          text: "Size",
          value: "attributeSize",
        },
        {
          text: "Quantity Available",
          align: "start",
          sortable: true,
          value: "quantityAvailable",
        },
      ],
      items: [],
    };
  },
  created() {
    this.supplierData = this.supplierData.sort((a, b) =>
      a.supplierId > b.supplierId ? 1 : -1
    );
    this.$store.dispatch("setSuppliers")
  
  },
  computed: {
    overlay(){
      return this.$store.getters.getOverlay
    },
    allSuppliers(){
      return this.$store.getters.getSuppliers
    },
    disabled() {
      if (this.supplier && this.productID) {
        return false;
      } else {
        return true;
      }
    },
    altInv(){
      if(this.$store.getters.getInventory.length>0){
        return this.$store.getters.getInventory
      }else{
        var altInv = []
        return altInv
      }
      
    },
    // supplier(){
    //   return this.$store.getters.getSupplier
    // }
  },
  methods: {
    // getData(itemId){
    //   itemId='D100'
    //   this.$store.dispatch('setItemData',itemId)
    // },
    validateJson(){
      alert('go')
      this.$store.dispatch("jsonValidate", this.rawData)
    },

    clearItems() {
      this.items = [];
      this.rawData= [];
    },

    setProductId(){
      this.$store.dispatch('setProductId', this.productID)
    },
    setSupplier(){
      this.$store.dispatch('setSupplier', this.supplier)
    },
    clearOverlay(){
      this.$store.dispatch('setOverlay', false)
    },
    getInvAlt(){
      var data = {}
      data.supplierId=this.supplier
      
      data.productId=this.productId
      data.supplierEndpoints = this.supplierEndpoints
      data.service = 'Inventory'
      this.$store.dispatch('setPSInventory', data)
    },
    getInv() {
     this.$store.dispatch('setOverlay', true)
      this.items = [];
      const supplierDataObj = this.supplierData.filter((e) => {
        return e.supplierId.toUpperCase() == this.supplier.toUpperCase();
      });
      console.log("target Supplier", this.supplier);
      console.log("supplierFound", supplierData);
      const supplierData = supplierDataObj[0];
      this.version = supplierData.version;

      var qry = "";
      if (supplierData.version == "1.2.1") {
        qry =
          `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" >
        <soap:Body>
          <Request xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">
            <wsVersion>` +
          supplierData.version +
          `</wsVersion>
            <id>` +
          supplierData.username +
          `</id>
            <password>` +
          supplierData.pwd +
          `</password>
            <productID>` +
          this.productID.toUpperCase() +
          `</productID>
            <productIDtype>Supplier</productIDtype>
          </Request>
        </soap:Body>
      </soap:Envelope>`;
      } else {
        //version 2.0.0
        qry =
          `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/2.0.0/" xmlns:shar="http://www.promostandards.org/WSDL/InventoryService/2.0.0/SharedObjects/">
              <soapenv:Header/>
              <soapenv:Body>

          <GetInventoryLevelsRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/">
            <wsVersion xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` +
          supplierData.version +
          `</wsVersion>
            <id xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` +
          supplierData.username +
          `</id>
            <password xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` +
          supplierData.pwd +
          `</password>
            <productId xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` +
          this.productID.toUpperCase() +
          `</productId>
          
          </GetInventoryLevelsRequest>

          </soapenv:Body>
          </soapenv:Envelope>`;
      }

      var config = {
        method: "post",
        // url: '/default/promostandardsProxy?url='+supplierData.endpoint,
        url:
          "https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url=" +
          supplierData.endpoint +
          "&soapAction=" +
          "getInventoryLevels",
        //url: 'https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url='+supplierData.endpoint,
        headers: {
          "Content-Type": "text/xml",
        },
        data: qry,
        soapAction: "getInventoryLevels",
      };

      console.log("config:", config);
     // this.overlay = true;
      axios(config).then((response) => {
        console.log("RESPONSE:", JSON.stringify(response.data));
       
        var xml = response.data;
        // convert XML to JSON
        var options = {
          explicitArray: false,
          tagNameProcessors: [xml2js.processors.stripPrefix],
        };
        xml2js.parseString(xml, options, (err, result) => {
          if (err) {
            throw err;
          }
          try{
            var productNotFoundErr = ''
            if('productID' in result.Envelope.Body.Reply){
               if(result.Envelope.Body.Reply.productID.toUpperCase() !== this.productId.toUpperCase()){
               productNotFoundErr =  result.Envelope.Body.Reply.productID
               this.$store.dispatch('setOverlay', false)
               console.log('product Error', productNotFoundErr)
               this.errorMsg = 'Product Id '+productNotFoundErr
              }
            }else{alert('productID not found')}
            if('productId' in result.Envelope.Body.Reply){
               if(result.Envelope.Body.Reply.productId.toUpperCase() !== this.productId.toUpperCase()){
               productNotFoundErr =  result.Envelope.Body.Reply.productID
               this.$store.dispatch('setOverlay', false)
               console.log('product Error', productNotFoundErr)
               this.errorMsg = 'Product Id '+productNotFoundErr  
              }
            }else{alert('productId not found')}
           
           
          }catch(e){
            console.log(e)
          }
          try {
            this.errorMsg =
              result.Envelope.Body.GetInventoryLevelsResponse.ServiceMessageArray.ServiceMessage.description;
             this.$store.dispatch('setOverlay', false)
          } catch (e) {
            //no errors
            this.errorMsg = "";
          }
          if (supplierData.version == "1.2.1") {
            try {
              this.errorMsg = result.Envelope.Body.Request.errorMessage;
              this.overlay = false;
            } catch (e) {
              //no errors
              this.errorMsg = "";
            }
          }

          // Get the soap body object
          this.foundProductID = this.productID.toUpperCase();
          var soapBody = "";
          var itemArray = [];
          var color = "";
          var size = "";
          var quantityAvailable = "";
          if (supplierData.version == "2.0.0") {
            //inventory version 2.0.0
            soapBody = result.Envelope.Body;
           // console.log('soapBody', soapBody)
            //check for 2.0.0 error msg
            console.log('*****', soapBody.Reply)
            itemArray =
              soapBody.GetInventoryLevelsResponse.Inventory.PartInventoryArray
                .PartInventory;
            this.rawData = itemArray;
            var singleItem = false;
           
            // if (typeof itemArray == "object") {
            //   singleItem = true;
            // }
            if(typeof itemArray == 'object' && itemArray.length == undefined){
              singleItem = true
            }
             console.log('singleItem?', singleItem, 'response length: ', itemArray.length, 'ver', supplierData.version, 'type', typeof itemArray, 'itemArray', itemArray)
            if (!singleItem) {
              
              itemArray.forEach((element) => {
                if ("partColor" in element) {
                  color = element.partColor;
                }
                if ("labelSize" in element) {
                  //console.log('LABEL SIZE FOUND')
                  size = element.labelSize;
                }
                // if (element.quantityAvailable.Quantity.value) {
                //   quantityAvailable = element.quantityAvailable.Quantity.value;
                // } else if ("quantityAvailable" in itemArray) {
                //   quantityAvailable = element.quantityAvailable.Quantity.value;
                // } else {
                //   quantityAvailable = "N/A";
                // }
               var  quantityAvailable = 'n/a'
              if('quantityAvailable' in itemArray){
                quantityAvailable = itemArray.quantityAvailable.Quantity.value
              }
                this.partDesc = element.partDescription;
                this.items.push({
                  productId: this.foundProductID,
                  partId: element.partId,
                  attributeColor: color,
                  attributeSize: size,
                  quantityAvailable: quantityAvailable,
                });
              });
            } else {
              //parse single item from version 2.0.0
              quantityAvailable = 'n/a'
              if('quantityAvailable' in itemArray){
                quantityAvailable = itemArray.quantityAvailable.Quantity.value
              }
              
              this.items.push({
                productId: this.foundProductID,
                partId: itemArray.partId,
                attributeColor: itemArray.partColor,
                attributeSize: itemArray.labelSize,
                quantityAvailable: quantityAvailable,
              });
            }
          } else {
            //inventory version 1.2.1
            soapBody = result.Envelope.Body.Reply;
            itemArray =
              soapBody.ProductVariationInventoryArray.ProductVariationInventory;
            this.rawData = itemArray;
            console.log("BODY:", soapBody);
           // console.log("itemArray", itemArray);
            console.log('response length: ', itemArray.length, 'ver', supplierData.version, 'itemArray', itemArray)
            /** parse itemArray into items object **/
            if (itemArray.length > 0) {
              itemArray.forEach((element) => {
                if (element.attributeColor) {
                  color = element.attributeColor;
                }
                if (element.attributeSize) {
                  size = element.attributeSize;
                }
                this.partDesc = element.partDescription;
                this.items.push({
                  productId: this.foundProductID,
                  partID: element.partID,
                  attributeColor: color,
                  attributeSize: size,
                  quantityAvailable: element.quantityAvailable,
                });
              });
            } else {
              if (itemArray.attributeColor) {
                color = itemArray.attributeColor;
              }
              this.partDesc = itemArray.partDescription;
              this.items.push({
                productId: this.foundProductID,
                partID: itemArray.partID,
                attributeColor: color,
                quantityAvailable: itemArray.quantityAvailable,
              });
            }
          }
          //this.items = itemArray
          console.log("items", this.items);
         // this.overlay = false;
        this.$store.dispatch('setOverlay', false)
        });
      });
    },
  },
};
</script>

<style>
.invTbl tr,
tr {
  border: 1px solid #666;
  border-collapse: collapse;
}
.err {
  color: red !important;
}
.input__slot, fieldset{
  background:#fff !important;
}
</style>
