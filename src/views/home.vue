<template>
  <div>
    <h1>page: home</h1>
    {{tips}}
    <div @click="clickMe">click me4</div>
    <div @click="toListPage">to List Page</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tips: ''
    }
  },
  methods: {
    clickMe() {
      this.tips = 'i am home!'
    },
    toListPage() {
      this.$router.push({name: 'list'})
    }
  }
}
</script>

<style>

</style>