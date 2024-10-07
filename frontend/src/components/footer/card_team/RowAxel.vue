<template>
  <div class="row--axel">
    <div class="node--logo">
      <img :src="person.nodeLogo" alt="vue-logo" />
    </div>
    <div class="col--axel--text">
      <h2>{{ person.firstName }}</h2>
      <h2>{{ person.lastName }}</h2>
      <h4>{{ person.role }}</h4>
      <h4>{{ person.techUsed }}</h4>
    </div>
    <div class="col--axel--img">
      <img :src="person.imgProfile" alt="img-axel" />
    </div>
  </div>
</template>
  
  <script>
export default {
  name: "RowAxel,",
  props: {
    person: Object, // Définir la prop 'person' comme un objet
  },
};
</script>
  
  <style lang=scss>
.row--axel {
  .node--logo {
    img {
      height: 80%;
      opacity: 0.2;
      position: absolute;
      top: 10%;
      left: 2%;

      z-index: 800;
    }
  }
  display: flex;
  align-items: center;
  justify-content: end;
  position: relative;
  box-shadow: 0 0 8px var(--gray);

  margin: 20px 30px 20px 30px;
  border-radius: 10px;
  height: auto;

  .col--axel--text {
    width: fit-content;
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
  .col--axel--img {
    height: 160px;
    img {
      max-height: 100%;
      width: auto;
      border-radius: 0 10px 10px 0;
    }
  }
  transition: all 0.3s;
  &:hover {
    background-color: var(--light-light-gray);
    box-shadow: 0 0 6px var(--pink);
  }
}
</style>