<template>
  <div class="card--container">
    <div class="contact--name">
      <h2>{{ infos.firstName }}</h2>
      <h2>{{ infos.lastName }}</h2>
    </div>
    <div class="contact--icons">
      <template v-if="infos.website">
        <a :href="infos.website" target="_blank" rel="nofollow">
          <i class="fa-solid fa-address-card"></i>
        </a>
      </template>
      <a :href="infos.git" target="_blank" rel="nofollow"
        ><i class="fa-brands fa-square-github"></i
      ></a>
      <a :href="infos.linkedin" target="_blank" rel="nofollow"
        ><i class="fab fa-linkedin"></i
      ></a>
      <a :href="infos.email" rel="nofollow"
        ><i class="fa-solid fa-square-envelope"></i
      ></a>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContactCmp",
  props: {
    infos: Object,
  },
};
</script>

<style lang="scss">
.card--container {
  margin: auto;
  border-radius: 15px;
  box-shadow: 0 0 8px var(--gray);
  height: auto;
  width: 80%;
  padding: 0px 20px 20px 20px;
  transition: all 0.3s;
  &:hover {
    background-color: var(--light-light-gray);
    box-shadow: 0 0 6px var(--pink);
  }
  .contact--name {
    width: 100%;
    margin: 10px 0 10px 0;
    h2 {
      color: var(--gray);
      text-align: center;
      text-transform: capitalize;
      margin: 0 0 0 0;
      font-weight: 800;
    }
  }
  .contact--icons {
    width: auto;
    display: flex;
    margin-top: 10px;
    justify-content: space-evenly;
    font-size: 2.7rem;
    a {
      cursor: pointer;
      color: var(--pink);
      transition: all 0.3s;
      &:hover {
        color: var(--gray);
        transform: scale(1.08);
      }
    }
  }
  @media (min-width: 200px) and (max-width: 1115px) {
    margin: 15px auto 15px auto;
  }
}
</style>