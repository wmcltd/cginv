<template>
  <v-container>

    {{decorators}}
  </v-container>
</template>

<script>
import decorators from '../assets/decorators.json'
export default {
  data() {
    return {
      decorators: decorators
    }
  }
}
</script>