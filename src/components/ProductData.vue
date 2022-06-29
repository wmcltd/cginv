<template >
  <v-container >
    <h2 class="mb-5">Product Data Search</h2>
    <!-- <v-btn @click="show =!show" x-small color="secondary">Product Data Beta</v-btn> -->
    <v-card v-if="show" class="mt-5">
      <v-card-text>
     <!-- <v-btn @click="getSuppliers()">Get ALL Suppliers</v-btn> -->
   <v-select
      label="PS Service"
      placeholder="Select Service"
      :items="services"
      item-text="Name"
      item-value="Name"
      v-model="service"
    />   
    <v-select
      label="Supplier"
      placeholder="Select Supplier"
      :items="suppliers"
      item-text="Name"
      item-value="Name"
      v-model="supplier"
      
    />
   

    
    <!-- <v-text-field placeholder="Enter Item" v-model="itemId" /> -->
     <v-text-field label="Item Id" placeholder="Set Above" v-model="productID" />
    <v-btn @click="setPSData()">Get PromoStandards Data</v-btn>
    <v-data-table
      :headers="productDataHeaders"
      :items="productData"
      :expanded.sync="expanded"
      show-expand=true
      class="elevation-0"
      dense
    >
      <template v-slot:expanded-item="{ headers, item }">
        <td :colspan="headers.length">
          <v-data-table
            :headers="subHeaders"
            :items="item.parts"
            class="elevation-0"
            dense
          />
        </td>
      </template>

    </v-data-table>
    <!-- <div>{{ productData }}</div> -->
       <vue-json-to-csv :json-data="rawProductData" csv-title="ProductData" >
              <v-btn color="primary" small class="mt-3 mr-6"
                 disabled="false">
                Export Product Data File <i class="mdi mdi-export-variant" aria-hidden="true"></i>
              </v-btn>
            </vue-json-to-csv>
     <p style="font-size: 1rem; color: #6d6d6d">
          RawData | <v-btn
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
            :data="rawProductData"
            :deepCollapseChildren="true"
          >
          </vue-json-pretty>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import supplierEndpoints from "../assets/supplierEndpoints.json"
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
import VueJsonToCsv from 'vue-json-to-csv'
export default {
  components:{
    VueJsonPretty,
   VueJsonToCsv
  },  
  data() {
    return {
      show:true,
      showRaw: false,
      expanded: true,
      supplierId: "alphabroder",
      //suppliers: [],
     // itemId: '',
      supplier: "",
      supplierEndpoints: supplierEndpoints,
      services: [
        // { Name: "Inventory", Code: "INV" },
        { Name: "Product Data", Code: "PRODUCT" },
        // { Name: "Pricing & Congiguration", Code: "PPC" },
      ],
      service: "",
      //itemId: "",
      rawProductData: '',
      productDataHeaders: [
        {
          text: "Product Id",
          value: "productId",
        },
        {
          text: "Product name",
          value: "productName",
        },
        {
          text: "Brand",
          value: "productBrand",
        },
        {
          text: "Category",
          value: 'productCategory'
        },
        {
          text: "Description",
          value: "productDesc",
        },
        {
          text: "Marketing Points",
          value: "marketingPoints",
        },
      ],
      productData: [],
      subHeaders: [
        {
          text: 'partId',
          value: 'partId'
        },
        {
          text: 'Size',
          value: 'size'
        },
        {
          text: 'Color',
          value: 'color'
        }
      ],
    };
  },
  created() {
    this.$store.dispatch("setSuppliers")
  },
  computed:{
    // supplier(){
    //   return this.$store.getters.getSupplier
    // },
    productID(){
      return this.$store.getters.getProductId
    },
    suppliers(){
      return this.$store.getters.getSuppliers
     
    }
  },
  methods: {
    getSuppliers() {
      alert('geting them')
      this.$store.dispatch("setSuppliers").then((response) => {
        console.log(response);
        this.suppliers = this.$store.getters.getSuppliers;
      });
    },
    setPSData() {
      var data = {}
      data.ver = '1.0.0'
      data.itemId = this.productID
      data.serviceName = this.service
      data.supplierId = this.supplier
      data.supplierEndpoints = this.supplierEndpoints
      this.$store.dispatch("setPSData", data).then((response) => {
        console.log(response);
        this.productData = this.$store.getters.getProductData;
        this.rawProductData = this.$store.getters.getRawProductData;
      });
    },
  },
};
</script>
