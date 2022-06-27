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
          outlined
          dense
        />
        <!-- {{availMethods}} -->
      </v-col>
      <v-col>
         <!-- <v-text-field label="Deco Method" v-model="impMethod" dense /> -->
         <v-select
          :items="availMethods"
          item-text="method"
          item-value="code"
          v-model="impMethod"
          outlined
          dense
         />
      </v-col>
       <v-col>
         <v-text-field label="Item Qty" v-model="itemQty" dense />
      </v-col>
       <v-col>
         <v-text-field label="Imprint Locations" v-model.number="ImpLocations" @change=updateLocationArray() type="number" dense />
      </v-col>
     
       
      </v-row>
      <!-- location rows (dynamic)-->
      <v-row v-for="(val,index) in ImpLocations" :key="val" style="background:#DBECF0; border-top:1px solid #DEDEDE;border-bottom:1px solid #DEDEDE;margin-bottom:1px;">
          <v-col cols="2"><v-label><span style="font-weight:600;">Location # </span>{{val}}</v-label>
          </v-col>
          <v-col cols="2">
             <v-text-field label="Imprint Colors/Location" v-model="ImpLocationArray[index].impNumColors" dense />
             </v-col>
          <v-col cols="2" v-if="showStitchCount() ">
            <v-text-field label="Stitch Count" v-model="ImpLocationArray[index].stitchCount" dense />
          </v-col>
      </v-row>

       <v-row>
        <v-col>
          <v-checkbox label="Exact Rerun" v-model="exactRerun" />
        </v-col>
        <v-col>
         <v-checkbox label="PMS Match" v-model="pmsMatch" @click="checkit()" />
         <v-text-field v-if="pmsMatch" label="Num of PMS Match Colors" type="number" v-model="numPmsMatches" dense />
      </v-col>
       <v-col>
         <v-checkbox label="Dark Color Flash" v-model="flashChg" @click="checkFlash()" />
         <v-text-field v-if="flashChg" label="Num of Flashes" type="number" v-model="numFlashChgs" dense />
      </v-col>
       <v-col>
         <v-text-field label="# of Ship-To Addresses" type="number" v-model="numAddresses" />
      </v-col>
      </v-row>
       </v-card-text>
      
       <v-card-actions>
         <v-row align="center" >

        <!-- <v-col cols="8"></v-col>   -->
        <v-col>
          <v-btn small color="primary" @click="search()">Calculate</v-btn>
        </v-col>
        
          </v-row>
       </v-card-actions>
      
      </v-card> 
      <hr />
      
      <v-card class="mb-8" >
        <v-card-title class="card-title">Results</v-card-title>
        <!-- <v-card-text v-if="showResults"> -->
         <v-card-text v-if="1==1">
          <v-row class="ml-2">
          <h3>Deco Cost/piece: <span style="color:green; font-size:1.2rem;">${{decoCostPerPiece}}</span></h3>
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
import decorators from '@/assets/decorators2.json'
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
      ImpLocationArray: [
         {
         locationNum: 1,
         impNumColors: 1
         }
      ],
      decoCostPerPiece: 0,
      numAddresses: 1,
      exactRerun: false,
      pmsMatch: false,
      numPmsMatches: 0,
      flashChg: false,
      numFlashChgs: 0,
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
    /** @method
     * Return all methods avaiable from the selected decorator/supplier
     */
    availMethods(){
    // alert('vendor '+JSON.stringify(this.decorators))
    var availImpMethods = []
    var decorator = this.decorators.filter(e=>{
      return e.supplierId == this.vendor
    })
    if(decorator.length>0){
      for(var i = 0; i < decorator.length; i++){
        availImpMethods.push({'method' : decorator[i].impMethod.toUpperCase(), 'code' : decorator[i].impMethod })
      }
      //alert('found ' + JSON.stringify( availImpMethods ))
      return availImpMethods
    }else{
      return ''
    }
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
    showStitchCount(){
      if(this.impMethod === 'embroidery'){
        return true
      }
      return false
    },
    updateLocationArray(){
      this.ImpLocationArray.push(
        {
         locationNum: this.ImpLocations,
         impNumColors: 1
        }
      )
    },
   /* @TODO  */
    deleteLocationArray(){
      this.ImpLocationArray.splice(1)
    },
    checkFlash(){
     if(!this.flashChg){
        this.numFlashChgs = 0
      }
    },
    checkit(){
      if(!this.pmsMatch){
        this.numPmsMatches = 0
      }
    },
    calcCharges(){
      console.log('start calcCharges')
      this.addlSubtotal=0
      // this.printSubtotal=0
      this.grandTotal=0
      for(var i = 0;  i < this.additionalChgs.length; i++){
        if(this.additionalChgs[i].apply){
          this.addlSubtotal = this.addlSubtotal + (this.additionalChgs[i].lineTotal)
        }
      }
     // this.printSubtotal = (this.results.cost * this.itemQty)
      this.grandTotal = (this.addlSubtotal) + (this.printSubtotal)
      this.decoCostPerPiece =  (this.printSubtotal/this.itemQty)
      this.decoCostPerPiece = this.decoCostPerPiece.toFixed(2)
    },
    search(){
      // var sumColors = 0
      // for(var l = 0; l < this.ImpLocationArray.length; l++){
      //   sumColors+=parseInt(this.ImpLocationArray[l].impNumColors)
      // }
      this.additionalChgs = []
      var totalPrintCharges = 0
      /* Find the selected decorator data for the selected imprint method */
      var results = this.decorators.filter(e =>{
        return e.supplierId === this.vendor &&
          e.impMethod === this.impMethod
      })
      /* For each location, return the print charge rate for this decorator */

      if(results.length>0){
        var printCharges = 0
        var lineChgTotal = 0
        this.ImpLocationArray.forEach(loc =>{ //start of location loop
          printCharges = results[0].printCharges.filter(e =>{
            return  e.itemMinQty <= this.itemQty &&
            e.itemMaxQty >= this.itemQty &&
            e.impColorQty == loc.impNumColors
          })
          totalPrintCharges+= ((printCharges[0].cost) * this.itemQty)
          console.log('location/rate', loc, printCharges[0].cost, totalPrintCharges)
      //  })
          console.log('totalPrintCharges',  totalPrintCharges)
          var additionalChgs = results[0].additionalChgs
          // var lineChgTotal = 0
          var apply = false
        
          additionalChgs.forEach(e => {
            console.log('additionalChgs for location', loc.locationNum)
            if(e.charType === 'perColor'){
              // alert(e.chargeId +', '+e.charType + ' #colors '+ this.ImpNumColors)
              lineChgTotal = lineChgTotal + (loc.impNumColors * parseInt(e.cost))
              console.log('setup costs: #colors, cost/color', loc.impNumColors,  e.cost, 'total ='+lineChgTotal)
              
            }
            if(e.chargeId == 'exactRerunSetup' && this.exactRerun){
              apply =true
            }
            if(e.chargeId == 'setup'){ apply=true }
            if(e.chargeId == 'pmsMatch' && this.numPmsMatches>0){
              lineChgTotal = this.numPmsMatches * e.cost
              apply = true
            }
            if(e.chargeId == 'darkColorFlash' && this.numFlashChgs>0){
              lineChgTotal =  this.numFlashChgs * e.cost
              apply = true
            }
            if(e.chargeId == 'dropShip' && this.numAddresses>1){
               //only apply this once per order (e.g. 1st location only), not for EACH location
              if(loc.locationNum == 1){
                lineChgTotal = this.numAddresses * e.cost
                apply = true
                console.log('dropShip charge', lineChgTotal)
              }else{
                lineChgTotal = 0
              }

            }
              this.additionalChgs.push({
                chargeId: e.chargeId+" ( Location:"+loc.locationNum+")",
                chargeType: e.charType,
                cost: e.cost,
                lineTotal:lineChgTotal,
                apply: apply
              })

            lineChgTotal = 0
            apply = false
          });
        
        }) //end of location loop
      }
      this.printSubtotal = totalPrintCharges
      // if(totalPrintCharges>0){
      //   //printCharges[0].cost =printCharges[0].cost.toFixed(2)
      //   this.results =totalPrintCharges
        
      //  // this.printSubtotal = this.printSubtotal + (printCharges[0].cost * this.itemQty)
       
      // }else{
      //   this.results = 'no results found'
      // }
      this.calcCharges()
      this.showResults=true
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
<style>
tbody tr:nth-of-type(odd) {
   background-color: rgba(0, 0, 0, .05);
 }
</style>