<template>
  <v-container>
    <v-btn @click="getSuppliers()">Get Suppliers</v-btn>
    <v-select
      placeholder="Select Supplier"
      :items="suppliers"
      item-text="Name"
      item-value="Code"
      v-model="supplier"
    />
    <v-select
      placeholder="Select Service"
      :items="services"
      item-text="Name"
      item-value="Code"
      v-model="service"
    />

    
    <v-text-field placeholder="Enter Item" v-model="itemId" />
    <v-btn @click="setPSData()">GetPSData</v-btn>
    <v-data-table
      :headers="productDataHeaders"
      :items="productData"
      show-expand=true
      class="elevation-1"
    >
     <!-- <template v-slot:expanded-item="{ headers }">
        <td :colspan="headers.length">Peek-a-boo!</td>
      </template> -->

    </v-data-table>
    <div>{{ productData }}</div>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      supplierId: "alphabroder",
      suppliers: [],
      supplier: "",
      services: [
        { Name: "Inventory", Code: "INV" },
        { Name: "Product Data", Code: "PRODUCT" },
        { Name: "Pricing & Congiguration", Code: "PPC" },
      ],
      service: "",
      itemId: "",
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
    };
  },
  created() {
    this.getSuppliers();
  },
  methods: {
    getSuppliers() {
      this.$store.dispatch("setSuppliers").then((response) => {
        console.log(response);
        this.suppliers = this.$store.getters.getSuppliers;
      });
    },
    setPSData() {
      var data = {}
      data.ver = '1.0.0'
      data.itemId = this.itemId
      this.$store.dispatch("setPSData", data).then((response) => {
        console.log(response);
        this.productData = this.$store.getters.getProductData;
      });
    },
  },
};
</script>
