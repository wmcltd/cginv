import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import xml2js from "xml2js";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    suppliers: [],
    supplier: '',
    productData: [],
    rawProductData: [],
    productId: '',
    invData: '',
    overlay: false,
  },
  mutations: {
    SET_SUPPLIERS(state, data) {
      state.suppliers = data;
    },
    SET_SUPPLIER(state, data) {
      state.supplier = data;
    },
    SET_PRODUCT_DATA(state, data) {
      state.productData.push(data);
    },
    CLEAR_PRODUCT_DATA(state){
      state.productData =[]
    },
    SET_RAW_PRODUCT_DATA(state, data){
      state.rawProductData.push(data)
    },
    SET_PRODUCT_ID(state, data){
      state.productId = data
    },
    SET_INVENTORY_DATA(state, data){
      state.invData = data
    },
    SET_OVERLAY(state, data){
      state.overlay = data
    }
  },
  actions: {
    setSuppliers({ commit }) {
      console.log("setSuppliers");
      var dcUrl = "https://api.dc-onesource.com/ps/companies";
      axios.get(dcUrl).then((response) => {
        console.log(response);
        commit("SET_SUPPLIERS", response.data);
      });
    },
    setPSData({ commit }, data) {

      //clear prior data
      commit('CLEAR_PRODUCT_DATA')
      commit('SET_OVERLAY', true)
      var ver = data.ver
      console.log('ver', ver, 'supplierId', data.supplierId)
      console.log("getPSData");

      //getEndpoints and filter to requested service URL
      //NOTE: onesource api is not working, so skip this now and maintain internally
      // const endpoint = dispatch("getEndpoints", data.supplierId)
      // console.log('endpoint', endpoint)
      // axios.get('https://api.dc-onesource.com/ps/companies/'+data.supplierId+'/endpoints')
      // .then(response =>{
      //   console.log('getEndpoints RESPONSE:', response)
      // })
      //return endpoint from supplierEndpoints.json file
      console.log('query data', data)
      // alert('get endpoint for ' +  data.supplierId +' '+ data.serviceName)
      const endpoint = data.supplierEndpoints.filter( e=>{
        return e['Supplier Name'] == data.supplierId
      })
      // const serviceCode = endpoint.filter(e =>{
      //   return e['Service Name'] == data.serviceName
      // })

      //alert(endpoint[0]['Supplier Name'] + " " + serviceCode[0]['Service Name'])
      var dcUrl =
        "https://api.dc-onesource.com/xml/" + endpoint[0]['Supplier Code'] + "/Product/"+ver+"/soap";
      
      var xmlProductData = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/`+ver+`/" 
        xmlns:shar="http://www.promostandards.org/WSDL/ProductDataService/`+ver+`/SharedObjects/">

          <soapenv:Header/>
          <soapenv:Body>
              <ns:GetProductRequest>
                  <shar:wsVersion>`+ver+`</shar:wsVersion>
                  <shar:id>CED75D76-130C-4DA8-BBEA-E59C3F3F1ADC</shar:id>
                  <!--Optional:-->
                  <shar:password>RFA6HG2-D0XMV8C-MWFBRT2-E383EE6</shar:password>
                  <!--Optional:-->
                  <shar:productId>`+data.itemId+`</shar:productId>
                  <shar:productIDtype>Supplier</shar:productIDtype>
                  <!--Optional:-->
                  <!-- <shar:partId></shar:partId> -->
                  <shar:localizationCountry>US</shar:localizationCountry>
                  <shar:localizationLanguage>en</shar:localizationLanguage>
                  <!-- <shar:isSellable>true</shar:isSellable> -->
              </ns:GetProductRequest>
          </soapenv:Body>
      </soapenv:Envelope>`;
      
      //  var xmlInventory= `
      //   <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
      //   xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/`+ver+`/" 
      //   xmlns:shar="http://www.promostandards.org/WSDL/ProductDataService/`+ver+`/SharedObjects/">

      //     <soapenv:Header/>
      //     <soapenv:Body>
      //         <ns:GetProductRequest>
      //             <shar:wsVersion>`+ver+`</shar:wsVersion>
      //             <shar:id>CED75D76-130C-4DA8-BBEA-E59C3F3F1ADC</shar:id>
      //             <!--Optional:-->
      //             <shar:password>RFA6HG2-D0XMV8C-MWFBRT2-E383EE6</shar:password>
      //             <!--Optional:-->
      //             <shar:productId>`+data.itemId+`</shar:productId>
      //             <shar:productIDtype>Supplier</shar:productIDtype>
      //             <!--Optional:-->
      //             <!-- <shar:partId></shar:partId> -->
      //             <shar:localizationCountry>US</shar:localizationCountry>
      //             <shar:localizationLanguage>en</shar:localizationLanguage>
      //             <!-- <shar:isSellable>true</shar:isSellable> -->
      //         </ns:GetProductRequest>
      //     </soapenv:Body>
      // </soapenv:Envelope>`;

      var xml = xmlProductData
      var config = {
        headers: { "Content-Type": "text/xml; charset=utf-8" },
        url:
          "https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url=" +
          dcUrl +
          "&soapAction=" +
          "getProduct",
        method: "POST",
        data: xml,
      };

     
      axios(config).then((response) => {
        console.log(response.data);
        var options = {
          explicitArray: false,
          tagNameProcessors: [xml2js.processors.stripPrefix],
        };
        xml2js.parseString(response.data, options, (err, result) => {
          if (err) {
            throw err;
          }
          var body = result.Envelope.Body.GetProductResponse;
          var productData = body.Product;
          commit('SET_RAW_PRODUCT_DATA', productData)
          var marketingPoints =''
          if('ProductMarketingPointArray' in productData){
            marketingPoints = productData.ProductMarketingPointArray.ProductMarketingPoint
          }
          
          var pointString = "";
          var productCategories = ''
          if('ProductCategoryArray' in productData){
           productCategories = productData.ProductCategoryArray.ProductCategory.category
          }

          for (var i = 0; i < marketingPoints.length; i++) {
            pointString += "<li>" +  marketingPoints[i].pointType + ": " + marketingPoints[i].pointCopy + "</li>";
          }
          var productPartArray = productData.ProductPartArray.ProductPart
          console.log('productPartArray', productPartArray)
          var lines = []
          var parts = []
          var labelSize = ''
          var color_size = ''
          for(var n = 0; n < productPartArray.length; n++){
            if('ApparelSize' in productPartArray[n] ){
              labelSize = productPartArray[n].ApparelSize.labelSize
            }
            parts.push(
              {
               'partId': productPartArray[n].partId,
               'size' : labelSize,
               'color' : productPartArray[n].ColorArray.Color.colorName
              }
            )
            //create a comma-separated list of colors/sizes
            color_size = color_size +  productPartArray[n].ColorArray.Color.colorName +'/'+labelSize+','
            var productBrand = ''
            if( 'productBrand' in productData){
              productBrand = productData.productBrand
            }
            var productId = ''
            if('productId' in productData){
                productId =  productData.productId
              }else{
                productId = productData.productID
              }
            // var qty
            // var productCategory = ''
            // if(productCategories.length>0){
            //   productCategory ==productCategories
            // }
            lines.push({
              productId : productId,
              productName: productData.productName,
              partId: productPartArray[n].partId,
              productDesc: productData.description,
              marketingPoints: pointString,
              productCategory : productCategories,
              productBrand : productBrand,
              size : labelSize,
              color : productPartArray[n].ColorArray.Color.colorName,
              
             

            })
          }
          var data = [];
          data.push({
            productId: productId,
            productName: productData.productName,
            productBrand: productBrand,
            productDesc: productData.description,
            marketingPoints: pointString,
            productCategory : productCategories,
            parts: parts,
            colorsSizes: color_size,

          });
          console.log("body:---", body);
          console.log('filtered data to push', data)
          commit("SET_PRODUCT_DATA", data[0]);
          commit('SET_OVERLAY', false)
        });
      });
    
    },
    setProductId({commit}, id){
      commit('SET_PRODUCT_ID', id)
    },
    setSupplier({commit}, id){
      commit('SET_SUPPLIER', id)
    },
    setOverlay({commit}, value){
      commit('SET_OVERLAY', value)
    },
    setPSInventory( {commit} , data){
      commit('CLEAR_PRODUCT_DATA')
      commit('SET_OVERLAY', true)
      console.log(data.supplierEndpoints)
       const endpoint = data.supplierEndpoints.filter( e=>{
        return e['Supplier Code'] == data.supplierId && e['Service Name'] == data.service
      })
      if(endpoint.length==0){alert('This service is not available from the supplier.')}
      console.log('endpoints found for ' + data.supplierId, endpoint[0]['WSDL Link'])
      console.log('endpoint0 data', endpoint[0])
      var dcUrl = endpoint[0]['WSDL Link']
      var ver = endpoint[0]['WsVersion']
      // var dcUrl =
      //   "https://api.dc-onesource.com/xml/" + endpoint[0]['Supplier Code'] + "/Inventory/"+ver+"/soap";
      var qry = "";
      if (ver == "1.2.1") {
        qry =
          `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" >
        <soap:Body>
          <Request xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">
            <wsVersion>` +
          ver +
          `</wsVersion>
           <shar:id>CED75D76-130C-4DA8-BBEA-E59C3F3F1ADC</shar:id>
                  <!--Optional:-->
                  <shar:password>RFA6HG2-D0XMV8C-MWFBRT2-E383EE6</shar:password>
            <productID>` +
          data.productId.toUpperCase() +
          `</productID>
            <productIDtype>Supplier</productIDtype>
          </Request>
        </soap:Body>
      </soap:Envelope>`;
      } else {
        //version 2
        qry =
          `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.promostandards.org/WSDL/InventoryService/2.0.0/" xmlns:shar="http://www.promostandards.org/WSDL/InventoryService/2.0.0/SharedObjects/">
              <soapenv:Header/>
              <soapenv:Body>

          <GetInventoryLevelsRequest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/">
            <wsVersion xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` +
          ver +
          `</wsVersion>
            <shar:id>CED75D76-130C-4DA8-BBEA-E59C3F3F1ADC</shar:id>
            <shar:password>RFA6HG2-D0XMV8C-MWFBRT2-E383EE6</shar:password>
            <productId xmlns="http://www.promostandards.org/WSDL/Inventory/2.0.0/SharedObjects/">` +
          data.productId.toUpperCase() +
          `</productId>
          
          </GetInventoryLevelsRequest>

          </soapenv:Body>
          </soapenv:Envelope>`;
      }
      console.log('Onessource INV qry', dcUrl, qry)
      var config = {
        headers: { "Content-Type": "text/xml; charset=utf-8" },
        url:
          "https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url=" +
          dcUrl +
          "&soapAction=" +
          "getInventoryLevels",
        method: "POST",
        data: qry,
      };
      axios(config).then((response) => {
        console.log(response.data);
        var options = {
          explicitArray: false,
          tagNameProcessors: [xml2js.processors.stripPrefix],
        };
        xml2js.parseString(response.data, options, (err, result) => {
          if (err) {
            throw err;
          }
          var body = result.Envelope.Body
          var inventoryLevelArray = ''
          var invData=[]
          var size = 'n/a'
          if(ver=='2.0.0'){
            console.log('Ver', ver)
            inventoryLevelArray = body.GetInventoryLevelsResponse.Inventory.PartInventoryArray.PartInventory
            console.log('inventoryLevelArray', inventoryLevelArray)
            
            for(var z = 0; z < inventoryLevelArray.length; z++ ){
           
             if('labelSize' in inventoryLevelArray[z]){
              size = inventoryLevelArray[z].labelSize
             }
             
             invData.push({
                productId: data.productId.toUpperCase(),
                partId: inventoryLevelArray[z].partId,
                partDescription: inventoryLevelArray[z].partDescription, 
                quantityAvailable: inventoryLevelArray[z].quantityAvailable.Quantity.value,
                attributeColor: inventoryLevelArray[z].partColor, 
                attributeSize: size
              })
            }
            commit('SET_INVENTORY_DATA', invData)
          }else{
            //parse xml for version 1.2.1
            inventoryLevelArray = body.Reply.ProductVariationInventoryArray.ProductVariationInventory
            if('attributeSize' in inventoryLevelArray){
              size = inventoryLevelArray[i].attributeColor
            }
            for(var i = 0; i < inventoryLevelArray.length; i++ ){
              console.log(inventoryLevelArray[i].partID,inventoryLevelArray[i].partDescription, inventoryLevelArray[i].quantityAvailable, inventoryLevelArray[i].attributeColor )
              invData.push({
                productId: data.productId.toUpperCase(),
                partId: inventoryLevelArray[i].partID,
                partDescription: inventoryLevelArray[i].partDescription, 
                quantityAvailable: inventoryLevelArray[i].quantityAvailable,
                attributeColor: inventoryLevelArray[i].attributeColor, 
                attributeSize: size
              })
            }
            commit('SET_INVENTORY_DATA', invData)
          }
          console.log('version/body', ver, body)


        })
        commit('SET_OVERLAY', false)
      })

    },
    // getEndpoints(data){
    //   console.log('start getEndpoints', data)
    //   // axios.get('https://api.dc-onesource.com/ps/companies/'+data.supplierId+'/endpoints')
    //   //   .then(response =>{
    //   //     console.log('getEndpoints RESPONSE:', response)
    //   //   })
    // }
  },
  getters: {
    getSuppliers(state) {
      return state.suppliers;
    },
    getSupplier(state) {
      return state.supplier;
    },
    getProductData(state) {
      return state.productData;
    },
    getRawProductData(state){
      return state.rawProductData
    },
    getProductId(state){
      return state.productId
    },
    getInventory(state){
      return state.invData
    },
    getOverlay(state){
      return state.overlay
    }
  },
});
