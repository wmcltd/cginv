<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <Homepage />
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Homepage from "@/components/Homepage.vue";
export default {
  name: "Home",
  components: {
    // HelloWorld,
    Homepage,
  },
};
</script>
