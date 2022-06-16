import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import xml2js from "xml2js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    suppliers: [],
    productData: []
  },
  mutations: {
    SET_SUPPLIERS(state, data){
      state.suppliers = data
    },
    SET_PRODUCT_DATA(state, data){
      state.productData.push(data)
    } 
  },
  actions: {
    setSuppliers({commit}){
      console.log('setSuppliers')
      var dcUrl = 'https://api.dc-onesource.com/ps/companies'
       axios.get(dcUrl).then(response =>{
        console.log(response)
        commit('SET_SUPPLIERS', response.data)
      })
    },
    setPSData({commit}){
      console.log('getPSData')
      var dcUrl = 'https://api.dc-onesource.com/xml/alphabroder/Product/1.0.0/soap'
      var xml = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
        xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/" 
        xmlns:shar="http://www.promostandards.org/WSDL/ProductDataService/1.0.0/SharedObjects/">

          <soapenv:Header/>
          <soapenv:Body>
              <ns:GetProductRequest>
                  <shar:wsVersion>1.0.0</shar:wsVersion>
                  <shar:id>CED75D76-130C-4DA8-BBEA-E59C3F3F1ADC</shar:id>
                  <!--Optional:-->
                  <shar:password>RFA6HG2-D0XMV8C-MWFBRT2-E383EE6</shar:password>
                  <!--Optional:-->
                  <shar:productId>88181</shar:productId>
                  <shar:productIDtype>Supplier</shar:productIDtype>
                  <!--Optional:-->
                  <!-- <shar:partId></shar:partId> -->
                  <shar:localizationCountry>US</shar:localizationCountry>
                  <shar:localizationLanguage>en</shar:localizationLanguage>
                  <!-- <shar:isSellable>true</shar:isSellable> -->
              </ns:GetProductRequest>
          </soapenv:Body>
      </soapenv:Envelope>`;
      
      var config = {
        headers: {'Content-Type': 'text/xml; charset=utf-8'},
        url: 'https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy?url='+dcUrl  + '&soapAction=' + 'getProduct',
        method: 'POST',
        data: xml
      }
      axios(config).then(response=>{
        console.log(response.data)
        var options = {explicitArray: false, tagNameProcessors: [xml2js.processors.stripPrefix] };
        xml2js.parseString(response.data, options,(err, result) => {
            if(err) {
                throw err;
            }
            var body = result.Envelope.Body.GetProductResponse.Product
            console.log('body:---',body)
            commit('SET_PRODUCT_DATA', JSON.stringify(body.productName))
          })
           
          
        
        
      })
    

  }
},
  getters:{
    getSuppliers(state){
      return state.suppliers
    },
    getProductData(state){
      return state.productData
    }
  }
  
  
});
