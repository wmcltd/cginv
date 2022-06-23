<template>
  <v-container>
      <h2>Decoration Cost Calculator</h2>
      
      <v-card class="mb-5">
         <v-card-title class="card-title">Inputs</v-card-title>
        <v-card-text>
       <v-row>
      <v-col>
         <!-- <v-text-field label="Vendor" v-model="vendor" /> -->
         <v-select
          :items="decoratorNames"
          item-text="decoratorName"
          v-model="vendor"
        />
      </v-col>
      <v-col>
         <v-text-field label="Deco Method" v-model="impMethod" />
      </v-col>
       <v-col>
         <v-text-field label="Item Qty" v-model="itemQty" />
      </v-col>
       <v-col>
         <v-text-field label="Imprint Locations" v-model="ImpLocations" />
      </v-col>
        <v-col>
         <v-text-field label="Imprint Colors/Location" v-model="ImpNumColors" />
      </v-col>
       </v-row>
       <v-row>
        <v-col>
          <v-checkbox label="Exact Rerun" v-model="exactRerun" />
        </v-col>
        <v-col>
         <v-checkbox label="PMS Match" v-model="pmsMatch" />
      </v-col>
       <v-col>
         <v-text-field label="# of Ship-To Addresses" v-model="numAddresses" />
      </v-col>
      </v-row>
       </v-card-text>
       <v-row>
       <v-card-actions>
        <v-col>
         <v-btn x-small color="primary" @click="search()">Calculate</v-btn>
        
        </v-col>
       </v-card-actions>
        </v-row>
      </v-card> 

      <v-card class="mb-8" >
        <v-card-title class="card-title">Results</v-card-title>
        <v-card-text v-if="showResults">
          <v-row class="ml-2">
          <h3>Deco Cost/piece: <span style="color:green; font-size:1.2rem;">${{results.cost}}</span></h3>
         </v-row>
         <v-row class="mt-10 ml-2">
         <h3>Additional Charges</h3>
         </v-row>
         <v-row>
          <v-col cols="12">
         <v-data-table  
          :items="additionalChgs"
          :headers="additionalChgHeaders"
          >
            <template v-slot:item.apply="{ item }">
              <v-simple-checkbox
                v-model="item.apply"
                disabled
              ></v-simple-checkbox>
             </template>
          </v-data-table> 
          </v-col>
           </v-row>
          <v-row style="background:#BEEBB0;">
            <v-col cols="4"><h3>Printing Subtotal: ${{printSubtotal}}</h3></v-col>
            <v-col cols="1"><h3>+</h3></v-col>
            <v-col cols="2"><h3>Addl Subtotal: ${{addlSubtotal}}</h3></v-col>
            <v-col cols="1"><h3>=</h3></v-col>
            <v-col cols="2"><h3>Grand Total: ${{grandTotal}}</h3></v-col>
          </v-row>
          <v-row v-if="1==2">
           {{results}}
          </v-row>
        </v-card-text>
      </v-card>
   
    <v-btn x-small @click="showAllData = !showAllData">Show All Data</v-btn>
     <div v-if="showAllData" style="font-size: 0.8rem; color: #6d6d6d">
          <vue-json-pretty
            :path="'res'"
            :data="decorators"
            :deepCollapseChildren="true"
          >
          </vue-json-pretty>
      </div>
   
  </v-container>
</template>

<script>
import decorators from '@/assets/decorators.json'
import VueJsonPretty from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";

export default {
  components:{
    VueJsonPretty
  },
  data() {
    return {
     
      showAllData: false,
      decorators: decorators,
      vendor: '',
      impMethod: 'silkscreen',
      itemQty: '',
      ImpLocations: 1,
      ImpNumColors: 1,
      numAddresses: 1,
      exactRerun: false,
      pmsMatch: false,
      results: '',
      additionalChgs: [],
      printSubtotal: 0,
      addlSubtotal: 0,
      grandTotal: 0,
      additionalChgHeaders:[
        {
          text: 'Charge Item',
          value: 'chargeId'
        },
        {
          text: 'ChargeType',
          value: 'chargeType'
        },
        { 
          text: 'Rate',
          value: 'cost'
        },
        {
          text: 'Total',
          value: 'lineTotal'
        },
        {
          text: 'Apply?',
          value: 'apply'
        }
      ]


    }
  },
  computed:{
    showResults(){
      if(this.grandTotal>0){
        return true
      }
      return false
    },
    decoratorNames(){
      var decoratorNames = []
      var curDecorator = ''
      for(var i =0; i < this.decorators.length; i++){
        curDecorator = decoratorNames.filter(e=>{
          return e.supplierId == this.decorators[i].supplierId
        })
        if(curDecorator.length==0){
           decoratorNames.push({'decoratorName': this.decorators[i].supplierId})
        }
      }
      return decoratorNames
    }
  },
  methods:{
    calcCharges(){
      this.addlSubtotal=0
      this.printSubtotal=0
      this.grandTotal=0
      for(var i = 0;  i < this.additionalChgs.length; i++){
        if(this.additionalChgs[i].apply){
          this.addlSubtotal = this.addlSubtotal + parseInt(this.additionalChgs[i].lineTotal)
        }
      }
      this.printSubtotal = (this.results.cost * this.itemQty)
      this.grandTotal = (this.addlSubtotal) + (this.printSubtotal)
    },
    search(){
     
      this.additionalChgs = []
      var results = this.decorators.filter(e =>{
        return e.supplierId === this.vendor &&
          e.impMethod === this.impMethod
      })
     
      if(results.length>0){
        var printCharges = results[0].printCharges.filter(e =>{
          return  e.itemMinQty <= this.itemQty &&
            e.itemMaxQty >= this.itemQty &&
            e.impColorQty == this.ImpNumColors
        })
        var additionalChgs = results[0].additionalChgs
        var lineChgTotal = 0
        var apply = false
        additionalChgs.forEach(e => {
          if(e.charType === 'perColor'){
            // alert(e.chargeId +', '+e.charType + ' #colors '+ this.ImpNumColors)
            lineChgTotal = this.ImpNumColors * parseInt(e.cost)
            console.log('setup costs: color, cost',  this.ImpNumColors,  e.cost)
          }
        if(e.chargeId == 'exactRerunSetup' && this.exactRerun){
           apply =true
        }
        if(e.chargeId == 'setup'){ apply=true }
        if(e.chargeId == 'pmsMatch' && this.pmsMatch){
          lineChgTotal = this.ImpNumColors * e.cost
          apply = true
        }
          this.additionalChgs.push({
            chargeId: e.chargeId,
            chargeType: e.charType,
            cost: e.cost,
            lineTotal:lineChgTotal,
            apply: apply
          })

          lineChgTotal = 0
          apply = false
        });
      }
      if(printCharges.length>0){
        //printCharges[0].cost =printCharges[0].cost.toFixed(2)
        this.results = printCharges[0]
       // this.printSubtotal = this.printSubtotal + (printCharges[0].cost * this.itemQty)
       
      }else{
        this.results = 'no results found'
      }
      this.calcCharges()
    }
   
  }
    
   
    
}
</script>

<style scoped>
.card-title{
  background:#6D6D6D;
  color:#FFF;
  margin-bottom:20px;
}
</style>