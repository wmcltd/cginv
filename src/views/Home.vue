<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <Homepage />
    <ProductData />
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Homepage from "@/components/Homepage.vue";
import ProductData from "@/components/ProductData.vue";
export default {
  name: "Home",
  components: {
    // HelloWorld,
    Homepage,
    ProductData,
  },
};
</script>
