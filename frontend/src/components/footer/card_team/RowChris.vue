<template>
  <div class="row--chris">
    <div class="col--chris--img">
      <img :src="person.imgProfile" alt="img-chris" />
    </div>
    <div class="col--chris--text">
      <h2>{{ person.firstName }}</h2>
      <h2>{{ person.lastName }}</h2>
      <h4>{{ person.role }}</h4>
      <h4>{{ person.techUsed }}</h4>
    </div>
    <div class="vue--logo">
      <img :src="person.vueLogo" alt="vue-logo" />
    </div>
  </div>
</template>

<script>
export default {
  name: "RowChris",
  props: {
    person: Object, // Définir la prop 'person' comme un objet
  },
};
</script>

<style lang=scss>
.row--chris {
  display: flex;
  align-items: center;
  justify-content: start;

  position: relative;
  box-shadow: 0 0 8px var(--gray);

  margin: 20px 30px 20px 30px;
  border-radius: 10px;
  height: auto;

  .col--chris--img {
    height: 160px;

    img {
      max-height: 100%;
      width: auto;
      border-radius: 10px 0 0 10px;
    }
  }

  .col--chris--text {
    cursor: default;

    padding: 0px 20px 0 20px;
    text-align: center;
    color: var(--gray);
    z-index: 1000;
    h2 {
      margin: 0px 0px 0px 0px;
    }
    h4 {
      margin: 0;
      font-weight: 400;
    }
  }
  .vue--logo {
    img {
      height: 80%;
      opacity: 0.2;
      position: absolute;
      top: 12%;
      right: 0.3%;

      z-index: 800;
    }
  }

  transition: all 0.3s;
  &:hover {
    background-color: var(--light-light-gray);
    box-shadow: 0 0 6px var(--pink);
  }
}
</style>