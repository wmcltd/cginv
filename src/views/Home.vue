<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
     <v-btn class="mr-1" @click="showInventory = !showInventory">Inventory Search</v-btn>
    <v-btn class="mr-1" @click="showDeco = !showDeco">Deco Calculator</v-btn>
     <v-btn class="mr-1" @click="showProductData = !showProductData">Product Data</v-btn>
    <Decoration v-if="showDeco" />
     
    <Homepage v-if="showInventory" />
    <ProductData v-if="showProductData" />
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Homepage from "@/components/Homepage.vue";
import Decoration from "@/components/DecoPricing.vue";
import ProductData from "@/components/ProductData.vue";
export default {
  name: "Home",
  components: {
    // HelloWorld,
    Homepage,
    ProductData,
    Decoration,
  },
  data() {
    return {
      showDeco: false,
      showInventory: true,
      showProductData: false,
    }
  },
  methods:{
    
  }
};
</script>
