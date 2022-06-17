import Vue from "vue";
import Vuex from "vuex";
import axios from "axios";
import xml2js from "xml2js";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    suppliers: [],
    productData: [],
  },
  mutations: {
    SET_SUPPLIERS(state, data) {
      state.suppliers = data;
    },
    SET_PRODUCT_DATA(state, data) {
      state.productData.push(data);
    },
    CLEAR_PRODUCT_DATA(state){
      state.productData =[]
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
      console.log('ver', ver)
      console.log("getPSData");
      var dcUrl =
        "https://api.dc-onesource.com/xml/alphabroder/Product/"+ver+"/soap";
      var xml = `
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
      console.log('xml', xml)
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
          var marketingPoints =
            productData.ProductMarketingPointArray.ProductMarketingPoint;
          var pointString = "";
          var productCategories = productData.ProductCategoryArray.ProductCategory.category
          for (var i = 0; i < marketingPoints.length; i++) {
            pointString += i + 1 + ") " + marketingPoints[i].pointCopy + ", ";
          }
          var productPartArray = productData.ProductPartArray.ProductPart
          console.log('productPartArray', productPartArray)
          var parts = []
          for(var n = 0; n < productPartArray.length; n++){
            parts.push(
              {
               'partId': productPartArray[i].partId,
               'size' : productPartArray[i].ApparelSize.labelSize,
               'color' : productPartArray[i].ColorArray.Color.colorName
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
  },
  getters: {
    getSuppliers(state) {
      return state.suppliers;
    },
    getProductData(state) {
      return state.productData;
    },
  },
});
