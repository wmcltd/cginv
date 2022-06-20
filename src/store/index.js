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
          var productCategories = productData.ProductCategoryArray.ProductCategory.category
          for (var i = 0; i < marketingPoints.length; i++) {
            pointString += i + 1 + ") " + marketingPoints[i].pointCopy + ", ";
          }
          var productPartArray = productData.ProductPartArray.ProductPart
          console.log('productPartArray', productPartArray)
          var parts = []
          var labelSize = ''
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
          }
          var data = [];
          data.push({
            productId: productData.productId,
            productName: productData.productName,
            productBrand: productData.productBrand,
            productDesc: productData.description,
            marketingPoints: pointString,
            productCategory : productCategories,
            parts: parts

          });
          console.log("body:---", body);
          commit("SET_PRODUCT_DATA", data[0]);
        });
      });
    
    },
    setProductId({commit}, id){
      commit('SET_PRODUCT_ID', id)
    },
    setSupplier({commit}, id){
      commit('SET_SUPPLIER', id)
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
    }
  },
});
