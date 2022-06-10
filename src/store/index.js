import Vue from "vue";
import Vuex from "vuex";
// import axios from "axios";
// import xml2js from "xml2js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    data: []
  },
  mutations: {
     SET_DATA(state, data){
      state.data = data
    } 
  },
  actions: {
    //  setItemData({commit}, itemId){
    //   // var url = 'https://lv9bolq4ii.execute-api.us-east-1.amazonaws.com/dev/cors-proxy?url=https://services.alphabroder.com/productData2/service/index.php'
    //   //var url = 'https://rvxlgaoqa1.execute-api.us-east-1.amazonaws.com/Dev2?url=https://services.alphabroder.com/productData2/service/index.php'
    //   //var url = 'https://services.alphabroder.com/productData2/service/index.php'
    //   //var url = 'https://dx8hr99jwf.execute-api.us-east-1.amazonaws.com/Dev/dropShipProxyFunction?url=https://services.alphabroder.com/productData2/service/index.php'
    //   // var url = "https://dx8hr99jwf.execute-api.us-east-1.amazonaws.com"
    //   //  var url = '/productData2/service/index.php'
    //   //var url = 'https://2glymihrdd.execute-api.us-east-1.amazonaws.com/default/promostandardsProxy'
    //   var url = '/'
    //   // var data = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
    //   // xmlns:ns="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/" 
    //   // xmlns:shar="http://www.promostandards.org/WSDL/ProductDataService/2.0.0/SharedObjects/">   
    //   // <soapenv:Header/>   
    //   // <soapenv:Body>     
    //   //   <ns:GetProductRequest>          
    //   //     <shar:wsVersion>2.0.0</shar:wsVersion>          
    //   //     <shar:id>19</shar:id> 
    //   //     <shar:password>19</shar:password>       
    //   //     <shar:productId>` + itemId + `</shar:productId>           
    //   //     <shar:partId></shar:partId>          
    //   //     <shar:localizationCountry>US</shar:localizationCountry>           
    //   //     <shar:localizationLanguage>en</shar:localizationLanguage>           
    //   //     <shar:isSellable>true</shar:isSellable>        
    //   //   </ns:GetProductRequest>    
    //   // </soapenv:Body>\n</soapenv:Envelope>`;
    //   var data = `<?xml version="1.0" encoding="utf-8"?>\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" >\n    \n    <soap:Body>\n   <Request xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.promostandards.org/WSDL/InventoryService/1.0.0/">\n  <wsVersion>1.2.1</wsVersion>\n  <id>denar@corporategift.com</id>\n  <password>P9HghK5S</password>\n  <productID>`+itemId+`</productID>\n  <productIDtype>Supplier</productIDtype>\n  <!--<FilterColorArray>\n    <filterColor>Token1</filterColor>\n    <filterColor>Token2</filterColor>\n  </FilterColorArray>\n  <FilterSizeArray>\n    <filterSize>Token1</filterSize>\n    <filterSize>Token2</filterSize>\n  </FilterSizeArray>\n  <FilterSelectionArray>\n    <filterSelection>Token1</filterSelection>\n    <filterSelection>Token2</filterSelection>\n  </FilterSelectionArray>-->\n</Request>\n    </soap:Body>\n</soap:Envelope>`;
    //   console.log('request', data)
    //   var config = {
    //     method: 'post',
    //   //  url: 'https://services.alphabroder.com/productData2/service/index.php',
    //     url: url,
    //     // crossDomain: true,
    //     headers: { 
    //       // 'Content-Type': 'text/xml; charset=utf-8', 
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //       // 'SOAPAction': 'getProduct',
    //        'Access-Control-Allow-Origin' : '*'
    //     },
    //     data : data
    //   };

    //   axios(config)
    //   .then(function (response) {
    //     xml2js.parseString(response.data, { mergeAttrs: true }, (err, result) => {
    //       if(err) {
    //           throw err;
    //       }
    //       console.log(result)
    //       commit('SET_DATA', result)
    //       // if(typeof result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns2:GetProductResponse'][0]['ns1:ServiceMessageArray'] !== 'undefined'){
    //       //   //alert('Item Not Found')
    //       //  // commit('SET_APPAREL_ITEM_NOT_FOUND', true)
    //       //   //try NS hardgoods Promostandards endpoint next
    //       // // dispatch('setHardgoodsItemData', itemId)
    //       //   throw err;
    //       // }
    //       //commit('SET_HARDGOODS_ITEM_NOT_FOUND', false)
    //       //var colorSizeArray = []
    //       // var colors = []
    //       // var colorFound = false
    //       // var sizes = []
    //       // var sizeFound = false
    //       // //const json = JSON.stringify(result)
    //       // const partArray = result['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['ns2:GetProductResponse'][0]['ns2:Product'][0]['ns2:ProductPartArray'][0]['ns2:ProductPart']
          
    //       // for(var p=0; p < partArray.length; p++){
    //       //   var partId = partArray[p]['ns1:partId'][0]
    //       //   var color = partArray[p]['ns2:ColorArray'][0]['ns1:Color'][0]['ns1:colorName'][0]
    //       //   var size = partArray[p]['ns1:ApparelSize'][0]['ns1:labelSize'][0]
    //       //   //var part = {'partId': partId, 'color': color, 'size': size}
    //       //   console.log(partId, color, size)
    //       //   colorFound = colors.find(element => element == color);
    //       //   if(!colorFound && color.length > 0){ colors.push(color)}
    //       //   sizeFound = sizes.find(element => element == size);
    //       //   if(!sizeFound && size.length > 0){ sizes.push(size)}

    //       // }
    //       // //sort colors alphabetically
    //       // colors.sort()
    //       // console.log('colors', colors, 'sizes', sizes)
    //       // console.log('body', partArray)
    //       // //console.log(json);
    //       // commit('SET_COLORS', colors)
    //       // commit('SET_SIZES', sizes)
    //       // commit('SET_LOADING', false)
    //   });
      
        
    //   })

    //   .catch(function (error) {
    //     console.log(error);
    //   });
    // },
  },
  modules: {},
});
