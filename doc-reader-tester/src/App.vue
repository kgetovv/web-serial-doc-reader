<script lang="ts" setup>
import {Reader} from 'web-serial-api'
import {onMounted, ref} from "vue";

const reader = new Reader(undefined, 1);
let documentData = ref();

onMounted(async () => {
  await connect();
})

async function connect() {
  await reader.connect()
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err);
      });
}

async function read() {
  await reader.readMrz()
      .then(res => {
        console.log(res, typeof res)
        documentData.value = res;
      })
      .catch(err => {
        console.log(err);
      });
}

async function stopReading() {
  await reader.stopReading();
}

async function disconnect() {
  await reader.disconnect()
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err)
      });
}

</script>
<style scoped>
.column {
  float: left;
  width: 50%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

.mt-2 {
  margin-top: 2em;
}
</style>
<template>
  <main>
    <div class="row">
      <div class="column">
        <div>Actions:</div>
        <!--        <button @click="connect()">Connect</button>-->
        <button @click="read()">Read</button>
        <button @click="stopReading()">Stop reading</button>
        <button @click="disconnect()">Disconnect</button>
      </div>
    </div>
    <div class="row">
      <div class="column mt-2">
        <p>Name: {{ documentData?.fields.firstName }}</p>
        <p>Last name: {{ documentData?.fields.lastName }}</p>
        <p>Document number: {{ documentData?.fields.documentNumber }}</p>
        <p>ID number: {{ documentData?.fields.optional2 }}</p>
      </div>
    </div>
  </main>
</template>
